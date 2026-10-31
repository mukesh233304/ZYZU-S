import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, ArrowRight, ShieldCheck, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/FeedbackStates';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../mock/store';

export const StudentRequestTracking: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 'usr-student-fresh';
  const requests = mockStore.getTutorRequests(undefined, studentId);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || '');

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || requests[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutor Request Tracking"
        description="Monitor your home tutor applications through the District Administration matching and verification pipeline."
        breadcrumbs={[
          { label: 'Student Portal', path: '/student/dashboard' },
          { label: 'Tutor Requests' },
        ]}
        action={
          <Link to="/student/request-tutor">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Submit New Request
            </Button>
          </Link>
        }
      />

      {requests.length === 0 ? (
        <EmptyState
          title="No Home Tutor Requests Found"
          description="You haven't submitted any home tuition requests yet. Specify your syllabus, subject requirements, and weekly schedule to get matched with a verified educator."
          actionText="Request a Home Tutor"
          onAction={() => window.location.href = '/student/request-tutor'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Request List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
              Your Applications ({requests.length})
            </h3>

            <div className="space-y-2.5">
              {requests.map((req) => {
                const isSelected = req.id === selectedRequest?.id;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          REF: #{req.id}
                        </span>
                        {req.paymentStatus === 'PAID' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            PAID ₹{(req.paymentAmount || req.budgetMin || 3500).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-950">{req.className}</h4>
                    <p className="text-xs text-brand-700 font-bold mt-0.5">{req.subjects.join(', ')}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{req.area}, {req.districtName || 'Ghazipur'}</span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Timeline & Status View */}
          {selectedRequest && (
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-950 tracking-tight">
                        {selectedRequest.className} — {selectedRequest.subjects.join(' & ')}
                      </h2>
                      <StatusBadge status={selectedRequest.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted on {new Date(selectedRequest.submittedAt || Date.now()).toLocaleDateString()} for {selectedRequest.area}, {selectedRequest.districtName || 'Ghazipur'}
                    </p>
                  </div>

                  {selectedRequest.allottedTeacherId && (
                    <Link to="/student/teacher">
                      <Button size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                        View Teacher Details
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="py-2 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <StatusTimeline
                    currentStatus={selectedRequest.status}
                    submittedDate={selectedRequest.submittedAt || new Date().toISOString()}
                    allotmentDate={selectedRequest.allotmentDate}
                    assignedTeacherName={selectedRequest.allottedTeacherName}
                    allotmentNotes={selectedRequest.allotmentNotes}
                  />
                </div>

                {/* Request Specifications Summary */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Curriculum & Board</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.board || 'CBSE / State Board'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Weekly Frequency</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.frequency || 'Regular'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Preferred Days & Time</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {(selectedRequest.preferredDays || ['Mon', 'Wed', 'Fri']).join(', ')} ({selectedRequest.preferredTime || '05:00 PM'})
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Budget Range</span>
                    <p className="font-black text-brand-700 mt-0.5">₹{selectedRequest.budgetMin || 3500} – ₹{selectedRequest.budgetMax || 5000} / month</p>
                  </div>

                  {selectedRequest.paymentStatus === 'PAID' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-emerald-800 block text-[10px] uppercase font-black">Fee Payment Status</span>
                      <p className="font-black text-emerald-950 mt-0.5 text-sm">
                        ✓ PAID: ₹{(selectedRequest.paymentAmount || selectedRequest.budgetMin || 3500).toLocaleString()} via {selectedRequest.paymentMethod || 'Online Gateway'}
                      </p>
                      {selectedRequest.transactionId && (
                        <p className="font-mono text-emerald-700 text-[11px] mt-0.5">
                          Txn ID: {selectedRequest.transactionId}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedRequest.learningObjective && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Learning Objective</span>
                      <p className="mt-0.5 leading-relaxed text-slate-700 font-medium">{selectedRequest.learningObjective}</p>
                    </div>
                  )}

                  {selectedRequest.allotmentNotes && (
                    <div className="sm:col-span-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <p className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>District Admin Matching Notes:</span>
                      </p>
                      <p className="leading-relaxed font-medium">{selectedRequest.allotmentNotes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
