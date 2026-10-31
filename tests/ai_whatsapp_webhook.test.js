import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import aiNotificationAgentService from '../src/services/aiNotificationAgentService';
import notificationPreferenceService from '../src/services/notificationPreferenceService';

describe('FOCUSPOINT BACKEND AI AGENT — META WHATSAPP WEBHOOK & INBOUND OPT-OUT SUITE', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM ai_whatsapp_dispatches').run();
    db.prepare('DELETE FROM user_notification_preferences').run();
    db.prepare('DELETE FROM ai_automation_audit_logs').run();

    // Default automation settings
    aiNotificationAgentService.updateAutomationConfig({
      globalAutomationEnabled: true,
      whatsAppChannelEnabled: true,
      inAppChannelEnabled: true
    });
  });

  it('Verifies Meta webhook challenge handshake with valid verify token', async () => {
    const res = await request(app)
      .get('/api/ai-notifications/whatsapp/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'focuspoint_wa_verify_token_2026',
        'hub.challenge': 'CHALLENGE_ACCEPTED_12345'
      });

    expect(res.status).toBe(200);
    expect(res.text).toBe('CHALLENGE_ACCEPTED_12345');
  });

  it('Rejects Meta webhook verification with invalid verify token', async () => {
    const res = await request(app)
      .get('/api/ai-notifications/whatsapp/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'WRONG_UNAUTHORIZED_TOKEN',
        'hub.challenge': 'CHALLENGE_XYZ'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('Processes inbound STOP keyword from user and immediately revokes promotional consent', async () => {
    // 1. Initial consent granted
    notificationPreferenceService.setPromotionalConsentByPhone('9876543210', true);
    expect(notificationPreferenceService.getPreferences('phone-9876543210').promotionalWhatsAppOptIn).toBe(true);

    // 2. Inbound Meta Webhook payload with 'STOP'
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+91 9196434387', phone_number_id: 'FP_BOT_ID' },
                messages: [
                  {
                    from: '919876543210',
                    id: 'wamid.HBgLMTAwMD',
                    timestamp: '1729000000',
                    text: { body: 'STOP' },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const res = await request(app)
      .post('/api/ai-notifications/whatsapp/webhook')
      .send(webhookPayload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('EVENT_RECEIVED');

    // 3. Verify consent is revoked
    const prefs = notificationPreferenceService.getPreferences('phone-9876543210');
    expect(prefs.promotionalWhatsAppOptIn).toBe(false);

    // 4. Verify immutable audit log was created
    const logs = aiNotificationAgentService.getAuditLogs({ category: 'OPT_OUT' });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe('WHATSAPP_OPT_OUT');
    expect(logs[0].details).toContain('STOP');
  });

  it('Processes inbound START keyword from user and restores promotional consent', async () => {
    // 1. Initially opted out
    notificationPreferenceService.setPromotionalConsentByPhone('9876543210', false);
    expect(notificationPreferenceService.getPreferences('phone-9876543210').promotionalWhatsAppOptIn).toBe(false);

    // 2. Inbound Meta Webhook payload with 'START'
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '919876543210',
                    id: 'wamid.HBgLMTAwMDE=',
                    timestamp: '1729000005',
                    text: { body: 'START' },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const res = await request(app)
      .post('/api/ai-notifications/whatsapp/webhook')
      .send(webhookPayload);

    expect(res.status).toBe(200);

    // 3. Verify consent restored
    const prefs = notificationPreferenceService.getPreferences('phone-9876543210');
    expect(prefs.promotionalWhatsAppOptIn).toBe(true);

    // 4. Verify audit log recorded
    const logs = aiNotificationAgentService.getAuditLogs();
    const optInLog = logs.find(l => l.action === 'WHATSAPP_OPT_IN');
    expect(optInLog).toBeDefined();
  });

  it('Updates provider delivery receipts (delivered, read, failed)', async () => {
    const providerMsgId = 'wamid.test_delivery_receipt_999';

    // 1. Seed a dispatch record
    db.prepare(`
      INSERT INTO ai_whatsapp_dispatches (
        id, user_id, recipient_phone, service_category, template_id, rendered_message, deep_link, consent_verified, status, provider_message_id
      ) VALUES (
        'disp-receipt-test', 'user-test', '9876543210', 'LIBRARY', 'tpl-lib', 'Test message', 'https://focuspoint.app', 1, 'SENT', ?
      )
    `).run(providerMsgId);

    // 2. Inbound delivery status receipt
    const statusPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_ACCOUNT',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                statuses: [
                  {
                    id: providerMsgId,
                    status: 'delivered',
                    timestamp: '1729000100',
                    recipient_id: '919876543210'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const res = await request(app)
      .post('/api/ai-notifications/whatsapp/webhook')
      .send(statusPayload);

    expect(res.status).toBe(200);

    // 3. Verify database record status updated to DELIVERED with delivered_at set
    const record = db.prepare('SELECT * FROM ai_whatsapp_dispatches WHERE id = ?').get('disp-receipt-test');
    expect(record.status).toBe('DELIVERED');
    expect(record.delivered_at).toBeDefined();
  });

  it('Supports direct interactive inbound simulation endpoint for testing lab', async () => {
    const res = await request(app)
      .post('/api/ai-notifications/whatsapp/simulate-inbound')
      .send({
        phone: '9988776655',
        text: 'STOP'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.action).toBe('OPT_OUT');
    expect(res.body.data.consentGranted).toBe(false);
    expect(res.body.data.autoReply).toContain('unsubscribed');
  });
});
