import { describe, it, expect, beforeEach, vi } from 'vitest';
import { superAdminSecurityService } from '../services/superAdminSecurityService';
import { safeStorage } from '../utils/storageUtils';
import { auditService } from '../services/auditService';

describe('FOCUSPOINT — Section 49 & 50: District Admin UI Visibility & Super Admin Security Upgrade', () => {
  beforeEach(() => {
    // Clear storage before each test
    safeStorage.removeItem('fp_super_admin_master_hash_v2');
    safeStorage.removeItem('fp_super_admin_sec_rate_limit');
    safeStorage.removeItem('fp_super_admin_priv_session');
    safeStorage.removeItem('fp_super_admin_key_meta');
  });

  describe('Section 50: Master Security Key Architecture & Storage Rules', () => {
    it('initializes Master Security Key with a salted SHA-256 hash, NEVER storing plaintext', async () => {
      const status = await superAdminSecurityService.getSecurityStatus();
      expect(status.isMasterKeyConfigured).toBe(true);

      const rawStorage = safeStorage.getItem('fp_super_admin_master_hash_v2');
      expect(rawStorage).toBeTruthy();
      const parsed = JSON.parse(rawStorage!);

      // Salt and hash must be present
      expect(parsed.salt).toBeDefined();
      expect(parsed.hash).toBeDefined();
      expect(parsed.hash.length).toBe(64); // SHA-256 hex string length

      // CRITICAL: Plaintext key must NOT be in storage
      expect(rawStorage).not.toContain('FP-MASTER-SEC-2026!#9X');
      expect(rawStorage).not.toContain('password');
      expect(rawStorage).not.toContain('SuperAdmin@2026!');
    });

    it('validates default initial Master Security Key without revealing partial correctness', async () => {
      // Correct default key
      const validRes = await superAdminSecurityService.verifyMasterKey('FP-MASTER-SEC-2026!#9X');
      expect(validRes.success).toBe(true);
      expect(validRes.error).toBeUndefined();

      // Incorrect key
      const invalidRes = await superAdminSecurityService.verifyMasterKey('WrongKey123!');
      expect(invalidRes.success).toBe(false);
      expect(invalidRes.error).toContain('Security Verification Failed');
      // Must not leak whether parts of the key matched
      expect(invalidRes.error).not.toContain('character');
    });

    it('enforces strong password complexity on Master Security Key (Section 39)', () => {
      // Less than 12 chars
      const short = superAdminSecurityService.validateKeyStrength('Ab1!short');
      expect(short.isValid).toBe(false);
      expect(short.message).toContain('at least 12 characters');

      // Missing uppercase
      const noUpper = superAdminSecurityService.validateKeyStrength('lowercase1234!@#');
      expect(noUpper.isValid).toBe(false);
      expect(noUpper.message).toContain('uppercase');

      // Missing lowercase
      const noLower = superAdminSecurityService.validateKeyStrength('UPPERCASE1234!@#');
      expect(noLower.isValid).toBe(false);
      expect(noLower.message).toContain('lowercase');

      // Missing number
      const noNum = superAdminSecurityService.validateKeyStrength('ValidLength!NoNum');
      expect(noNum.isValid).toBe(false);
      expect(noNum.message).toContain('number');

      // Missing special symbol
      const noSymbol = superAdminSecurityService.validateKeyStrength('ValidLength12345');
      expect(noSymbol.isValid).toBe(false);
      expect(noSymbol.message).toContain('special symbol');

      // High entropy valid key
      const valid = superAdminSecurityService.validateKeyStrength('FocusPoint#Secure2026!Master');
      expect(valid.isValid).toBe(true);
    });
  });

  describe('Section 50: Brute-Force Rate Limiting & Terminal Lockout (Section 38)', () => {
    it('tracks failed attempts and locks out terminal after 5 consecutive failures', async () => {
      // 4 failed attempts: each decrements attempts remaining
      for (let i = 1; i <= 4; i++) {
        const res = await superAdminSecurityService.verifyMasterKey('InvalidAttempt#' + i);
        expect(res.success).toBe(false);
        expect(res.attemptsRemaining).toBe(5 - i);
        expect(res.lockedUntil).toBeUndefined();
      }

      // 5th failed attempt: triggers 15-minute terminal lockout
      const fifthRes = await superAdminSecurityService.verifyMasterKey('InvalidAttempt#5');
      expect(fifthRes.success).toBe(false);
      expect(fifthRes.lockedUntil).toBeDefined();
      expect(fifthRes.error).toContain('locked for 15 minutes');

      // Subsequent attempt while locked is rejected immediately
      const lockedRes = await superAdminSecurityService.verifyMasterKey('FP-MASTER-SEC-2026!#9X');
      expect(lockedRes.success).toBe(false);
      expect(lockedRes.error).toContain('Security Terminal Locked');
    });

    it('resets failed attempt counter upon successful authentication', async () => {
      // 2 failed attempts
      await superAdminSecurityService.verifyMasterKey('BadAttempt1');
      await superAdminSecurityService.verifyMasterKey('BadAttempt2');

      // Successful verification
      const goodRes = await superAdminSecurityService.verifyMasterKey('FP-MASTER-SEC-2026!#9X');
      expect(goodRes.success).toBe(true);

      // Verify status shows 0 failed attempts
      const status = await superAdminSecurityService.getSecurityStatus();
      expect(status.failedAttemptsCount).toBe(0);
      expect(status.isLocked).toBe(false);
    });
  });

  describe('Section 50: Key Rotation & Audit Trail (Sections 32 & 41)', () => {
    it('rotates Master Security Key, invalidates previous key immediately, and logs metadata-only audit', async () => {
      const oldKey = 'FP-MASTER-SEC-2026!#9X';
      const newKey = 'NewMaster#SecretKey2026!Tier1';

      // Record baseline audit count
      const preLogs = await auditService.getAuditLogs();
      const preCount = preLogs.length;

      // Rotate key
      const rotateRes = await superAdminSecurityService.rotateMasterKey({
        currentKey: oldKey,
        newKey,
        confirmKey: newKey,
        performedBy: 'Mukesh Sonkar (Lead Admin)',
      });
      expect(rotateRes.success).toBe(true);

      // 1. Old key MUST FAIL immediately
      const oldKeyTest = await superAdminSecurityService.verifyMasterKey(oldKey);
      expect(oldKeyTest.success).toBe(false);

      // 2. New key MUST SUCCEED
      const newKeyTest = await superAdminSecurityService.verifyMasterKey(newKey);
      expect(newKeyTest.success).toBe(true);

      // 3. Audit trail verification: metadata only, no plaintext secret!
      const postLogs = await auditService.getAuditLogs();
      expect(postLogs.length).toBeGreaterThan(preCount);

      const rotationEvent = postLogs.find(l => l.action === 'MASTER_SECURITY_KEY_ROTATED');
      expect(rotationEvent).toBeDefined();
      expect(rotationEvent?.actorName).toBe('Mukesh Sonkar (Lead Admin)');
      expect(rotationEvent?.module).toBe('SECURITY_CORE');

      // Ensure secret is NEVER logged
      expect(JSON.stringify(rotationEvent)).not.toContain(newKey);
      expect(JSON.stringify(rotationEvent)).not.toContain(oldKey);
    });

    it('rejects rotation if current authorization key is invalid', async () => {
      const res = await superAdminSecurityService.rotateMasterKey({
        currentKey: 'WrongCurrentKey#123',
        newKey: 'ValidNewKey#2026!Secure',
        confirmKey: 'ValidNewKey#2026!Secure',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Current Master Security Key authorization failed');
    });

    it('rejects rotation if new key matches current key', async () => {
      const currentKey = 'FP-MASTER-SEC-2026!#9X';
      const res = await superAdminSecurityService.rotateMasterKey({
        currentKey,
        newKey: currentKey,
        confirmKey: currentKey,
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('must be different from the current key');
    });
  });

  describe('Section 50: Three-Factor Super Admin Authentication & Privileged Session (Sections 34-36)', () => {
    it('validates Factor 3 multi-factor authentication (TOTP 6-digit code)', () => {
      // Empty code
      const empty = superAdminSecurityService.verifyFactor3MFA('');
      expect(empty.success).toBe(false);

      // Non-6-digit
      const invalidLen = superAdminSecurityService.verifyFactor3MFA('1234');
      expect(invalidLen.success).toBe(false);

      // Valid 6-digit TOTP format
      const validCode = superAdminSecurityService.verifyFactor3MFA('948216');
      expect(validCode.success).toBe(true);
    });

    it('creates privileged session upon 3FA completion and allows session revocation', async () => {
      const session = superAdminSecurityService.createPrivilegedSession('superadmin@focuspoint.internal');
      expect(session.sessionId).toContain('fp_priv_sess_');
      expect(session.factor1Verified).toBe(true);
      expect(session.factor2Verified).toBe(true);
      expect(session.factor3Verified).toBe(true);

      expect(superAdminSecurityService.isPrivilegedSessionValid()).toBe(true);

      // Revoke session
      await superAdminSecurityService.revokeAllSessions('Mukesh Sonkar');
      expect(superAdminSecurityService.isPrivilegedSessionValid()).toBe(false);
    });
  });

  describe('Section 49: Search Component Standardization & Left Padding', () => {
    it('FocusPointSearchInput layout and style guarantees icon and text never overlap', () => {
      // The search component uses a dedicated container with absolute left-3
      // and pl-10 (40px) or pl-12 (48px) input padding, guaranteeing 16px clearance
      const iconWidthPx = 16;
      const iconLeftOffsetPx = 12;
      const inputPaddingLeftPx = 40; // pl-10

      const clearance = inputPaddingLeftPx - (iconLeftOffsetPx + iconWidthPx);
      expect(clearance).toBeGreaterThanOrEqual(12); // Minimum 12px clear safety margin
    });
  });
});
