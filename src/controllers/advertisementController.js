/**
 * FOCUSPOINT — Advanced Service Page Advertisement Engine Controller
 *
 * Powers dynamic advertisement carousels across:
 * - Find Home Tutor (Immediately below District Verified Home Educators)
 * - Find Libraries
 * - Mock Tests
 * - Study Materials
 *
 * Supports:
 * - Multi-company ads concurrently active
 * - Diverse media types: TEXT_ONLY, IMAGE_ONLY, VIDEO_ONLY, IMAGE_TEXT, VIDEO_TEXT, RICH_AD
 * - Precision date scheduling & automatic expiration exclusion
 * - URL sanitization & XSS safety
 * - Real, un-fabricated telemetry event tracking (Impression, Click, Video Play)
 * - Complete Operator Command Center CRUD, duplication, status lifecycle, and Audit Trail
 */

const crypto = require('crypto');
const db = require('../db/database');
const config = require('../config');

// Helper to sanitize destination URL preventing open-redirect or javascript: URI attacks
function sanitizeDestinationUrl(url) {
  if (!url || typeof url !== 'string') return '/';
  const trimmed = url.trim();

  // Allow safe relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Allow trusted HTTPS / HTTP web URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
  } catch (e) {
    // Invalid URL format
  }

  return '/';
}

// 1. Public: Get Live Advertisements for a Service Page & Placement
exports.getLiveAdvertisements = (req, res) => {
  try {
    const { page = 'ALL', placement } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let query = `
      SELECT * FROM advertisement_campaigns
      WHERE status = 'LIVE'
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
    `;
    const params = [today, today];

    if (placement) {
      query += ' AND placement = ?';
      params.push(placement);
    }

    query += ' ORDER BY priority DESC, created_at DESC';
    const allLive = db.prepare(query).all(...params);

    // Filter by target_pages (matches specific page or 'ALL')
    const pageUpper = page.toUpperCase();
    const filtered = allLive.filter(ad => {
      try {
        const pages = JSON.parse(ad.target_pages || '["ALL"]');
        return pageUpper === 'ALL' || pages.includes('ALL') || pages.includes(pageUpper);
      } catch {
        return true;
      }
    });

    // Format output
    const formatted = filtered.map(ad => ({
      id: ad.id,
      advertiserName: ad.advertiser_name,
      campaignName: ad.campaign_name,
      placement: ad.placement,
      targetPages: JSON.parse(ad.target_pages || '["ALL"]'),
      mediaType: ad.media_type,
      headline: ad.headline,
      subheading: ad.subheading,
      description: ad.description,
      imageUrl: ad.image_url,
      videoUrl: ad.video_url,
      destinationUrl: ad.destination_url,
      ctaText: ad.cta_text || 'Learn More',
      supportingText: ad.supporting_text,
      badgeText: ad.badge_text,
      promotionalOffer: ad.promotional_offer,
      layout: ad.layout,
      status: ad.status,
      startDate: ad.start_date,
      endDate: ad.end_date,
      priority: ad.priority,
      targetAudience: ad.target_audience,
      impressions: ad.impressions,
      clicks: ad.clicks,
      videoPlays: ad.video_plays,
      createdAt: ad.created_at,
      updatedAt: ad.updated_at
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      page: pageUpper,
      data: formatted
    });
  } catch (err) {
    console.error('getLiveAdvertisements error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active advertisements' });
  }
};

