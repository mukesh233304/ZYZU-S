import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supportService } from '../../services/supportService';
import { SupportTicket, UserRole } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/FeedbackStates';
import { 
  LifeBuoy, Plus, PhoneCall, MessageSquare, Mail, 
  Paperclip, Star, RotateCcw, CheckCircle2, AlertTriangle, 
  Send, ShieldCheck, UserCheck, Clock, X
} from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

export const LibrarySupport: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ticket creation form
  const [category, setCategory] = useState<'library' | 'payment' | 'account' | 'student' | 'other'>('library');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  // Selected Ticket for Thread / Conversation
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Admin Simulation Mode
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Rating state
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const data = await supportService.getTickets(user.id);
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: string[] = [];
      for (let i = 0; i < files.length; i++) {
        newFiles.push(files[i].name);
      }
      setAttachments(prev => [...prev, ...newFiles]);
      addToast(`${files.length} file(s) attached to ticket`, 'info');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const newTicket = await supportService.createTicket({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        district: user.district || 'Ghazipur',
        category,
        priority,
        subject,
        description,
        status: 'open',
        slaStatus: 'within_sla',
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setTickets(prev => [newTicket, ...prev]);
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      setAttachments([]);
      addToast("Ticket submitted to ZYZU'S Partner Desk!", 'success');
    } catch (err) {
      addToast('Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim() || !user) return;
    setSendingReply(true);

    try {
      const senderRole: UserRole = isAdminMode ? 'DISTRICT_ADMIN' : (user.role as UserRole);
      const senderName = isAdminMode ? 'District Support Admin' : user.name;
      const senderId = isAdminMode ? 'admin-system' : user.id;

      await supportService.addResponse(
        activeTicket.id,
        senderId,
        senderName,
        senderRole,
        replyText.trim()
      );

      const updatedTicket: SupportTicket = {
        ...activeTicket,
        responses: [
          ...(activeTicket.responses || []),
          {
            id: `resp-${Date.now()}`,
            senderId,
            senderName,
            senderRole,
            message: replyText.trim(),
            timestamp: new Date().toISOString()
          }
        ]
      };

      setActiveTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? updatedTicket : t));
      setReplyText('');
      addToast('Response posted to discussion thread', 'success');
    } catch (err) {
      addToast('Failed to send reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleAdminStatusChange = async (status: 'in_progress' | 'resolved') => {
    if (!activeTicket) return;
    try {
      await supportService.updateTicketStatus(activeTicket.id, status);
      const updated = { ...activeTicket, status };
      setActiveTicket(updated);
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? updated : t));
      addToast(`Ticket status updated to ${status.toUpperCase()} by District Admin`, 'info');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleRateTicket = async () => {
    if (!activeTicket) return;
    setSubmittingRating(true);
    try {
      await supportService.rateTicket(activeTicket.id, rating, feedback.trim());
      const updated = { ...activeTicket, rating, feedback: feedback.trim() };
      setActiveTicket(updated);
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? updated : t));
      addToast('Thank you for rating our partner support service!', 'success');
    } catch (err) {
      addToast('Failed to submit rating', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!activeTicket) return;
    try {
      await supportService.reopenTicket(activeTicket.id);
      const updated = { ...activeTicket, status: 'open' as any };
      setActiveTicket(updated);
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? updated : t));
      addToast('Ticket has been reopened and queued for desk review', 'info');
    } catch (err) {
      addToast('Failed to reopen ticket', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Support & Helpdesk"
        subtitle="Dedicated resolution desk for study library owners, capacity approvals, and booking settlements"
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Support' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isAdminMode 
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {isAdminMode ? 'Admin Simulator: Active' : 'Admin Simulator Mode'}
            </button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
              Open Support Ticket
            </Button>
          </div>
        }
      />

      {/* Admin Mode Banner */}
      {isAdminMode && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span><b>District Admin Simulator Active:</b> You can now resolve tickets and reply on behalf of the Ghazipur District Verification Desk.</span>
          </div>
          <button onClick={() => setIsAdminMode(false)} className="text-purple-700 font-bold hover:underline">
            Exit
          </button>
        </div>
      )}

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-l-4 border-l-royal-blue-600 flex items-start gap-4">
          <div className="p-3 bg-royal-blue-50 text-royal-blue-600 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-navy-900">District Office Desk</h4>
            <p className="text-xs text-slate-500 mt-1">Ghazipur district verification coordinator</p>
            <p className="text-sm font-bold text-royal-blue-600 mt-2">+91 94500 12345</p>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-navy-900">Partner WhatsApp Desk</h4>
            <p className="text-xs text-slate-500 mt-1">Seat grid modifications & urgent assistance</p>
            <p className="text-sm font-bold text-emerald-600 mt-2">+91 98765 22110</p>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-vibrant-orange-500 flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-vibrant-orange-500 rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-navy-900">Settlements & Billing</h4>
            <p className="text-xs text-slate-500 mt-1">Bi-weekly online booking payouts</p>
            <p className="text-sm font-bold text-vibrant-orange-600 mt-2">settlements@zyzus.com</p>
          </div>
        </Card>
      </div>

      {/* Tickets List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Support Tickets & Requests</h3>
            <p className="text-xs text-slate-500">Track issues, thread conversations, and response SLAs</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {tickets.length} Tickets
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets opened"
            description="Your library operations, desk seats, and online bookings are running smoothly without any reported issues."
            actionLabel="Open a Ticket"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {tickets.map(t => {
              const statusUpper = (t.status || 'open').toUpperCase();
              const isResolved = statusUpper === 'RESOLVED' || statusUpper === 'CLOSED';
              const slaStatus = t.slaStatus || 'within_sla';

              return (
                <div 
                  key={t.id} 
                  onClick={() => setActiveTicket(t)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-royal-blue-400 hover:shadow-xs transition-all bg-white cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        #{t.id}
                      </span>
                      <StatusBadge status={t.status} />

                      {/* SLA Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        slaStatus === 'within_sla' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : slaStatus === 'at_risk'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {slaStatus === 'within_sla' ? 'Within 4h SLA' : slaStatus === 'at_risk' ? 'SLA At Risk' : 'SLA Breached'}
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        • {t.category ? t.category.toUpperCase() : 'GENERAL'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{t.subject}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                    
                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                      <span>Opened on {new Date(t.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>{(t.responses || []).length} Message(s)</span>
                      {t.attachments && t.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-royal-blue-600 font-medium">
                          <Paperclip className="w-3 h-3" /> {t.attachments.length} file(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${
                      t.priority === 'urgent' || t.priority === 'high' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority} Priority
                    </span>

                    {t.rating ? (
                      <div className="flex items-center text-amber-400 text-xs gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating! ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    ) : isResolved ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Rate Experience
                      </span>
                    ) : (
                      <span className="text-xs text-royal-blue-600 font-semibold hover:underline">
                        View Thread &rarr;
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Ticket Discussion Thread Modal */}
      {activeTicket && (
        <Modal
          isOpen={Boolean(activeTicket)}
          onClose={() => setActiveTicket(null)}
          title={`Ticket #${activeTicket.id}: ${activeTicket.subject}`}
          size="lg"
        >
          <div className="space-y-4 font-sans text-xs">
            {/* Header info */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeTicket.status} />
                <span className="font-bold text-slate-700 uppercase">{activeTicket.category}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-medium">{activeTicket.priority.toUpperCase()} PRIORITY</span>
              </div>

              {/* Admin Simulation Actions */}
              {isAdminMode && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-purple-700">Admin Actions:</span>
                  <button
                    onClick={() => handleAdminStatusChange('in_progress')}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold hover:bg-blue-200"
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() => handleAdminStatusChange('resolved')}
                    className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold hover:bg-emerald-200"
                  >
                    Resolve Ticket
                  </button>
                </div>
              )}
            </div>

            {/* Attachments preview if any */}
            {activeTicket.attachments && activeTicket.attachments.length > 0 && (
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-royal-blue-600 shrink-0" />
                <span className="font-bold text-slate-700">Attached Documents:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTicket.attachments.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Thread */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white max-h-80 overflow-y-auto space-y-3">
              {(activeTicket.responses && activeTicket.responses.length > 0) ? (
                activeTicket.responses.map((resp, i) => {
                  const isOwner = resp.senderRole === 'LIBRARY_OWNER' || resp.senderId === user?.id;
                  return (
                    <div 
                      key={resp.id || i}
                      className={`p-3 rounded-xl max-w-[85%] ${
                        isOwner 
                          ? 'ml-auto bg-royal-blue-50 border border-royal-blue-100 text-slate-800' 
                          : 'mr-auto bg-slate-100 border border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={isOwner ? user : { name: resp.senderName }} size="xs" showBorder />
                          <span className="font-bold text-[11px] text-slate-900">
                            {resp.senderName} {isOwner ? '(You)' : '• District Helpdesk'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{resp.message}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-center py-6">Initial ticket description submitted.</p>
              )}
            </div>

            {/* Rating / Reopen Bar if Resolved */}
            {((activeTicket.status || '').toUpperCase() === 'RESOLVED' || (activeTicket.status || '').toUpperCase() === 'CLOSED') && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">Ticket Resolved</span>
                  </div>
                  <button
                    onClick={handleReopenTicket}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded hover:bg-slate-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket
                  </button>
                </div>

                {!activeTicket.rating ? (
                  <div className="space-y-2 pt-2 border-t border-emerald-200">
                    <span className="font-bold text-slate-700 block">Rate Resolution Satisfaction:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${num <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">{rating} of 5 Stars</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Optional feedback (e.g. Prompt resolution by desk coordinator)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded px-2.5 py-1"
                      />
                      <Button size="sm" variant="primary" loading={submittingRating} onClick={handleRateTicket}>
                        Submit Rating
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-800 font-medium">
                    Rated {activeTicket.rating} / 5 Stars. Thank you! {activeTicket.feedback ? `("${activeTicket.feedback}")` : ''}
                  </div>
                )}
              </div>
            )}

            {/* Reply Form */}
            {((activeTicket.status || '').toUpperCase() !== 'RESOLVED' && (activeTicket.status || '').toUpperCase() !== 'CLOSED') && (
              <form onSubmit={handleSendReply} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isAdminMode ? "Type District Admin reply..." : "Type response to helpdesk coordinator..."}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-royal-blue-500 focus:outline-hidden"
                    required
                  />
                  <Button type="submit" variant="primary" size="sm" loading={sendingReply} icon={<Send className="w-3.5 h-3.5" />}>
                    Send Reply
                  </Button>
                </div>
              </form>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setActiveTicket(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Open Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Open a Partner Support Ticket"
        size="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'library', label: 'Seat Grid / Capacity Change' },
              { value: 'payment', label: 'Bi-Weekly Online Booking Payout / Settlement' },
              { value: 'account', label: 'District Admin Verification / Inspection' },
              { value: 'student', label: 'Student Misconduct / Shift Dispute' },
              { value: 'other', label: 'General / Platform Technical Feature' },
            ]}
          />

          <Select
            label="Priority Level *"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: 'low', label: 'Low - General inquiry (within 24h)' },
              { value: 'medium', label: 'Medium - Standard inquiry (within 12h)' },
              { value: 'high', label: 'High - Booking or payment concern (within 4h)' },
              { value: 'urgent', label: 'Urgent - Critical study space issue (within 2h)' },
            ]}
          />

          <Input
            label="Subject *"
            placeholder="e.g. Request to expand capacity by 15 desks"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue or change request in detail..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500"
              required
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Attach Screenshot or Proof Document (Optional)
            </label>
            <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                id="ticket-upload"
                className="hidden"
              />
              <label htmlFor="ticket-upload" className="cursor-pointer text-xs text-royal-blue-600 font-bold hover:underline flex items-center justify-center gap-1.5">
                <Paperclip className="w-4 h-4" /> Choose file(s) to attach
              </label>
              <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, PDF up to 5MB</span>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((file, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 px-2 py-1 rounded font-mono text-slate-700">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    {file}
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
