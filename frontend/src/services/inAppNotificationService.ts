// FOCUSPOINT In-App Notification Service
// Reactive in-app notification center handling rich offer cards, deep links, badge counts, and dismiss actions

import { OfferRecommendationItem } from '../types/aiNotification';
import { mockStore } from '../mock/store';

export interface RichInAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  serviceCategory: string;
  discountDisplay?: string;
  couponCode?: string;
  actionLabel: string;
  deepLink: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  recommendationId?: string;
}

const IN_APP_STORAGE_KEY = 'focuspoint_rich_in_app_notifications_v1';

class InAppNotificationService {
  private notifications: RichInAppNotification[] = [];
  private subscribers: Set<(notifications: RichInAppNotification[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(IN_APP_STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch {
      // fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(IN_APP_STORAGE_KEY, JSON.stringify(this.notifications));
    } catch {
      // fallback
    }
    this.notifySubscribers();
  }

  public subscribe(callback: (notifications: RichInAppNotification[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.notifications);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb([...this.notifications]);
      } catch (err) {
        console.error('Subscriber notification error', err);
      }
    });
  }

  /**
   * Retrieves notifications for a user (or all if userId is not specified)
   */
  public getNotifications(userId?: string): RichInAppNotification[] {
    if (!userId) return [...this.notifications];
    return this.notifications.filter(n => n.userId === userId || n.userId === 'ALL');
  }

  /**
   * Calculates unread notification count
   */
  public getUnreadCount(userId?: string): number {
    return this.getNotifications(userId).filter(n => !n.isRead).length;
  }

  /**
   * Converts a matched offer recommendation into an in-app rich notification and persists it
   */
  public dispatchRecommendation(rec: OfferRecommendationItem): RichInAppNotification {
    const newNotif: RichInAppNotification = {
      id: `inapp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId: rec.userId,
      title: rec.headline,
      message: rec.summary,
      serviceCategory: rec.serviceType,
      discountDisplay: rec.discountDisplay !== 'Standard Pricing' ? rec.discountDisplay : undefined,
      couponCode: rec.offerCode,
      actionLabel: rec.actionLabel,
      deepLink: rec.deepLink,
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: rec.expiresAt,
      recommendationId: rec.recommendationId
    };

    // Prepend to top
    this.notifications.unshift(newNotif);

    // Keep capped at 100 recent items
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveToStorage();

    // Also mirror to legacy mockStore for backwards compatibility across existing dashboard modules
    try {
      mockStore.addNotification({
        id: newNotif.id,
        userId: rec.userId,
        title: rec.headline,
        message: rec.summary,
        category: rec.serviceType,
        isRead: false,
        actionUrl: rec.deepLink,
        createdAt: newNotif.createdAt
      });
    } catch {
      // safe fallback
    }

    return newNotif;
  }

  /**
   * Directly creates an in-app rich notification item
   */
  public createNotification(params: {
    userId: string;
    title: string;
    message: string;
    serviceCategory: string;
    deepLink: string;
    actionLabel?: string;
    couponCode?: string;
    discountDisplay?: string;
    priority?: string;
  }): RichInAppNotification {
    const item: RichInAppNotification = {
      id: `inapp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      serviceCategory: params.serviceCategory,
      discountDisplay: params.discountDisplay,
      couponCode: params.couponCode,
      actionLabel: params.actionLabel || 'View Details',
      deepLink: params.deepLink,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(item);
    if (this.notifications.length > 100) this.notifications = this.notifications.slice(0, 100);
    this.saveToStorage();
    return item;
  }

  /**
   * Marks a single notification as read
   */
  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    this.saveToStorage();
    try {
      mockStore.markNotificationAsRead(id);
    } catch {
      // safe fallback
    }
  }

  /**
   * Marks all notifications for a user as read
   */
  public markAllAsRead(userId: string) {
    this.notifications = this.notifications.map(n => 
      (n.userId === userId || n.userId === 'ALL') ? { ...n, isRead: true } : n
    );
    this.saveToStorage();
    try {
      mockStore.markAllNotificationsRead(userId);
    } catch {
      // safe fallback
    }
  }

  /**
   * Dismisses / removes a notification
   */
  public dismissNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
  }

  /**
   * Clears all notifications for testing / reset
   */
  public clearAll() {
    this.notifications = [];
    this.saveToStorage();
  }
}

export const inAppNotificationService = new InAppNotificationService();
