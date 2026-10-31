const db = require('../db/database');
const crypto = require('crypto');

class InAppNotificationService {
  /**
   * Creates an in-app notification for a user
   */
  createNotification({
    userId,
    title,
    message,
    serviceCategory,
    offerId = null,
    offerCode = null,
    discountDisplay = null,
    deepLink,
    actionLabel = 'Explore Now'
  }) {
    if (!userId || !title || !message) {
      throw new Error('userId, title, and message are required for in-app notifications');
    }

    const id = `ian-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const stmt = db.prepare(`
      INSERT INTO in_app_notifications (
        id,
        user_id,
        title,
        message,
        service_category,
        offer_id,
        offer_code,
        discount_display,
        deep_link,
        action_label,
        is_read,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      id,
      userId,
      title,
      message,
      serviceCategory || 'GENERAL',
      offerId,
      offerCode,
      discountDisplay,
      deepLink || '/',
      actionLabel
    );

    return this.getNotificationById(id, userId);
  }

  getNotificationById(id, userId) {
    const row = db.prepare('SELECT * FROM in_app_notifications WHERE id = ? AND user_id = ?').get(id, userId);
    return row ? this.mapRow(row) : null;
  }

  /**
   * Retrieves in-app notifications for a user with category filter & pagination
   * Ensures multi-tenant isolation by enforcing user_id in SQL
   */
  getUserNotifications(userId, { serviceCategory = null, unreadOnly = false, limit = 50, offset = 0 } = {}) {
    if (!userId) return [];

    let query = 'SELECT * FROM in_app_notifications WHERE user_id = ?';
    const params = [userId];

    if (serviceCategory && serviceCategory !== 'ALL') {
      query += ' AND service_category = ?';
      params.push(serviceCategory);
    }

    if (unreadOnly) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);
    return rows.map(r => this.mapRow(r));
  }

  /**
   * Marks a notification as read (with strict multi-tenant authorization)
   */
  markAsRead(notificationId, userId) {
    if (!notificationId || !userId) return false;

    const result = db.prepare(`
      UPDATE in_app_notifications 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `).run(notificationId, userId);

    return result.changes > 0;
  }

  /**
   * Marks all unread notifications for a user as read
   */
  markAllAsRead(userId) {
    if (!userId) return 0;

    const result = db.prepare(`
      UPDATE in_app_notifications 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND is_read = 0
    `).run(userId);

    return result.changes;
  }

  /**
   * Gets unread count for user badge
   */
  getUnreadCount(userId) {
    if (!userId) return 0;
    const row = db.prepare('SELECT COUNT(*) as unreadCount FROM in_app_notifications WHERE user_id = ? AND is_read = 0').get(userId);
    return row ? row.unreadCount : 0;
  }

  mapRow(r) {
    return {
      id: r.id,
      userId: r.user_id,
      title: r.title,
      message: r.message,
      serviceCategory: r.service_category,
      offerId: r.offer_id,
      offerCode: r.offer_code,
      discountDisplay: r.discount_display,
      deepLink: r.deep_link,
      actionLabel: r.action_label,
      isRead: Boolean(r.is_read),
      readAt: r.read_at,
      createdAt: r.created_at
    };
  }
}

module.exports = new InAppNotificationService();
