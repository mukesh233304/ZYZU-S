import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminSecurityService } from '../services/superAdminSecurityService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Super Admin Security Center & 3FA Master Test Suite', () => {
  beforeEach(() => {
    // Clear storage keys prior to each test run
    safeStorage.removeItem('fp_super_admin_master_hash_v2');
    safeStorage.removeItem('fp_super_admin_sec_rate_limit');
    safeStorage.removeItem('fp_super_admin_priv_session');
    safeStorage.removeItem('fp_super_admin_key_meta');
    safeStorage.removeItem('fp_emergency_lockdown_active');
    safeStorage.removeItem('fp_emergency_lockdown_reason');
    safeStorage.removeItem('fp_sec_device_registry');
    safeStorage.removeItem('fp_sec_policies_config');
  });

  describe('1. Live TOTP Telemetry & Countdown Protocol (RFC 6238)', () => {
    it('generates a valid 6-digit TOTP code and countdown telemetry', () => {
      const telemetry = superAdminSecurityService.getTotpTelemetry();
      
      expect(telemetry.code).toBeDefined();
      expect(telemetry.code).toMatch(/^\d{6}$/);
      expect(telemetry.secondsRemaining).toBeGreaterThanOrEqual(0);
      expect(telemetry.secondsRemaining).toBeLessThanOrEqual(30);
      expect(telemetry.qrUri).toContain('otpauth://totp/FocusPoint:SuperAdminHQ');
      expect(telemetry.secret).toBe('FP2026SEC3FATOTPKEYX');
    });

    it('verifies Factor 3 TOTP with 6-digit verification code and rejects malformed codes', () => {
      const telemetry = superAdminSecurityService.getTotpTelemetry();
      
      // Live TOTP code passes
      const validRes = superAdminSecurityService.verifyFactor3MFA(telemetry.code);
      expect(validRes.success).toBe(true);
      expect(validRes.error).toBeUndefined();

      // Empty code fails
      const emptyRes = superAdminSecurityService.verifyFactor3MFA('');
      expect(emptyRes.success).toBe(false);
      expect(emptyRes.error).toContain('Please enter your 6-digit');

      // Malformed non-numeric code fails
      const nonNumeric = superAdminSecurityService.verifyFactor3MFA('ABCDEF');
      expect(nonNumeric.success).toBe(false);
      expect(nonNumeric.error).toContain('exactly 6 digits');

      // Wrong length code fails
      const wrongLength = superAdminSecurityService.verifyFactor3MFA('12345');
      expect(wrongLength.success).toBe(false);
      expect(wrongLength.error).toContain('exactly 6 digits');
    });
  });

  describe('2. Multi-Factor (3FA) Privileged Session Lifecycle', () => {
    it('orchestrates complete 3-Factor verification and creates privileged session', async () => {
      // Factor 1: Master Key Verification
      const f1 = await superAdminSecurityService.verifyMasterKey('FP-MASTER-SEC-2026!#9X');
      expect(f1.success).toBe(true);

      // Factor 3: TOTP Verification
      const telemetry = superAdminSecurityService.getTotpTelemetry();
      const f3 = superAdminSecurityService.verifyFactor3MFA(telemetry.code);
      expect(f3.success).toBe(true);

      // Issue Privileged Session
      const session = superAdminSecurityService.createPrivilegedSession('superadmin@focuspoint.org');

      expect(session.sessionId).toBeDefined();
      expect(session.factor1Verified).toBe(true);
      expect(session.factor2Verified).toBe(true);
      expect(session.factor3Verified).toBe(true);
      expect(session.userEmail).toBe('superadmin@focuspoint.org');
      expect(session.expiresAt).toBeGreaterThan(Date.now());

      // Validates active session
      expect(superAdminSecurityService.isPrivilegedSessionValid()).toBe(true);

      // Revokes session
      await superAdminSecurityService.revokeAllSessions('Super Administrator');
      expect(superAdminSecurityService.isPrivilegedSessionValid()).toBe(false);
    });
  });

  describe('3. DEFCON 1 Emergency Platform Lockdown Protocol', () => {
    it('starts with lockdown disengaged and reflects in security status summary', async () => {
      expect(superAdminSecurityService.isLockdownActive()).toBe(false);
      const status = await superAdminSecurityService.getSecurityStatus();
      expect(status.isLockdownActive).toBe(false);
    });

    it('triggers emergency platform lockdown with reason and creates audit trail', async () => {
      const engaged = await superAdminSecurityService.triggerEmergencyLockdown(
        'Anomalous Quantum Infiltration Detected on Edge Gateways',
        'superadmin@focuspoint.org'
      );

      expect(engaged).toBe(true);
      expect(superAdminSecurityService.isLockdownActive()).toBe(true);

      const status = await superAdminSecurityService.getSecurityStatus();
      expect(status.isLockdownActive).toBe(true);
      expect(status.lockdownReason).toContain('Anomalous Quantum Infiltration');
    });

    it('rejects disengagement when invalid Master Key is provided', async () => {
      // First engage lockdown
      await superAdminSecurityService.triggerEmergencyLockdown('Test lockdown', 'superadmin@focuspoint.org');
      expect(superAdminSecurityService.isLockdownActive()).toBe(true);

      // Try disengaging with wrong key
      const disengageFail = await superAdminSecurityService.disengageEmergencyLockdown(
        'WrongPassword123!',
        'superadmin@focuspoint.org'
      );

      expect(disengageFail.success).toBe(false);
      expect(disengageFail.error).toContain('Invalid Master Security Key');
      // Must remain locked down
      expect(superAdminSecurityService.isLockdownActive()).toBe(true);
    });

    it('successfully disengages lockdown when authentic Master Key is presented', async () => {
      await superAdminSecurityService.triggerEmergencyLockdown('Test lockdown', 'superadmin@focuspoint.org');
      expect(superAdminSecurityService.isLockdownActive()).toBe(true);

      const disengageSuccess = await superAdminSecurityService.disengageEmergencyLockdown(
        'FP-MASTER-SEC-2026!#9X',
        'superadmin@focuspoint.org'
      );

      expect(disengageSuccess.success).toBe(true);
      expect(superAdminSecurityService.isLockdownActive()).toBe(false);

      const status = await superAdminSecurityService.getSecurityStatus();
      expect(status.isLockdownActive).toBe(false);
    });
  });

  describe('4. AI Zero-Trust Vulnerability Radar Scan', () => {
    it('runs multi-stage radar scan and computes safety index with cryptographic scan hash', async () => {
      const scan = await superAdminSecurityService.runSecurityVulnerabilityScan();

      expect(scan.safetyIndex).toBe(99.98);
      expect(scan.threatsDetected).toBe(0);
      expect(scan.scanHash).toContain('ZERO-TRUST');
      expect(scan.certIssuedAt).toBeDefined();
      expect(scan.diagnostics).toBeDefined();
      expect(scan.diagnostics.zeroTrustEntropy).toContain('SHA-256 Digest');
      expect(scan.diagnostics.rateLimiterShield).toContain('5 attempts max');
      expect(scan.diagnostics.totpTimeDrift).toContain('RFC 6238');

      // Security status telemetry reflects defense score and live TOTP sync
      const status = await superAdminSecurityService.getSecurityStatus();
      expect(status.quantumDefenseScore).toBe(99.98);
      expect(status.totpSyncSecondsRemaining).toBeGreaterThanOrEqual(0);
      expect(status.totpSyncSecondsRemaining).toBeLessThanOrEqual(30);
    });
  });

  describe('5. Privileged Device Registry & Fleet Revocation', () => {
    it('retrieves active privileged devices with hardware telemetry', () => {
      const devices = superAdminSecurityService.getActivePrivilegedDevices();
      expect(devices.length).toBeGreaterThanOrEqual(2);

      const primary = devices[0];
      expect(primary.sessionId).toBe('sess-mac-primary-01');
      expect(primary.deviceName).toContain('MacBook Pro');
      expect(primary.ipAddress).toContain('103.25.130.42');
      expect(primary.status).toBe('ACTIVE_3FA_SEALED');
      expect(primary.isCurrentDevice).toBe(true);
    });

    it('terminates a specific device session and updates device registry', () => {
      const initialDevices = superAdminSecurityService.getActivePrivilegedDevices();
      expect(initialDevices.length).toBe(2);

      // Terminate the backup iPad device
      superAdminSecurityService.terminateDeviceSession('sess-ipad-backup-02');

      const updatedDevices = superAdminSecurityService.getActivePrivilegedDevices();
      expect(updatedDevices.length).toBe(1);
      expect(updatedDevices.find(d => d.sessionId === 'sess-ipad-backup-02')).toBeUndefined();
      expect(updatedDevices[0].sessionId).toBe('sess-mac-primary-01');
    });

    it('provisions a new authorized device and supports 1-click revocation of all other devices', () => {
      // Authorize new device
      const newDev = superAdminSecurityService.authorizeNewDevice({
        deviceName: 'Pixel Tablet // Android 15',
        location: 'Patna Regional Command'
      });
      expect(newDev.sessionId).toBeDefined();
      expect(newDev.status).toBe('ACTIVE_3FA_SEALED');

      let devices = superAdminSecurityService.getActivePrivilegedDevices();
      expect(devices.length).toBe(3); // 2 default + 1 new

      // Revoke all other devices (keeping only isCurrentDevice = true)
      superAdminSecurityService.revokeAllOtherDevices();
      devices = superAdminSecurityService.getActivePrivilegedDevices();
      expect(devices.length).toBe(1);
      expect(devices[0].isCurrentDevice).toBe(true);
      expect(devices[0].sessionId).toBe('sess-mac-primary-01');
    });
  });

  describe('6. Terminal Rate Limiting & Shield Reset', () => {
    it('resets failed attempt counter and terminal lockout state', async () => {
      // Simulate failed attempts
      for (let i = 0; i < 3; i++) {
        await superAdminSecurityService.verifyMasterKey('WrongKey' + i);
      }

      let status = await superAdminSecurityService.getSecurityStatus();
      expect(status.failedAttemptsCount).toBe(3);

      // Perform shield reset
      superAdminSecurityService.resetLockout();

      status = await superAdminSecurityService.getSecurityStatus();
      expect(status.failedAttemptsCount).toBe(0);
      expect(status.isLocked).toBe(false);
    });
  });

  describe('7. Configurable Enterprise Security Policies', () => {
    it('loads default policies and updates them with strict configuration', () => {
      const policies = superAdminSecurityService.getSecurityPolicies();
      expect(policies.sessionTimeoutMinutes).toBe(120);
      expect(policies.requireBiometricHardwareKey).toBe(true);
      expect(policies.geoFencingEnforced).toBe(false);
      expect(policies.lockoutDurationMinutes).toBe(15);
      expect(policies.maxFailedAttempts).toBe(5);

      const updated = superAdminSecurityService.updateSecurityPolicies({
        sessionTimeoutMinutes: 60,
        geoFencingEnforced: true,
      });

      expect(updated.sessionTimeoutMinutes).toBe(60);
      expect(updated.geoFencingEnforced).toBe(true);
      expect(updated.maxFailedAttempts).toBe(5); // preserved

      const refetched = superAdminSecurityService.getSecurityPolicies();
      expect(refetched.sessionTimeoutMinutes).toBe(60);
      expect(refetched.geoFencingEnforced).toBe(true);
    });
  });

  describe('8. Master Key Rotation & Password Complexity Validation', () => {
    it('validates password complexity rules with informative messages', () => {
      // Valid complex key
      const valid = superAdminSecurityService.validateKeyStrength('NewMasterKey2026!#Secure');
      expect(valid.isValid).toBe(true);

      // Too short
      const short = superAdminSecurityService.validateKeyStrength('Short1!Aa');
      expect(short.isValid).toBe(false);
      expect(short.message).toContain('at least 12 characters');

      // Missing special symbol
      const noSpecial = superAdminSecurityService.validateKeyStrength('NoSpecialChar1234Abc');
      expect(noSpecial.isValid).toBe(false);
      expect(noSpecial.message).toContain('special symbol');
    });

    it('successfully rotates Master Security Key and invalidates previous key', async () => {
      const currentKey = 'FP-MASTER-SEC-2026!#9X';
      const newKey = 'FP-ROTATED-KEY-2027!#Alpha';

      const rotationRes = await superAdminSecurityService.rotateMasterKey({
        currentKey,
        newKey,
        confirmKey: newKey,
        performedBy: 'superadmin@focuspoint.org'
      });

      expect(rotationRes.success).toBe(true);
      expect(rotationRes.error).toBeUndefined();

      // Old key must now fail
      const oldCheck = await superAdminSecurityService.verifyMasterKey(currentKey);
      expect(oldCheck.success).toBe(false);

      // New key must now pass
      const newCheck = await superAdminSecurityService.verifyMasterKey(newKey);
      expect(newCheck.success).toBe(true);
    });
  });
});
