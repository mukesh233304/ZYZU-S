// FOCUSPOINT User Notification & Privacy Consent Preferences Modal
// Complies with strict opt-in WhatsApp marketing rules, quiet hours, and frequency limits

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Smartphone, Bell, Moon, 
  Clock, CheckCircle2, AlertTriangle, Sliders, Check 
} from 'lucide-react';
import { notificationPreferenceService } from '../../services/notificationPreferenceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserNotificationPreference, AiNotificationServiceCategory } from '../../types/aiNotification';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || 'guest-visitor';

  const [prefs, setPrefs] = useState<UserNotificationPreference>(() => 
    notificationPreferenceService.getPreferences(userId)
  );

  useEffect(() => {
    if (isOpen) {
      setPrefs(notificationPreferenceService.getPreferences(userId));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSave = () => {
    notificationPreferenceService.updatePreferences(userId, prefs);
    showToast('Notification and privacy preferences saved successfully', 'success');
    onClose();
  };

  const handleCompleteOptOut = () => {
    const updated = notificationPreferenceService.optOutUser(userId);
    setPrefs(updated);
    showToast('You have opted out of all promotional communications.', 'info');
  };

  const toggleCategory = (cat: AiNotificationServiceCategory) => {
    const current = prefs.optedOutCategories || [];
    const next = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    setPrefs({ ...prefs, optedOutCategories: next });
  };

  const CATEGORIES: { id: AiNotificationServiceCategory; label: string; desc: string }[] = [
    { id: 'LIBRARY', label: 'Digital Study Libraries', desc: 'Concession desk passes and local library openings' },
    { id: 'HOME_TUITION', label: 'Home Tutors & Faculty', desc: 'Subject-specific educator offers in your area' },
    { id: 'MOCK_TEST', label: 'Government & Entrance Mock Tests', desc: 'Bilingual test series, CHS, Navodaya & state exams' },
    { id: 'STUDY_MATERIAL', label: 'Study Materials & Solved Books', desc: 'Revision mind maps, formula packs and topper notes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Notification & Consent Preferences</h3>
              <p className="text-xs text-slate-400">Manage communication channels, WhatsApp opt-in & quiet hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Section 1: WhatsApp Promotional Consent */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">WhatsApp Promotional Offers</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Receive verified discount codes and area-specific library or tutor recommendations on WhatsApp.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={prefs.whatsappPromotionalConsent}
                  onChange={(e) => setPrefs({ ...prefs, whatsappPromotionalConsent: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Promise:</strong> Transactional alerts (attendance, payments, registration confirmations) are unaffected. We never share your phone number with 3rd-party advertisers.
              </span>
            </div>
          </div>

          {/* Section 2: In-App Recommendations */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-brand-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">In-App Offer Recommendations</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Show relevant offers and local study opportunities inside your ZYZU'S notification bell.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={prefs.inAppPromotionalConsent}
                  onChange={(e) => setPrefs({ ...prefs, inAppPromotionalConsent: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
              </label>
            </div>
          </div>

          {/* Section 3: Quiet Hours */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Quiet Hours (Do Not Disturb)</h4>
                  <p className="text-xs text-slate-400">Mute all promotional delivery during your rest hours.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.quietHoursEnabled}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
              </label>
            </div>

            {prefs.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">From:</label>
                  <input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Until:</label>
                  <input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Service Category Subscriptions */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              Service Category Preferences
            </h4>
            <div className="space-y-2">
              {CATEGORIES.map(cat => {
                const isExcluded = (prefs.optedOutCategories || []).includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      !isExcluded
                        ? 'bg-slate-800/80 border-slate-700 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-70'
                    }`}
                  >
                    <div>
                      <strong className="text-xs font-bold block">{cat.label}</strong>
                      <span className="text-[11px] text-slate-400">{cat.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      !isExcluded ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700'
                    }`}>
                      {!isExcluded && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Opt-out link */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Want to silence all promotional notifications?</span>
            <button
              onClick={handleCompleteOptOut}
              className="text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
            >
              Opt Out of All Marketing
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
