import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Video,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  Shield,
  HelpCircle,
  Building2,
  RefreshCw,
  Copy,
  Check,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../mock/store';

interface CommMessage {
  id: string;
  sender: 'DISTRICT_ADMIN' | 'SUPER_ADMIN';
  senderName: string;
  message: string;
  timestamp: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'SENT' | 'DELIVERED' | 'READ';
  category: 'DISBURSEMENT' | 'POLICY' | 'TECHNICAL' | 'ESCALATION' | 'GENERAL';
}

interface MeetingRequest {
  id: string;
  topic: string;
  requestedDate: string;
  requestedTime: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  meetingLink?: string;
  notes?: string;
}

export const DistrictSuperAdminComm: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CHAT' | 'CALLS' | 'MEETINGS' | 'ESCALATIONS'>('CHAT');
  const [messages, setMessages] = useState<CommMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [category, setCategory] = useState<'DISBURSEMENT' | 'POLICY' | 'TECHNICAL' | 'ESCALATION' | 'GENERAL'>('GENERAL');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Video Meeting Request State
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingList, setMeetingList] = useState<MeetingRequest[]>([]);

  // Super Admin Official Desk Contacts
  const SUPER_ADMIN_NAME = 'State HQ Control Desk (Varanasi / Lucknow Hub)';
  const SUPER_ADMIN_PHONE = '+91 94150 88201';
  const SUPER_ADMIN_EMAIL = 'superadmin.hq@focuspoint.org.in';
  const SUPER_ADMIN_WHATSAPP = '919415088201';

  useEffect(() => {
    // Load persisted chat or seed standard channel
    const saved = localStorage.getItem('fp_superadmin_comm_msgs');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        initDefaultMessages();
      }
    } else {
      initDefaultMessages();
    }

    const savedMeetings = localStorage.getItem('fp_superadmin_meetings');
    if (savedMeetings) {
      try {
        setMeetingList(JSON.parse(savedMeetings));
      } catch {
        initDefaultMeetings();
      }
    } else {
      initDefaultMeetings();
    }
  }, []);

  const initDefaultMessages = () => {
    const initial: CommMessage[] = [
      {
        id: 'COMM-101',
        sender: 'SUPER_ADMIN',
        senderName: 'State Operations Director',
        message: 'Namaste District Admin. Monthly review for Ghazipur operations is scheduled. Please ensure all 30th-cycle teacher payouts and library clearances are finalized on time.',
        timestamp: '2026-09-12 11:30 AM',
        priority: 'NORMAL',
        status: 'READ',
        category: 'POLICY',
      },
      {
        id: 'COMM-102',
        sender: 'DISTRICT_ADMIN',
        senderName: user?.name || 'Manoj Rai (DA Ghazipur)',
        message: 'Noted sir. We have verified 68 active home tutors and 12 library locations. Payout queue will be executed smoothly.',
        timestamp: '2026-09-12 02:15 PM',
        priority: 'NORMAL',
        status: 'DELIVERED',
        category: 'DISBURSEMENT',
      },
      {
        id: 'COMM-103',
        sender: 'SUPER_ADMIN',
        senderName: 'HQ Finance Cell',
        message: 'Excellent. Central banking gateway is synced. If any local law-and-order or internet disruptions occur, log an immediate ticket here.',
        timestamp: '2026-09-13 10:05 AM',
        priority: 'HIGH',
        status: 'READ',
        category: 'GENERAL',
      },
    ];
    setMessages(initial);
    localStorage.setItem('fp_superadmin_comm_msgs', JSON.stringify(initial));
  };

  const initDefaultMeetings = () => {
    const initialMeetings: MeetingRequest[] = [
      {
        id: 'MTG-881',
        topic: 'Q3 Ghazipur Expansion & New Library Verifications',
        requestedDate: '2026-09-20',
        requestedTime: '11:00 AM',
        status: 'SCHEDULED',
        meetingLink: 'https://meet.google.com/fp-ghz-super',
        notes: 'Review pending library license requests in Mohammadabad block.',
      },
    ];
    setMeetingList(initialMeetings);
    localStorage.setItem('fp_superadmin_meetings', JSON.stringify(initialMeetings));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: CommMessage = {
      id: `COMM-${Date.now()}`,
      sender: 'DISTRICT_ADMIN',
      senderName: user?.name || 'District Admin (Ghazipur)',
      message: newMessage.trim(),
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      priority,
      status: 'SENT',
      category,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setNewMessage('');
    localStorage.setItem('fp_superadmin_comm_msgs', JSON.stringify(updated));

    // Automated HQ Ack response simulator
    setTimeout(() => {
      const ackMsg: CommMessage = {
        id: `COMM-ACK-${Date.now()}`,
        sender: 'SUPER_ADMIN',
        senderName: 'HQ Duty Officer (Automated Ack)',
        message: `Acknowledged your dispatch regarding "${category}". The State Oversight Team has received this notice and will respond if action is needed.`,
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        priority: 'NORMAL',
        status: 'DELIVERED',
        category,
      };
      setMessages((prev) => {
        const withAck = [...prev, ackMsg];
        localStorage.setItem('fp_superadmin_comm_msgs', JSON.stringify(withAck));
        return withAck;
      });
    }, 1500);

    setStatusNotice('Message dispatched to Super Admin Central Desk.');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleRequestMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTopic || !meetingDate || !meetingTime) return;

    const newReq: MeetingRequest = {
      id: `MTG-${Math.floor(100 + Math.random() * 900)}`,
      topic: meetingTopic,
      requestedDate: meetingDate,
      requestedTime: meetingTime,
      status: 'PENDING',
      notes: 'Requested by District Admin for official administrative synchronization.',
    };

    const updated = [newReq, ...meetingList];
    setMeetingList(updated);
    localStorage.setItem('fp_superadmin_meetings', JSON.stringify(updated));
    setMeetingTopic('');
    setMeetingDate('');
    setMeetingTime('');

    setStatusNotice('Video Conference Request submitted to State Super Admin schedule.');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const whatsAppUrl = `https://wa.me/${SUPER_ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Namaste Super Admin HQ. I am Manoj Rai, District Admin (Ghazipur). Reaching out regarding urgent district operations.`
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-blue-400" />
            Official State Super Admin High-Priority Communication Channel
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Super Admin Command Desk</h1>
          <p className="text-blue-200 text-sm mt-1 max-w-2xl">
            Direct real-time coordination, escalation routing, and audio/video dispatch line with State HQ Operations & Policy Directors.
          </p>
        </div>

        {/* Quick Dial Badges */}
        <div className="flex items-center gap-2">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            HQ WhatsApp
          </a>
          <a
            href={`tel:${SUPER_ADMIN_PHONE}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            <Phone className="w-4 h-4" />
            Direct Call
          </a>
        </div>
      </div>

      {statusNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{statusNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CHAT'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <Send className="w-4 h-4" />
          Direct Dispatch Thread ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('CALLS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CALLS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <Phone className="w-4 h-4" />
          HQ Voice & Telephony Desk
        </button>

        <button
          onClick={() => setActiveTab('MEETINGS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MEETINGS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <Video className="w-4 h-4" />
          Video Conferences & Reviews ({meetingList.length})
        </button>

        <button
          onClick={() => setActiveTab('ESCALATIONS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ESCALATIONS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Official Circulars & Escalation Protocol
        </button>
      </div>

      {/* Tab 1: Dispatch & Chat */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Box */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[650px]">
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  HQ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{SUPER_ADMIN_NAME}</h3>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Direct State Command Line Active
                  </p>
                </div>
              </div>

              <button
                onClick={initDefaultMessages}
                className="text-xs font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1"
                title="Refresh Thread"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Mock Thread
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((m) => {
                const isMe = m.sender === 'DISTRICT_ADMIN';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-600">{m.senderName}</span>
                      <span className="text-[10px] text-gray-400">{m.timestamp}</span>
                      {m.priority === 'URGENT' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          URGENT
                        </span>
                      )}
                      {m.priority === 'HIGH' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          HIGH
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[10px] opacity-75 uppercase font-bold tracking-wider mb-1">
                        Category: {m.category}
                      </div>
                      <p>{m.message}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                      {isMe && (
                        <span>
                          {m.status === 'READ' ? '✓✓ Read' : m.status === 'DELIVERED' ? '✓✓ Delivered' : '✓ Sent'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Formulation */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-600">Category:</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="GENERAL">General Communication</option>
                    <option value="DISBURSEMENT">Disbursement & Finance</option>
                    <option value="POLICY">Policy & Block Guidelines</option>
                    <option value="TECHNICAL">Technical Platform Support</option>
                    <option value="ESCALATION">Urgent Grievance Escalation</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-600">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Immediate HQ Alert)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type official communication, operational summary, or administrative question for State Super Admin..."
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions & Contact Cards */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                HQ Desk Details
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Lead State Administrator:</span>
                  <span className="font-semibold text-gray-800">State Directorate Operations Cell</span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Phone Desk:</span>
                  <div className="flex items-center justify-between font-mono font-medium text-gray-900">
                    <span>{SUPER_ADMIN_PHONE}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(SUPER_ADMIN_PHONE)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedNumber ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Emergency Dispatch Email:</span>
                  <span className="font-mono text-xs text-gray-800">{SUPER_ADMIN_EMAIL}</span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Operating Hours:</span>
                  <span className="text-xs text-gray-700 font-medium">Mon - Sat: 08:30 AM to 08:00 PM (Emergency 24/7)</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                Administrative Protocol
              </h4>
              <p className="text-xs text-indigo-900 leading-relaxed">
                All communications sent here are permanently archived under the District Audit Ledger. Use the <strong>URGENT</strong> priority badge strictly for time-sensitive banking issues, state government inquiries, or law enforcement notices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Voice & Telephony Desk */}
      {activeTab === 'CALLS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Direct Voice Hotline</h3>
              <p className="text-sm text-gray-600 mt-1">
                Dial directly to the State Super Admin hotline for Ghazipur district matters.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Priority Number</span>
                <p className="text-xl font-bold font-mono text-gray-900">{SUPER_ADMIN_PHONE}</p>
              </div>
              <a
                href={`tel:${SUPER_ADMIN_PHONE}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <p>• Immediate routing to assigned State Zonal Manager.</p>
              <p>• Calls during after-hours are routed to the 24x7 State Emergency Escalation Duty Officer.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Official WhatsApp State Line</h3>
              <p className="text-sm text-gray-600 mt-1">
                Instant sharing of documents, scanned bank receipts, or field photos with Super Admin leadership.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 uppercase font-semibold">WhatsApp Desk</span>
                <p className="text-xl font-bold font-mono text-emerald-900">+91 94150 88201</p>
              </div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                Open WhatsApp
              </a>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <p>• End-to-end encrypted messaging for high-priority documents.</p>
              <p>• Pre-populated with your verified District Admin identity and Ghazipur jurisdiction.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Meetings & Video Conferences */}
      {activeTab === 'MEETINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Book Video Sync
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Request an official Google Meet review with State Super Admin directors.
            </p>

            <form onSubmit={handleRequestMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Agenda / Meeting Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ghazipur Library Audit & Q3 Expansion"
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md"
              >
                Submit Conference Request
              </button>
            </form>
          </div>

          {/* Meeting Log */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Scheduled & Past Reviews</span>
              <span className="text-xs font-normal text-gray-500">{meetingList.length} Sessions</span>
            </h3>

            <div className="space-y-3">
              {meetingList.map((mtg) => (
                <div
                  key={mtg.id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{mtg.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mtg.status === 'SCHEDULED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : mtg.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {mtg.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">{mtg.topic}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {mtg.requestedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {mtg.requestedTime}
                      </span>
                    </p>
                  </div>

                  {mtg.meetingLink ? (
                    <a
                      href={mtg.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Google Meet
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Awaiting Link Approval</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Escalation & Circulars */}
      {activeTab === 'ESCALATIONS' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">State Escalation Matrix & SOP</h3>
            <p className="text-xs text-gray-500 mt-1">
              Standard Operating Procedures for multi-tier problem resolution across Ghazipur District.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Level 1 - Local Resolution</span>
              <h4 className="text-sm font-bold text-gray-900">District Admin Handled</h4>
              <p className="text-xs text-gray-600">
                Seat disputes, teacher reallocations, parent queries, fee receipts, and walk-in seat allocations.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700">Turnaround: &lt; 12 Hours</div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Level 2 - Regional Zonal Cell</span>
              <h4 className="text-sm font-bold text-gray-900">Zonal Operations Manager</h4>
              <p className="text-xs text-gray-600">
                Teacher license suspensions, library regulatory compliance, refund authorizations above ₹5,000.
              </p>
              <div className="text-[11px] font-semibold text-amber-700">Turnaround: &lt; 24 Hours</div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Level 3 - State HQ Direct</span>
              <h4 className="text-sm font-bold text-gray-900">Super Admin Command</h4>
              <p className="text-xs text-gray-600">
                Banking gateway freeze, district policy modifications, commission rate revisions, legal inquiries.
              </p>
              <div className="text-[11px] font-semibold text-rose-700">Turnaround: &lt; 4 Hours (Immediate)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
