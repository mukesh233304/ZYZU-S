import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Save,
  Check,
  X,
  Lock,
  RefreshCw,
  ShoppingBag,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { studentPerformanceService } from '../../services/studentPerformanceService';
import { academicEntitlementService } from '../../services/academicEntitlementService';
import { EntitlementEvaluationResult } from '../../types/eligibilityAndPricing';
import { useAuth } from '../../context/AuthContext';
import { MistakeBookItem } from '../../types/academicIntelligence';

export const StudentMistakeBook: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.id || 'usr-student-aryan';

  const [mistakes, setMistakes] = useState<MistakeBookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');

  // Entitlement Access State
  const [entitlement, setEntitlement] = useState<EntitlementEvaluationResult>(() =>
    academicEntitlementService.evaluateAccess(studentId, 'MISTAKE_BOOK')
  );
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  // Interactive Retry State
  const [activeRetryId, setActiveRetryId] = useState<string | null>(null);
  const [retrySelectedOption, setRetrySelectedOption] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // Editable note state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadMistakes();
    const unsub = academicEntitlementService.subscribe(() => {
      setEntitlement(academicEntitlementService.evaluateAccess(studentId, 'MISTAKE_BOOK'));
    });
    return () => unsub();
  }, [studentId]);

  const loadMistakes = async () => {
    try {
      setLoading(true);
      const data = await studentPerformanceService.getMistakeBook(studentId);
      setMistakes(data);
    } catch (err) {
      console.error('Failed to load mistake book:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUnderstood = async (item: MistakeBookItem) => {
    const updated = !item.isUnderstood;
    await studentPerformanceService.updateMistakeItem(item.id, {
      isUnderstood: updated
    });
    setMistakes(prev =>
      prev.map(m => (m.id === item.id ? { ...m, isUnderstood: updated } : m))
    );
  };

  const handleSaveNote = async (item: MistakeBookItem) => {
    await studentPerformanceService.updateMistakeItem(item.id, {
      personalNotes: noteText
    });
    setMistakes(prev =>
      prev.map(m => (m.id === item.id ? { ...m, personalNotes: noteText } : m))
    );
    setEditingNoteId(null);
    setSaveSuccessMsg('Personal revision note updated');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleStartRetry = (item: MistakeBookItem) => {
    if (!entitlement.hasAccess) {
      setShowPaywallModal(true);
      return;
    }
    setActiveRetryId(item.id);
    setRetrySelectedOption(null);
    setRetryResult(null);
  };

  const handleSubmitRetry = async (item: MistakeBookItem) => {
    if (!retrySelectedOption) return;
    try {
      const res = await studentPerformanceService.retryMistake(item.id, retrySelectedOption);
      setRetryResult(res);
      if (res.isCorrect) {
        setMistakes(prev =>
          prev.map(m => (m.id === item.id ? { ...m, isUnderstood: true } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered items
  const filteredMistakes = mistakes.filter(item => {
    const matchesSearch =
      item.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unmastered' && !item.isUnderstood) ||
      (statusFilter === 'mastered' && item.isUnderstood);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const subjects = Array.from(new Set(mistakes.map(m => m.subject)));
  const totalCount = mistakes.length;
  const masteredCount = mistakes.filter(m => m.isUnderstood).length;
  const needsRevisionCount = totalCount - masteredCount;
  const repeatMistakesCount = mistakes.filter(m => (m.retryCount || 0) > 1).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Adaptive Revision Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Personal Mistake Book
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Zero in on past test errors, review conceptual explanations, and retry questions until fully mastered.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/store"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold"
          >
            <ShoppingBag className="w-4 h-4" />
            Learning Store
          </Link>
          <Link
            to="/student/subscriptions"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
          >
            My Subscriptions
          </Link>
        </div>
      </div>

      {/* Non-Destructive Entitlement Banner */}
      {!entitlement.hasAccess && (
        <div className={`p-5 rounded-2xl border transition-all ${
          entitlement.accessState === 'EXPIRED' 
            ? 'bg-amber-50 border-amber-300 text-amber-900' 
            : 'bg-indigo-50 border-indigo-300 text-indigo-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {entitlement.accessState === 'EXPIRED' ? (
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {entitlement.accessState === 'EXPIRED' 
                    ? 'Mistake Book Subscription Expired — Historical Logs Preserved' 
                    : 'Interactive Retry Requires Active Subscription'}
                </div>
                <div className="text-xs mt-1 leading-relaxed text-slate-700">
                  {entitlement.accessState === 'EXPIRED'
                    ? `Your pass for ${entitlement.matchingSubscription?.productName || 'Personal Mistake Book'} expired on ${entitlement.matchingSubscription?.endDate}. All your past error logs, solutions, and personal notes remain permanently visible below. Renew your pass to retry questions interactively and capture new mistakes from live tests.`
                    : "To retry questions interactively, test your understanding, and log new errors from live assessments, upgrade to any ZYZU'S Mock Test or Complete Exam Package."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/student/store')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                {entitlement.accessState === 'EXPIRED' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew Pass
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Unlock in Store
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Total Recorded</div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs text-slate-500">Errors logged from tests</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Needs Revision</div>
            <div className="text-2xl font-bold text-rose-600">{needsRevisionCount}</div>
            <div className="text-xs text-slate-500">Pending concepts to review</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Mastered</div>
            <div className="text-2xl font-bold text-emerald-600">{masteredCount}</div>
            <div className="text-xs text-slate-500">Successfully resolved</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Repeat Pitfalls</div>
            <div className="text-2xl font-bold text-purple-600">{repeatMistakesCount}</div>
            <div className="text-xs text-slate-500">Repeated across multiple tests</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by topic or question..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {subjects.length > 1 && (
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Subjects ({mistakes.length})</option>
              {subjects.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('unmastered')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'unmastered'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Needs Work ({needsRevisionCount})
            </button>
            <button
              onClick={() => setStatusFilter('mastered')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>
        </div>
      </div>

      {/* Mistake Items List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredMistakes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {totalCount === 0
              ? 'Your mistake book is empty.'
              : 'No mistakes matching your filter'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {totalCount === 0
              ? 'Your mistake book is empty. Complete a test to automatically collect questions that need revision.'
              : 'Try clearing your search query or switching filters to view your logged revision items.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMistakes.map(item => {
            const isRetrying = activeRetryId === item.id;
            const isEditingNote = editingNoteId === item.id;
            const repeatTimes = item.retryCount || 1;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  item.isUnderstood
                    ? 'border-emerald-200 bg-emerald-50/5'
                    : repeatTimes > 1
                    ? 'border-purple-300 bg-purple-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header Bar */}
                <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      • {item.topic}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.difficulty === 'HARD'
                          ? 'bg-rose-100 text-rose-700'
                          : item.difficulty === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.difficulty}
                    </span>
                    {repeatTimes > 1 && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        Failed {repeatTimes}x
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleUnderstood(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        item.isUnderstood
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.isUnderstood ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Mastered
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          Mark as Mastered
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Question Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 leading-snug">
                      {item.questionText}
                    </h4>
                  </div>

                  {/* Interactive Retry Mode or Comparison */}
                  {isRetrying ? (
                    <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
                          Retry Question In-Place
                        </span>
                        <button
                          onClick={() => setActiveRetryId(null)}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Options to click */}
                      <div className="space-y-2">
                        {item.options.map(opt => {
                          const isSelected = retrySelectedOption === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setRetrySelectedOption(opt.id)}
                              className={`p-3 rounded-xl border text-sm cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'border-brand-600 bg-brand-100/60 font-semibold text-brand-900'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isSelected
                                      ? 'bg-brand-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <div>
                                  <span>{opt.text}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => handleSubmitRetry(item)}
                          disabled={!retrySelectedOption}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          Check Answer
                        </button>

                        {retryResult && (
                          <div
                            className={`text-xs font-bold flex items-center gap-1.5 ${
                              retryResult.isCorrect ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {retryResult.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Brilliant! Correct answer. Question marked as mastered.
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                Not quite. Check the solution explanation below.
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Normal Mode: Answer comparison */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                        <div className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                          Your Initial Answer
                        </div>
                        <div className="text-sm font-bold text-rose-900 mt-1">
                          Option {item.studentAnswer}
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                          Official Correct Answer
                        </div>
                        <div className="text-sm font-bold text-emerald-900 mt-1">
                          Option {item.correctAnswer}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solution Explanation Box */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Conceptual Solution
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Personal Revision Notes Section */}
                  <div className="border-t border-slate-100 pt-3">
                    {isEditingNote ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">
                          My Personal Revision Rule / Trick:
                        </label>
                        <textarea
                          rows={2}
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="e.g. Always convert km/h to m/s by multiplying with 5/18..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(item)}
                            className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-slate-600">
                          <span className="font-semibold text-slate-700">My Note:</span>{' '}
                          {item.personalNotes ? (
                            <span className="italic font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                              {item.personalNotes}
                            </span>
                          ) : (
                            <span className="text-slate-400">No personal note added yet</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setNoteText(item.personalNotes || '');
                            }}
                            className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
                          >
                            {item.personalNotes ? 'Edit Note' : '+ Add Note'}
                          </button>

                          {!isRetrying && (
                            <button
                              onClick={() => handleStartRetry(item)}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                            >
                              <RotateCcw className="w-3 h-3" /> Retry Question
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Entitlement Paywall Modal */}
      <Modal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        title="Personal Mistake Book Pass Required"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Retry & AI Mistake Engine
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
              Your historical test errors and explanations are permanently preserved in your account. To test your understanding interactively and log new errors, please activate or renew your subscription.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1.5">
            <div className="font-semibold text-slate-800">Included with ZYZU'S Pass:</div>
            <div className="text-slate-600 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              In-place retry with live instant evaluation
            </div>
            <div className="text-slate-600 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Auto-sync with JEE/NEET & Govt exam mock tests
            </div>
            <div className="text-slate-600 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Custom revision notes stored on cloud
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowPaywallModal(false)}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowPaywallModal(false);
                navigate('/student/store');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Browse Packages in Store
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