// 2. Public: Record Real Telemetry Event (Impression, Click, Video Play)
exports.recordEvent = (req, res) => {
  try {
    const { campaignId, eventType, page = 'UNKNOWN' } = req.body;

    if (!campaignId || !eventType) {
      return res.status(400).json({ success: false, message: 'campaignId and eventType are required' });
    }

    const validTypes = ['IMPRESSION', 'CLICK', 'VIDEO_PLAY', 'CTA_CLICK'];
    if (!validTypes.includes(eventType.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Invalid eventType. Must be one of: ${validTypes.join(', ')}` });
    }

    const campaign = db.prepare('SELECT id FROM advertisement_campaigns WHERE id = ?').get(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Hash client IP for privacy-preserving rate-limiting
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    const userAgent = (req.headers['user-agent'] || '').substring(0, 200);

    const typeUpper = eventType.toUpperCase();

    // Atomic update
    const recordTx = db.transaction(() => {
      // 1. Insert event log
      db.prepare(`
        INSERT INTO advertisement_events (campaign_id, event_type, page, ip_hash, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `).run(campaignId, typeUpper, page, ipHash, userAgent);

      // 2. Increment aggregated counter on campaign
      if (typeUpper === 'IMPRESSION') {
        db.prepare('UPDATE advertisement_campaigns SET impressions = impressions + 1 WHERE id = ?').run(campaignId);
      } else if (typeUpper === 'CLICK' || typeUpper === 'CTA_CLICK') {
        db.prepare('UPDATE advertisement_campaigns SET clicks = clicks + 1 WHERE id = ?').run(campaignId);
      } else if (typeUpper === 'VIDEO_PLAY') {
        db.prepare('UPDATE advertisement_campaigns SET video_plays = video_plays + 1 WHERE id = ?').run(campaignId);
      }
    });

    recordTx();

    return res.status(200).json({ success: true, message: 'Event telemetry recorded successfully' });
  } catch (err) {
    console.error('recordEvent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record event' });
  }
};

// 3. Analytics Summary (No Fabricated Data)
exports.getAnalyticsSummary = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalCampaigns = db.prepare('SELECT COUNT(*) as c FROM advertisement_campaigns').get().c;
    const activeCampaigns = db.prepare(`
      SELECT COUNT(*) as c FROM advertisement_campaigns
      WHERE status = 'LIVE'
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
    `).get(today, today).c;

    const pausedCampaigns = db.prepare("SELECT COUNT(*) as c FROM advertisement_campaigns WHERE status = 'PAUSED'").get().c;
    const expiredCampaigns = db.prepare(`
      SELECT COUNT(*) as c FROM advertisement_campaigns
      WHERE status = 'EXPIRED' OR (end_date IS NOT NULL AND end_date < ?)
    `).get(today).c;

    const aggregates = db.prepare(`
      SELECT
        COALESCE(SUM(impressions), 0) AS total_impressions,
        COALESCE(SUM(clicks), 0) AS total_clicks,
        COALESCE(SUM(video_plays), 0) AS total_video_plays
      FROM advertisement_campaigns
    `).get();

    const totalImpressions = aggregates.total_impressions;
    const totalClicks = aggregates.total_clicks;
    const averageCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalCampaigns,
        activeCampaigns,
        activeLive: activeCampaigns,
        pausedCampaigns,
        expiredCampaigns,
        totalImpressions,
        totalClicks,
        averageCtr,
        overallCtr: averageCtr,
        totalVideoPlays: aggregates.total_video_plays
      }
    });
  } catch (err) {
    console.error('getAnalyticsSummary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate analytics summary' });
  }
};

// 4. Operator / Admin: Get All Campaigns with Filters
exports.getAllCampaigns = (req, res) => {
  try {
    const { status, placement, q } = req.query;
    let query = 'SELECT * FROM advertisement_campaigns WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status.toUpperCase());
    }

    if (placement) {
      query += ' AND placement = ?';
      params.push(placement);
    }

    if (q) {
      query += ' AND (LOWER(headline) LIKE ? OR LOWER(advertiser_name) LIKE ? OR LOWER(campaign_name) LIKE ?)';
      const term = `%${q.toLowerCase()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);

    const data = rows.map(ad => ({
      id: ad.id,
      advertiserName: ad.advertiser_name,
      campaignName: ad.campaign_name,
      placement: ad.placement,
      targetPages: JSON.parse(ad.target_pages || '["ALL"]'),
      mediaType: ad.media_type,
      headline: ad.headline,
      subheading: ad.subheading,
      description: ad.description,
      imageUrl: ad.image_url,
      videoUrl: ad.video_url,
      destinationUrl: ad.destination_url,
      ctaText: ad.cta_text,
      supportingText: ad.supporting_text,
      badgeText: ad.badge_text,
      promotionalOffer: ad.promotional_offer,
      layout: ad.layout,
      status: ad.status,
      startDate: ad.start_date,
      endDate: ad.end_date,
      priority: ad.priority,
      targetAudience: ad.target_audience,
      impressions: ad.impressions,
      clicks: ad.clicks,
      videoPlays: ad.video_plays,
      createdBy: ad.created_by,
      createdAt: ad.created_at,
      updatedAt: ad.updated_at
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('getAllCampaigns error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve campaigns' });
  }
};

// 5. Operator / Admin: Get Campaign by ID
exports.getCampaignById = (req, res) => {
  try {
    const { id } = req.params;
    const ad = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const recentEvents = db.prepare(`
      SELECT event_type, page, created_at
      FROM advertisement_events
      WHERE campaign_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(id);

    return res.status(200).json({
      success: true,
      data: {
        id: ad.id,
        advertiserName: ad.advertiser_name,
        campaignName: ad.campaign_name,
        placement: ad.placement,
        targetPages: JSON.parse(ad.target_pages || '["ALL"]'),
        mediaType: ad.media_type,
        headline: ad.headline,
        subheading: ad.subheading,
        description: ad.description,
        imageUrl: ad.image_url,
        videoUrl: ad.video_url,
        destinationUrl: ad.destination_url,
        ctaText: ad.cta_text,
        supportingText: ad.supporting_text,
        badgeText: ad.badge_text,
        promotionalOffer: ad.promotional_offer,
        layout: ad.layout,
        status: ad.status,
        startDate: ad.start_date,
        endDate: ad.end_date,
        priority: ad.priority,
        targetAudience: ad.target_audience,
        impressions: ad.impressions,
        clicks: ad.clicks,
        videoPlays: ad.video_plays,
        recentEvents,
        createdAt: ad.created_at,
        updatedAt: ad.updated_at
      }
    });
  } catch (err) {
    console.error('getCampaignById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve campaign' });
  }
};

// 6. Operator / Admin: Create Advertisement Campaign
exports.createCampaign = (req, res) => {
  try {
    const {
      id,
      advertiserName,
      campaignName,
      placement,
      targetPages = ['ALL'],
      mediaType = 'IMAGE_TEXT',
      headline,
      subheading,
      description,
      imageUrl,
      videoUrl,
      destinationUrl,
      ctaText = 'Learn More',
      supportingText,
      badgeText,
      promotionalOffer,
      layout = 'split',
      status = 'LIVE',
      startDate,
      endDate,
      priority = 50,
      targetAudience
    } = req.body;

    if (!advertiserName || !headline || !placement) {
      return res.status(400).json({
        success: false,
        message: 'advertiserName, headline, and placement are required'
      });
    }

    const campaignId = id || `ad-camp-${Date.now()}`;
    const sanitizedUrl = sanitizeDestinationUrl(destinationUrl);
    const pagesJson = JSON.stringify(Array.isArray(targetPages) ? targetPages : [targetPages]);
    const actorId = req.user ? req.user.id : 'usr-operator-sunita';
    const actorRole = req.user ? req.user.role : 'OPERATOR';

    const userExists = req.user?.id ? db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.id) : null;
    const validCreatorId = userExists ? userExists.id : null;

    const insertTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO advertisement_campaigns (
          id, advertiser_name, campaign_name, placement, target_pages, media_type,
          headline, subheading, description, image_url, video_url, destination_url,
          cta_text, supporting_text, badge_text, promotional_offer, layout, status,
          start_date, end_date, priority, target_audience, impressions, clicks, video_plays,
          created_by
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, 0, 0, 0,
          ?
        )
      `).run(
        campaignId,
        advertiserName.trim(),
        (campaignName || headline).trim(),
        placement,
        pagesJson,
        mediaType,
        headline.trim(),
        subheading ? subheading.trim() : null,
        description ? description.trim() : null,
        imageUrl || null,
        videoUrl || null,
        sanitizedUrl,
        ctaText,
        supportingText || null,
        badgeText || null,
        promotionalOffer || null,
        layout,
        status,
        startDate || null,
        endDate || null,
        parseInt(priority, 10) || 50,
        targetAudience || null,
        validCreatorId
      );

      // Audit Log
      db.prepare(`
        INSERT INTO advertisement_audit_logs (campaign_id, action, actor_id, actor_role, details_json)
        VALUES (?, 'CREATE', ?, ?, ?)
      `).run(campaignId, actorId, actorRole, JSON.stringify({ headline, placement, advertiserName }));
    });

    insertTx();

    const created = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(campaignId);
    return res.status(201).json({
      success: true,
      message: 'Advertisement campaign created successfully',
      data: created
    });
  } catch (err) {
    console.error('createCampaign error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
};

// 7. Operator / Admin: Update Campaign
exports.updateCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const {
      advertiserName,
      campaignName,
      placement,
      targetPages,
      mediaType,
      headline,
      subheading,
      description,
      imageUrl,
      videoUrl,
      destinationUrl,
      ctaText,
      supportingText,
      badgeText,
      promotionalOffer,
      layout,
      status,
      startDate,
      endDate,
      priority,
      targetAudience
    } = req.body;

    const updates = [];
    const params = [];

    if (advertiserName) { updates.push('advertiser_name = ?'); params.push(advertiserName.trim()); }
    if (campaignName) { updates.push('campaign_name = ?'); params.push(campaignName.trim()); }
    if (placement) { updates.push('placement = ?'); params.push(placement); }
    if (targetPages) { updates.push('target_pages = ?'); params.push(JSON.stringify(targetPages)); }
    if (mediaType) { updates.push('media_type = ?'); params.push(mediaType); }
    if (headline) { updates.push('headline = ?'); params.push(headline.trim()); }
    if (subheading !== undefined) { updates.push('subheading = ?'); params.push(subheading); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); params.push(imageUrl); }
    if (videoUrl !== undefined) { updates.push('video_url = ?'); params.push(videoUrl); }
    if (destinationUrl !== undefined) { updates.push('destination_url = ?'); params.push(sanitizeDestinationUrl(destinationUrl)); }
    if (ctaText !== undefined) { updates.push('cta_text = ?'); params.push(ctaText); }
    if (supportingText !== undefined) { updates.push('supporting_text = ?'); params.push(supportingText); }
    if (badgeText !== undefined) { updates.push('badge_text = ?'); params.push(badgeText); }
    if (promotionalOffer !== undefined) { updates.push('promotional_offer = ?'); params.push(promotionalOffer); }
    if (layout) { updates.push('layout = ?'); params.push(layout); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (startDate !== undefined) { updates.push('start_date = ?'); params.push(startDate); }
    if (endDate !== undefined) { updates.push('end_date = ?'); params.push(endDate); }
    if (priority !== undefined) { updates.push('priority = ?'); params.push(parseInt(priority, 10)); }
    if (targetAudience !== undefined) { updates.push('target_audience = ?'); params.push(targetAudience); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const actorId = req.user ? req.user.id : 'usr-operator-sunita';
    const actorRole = req.user ? req.user.role : 'OPERATOR';

    const updateTx = db.transaction(() => {
      db.prepare(`UPDATE advertisement_campaigns SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      db.prepare(`
        INSERT INTO advertisement_audit_logs (campaign_id, action, actor_id, actor_role, details_json)
        VALUES (?, 'UPDATE', ?, ?, ?)
      `).run(id, actorId, actorRole, JSON.stringify(req.body));
    });

    updateTx();

    const updated = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(id);
    return res.status(200).json({ success: true, message: 'Campaign updated successfully', data: updated });
  } catch (err) {
    console.error('updateCampaign error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update campaign' });
  }
};

// 8. Operator / Admin: Duplicate Campaign
exports.duplicateCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const original = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original campaign not found' });
    }

    const newId = `ad-camp-${Date.now()}`;
    const copyName = `${original.campaign_name} (Copy)`;
    const copyHeadline = `${original.headline} (Copy)`;
    const actorId = req.user ? req.user.id : 'usr-operator-sunita';
    const actorRole = req.user ? req.user.role : 'OPERATOR';

    const userExists = req.user?.id ? db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.id) : null;
    const validCreatorId = userExists ? userExists.id : null;

    const dupTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO advertisement_campaigns (
          id, advertiser_name, campaign_name, placement, target_pages, media_type,
          headline, subheading, description, image_url, video_url, destination_url,
          cta_text, supporting_text, badge_text, promotional_offer, layout, status,
          start_date, end_date, priority, target_audience, impressions, clicks, video_plays,
          created_by
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, 'DRAFT',
          ?, ?, ?, ?, 0, 0, 0,
          ?
        )
      `).run(
        newId,
        original.advertiser_name,
        copyName,
        original.placement,
        original.target_pages,
        original.media_type,
        copyHeadline,
        original.subheading,
        original.description,
        original.image_url,
        original.video_url,
        original.destination_url,
        original.cta_text,
        original.supporting_text,
        original.badge_text,
        original.promotional_offer,
        original.layout,
        original.start_date,
        original.end_date,
        original.priority,
        original.target_audience,
        validCreatorId
      );

      db.prepare(`
        INSERT INTO advertisement_audit_logs (campaign_id, action, actor_id, actor_role, details_json)
        VALUES (?, 'DUPLICATE', ?, ?, ?)
      `).run(newId, actorId, actorRole, JSON.stringify({ originalId: id }));
    });

    dupTx();

    const created = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(newId);
    return res.status(201).json({ success: true, message: 'Campaign duplicated successfully', data: created });
  } catch (err) {
    console.error('duplicateCampaign error:', err);
    return res.status(500).json({ success: false, message: 'Failed to duplicate campaign' });
  }
};

// 9. Operator / Admin: Toggle Status (LIVE, PAUSED, ARCHIVED, etc.)
exports.updateCampaignStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'LIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const actorId = req.user ? req.user.id : 'usr-operator-sunita';
    const actorRole = req.user ? req.user.role : 'OPERATOR';

    const tx = db.transaction(() => {
      db.prepare('UPDATE advertisement_campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status.toUpperCase(), id);
      db.prepare(`
        INSERT INTO advertisement_audit_logs (campaign_id, action, actor_id, actor_role, details_json)
        VALUES (?, 'STATUS_CHANGE', ?, ?, ?)
      `).run(id, actorId, actorRole, JSON.stringify({ oldStatus: existing.status, newStatus: status.toUpperCase() }));
    });

    tx();

    return res.status(200).json({ success: true, message: `Campaign status changed to ${status.toUpperCase()}` });
  } catch (err) {
    console.error('updateCampaignStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update campaign status' });
  }
};

// 10. Operator / Admin: Delete Campaign
exports.deleteCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM advertisement_campaigns WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const actorId = req.user ? req.user.id : 'usr-operator-sunita';
    const actorRole = req.user ? req.user.role : 'OPERATOR';

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM advertisement_campaigns WHERE id = ?').run(id);
      db.prepare(`
        INSERT INTO advertisement_audit_logs (campaign_id, action, actor_id, actor_role, details_json)
        VALUES (?, 'DELETE', ?, ?, ?)
      `).run(id, actorId, actorRole, JSON.stringify({ deletedHeadline: existing.headline }));
    });

    tx();

    return res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('deleteCampaign error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete campaign' });
  }
};

// 11. View Audit Logs
exports.getAuditLogs = (req, res) => {
  try {
    const { campaignId, limit = 50 } = req.query;
    let query = 'SELECT * FROM advertisement_audit_logs';
    const params = [];

    if (campaignId) {
      query += ' WHERE campaign_id = ?';
      params.push(campaignId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const logs = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
};

// 12. Operator Upload Ad Media (Image / Video / Logo)
exports.uploadMedia = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media file provided' });
    }

    const fileUrl = `/uploads/ads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Advertisement media uploaded and validated successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('uploadMedia error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload media file' });
  }
};
