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
import {
  LifeBuoy,
  Plus,
  PhoneCall,
  MessageSquare,
  Mail,
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileQuestion,
  CheckCircle2
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'When and how are teacher fee payouts disbursed?',
    answer: 'Tutor payouts are transferred automatically on the 5th of every month into your linked bank account via NEFT/IMPS. Disbursements are calculated from verified session attendance logs.',
    category: 'Finance & Payouts'
  },
  {
    question: 'How do I log class attendance and syllabus covered?',
    answer: 'Navigate to "Attendance" in your portal, click "Log Class Session", select the allotted student, enter the date, time, duration, and summary of topics taught. Records are immediately stored in the guardian dashboard.',
    category: 'Class Management'
  },
  {
    question: 'What if a student or parent requests a schedule change?',
    answer: 'You can coordinate alternative open slots directly via phone or WhatsApp. Once mutually agreed, update your schedule and availability slots under "Weekly Schedule".',
    category: 'Class Management'
  },
  {
    question: 'How long does District Admin verification take?',
    answer: 'Initial credential and KYC vetting typically takes 24 to 48 business hours. Once approved, your profile becomes visible for automated home tutoring student allotments in your district.',
    category: 'KYC & Verification'
  },
  {
    question: 'What should I do if a verification document is marked as Rejected?',
    answer: 'Go to "Verification", view the exact rejection note provided by the District Admin, and click "Replace Document" to re-upload a clear, high-resolution scan of the requested certificate.',
    category: 'KYC & Verification'
  }
];

export const TeacherSupport: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FAQ search & accordion
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Ticket Filter
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Form State
  const [category, setCategory] = useState<'tutor' | 'payment' | 'account' | 'other'>('tutor');
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
      addToast('Support ticket raised with District Admin coordinator', 'success');
    } catch (err) {
      addToast('Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = FAQS.filter(f =>
    f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => {
    if (ticketStatusFilter === 'all') return true;
    if (ticketStatusFilter === 'open') return t.status !== 'resolved' && t.status !== 'closed';
    if (ticketStatusFilter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teacher Help Desk & Support Center"
        subtitle="Knowledge base, direct district coordinator channels, and official query resolution tickets"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Support & Help Desk' }
        ]}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Raise Support Ticket
          </Button>
        }
      />

      {/* Direct Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-royal-blue-600 flex items-start gap-3.5 bg-white border border-slate-200">
          <div className="p-2.5 bg-royal-blue-50 text-royal-blue-600 rounded-xl shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900">District Admin Desk</h4>
            <p className="text-xs text-slate-500 mt-0.5">{user?.district || 'Ghazipur'} District Coordinator</p>
            <p className="text-xs font-bold text-royal-blue-600 mt-1.5">+91 94500 12345</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 flex items-start gap-3.5 bg-white border border-slate-200">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900">Educator Helpline</h4>
            <p className="text-xs text-slate-500 mt-0.5">Direct tutor WhatsApp desk</p>
            <p className="text-xs font-bold text-emerald-600 mt-1.5">+91 98765 88990</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex items-start gap-3.5 bg-white border border-slate-200">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900">Payouts & Finance</h4>
            <p className="text-xs text-slate-500 mt-0.5">Disbursement & bank inquiries</p>
            <p className="text-xs font-bold text-amber-600 mt-1.5">payouts@zyzus.com</p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: FAQs and Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Knowledge Base & FAQs */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-royal-blue-600" /> Knowledge Base & FAQs
                </h3>
                <p className="text-xs text-slate-500">Quick answers to common educator questions</p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-royal-blue-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredFaqs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No FAQs match your search query. You can raise a custom ticket below.
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = expandedFaqIndex === idx;
                  return (
                    <div key={idx} className="py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-900 hover:text-royal-blue-600 transition-colors"
                      >
                        <span className="flex-1 pr-2">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 animate-in fade-in duration-150">
                          <p>{faq.answer}</p>
                          <span className="inline-block mt-1.5 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {faq.category}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Submitted Tickets Tracker */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Support Tickets</h3>
                <p className="text-xs text-slate-500">{tickets.length} total tickets logged</p>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setTicketStatusFilter('all')}
                  className={`px-2 py-1 rounded ${ticketStatusFilter === 'all' ? 'bg-royal-blue-50 text-royal-blue-700 font-bold' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTicketStatusFilter('open')}
                  className={`px-2 py-1 rounded ${ticketStatusFilter === 'open' ? 'bg-royal-blue-50 text-royal-blue-700 font-bold' : 'text-slate-500'}`}
                >
                  Open
                </button>
                <button
                  onClick={() => setTicketStatusFilter('resolved')}
                  className={`px-2 py-1 rounded ${ticketStatusFilter === 'resolved' ? 'bg-royal-blue-50 text-royal-blue-700 font-bold' : 'text-slate-500'}`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No support tickets found</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1 mb-3">
                  Need assistance with allotments, verification, or payments? Raise a direct ticket.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs"
                >
                  Raise New Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map(t => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[11px] font-semibold text-slate-500">{t.id}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(t.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span className="capitalize font-semibold text-slate-600">{t.priority} Priority</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Raise Support or Escalation Ticket"
          size="md"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <Select
              label="Issue Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'tutor', label: 'Student Allotment / Attendance Discrepancy' },
                { value: 'payment', label: 'Payout / Monthly Fee Disbursement' },
                { value: 'account', label: 'KYC / Credential Verification Review' },
                { value: 'other', label: 'General / Platform Inquiry' },
              ]}
            />

            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low - General inquiry or information' },
                { value: 'medium', label: 'Medium - Operational / Timing adjustment' },
                { value: 'high', label: 'High - Urgent / Payment or student issue' },
              ]}
            />

            <Input
              label="Subject"
              placeholder="e.g. Schedule adjustment request for student Aryan"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Detailed Explanation
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail for your District Admin coordinator..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-royal-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Submit Support Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
