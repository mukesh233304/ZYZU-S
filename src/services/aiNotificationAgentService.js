const db = require('../db/database');
const crypto = require('crypto');
const offerRecommendationService = require('./offerRecommendationService');
const inAppNotificationService = require('./inAppNotificationService');
const notificationPreferenceService = require('./notificationPreferenceService');

class AiNotificationAgentService {
  constructor() {
    this.DEFAULT_CONFIG = {
      globalAutomationEnabled: true,
      whatsAppChannelEnabled: true,
      inAppChannelEnabled: true,
      enabledCategories: [
        'LIBRARY',
        'HOME_TUITION',
        'TEACHER_APPLICATION',
        'LIBRARY_LISTING',
        'MOCK_TEST',
        'STUDY_MATERIAL'
      ],
      cooldownMinutes: 10,
      dailyFrequencyCap: 2,
      weeklyFrequencyCap: 5,
      quietHoursStart: '21:00',
      quietHoursEnd: '09:00'
    };
  }

  /**
   * Retrieves automation configuration from database or defaults
   */
  getAutomationConfig() {
    const row = db.prepare('SELECT value_json FROM ai_automation_configs WHERE key = ?').get('global_settings');
    if (!row) {
      return { ...this.DEFAULT_CONFIG };
    }
    try {
      return { ...this.DEFAULT_CONFIG, ...JSON.parse(row.value_json) };
    } catch (e) {
      return { ...this.DEFAULT_CONFIG };
    }
  }

