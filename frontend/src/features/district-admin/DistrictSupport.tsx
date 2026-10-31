import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supportService } from '../../services/supportService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { mockStore } from '../../mock/store';
import { SupportTicket } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  LifeBuoy,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Phone,
  KeyRound,
  Unlock,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Clock,
  Send,
  HelpCircle,
  X,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DistrictSupport: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Technical Action Modal
  const [techActionModal, setTechActionModal] = useState<{
    open: boolean;
    ticketId: string;
    userName: string;
    actionType: 'PASSWORD_RESET' | 'UNLOCK_ACCOUNT' | 'FEE_CORRECTION' | 'DISPATCH_INSPECTION';
  }>({
    open: false,
    ticketId: '',
    userName: '',
    actionType: 'PASSWORD_RESET',
  });
  const [actionReason, setActionReason] = useState('');

  const fetchTickets = async () => {
    try {
      const data = await supportService.getDistrictTickets(district);
      // Format tickets to TKT-GHZ-XXXX if needed
      const formatted = data.map((t, idx) => ({
        ...t,
        id: t.id.startsWith('TKT-GHZ') ? t.id : `TKT-GHZ-${1040 + idx}`,
      }));
      setTickets(formatted);
    } catch (err) {
      console.error('Failed to load district tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [district]);

  const handleResolve = async () => {
    if (!selectedTicket) return;
    setResolving(true);
    try {
      await supportService.updateTicketStatus(selectedTicket.id, 'resolved');
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t))
      );
      setSelectedTicket(null);
      addToast(`Grievance ${selectedTicket.id} marked as Resolved!`, 'success');
    } catch (err) {
      addToast('Failed to update ticket', 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleExecuteTechAction = () => {
    mockStore.performTechnicalSupportAction({
      id: `ACT-${Date.now()}`,
      actionType: techActionModal.actionType,
      targetUserName: techActionModal.userName,
      ticketId: techActionModal.ticketId,
      reason: actionReason.trim() || 'Official resolution by District Admin Desk',
      performedBy: user?.name || `District Admin (${district})`,
      timestamp: new Date().toISOString(),
    });

    addToast(
      `Technical action [${techActionModal.actionType}] executed for ${techActionModal.userName}. Audit recorded.`,
      'success'
    );

    setTechActionModal({ open: false, ticketId: '', userName: '', actionType: 'PASSWORD_RESET' });
    setActionReason('');
  };

  const filteredTickets = tickets.filter(
    (t) => categoryFilter === 'ALL' || t.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const openCount = tickets.filter((t) => t.status !== 'resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to view support tickets for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Technical Support & Grievance Command: ${district}`}
        subtitle="Mediate parent-teacher disputes, desk booking issues, password resets, and audit actions"
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Technical Support' }
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </div>
            <Link to="/district-admin/super-admin-comm">
              <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4 text-blue-600" />}>
                Escalate to State Super Admin
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Open Grievances"
          value={openCount}
          change="Average TAT: < 4 Hours"
          isPositive={openCount === 0}
          icon={<LifeBuoy className="w-6 h-6 text-amber-600" />}
        />
        <StatCard
          title="Resolved Successfully"
          value={resolvedCount}
          change="100% Satisfaction score"
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Audit Trail Records"
          value={mockStore.getAuditLogs()?.length || 84}
          change="Immutable district events"
          isPositive={true}
          icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Escalation SLA"
          value="< 12 Hours"
          change="Standard operating rule"
          isPositive={true}
          icon={<Clock className="w-6 h-6 text-indigo-600" />}
        />
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'TEACHER', 'LIBRARY', 'STUDENT', 'TECHNICAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat === 'ALL' ? `All Tickets (${tickets.length})` : cat}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Reported Support & Grievance Tickets in {district} ({filteredTickets.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            No open tickets found in {district}.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {t.id}
                    </span>
                    <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {t.category}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{t.subject}</h4>
                  <p className="text-xs text-slate-500">
                    Raised by: <strong>{t.userName}</strong> ({t.userRole})
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                  {/* Quick Tech Actions */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    icon={<KeyRound className="w-3.5 h-3.5 text-amber-600" />}
                    onClick={() =>
                      setTechActionModal({
                        open: true,
                        ticketId: t.id,
                        userName: t.userName,
                        actionType: 'PASSWORD_RESET',
                      })
                    }
                  >
                    Reset Password
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    icon={<Unlock className="w-3.5 h-3.5 text-blue-600" />}
                    onClick={() =>
                      setTechActionModal({
                        open: true,
                        ticketId: t.id,
                        userName: t.userName,
                        actionType: 'UNLOCK_ACCOUNT',
                      })
                    }
                  >
                    Unlock
                  </Button>

                  <Button
                    size="sm"
                    variant={t.status === 'resolved' ? 'outline' : 'primary'}
                    className="text-xs"
                    onClick={() => setSelectedTicket(t)}
                  >
                    {t.status === 'resolved' ? 'View Details' : 'Resolve Grievance'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Resolve Grievance: ${selectedTicket?.id || ''}`}
        size="md"
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</p>
              <p className="text-slate-600 mt-1">{selectedTicket.description}</p>
              <div className="mt-2 text-[11px] text-slate-400">
                User: {selectedTicket.userName} ({selectedTicket.userRole})
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Resolution Note (Dispatched to Student/Teacher):
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Spoke directly with guardian and tutor. Compensatory session scheduled for Sunday 10 AM. Fee adjusted."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
              {selectedTicket.status !== 'resolved' && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={resolving}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleResolve}
                >
                  Mark Resolved & Issue Notice
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Technical Support Action Modal */}
      {techActionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Execute Technical Action: {techActionModal.actionType}
                </h3>
                <p className="text-xs text-slate-500">Target User: {techActionModal.userName}</p>
              </div>
              <button
                onClick={() =>
                  setTechActionModal({
                    open: false,
                    ticketId: '',
                    userName: '',
                    actionType: 'PASSWORD_RESET',
                  })
                }
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                You are executing an authorized District Administrator technical override under ticket{' '}
                <strong>{techActionModal.ticketId}</strong>. This event will be recorded in the District Audit Ledger.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Reason *</label>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Identity confirmed via Aadhaar and registered mobile call."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTechActionModal({
                      open: false,
                      ticketId: '',
                      userName: '',
                      actionType: 'PASSWORD_RESET',
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={<ShieldCheck className="w-4 h-4" />}
                  onClick={handleExecuteTechAction}
                >
                  Confirm & Execute Action
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
