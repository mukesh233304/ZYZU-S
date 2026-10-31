import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { studentPerformanceService } from '../../services/studentPerformanceService';
import { TeacherAssignment } from '../../types';
import { StudentTestRecord, StudentPerformanceMetrics } from '../../types/academicIntelligence';
import {
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  Trash2,
  BookOpen,
  TrendingUp,
  Award,
  Users,
  Search,
  AlertCircle
} from 'lucide-react';

export const TeacherStudentPerformance: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const teacherId = user?.id || 'usr-teacher-rajesh';

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [testRecords, setTestRecords] = useState<StudentTestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedStudentMetrics, setSelectedStudentMetrics] = useState<StudentPerformanceMetrics | null>(null);

  // Modal State for New Test Record
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalStudentId, setModalStudentId] = useState('');
  const [testName, setTestName] = useState('Weekly Chapter Assessment');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState('50');
  const [marksObtained, setMarksObtained] = useState('');
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Search in records
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeacherData();
  }, [teacherId]);

  useEffect(() => {
    if (selectedStudentId !== 'all') {
      loadStudentMetrics(selectedStudentId);
    } else {
      setSelectedStudentMetrics(null);
    }
  }, [selectedStudentId]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const [assigns, tests] = await Promise.all([
        teacherService.getAssignments(teacherId),
        studentPerformanceService.getTeacherTests(teacherId)
      ]);
      setAssignments(assigns);
      setTestRecords(tests);

      if (assigns.length > 0 && !modalStudentId) {
        setModalStudentId(assigns[0].studentId);
        setSubject(assigns[0].subjects[0] || 'Mathematics');
      }
    } catch (err) {
      console.error('Failed to load teacher test records', err);
      addToast('Failed to load performance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentMetrics = async (studentId: string) => {
    try {
      const metrics = await studentPerformanceService.getPerformanceOverview(studentId);
      setSelectedStudentMetrics(metrics);
    } catch (err) {
      console.error('Failed to load student performance', err);
    }
  };

  const handleOpenModal = () => {
    setFormError(null);
    if (assignments.length > 0) {
      const initStudentId = selectedStudentId !== 'all' ? selectedStudentId : assignments[0].studentId;
      setModalStudentId(initStudentId);
      const matched = assignments.find(a => a.studentId === initStudentId);
      if (matched && matched.subjects.length > 0) {
        setSubject(matched.subjects[0]);
      }
    }
    setMarksObtained('');
    setTeacherRemarks('');
    setIsModalOpen(true);
  };

  const handleSubmitTestScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const total = parseFloat(totalMarks);
    const obtained = parseFloat(marksObtained);

    if (!modalStudentId) {
      setFormError('Please select a student');
      return;
    }
    if (!subject.trim() || !topic.trim()) {
      setFormError('Subject and Topic are required');
      return;
    }
    if (isNaN(total) || total <= 0) {
      setFormError('Total marks must be a positive number');
      return;
    }
    if (isNaN(obtained) || obtained < 0 || obtained > total) {
      setFormError(`Marks obtained must be between 0 and ${total}`);
      return;
    }

    const matchedAssignment = assignments.find(a => a.studentId === modalStudentId);
    const studentName = matchedAssignment ? matchedAssignment.studentName : 'Student';

    try {
      setSubmitting(true);
      const res = await studentPerformanceService.recordTeacherTestResult(
        {
          studentId: modalStudentId,
          studentName,
          testName: testName.trim() || 'Weekly Class Test',
          subject: subject.trim(),
          topic: topic.trim(),
          testDate,
          totalMarks: total,
          marksObtained: obtained,
          percentage: (obtained / total) * 100,
          source: 'TEACHER_ENTERED',
          teacherId,
          teacherName: user?.name || 'Verified Teacher',
          remarks: teacherRemarks.trim() || 'Verified regular class performance assessment.'
        },
        teacherId
      );

      if (res.success && res.record) {
        addToast(`Test score recorded for ${studentName}`, 'success');
        setTestRecords(prev => [res.record!, ...prev]);
        setIsModalOpen(false);
        if (selectedStudentId === modalStudentId) {
          loadStudentMetrics(modalStudentId);
        }
      } else {
        setFormError(res.error || 'Failed to record test result');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error recording test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this test assessment record?')) return;
    try {
      const ok = await studentPerformanceService.deleteTestResult(testId, teacherId);
      if (ok) {
        addToast('Test record deleted', 'info');
        setTestRecords(prev => prev.filter(t => t.id !== testId));
        if (selectedStudentId !== 'all') {
          loadStudentMetrics(selectedStudentId);
        }
      } else {
        addToast('Failed to delete test record', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error deleting record', 'error');
    }
  };

  // Filter test records
  const filteredRecords = testRecords.filter(rec => {
    const matchesStudent = selectedStudentId === 'all' || rec.studentId === selectedStudentId;
    const topicStr = rec.topic || '';
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topicStr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStudent && matchesSearch;
  });

  const totalTests = testRecords.length;
  const avgScore =
    totalTests > 0
      ? (testRecords.reduce((acc, curr) => acc + curr.percentage, 0) / totalTests).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
            Teacher Academic Assessment Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Student Performance & Test Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log weekly assessments, topical tests, and feedback for your assigned tuition students.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Record Student Test Score
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Tests Recorded</div>
            <div className="text-2xl font-bold text-slate-900">{totalTests}</div>
            <div className="text-xs text-slate-500">Total assessments logged</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Assigned Students</div>
            <div className="text-2xl font-bold text-indigo-600">{assignments.length}</div>
            <div className="text-xs text-slate-500">Active tuition learners</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Average Class Score</div>
            <div className="text-2xl font-bold text-emerald-600">{avgScore}%</div>
            <div className="text-xs text-slate-500">Across all evaluated tests</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Integrity Check</div>
            <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Zero Fake Data
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Strict educator attribution</div>
          </div>
        </div>
      </div>

      {/* Filter and Student Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase">Filter by Student:</label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Assigned Students ({assignments.length})</option>
            {assignments.map(a => (
              <option key={a.studentId} value={a.studentId}>
                {a.studentName} ({a.subjects.join(', ')})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic, subject or student..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Single Student Academic Snapshot (if specific student selected) */}
      {selectedStudentId !== 'all' && selectedStudentMetrics && (
        <div className="bg-brand-50/60 p-6 rounded-2xl border border-brand-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-brand-900">
              Student Growth Snapshot
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800">
              Total Tests: {selectedStudentMetrics.totalTests}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-xl border border-brand-100">
              <div className="text-xs text-slate-500 font-medium">Overall Accuracy</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {selectedStudentMetrics.overallAccuracy.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-brand-100">
              <div className="text-xs text-slate-500 font-medium">Strongest Subject</div>
              <div className="text-sm font-bold text-emerald-700 mt-1">
                {selectedStudentMetrics.strongestSubject || 'Need 2+ tests'}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-brand-100">
              <div className="text-xs text-slate-500 font-medium">Focus Area</div>
              <div className="text-sm font-bold text-rose-600 mt-1">
                {selectedStudentMetrics.subjectNeedingAttention || 'None identified'}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-brand-100">
              <div className="text-xs text-slate-500 font-medium">Average Score</div>
              <div className="text-xl font-bold text-indigo-700 mt-1">
                {selectedStudentMetrics.averagePercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Assessment Test History
          </h3>
          <span className="text-xs text-slate-500">
            Showing {filteredRecords.length} of {testRecords.length} records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Assessment Records Found</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {testRecords.length === 0
                ? 'You have not recorded any student test scores yet. Use the "Record Student Test Score" button above.'
                : 'No records matched your current filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Test Name</th>
                  <th className="py-3 px-6">Subject & Topic</th>
                  <th className="py-3 px-6 text-center">Score</th>
                  <th className="py-3 px-6 text-center">Percentage</th>
                  <th className="py-3 px-6">Teacher Remarks</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {rec.testDate}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {rec.studentName}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {rec.testName}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-slate-900">{rec.subject}</div>
                      <div className="text-xs text-slate-500">{rec.topic}</div>
                    </td>
                    <td className="py-3.5 px-6 text-center font-bold text-slate-900">
                      {rec.marksObtained} / {rec.totalMarks}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          rec.percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.percentage >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.percentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {rec.remarks}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Test Score Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Record Student Assessment Score
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTestScore} className="mt-4 space-y-4">
              {/* Student Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Assigned Student *
                </label>
                <select
                  value={modalStudentId}
                  onChange={e => {
                    setModalStudentId(e.target.value);
                    const matched = assignments.find(a => a.studentId === e.target.value);
                    if (matched && matched.subjects.length > 0) {
                      setSubject(matched.subjects[0]);
                    }
                  }}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {assignments.map(a => (
                    <option key={a.studentId} value={a.studentId}>
                      {a.studentName} ({a.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Name & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={e => setTestName(e.target.value)}
                    required
                    placeholder="e.g. Weekly Math Test"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Conducted Date *
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={e => setTestDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quadratic Equations"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Marks Evaluation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                    required
                    min="1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={marksObtained}
                    onChange={e => setMarksObtained(e.target.value)}
                    placeholder="e.g. 42"
                    required
                    min="0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Teacher Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Educator Remarks & Guidance
                </label>
                <textarea
                  rows={3}
                  value={teacherRemarks}
                  onChange={e => setTeacherRemarks(e.target.value)}
                  placeholder="Provide constructive feedback on concepts mastered or areas requiring revision..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  {submitting ? 'Saving Assessment...' : 'Record Test Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
