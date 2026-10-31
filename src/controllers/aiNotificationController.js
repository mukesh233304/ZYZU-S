const aiNotificationAgentService = require('../services/aiNotificationAgentService');
const inAppNotificationService = require('../services/inAppNotificationService');
const notificationPreferenceService = require('../services/notificationPreferenceService');
const offerRecommendationService = require('../services/offerRecommendationService');

class AiNotificationController {
  /**
   * Log user activity event (search, application, etc.) and trigger AI recommendation
   */
  async logActivityEvent(req, res, next) {
    try {
      const userId = req.user ? req.user.id : (req.body.userId || null);
      const userName = req.user ? req.user.name : (req.body.userName || '');
      const userPhone = req.user ? req.user.mobile : (req.body.userPhone || '');

      const result = await aiNotificationAgentService.processUserActivityEvent({
        ...req.body,
        userId,
        userName,
        userPhone
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Query matching recommendations directly
   */
  async getRecommendations(req, res, next) {
    try {
      const { serviceCategory, districtName, localityName, searchQuery, classLevel, subject, examCategory } = req.query;

      if (!serviceCategory) {
        return res.status(400).json({
          success: false,
          message: 'serviceCategory is required'
        });
      }

      const recs = offerRecommendationService.getRecommendations({
        serviceCategory,
        districtName,
        localityName,
        searchQuery,
        classLevel,
        subject,
        examCategory
      });

      return res.status(200).json({
        success: true,
        data: recs
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * In-App Notifications for authenticated user
   */
  async getUserInAppNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { serviceCategory, unreadOnly, limit, offset } = req.query;

      const notifications = inAppNotificationService.getUserNotifications(userId, {
        serviceCategory,
        unreadOnly: unreadOnly === 'true',
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      });

      const unreadCount = inAppNotificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark single in-app notification read
   */
  async markNotificationRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const marked = inAppNotificationService.markAsRead(id, userId);
      return res.status(200).json({
        success: true,
        marked
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark all user in-app notifications read
   */
  async markAllNotificationsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const count = inAppNotificationService.markAllAsRead(userId);
      return res.status(200).json({
        success: true,
        markedCount: count
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get user communication preferences & consent
   */
  async getUserPreferences(req, res, next) {
    try {
      const userId = req.user ? req.user.id : req.query.userId;
      const prefs = notificationPreferenceService.getPreferences(userId);
      return res.status(200).json({
        success: true,
        data: prefs
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user communication preferences
   */
  async updateUserPreferences(req, res, next) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      const updated = notificationPreferenceService.updatePreferences(userId, req.body);
      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Track offer click
   */
  async trackClick(req, res, next) {
    try {
      const { recommendationId } = req.body;
      const tracked = aiNotificationAgentService.trackOfferClick(recommendationId);
      return res.status(200).json({ success: true, tracked });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Track conversion
   */
  async trackConversion(req, res, next) {
    try {
      const { recommendationId } = req.body;
      const converted = aiNotificationAgentService.trackConversion(recommendationId);
      return res.status(200).json({ success: true, converted });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin Automation Config
   */
  async getAdminConfig(req, res, next) {
    try {
      const config = aiNotificationAgentService.getAutomationConfig();
      return res.status(200).json({ success: true, data: config });
    } catch (err) {
      next(err);
    }
  }

  async updateAdminConfig(req, res, next) {
    try {
      const admin = {
        id: req.user ? req.user.id : 'super-admin',
        name: req.user ? req.user.name : 'Super Admin',
        role: req.user ? req.user.role : 'SUPER_ADMIN'
      };

      const updated = aiNotificationAgentService.updateAutomationConfig(req.body, admin);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin Audit Logs
   */
  async getAdminAuditLogs(req, res, next) {
    try {
      const { category, limit, offset } = req.query;
      const logs = aiNotificationAgentService.getAuditLogs({
        category,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      });
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin Delivery Status Queue
   */
  async getAdminDeliveryQueue(req, res, next) {
    try {
      const { status, limit, offset } = req.query;
      const queue = aiNotificationAgentService.getDeliveryQueue({
        status,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      });
      return res.status(200).json({ success: true, data: queue });
    } catch (err) {
      next(err);
    }
  }

  async retryAdminDelivery(req, res, next) {
    try {
      const { id } = req.params;
      const retried = aiNotificationAgentService.retryDelivery(id);
      return res.status(200).json({ success: true, retried });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin Analytics Summary
   */
  async getAdminAnalytics(req, res, next) {
    try {
      const stats = aiNotificationAgentService.getAnalyticsSummary();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Meta WhatsApp Cloud API Webhook Verification (GET)
   */
  verifyWhatsAppWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'focuspoint_wa_verify_token_2026';

    if (mode === 'subscribe' && token === expectedToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Forbidden: Invalid verify token' });
  }

  /**
   * Meta WhatsApp Cloud API Webhook Event Receiver (POST)
   */
  async handleWhatsAppWebhook(req, res, next) {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              const value = change.value;
              if (!value) continue;

              // 1. Process Delivery Status Receipts
              if (Array.isArray(value.statuses)) {
                for (const st of value.statuses) {
                  aiNotificationAgentService.handleDeliveryStatusReceipt({
                    providerMessageId: st.id,
                    status: st.status,
                    timestamp: st.timestamp ? new Date(Number(st.timestamp) * 1000).toISOString() : new Date().toISOString(),
                    failureReason: st.errors ? JSON.stringify(st.errors) : null
                  });
                }
              }

              // 2. Process Inbound Messages (e.g. STOP / START)
              if (Array.isArray(value.messages)) {
                for (const msg of value.messages) {
                  if (msg.type === 'text' && msg.text && msg.text.body) {
                    aiNotificationAgentService.handleInboundWhatsAppMessage({
                      from: msg.from,
                      text: msg.text.body,
                      messageId: msg.id,
                      timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString()
                    });
                  }
                }
              }
            }
          }
        }
      }

      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Interactive Simulator: Simulate an inbound WhatsApp message directly
   */
  async simulateInboundWhatsApp(req, res, next) {
    try {
      const { phone, text } = req.body;
      if (!phone || !text) {
        return res.status(400).json({ success: false, message: 'phone and text are required' });
      }

      const result = aiNotificationAgentService.handleInboundWhatsAppMessage({
        from: phone,
        text,
        messageId: `sim-inbound-${Date.now()}`
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AiNotificationController();
