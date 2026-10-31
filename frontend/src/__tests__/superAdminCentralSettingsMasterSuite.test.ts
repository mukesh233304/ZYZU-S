import { describe, it, expect, beforeEach } from 'vitest';
import { 
  centralSettingsService, 
  DEFAULT_CENTRAL_SETTINGS, 
  PRESET_PROFILES 
} from '../services/centralSettingsService';
import { auditService } from '../services/auditService';
import { safeStorage } from '../utils/storageUtils';
import { CentralPlatformSettings } from '../types';

describe('FOCUSPOINT — SUPER ADMIN CENTRAL ARCHITECTURE & SETTINGS MASTER SUITE', () => {
  beforeEach(() => {
    safeStorage.removeItem('fp_central_platform_settings_v2');
    safeStorage.removeItem('fp_super_admin_audit_logs_v2');
  });

  describe('1. Default Settings Genesis Initialization & Persistence', () => {
    it('initializes default platform architecture settings in safeStorage when empty', () => {
      const settings = centralSettingsService.getSettings();

      expect(settings).toBeDefined();
      expect(settings.version).toContain('SOVEREIGN');
      expect(settings.tuitionCommissionPercent).toBe(10.0);
      expect(settings.libraryCommissionPercent).toBe(8.0);
      expect(settings.districtAdminRoyaltySharePercent).toBe(3.0);
      expect(settings.gstRatePercent).toBe(18.0);
      expect(settings.singleAdminPerDistrictEnforced).toBe(true);
      expect(settings.twoFactorAuthEnforced).toBe(true);
      expect(settings.aiForecastingModel).toBe('GEMINI_2_FLASH');

      // Verify persisted in storage
      const stored = safeStorage.getItem('fp_central_platform_settings_v2');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(settings.version);
    });

    it('covers all 6 sovereign modules in default baseline', () => {
      const s = centralSettingsService.getSettings();

      // Module 1: Financial & Tax
      expect(s.tuitionCommissionPercent).toBeGreaterThan(0);
      expect(s.gstRatePercent).toBe(18);
      expect(s.minimumPayoutThresholdINR).toBe(500);

      // Module 2: Security & Sovereignty
      expect(s.singleAdminPerDistrictEnforced).toBe(true);
      expect(s.twoFactorAuthEnforced).toBe(true);
      expect(s.quantumResistantHashRounds).toBe(12);

      // Module 3: Gateways & Telecom
      expect(s.whatsappCloudApiEnabled).toBe(true);
      expect(s.dltTransactionalSmsEnabled).toBe(true);
      expect(s.smtpHost).toContain('focuspoint');

      // Module 4: AI Core
      expect(s.predictiveAnomalyDetectionEnabled).toBe(true);
      expect(s.smartPricingEngineEnabled).toBe(true);

      // Module 5: Infrastructure & Database
      expect(s.insforgeRemoteServiceUrl).toContain('insforge');
      expect(s.databasePoolMaxConnections).toBe(100);

      // Module 6: Emergency Circuit Breakers
      expect(s.platformMaintenanceBannerMode).toBe(false);
      expect(s.emergencyReadOnlyCircuitBreaker).toBe(false);
      expect(s.emergencyPayoutFreeze).toBe(false);
    });
  });

  describe('2. Differences & Change Tracking Engine', () => {
    it('returns empty diff array when comparing identical configurations', () => {
      const baseline = centralSettingsService.getSettings();
      const candidate = { ...baseline };

      const diffs = centralSettingsService.computeDiff(baseline, candidate);
      expect(diffs).toHaveLength(0);
    });

    it('accurately detects single and multiple policy changes with previous and new values', () => {
      const baseline = centralSettingsService.getSettings();
      const candidate: CentralPlatformSettings = {
        ...baseline,
        tuitionCommissionPercent: 12.5,
        sessionTimeoutMinutes: 30,
        platformMaintenanceBannerMode: true
      };

      const diffs = centralSettingsService.computeDiff(baseline, candidate);
      expect(diffs).toHaveLength(3);

      const commissionDiff = diffs.find(d => d.key === 'tuitionCommissionPercent');
      expect(commissionDiff).toBeDefined();
      expect(commissionDiff?.previousValue).toBe(10.0);
      expect(commissionDiff?.newValue).toBe(12.5);
      expect(commissionDiff?.category).toBe('FINANCIAL_ECONOMICS');

      const timeoutDiff = diffs.find(d => d.key === 'sessionTimeoutMinutes');
      expect(timeoutDiff).toBeDefined();
      expect(timeoutDiff?.previousValue).toBe(60);
      expect(timeoutDiff?.newValue).toBe(30);

      const bannerDiff = diffs.find(d => d.key === 'platformMaintenanceBannerMode');
      expect(bannerDiff).toBeDefined();
      expect(bannerDiff?.previousValue).toBe(false);
      expect(bannerDiff?.newValue).toBe(true);
    });

    it('accurately identifies array modifications such as whitelisted IPs', () => {
      const baseline = centralSettingsService.getSettings();
      const candidate: CentralPlatformSettings = {
        ...baseline,
        whitelistedIps: ['103.21.244.0/24', '192.168.1.1/32']
      };

      const diffs = centralSettingsService.computeDiff(baseline, candidate);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].key).toBe('whitelistedIps');
    });
  });

  describe('3. Persisting Settings & Merkle Audit Trail Integration', () => {
    it('persists policy updates to safeStorage and updates timestamp', async () => {
      const initial = centralSettingsService.getSettings();
      const candidate: CentralPlatformSettings = {
        ...initial,
        libraryCommissionPercent: 9.5
      };

      const { settings, diffs } = await centralSettingsService.saveSettings(candidate, 'Mukesh Sonkar (Root Super Admin)');
      expect(diffs).toHaveLength(1);
      expect(settings.libraryCommissionPercent).toBe(9.5);

      const retrieved = centralSettingsService.getSettings();
      expect(retrieved.libraryCommissionPercent).toBe(9.5);
    });

    it('automatically logs an immutable audit trail entry when policies are modified', async () => {
      const initialLogs = await auditService.getAuditLogs();
      const initialCount = initialLogs.length;

      const current = centralSettingsService.getSettings();
      const candidate: CentralPlatformSettings = {
        ...current,
        singleAdminPerDistrictEnforced: false, // Critical governance override
        tuitionCommissionPercent: 14.0
      };

      await centralSettingsService.saveSettings(candidate, 'Mukesh Sonkar');

      const updatedLogs = await auditService.getAuditLogs();
      expect(updatedLogs.length).toBe(initialCount + 1);

      const latest = updatedLogs[0];
      expect(latest.action).toBe('CENTRAL_SETTINGS_UPDATED');
      expect(latest.module).toBe('SYSTEM_GOVERNANCE');
      expect(latest.severity).toBe('CRITICAL');
      expect(latest.newValue).toContain('Home Tuition Base Commission');
      expect(latest.newValue).toContain('10 -> 14');
    });

    it('does not generate audit logs if saved with 0 differences', async () => {
      const initialLogs = await auditService.getAuditLogs();
      const initialCount = initialLogs.length;

      const current = centralSettingsService.getSettings();
      await centralSettingsService.saveSettings(current);

      const refreshedLogs = await auditService.getAuditLogs();
      expect(refreshedLogs.length).toBe(initialCount);
    });
  });

  describe('4. Preset Profile Blueprints', () => {
    it('applies HIGH_SECURITY_STRICT preset profile accurately', async () => {
      const { settings } = await centralSettingsService.applyPreset('HIGH_SECURITY_STRICT');

      expect(settings.sessionTimeoutMinutes).toBe(15);
      expect(settings.corporateIpWhitelisting).toBe(true);
      expect(settings.quantumResistantHashRounds).toBe(16);
      expect(settings.maxLoginAttemptsBeforeLockout).toBe(3);
      expect(settings.lockoutDurationMinutes).toBe(60);
      expect(settings.disasterRecoveryProtocolLevel).toBe('LEVEL_1_WARNING');
    });

    it('applies EXAM_RUSH_OPTIMIZED preset profile accurately', async () => {
      const { settings } = await centralSettingsService.applyPreset('EXAM_RUSH_OPTIMIZED');

      expect(settings.databasePoolMaxConnections).toBe(250);
      expect(settings.offlineSyncIntervalSeconds).toBe(15);
      expect(settings.dailySmsQuotaLimit).toBe(100000);
      expect(settings.executiveReportFrequency).toBe('DAILY');
      expect(settings.smartPricingEngineEnabled).toBe(true);
    });

    it('applies DISASTER_CRISIS_LOCKDOWN preset circuit breakers', async () => {
      const { settings } = await centralSettingsService.applyPreset('DISASTER_CRISIS_LOCKDOWN');

      expect(settings.platformMaintenanceBannerMode).toBe(true);
      expect(settings.emergencyReadOnlyCircuitBreaker).toBe(true);
      expect(settings.emergencyPayoutFreeze).toBe(true);
      expect(settings.disasterRecoveryProtocolLevel).toBe('LEVEL_3_LOCKDOWN');
    });

    it('applies DEFAULT_STANDARD to restore standard operations', async () => {
      // First lockdown
      await centralSettingsService.applyPreset('DISASTER_CRISIS_LOCKDOWN');
      // Then restore standard
      const { settings } = await centralSettingsService.applyPreset('DEFAULT_STANDARD');

      expect(settings.platformMaintenanceBannerMode).toBe(false);
      expect(settings.emergencyReadOnlyCircuitBreaker).toBe(false);
      expect(settings.emergencyPayoutFreeze).toBe(false);
      expect(settings.disasterRecoveryProtocolLevel).toBe('LEVEL_0_NORMAL');
    });
  });

  describe('5. Factory Genesis Baseline Reset', () => {
    it('restores all settings to factory default baseline and logs audit entry', async () => {
      // Mutate several settings
      const modified: CentralPlatformSettings = {
        ...DEFAULT_CENTRAL_SETTINGS,
        tuitionCommissionPercent: 25.0,
        twoFactorAuthEnforced: false,
        emergencyPayoutFreeze: true
      };
      await centralSettingsService.saveSettings(modified);

      // Verify mutations applied
      expect(centralSettingsService.getSettings().tuitionCommissionPercent).toBe(25.0);

      // Reset to defaults
      const defaults = await centralSettingsService.resetToDefaults('Root Super Admin');
      expect(defaults.tuitionCommissionPercent).toBe(10.0);
      expect(defaults.twoFactorAuthEnforced).toBe(true);
      expect(defaults.emergencyPayoutFreeze).toBe(false);

      const refreshed = centralSettingsService.getSettings();
      expect(refreshed.tuitionCommissionPercent).toBe(10.0);
    });
  });

  describe('6. Telemetry & Security Rating Calculation', () => {
    it('computes high security rating score when all protective policies are engaged', () => {
      const current = centralSettingsService.getSettings();
      const telemetry = centralSettingsService.getTelemetrySummary(current, 0);

      expect(telemetry.securityRatingScore).toBeGreaterThanOrEqual(90);
      expect(telemetry.activeGatewaysCount).toBe(3);
      expect(telemetry.baseCommissionMargin).toBe(18.0); // 10% + 8%
      expect(telemetry.killswitchEngaged).toBe(false);
      expect(telemetry.databaseLatencyMs).toBe(18);
    });

    it('reflects engaged killswitch status when circuit breaker is active', () => {
      const current = centralSettingsService.getSettings();
      const locked: CentralPlatformSettings = {
        ...current,
        emergencyReadOnlyCircuitBreaker: true
      };

      const telemetry = centralSettingsService.getTelemetrySummary(locked, 1);
      expect(telemetry.killswitchEngaged).toBe(true);
      expect(telemetry.pendingChangesCount).toBe(1);
    });

    it('reduces security rating if 2FA or 1-admin rule is disabled', () => {
      const current = centralSettingsService.getSettings();
      const baseScore = centralSettingsService.getTelemetrySummary(current).securityRatingScore;

      const degraded: CentralPlatformSettings = {
        ...current,
        twoFactorAuthEnforced: false,
        singleAdminPerDistrictEnforced: false
      };
      const degradedScore = centralSettingsService.getTelemetrySummary(degraded).securityRatingScore;

      expect(degradedScore).toBeLessThan(baseScore);
      expect(degradedScore).toBe(baseScore - 20);
    });
  });

  describe('7. Connection Ping Simulation Engine', () => {
    it('successfully pings InsForge PostgreSQL cluster', async () => {
      const res = await centralSettingsService.testConnection('INSFORGE');
      expect(res.status).toBe('ONLINE');
      expect(res.latencyMs).toBeGreaterThan(0);
      expect(res.target).toContain('PostgreSQL 16');
      expect(res.details).toContain('12 Active Tables Mapped');
      expect(res.timestamp).toBeDefined();
    });

    it('successfully tests WhatsApp Business Cloud API webhook', async () => {
      const res = await centralSettingsService.testConnection('WHATSAPP');
      expect(res.status).toBe('ONLINE');
      expect(res.latencyMs).toBeGreaterThan(0);
      expect(res.target).toContain('Meta Graph API');
      expect(res.details).toContain('Webhook Token Valid');
    });

    it('successfully tests Telecom DLT SMS gateway', async () => {
      const res = await centralSettingsService.testConnection('DLT_SMS');
      expect(res.status).toBe('ONLINE');
      expect(res.latencyMs).toBeGreaterThan(0);
      expect(res.details).toContain('FOCUSP');
    });

    it('successfully tests SMTP transactional mail relayer', async () => {
      const res = await centralSettingsService.testConnection('SMTP');
      expect(res.status).toBe('ONLINE');
      expect(res.latencyMs).toBeGreaterThan(0);
      expect(res.details).toContain('STARTTLS');
    });
  });

  describe('8. Configuration Export & Import Engine', () => {
    it('generates a valid exportable JSON manifest string', () => {
      const current = centralSettingsService.getSettings();
      const jsonStr = centralSettingsService.exportSettingsConfig(current);

      expect(typeof jsonStr).toBe('string');
      const parsed = JSON.parse(jsonStr);
      expect(parsed.manifest).toBe('FOCUSPOINT_CENTRAL_ARCHITECTURE_SETTINGS');
      expect(parsed.exportedBy).toContain('Mukesh Sonkar');
      expect(parsed.configuration.tuitionCommissionPercent).toBe(current.tuitionCommissionPercent);
    });

    it('successfully imports and merges a valid JSON configuration payload', () => {
      const exported = centralSettingsService.exportSettingsConfig(centralSettingsService.getSettings());
      const res = centralSettingsService.importSettingsConfig(exported);

      expect(res.success).toBe(true);
      expect(res.settings).toBeDefined();
      expect(res.settings?.tuitionCommissionPercent).toBe(10.0);
    });

    it('rejects invalid JSON payloads gracefully with error message', () => {
      const invalidJson = '{ malformed json: true ';
      const res = centralSettingsService.importSettingsConfig(invalidJson);

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.error).toContain('JSON Parse Error');
    });

    it('rejects incomplete configuration objects missing core fields', () => {
      const incomplete = JSON.stringify({ randomKey: 'test' });
      const res = centralSettingsService.importSettingsConfig(incomplete);

      expect(res.success).toBe(false);
      expect(res.error).toContain('validation failed');
    });
  });
});
