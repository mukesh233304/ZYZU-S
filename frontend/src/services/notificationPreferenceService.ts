// FOCUSPOINT User Notification Consent & Preference Service
// Manages privacy-conscious preferences, WhatsApp promotional consent, and quiet hours enforcement

import { UserNotificationPreference, AiNotificationServiceCategory, NotificationChannel } from '../types/aiNotification';

const PREFERENCES_STORAGE_KEY = 'focuspoint_user_notification_preferences_v1';

const DEFAULT_PREFERENCES: Omit<UserNotificationPreference, 'userId' | 'updatedAt'> = {
  whatsappPromotionalConsent: false, // Strict opt-in: no unsolicited promotional WhatsApp
  inAppPromotionalConsent: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00', // 10:00 PM
  quietHoursEnd: '08:00',   // 08:00 AM
  maxPromotionsPerDay: 2,
  maxPromotionsPerWeek: 5,
  cooldownHours: 4,
  optedOutCategories: [],
};

class NotificationPreferenceService {
  private preferencesMap: Map<string, UserNotificationPreference> = new Map();
  private userSentHistory: Map<string, { channel: NotificationChannel; timestamp: number; serviceType: AiNotificationServiceCategory }[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserNotificationPreference[];
        parsed.forEach(p => this.preferencesMap.set(p.userId, p));
      }
    } catch {
      // Ignore storage errors in test or SSR environments
    }
  }

  private saveToStorage() {
    try {
      const list = Array.from(this.preferencesMap.values());
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Retrieves user notification preferences or creates safe default profile
   */
  public getPreferences(userId: string): UserNotificationPreference {
    const existing = this.preferencesMap.get(userId);
    if (existing) return existing;

    const defaultProfile: UserNotificationPreference = {
      userId,
      ...DEFAULT_PREFERENCES,
      updatedAt: new Date().toISOString(),
    };
    this.preferencesMap.set(userId, defaultProfile);
    this.saveToStorage();
    return defaultProfile;
  }

  /**
   * Updates user notification consent and channel configurations
   */
  public updatePreferences(userId: string, updates: Partial<UserNotificationPreference>): UserNotificationPreference {
    const current = this.getPreferences(userId);
    const updated: UserNotificationPreference = {
      ...current,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.preferencesMap.set(userId, updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Directly sets WhatsApp promotional marketing consent
   */
  public setWhatsAppPromotionalConsent(userId: string, consent: boolean): UserNotificationPreference {
    return this.updatePreferences(userId, { whatsappPromotionalConsent: consent });
  }

  /**
   * Complete opt-out of all marketing communications
   */
  public optOutUser(userId: string): UserNotificationPreference {
    return this.updatePreferences(userId, {
      whatsappPromotionalConsent: false,
      inAppPromotionalConsent: false,
      optedOutAt: new Date().toISOString(),
    });
  }

  /**
   * Checks whether the current time falls inside the user's quiet hours
   */
  public isCurrentlyInQuietHours(userId: string): boolean {
    const prefs = this.getPreferences(userId);
    if (!prefs.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

    const startMinutes = (startH || 22) * 60 + (startM || 0);
    const endMinutes = (endH || 8) * 60 + (endM || 0);

    if (startMinutes > endMinutes) {
      // Over midnight: e.g. 22:00 to 08:00
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Same day quiet hours: e.g. 13:00 to 15:00
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Records a notification dispatch for user frequency calculation
   */
  public recordDispatch(userId: string, channel: NotificationChannel, serviceType: AiNotificationServiceCategory) {
    const history = this.userSentHistory.get(userId) || [];
    history.push({
      channel,
      timestamp: Date.now(),
      serviceType,
    });
    this.userSentHistory.set(userId, history);
  }

  public canDeliverPromotionalNotification(
    userId: string,
    channel: NotificationChannel = 'WHATSAPP',
    serviceType: AiNotificationServiceCategory = 'LIBRARY'
  ): { canDeliver: boolean; reason?: string } {
    const res = this.evaluateEligibility(userId, channel, serviceType);
    return {
      canDeliver: res.eligible,
      reason: res.reason
    };
  }

  /**
   * Validates whether a user can receive a notification considering consent, frequency caps, quiet hours and cooldowns
   */
  public evaluateEligibility(
    userId: string,
    channel: NotificationChannel,
    serviceType: AiNotificationServiceCategory
  ): { eligible: boolean; reason?: string } {
    const prefs = this.getPreferences(userId);

    // 1. Channel Consent Enforcement
    if (channel === 'WHATSAPP' && !prefs.whatsappPromotionalConsent) {
      return { eligible: false, reason: 'SUPPRESSED_CONSENT_MISSING: User has not opted into promotional WhatsApp alerts' };
    }

    if (channel === 'IN_APP' && !prefs.inAppPromotionalConsent) {
      return { eligible: false, reason: 'SUPPRESSED_CONSENT_MISSING: User has disabled in-app promotional recommendations' };
    }

    // 2. Category Opt-Out Check
    if (prefs.optedOutCategories && prefs.optedOutCategories.includes(serviceType)) {
      return { eligible: false, reason: `SUPPRESSED_CATEGORY_OPTOUT: User opted out of ${serviceType} notifications` };
    }

    // 3. Quiet Hours Check
    if (this.isCurrentlyInQuietHours(userId)) {
      return { eligible: false, reason: 'SUPPRESSED_QUIET_HOURS: Current time is within user quiet hours window' };
    }

    // 4. Frequency Caps Evaluation
    const history = this.userSentHistory.get(userId) || [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cooldownPeriod = Date.now() - prefs.cooldownHours * 60 * 60 * 1000;

    const sendsLast24h = history.filter(h => h.timestamp >= oneDayAgo).length;
    if (sendsLast24h >= prefs.maxPromotionsPerDay) {
      return { eligible: false, reason: `SUPPRESSED_DAILY_LIMIT: User reached daily cap of ${prefs.maxPromotionsPerDay} promotions` };
    }

    const sendsLast7d = history.filter(h => h.timestamp >= oneWeekAgo).length;
    if (sendsLast7d >= prefs.maxPromotionsPerWeek) {
      return { eligible: false, reason: `SUPPRESSED_WEEKLY_LIMIT: User reached weekly cap of ${prefs.maxPromotionsPerWeek} promotions` };
    }

    // 5. Same-service Cooldown Check
    const recentSameService = history.filter(h => h.serviceType === serviceType && h.timestamp >= cooldownPeriod);
    if (recentSameService.length > 0) {
      return { eligible: false, reason: `SUPPRESSED_COOLDOWN: Cooldown active for ${serviceType} within ${prefs.cooldownHours}h` };
    }

    return { eligible: true };
  }
}

export const notificationPreferenceService = new NotificationPreferenceService();
