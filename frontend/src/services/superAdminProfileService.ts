// FOCUSPOINT Sovereign Root Super Admin Profile & Credentials Service
// Client-Side Persistence with SafeStorage, Merkle Audit Integration, and Cryptographic Security

import { 
  SuperAdminProfileData, 
  SuperAdminSessionItem, 
  SuperAdminLoginLog,
  UniversalIDCardData 
} from '../types';
import { safeStorage } from '../utils/storageUtils';
import { auditService } from './auditService';

const PROFILE_STORAGE_KEY = 'fp_super_admin_profile_v2';
const SESSIONS_STORAGE_KEY = 'fp_super_admin_sessions_v2';
const LOGIN_LOGS_STORAGE_KEY = 'fp_super_admin_login_history_v2';

export const DEFAULT_ROOT_PROFILE: SuperAdminProfileData = {
  id: 'usr-superadmin',
  name: 'Mukesh Sonkar',
  email: 'superadmin@focuspoint.internal',
  phone: '+91 94152 88201',
  designation: 'Chief Platform Architect & Root Chancellor',
  role: 'SUPER_ADMIN',
  sovereignTitle: 'Sovereign Platform Architect & Chief Executive',
  sovereignClearanceLevel: 'LEVEL 5 — SUPREME ROOT AUTHORITY',
  merkleDigitalSignature: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  masterRecoveryKey: 'FP-SOV-ALPHA-8821-QUANTUM-ROOT-9921-KEY',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  bio: 'Directing the Pan-India expansion of the FOCUSPOINT Home Tuition & Self-Study Library ecosystem with zero-trust sovereign governance.',
  department: 'Central Executive Directorate & Supreme Command',
  employeeId: 'FP-ROOT-001',
  joinedDate: '2024-01-01',
  lastLogin: '2026-10-12 18:30 IST',
  threeFactorEnabled: true,
  securitySettings: {
    twoFactorEnabled: true,
    threeFactorEnabled: true,
    emailAlertsOnLogin: true,
    sessionTimeoutMinutes: 60,
    ipWhitelistingEnabled: false,
    masterRecoveryKey: 'FP-SOV-ALPHA-8821-QUANTUM-ROOT-9921-KEY',
    lastPasswordChangeDate: '2026-09-15'
  },
  notificationPreferences: {
    highValueTransactions: true,
    districtAdminAppointments: true,
    escalatedSupportTickets: true,
    systemAlerts: true,
    dailyExecutiveDigest: true,
    securityAlertsWhatsApp: true,
    financeAlertsWhatsApp: true
  }
};

export const DEFAULT_ACTIVE_SESSIONS: SuperAdminSessionItem[] = [
  {
    id: 'sess-macbook-sonoma',
    device: 'Apple MacBook Pro M3 Max',
    browser: 'Chrome 129 (64-bit macOS Sonoma)',
    ip: '103.212.145.22',
    location: 'Ghazipur Command Node (Uttar Pradesh)',
    lastActive: 'Active Now (Current Session)',
    isCurrent: true
  },
  {
    id: 'sess-iphone-pro',
    device: 'Apple iPhone 15 Pro Max',
    browser: 'Mobile Safari 18.0 (iOS)',
    ip: '103.212.145.28',
    location: 'Varanasi Central Cluster (Uttar Pradesh)',
    lastActive: '25 minutes ago',
    isCurrent: false
  },
  {
    id: 'sess-yubikey-fido2',
    device: 'Admin Console Hardware Security Module (YubiKey 5C NFC)',
    browser: 'FIDO2 / WebAuthn Hardware Channel',
    ip: '103.212.145.22',
    location: 'National Cryptographic Root HSM',
    lastActive: 'Yesterday at 18:42 IST',
    isCurrent: false
  }
];

export const DEFAULT_LOGIN_LOGS: SuperAdminLoginLog[] = [
  {
    id: 'log-01',
    timestamp: 'Today, 08:30 AM IST',
    ip: '103.212.145.22',
    device: 'Chrome 129 on macOS Sonoma',
    location: 'Ghazipur Node, UP',
    status: 'SUCCESS'
  },
  {
    id: 'log-02',
    timestamp: 'Yesterday, 09:15 AM IST',
    ip: '103.212.145.22',
    device: 'Chrome 129 on macOS Sonoma',
    location: 'Ghazipur Node, UP',
    status: 'SUCCESS'
  },
  {
    id: 'log-03',
    timestamp: '10 Oct 2026, 11:20 PM IST',
    ip: '49.36.12.8',
    device: 'Mobile Safari on iOS 18',
    location: 'Ballia Relay Node, UP',
    status: 'SUCCESS'
  },
  {
    id: 'log-04',
    timestamp: '08 Oct 2026, 02:14 AM IST',
    ip: '185.220.101.5',
    device: 'Unverified Proxy Exit Node',
    location: 'Frankfurt, Germany (Non-Indian Subnet)',
    status: 'BLOCKED'
  }
];

