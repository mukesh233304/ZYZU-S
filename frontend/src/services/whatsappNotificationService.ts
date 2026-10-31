// FOCUSPOINT WhatsApp Notification Automation Service
// Provider-agnostic WhatsApp Business gateway abstraction with template rendering, consent verification, and delivery tracking

import { 
  OfferRecommendationItem, 
  NotificationDeliveryStatus, 
  NotificationTemplate,
  AiNotificationServiceCategory
} from '../types/aiNotification';
import { 
  formatWhatsAppPhone, 
  getWhatsAppSendUrl, 
  SYSTEM_WHATSAPP_NUMBER, 
  SYSTEM_WHATSAPP_DISPLAY 
} from './notificationService';
import { notificationPreferenceService } from './notificationPreferenceService';

export interface WhatsAppQueueItem {
  id: string;
  queueId?: string; // Alias for id
  recommendationId?: string;
  userId: string;
  recipientPhone: string;
  recipientName: string;
  templateId: string;
  renderedMessage: string;
  messageBody?: string; // Alias for renderedMessage
  serviceType?: AiNotificationServiceCategory;
  whatsappUrl: string;
  systemNumber: string;
  status: NotificationDeliveryStatus;
  deliveryStatus?: NotificationDeliveryStatus; // Alias for status
  retryCount: number;
  maxRetries: number;
  queuedAt: string;
  createdAt?: string; // Alias for queuedAt
  dispatchedAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  category: 'PROMOTIONAL' | 'TRANSACTIONAL';
  deepLink?: string;
}

const WHATSAPP_QUEUE_STORAGE_KEY = 'focuspoint_whatsapp_delivery_queue_v1';

