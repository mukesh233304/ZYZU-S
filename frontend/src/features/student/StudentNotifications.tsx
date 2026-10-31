import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/FeedbackStates';
import { 
  Bell, CheckCheck, BookOpen, Clock, AlertCircle, 
  Info, QrCode, CreditCard, GraduationCap, ChevronRight,
  ShieldCheck, CheckCircle2
} from 'lucide-react';

type FilterCategory = 'ALL' | 'UNREAD' | 'TUTOR' | 'LIBRARY' | 'PAYMENT' | 'ATTENDANCE';

export const StudentNotifications: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('ALL');

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (selectedFilter === 'UNREAD') return !n.isRead;
    if (selectedFilter === 'TUTOR') return n.category === 'TUTOR' || n.type === 'tutor';
    if (selectedFilter === 'LIBRARY') return n.category === 'LIBRARY' || n.type === 'booking';
    if (selectedFilter === 'PAYMENT') return n.category === 'PAYMENT' || n.type === 'payment';
    if (selectedFilter === 'ATTENDANCE') return n.category === 'ATTENDANCE' || n.type === 'attendance';
    return true;
  });

  const getCategoryIcon = (category?: string, type?: string) => {
    const key = (category || type || '').toUpperCase();
    if (key.includes('PAYMENT') || key.includes('FEE')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
      );
    }
    if (key.includes('TUTOR')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
      );
    }
    if (key.includes('LIBRARY') || key.includes('BOOKING')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
      );
    }
    if (key.includes('ATTENDANCE')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <QrCode className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
        <Bell className="w-5 h-5" />
      </div>
    );
  };

  const getActionDetails = (item: NotificationItem) => {
    const link = item.link || item.actionUrl;
    if (link) {
      if (link.includes('fees')) {
        return { text: 'Pay / View Invoice', to: link };
      }
      if (link.includes('attendance')) {
        return { text: 'Check Attendance Log', to: link };
      }
      if (link.includes('tutor')) {
        return { text: 'Track Request Status', to: link };
      }
      if (link.includes('booking') || link.includes('library')) {
        return { text: 'View Desk Pass', to: link };
      }
      return { text: 'View Details', to: link };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Updates"
        description="Stay informed about home tutor allocations, biometric check-ins, fee invoices, and study desk passes."
        breadcrumbs={[
          { label: 'Student Portal', path: '/student/dashboard' },
          { label: 'Notifications' }
        ]}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllRead}
              className="text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Mark All as Read ({unreadCount})
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-sm font-semibold">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
            selectedFilter === 'ALL'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setSelectedFilter('UNREAD')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            selectedFilter === 'UNREAD'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedFilter('TUTOR')}
          className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
            selectedFilter === 'TUTOR'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Tutors & Matching
        </button>

        <button
          onClick={() => setSelectedFilter('LIBRARY')}
          className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
            selectedFilter === 'LIBRARY'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Library Passes
        </button>

        <button
          onClick={() => setSelectedFilter('PAYMENT')}
          className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
            selectedFilter === 'PAYMENT'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Fee Invoices
        </button>

        <button
          onClick={() => setSelectedFilter('ATTENDANCE')}
          className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
            selectedFilter === 'ATTENDANCE'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Biometrics
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500 mt-3">Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
          <EmptyState
            title={selectedFilter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications Yet'}
            description="You are all caught up! New updates regarding your tutor matching, biometric attendance logs, and fee vouchers will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const action = getActionDetails(item);
            return (
              <Card
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 ${
                  !item.isRead
                    ? 'bg-brand-50/40 border-brand-200/90 shadow-xs'
                    : 'bg-white border-slate-200/80 shadow-xs'
                }`}
              >
                {getCategoryIcon(item.category, item.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-950">{item.title}</h4>
                      {!item.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-brand-600 animate-pulse shrink-0"></span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div>
                      {action ? (
                        <Link
                          to={action.to}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <span>{action.text}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          Official Notification
                        </span>
                      )}
                    </div>

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
