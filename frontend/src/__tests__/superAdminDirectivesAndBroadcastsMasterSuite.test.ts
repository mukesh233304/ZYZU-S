import { describe, it, expect, beforeEach, vi } from 'vitest';
import { directiveService } from '../services/directiveService';
import { auditService } from '../services/auditService';
import { safeStorage } from '../utils/storageUtils';
import { 
  SuperAdminDirectiveRecord, 
  DirectiveCategory, 
  DirectivePriority, 
  BroadcastAudience, 
  BroadcastChannel 
} from '../types';

describe('FOCUSPOINT — SUPER ADMIN DIRECTIVES & BROADCASTS MASTER SUITE', () => {
  beforeEach(() => {
    safeStorage.removeItem('fp_super_admin_directives_v1');
    safeStorage.removeItem('fp_super_admin_audit_logs_v2');
  });

  describe('1. Default Directives Initialization & Persistence', () => {
    it('initializes default sovereign directives in safeStorage when empty', () => {
      const raw = directiveService.getRawDirectives();
      expect(raw).toBeDefined();
      expect(raw.length).toBeGreaterThanOrEqual(6);

      // Verify stored in safeStorage
      const stored = safeStorage.getItem('fp_super_admin_directives_v1');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(raw.length);
    });

    it('contains emergency, policy, promotional, tax, and maintenance circulars in default seeds', () => {
      const raw = directiveService.getRawDirectives();
      const categories = new Set(raw.map(d => d.category));

      expect(categories.has('POLICY_CIRCULAR')).toBe(true);
      expect(categories.has('EMERGENCY_ALERT')).toBe(true);
      expect(categories.has('PROMOTIONAL_CAMPAIGN')).toBe(true);
      expect(categories.has('REGULATORY_TAX')).toBe(true);
      expect(categories.has('SYSTEM_MAINTENANCE')).toBe(true);
    });

    it('verifies critical sovereign attributes on emergency SOS circular', () => {
      const raw = directiveService.getRawDirectives();
      const floodAlert = raw.find(d => d.id === 'DIR-2026-02');

      expect(floodAlert).toBeDefined();
      expect(floodAlert?.priority).toBe('EMERGENCY_SOS');
      expect(floodAlert?.category).toBe('EMERGENCY_ALERT');
      expect(floodAlert?.district).toBe('Ghazipur');
      expect(floodAlert?.channels).toContain('SMS');
      expect(floodAlert?.channels).toContain('WHATSAPP');
      expect(floodAlert?.channels).toContain('IN_APP');
      expect(floodAlert?.requiresAck).toBe(true);
      expect(floodAlert?.openRate).toBeGreaterThan(95);
    });

    it('persists changes accurately via saveDirectives', () => {
      const raw = directiveService.getRawDirectives();
      const modified = raw.map(d => ({ ...d, deliveredCount: (d.deliveredCount || 0) + 50 }));
      directiveService.saveDirectives(modified);

      const refreshed = directiveService.getRawDirectives();
      expect(refreshed[0].deliveredCount).toBe(modified[0].deliveredCount);
    });
  });

  describe('2. Multi-Dimensional Directives Filtering & Querying', () => {
    it('fetches all directives sorted chronologically by default', async () => {
      const list = await directiveService.getDirectives();
      expect(list.length).toBeGreaterThanOrEqual(6);

      // Chronological order verification
      for (let i = 1; i < list.length; i++) {
        const prev = new Date(list[i - 1].date).getTime();
        const curr = new Date(list[i].date).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });

    it('filters strictly by category', async () => {
      const emergencyOnly = await directiveService.getDirectives({ category: 'EMERGENCY_ALERT' });
      expect(emergencyOnly.length).toBeGreaterThan(0);
      emergencyOnly.forEach(d => {
        expect(d.category).toBe('EMERGENCY_ALERT');
      });

      const promoOnly = await directiveService.getDirectives({ category: 'PROMOTIONAL_CAMPAIGN' });
      expect(promoOnly.length).toBeGreaterThan(0);
      promoOnly.forEach(d => {
        expect(d.category).toBe('PROMOTIONAL_CAMPAIGN');
      });
    });

    it('filters strictly by priority', async () => {
      const sosList = await directiveService.getDirectives({ priority: 'EMERGENCY_SOS' });
      expect(sosList.length).toBeGreaterThan(0);
      sosList.forEach(d => {
        expect(d.priority).toBe('EMERGENCY_SOS');
      });

      const importantList = await directiveService.getDirectives({ priority: 'IMPORTANT' });
      expect(importantList.length).toBeGreaterThan(0);
      importantList.forEach(d => {
        expect(d.priority).toBe('IMPORTANT');
      });
    });

    it('filters strictly by target audience', async () => {
      const libDirectives = await directiveService.getDirectives({ audience: 'LIBRARIES' });
      expect(libDirectives.length).toBeGreaterThan(0);
      libDirectives.forEach(d => {
        expect(d.targetAudience).toBe('LIBRARIES');
      });

      const studentDirectives = await directiveService.getDirectives({ audience: 'STUDENTS' });
      expect(studentDirectives.length).toBeGreaterThan(0);
      studentDirectives.forEach(d => {
        expect(d.targetAudience).toBe('STUDENTS');
      });
    });

    it('filters by territory and handles Pan-India fallback inclusions', async () => {
      const ghazipurDirectives = await directiveService.getDirectives({ district: 'Ghazipur' });
      expect(ghazipurDirectives.length).toBeGreaterThan(0);
      ghazipurDirectives.forEach(d => {
        const isMatch = d.district?.toLowerCase() === 'ghazipur' || d.district === 'Pan-India';
        expect(isMatch).toBe(true);
      });
    });

    it('filters strictly by broadcast channel', async () => {
      const smsOnly = await directiveService.getDirectives({ channel: 'SMS' });
      expect(smsOnly.length).toBeGreaterThan(0);
      smsOnly.forEach(d => {
        expect(d.channels).toContain('SMS');
      });
    });

    it('executes full-text keyword search across titles, messages, and IDs', async () => {
      const searchRes1 = await directiveService.getDirectives({ search: 'biometric' });
      expect(searchRes1.length).toBeGreaterThan(0);
      expect(searchRes1[0].title.toLowerCase()).toContain('biometric');

      const searchRes2 = await directiveService.getDirectives({ search: 'Saidpur' });
      expect(searchRes2.length).toBeGreaterThan(0);
      expect(searchRes2[0].message.toLowerCase()).toContain('saidpur');

      const searchById = await directiveService.getDirectives({ search: 'DIR-2026-01' });
      expect(searchById.length).toBe(1);
      expect(searchById[0].id).toBe('DIR-2026-01');
    });
  });

  describe('3. Audience Reach Estimation Engine', () => {
    it('estimates full audience reach for Pan-India targets', () => {
      const allReach = directiveService.estimateAudienceReach('ALL_USERS', 'Pan-India');
      expect(allReach.totalRecipients).toBeGreaterThan(3900);
      expect(allReach.studentsCount).toBe(3600);
      expect(allReach.teachersCount).toBe(280);
      expect(allReach.libraryCount).toBe(64);
      expect(allReach.adminCount).toBe(6);
      expect(allReach.operatorCount).toBe(18);

      // Verify channel coverage estimations
      expect(allReach.channelCoverage.IN_APP).toBeGreaterThan(3800);
      expect(allReach.channelCoverage.WHATSAPP).toBeGreaterThan(3600);
      expect(allReach.channelCoverage.SMS).toBeGreaterThan(3800);
      expect(allReach.channelCoverage.EMAIL).toBeGreaterThan(3000);
    });

    it('scales reach appropriately for local district targeting (Ghazipur)', () => {
      const localReach = directiveService.estimateAudienceReach('ALL_USERS', 'Ghazipur');
      const panIndiaReach = directiveService.estimateAudienceReach('ALL_USERS', 'Pan-India');

      expect(localReach.totalRecipients).toBeLessThan(panIndiaReach.totalRecipients);
      expect(localReach.totalRecipients).toBe(992);
      expect(localReach.adminCount).toBe(1);
    });

    it('estimates isolated segmented audiences correctly', () => {
      const studentsOnly = directiveService.estimateAudienceReach('STUDENTS', 'Pan-India');
      expect(studentsOnly.totalRecipients).toBe(3600);

      const teachersOnly = directiveService.estimateAudienceReach('TEACHERS', 'Pan-India');
      expect(teachersOnly.totalRecipients).toBe(280);

      const librariesOnly = directiveService.estimateAudienceReach('LIBRARIES', 'Pan-India');
      expect(librariesOnly.totalRecipients).toBe(64);

      const adminsOnly = directiveService.estimateAudienceReach('DISTRICT_ADMINS', 'Pan-India');
      expect(adminsOnly.totalRecipients).toBe(6);

      const operatorsOnly = directiveService.estimateAudienceReach('OPERATORS', 'Pan-India');
      expect(operatorsOnly.totalRecipients).toBe(18);
    });
  });

  describe('4. Dispatching Directives & Immutable Audit Trail Integration', () => {
    it('creates a new directive with dynamic sequential ID and persists it', async () => {
      const draft = {
        title: 'Emergency Severe Cold Wave Self-Study Hall Timing Reschedule',
        message: 'All libraries must open after 08:00 AM and provide warm drinking water facilities.',
        category: 'POLICY_CIRCULAR' as DirectiveCategory,
        priority: 'IMPORTANT' as DirectivePriority,
        targetAudience: 'LIBRARIES' as BroadcastAudience,
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        channels: ['IN_APP', 'WHATSAPP'] as BroadcastChannel[],
        requiresAck: true,
        expiresAt: '2026-11-20',
        metadata: { circularNumber: 'CW-2026-09' }
      };

      const initialCount = directiveService.getRawDirectives().length;
      const created = await directiveService.createDirective(draft);

      expect(created).toBeDefined();
      expect(created.id).toBe(`DIR-${new Date().getFullYear()}-${String(initialCount + 1).padStart(2, '0')}`);
      expect(created.title).toBe(draft.title);
      expect(created.status).toBe('ACTIVE');
      expect(created.deliveredCount).toBeGreaterThan(0);
      expect(created.targetAudienceLabel).toBe('Study Hall Owners & Admins');
      expect(created.channels).toEqual(['IN_APP', 'WHATSAPP']);
      expect(created.requiresAck).toBe(true);

      // Verify in refreshed list
      const refreshed = await directiveService.getDirectives();
      expect(refreshed[0].id).toBe(created.id);
    });

    it('automatically records an immutable audit log when a directive is dispatched', async () => {
      const initialAuditLogs = await auditService.getAuditLogs();
      const initialCount = initialAuditLogs.length;

      await directiveService.createDirective({
        title: 'Urgent Ballia Center Network Failover Notification',
        message: 'Secondary fiber route engaged for Ballia Mock Hall #02.',
        category: 'SYSTEM_MAINTENANCE',
        priority: 'EMERGENCY_SOS',
        targetAudience: 'OPERATORS',
        district: 'Ballia',
        channels: ['IN_APP', 'SMS'],
        requiresAck: false
      });

      const updatedAuditLogs = await auditService.getAuditLogs();
      expect(updatedAuditLogs.length).toBe(initialCount + 1);

      const latestLog = updatedAuditLogs[0];
      expect(latestLog.action).toBe('BROADCAST_DIRECTIVE_DISPATCHED:EMERGENCY_SOS');
      expect(latestLog.module).toBe('SYSTEM_GOVERNANCE');
      expect(latestLog.target).toBe('Urgent Ballia Center Network Failover Notification');
      expect(latestLog.severity).toBe('CRITICAL');
      expect(latestLog.district).toBe('Ballia');
    });

    it('assigns higher initial open rate to EMERGENCY_SOS priority dispatches', async () => {
      const routine = await directiveService.createDirective({
        title: 'Routine Platform Cleanup Notice',
        message: 'Minor server logs archiving scheduled.',
        category: 'SYSTEM_MAINTENANCE',
        priority: 'ROUTINE',
        targetAudience: 'OPERATORS',
        channels: ['IN_APP']
      });

      const sos = await directiveService.createDirective({
        title: 'CRITICAL SECURITY BREACH ALERT TEST',
        message: 'Immediate verification required.',
        category: 'EMERGENCY_ALERT',
        priority: 'EMERGENCY_SOS',
        targetAudience: 'ALL_USERS',
        channels: ['SMS', 'WHATSAPP']
      });

      expect(sos.openRate).toBeGreaterThan(routine.openRate);
      expect(sos.openRate).toBe(99.2);
    });
  });

  describe('5. Directives Lifecycle, Re-broadcasting & Status Updates', () => {
    it('retrieves individual directive record by ID', async () => {
      const found = await directiveService.getDirectiveById('DIR-2026-01');
      expect(found).not.toBeNull();
      expect(found?.title).toContain('Biometric');

      const nonExistent = await directiveService.getDirectiveById('DIR-NON-EXISTENT-99');
      expect(nonExistent).toBeNull();
    });

    it('updates directive status to ARCHIVED and REVOKED', async () => {
      const updated = await directiveService.updateStatus('DIR-2026-03', 'ARCHIVED');
      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('ARCHIVED');

      const reCheck = await directiveService.getDirectiveById('DIR-2026-03');
      expect(reCheck?.status).toBe('ARCHIVED');

      const revoked = await directiveService.updateStatus('DIR-2026-03', 'REVOKED');
      expect(revoked?.status).toBe('REVOKED');
    });

    it('handles non-existent directive status update gracefully', async () => {
      const result = await directiveService.updateStatus('DIR-INVALID', 'ACTIVE');
      expect(result).toBeNull();
    });

    it('simulates re-broadcasting to unread recipients and increments reach', async () => {
      const before = await directiveService.getDirectiveById('DIR-2026-01');
      const initialDelivered = before?.deliveredCount || 0;
      const initialOpenRate = before?.openRate || 0;

      const after = await directiveService.resendBroadcast('DIR-2026-01');
      expect(after).not.toBeNull();
      expect(after!.deliveredCount).toBeGreaterThan(initialDelivered);
      expect(after!.openRate).toBeGreaterThanOrEqual(initialOpenRate);
    });
  });

  describe('6. Telemetry & Summary Statistics', () => {
    it('accurately computes telemetry cards summary statistics', async () => {
      const stats = await directiveService.getDirectiveStats();

      expect(stats.totalDirectives).toBeGreaterThanOrEqual(6);
      expect(stats.activeAlerts).toBeGreaterThanOrEqual(2);
      expect(stats.emergencySosCount).toBeGreaterThanOrEqual(1);
      expect(stats.totalReach).toBeGreaterThan(5000);
      expect(stats.averageOpenRate).toBeGreaterThan(80);
      expect(stats.channelsActive).toBe(4);
    });
  });

  describe('7. Multi-Format Sovereign Export Engine', () => {
    it('exports directives dataset into valid JSON format', async () => {
      const list = await directiveService.getDirectives();
      const jsonExport = directiveService.exportDirectives('json', list);

      expect(typeof jsonExport).toBe('string');
      const parsed = JSON.parse(jsonExport);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(list.length);
      expect(parsed[0].id).toBe(list[0].id);
    });

    it('exports directives dataset into valid CSV format with standard headers', async () => {
      const list = await directiveService.getDirectives();
      const csvExport = directiveService.exportDirectives('csv', list);

      expect(typeof csvExport).toBe('string');
      const lines = csvExport.split('\n');
      expect(lines.length).toBe(list.length + 1); // 1 header + N rows

      const header = lines[0];
      expect(header).toContain('DirectiveID');
      expect(header).toContain('Title');
      expect(header).toContain('Category');
      expect(header).toContain('Priority');
      expect(header).toContain('Audience');
      expect(header).toContain('Channels');
      expect(header).toContain('DeliveredCount');
      expect(header).toContain('OpenRate');
    });

    it('exports directives into official sovereign memo memorandum layout', async () => {
      const list = await directiveService.getDirectives();
      const memoExport = directiveService.exportDirectives('memo', list);

      expect(typeof memoExport).toBe('string');
      expect(memoExport).toContain('FOCUSPOINT ENTERPRISE SOVEREIGN DIRECTIVES & BROADCAST DOSSIER');
      expect(memoExport).toContain('Mukesh Sonkar (Root Super Admin)');
      expect(memoExport).toContain('DIRECTIVES MANIFEST:');
      expect(memoExport).toContain(list[0].id);
      expect(memoExport).toContain(list[0].title);
    });
  });
});