class WhatsAppNotificationService {
  private queue: WhatsAppQueueItem[] = [];
  private subscribers: Set<(queue: WhatsAppQueueItem[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(WHATSAPP_QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      // fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(WHATSAPP_QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // fallback
    }
    this.notifySubscribers();
  }

  public subscribe(callback: (queue: WhatsAppQueueItem[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.queue);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb([...this.queue]);
      } catch (err) {
        console.error('WhatsApp queue subscriber error', err);
      }
    });
  }

  public getQueue(): WhatsAppQueueItem[] {
    return [...this.queue];
  }

  /**
   * Evaluates and queues a personalized offer recommendation for WhatsApp delivery
   */
  public async queueOfferRecommendation(
    recommendation: OfferRecommendationItem,
    template?: NotificationTemplate
  ): Promise<{ success: boolean; queueItem?: WhatsAppQueueItem; status: NotificationDeliveryStatus; reason?: string }> {
    const { userId, userPhone, userName, whatsappMessage, serviceType } = recommendation;

    // 1. Validate phone number presence
    if (!userPhone) {
      return { 
        success: false, 
        status: 'SKIPPED', 
        reason: 'SKIPPED_NO_PHONE: Recipient has no registered WhatsApp phone number' 
      };
    }

    // 2. Validate strict consent, quiet hours & frequency limits
    const eligibility = notificationPreferenceService.evaluateEligibility(userId, 'WHATSAPP', serviceType);
    if (!eligibility.eligible) {
      return {
        success: false,
        status: 'SUPPRESSED',
        reason: eligibility.reason
      };
    }

    // 3. Format phone and render message
    const formattedPhone = formatWhatsAppPhone(userPhone);
    const messageBody = whatsappMessage || this.renderDefaultTemplate(recommendation, template);
    const waUrl = getWhatsAppSendUrl(formattedPhone, messageBody);

    const nowIso = new Date().toISOString();
    const qId = `wa-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const queueItem: WhatsAppQueueItem = {
      id: qId,
      queueId: qId,
      recommendationId: recommendation.recommendationId,
      userId,
      recipientPhone: formattedPhone,
      recipientName: userName || 'FocusPoint Learner',
      templateId: template?.templateId || 'tpl-offer-auto',
      renderedMessage: messageBody,
      messageBody: messageBody,
      serviceType: serviceType,
      whatsappUrl: waUrl,
      systemNumber: SYSTEM_WHATSAPP_NUMBER,
      status: 'QUEUED',
      deliveryStatus: 'QUEUED',
      retryCount: 0,
      maxRetries: 3,
      queuedAt: nowIso,
      createdAt: nowIso,
      category: 'PROMOTIONAL',
      deepLink: recommendation.deepLink
    };

    this.queue.unshift(queueItem);
    this.saveToStorage();

    // 4. Record dispatch in user frequency ledger
    notificationPreferenceService.recordDispatch(userId, 'WHATSAPP', serviceType);

    // 5. Asynchronous simulated gateway dispatch (fail-safe and non-blocking)
    this.processQueueItemAsync(queueItem.id);

    return {
      success: true,
      queueItem,
      status: 'QUEUED'
    };
  }

  /**
   * Directly queues a WhatsApp notification message with phone formatting and bounds check
   */
  public async queueWhatsAppMessage(params: {
    userId: string;
    recipientPhone: string;
    templateId: string;
    serviceCategory: any;
    parameters?: Record<string, string>;
    deepLink?: string;
    category?: 'PROMOTIONAL' | 'TRANSACTIONAL';
  }): Promise<{ success: boolean; queueId?: string; deliveryStatus: NotificationDeliveryStatus; errorMessage?: string }> {
    if (!params.recipientPhone || params.recipientPhone.trim().length < 10) {
      return {
        success: false,
        deliveryStatus: 'FAILED',
        errorMessage: 'INVALID_PHONE: Recipient phone number is missing or invalid'
      };
    }

    const formattedPhone = formatWhatsAppPhone(params.recipientPhone);
    const body = `Hi ${params.parameters?.first_name || 'there'}! Explore offers: ${params.deepLink || 'https://focuspoint.in'}`;
    const waUrl = getWhatsAppSendUrl(formattedPhone, body);

    const nowIso = new Date().toISOString();
    const qId = `wa-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const queueItem: WhatsAppQueueItem = {
      id: qId,
      queueId: qId,
      userId: params.userId,
      recipientPhone: formattedPhone,
      recipientName: params.parameters?.first_name || 'FocusPoint Learner',
      templateId: params.templateId,
      renderedMessage: body,
      whatsappUrl: waUrl,
      systemNumber: SYSTEM_WHATSAPP_NUMBER,
      status: 'QUEUED',
      deliveryStatus: 'QUEUED',
      retryCount: 0,
      maxRetries: 3,
      queuedAt: nowIso,
      createdAt: nowIso,
      category: params.category || 'PROMOTIONAL',
      deepLink: params.deepLink
    };

    this.queue.unshift(queueItem);
    this.saveToStorage();

    this.processQueueItemAsync(queueItem.id);

    return {
      success: true,
      queueId: queueItem.id,
      deliveryStatus: 'QUEUED'
    };
  }

  /**
   * Non-blocking asynchronous processor simulating gateway handshake & delivery
   */
  private async processQueueItemAsync(queueId: string) {
    const item = this.queue.find(q => q.id === queueId);
    if (!item) return;

    // Transition to PROCESSING -> SENT -> DELIVERED
    item.status = 'PROCESSING';
    item.deliveryStatus = 'PROCESSING';
    item.dispatchedAt = new Date().toISOString();
    this.saveToStorage();

    // Simulate reliable telecom transport
    setTimeout(() => {
      const liveItem = this.queue.find(q => q.id === queueId);
      if (!liveItem) return;

      // Check if phone ends in 0000 to test failure simulation accurately
      if (liveItem.recipientPhone.endsWith('0000')) {
        liveItem.status = 'FAILED';
        liveItem.deliveryStatus = 'FAILED';
        liveItem.failedAt = new Date().toISOString();
        liveItem.failureReason = 'TELECOM_CARRIER_TIMEOUT: Recipient unreachable or handset off';
      } else {
        liveItem.status = 'DELIVERED';
        liveItem.deliveryStatus = 'DELIVERED';
        liveItem.deliveredAt = new Date().toISOString();
      }
      this.saveToStorage();
    }, 120);
  }

  /**
   * Retries an eligible failed item in the delivery queue
   */
  public retryFailedItem(queueId: string): boolean {
    const item = this.queue.find(q => q.id === queueId);
    if (!item || item.status !== 'FAILED') return false;

    item.retryCount += 1;
    item.status = 'RETRYING';
    item.failureReason = undefined;
    this.saveToStorage();

    setTimeout(() => {
      item.status = 'DELIVERED';
      item.deliveredAt = new Date().toISOString();
      this.saveToStorage();
    }, 150);

    return true;
  }

  /**
   * Renders fallback template with placeholders
   */
  private renderDefaultTemplate(rec: OfferRecommendationItem, tpl?: NotificationTemplate): string {
    const name = rec.userName || 'Student';
    const locality = rec.localityName || rec.districtName || 'your area';
    const link = `https://focuspoint.app${rec.deepLink}`;

    if (tpl?.bodyTemplate) {
      return tpl.bodyTemplate
        .replace(/\{\{first_name\}\}/g, name)
        .replace(/\{\{locality\}\}/g, locality)
        .replace(/\{\{district\}\}/g, rec.districtName)
        .replace(/\{\{offer_title\}\}/g, rec.offerTitle)
        .replace(/\{\{discount\}\}/g, rec.discountDisplay)
        .replace(/\{\{deep_link\}\}/g, link);
    }

    return `Hi ${name}! 👋\n\nLooking for educational services near ${locality}?\n\nFocusPoint matched a verified recommendation: *${rec.offerTitle}* (${rec.discountDisplay}).\n\nExplore now: ${link}\n\nReply STOP to opt out.`;
  }
}

export const whatsappNotificationService = new WhatsAppNotificationService();