export const superAdminProfileService = {
  /**
   * Retrieves active profile from safeStorage or initializes default root profile.
   */
  async getProfile(): Promise<SuperAdminProfileData> {
    await new Promise(r => setTimeout(r, 40));
    try {
      const stored = safeStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return { ...DEFAULT_ROOT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.warn('[superAdminProfileService] Storage read error:', e);
    }

    safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_ROOT_PROFILE));
    return { ...DEFAULT_ROOT_PROFILE };
  },

  /**
   * Updates executive profile and synchronizes avatar across global platform slots.
   */
  async updateProfile(updates: Partial<SuperAdminProfileData>): Promise<SuperAdminProfileData> {
    const current = await this.getProfile();
    const updated: SuperAdminProfileData = {
      ...current,
      ...updates,
      lastLogin: new Date().toISOString()
    };

    safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));

    // Synchronize avatar for compatibility with navbar and user stores
    if (updates.avatarUrl !== undefined) {
      if (updates.avatarUrl.trim().length > 0) {
        safeStorage.setItem('fp_super_admin_avatar', updates.avatarUrl);
        safeStorage.setItem('fp_superadmin_avatar', updates.avatarUrl);
        safeStorage.setItem(`fp_user_avatar_${current.id}`, updates.avatarUrl);
        safeStorage.setItem('fp_user_avatar_usr-super-admin', updates.avatarUrl);
        safeStorage.setItem('fp_user_avatar_usr-superadmin', updates.avatarUrl);
        safeStorage.removeItem('fp_super_admin_avatar_deleted');
      } else {
        safeStorage.setItem('fp_super_admin_avatar_deleted', 'true');
        safeStorage.removeItem('fp_super_admin_avatar');
        safeStorage.removeItem('fp_superadmin_avatar');
      }
    }

    // Automatically seal change into the immutable audit ledger!
    try {
      await auditService.record({
        action: 'SUPER_ADMIN_PROFILE_UPDATED',
        module: 'ADMIN_GOVERNANCE',
        target: updated.name,
        targetId: updated.id,
        previousValue: current.name,
        newValue: `DESIGNATION: ${updated.designation}; DEPT: ${updated.department}`,
        severity: 'INFO'
      });
    } catch {
      // Soft failover
    }

    return updated;
  },

  /**
   * Retrieves active authorized hardware sessions.
   */
  async getActiveSessions(): Promise<SuperAdminSessionItem[]> {
    try {
      const stored = safeStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[superAdminProfileService] Error reading sessions:', e);
    }

    safeStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(DEFAULT_ACTIVE_SESSIONS));
    return DEFAULT_ACTIVE_SESSIONS;
  },

  /**
   * Revokes a specific remote hardware session.
   */
  async revokeSession(sessionId: string): Promise<SuperAdminSessionItem[]> {
    const sessions = await this.getActiveSessions();
    const targetSession = sessions.find(s => s.id === sessionId);
    const updated = sessions.filter(s => s.id !== sessionId);
    safeStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));

    if (targetSession) {
      try {
        await auditService.record({
          action: 'REMOTE_SESSION_REVOKED',
          module: 'ADMIN_GOVERNANCE',
          target: `${targetSession.device} (${targetSession.ip})`,
          targetId: sessionId,
          previousValue: 'ACTIVE_SESSION',
          newValue: 'REVOKED_AND_TERMINATED',
          severity: 'WARNING'
        });
      } catch {}
    }

    return updated;
  },

  /**
   * Revokes all sessions except the current active device.
   */
  async revokeAllOtherSessions(): Promise<SuperAdminSessionItem[]> {
    const sessions = await this.getActiveSessions();
    const currentOnly = sessions.filter(s => s.isCurrent);
    safeStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(currentOnly));

    try {
      await auditService.record({
        action: 'ALL_REMOTE_SESSIONS_PURGED',
        module: 'ADMIN_GOVERNANCE',
        target: 'All Non-Current Hardware Sessions Terminated',
        targetId: 'SESS-PURGE-ALL',
        previousValue: `${sessions.length} Active Sessions`,
        newValue: '1 Current Active Session Retained',
        severity: 'CRITICAL'
      });
    } catch {}

    return currentOnly;
  },

  /**
   * Retrieves login access history logs.
   */
  async getLoginHistory(): Promise<SuperAdminLoginLog[]> {
    try {
      const stored = safeStorage.getItem(LOGIN_LOGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    safeStorage.setItem(LOGIN_LOGS_STORAGE_KEY, JSON.stringify(DEFAULT_LOGIN_LOGS));
    return DEFAULT_LOGIN_LOGS;
  },

  /**
   * Generates and rotates the Cryptographic Master Recovery Key.
   */
  async rotateMasterRecoveryKey(): Promise<string> {
    const randomHex = Array.from({ length: 4 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase()).join('-');
    const newKey = `FP-SOV-KEY-${randomHex}-QUANTUM-ROOT`;

    const profile = await this.getProfile();
    profile.masterRecoveryKey = newKey;
    if (profile.securitySettings) {
      profile.securitySettings.masterRecoveryKey = newKey;
    }
    safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

    try {
      await auditService.record({
        action: 'MASTER_RECOVERY_KEY_ROTATED',
        module: 'ADMIN_GOVERNANCE',
        target: 'Cryptographic Master Root Seed Key Rotated',
        targetId: 'KEY-ROTATION-ROOT',
        previousValue: 'PREVIOUS_RECOVERY_KEY',
        newValue: `KEY_CHECKSUM_${randomHex}`,
        severity: 'CRITICAL'
      });
    } catch {}

    return newKey;
  },

  /**
   * Simulates master password update with audit log.
   */
  async updateMasterPassword(newPassword: string): Promise<boolean> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const profile = await this.getProfile();
    if (profile.securitySettings) {
      profile.securitySettings.lastPasswordChangeDate = new Date().toISOString().substring(0, 10);
    }
    safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

    try {
      await auditService.record({
        action: 'MASTER_ROOT_PASSWORD_CHANGED',
        module: 'ADMIN_GOVERNANCE',
        target: 'Root Chancellor Authentication Password Updated',
        targetId: 'AUTH-PASS-CHANGE',
        previousValue: 'HASH_MASKED',
        newValue: 'NEW_PASSWORD_HASH_SEALED',
        severity: 'CRITICAL'
      });
    } catch {}

    return true;
  },

  /**
   * Exports an official executive dossier memorandum.
   */
  exportExecutiveDossier(profile: SuperAdminProfileData): string {
    return [
      '================================================================================',
      'FOCUSPOINT SOVEREIGN PLATFORM — EXECUTIVE CREDENTIALS DOSSIER',
      'NATIONAL COMMAND ROOT ADMINISTRATOR MANDATE',
      '================================================================================',
      `Officer Name:          ${profile.name}`,
      `Officer Designation:   ${profile.designation}`,
      `Sovereign Title:       ${profile.sovereignTitle || 'Sovereign Platform Architect'}`,
      `Clearance Level:       ${profile.sovereignClearanceLevel || 'LEVEL 5 — SUPREME ROOT'}`,
      `Official Email:        ${profile.email}`,
      `Verified SMS Line:     ${profile.phone}`,
      `Employee ID:           ${profile.employeeId || 'FP-ROOT-001'}`,
      `Tenure Start Date:     ${profile.joinedDate || '2024-01-01'}`,
      `Cryptographic Seal:    ${profile.merkleDigitalSignature || 'VERIFIED_GENESIS_ROOT'}`,
      '--------------------------------------------------------------------------------',
      `Executive Duties:`,
      `  ${profile.bio}`,
      '--------------------------------------------------------------------------------',
      `Security Posture:`,
      `  2FA Enforcement:     ${profile.securitySettings?.twoFactorEnabled ? 'ACTIVE (TOTP)' : 'DISABLED'}`,
      `  3FA Step-Up Gate:    ${profile.threeFactorEnabled ? 'ACTIVE (WHATSAPP/SMS OTP)' : 'DISABLED'}`,
      `  Session Timeout:     ${profile.securitySettings?.sessionTimeoutMinutes || 60} Minutes`,
      '================================================================================'
    ].join('\n');
  }
};
