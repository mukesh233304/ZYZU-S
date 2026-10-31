import { describe, it, expect, beforeEach } from 'vitest';
import { 
  superAdminProfileService, 
  DEFAULT_ROOT_PROFILE, 
  DEFAULT_ACTIVE_SESSIONS, 
  DEFAULT_LOGIN_LOGS 
} from '../services/superAdminProfileService';
import { auditService } from '../services/auditService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — SUPER ADMIN SOVEREIGN PROFILE & COMMAND MASTER SUITE', () => {
  beforeEach(() => {
    safeStorage.removeItem('fp_super_admin_profile_v2');
    safeStorage.removeItem('fp_super_admin_sessions_v2');
    safeStorage.removeItem('fp_super_admin_login_history_v2');
    safeStorage.removeItem('fp_super_admin_audit_logs_v2');
    safeStorage.removeItem('fp_super_admin_avatar');
    safeStorage.removeItem('fp_superadmin_avatar');
    safeStorage.removeItem('fp_super_admin_avatar_deleted');
  });

  describe('1. Sovereign Profile Genesis Initialization & Storage Persistence', () => {
    it('initializes default root profile for Mukesh Sonkar when storage is empty', async () => {
      const profile = await superAdminProfileService.getProfile();

      expect(profile).toBeDefined();
      expect(profile.name).toBe('Mukesh Sonkar');
      expect(profile.role).toBe('SUPER_ADMIN');
      expect(profile.email).toBe('superadmin@focuspoint.internal');
      expect(profile.phone).toBe('+91 94152 88201');
      expect(profile.sovereignTitle).toBe('Sovereign Platform Architect & Chief Executive');
      expect(profile.sovereignClearanceLevel).toContain('LEVEL 5 — SUPREME ROOT');
      expect(profile.merkleDigitalSignature).toContain('SHA256:');
      expect(profile.masterRecoveryKey).toContain('QUANTUM-ROOT');
      expect(profile.threeFactorEnabled).toBe(true);

      // Verify stored in safeStorage
      const stored = safeStorage.getItem('fp_super_admin_profile_v2');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('Mukesh Sonkar');
    });

    it('retains updated profile attributes across calls', async () => {
      await superAdminProfileService.updateProfile({
        designation: 'Supreme Chancellor & Visionary Director',
        department: 'National Apex Strategic Directorate'
      });

      const profile = await superAdminProfileService.getProfile();
      expect(profile.designation).toBe('Supreme Chancellor & Visionary Director');
      expect(profile.department).toBe('National Apex Strategic Directorate');
      expect(profile.name).toBe('Mukesh Sonkar'); // base intact
    });
  });

  describe('2. Global Avatar Synchronization Across Platform Slots', () => {
    it('synchronizes custom avatar URL across navbar and user keys', async () => {
      const customAvatar = 'https://images.unsplash.com/custom-sovereign-avatar.jpg';
      await superAdminProfileService.updateProfile({ avatarUrl: customAvatar });

      expect(safeStorage.getItem('fp_super_admin_avatar')).toBe(customAvatar);
      expect(safeStorage.getItem('fp_superadmin_avatar')).toBe(customAvatar);
      expect(safeStorage.getItem('fp_user_avatar_usr-superadmin')).toBe(customAvatar);
      expect(safeStorage.getItem('fp_super_admin_avatar_deleted')).toBeNull();
    });

    it('sets deleted flag when avatar is removed', async () => {
      await superAdminProfileService.updateProfile({ avatarUrl: '' });

      expect(safeStorage.getItem('fp_super_admin_avatar_deleted')).toBe('true');
      expect(safeStorage.getItem('fp_super_admin_avatar')).toBeNull();
    });

    it('records an audit log entry on profile updates', async () => {
      await superAdminProfileService.updateProfile({
        name: 'Mukesh Sonkar (Verified Sovereign)'
      });

      const auditLogs = auditService.getRawLogs();
      const profileLog = auditLogs.find(l => l.action === 'SUPER_ADMIN_PROFILE_UPDATED');
      expect(profileLog).toBeDefined();
      expect(profileLog?.module).toBe('ADMIN_GOVERNANCE');
    });
  });

  describe('3. Active Hardware Sessions & Remote Device Governance', () => {
    it('returns default active sessions including current MacBook Pro', async () => {
      const sessions = await superAdminProfileService.getActiveSessions();

      expect(sessions.length).toBeGreaterThanOrEqual(3);
      const current = sessions.find(s => s.isCurrent);
      expect(current).toBeDefined();
      expect(current?.device).toContain('MacBook Pro');
    });

    it('revokes an individual remote hardware session and logs audit trail', async () => {
      const initialSessions = await superAdminProfileService.getActiveSessions();
      const targetSessionId = initialSessions.find(s => !s.isCurrent)!.id;

      const remaining = await superAdminProfileService.revokeSession(targetSessionId);
      expect(remaining.find(s => s.id === targetSessionId)).toBeUndefined();
      expect(remaining.length).toBe(initialSessions.length - 1);

      // Verify audit log
      const auditLogs = auditService.getRawLogs();
      const revokeLog = auditLogs.find(l => l.action === 'REMOTE_SESSION_REVOKED');
      expect(revokeLog).toBeDefined();
      expect(revokeLog?.severity).toBe('WARNING');
    });

    it('purges all other sessions in one click, retaining only the current active node', async () => {
      const initialSessions = await superAdminProfileService.getActiveSessions();
      expect(initialSessions.length).toBeGreaterThan(1);

      const remaining = await superAdminProfileService.revokeAllOtherSessions();
      expect(remaining.length).toBe(1);
      expect(remaining[0].isCurrent).toBe(true);

      // Verify critical audit log
      const auditLogs = auditService.getRawLogs();
      const purgeLog = auditLogs.find(l => l.action === 'ALL_REMOTE_SESSIONS_PURGED');
      expect(purgeLog).toBeDefined();
      expect(purgeLog?.severity).toBe('CRITICAL');
    });
  });

  describe('4. Master Cryptographic Recovery Key Rotation', () => {
    it('generates a fresh high-entropy Master Recovery Seed Key and seals it to profile', async () => {
      const oldProfile = await superAdminProfileService.getProfile();
      const oldKey = oldProfile.masterRecoveryKey;

      const newKey = await superAdminProfileService.rotateMasterRecoveryKey();

      expect(newKey).toBeDefined();
      expect(newKey).toMatch(/^FP-SOV-KEY-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-QUANTUM-ROOT$/);
      expect(newKey).not.toBe(oldKey);

      // Verify stored in profile
      const updatedProfile = await superAdminProfileService.getProfile();
      expect(updatedProfile.masterRecoveryKey).toBe(newKey);
      expect(updatedProfile.securitySettings?.masterRecoveryKey).toBe(newKey);

      // Verify audit record
      const auditLogs = auditService.getRawLogs();
      const keyLog = auditLogs.find(l => l.action === 'MASTER_RECOVERY_KEY_ROTATED');
      expect(keyLog).toBeDefined();
      expect(keyLog?.severity).toBe('CRITICAL');
    });
  });

  describe('5. Master Root Password Authentication Gate', () => {
    it('rejects passwords shorter than 8 characters with descriptive error', async () => {
      await expect(superAdminProfileService.updateMasterPassword('short')).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('accepts valid master password and updates change timestamp', async () => {
      const result = await superAdminProfileService.updateMasterPassword('SovereignPass#2026!');
      expect(result).toBe(true);

      const profile = await superAdminProfileService.getProfile();
      expect(profile.securitySettings?.lastPasswordChangeDate).toBe(new Date().toISOString().substring(0, 10));

      const auditLogs = auditService.getRawLogs();
      const passLog = auditLogs.find(l => l.action === 'MASTER_ROOT_PASSWORD_CHANGED');
      expect(passLog).toBeDefined();
      expect(passLog?.severity).toBe('CRITICAL');
    });
  });

  describe('6. Immutable Access History & Login Trail', () => {
    it('retrieves immutable login history logs', async () => {
      const logs = await superAdminProfileService.getLoginHistory();
      expect(logs).toBeDefined();
      expect(logs.length).toBeGreaterThanOrEqual(4);
      expect(logs.some(l => l.status === 'SUCCESS')).toBe(true);
      expect(logs.some(l => l.status === 'BLOCKED')).toBe(true);
    });
  });

  describe('7. Sovereign Executive Dossier Generation', () => {
    it('generates a comprehensive executive memorandum text dossier', async () => {
      const profile = await superAdminProfileService.getProfile();
      const dossier = superAdminProfileService.exportExecutiveDossier(profile);

      expect(dossier).toContain('FOCUSPOINT SOVEREIGN PLATFORM — EXECUTIVE CREDENTIALS DOSSIER');
      expect(dossier).toContain('Officer Name:          Mukesh Sonkar');
      expect(dossier).toContain('Clearance Level:');
      expect(dossier).toContain('Cryptographic Seal:');
      expect(dossier).toContain('3FA Step-Up Gate:');
      expect(dossier).toContain(profile.phone);
    });
  });
});
