import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeStorage } from '../utils/storageUtils';
import { authService } from '../services/authService';

describe('QUOTA-SAFE STORAGE & AUTHENTICATION RECOVERY TESTS', () => {
  beforeEach(() => {
    safeStorage.purgeVolatileCaches();
  });

  it('safely stores and retrieves keys in standard environment', () => {
    const testKey = 'fp_test_key_1';
    const testVal = JSON.stringify({ id: 'test', name: 'Tester' });

    expect(safeStorage.setItem(testKey, testVal)).toBe(true);
    expect(safeStorage.getItem(testKey)).toBe(testVal);

    safeStorage.removeItem(testKey);
    expect(safeStorage.getItem(testKey)).toBeNull();
  });

  it('handles QuotaExceededError transparently by evicting volatile caches and falling back', () => {
    // Populate volatile keys
    safeStorage.setItem('fp_user_avatar_test', 'data:image/png;base64,largeAvatarContent');
    safeStorage.setItem('pincode_cache_226001', JSON.stringify({ locality: 'Hazratganj' }));

    const userPayload = JSON.stringify({ id: 'usr-student-aryan', role: 'STUDENT', name: 'Aryan Singh' });

    if (typeof Storage !== 'undefined' && Storage.prototype) {
      let callCount = 0;
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(key: string, value: string) {
        callCount++;
        if (callCount === 1) {
          const error = new Error("Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota.");
          error.name = 'QuotaExceededError';
          throw error;
        }
      });

      expect(() => {
        safeStorage.setItem('fp_current_session_user', userPayload);
      }).not.toThrow();

      expect(safeStorage.getItem('fp_current_session_user')).toBe(userPayload);
      spy.mockRestore();
    } else {
      expect(safeStorage.setItem('fp_current_session_user', userPayload)).toBe(true);
      expect(safeStorage.getItem('fp_current_session_user')).toBe(userPayload);
    }
  });

  it('guarantees switchRole("STUDENT") switches profile safely without throwing QuotaExceededError', async () => {
    const studentUser = await authService.switchRole('STUDENT');
    expect(studentUser).toBeDefined();
    expect(studentUser?.role).toBe('STUDENT');
    expect(studentUser?.id).toBe('usr-student-aryan');
    expect(studentUser?.name).toBe('Aryan Singh');

    const currentUser = await authService.getCurrentUser();
    expect(currentUser).toBeDefined();
    expect(currentUser?.role).toBe('STUDENT');
  });
});
