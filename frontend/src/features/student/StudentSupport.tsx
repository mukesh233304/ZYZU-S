import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supportService } from '../../services/supportService';
import { SupportTicket } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/FeedbackStates';
import { LifeBuoy, Plus, MessageSquare, PhoneCall, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const StudentSupport: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New ticket state
  const [category, setCategory] = useState<'tutor' | 'library' | 'payment' | 'account' | 'other'>('tutor');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

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
      });
      setTickets(prev => [newTicket, ...prev]);
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      addToast('Support ticket created successfully. Our team will assist you shortly.', 'success');
    } catch (err) {
      addToast('Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        subtitle="Need help with your home tutor, library seat booking, or fees? We're here for you."
        breadcrumbs={[
          { label: 'Dashboard', href: '/student' },
          { label: 'Support' }
        ]}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Open Support Ticket
          </Button>
        }
      />

      {/* Quick Help Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-l-4 border-l-royal-blue-600 flex items-start gap-4">
          <div className="p-3 bg-royal-blue-50 text-royal-blue-600 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-navy-900">District Helpline</h4>
            <p className="text-xs text-slate-500 mt-1">Saidpur, Ghazipur HQ • Mon - Sat, 8 AM - 9 PM</p>
            <a href="tel:+919196434387" className="text-sm font-bold text-royal-blue-600 mt-2 block hover:underline">
              +91 91964 34387
            </a>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-navy-900">WhatsApp & Escalation</h4>
            <p className="text-xs text-slate-500 mt-1">Instant chat support & dispatch desk</p>
            <a href="https://wa.me/919569644387" target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-600 mt-2 block hover:underline">
              +91 95696 44387
            </a>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-vibrant-orange-500 flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-vibrant-orange-500 rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-navy-900">Official Email Desk</h4>
            <p className="text-xs text-slate-500 mt-1">Official escalations & receipt queries</p>
            <a href="mailto:focuspoint011@gmail.com" className="text-sm font-bold text-vibrant-orange-600 mt-2 block hover:underline">
              focuspoint011@gmail.com
            </a>
          </div>
        </Card>
      </div>

      {/* Tickets List */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-deep-navy-900 mb-4">My Support Tickets</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets opened"
            description="Have an issue with teacher matching, scheduling, or library payments? Open a ticket and our district desk will resolve it."
            actionLabel="Create a Ticket"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {t.id}
                    </span>
                    <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {t.category}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-base font-bold text-deep-navy-900">{t.subject}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{t.description}</p>
                  <p className="text-xs text-slate-400">
                    Opened on {new Date(t.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex sm:flex-col items-end justify-between gap-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    t.priority === 'high' ? 'bg-red-50 text-red-700' : t.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Open a New Support Ticket"
        size="lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Issue Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'tutor', label: 'Home Tutor & Allotment' },
                { value: 'library', label: 'Library Booking & Desk' },
                { value: 'payment', label: 'Payment & Receipt' },
                { value: 'account', label: 'Account & Verification' },
                { value: 'other', label: 'General / Other' },
              ]}
              required
            />
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low - General inquiry' },
                { value: 'medium', label: 'Medium - Normal request' },
                { value: 'high', label: 'High - Urgent / Attendance issue' },
              ]}
              required
            />
          </div>

          <Input
            label="Subject / Topic"
            placeholder="e.g. Need to reschedule home tutor demo session"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details, dates, or booking reference numbers so our team can resolve this faster..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
