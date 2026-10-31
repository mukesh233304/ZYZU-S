const db = require('../db/database');

class NotificationPreferenceService {
  /**
   * Fetch preferences for a user, or return safe defaults
   */
  getPreferences(userId) {
    if (!userId) {
      return this.getDefaults('anonymous');
    }

    const row = db.prepare('SELECT * FROM user_notification_preferences WHERE user_id = ?').get(userId);
    if (!row) {
      return this.getDefaults(userId);
    }

    return {
      userId: row.user_id,
      promotionalWhatsAppOptIn: Boolean(row.promotional_whatsapp_opt_in),
      transactionalWhatsAppOptIn: Boolean(row.transactional_whatsapp_opt_in),
      inAppNotificationsEnabled: Boolean(row.in_app_notifications_enabled),
      maxPromotionalPerDay: row.max_promotional_per_day || 2,
      maxPromotionalPerWeek: row.max_promotional_per_week || 5,
      quietHoursStart: row.quiet_hours_start || '21:00',
      quietHoursEnd: row.quiet_hours_end || '09:00',
      updatedAt: row.updated_at
    };
  }

  getDefaults(userId) {
    return {
      userId,
      promotionalWhatsAppOptIn: false, // Default opt-out for promotional WhatsApp per privacy standards
      transactionalWhatsAppOptIn: true,
      inAppNotificationsEnabled: true,
      maxPromotionalPerDay: 2,
      maxPromotionalPerWeek: 5,
      quietHoursStart: '21:00',
      quietHoursEnd: '09:00',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Update or upsert user preferences
   */
  updatePreferences(userId, updateData = {}) {
    if (!userId) return null;

    const existing = this.getPreferences(userId);
    const updated = {
      ...existing,
      ...updateData,
      userId
    };

    const stmt = db.prepare(`
      INSERT INTO user_notification_preferences (
        user_id,
        promotional_whatsapp_opt_in,
        transactional_whatsapp_opt_in,
        in_app_notifications_enabled,
        max_promotional_per_day,
        max_promotional_per_week,
        quiet_hours_start,
        quiet_hours_end,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        promotional_whatsapp_opt_in = excluded.promotional_whatsapp_opt_in,
        transactional_whatsapp_opt_in = excluded.transactional_whatsapp_opt_in,
        in_app_notifications_enabled = excluded.in_app_notifications_enabled,
        max_promotional_per_day = excluded.max_promotional_per_day,
        max_promotional_per_week = excluded.max_promotional_per_week,
        quiet_hours_start = excluded.quiet_hours_start,
        quiet_hours_end = excluded.quiet_hours_end,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      userId,
      updated.promotionalWhatsAppOptIn ? 1 : 0,
      updated.transactionalWhatsAppOptIn ? 1 : 0,
      updated.inAppNotificationsEnabled ? 1 : 0,
      updated.maxPromotionalPerDay,
      updated.maxPromotionalPerWeek,
      updated.quietHoursStart,
      updated.quietHoursEnd
    );

    return this.getPreferences(userId);
  }

  /**
   * Checks whether the user has explicitly consented to promotional WhatsApp messages
   */
  hasPromotionalConsent(userId) {
    if (!userId) return false;
    const prefs = this.getPreferences(userId);
    return prefs.promotionalWhatsAppOptIn === true;
  }

  /**
   * Checks if current time is within configured quiet hours
   */
  isWithinQuietHours(userId, timeStr) {
    const prefs = this.getPreferences(userId);
    const [startH, startM] = (prefs.quietHoursStart || '21:00').split(':').map(Number);
    const [endH, endM] = (prefs.quietHoursEnd || '09:00').split(':').map(Number);

    let currentH, currentM;
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      currentH = h;
      currentM = m;
    } else {
      const now = new Date();
      currentH = now.getHours();
      currentM = now.getMinutes();
    }

    const currentMinutes = currentH * 60 + currentM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Overnight window (e.g. 21:00 to 09:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Same day window (e.g. 13:00 to 15:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Validates promotional frequency limits (daily and weekly counts)
   */
  canSendPromotional(userId) {
    if (!userId) return false;
    if (!this.hasPromotionalConsent(userId)) return false;
    if (this.isWithinQuietHours(userId)) return false;

    const prefs = this.getPreferences(userId);

    // Count sends in the last 24 hours
    const dailyCount = db.prepare(`
      SELECT COUNT(*) as count FROM ai_whatsapp_dispatches 
      WHERE user_id = ? 
        AND status IN ('SENT', 'DELIVERED', 'PROCESSING')
        AND created_at >= datetime('now', '-1 day')
    `).get(userId).count;

    if (dailyCount >= prefs.maxPromotionalPerDay) {
      return false;
    }

    // Count sends in the last 7 days
    const weeklyCount = db.prepare(`
      SELECT COUNT(*) as count FROM ai_whatsapp_dispatches 
      WHERE user_id = ? 
        AND status IN ('SENT', 'DELIVERED', 'PROCESSING')
        AND created_at >= datetime('now', '-7 days')
    `).get(userId).count;

    if (weeklyCount >= prefs.maxPromotionalPerWeek) {
      return false;
    }

    return true;
  }
  /**
   * Find user by mobile phone
   */
  findUserByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const national10 = cleanPhone.slice(-10);
    const user = db.prepare(`
      SELECT id, mobile FROM users 
      WHERE mobile = ? OR mobile = ? OR mobile LIKE ?
      LIMIT 1
    `).get(cleanPhone, national10, `%${national10}`);
    return user || null;
  }

  /**
   * Revoke or grant promotional consent by phone number
   */
  setPromotionalConsentByPhone(phone, optIn = false) {
    const user = this.findUserByPhone(phone);
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const phoneUserId = `phone-${cleanPhone}`;
    if (user && user.id && user.id !== phoneUserId) {
      this.updatePreferences(user.id, { promotionalWhatsAppOptIn: optIn });
    }
    return this.updatePreferences(phoneUserId, { promotionalWhatsAppOptIn: optIn });
  }
}

module.exports = new NotificationPreferenceService();
