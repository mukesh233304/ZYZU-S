// FOCUSPOINT In-App Notification Center Drawer
// Displays personalized offer recommendations, deep links, coupon codes, and real-time category filters

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, X, CheckCheck, BookOpen, GraduationCap, 
  Sparkles, Tag, ArrowUpRight, Copy, Check, Clock, 
  ShieldCheck, Trash2, Filter, Settings, ExternalLink,
  BookMarked, FileText
} from 'lucide-react';
import { inAppNotificationService, RichInAppNotification } from '../../services/inAppNotificationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface InAppNotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreferences?: () => void;
}

export const InAppNotificationCenterDrawer: React.FC<InAppNotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPreferences
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<RichInAppNotification[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = inAppNotificationService.subscribe((list) => {
      if (user?.id) {
        setNotifications(list.filter(n => n.userId === user.id || n.userId === 'ALL' || n.userId === 'guest-visitor'));
      } else {
        setNotifications(list);
      }
    });
    return unsubscribe;
  }, [user]);

  if (!isOpen) return null;

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleMarkAsRead = (id: string) => {
    inAppNotificationService.markAsRead(id);
  };

  const handleMarkAllRead = () => {
    if (user?.id) {
      inAppNotificationService.markAllAsRead(user.id);
    } else {
      inAppNotificationService.markAllAsRead('guest-visitor');
    }
    showToast('All notifications marked as read', 'info');
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    inAppNotificationService.dismissNotification(id);
  };

  const handleActionClick = (notif: RichInAppNotification) => {
    inAppNotificationService.markAsRead(notif.id);
    onClose();
    if (notif.deepLink) {
      navigate(notif.deepLink);
    }
  };

  const filtered = notifications.filter(n => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'OFFERS') return Boolean(n.discountDisplay || n.couponCode);
    return n.serviceCategory === categoryFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getServiceBadgeColor = (cat: string) => {
    switch (cat) {
      case 'LIBRARY': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'HOME_TUITION': return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
      case 'MOCK_TEST': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'STUDY_MATERIAL': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'TEACHER_APPLICATION': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'LIBRARY_LISTING': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getServiceIcon = (cat: string) => {
    switch (cat) {
      case 'LIBRARY': return <BookMarked className="w-4 h-4 text-amber-400" />;
      case 'HOME_TUITION': return <GraduationCap className="w-4 h-4 text-brand-400" />;
      case 'MOCK_TEST': return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'STUDY_MATERIAL': return <BookOpen className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md sm:max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Notification Center</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white shadow-xs">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Personalized offers & service recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenPreferences && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPreferences();
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notification & WhatsApp Preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions & Category Filter Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Showing {filtered.length} {filtered.length === 1 ? 'notification' : 'notifications'}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'OFFERS', label: 'Special Offers' },
              { id: 'LIBRARY', label: 'Libraries' },
              { id: 'HOME_TUITION', label: 'Tutors' },
              { id: 'MOCK_TEST', label: 'Mock Tests' },
              { id: 'STUDY_MATERIAL', label: 'Materials' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No Notifications</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                As you search for study libraries, home tutors, or exam materials, your personalized recommendations will appear here.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                  !item.isRead
                    ? 'bg-slate-800/90 border-brand-500/50 shadow-md ring-1 ring-brand-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Header row: badge + service + dismiss */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getServiceBadgeColor(item.serviceCategory)}`}>
                      {getServiceIcon(item.serviceCategory)}
                      <span>{item.serviceCategory.replace('_', ' ')}</span>
                    </span>

                    {item.discountDisplay && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-xs">
                        <Tag className="w-3 h-3 text-emerald-400" />
                        <span>{item.discountDisplay}</span>
                      </span>
                    )}

                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDismiss(item.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors opacity-60 group-hover:opacity-100"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title and summary */}
                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {item.message}
                </p>

                {/* Coupon Code Pill if present */}
                {item.couponCode && (
                  <div className="mb-3 p-2 rounded-lg bg-slate-950 border border-dashed border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Coupon:</span>
                      <strong className="text-emerald-400 font-black">{item.couponCode}</strong>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCoupon(item.couponCode!);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      {copiedCoupon === item.couponCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={() => handleActionClick(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <span>{item.actionLabel || 'Explore Offer'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info & Privacy Link */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">Zero spam • Verified platform offers</span>
          </div>

          {onOpenPreferences && (
            <button
              onClick={() => {
                onClose();
                onOpenPreferences();
              }}
              className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold cursor-pointer underline"
            >
              Consent & WhatsApp Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
