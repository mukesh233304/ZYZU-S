import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import { generateToken } from '../src/utils/token';
import config from '../src/config';

describe('Advanced FocusPoint Advertisement Engine — Backend API & Telemetry Suite', () => {
  let superAdminToken;
  let createdCampaignId;

  beforeAll(() => {
    superAdminToken = generateToken({
      userId: '83a90e5f-c62a-4497-bee0-0f2725418c07',
      role: config.roles.SUPER_ADMIN
    });
  });

  describe('1. Public Live Advertisement Serving Across All 4 Service Pages', () => {
    it('GET /api/advertisements/live?page=FIND_TUTOR should return active campaigns for Home Tutors', async () => {
      const res = await request(app).get('/api/advertisements/live?page=FIND_TUTOR');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      // Verify campaigns contain required media, CTA, and verified advertisers
      const tutorCampaign = res.body.data.find(c => c.advertiserName === 'FocusPoint Academic Network');
      expect(tutorCampaign).toBeDefined();
      expect(tutorCampaign.status).toBe('LIVE');
      expect(tutorCampaign.destinationUrl).toBe('/find-tutor');
    });

    it('GET /api/advertisements/live?page=FIND_LIBRARY should return library campaigns', async () => {
      const res = await request(app).get('/api/advertisements/live?page=FIND_LIBRARY');
      expect(res.status).toBe(200);
      const libCampaign = res.body.data.find(c => c.advertiserName === 'Silent Study Hubs India');
      expect(libCampaign).toBeDefined();
    });

    it('GET /api/advertisements/live?page=MOCK_TESTS should return mock test engine campaigns', async () => {
      const res = await request(app).get('/api/advertisements/live?page=MOCK_TESTS');
      expect(res.status).toBe(200);
      const mockCampaign = res.body.data.find(c => c.advertiserName === 'FocusPoint Test Intelligence Studio');
      expect(mockCampaign).toBeDefined();
    });

    it('GET /api/advertisements/live?page=STUDY_MATERIALS should return study vault campaigns', async () => {
      const res = await request(app).get('/api/advertisements/live?page=STUDY_MATERIALS');
      expect(res.status).toBe(200);
      const studyCampaign = res.body.data.find(c => c.advertiserName === 'National Exam Publishers & Topper Vault');
      expect(studyCampaign).toBeDefined();
    });

    it('Campaigns must be returned in descending priority order', async () => {
      const res = await request(app).get('/api/advertisements/live?page=ALL');
      expect(res.status).toBe(200);
      for (let i = 0; i < res.body.data.length - 1; i++) {
        expect(res.body.data[i].priority).toBeGreaterThanOrEqual(res.body.data[i + 1].priority);
      }
    });

    it('Expired campaigns must automatically be excluded from live service', async () => {
      // Insert an expired campaign
      const expiredId = `ad-expired-test-${Date.now()}`;
      db.prepare(`
        INSERT INTO advertisement_campaigns (
          id, advertiser_name, campaign_name, placement, target_pages, media_type,
          headline, destination_url, status, start_date, end_date, priority
        ) VALUES (
          ?, 'Expired Brand', 'Old Drive', 'FIND_TUTOR_HERO', '["FIND_TUTOR"]', 'TEXT_ONLY',
          'Expired Promotion', '/find-tutor', 'LIVE', '2024-01-01', '2024-02-01', 99
        )
      `).run(expiredId);

      const res = await request(app).get('/api/advertisements/live?page=FIND_TUTOR');
      const found = res.body.data.some(c => c.id === expiredId);
      expect(found).toBe(false);

      // Clean up test ad
      db.prepare('DELETE FROM advertisement_campaigns WHERE id = ?').run(expiredId);
    });
  });

  describe('2. Real-time Telemetry Event Tracking & Non-Fabricated Metrics', () => {
    it('POST /api/advertisements/events records IMPRESSION event and updates counter', async () => {
      const beforeAd = db.prepare('SELECT impressions FROM advertisement_campaigns WHERE id = ?').get('ad-tutor-fp-01');

      const res = await request(app)
        .post('/api/advertisements/events')
        .send({
          campaignId: 'ad-tutor-fp-01',
          eventType: 'IMPRESSION',
          page: 'FIND_TUTOR'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const afterAd = db.prepare('SELECT impressions FROM advertisement_campaigns WHERE id = ?').get('ad-tutor-fp-01');
      expect(afterAd.impressions).toBe(beforeAd.impressions + 1);
    });

    it('POST /api/advertisements/events records CLICK event and updates counter', async () => {
      const beforeAd = db.prepare('SELECT clicks FROM advertisement_campaigns WHERE id = ?').get('ad-tutor-fp-01');

      const res = await request(app)
        .post('/api/advertisements/events')
        .send({
          campaignId: 'ad-tutor-fp-01',
          eventType: 'CLICK',
          page: 'FIND_TUTOR'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const afterAd = db.prepare('SELECT clicks FROM advertisement_campaigns WHERE id = ?').get('ad-tutor-fp-01');
      expect(afterAd.clicks).toBe(beforeAd.clicks + 1);
    });

    it('GET /api/advertisements/analytics/summary calculates true metrics without fake data', async () => {
      const res = await request(app).get('/api/advertisements/analytics/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const summary = res.body.summary;

      expect(summary.totalCampaigns).toBeGreaterThanOrEqual(5);
      expect(summary.activeCampaigns).toBeGreaterThanOrEqual(5);
      expect(summary.totalImpressions).toBeGreaterThan(0);
      expect(summary.totalClicks).toBeGreaterThan(0);
      expect(summary.averageCtr).toBeGreaterThan(0);
    });
  });

  describe('3. Operator & Admin Campaign Lifecycle, Sanitization & Audit Trail', () => {
    it('POST /api/advertisements creates campaign and sanitizes malicious destination URL', async () => {
      const uniqueId = `ad-test-sec-${Date.now()}`;
      const res = await request(app)
        .post('/api/advertisements')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          id: uniqueId,
          advertiserName: 'CyberEd Technologies',
          campaignName: 'Security Certification 2026',
          placement: 'MOCK_TEST_HERO',
          targetPages: ['MOCK_TESTS'],
          mediaType: 'TEXT_ONLY',
          headline: 'Certified Ethical Hacker Mock Arena',
          destinationUrl: 'javascript:alert("XSS")', // Malicious input
          ctaText: 'Enroll Now',
          status: 'LIVE',
          priority: 80
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(uniqueId);
      // Malicious URL must be sanitized to safe default '/'
      expect(res.body.data.destination_url).toBe('/');

      createdCampaignId = uniqueId;
    });

    it('POST /api/advertisements/:id/duplicate duplicates campaign into DRAFT status with reset counters', async () => {
      const res = await request(app)
        .post(`/api/advertisements/${createdCampaignId}/duplicate`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.impressions).toBe(0);
      expect(res.body.data.clicks).toBe(0);
      expect(res.body.data.campaign_name).toContain('(Copy)');

      // Clean up duplicate
      db.prepare('DELETE FROM advertisement_campaigns WHERE id = ?').run(res.body.data.id);
    });

    it('PATCH /api/advertisements/:id/status updates lifecycle status to PAUSED', async () => {
      const res = await request(app)
        .patch(`/api/advertisements/${createdCampaignId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'PAUSED' });

      expect(res.status).toBe(200);
      const check = db.prepare('SELECT status FROM advertisement_campaigns WHERE id = ?').get(createdCampaignId);
      expect(check.status).toBe('PAUSED');
    });

    it('DELETE /api/advertisements/:id deletes campaign', async () => {
      const res = await request(app)
        .delete(`/api/advertisements/${createdCampaignId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      const check = db.prepare('SELECT id FROM advertisement_campaigns WHERE id = ?').get(createdCampaignId);
      expect(check).toBeUndefined();
    });

    it('POST /api/advertisements/upload-media uploads valid promotional media and returns public url', async () => {
      const res = await request(app)
        .post('/api/advertisements/upload-media')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .attach('file', Buffer.from('fake image content'), 'promo_banner.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/^\/uploads\/ads\/ad_promo_banner_/);
      expect(res.body.data.mimeType).toBe('image/png');
    });

    it('POST /api/advertisements/upload-media rejects dangerous executable files', async () => {
      const res = await request(app)
        .post('/api/advertisements/upload-media')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .attach('file', Buffer.from('echo malicious'), 'malicious_script.sh');

      expect(res.status).toBe(500);
    });

    it('GET /api/advertisements/audit/logs returns audit history for operations', async () => {
      const res = await request(app)
        .get('/api/advertisements/audit/logs')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      const actions = res.body.data.map(l => l.action);
      expect(actions).toContain('CREATE');
      expect(actions).toContain('STATUS_CHANGE');
      expect(actions).toContain('DELETE');
    });
  });
});
