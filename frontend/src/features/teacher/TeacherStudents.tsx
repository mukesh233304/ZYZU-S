import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { attendanceService } from '../../services/attendanceService';
import { TeacherAssignment } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import {
  Users,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  IndianRupee,
  MessageCircle,
  Clock,
  PlusCircle,
  FileText,
  User
} from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick log attendance modal
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [topicCovered, setTopicCovered] = useState('');
  const [sessionDuration, setSessionDuration] = useState('1.5');
  const [submittingLog, setSubmittingLog] = useState(false);

  // Student notes modal
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeNotesStudent, setActiveNotesStudent] = useState<TeacherAssignment | null>(null);

  const fetchStudents = async () => {
    if (!user) return;
    try {
      const data = await teacherService.getAssignments(user.id);
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user) return;
    setSubmittingLog(true);
    try {
      await attendanceService.logAttendance({
        userId: selectedAssignment.studentId,
        userName: selectedAssignment.studentName,
        role: 'student',
        type: 'tutor_session',
        referenceId: selectedAssignment.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'present',
        duration: Number(sessionDuration),
        teacherId: user.id,
        teacherName: user.name,
        notes: `Topic: ${topicCovered} (${sessionDuration} hrs)`,
        notificationStatus: 'Not Connected',
      });
      setIsLogModalOpen(false);
      setTopicCovered('');
      addToast(`Attendance recorded for ${selectedAssignment.studentName}!`, 'success');
    } catch (err) {
      addToast('Failed to log attendance', 'error');
    } finally {
      setSubmittingLog(false);
    }
  };

  const getWaLink = (rawPhone?: string, studentName?: string) => {
    const clean = rawPhone?.replace(/\D/g, '') || '';
    const formatted = clean.length === 10 ? `91${clean}` : clean;
    const msg = encodeURIComponent(`Hello ${studentName || ''}, this is your ZYZU'S home tutor regarding our upcoming session.`);
    return `https://wa.me/${formatted}?text=${msg}`;
  };

  const getTelLink = (rawPhone?: string) => {
    const clean = rawPhone?.replace(/\D/g, '') || '';
    return `tel:${clean}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Assigned Students"
        subtitle={`Students allocated to you by the ${user?.district || 'Ghazipur'} District Education Office for verified home tuition`}
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Assigned Students' }
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-royal-blue-50 text-royal-blue-600 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-royal-blue-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No student allotments yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            As soon as parents submit tuition requests in your locality and your credentials are verified by the District Admin, verified student matches will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map(a => (
            <Card key={a.id} className="p-6 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between bg-white">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{a.studentName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5 text-royal-blue-600" />
                      {a.grade} • {a.subjects.join(', ')} • {a.teachingMode || 'Home Tuition'}
                    </p>
                  </div>
                  <StatusBadge status={a.status === 'ACTIVE' ? 'active' : 'pending'} text={a.status} />
                </div>

                {/* Details Grid */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Monthly Remuneration:</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{a.monthlyFee?.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Session Schedule:</span>
                    <span className="font-semibold text-slate-900">{a.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Allotment Date:</span>
                    <span className="font-semibold text-slate-800">{a.startDate}</span>
                  </div>
                  <div className="flex items-start justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-700 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" /> Visit Address:
                    </span>
                    <span className="font-semibold text-right text-slate-900 max-w-[220px]">{a.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={getTelLink(a.studentPhone)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={getWaLink(a.studentPhone, a.studentName)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                    title="Message on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setActiveNotesStudent(a);
                      setNotesModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-royal-blue-50 hover:bg-royal-blue-100 text-royal-blue-600 transition-colors"
                    title="Academic Progress Notes"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  icon={<PlusCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedAssignment(a);
                    setIsLogModalOpen(true);
                  }}
                  className="text-xs"
                >
                  Log Class Session
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Log Attendance Modal */}
      {isLogModalOpen && selectedAssignment && (
        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title={`Log Attendance: ${selectedAssignment.studentName}`}
          size="md"
        >
          <form onSubmit={handleLogAttendance} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Session Date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
              <Input
                label="Duration (Hours)"
                type="number"
                step="0.5"
                min="0.5"
                max="6"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Topics / Chapters Covered
              </label>
              <textarea
                rows={3}
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                placeholder="e.g. Chapter 4: Laws of Motion - solved NCERT problems 1 to 15..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-royal-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submittingLog}>
                Save Session Log
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Academic Notes Modal */}
      {notesModalOpen && activeNotesStudent && (
        <Modal
          isOpen={notesModalOpen}
          onClose={() => setNotesModalOpen(false)}
          title={`Academic Profile: ${activeNotesStudent.studentName}`}
          size="md"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="p-3.5 bg-royal-blue-50 rounded-xl text-royal-blue-900 border border-royal-blue-100">
              <p className="font-bold">Focus: Academic Excellence & Board Exam Prep</p>
              <p className="text-xs text-royal-blue-700 mt-1">
                Allocated by {activeNotesStudent.district || 'Ghazipur'} District Office for {activeNotesStudent.subjects.join(', ')}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Guardian / Student Contacts
              </label>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                Phone: +91 {activeNotesStudent.studentPhone} • Address: {activeNotesStudent.address}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setNotesModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
