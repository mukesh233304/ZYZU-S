import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { AnnouncementCircular } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Bell,
  CheckCheck,
  Users,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Filter,
  FileText,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DistrictNotifications: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [circulars, setCirculars] = useState<AnnouncementCircular[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'UNREAD'>('ALL');
  const [replyTextMap, setReplyTextMap] = useState<{ [circularId: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const loadCirculars = () => {
    const list = mockStore.getAnnouncements(district);
    setCirculars(list);
  };

  useEffect(() => {
    loadCirculars();
  }, [district]);

  const handleMarkAcknowledged = (id: string) => {
    mockStore.replyToAnnouncement(id, {
      id: `REP-ACK-${Date.now()}`,
      authorName: user?.name || `District Admin (${district})`,
      authorRole: 'DISTRICT_ADMIN',
      message: 'Acknowledged and noted for district administrative enforcement.',
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    });
    loadCirculars();
    addToast('Official circular acknowledgement logged and dispatched to Super Admin.', 'success');
  };

  const handleSendReply = (circularId: string) => {
    const text = replyTextMap[circularId];
    if (!text || !text.trim()) return;

    mockStore.replyToAnnouncement(circularId, {
      id: `REP-${Date.now()}`,
      authorName: user?.name || `District Admin (${district})`,
      authorRole: 'DISTRICT_ADMIN',
      message: text.trim(),
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    });

    setReplyTextMap((prev) => ({ ...prev, [circularId]: '' }));
    setActiveReplyId(null);
    loadCirculars();
    addToast('Reply dispatched to State Super Admin circular thread.', 'success');
  };

  const filtered = circulars.filter((c) => {
    if (filter === 'URGENT') return c.isUrgent || c.priority === 'HIGH';
    if (filter === 'UNREAD') return !c.isAcknowledged;
    return true;
  });

  const urgentCount = circulars.filter((c) => c.isUrgent || c.priority === 'HIGH').length;

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to view notifications for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`District Circulars & State Directives: ${district}`}
        subtitle="High-priority state policy dispatches, urgent circulars, and District Admin reply desk"
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Circulars & Directives' }
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </div>
            <Link to="/district-admin/super-admin-comm">
              <Button variant="outline" size="sm" icon={<MessageSquare className="w-4 h-4 text-blue-600" />}>
                Super Admin Live Desk
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Alert Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active State Circulars"
          value={circulars.length}
          change="Official policy directives"
          isPositive={true}
          icon={<Bell className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Urgent Directives"
          value={urgentCount}
          change="Immediate enforcement"
          isPositive={false}
          icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
        />
        <StatCard
          title="District Acknowledged"
          value={circulars.filter((c) => c.isAcknowledged || (c.replies && c.replies.length > 0)).length}
          change="100% regulatory response"
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Super Admin Line"
          value="Connected"
          change="24x7 Escrow & Hotline active"
          isPositive={true}
          icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Circulars ({circulars.length})
        </button>
        <button
          onClick={() => setFilter('URGENT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            filter === 'URGENT'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Urgent Directives ({urgentCount})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Acknowledgment
        </button>
      </div>

      {/* Circular Stream */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isUrgent = item.isUrgent || item.priority === 'HIGH';
          const replies = item.replies || [];
          const isReplyOpen = activeReplyId === item.id;

          return (
            <Card
              key={item.id}
              className={`p-6 transition-all duration-200 border space-y-4 ${
                isUrgent ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{item.id}</span>
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                          Urgent Directive
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.targetAudience}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                    <p className="text-xs text-slate-400">
                      Dispatched by {item.authorName} • {item.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    icon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    onClick={() => handleMarkAcknowledged(item.id)}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs"
                    icon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => setActiveReplyId(isReplyOpen ? null : item.id)}
                  >
                    {isReplyOpen ? 'Close Reply' : 'Reply to State HQ'}
                  </Button>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
                {item.content}
              </div>

              {/* Threaded Replies / Conversation (Req 36) */}
              {replies.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">
                    Administrative Thread History ({replies.length}):
                  </span>
                  <div className="space-y-2">
                    {replies.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span className="font-bold text-blue-900">{r.authorName}</span>
                          <span className="text-[10px] text-slate-400">{r.timestamp}</span>
                        </div>
                        <p className="text-slate-800">{r.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input Box */}
              {isReplyOpen && (
                <div className="pt-3 border-t border-slate-200 space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-slate-700 block">
                    Dispatch Official Response to Super Admin Desk:
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={replyTextMap[item.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="Type district compliance confirmation, field update, or inquiry..."
                      className="flex-1 text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      className="self-end"
                      icon={<Send className="w-4 h-4" />}
                      onClick={() => handleSendReply(item.id)}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