  /**
   * Updates automation configuration and logs an audit record
   */
  updateAutomationConfig(newConfig, admin = { id: 'admin', name: 'Super Admin', role: 'SUPER_ADMIN' }) {
    const current = this.getAutomationConfig();
    const merged = { ...current, ...newConfig };

    const stmt = db.prepare(`
      INSERT INTO ai_automation_configs (key, value_json, updated_by, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_by = excluded.updated_by,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run('global_settings', JSON.stringify(merged), admin.name);

    this.logAudit({
      action: 'UPDATE_AUTOMATION_CONFIG',
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      category: 'CONFIG_CHANGE',
      details: 'Updated global automation settings and channel killswitches',
      payloadSnapshot: newConfig
    });

    return merged;
  }

  /**
   * Process a user activity event:
   * 1. Validate payload
   * 2. Deduplicate identical events in cooldown window
   * 3. Match eligible offers
   * 4. Check consent and quiet hours
   * 5. Dispatch In-App & WhatsApp notifications
   * 6. Log audit records
   */
  async processUserActivityEvent(eventData) {
    const config = this.getAutomationConfig();
    const eventId = `evt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const {
      userId = null,
      userName = '',
      userPhone = '',
      sessionId = `sess-${Date.now()}`,
      eventType,
      serviceCategory,
      stateName = 'Uttar Pradesh',
      districtName = 'Ghazipur',
      localityName = '',
      pincode = '',
      searchQuery = '',
      metadata = {}
    } = eventData;

    if (!eventType || !serviceCategory) {
      throw new Error('eventType and serviceCategory are required');
    }

    // Step 1: Deduplication check
    const isDuplicate = this.checkCooldownDuplicate({
      userId,
      sessionId,
      eventType,
      serviceCategory,
      districtName,
      localityName,
      cooldownMinutes: config.cooldownMinutes || 10
    });

    if (isDuplicate) {
      return {
        success: true,
        eventId,
        deduplicated: true,
        message: 'Suppressed repeated event within cooldown window',
        recommendations: []
      };
    }

    // Step 2: Persist event in database
    const insertEvent = db.prepare(`
      INSERT INTO ai_notification_events (
        id, user_id, session_id, event_type, service_category,
        state_name, district_name, locality_name, pincode,
        search_query, payload_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    insertEvent.run(
      eventId,
      userId,
      sessionId,
      eventType,
      serviceCategory,
      stateName,
      districtName,
      localityName,
      pincode,
      searchQuery,
      JSON.stringify(metadata)
    );

    // Step 3: Global / Category killswitch check
    if (!config.globalAutomationEnabled) {
      this.logAudit({
        action: 'AUTOMATION_HALTED',
        adminId: 'system',
        adminName: 'AI Engine',
        adminRole: 'SYSTEM',
        category: 'POLICY_EVALUATION',
        details: 'Global automation killswitch is active. Notification skipped.',
        payloadSnapshot: { eventId, serviceCategory }
      });

      return {
        success: true,
        eventId,
        suppressed: true,
        reason: 'GLOBAL_AUTOMATION_DISABLED',
        recommendations: []
      };
    }

    if (!config.enabledCategories.includes(serviceCategory)) {
      return {
        success: true,
        eventId,
        suppressed: true,
        reason: 'SERVICE_CATEGORY_DISABLED',
        recommendations: []
      };
    }

    // Step 4: Intelligent offer matching & ranking
    const recommendations = offerRecommendationService.getRecommendations({
      serviceCategory,
      districtName,
      localityName,
      searchQuery,
      classLevel: metadata.classLevel,
      subject: metadata.subject,
      examCategory: metadata.examCategory,
      stage: metadata.stage
    });

    // Step 5: Persist recommendations
    const insertRec = db.prepare(`
      INSERT INTO ai_offer_recommendations (
        id, event_id, user_id, service_type, offer_id,
        offer_title, offer_code, offer_category, discount_type,
        discount_value, relevance_score, is_organic, deep_link,
        location_scope_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const storedRecs = [];
    for (const rec of recommendations) {
      const recId = `rec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      insertRec.run(
        recId,
        eventId,
        userId,
        rec.serviceType,
        rec.offerId,
        rec.offerTitle,
        rec.offerCode || null,
        rec.offerCategory,
        rec.discountType,
        rec.discountValue,
        rec.relevanceScore,
        rec.isOrganic ? 1 : 0,
        rec.deepLink,
        JSON.stringify(rec.locationScope)
      );
      storedRecs.push({ ...rec, recommendationId: recId });
    }

    const primaryRec = storedRecs[0];

    // Step 6: Dispatch In-App Notification (if enabled and user exists)
    let inAppCreated = null;
    if (config.inAppChannelEnabled && userId && primaryRec) {
      try {
        inAppCreated = inAppNotificationService.createNotification({
          userId,
          title: primaryRec.offerTitle,
          message: primaryRec.isOrganic
            ? `Discover verified ${serviceCategory.toLowerCase().replace('_', ' ')} in ${localityName || districtName}.`
            : `Special Offer: Use code ${primaryRec.offerCode || 'PROMO'} for ${primaryRec.discountDisplay}.`,
          serviceCategory,
          offerId: primaryRec.offerId,
          offerCode: primaryRec.offerCode,
          discountDisplay: primaryRec.discountDisplay,
          deepLink: primaryRec.deepLink,
          actionLabel: 'View Details'
        });
      } catch (inAppErr) {
        console.error('Failed to create in-app notification:', inAppErr);
      }
    }

    // Step 7: WhatsApp Dispatch (with strict consent & frequency check)
    let whatsappDispatch = null;
    const effectivePhone = userPhone || (userId ? this.resolveUserPhone(userId) : null);

    if (config.whatsAppChannelEnabled && effectivePhone && primaryRec) {
      const hasConsent = notificationPreferenceService.hasPromotionalConsent(userId);
      const isQuietTime = notificationPreferenceService.isWithinQuietHours(userId);
      const canSend = notificationPreferenceService.canSendPromotional(userId);

      const dispatchId = `wad-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      if (!hasConsent) {
        this.recordWhatsAppDispatch({
          id: dispatchId,
          userId,
          phone: effectivePhone,
          serviceCategory,
          templateId: 'focuspoint_promo_v1',
          renderedMessage: `Hi ${userName || 'Student'}! Explore ${primaryRec.offerTitle}: ${primaryRec.deepLink}`,
          deepLink: primaryRec.deepLink,
          offerId: primaryRec.offerId,
          consentVerified: 0,
          status: 'SUPPRESSED',
          failureReason: 'USER_CONSENT_NOT_GRANTED'
        });
      } else if (isQuietTime) {
        this.recordWhatsAppDispatch({
          id: dispatchId,
          userId,
          phone: effectivePhone,
          serviceCategory,
          templateId: 'focuspoint_promo_v1',
          renderedMessage: `Hi ${userName || 'Student'}! Explore ${primaryRec.offerTitle}: ${primaryRec.deepLink}`,
          deepLink: primaryRec.deepLink,
          offerId: primaryRec.offerId,
          consentVerified: 1,
          status: 'SUPPRESSED',
          failureReason: 'QUIET_HOURS_ACTIVE'
        });
      } else if (!canSend) {
        this.recordWhatsAppDispatch({
          id: dispatchId,
          userId,
          phone: effectivePhone,
          serviceCategory,
          templateId: 'focuspoint_promo_v1',
          renderedMessage: `Hi ${userName || 'Student'}! Explore ${primaryRec.offerTitle}: ${primaryRec.deepLink}`,
          deepLink: primaryRec.deepLink,
          offerId: primaryRec.offerId,
          consentVerified: 1,
          status: 'SUPPRESSED',
          failureReason: 'FREQUENCY_LIMIT_EXCEEDED'
        });
      } else {
        // Successful message enqueue & delivery
        const renderedMessage = `Hi ${userName || 'Student'}! 👋\nLooking for ${serviceCategory.toLowerCase().replace('_', ' ')} in ${localityName || districtName}?\n${primaryRec.offerTitle}\nExplore now: ${primaryRec.deepLink}\nReply STOP to unsubscribe.`;

        this.recordWhatsAppDispatch({
          id: dispatchId,
          userId,
          phone: effectivePhone,
          serviceCategory,
          templateId: 'focuspoint_promo_v1',
          renderedMessage,
          deepLink: primaryRec.deepLink,
          offerId: primaryRec.offerId,
          consentVerified: 1,
          status: 'DELIVERED',
          providerMessageId: `wamid.HBgL${Date.now()}`
        });

        whatsappDispatch = {
          dispatchId,
          status: 'DELIVERED',
          phone: effectivePhone
        };
      }
    }

    // Step 8: Audit log
    this.logAudit({
      action: 'PROCESS_ACTIVITY_EVENT',
      adminId: 'system',
      adminName: 'AI Engine',
      adminRole: 'SYSTEM',
      category: 'DELIVERY_DISPATCH',
      details: `Processed ${eventType} for ${serviceCategory} in ${districtName}. Matched ${storedRecs.length} offers.`,
      payloadSnapshot: {
        eventId,
        matchedCount: storedRecs.length,
        inAppSent: Boolean(inAppCreated),
        whatsappStatus: whatsappDispatch?.status || 'SKIPPED_OR_SUPPRESSED'
      }
    });

    return {
      success: true,
      eventId,
      recommendations: storedRecs,
      inAppNotification: inAppCreated,
      whatsappDispatch
    };
  }

  /**
   * Checks if an identical search event was already logged within the cooldown window
   */
  checkCooldownDuplicate({ userId, sessionId, eventType, serviceCategory, districtName, localityName, cooldownMinutes = 10 }) {
    let query;
    let params;
    if (userId) {
      query = `
        SELECT COUNT(*) as count FROM ai_notification_events
        WHERE user_id = ?
          AND event_type = ?
          AND service_category = ?
          AND district_name = ?
          AND locality_name = ?
          AND created_at >= datetime('now', ?)
      `;
      params = [userId, eventType, serviceCategory, districtName || '', localityName || '', `-${cooldownMinutes} minutes`];
    } else {
      query = `
        SELECT COUNT(*) as count FROM ai_notification_events
        WHERE user_id IS NULL
          AND session_id = ?
          AND event_type = ?
          AND service_category = ?
          AND district_name = ?
          AND locality_name = ?
          AND created_at >= datetime('now', ?)
      `;
      params = [sessionId || '', eventType, serviceCategory, districtName || '', localityName || '', `-${cooldownMinutes} minutes`];
    }

    const row = db.prepare(query).get(...params);
    return row && row.count > 0;
  }

  recordWhatsAppDispatch({
    id,
    userId,
    phone,
    serviceCategory,
    templateId,
    renderedMessage,
    deepLink,
    offerId,
    consentVerified,
    status,
    failureReason = null,
    providerMessageId = null
  }) {
    const stmt = db.prepare(`
      INSERT INTO ai_whatsapp_dispatches (
        id, user_id, recipient_phone, service_category,
        template_id, rendered_message, deep_link, offer_id,
        consent_verified, status, failure_reason, provider_message_id,
        sent_at, delivered_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      id,
      userId,
      phone,
      serviceCategory,
      templateId,
      renderedMessage,
      deepLink,
      offerId,
      consentVerified,
      status,
      failureReason,
      providerMessageId
    );
  }

  resolveUserPhone(userId) {
    const user = db.prepare('SELECT mobile FROM users WHERE id = ?').get(userId);
    return user ? user.mobile : null;
  }

  /**
   * Tracks offer click for conversion analytics
   */
  trackOfferClick(recommendationId) {
    const res = db.prepare('UPDATE ai_offer_recommendations SET clicked = 1 WHERE id = ?').run(recommendationId);
    return res.changes > 0;
  }

  /**
   * Tracks attributed conversion
   */
  trackConversion(recommendationId) {
    const res = db.prepare('UPDATE ai_offer_recommendations SET converted = 1 WHERE id = ?').run(recommendationId);
    return res.changes > 0;
  }

  /**
   * Logs an immutable audit event
   */
  logAudit({ action, adminId = 'system', adminName = 'AI Agent', adminRole = 'SYSTEM', category, details, payloadSnapshot = null }) {
    const stmt = db.prepare(`
      INSERT INTO ai_automation_audit_logs (
        action, admin_id, admin_name, admin_role, category, details, payload_snapshot, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      action,
      adminId,
      adminName,
      adminRole,
      category,
      details,
      payloadSnapshot ? JSON.stringify(payloadSnapshot) : null
    );
  }

  /**
   * Query audit logs with pagination and category filtering
   */
  getAuditLogs({ category = null, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM ai_automation_audit_logs';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params).map(r => ({
      id: r.id,
      action: r.action,
      adminId: r.admin_id,
      adminName: r.admin_name,
      adminRole: r.admin_role,
      category: r.category,
      details: r.details,
      payloadSnapshot: r.payload_snapshot ? JSON.parse(r.payload_snapshot) : null,
      createdAt: r.created_at
    }));
  }

  /**
   * Delivery status and retry queue
   */
  getDeliveryQueue({ status = null, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM ai_whatsapp_dispatches';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  /**
   * Retry failed delivery
   */
  retryDelivery(dispatchId) {
    const item = db.prepare('SELECT * FROM ai_whatsapp_dispatches WHERE id = ?').get(dispatchId);
    if (!item) {
      throw new Error('Dispatch record not found');
    }

    const updated = db.prepare(`
      UPDATE ai_whatsapp_dispatches 
      SET status = 'DELIVERED', 
          failure_reason = NULL,
          retry_count = retry_count + 1,
          delivered_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(dispatchId);

    this.logAudit({
      action: 'RETRY_WHATSAPP_DELIVERY',
      adminId: 'super-admin',
      adminName: 'Super Admin',
      adminRole: 'SUPER_ADMIN',
      category: 'RETRY_QUEUE',
      details: `Retried delivery for dispatch ${dispatchId}`,
      payloadSnapshot: { dispatchId }
    });

    return updated.changes > 0;
  }

  /**
   * Analytics overview
   */
  getAnalyticsSummary() {
    const totalEvents = db.prepare('SELECT COUNT(*) as c FROM ai_notification_events').get().c;
    const totalRecs = db.prepare('SELECT COUNT(*) as c FROM ai_offer_recommendations').get().c;
    const totalClicks = db.prepare('SELECT COUNT(*) as c FROM ai_offer_recommendations WHERE clicked = 1').get().c;
    const totalConversions = db.prepare('SELECT COUNT(*) as c FROM ai_offer_recommendations WHERE converted = 1').get().c;

    const whatsappStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'SUPPRESSED' THEN 1 ELSE 0 END) as suppressed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM ai_whatsapp_dispatches
    `).get();

    const inAppStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as readCount
      FROM in_app_notifications
    `).get();

    const districtBreakdown = db.prepare(`
      SELECT 
        district_name as districtName,
        COUNT(*) as eventCount
      FROM ai_notification_events
      GROUP BY district_name
      ORDER BY eventCount DESC
      LIMIT 5
    `).all();

    return {
      totalEvents,
      totalRecommendations: totalRecs,
      totalClicks,
      totalConversions,
      ctr: totalRecs > 0 ? Number(((totalClicks / totalRecs) * 100).toFixed(1)) : 0,
      conversionRate: totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(1)) : 0,
      whatsapp: {
        total: whatsappStats.total || 0,
        delivered: whatsappStats.delivered || 0,
        suppressed: whatsappStats.suppressed || 0,
        failed: whatsappStats.failed || 0
      },
      inApp: {
        total: inAppStats.total || 0,
        readCount: inAppStats.readCount || 0
      },
      districtBreakdown
    };
  }

  /**
   * Handle Inbound Webhook Event from Meta WhatsApp Cloud API or interactive simulator
   */
  handleInboundWhatsAppMessage({ from, text, messageId = `msg-${Date.now()}`, timestamp = new Date().toISOString() }) {
    if (!from || !text) {
      return { success: false, reason: 'MISSING_FROM_OR_TEXT' };
    }

    const cleanFrom = from.replace(/[^0-9]/g, '');
    const nationalPhone = cleanFrom.slice(-10);
    const user = notificationPreferenceService.findUserByPhone(nationalPhone);
    const userId = user ? user.id : `phone-${nationalPhone}`;
    const userName = user ? user.name : 'Learner';

    const cleanText = text.trim().toUpperCase();

    if (cleanText === 'STOP' || cleanText === 'UNSUBSCRIBE' || cleanText === 'CANCEL') {
      notificationPreferenceService.setPromotionalConsentByPhone(nationalPhone, false);

      this.logAudit({
        action: 'WHATSAPP_OPT_OUT',
        adminId: userId,
        adminName: userName,
        adminRole: 'STUDENT',
        category: 'OPT_OUT',
        details: `User (${nationalPhone}) opted out of promotional WhatsApp messages via keyword "${cleanText}"`,
        payloadSnapshot: { phone: nationalPhone, keyword: cleanText, messageId }
      });

      const autoReply = "ZYZU'S: You have unsubscribed from promotional messages. Transactional and attendance alerts remain active. Reply START at any time to opt back in.\n\nZYZU'S | Tutors & Libraries";
      return {
        success: true,
        action: 'OPT_OUT',
        phone: nationalPhone,
        userId,
        consentGranted: false,
        autoReply
      };
    } else if (cleanText === 'START' || cleanText === 'UNSTOP' || cleanText === 'OPTIN') {
      notificationPreferenceService.setPromotionalConsentByPhone(nationalPhone, true);

      this.logAudit({
        action: 'WHATSAPP_OPT_IN',
        adminId: userId,
        adminName: userName,
        adminRole: 'STUDENT',
        category: 'CONFIG_CHANGE',
        details: `User (${nationalPhone}) opted in to promotional WhatsApp messages via keyword "${cleanText}"`,
        payloadSnapshot: { phone: nationalPhone, keyword: cleanText, messageId }
      });

      const autoReply = "ZYZU'S: Welcome back! You are now subscribed to personalized education offers, test series discounts, and digital library recommendations. Reply STOP to opt out.\n\nZYZU'S | Tutors & Libraries";
      return {
        success: true,
        action: 'OPT_IN',
        phone: nationalPhone,
        userId,
        consentGranted: true,
        autoReply
      };
    } else if (cleanText === 'HELP') {
      const autoReply = "ZYZU'S Help: For support, contact +91 9196434387 or visit https://zyzus.com. To unsubscribe from offers, reply STOP.\n\nZYZU'S | Tutors & Libraries";
      return {
        success: true,
        action: 'HELP',
        phone: nationalPhone,
        userId,
        autoReply
      };
    }

    return {
      success: true,
      action: 'IGNORED',
      phone: nationalPhone,
      message: 'Message received and logged.'
    };
  }

  /**
   * Handle Webhook Delivery Status Receipts (sent, delivered, read, failed)
   */
  handleDeliveryStatusReceipt({ providerMessageId, status, timestamp, failureReason }) {
    if (!providerMessageId || !status) {
      return { success: false, reason: 'MISSING_REQUIRED_FIELDS' };
    }

    const normalizedStatus = status.toUpperCase();
    const mappedStatus = ['SENT', 'DELIVERED', 'READ', 'FAILED'].includes(normalizedStatus)
      ? (normalizedStatus === 'READ' ? 'DELIVERED' : normalizedStatus)
      : 'DELIVERED';

    const dispatch = db.prepare('SELECT id FROM ai_whatsapp_dispatches WHERE provider_message_id = ?').get(providerMessageId);
    if (dispatch) {
      db.prepare(`
        UPDATE ai_whatsapp_dispatches
        SET status = ?,
            delivered_at = CASE WHEN ? = 'DELIVERED' OR ? = 'READ' THEN COALESCE(?, CURRENT_TIMESTAMP) ELSE delivered_at END,
            failure_reason = CASE WHEN ? = 'FAILED' THEN ? ELSE failure_reason END
        WHERE id = ?
      `).run(mappedStatus, normalizedStatus, normalizedStatus, timestamp || null, normalizedStatus, failureReason || null, dispatch.id);
    }

    // Also update whatsapp_notifications if it exists
    try {
      db.prepare(`
        UPDATE whatsapp_notifications
        SET status = ?,
            delivered_at = CASE WHEN ? = 'DELIVERED' OR ? = 'READ' THEN COALESCE(?, CURRENT_TIMESTAMP) ELSE delivered_at END,
            failure_reason = CASE WHEN ? = 'FAILED' THEN ? ELSE failure_reason END
        WHERE provider_message_id = ?
      `).run(mappedStatus, normalizedStatus, normalizedStatus, timestamp || null, normalizedStatus, failureReason || null, providerMessageId);
    } catch (e) {
      // ignore
    }

    return { success: true, providerMessageId, status: mappedStatus };
  }
}

module.exports = new AiNotificationAgentService();
