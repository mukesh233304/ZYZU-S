import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
  Filter,
  Check,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
  BookmarkPlus
} from 'lucide-react';
import { mockTestService } from '../../services/mockTestService';
import { studentPerformanceService } from '../../services/studentPerformanceService';
import {
  MockTestAttempt,
  MockTest,
  QuestionItem
} from '../../types/academicIntelligence';

export const MockTestResultReview: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null);
  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [addingToMistakeId, setAddingToMistakeId] = useState<string | null>(null);
  const [mistakeSuccessMsg, setMistakeSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const att = await mockTestService.getAttempt(attemptId);
        if (att) {
          setAttempt(att);
          const test = await mockTestService.getMockTestById(att.mockTestId);
          if (test) {
            setMockTest(test);
            const qs = await mockTestService.getQuestionsForTest(test.questionIds);
            setQuestions(qs);
            if (qs.length > 0) {
              setExpandedQuestionId(qs[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load attempt result:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!attempt || !mockTest) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 mt-12">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Test Result Not Found</h3>
        <p className="text-slate-600 mb-6">
          The requested mock test attempt could not be loaded or is not yet submitted.
        </p>
        <button
          onClick={() => navigate('/student/mock-tests')}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors"
        >
          Return to Mock Test Center
        </button>
      </div>
    );
  }

  const durationMin = Math.floor(attempt.timeSpentSeconds / 60);
  const durationSec = attempt.timeSpentSeconds % 60;
  const scoreVal = attempt.score ?? 0;
  const percentageVal = attempt.percentage ?? 0;
  const accuracyVal = attempt.accuracy ?? 0;
  const attemptedCountVal = attempt.attemptedCount ?? 0;
  const correctCountVal = attempt.correctCount ?? 0;
  const incorrectCountVal = attempt.incorrectCount ?? 0;
  const unansweredCountVal = attempt.unansweredCount ?? 0;
  const negativePenaltyVal = attempt.negativeMarksPenalty ?? 0;

  // Question review filtering
  const filteredQuestions = questions.filter(q => {
    const ans = attempt.answers[q.id];
    const isAnswered = ans && ans.selectedOptions && ans.selectedOptions.length > 0;
    const isCorrect = isAnswered && ans.selectedOptions.includes(q.correctAnswer);

    if (filterType === 'correct' && !isCorrect) return false;
    if (filterType === 'incorrect' && (!isAnswered || isCorrect)) return false;
    if (filterType === 'unattempted' && isAnswered) return false;
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;

    return true;
  });

  const subjects = Array.from(new Set(questions.map(q => q.subject)));

  const handleAddToMistakeBook = async (question: QuestionItem) => {
    try {
      setAddingToMistakeId(question.id);
      await studentPerformanceService.updateMistakeItem(question.id, {
        personalNotes: `Reviewed from test: ${mockTest.title}`,
        isUnderstood: false
      });
      setMistakeSuccessMsg(`Question logged to your personal Mistake Book`);
      setTimeout(() => setMistakeSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToMistakeId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate('/student/mock-tests')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mock Test Center
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {mockTest.title} — Performance Scorecard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submitted on {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Scorecard
          </button>
          <button
            onClick={() => navigate('/student/mistakes')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            View Mistake Book
          </button>
        </div>
      </div>

      {mistakeSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{mistakeSuccessMsg}</span>
          </div>
          <button onClick={() => setMistakeSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Score & KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Marks Card */}
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
            <Trophy className="w-36 h-36" />
          </div>
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-100">
              Total Score
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {scoreVal.toFixed(2)}
              </span>
              <span className="text-base text-brand-200 font-medium">
                / {mockTest.totalMarks}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-500/50 flex items-center justify-between text-xs text-brand-100">
              <span>Percentage:</span>
              <span className="font-bold text-white text-sm">
                {percentageVal.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Accuracy & Efficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Exam Accuracy
              </span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {accuracyVal.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Of attempted questions answered accurately
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                accuracyVal >= 75
                  ? 'bg-emerald-500'
                  : accuracyVal >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, accuracyVal)}%` }}
            />
          </div>
        </div>

        {/* Time Efficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Time Consumed
              </span>
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {durationMin}m {durationSec}s
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Allocated time: {mockTest.durationMinutes} mins
            </p>
          </div>
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex justify-between">
            <span>Avg pace:</span>
            <span className="font-semibold text-slate-900">
              {attemptedCountVal > 0
                ? `${Math.round(attempt.timeSpentSeconds / attemptedCountVal)}s / question`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Negative Deduction Impact */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Negative Penalty
              </span>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600 mt-2">
              -{negativePenaltyVal.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Marks deducted due to {incorrectCountVal} incorrect guesses
            </p>
          </div>
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex justify-between">
            <span>Penalty Rate:</span>
            <span className="font-semibold text-slate-900">
              {mockTest.negativeMarkingPerQuestion} marks / wrong
            </span>
          </div>
        </div>
      </div>

      {/* Question Breakdown Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Attempt Summary Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Correct
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {correctCountVal}
            </div>
            <div className="text-xs text-emerald-600 mt-0.5">
              +{correctCountVal * (mockTest.totalMarks / mockTest.totalQuestions)} Marks
            </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
              <XCircle className="w-4 h-4 text-rose-600" />
              Incorrect
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-1">
              {incorrectCountVal}
            </div>
            <div className="text-xs text-rose-600 mt-0.5">
              -{negativePenaltyVal.toFixed(2)} Penalty
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              Unattempted
            </div>
            <div className="text-2xl font-bold text-slate-700 mt-1">
              {unansweredCountVal}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              0 Marks (Safe)
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-800 font-semibold text-sm">
              <Trophy className="w-4 h-4 text-indigo-600" />
              Total Questions
            </div>
            <div className="text-2xl font-bold text-indigo-700 mt-1">
              {mockTest.totalQuestions}
            </div>
            <div className="text-xs text-indigo-600 mt-0.5">
              {attemptedCountVal} Answered
            </div>
          </div>
        </div>
      </div>

      {/* Section-Wise Subject Accuracy Table */}
      {attempt.subjectBreakdown && Object.keys(attempt.subjectBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Sectional Performance Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate your relative strength across subject sections
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Subject / Section</th>
                  <th className="py-3 px-6 text-center">Attempted</th>
                  <th className="py-3 px-6 text-center">Correct</th>
                  <th className="py-3 px-6 text-center">Incorrect</th>
                  <th className="py-3 px-6 text-center">Score</th>
                  <th className="py-3 px-6 text-center">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(attempt.subjectBreakdown).map(([sub, data]) => {
                  const acc = data.accuracy ?? (data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0);
                  return (
                    <tr key={sub} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {sub}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {data.attempted} / {data.total}
                      </td>
                      <td className="py-3.5 px-6 text-center text-emerald-600 font-medium">
                        {data.correct}
                      </td>
                      <td className="py-3.5 px-6 text-center text-rose-600 font-medium">
                        {data.incorrect}
                      </td>
                      <td className="py-3.5 px-6 text-center font-bold text-slate-900">
                        {data.score.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            acc >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : acc >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {acc.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Question Review Engine */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Controls & Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Question-by-Question Solution Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review every answer, understand explanations, and log difficult questions to your Mistake Book
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter */}
            {subjects.length > 1 && (
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilterType('correct')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'correct'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Correct ({correctCountVal})
              </button>
              <button
                onClick={() => setFilterType('incorrect')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'incorrect'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Incorrect ({incorrectCountVal})
              </button>
              <button
                onClick={() => setFilterType('unattempted')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'unattempted'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Skipped ({unansweredCountVal})
              </button>
            </div>
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="p-6 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No questions match the current filter selection.</p>
            </div>
          ) : (
            filteredQuestions.map((q, index) => {
              const ans = attempt.answers[q.id];
              const isAnswered = ans && ans.selectedOptions && ans.selectedOptions.length > 0;
              const isCorrect = isAnswered && ans.selectedOptions.includes(q.correctAnswer);
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : isAnswered
                      ? 'border-rose-200 bg-rose-50/10'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isAnswered
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Q{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {q.subject}
                          </span>
                          <span className="text-xs text-slate-500">
                            • {q.topic}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1 mt-1">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAnswered
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCorrect
                          ? `CORRECT (+${q.marks})`
                          : isAnswered
                          ? `WRONG (-${q.negativeMarks})`
                          : 'NOT ATTEMPTED'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-white space-y-4">
                      {/* Question Text */}
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-sm font-semibold text-slate-900">
                          {q.questionText}
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Options & Answers
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map(opt => {
                            const isUserSelected =
                              ans && ans.selectedOptions && ans.selectedOptions.includes(opt.id);
                            const isOfficialCorrect = opt.id === q.correctAnswer;

                            let borderClass = 'border-slate-200 bg-white';
                            let icon = null;

                            if (isOfficialCorrect) {
                              borderClass = 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-medium';
                              icon = (
                                <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <Check className="w-3.5 h-3.5" /> Correct Answer
                                </span>
                              );
                            } else if (isUserSelected && !isOfficialCorrect) {
                              borderClass = 'border-rose-400 bg-rose-50 text-rose-950';
                              icon = (
                                <span className="flex items-center gap-1 text-xs text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                                  <X className="w-3.5 h-3.5" /> Your Choice
                                </span>
                              );
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${borderClass}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isOfficialCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : isUserSelected
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {opt.id}
                                  </span>
                                  <div>
                                    <p className="text-slate-800">{opt.text}</p>
                                  </div>
                                </div>
                                {icon}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Official Explanation Box */}
                      <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          Detailed Solution & Explanation
                        </div>
                        <p className="text-sm text-indigo-950 leading-relaxed whitespace-pre-line">
                          {q.explanation}
                        </p>
                      </div>

                      {/* Footer Actions for this question */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-slate-500">
                          Time spent:{' '}
                          <span className="font-semibold text-slate-700">
                            {ans?.timeSpentSeconds || 0}s
                          </span>
                        </div>

                        {!isCorrect && (
                          <button
                            onClick={() => handleAddToMistakeBook(q)}
                            disabled={addingToMistakeId === q.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                            {addingToMistakeId === q.id ? 'Saving...' : 'Pin to Mistake Book'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
