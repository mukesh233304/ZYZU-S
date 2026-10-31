/**
 * FOCUSPOINT Quota-Safe Storage Utility
 * Prevents QuotaExceededError across the entire FocusPoint platform.
 * Implements tiered eviction (evicting volatile/re-creatable caches first)
 * and seamless fallback to sessionStorage & in-memory storage so user
 * authentication, profile switching, and navigation never fail.
 */

// In-memory fallback map for private browsing, quota limits, or test runners
const memoryStore = new Map<string, string>();

/**
 * Checks if a key can be evicted when localStorage is full.
 * Critical session keys like 'fp_current_session_user', 'fp_user', 'fp_token' are protected.
 */
const isVolatileKey = (key: string): boolean => {
  if (
    key === 'fp_current_session_user' ||
    key === 'fp_user' ||
    key === 'focuspoint_current_user' ||
    key === 'fp_token' ||
    key === 'fp_auth_credentials' ||
    key === 'fp_district_admin_records'
  ) {
    return false;
  }
  return (
    key.startsWith('fp_user_avatar_') ||
    key.startsWith('fp_owner_avatar') ||
    key.startsWith('fp_super_admin_avatar') ||
    key.startsWith('fp_district_admin_avatar') ||
    key.startsWith('pincode_cache_') ||
    key.startsWith('geo_cache_') ||
    key.startsWith('fp_advertisements_') ||
    key.startsWith('fp_super_admin_audit_logs') ||
    key.startsWith('fp_user_video_testimonials') ||
    key.startsWith('fp_notif_prefs_') ||
    key.includes('avatar') ||
    key.includes('cache') ||
    key.includes('temp') ||
    key.includes('backup') ||
    key === 'fp_mock_store_v1' // Large mock database snapshot that can be purged or re-initialized
  );
};

export const safeStorage = {
  /**
   * Safely retrieves an item from localStorage, sessionStorage, or in-memory fallback.
   */
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) return item;
      }
    } catch {
      // localStorage read failed or restricted
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const item = window.sessionStorage.getItem(key);
        if (item !== null) return item;
      }
    } catch {
      // sessionStorage read failed
    }

    return memoryStore.get(key) || null;
  },

  /**
   * Safely sets an item. If QuotaExceededError occurs, automatically purges
   * non-essential volatile caches and retries. If localStorage is still full,
   * falls back to sessionStorage and in-memory storage so the user operation NEVER crashes.
   */
  setItem(key: string, value: string): boolean {
    // 1. Try standard localStorage write
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        memoryStore.set(key, value);
        return true;
      }
    } catch (err: any) {
      console.warn(`[safeStorage] QuotaExceeded or write error on key "${key}", executing emergency cache purge:`, err);
    }

    // 2. Perform intelligent purge of volatile keys
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToEvict: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k !== key && isVolatileKey(k)) {
            keysToEvict.push(k);
          }
        }

        for (const k of keysToEvict) {
          try {
            window.localStorage.removeItem(k);
          } catch {}
        }

        // Retry write after purge
        window.localStorage.setItem(key, value);
        memoryStore.set(key, value);
        console.info(`[safeStorage] Successfully saved "${key}" after purging ${keysToEvict.length} volatile cache keys.`);
        return true;
      }
    } catch (retryErr: any) {
      console.warn(`[safeStorage] localStorage write still failed after purge for "${key}". Falling back to sessionStorage / in-memory.`, retryErr);
    }

    // 3. Fallback to sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      // sessionStorage also unavailable or full
    }

    // 4. Guaranteed in-memory fallback
    memoryStore.set(key, value);
    return true;
  },

  /**
   * Safely removes an item across all storage tiers.
   */
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch {}

    memoryStore.delete(key);
  },

  /**
   * Purges all non-essential volatile storage to free up space proactively.
   */
  purgeVolatileCaches(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToEvict: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && isVolatileKey(k)) {
            keysToEvict.push(k);
          }
        }
        keysToEvict.forEach((k) => {
          try {
            window.localStorage.removeItem(k);
          } catch {}
        });
        console.info(`[safeStorage] Purged ${keysToEvict.length} volatile keys to restore quota headroom.`);
      }
    } catch (e) {
      console.warn('[safeStorage] purgeVolatileCaches error:', e);
    }
  }
};
