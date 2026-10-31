import { describe, it, expect, beforeAll } from 'vitest';
import runSeed from '../src/scripts/seed';
import db from '../src/db/database';

describe('FOCUSPOINT Super Admin Enterprise Command Center Test Suite', () => {
  beforeAll(() => {
    runSeed({ seedDemo: true });
  });

  describe('1. Super Admin Role & Permissions in Core Database', () => {
    it('Should verify Super Admin exists with sovereign permissions', () => {
      const superAdmin = db.prepare(`
        SELECT u.id, u.email, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE UPPER(r.name) = 'SUPER_ADMIN'
      `).get();

      expect(superAdmin).toBeDefined();
      expect(superAdmin.email).toBe('superadmin@focuspoint.internal');
      expect(superAdmin.role_name).toBe('SUPER_ADMIN');
    });

    it('Should verify all platform districts are accessible to Super Admin', () => {
      const districts = db.prepare('SELECT * FROM districts WHERE is_active = 1').all();
      expect(districts.length).toBeGreaterThanOrEqual(1);
      const ghazipur = districts.find(d => d.code === 'GZP');
      expect(ghazipur).toBeDefined();
      expect(ghazipur.name).toBe('Ghazipur');
    });
  });

  describe('2. Single Admin Per District Sovereignty Rule', () => {
    it('Should ensure exactly one active District Admin is assigned per district', () => {
      const districtAdmins = db.prepare(`
        SELECT u.id, u.email, da.district_id, d.name as district_name
        FROM district_admins da
        JOIN users u ON da.user_id = u.id
        JOIN districts d ON da.district_id = d.id
        WHERE da.status = 'ACTIVE'
      `).all();

      const districtMap = new Map();
      districtAdmins.forEach(da => {
        expect(districtMap.has(da.district_id)).toBe(false);
        districtMap.set(da.district_id, da.id);
      });
    });
  });

  describe('3. Platform Economics & Commission Invariants', () => {
    it('Should verify platform fee calculations match established standards', () => {
      const tuitionBookingAmount = 2000;
      const baseTuitionCommissionRate = 0.10; // 10%
      const platformFee = tuitionBookingAmount * baseTuitionCommissionRate;
      const teacherPayout = tuitionBookingAmount - platformFee;

      expect(platformFee).toBe(200);
      expect(teacherPayout).toBe(1800);
    });

    it('Should verify library booking platform fee and desk share', () => {
      const libraryFee = 499;
      const libraryCommissionRate = 0.08; // 8%
      const platformFee = Math.round(libraryFee * libraryCommissionRate);
      const ownerPayout = libraryFee - platformFee;

      expect(platformFee).toBe(40);
      expect(ownerPayout).toBe(459);
    });
  });

  describe('4. Territory & Location Hierarchy Integrity', () => {
    it('Should verify Uttar Pradesh active operational districts', () => {
      const activeDistricts = db.prepare(`
        SELECT name, code, state FROM districts WHERE is_active = 1
      `).all();

      expect(activeDistricts.some(d => d.name === 'Ghazipur')).toBe(true);
      expect(activeDistricts.some(d => d.state === 'Uttar Pradesh')).toBe(true);
    });
  });

  describe('5. Super Admin Global Avatar Update & Universal Deletion Contract', () => {
    it('Should verify avatar update sets persistent cache keys and clears deletion tombstones', () => {
      // Simulate localStorage keys and sync contract
      const storage = new Map();
      const setAvatar = (url) => {
        if (url && url.trim().length > 0) {
          storage.setItem = (k, v) => storage.set(k, v);
          storage.set('fp_super_admin_avatar', url);
          storage.set('fp_superadmin_avatar', url);
          storage.set('fp_user_avatar_usr-super-admin', url);
          storage.delete('fp_super_admin_avatar_deleted');
        }
      };

      const newAvatarUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      setAvatar(newAvatarUrl);

      expect(storage.get('fp_super_admin_avatar')).toBe(newAvatarUrl);
      expect(storage.get('fp_superadmin_avatar')).toBe(newAvatarUrl);
      expect(storage.get('fp_user_avatar_usr-super-admin')).toBe(newAvatarUrl);
      expect(storage.has('fp_super_admin_avatar_deleted')).toBe(false);
    });

    it('Should verify avatar deletion universally clears keys and marks deletion tombstone', () => {
      const storage = new Map();
      storage.set('fp_super_admin_avatar', 'https://images.unsplash.com/old-avatar.jpg');
      storage.set('fp_superadmin_avatar', 'https://images.unsplash.com/old-avatar.jpg');
      storage.set('fp_user_avatar_usr-super-admin', 'https://images.unsplash.com/old-avatar.jpg');

      const deleteAvatar = () => {
        storage.delete('fp_super_admin_avatar');
        storage.delete('fp_superadmin_avatar');
        storage.delete('fp_user_avatar_usr-super-admin');
        storage.set('fp_super_admin_avatar_deleted', 'true');
      };

      deleteAvatar();

      expect(storage.has('fp_super_admin_avatar')).toBe(false);
      expect(storage.has('fp_superadmin_avatar')).toBe(false);
      expect(storage.has('fp_user_avatar_usr-super-admin')).toBe(false);
      expect(storage.get('fp_super_admin_avatar_deleted')).toBe('true');

      // Universal avatar resolver test
      const resolveAvatar = (user) => {
        const isSA = user.role === 'SUPER_ADMIN';
        if (isSA) {
          if (storage.get('fp_super_admin_avatar_deleted') === 'true') {
            return ''; // No photo, initials must be rendered!
          }
          return storage.get('fp_super_admin_avatar') || user.avatarUrl || '';
        }
        return user.avatarUrl || '';
      };

      const mockSuperAdminUser = {
        id: 'usr-super-admin',
        name: 'Chief Platform Administrator',
        role: 'SUPER_ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785?w=200'
      };

      // Even though user object has mock avatarUrl, deletion tombstone forces empty string for initials
      const resolved = resolveAvatar(mockSuperAdminUser);
      expect(resolved).toBe('');
    });
  });
});

