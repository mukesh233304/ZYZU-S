// FOCUSPOINT Central District Authorization Service
// Single Source of Truth for District-Scoped Authorization & Access Control

import { safeStorage } from '../utils/storageUtils';

export interface DistrictAdminScope {
  userId: string;
  userAdminId?: string;
  role: 'DISTRICT_ADMIN' | 'SUPER_ADMIN';
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  assignmentStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING' | 'INACTIVE';
  permissions: string[];
  isPanIndia?: boolean;
}

export interface DistrictAccessAuditLog {
  id: string;
  actorUserId: string;
  actorRole: string;
  authorizedDistrictId: string;
  authorizedDistrictName: string;
  requestedDistrictId: string;
  requestedDistrictName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  result: 'ALLOWED' | 'DENIED';
  reason?: string;
  timestamp: string;
}

const KNOWN_DISTRICTS: Record<string, { id: string; name: string; stateId: string; stateName: string }> = {
  ghazipur: { id: 'dist-gzp', name: 'Ghazipur', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-gzp': { id: 'dist-gzp', name: 'Ghazipur', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  mirzapur: { id: 'dist-mzp', name: 'Mirzapur', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-mzp': { id: 'dist-mzp', name: 'Mirzapur', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  varanasi: { id: 'dist-vns', name: 'Varanasi', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-vns': { id: 'dist-vns', name: 'Varanasi', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  mau: { id: 'dist-mau', name: 'Mau', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-mau': { id: 'dist-mau', name: 'Mau', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  ballia: { id: 'dist-bal', name: 'Ballia', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-bal': { id: 'dist-bal', name: 'Ballia', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  lucknow: { id: 'dist-lko', name: 'Lucknow', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-lko': { id: 'dist-lko', name: 'Lucknow', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  jaunpur: { id: 'dist-jnp', name: 'Jaunpur', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-jnp': { id: 'dist-jnp', name: 'Jaunpur', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  prayagraj: { id: 'dist-pry', name: 'Prayagraj', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
  'dist-pry': { id: 'dist-pry', name: 'Prayagraj', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' },
};

class DistrictAuthorizationService {
  private AUDIT_STORAGE_KEY = 'fp_district_access_audit_logs';

  /**
   * Resolves district identifier and normalized metadata
   */
  public resolveDistrict(nameOrId: string): { id: string; name: string; stateId: string; stateName: string } {
    if (!nameOrId) return { id: '', name: '', stateId: 'loc-state-up', stateName: 'Uttar Pradesh' };
    const key = nameOrId.toLowerCase().trim();
    if (KNOWN_DISTRICTS[key]) {
      return KNOWN_DISTRICTS[key];
    }
    // Generate deterministic slug ID
    const slug = key.replace(/[^a-z0-9]/g, '');
    const properName = nameOrId.charAt(0).toUpperCase() + nameOrId.slice(1);
    return {
      id: `dist-${slug.substring(0, 6)}`,
      name: properName,
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh'
    };
  }

  public resolveDistrictId(nameOrId: string): string {
    return this.resolveDistrict(nameOrId).id;
  }

  public resolveDistrictName(nameOrId: string): string {
    return this.resolveDistrict(nameOrId).name;
  }

  /**
   * Single Source of Truth: Resolves current user's authoritative district access scope
   */
  public getAuthorizedScope(userParam?: any): DistrictAdminScope | null {
    let user = userParam;
    if (!user) {
      const raw = safeStorage.getItem('fp_current_session_user') || safeStorage.getItem('fp_user');
      if (raw) {
        try {
          user = JSON.parse(raw);
        } catch {
          user = null;
        }
      }
    }
    if (!user) return null;

    try {
      const role = (user.role || '').toUpperCase();

      if (role === 'SUPER_ADMIN') {
        return {
          userId: user.id || user.userId || 'usr-super-admin',
          userAdminId: user.userId || user.id,
          role: 'SUPER_ADMIN',
          stateId: 'all',
          stateName: 'All India',
          districtId: 'all',
          districtName: 'All India',
          assignmentStatus: 'ACTIVE',
          permissions: ['*'],
          isPanIndia: true
        };
      }

      if (role === 'DISTRICT_ADMIN') {
        const assignedDistrict = user.authorizedDistrict || user.districtName || user.district;
        if (!assignedDistrict) return null;

        const resolved = this.resolveDistrict(assignedDistrict);
        const stateName = user.authorizedState || user.stateName || user.state || resolved.stateName;

        return {
          userId: user.id || user.userId || 'da-unknown',
          userAdminId: user.userId || user.id,
          role: 'DISTRICT_ADMIN',
          stateId: user.stateId || resolved.stateId,
          stateName,
          districtId: user.districtId || resolved.id,
          districtName: resolved.name,
          assignmentStatus: (user.accountStatus || user.status || 'ACTIVE').toUpperCase() as any,
          permissions: [
            'MANAGE_TEACHERS',
            'MANAGE_STUDENTS',
            'MANAGE_LIBRARIES',
            'VIEW_REPORTS',
            'MANAGE_REQUESTS',
            'MANAGE_ATTENDANCE',
            'MANAGE_FEES'
          ],
          isPanIndia: false
        };
      }
    } catch (e) {
      console.error('Error resolving district authorization scope:', e);
    }

    return null;
  }

  /**
   * Server-side Enforcement: verifies requested district against authorized scope
   * - If user object is passed as 2nd parameter, returns boolean (true if allowed, false if denied)
   * - If string/undefined passed as 2nd parameter, throws 403 Forbidden error on violation
   */
  public verifyDistrictAccess(
    requestedDistrict?: string,
    userOrResourceType?: any,
    action: string = 'QUERY',
    options?: { throwOnError?: boolean }
  ): any {
    const isUserObject = userOrResourceType && typeof userOrResourceType === 'object' &&
      ('role' in userOrResourceType || 'district' in userOrResourceType || 'authorizedDistrict' in userOrResourceType || 'districtName' in userOrResourceType || 'userId' in userOrResourceType);

    const user = isUserObject ? userOrResourceType : undefined;
    const resourceType = isUserObject ? 'district_data' : (typeof userOrResourceType === 'string' ? userOrResourceType : 'district_data');
    const throwOnError = options?.throwOnError ?? (!isUserObject);

    const scope = this.getAuthorizedScope(user);

    if (!scope) {
      this.recordAuditLog({
        id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        actorUserId: user?.id || user?.userId || 'anonymous',
        actorRole: user?.role || 'ANONYMOUS',
        authorizedDistrictId: 'NONE',
        authorizedDistrictName: 'NONE',
        requestedDistrictId: requestedDistrict || 'UNKNOWN',
        requestedDistrictName: requestedDistrict || 'UNKNOWN',
        action,
        resourceType,
        result: 'DENIED',
        reason: 'District Access Not Assigned. Please contact Super Admin.',
        timestamp: new Date().toISOString()
      });
      if (throwOnError) {
        throw new Error('403 FORBIDDEN: District Access Not Assigned. Please contact Super Admin.');
      }
      return false;
    }

    if (scope.isPanIndia || scope.role === 'SUPER_ADMIN') {
      this.recordAuditLog({
        id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        actorUserId: scope.userId,
        actorRole: 'SUPER_ADMIN',
        authorizedDistrictId: 'PAN_INDIA',
        authorizedDistrictName: 'PAN_INDIA',
        requestedDistrictId: requestedDistrict || 'ALL',
        requestedDistrictName: requestedDistrict || 'ALL',
        action,
        resourceType,
        result: 'ALLOWED',
        reason: 'Super Admin Pan-India Access Override',
        timestamp: new Date().toISOString()
      });
      return isUserObject ? true : (requestedDistrict || 'Ghazipur');
    }

    // Role is DISTRICT_ADMIN
    if (scope.assignmentStatus === 'SUSPENDED') {
      this.recordAuditLog({
        id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        actorUserId: scope.userId,
        actorRole: scope.role,
        authorizedDistrictId: scope.districtId,
        authorizedDistrictName: scope.districtName,
        requestedDistrictId: requestedDistrict || scope.districtId,
        requestedDistrictName: requestedDistrict || scope.districtName,
        action,
        resourceType,
        result: 'DENIED',
        reason: 'Your District Admin account is currently suspended. Please contact the Super Admin.',
        timestamp: new Date().toISOString()
      });
      if (throwOnError) {
        throw new Error('403 FORBIDDEN: Your District Admin account is currently suspended. Please contact the Super Admin.');
      }
      return false;
    }

    if (scope.assignmentStatus === 'DEACTIVATED' || scope.assignmentStatus === 'INACTIVE') {
      this.recordAuditLog({
        id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        actorUserId: scope.userId,
        actorRole: scope.role,
        authorizedDistrictId: scope.districtId,
        authorizedDistrictName: scope.districtName,
        requestedDistrictId: requestedDistrict || scope.districtId,
        requestedDistrictName: requestedDistrict || scope.districtName,
        action,
        resourceType,
        result: 'DENIED',
        reason: 'Your District Admin access has been deactivated.',
        timestamp: new Date().toISOString()
      });
      if (throwOnError) {
        throw new Error('403 FORBIDDEN: Your District Admin access has been deactivated.');
      }
      return false;
    }

    const authorizedName = scope.districtName;
    const authorizedId = scope.districtId;

    if (requestedDistrict) {
      const cleanReq = requestedDistrict.toLowerCase().trim();
      const matchesName = cleanReq === authorizedName.toLowerCase().trim();
      const matchesId = cleanReq === authorizedId.toLowerCase().trim();

      if (!matchesName && !matchesId) {
        this.recordAuditLog({
          id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          actorUserId: scope.userId,
          actorRole: scope.role,
          authorizedDistrictId: authorizedId,
          authorizedDistrictName: authorizedName,
          requestedDistrictId: requestedDistrict,
          requestedDistrictName: requestedDistrict,
          action,
          resourceType,
          result: 'DENIED',
          reason: `Cross-district violation: Attempted to access ${requestedDistrict} while authorized for ${authorizedName}`,
          timestamp: new Date().toISOString()
        });
        if (throwOnError) {
          throw new Error(`403 FORBIDDEN: Access Denied. You are authorized only for ${authorizedName}. Access to ${requestedDistrict} is restricted.`);
        }
        return false;
      }
    }

    // Access granted
    this.recordAuditLog({
      id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actorUserId: scope.userId,
      actorRole: scope.role,
      authorizedDistrictId: authorizedId,
      authorizedDistrictName: authorizedName,
      requestedDistrictId: requestedDistrict || authorizedId,
      requestedDistrictName: requestedDistrict || authorizedName,
      action,
      resourceType,
      result: 'ALLOWED',
      timestamp: new Date().toISOString()
    });

    return isUserObject ? true : authorizedName;
  }

  /**
   * Strictly enforces access, always throwing 403 if unauthorized and returning the authorized district name
   */
  public enforceDistrictAccess(
    requestedDistrict?: string,
    user?: any,
    resourceType: string = 'district_data',
    action: string = 'QUERY'
  ): string {
    const scope = this.getAuthorizedScope(user);
    if (!scope) {
      this.recordAuditLog({
        id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        actorUserId: user?.id || user?.userId || 'anonymous',
        actorRole: user?.role || 'ANONYMOUS',
        authorizedDistrictId: 'NONE',
        authorizedDistrictName: 'NONE',
        requestedDistrictId: requestedDistrict || 'UNKNOWN',
        requestedDistrictName: requestedDistrict || 'UNKNOWN',
        action,
        resourceType,
        result: 'DENIED',
        reason: 'District Access Not Assigned. Please contact Super Admin.',
        timestamp: new Date().toISOString()
      });
      throw new Error('403 FORBIDDEN: District Access Not Assigned. Please contact Super Admin.');
    }

    if (scope.isPanIndia || scope.role === 'SUPER_ADMIN') {
      return requestedDistrict || scope.districtName;
    }

    const authorizedName = scope.districtName;
    const authorizedId = scope.districtId;

    if (requestedDistrict) {
      const cleanReq = requestedDistrict.toLowerCase().trim();
      const matchesName = cleanReq === authorizedName.toLowerCase().trim();
      const matchesId = cleanReq === authorizedId.toLowerCase().trim();

      if (!matchesName && !matchesId) {
        this.recordAuditLog({
          id: `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          actorUserId: scope.userId,
          actorRole: scope.role,
          authorizedDistrictId: authorizedId,
          authorizedDistrictName: authorizedName,
          requestedDistrictId: requestedDistrict,
          requestedDistrictName: requestedDistrict,
          action,
          resourceType,
          result: 'DENIED',
          reason: `Cross-district violation: Attempted to access ${requestedDistrict} while authorized for ${authorizedName}`,
          timestamp: new Date().toISOString()
        });
        throw new Error(`403 FORBIDDEN: Access Denied. You are authorized only for ${authorizedName}. Access to ${requestedDistrict} is restricted.`);
      }
    }

    return authorizedName;
  }

  /**
   * Entity-Level District Matching
   * Determines if a given entity belongs to the authorized scope.
   */
  public matchesScope(
    a: any,
    b?: any
  ): boolean {
    if (!a) return false;
    let item: { districtId?: string; districtName?: string; district?: string };
    let scope: DistrictAdminScope | null | undefined;

    if (a && ('assignmentStatus' in a || 'isPanIndia' in a) && b) {
      scope = a;
      item = b;
    } else {
      item = a;
      scope = b;
    }

    const activeScope = scope !== undefined ? scope : this.getAuthorizedScope();
    if (!activeScope) return false;
    if (activeScope.isPanIndia || activeScope.role === 'SUPER_ADMIN') return true;

    const authName = activeScope.districtName.toLowerCase().trim();
    const authId = activeScope.districtId.toLowerCase().trim();

    if (item && item.districtName && item.districtName.toLowerCase().trim() === authName) return true;
    if (item && item.district && item.district.toLowerCase().trim() === authName) return true;
    if (item && item.districtId && item.districtId.toLowerCase().trim() === authId) return true;
    if (item && item.districtId && item.districtId.toLowerCase().trim() === authName) return true;

    return false;
  }

  /**
   * Session Isolation: Clears any client-side cached district state
   */
  public clearDistrictSessionCache(): void {
    try {
      safeStorage.removeItem('fp_district_scope_cache');
      safeStorage.removeItem('fp_active_district');
      safeStorage.removeItem('fp_active_district_scope');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith('fp_district_cache_') ||
           k.startsWith('dashboard-summary:') ||
           k === 'fp_district_scope_cache' ||
           k === 'fp_active_district' ||
           k === 'fp_active_district_scope' ||
           (k.includes('district') && k.includes('cache')))
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => safeStorage.removeItem(k));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Audit Trail Management
   */
  public recordAuditLog(log: DistrictAccessAuditLog): void {
    try {
      const raw = safeStorage.getItem(this.AUDIT_STORAGE_KEY);
      const list: DistrictAccessAuditLog[] = raw ? JSON.parse(raw) : [];
      list.unshift(log);
      // Keep recent 100 entries
      safeStorage.setItem(this.AUDIT_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      // Ignore audit storage error
    }
  }

  public getAccessAuditLogs(): DistrictAccessAuditLog[] {
    try {
      const raw = safeStorage.getItem(this.AUDIT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const districtAuthorizationService = new DistrictAuthorizationService();
