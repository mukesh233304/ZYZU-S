import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Bell,
  CheckCheck,
  BookOpen,
  Clock,
  AlertCircle,
  Info,
  ShieldCheck,
  CreditCard,
  Inbox,
  Sparkles
} from 'lucide-react';

export const TeacherNotifications: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'tutor' | 'payment' | 'system'>('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      // Zero fake fallback: strictly preserve real user notifications
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      addToast('Marked as read', 'info');
    } catch (err) {
      addToast('Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to update notifications', 'error');
    }
  };

  const filtered = notifications.filter(n => {
    if (filterUnreadOnly && n.isRead) return false;
    if (activeTab !== 'all' && n.type !== activeTab) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Notifications & Circulars"
        subtitle="Real-time allotment updates, session verification alerts, parent queries, and district notices"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Notifications' }
        ]}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      {/* Category Tabs & Unread Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-royal-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Notices ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('tutor')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'tutor'
                ? 'bg-royal-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Allotments & Sessions
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'payment'
                ? 'bg-royal-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payouts & Billings
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'system'
                ? 'bg-royal-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            District Circulars
          </button>
        </div>

        <button
          onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
            filterUnreadOnly
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            {filterUnreadOnly ? 'No unread notifications' : "You're all caught up!"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterUnreadOnly
              ? 'You have reviewed all your incoming notices.'
              : 'No new notifications or circulars at this time. Allotment updates and district bulletins will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card
              key={item.id}
              className={`p-4 transition-all duration-200 flex items-start gap-4 border ${
                !item.isRead ? 'bg-royal-blue-50/40 border-royal-blue-200 shadow-xs' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                {item.type === 'tutor' ? (
                  <ShieldCheck className="w-5 h-5 text-royal-blue-600" />
                ) : item.type === 'payment' ? (
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Info className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                {item.actionUrl && (
                  <a
                    href={item.actionUrl}
                    className="inline-block mt-2 text-xs font-semibold text-royal-blue-600 hover:text-royal-blue-700 hover:underline"
                  >
                    View Details &rarr;
                  </a>
                )}
              </div>
              {!item.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(item.id)}
                  title="Mark as read"
                  className="flex-shrink-0 text-slate-400 hover:text-royal-blue-600"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
