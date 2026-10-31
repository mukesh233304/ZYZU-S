import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { libraryService } from '../../services/libraryService';
import { NotificationItem, Library, LibraryNotificationSettings } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/FeedbackStates';
import { 
  Bell, CheckCheck, Armchair, AlertCircle, Info, 
  DollarSign, Settings, Clock, CheckCircle2, ShieldCheck,
  Send, MessageSquare
} from 'lucide-react';

export const LibraryNotifications: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'payment' | 'expiry' | 'admin'>('all');

  // Notification Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<LibraryNotificationSettings>({
    whatsappOnExpiry3Days: true,
    whatsappOnExpired: true,
    whatsappOnPaymentReceipt: true,
    whatsappOnBookingConfirmation: true,
    inAppAlerts: true,
    dailyAttendanceSummary: true,
    settlementAlerts: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const libs = await libraryService.getLibrariesByOwner(user.id);
        if (libs.length > 0) {
          const activeLib = libs[0];
          setLibrary(activeLib);
          const [notifs, notifSettings] = await Promise.all([
            notificationService.getNotifications(user.id),
            libraryService.getNotificationSettings(activeLib.id)
          ]);
          setNotifications(notifs);
          if (notifSettings) {
            setSettings(notifSettings);
          }
        } else {
          const notifs = await notificationService.getNotifications(user.id);
          setNotifications(notifs);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleSaveSettings = async () => {
    if (!library) return;
    setSavingSettings(true);
    try {
      const updated = await libraryService.updateNotificationSettings(library.id, settings);
      setSettings(updated);
      setIsSettingsOpen(false);
      addToast('Notification preferences & WhatsApp triggers saved!', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendWhatsAppNotification = (item: NotificationItem) => {
    const libName = library?.name || 'FOCUSPOINT Study Library';
    const text = `*${libName} Notification Alert*\n\n${item.title}\n${item.message}\n\nFor queries, contact the library desk.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    addToast('Opening WhatsApp to share notification update', 'info');
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    const cat = (n.category || '').toUpperCase();
    const type = (n.type || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    const title = (n.title || '').toLowerCase();

    if (filter === 'booking') return cat === 'BOOKING' || type === 'booking' || msg.includes('book') || title.includes('book');
    if (filter === 'payment') return cat === 'PAYMENT' || type === 'payment' || msg.includes('fee') || msg.includes('payment') || title.includes('fee');
    if (filter === 'expiry') return cat === 'EXPIRY' || msg.includes('expir') || title.includes('expir') || msg.includes('due');
    if (filter === 'admin') return cat === 'ADMIN' || cat === 'APPROVAL' || type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Notifications & Alerts"
        subtitle="Live notifications for desk bookings, upcoming expiry, fee receipts, and automated WhatsApp triggers"
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Notifications' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => setIsSettingsOpen(true)}
            >
              Automation Settings
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCheck className="w-4 h-4" />}
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-royal-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            filter === 'unread'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              filter === 'unread' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('booking')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'booking'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Desk Bookings
        </button>
        <button
          onClick={() => setFilter('payment')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'payment'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Fee Collections
        </button>
        <button
          onClick={() => setFilter('expiry')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'expiry'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Expiry & Dues
        </button>
        <button
          onClick={() => setFilter('admin')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'admin'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          District & System
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread alerts' : 'No notifications in this category'}
            description="You are all caught up with seat bookings, membership dues, and operational notifications."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isBooking = item.type === 'booking' || (item.category || '').toUpperCase() === 'BOOKING';
            const isPayment = item.type === 'payment' || (item.category || '').toUpperCase() === 'PAYMENT';
            const isExpiry = (item.title || '').toLowerCase().includes('expir') || (item.message || '').toLowerCase().includes('expir');

            return (
              <Card
                key={item.id}
                className={`p-4 transition-all duration-200 flex items-start gap-4 ${
                  !item.isRead ? 'bg-royal-blue-50/40 border-royal-blue-200' : 'bg-white'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-100/80 shrink-0 mt-0.5">
                  {isBooking ? (
                    <Armchair className="w-5 h-5 text-emerald-600" />
                  ) : isPayment ? (
                    <DollarSign className="w-5 h-5 text-royal-blue-600" />
                  ) : isExpiry ? (
                    <Clock className="w-5 h-5 text-red-500" />
                  ) : (
                    <Info className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    {item.actionUrl && (
                      <a
                        href={item.actionUrl}
                        className="text-xs font-bold text-royal-blue-600 hover:text-royal-blue-700 hover:underline"
                      >
                        View Details &rarr;
                      </a>
                    )}
                    <button
                      onClick={() => handleSendWhatsAppNotification(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                      title="Share alert on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp Share
                    </button>
                  </div>
                </div>
                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Mark as read"
                    className="shrink-0 text-slate-400 hover:text-royal-blue-600"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Notification & WhatsApp Automation Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Notification & WhatsApp Automation Settings"
        size="md"
      >
        <div className="space-y-4 font-sans text-xs text-slate-700">
          <p className="text-slate-500">
            Configure automatic WhatsApp alerts and in-app triggers for your student study hall.
          </p>

          <div className="space-y-3 divide-y divide-slate-100 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            {/* Setting 1 */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-slate-900 block text-sm">3 Days Pre-Expiry Alert</span>
                <span className="text-slate-500 text-[11px]">Send automated WhatsApp renewal reminder 3 days before desk expiry</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappOnExpiry3Days}
                onChange={(e) => setSettings({ ...settings, whatsappOnExpiry3Days: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            {/* Setting 2 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block text-sm">Expiry / Overdue Alert</span>
                <span className="text-slate-500 text-[11px]">Instant WhatsApp reminder when a study desk pass expires</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappOnExpired}
                onChange={(e) => setSettings({ ...settings, whatsappOnExpired: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            {/* Setting 3 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block text-sm">Digital Payment Receipts</span>
                <span className="text-slate-500 text-[11px]">Automatically dispatch digital receipt via WhatsApp upon fee collection</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappOnPaymentReceipt}
                onChange={(e) => setSettings({ ...settings, whatsappOnPaymentReceipt: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            {/* Setting 4 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block text-sm">Booking Confirmation Pass</span>
                <span className="text-slate-500 text-[11px]">Send confirmed study hall admission pass link to student on approval</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappOnBookingConfirmation}
                onChange={(e) => setSettings({ ...settings, whatsappOnBookingConfirmation: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            {/* Setting 5 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block text-sm">In-App Dashboard Alerts</span>
                <span className="text-slate-500 text-[11px]">Real-time bell notification badges on owner dashboard</span>
              </div>
              <input
                type="checkbox"
                checked={settings.inAppAlerts}
                onChange={(e) => setSettings({ ...settings, inAppAlerts: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            {/* Setting 6 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block text-sm">Bi-Weekly Settlement Payout Alerts</span>
                <span className="text-slate-500 text-[11px]">Notify when automated bank NEFT disbursements are processed</span>
              </div>
              <input
                type="checkbox"
                checked={settings.settlementAlerts}
                onChange={(e) => setSettings({ ...settings, settlementAlerts: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={savingSettings} onClick={handleSaveSettings}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
