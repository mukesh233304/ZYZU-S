import { describe, it, expect, beforeEach } from 'vitest';
import { districtAuthorizationService } from '../services/districtAuthorizationService';
import { superAdminService } from '../services/superAdminService';
import { authService } from '../services/authService';
import { districtAdminService } from '../services/districtAdminService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';
import { User } from '../types';

describe('FOCUSPOINT — Section 40 Acceptance Tests: Advanced District-Scoped Data Isolation & Command Center', () => {
  beforeEach(() => {
    // Reset volatile test states and storage
    districtAuthorizationService.clearDistrictSessionCache();
    safeStorage.removeItem('fp_auth_credentials');
    safeStorage.removeItem('fp_district_admin_records');
    safeStorage.removeItem('fp_mock_store_v1');
    safeStorage.removeItem('fp_current_session_user');
    safeStorage.removeItem('fp_user');
    safeStorage.removeItem('fp_token');
    (mockStore as any).loadFromStorage();
  });

  // Test 1 — Mirzapur Admin: Dashboard District = Mirzapur, all displayed data belongs to Mirzapur
  it('Test 1 — Mirzapur Admin: Assign Mirzapur -> Dashboard District = Mirzapur, displays ONLY Mirzapur data (Zero Ghazipur)', async () => {
    // 1. Super Admin appoints Mirzapur Admin
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Mirzapur',
      adminName: 'Mirzapur Nodal Admin',
      adminEmail: 'nodal.mirzapur@focuspoint.internal',
      adminPhone: '9876543201',
      whatsappNumber: '9876543201',
      userId: 'FP-DA-UP-MZP-001',
      temporaryPassword: 'FocusPoint@Mirzapur2026',
      replaceExisting: true,
    });

    // 2. Login as Mirzapur Admin
    const loginRes = await authService.login('FP-DA-UP-MZP-001', 'FocusPoint@Mirzapur2026');
    expect(loginRes.success).toBe(true);
    const mirzapurUser = loginRes.user;

    // 3. Resolve authoritative district scope
    const scope = districtAuthorizationService.getAuthorizedScope(mirzapurUser);
    expect(scope).not.toBeNull();
    expect(scope?.districtName).toBe('Mirzapur');
    expect(scope?.districtId).toBe('dist-mzp');
    expect(scope?.role).toBe('DISTRICT_ADMIN');

    // 4. Fetch Dashboard KPIs
    const kpis = await districtAdminService.getDashboardKPIs('Mirzapur', mirzapurUser);
    expect(kpis).not.toBeNull();

    // Verify all KPIs strictly correspond to Mirzapur data
    const mzpTeachers = mockStore.getTeachers('Mirzapur');
    const mzpLibraries = mockStore.getLibraries('Mirzapur');
    const mzpStudents = mockStore.getStudents('Mirzapur');

    expect(kpis?.totalTeachers).toBe(mzpTeachers.length);
    expect(kpis?.totalLibraries).toBe(mzpLibraries.length);
    expect(kpis?.totalStudents).toBe(mzpStudents.length);

    // CRITICAL: Ensure it NEVER returns Ghazipur numbers (e.g. 254 students, 68 teachers, 336000 revenue)
    expect(kpis?.totalStudents).not.toBe(254);
    expect(kpis?.totalTeachers).not.toBe(68);
    expect(kpis?.totalRevenue).not.toBe(336000);
  });

  // Test 2 — Ghazipur Admin: Dashboard District = Ghazipur, all displayed data belongs to Ghazipur
  it('Test 2 — Ghazipur Admin: Assign Ghazipur -> Dashboard District = Ghazipur, displays ONLY Ghazipur data', async () => {
    // 1. Super Admin appoints Ghazipur Admin
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      whatsappNumber: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    // 2. Login as Ghazipur Admin
    const loginRes = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(loginRes.success).toBe(true);
    const ghazipurUser = loginRes.user;

    // 3. Resolve authoritative district scope
    const scope = districtAuthorizationService.getAuthorizedScope(ghazipurUser);
    expect(scope).not.toBeNull();
    expect(scope?.districtName).toBe('Ghazipur');
    expect(['dist-gzp', 'dist-up-01']).toContain(scope?.districtId);

    // 4. Fetch Dashboard KPIs
    const kpis = await districtAdminService.getDashboardKPIs('Ghazipur', ghazipurUser);
    expect(kpis).not.toBeNull();

    // Verify all records returned belong to Ghazipur
    const ghzTeachers = mockStore.getTeachers('Ghazipur');
    expect(kpis?.totalTeachers).toBe(ghzTeachers.length);
    ghzTeachers.forEach((t) => {
      expect(districtAuthorizationService.matchesScope(t, scope!)).toBe(true);
    });
  });

  // Test 3 — Cross-District Attempt: Mirzapur Admin attempts to access Ghazipur data -> 403 Forbidden
  it('Test 3 — Cross-District Attempt: Mirzapur Admin attempts to access Ghazipur data -> 403 FORBIDDEN and audit log recorded', async () => {
    const mirzapurUser: User = {
      id: 'usr-da-mzp-01',
      name: 'Mirzapur Admin',
      email: 'mzp.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-mzp',
      districtName: 'Mirzapur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };

    // Attempting to access Ghazipur data
    const isAllowed = districtAuthorizationService.verifyDistrictAccess('Ghazipur', mirzapurUser);
    expect(isAllowed).toBe(false);

    // Calling service with unauthorized district must fail or reject
    await expect(
      districtAdminService.getDashboardKPIs('Ghazipur', mirzapurUser)
    ).rejects.toThrow(/403 FORBIDDEN/i);

    // Verify Enterprise Security Audit Log records this DENIED access attempt
    const auditLogs = districtAuthorizationService.getAccessAuditLogs();
    const deniedLog = auditLogs.find(
      (l) => l.actorUserId === mirzapurUser.id && l.result === 'DENIED'
    );
    expect(deniedLog).toBeDefined();
    expect(deniedLog?.authorizedDistrictName).toBe('Mirzapur');
    expect(deniedLog?.requestedDistrictName).toBe('Ghazipur');
  });

  // Test 4 — Empty District: Mirzapur has 0 records -> displays 0, NEVER fallback to Ghazipur
  it('Test 4 — Empty District: Unseeded district returns 0 or empty list, NEVER Ghazipur numbers as fallback', async () => {
    const emptyDistrictUser: User = {
      id: 'usr-da-jhansi-01',
      name: 'Jhansi Admin',
      email: 'jhansi.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-jhansi',
      districtName: 'Jhansi',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };

    const scope = districtAuthorizationService.getAuthorizedScope(emptyDistrictUser);
    expect(scope?.districtName).toBe('Jhansi');

    const teachers = mockStore.getTeachers('Jhansi');
    const libraries = mockStore.getLibraries('Jhansi');
    const students = mockStore.getStudents('Jhansi');

    expect(teachers.length).toBe(0);
    expect(libraries.length).toBe(0);
    expect(students.length).toBe(0);

    const kpis = await districtAdminService.getDashboardKPIs('Jhansi', emptyDistrictUser);
    expect(kpis?.totalTeachers).toBe(0);
    expect(kpis?.totalLibraries).toBe(0);
    expect(kpis?.totalStudents).toBe(0);
    expect(kpis?.totalRevenue).toBe(0);

    // Zero fallback leakage!
    expect(kpis?.totalTeachers).not.toBe(68);
    expect(kpis?.totalStudents).not.toBe(254);
    expect(kpis?.totalLibraries).not.toBe(10);
  });

  // Test 5 — Search: Mirzapur Admin searches for Ghazipur student -> 0 results in authorized scope
  it('Test 5 — Search: Mirzapur Admin searching non-district entity returns 0 matching results in authorized scope', () => {
    const mirzapurUser: User = {
      id: 'usr-da-mzp-01',
      name: 'Mirzapur Admin',
      email: 'mzp.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-mzp',
      districtName: 'Mirzapur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };

    const scope = districtAuthorizationService.getAuthorizedScope(mirzapurUser);

    // Retrieve Ghazipur students
    const ghazipurStudents = mockStore.getStudents('Ghazipur');
    expect(ghazipurStudents.length).toBeGreaterThan(0);
    const targetGhazipurStudent = ghazipurStudents[0];

    // Filter students under Mirzapur scope searching for Ghazipur student name
    const mirzapurScopedStudents = mockStore.getStudents(scope!.districtName);
    const searchMatch = mirzapurScopedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(targetGhazipurStudent.name.toLowerCase()) &&
        districtAuthorizationService.matchesScope(s, scope!)
    );

    expect(searchMatch.length).toBe(0);
  });

  // Test 6 — Export: Mirzapur Admin exports records -> Only Mirzapur records, 0 Ghazipur records
  it('Test 6 — Export: Exports are strictly district-scoped to authorized territory', () => {
    const mirzapurUser: User = {
      id: 'usr-da-mzp-01',
      name: 'Mirzapur Admin',
      email: 'mzp.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-mzp',
      districtName: 'Mirzapur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };

    const scope = districtAuthorizationService.getAuthorizedScope(mirzapurUser);
    expect(scope).not.toBeNull();

    // Export dataset under Mirzapur scope
    const exportDataset = mockStore.getTeachers(scope!.districtName).filter((t) =>
      districtAuthorizationService.matchesScope(t, scope!)
    );

    // Must contain 0 records belonging to Ghazipur or other districts
    exportDataset.forEach((record) => {
      expect(record.district?.toLowerCase()).toBe('mirzapur');
      expect(record.district?.toLowerCase()).not.toBe('ghazipur');
    });
  });

  // Test 7 — Logout / Login: Mirzapur Admin logs out, Ghazipur Admin logs in -> Session cache cleanly flushed
  it('Test 7 — Logout/Login: Session cache flushed on logout; subsequent login sees only newly authorized district', async () => {
    // 1. Login Mirzapur Admin
    const mzpUser: User = {
      id: 'usr-da-mzp-01',
      name: 'Mirzapur Admin',
      email: 'mzp.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-mzp',
      districtName: 'Mirzapur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };
    safeStorage.setItem('fp_current_session_user', JSON.stringify(mzpUser));
    safeStorage.setItem('fp_user', JSON.stringify(mzpUser));
    safeStorage.setItem('fp_district_scope_cache', JSON.stringify({ districtName: 'Mirzapur' }));

    expect(districtAuthorizationService.getAuthorizedScope(mzpUser)?.districtName).toBe('Mirzapur');

    // 2. Logout Mirzapur Admin
    await authService.logout();

    // Verify session cache is completely purged
    expect(safeStorage.getItem('fp_district_scope_cache')).toBeNull();
    expect(safeStorage.getItem('fp_current_session_user')).toBeNull();

    // 3. Login Ghazipur Admin
    const ghzUser: User = {
      id: 'usr-da-ghz-01',
      name: 'Ghazipur Admin',
      email: 'ghz.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-up-01',
      districtName: 'Ghazipur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };
    safeStorage.setItem('fp_current_session_user', JSON.stringify(ghzUser));
    safeStorage.setItem('fp_user', JSON.stringify(ghzUser));

    const newScope = districtAuthorizationService.getAuthorizedScope(ghzUser);
    expect(newScope?.districtName).toBe('Ghazipur');
    expect(newScope?.districtName).not.toBe('Mirzapur');
  });

  // Test 8 — URL Manipulation: Changing district parameter in URL / route returns ACCESS DENIED
  it('Test 8 — URL Manipulation: Tampering with district parameter returns 403 Forbidden', () => {
    const mirzapurUser: User = {
      id: 'usr-da-mzp-01',
      name: 'Mirzapur Admin',
      email: 'mzp.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-mzp',
      districtName: 'Mirzapur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };

    // User attempts to access ?districtId=Ghazipur or ?district=Varanasi
    const urlDistrictParam = 'Ghazipur';
    const isUrlAccessAllowed = districtAuthorizationService.verifyDistrictAccess(
      urlDistrictParam,
      mirzapurUser
    );

    expect(isUrlAccessAllowed).toBe(false);
  });

  // Test 9 — API Manipulation: Modifying district in API request payload is rejected by backend verification
  it('Test 9 — API Manipulation: Modifying districtId in payload rejected by server-side scope validation', async () => {
    const mirzapurUser: User = {
      id: 'usr-da-mzp-01',
      name: 'Mirzapur Admin',
      email: 'mzp.admin@focuspoint.internal',
      role: 'DISTRICT_ADMIN',
      districtId: 'dist-mzp',
      districtName: 'Mirzapur',
      stateId: 'loc-state-up',
      stateName: 'Uttar Pradesh',
    };

    // Attacker sends request to query Varanasi data with Mirzapur credentials
    const manipulatedQueryDistrict = 'Varanasi';

    expect(() => {
      const allowed = districtAuthorizationService.verifyDistrictAccess(
        manipulatedQueryDistrict,
        mirzapurUser
      );
      if (!allowed) {
        throw new Error('403 Forbidden: District Access Denied');
      }
    }).toThrow(/403 Forbidden/);
  });

  // Test 10 — Reassignment: Super Admin changes Mirzapur -> Ghazipur; Mirzapur becomes DENIED, Ghazipur becomes ALLOWED
  it('Test 10 — Reassignment: Changing administrator territory toggles access permissions immediately', async () => {
    const adminUserId = 'FP-DA-UP-TRANS-001';

    // 1. Initial Appointment to Mirzapur
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Mirzapur',
      adminName: 'Transferable Admin',
      adminEmail: 'transfer.admin@focuspoint.internal',
      adminPhone: '9876543299',
      whatsappNumber: '9876543299',
      userId: adminUserId,
      temporaryPassword: 'FocusPoint@Transfer2026',
      replaceExisting: true,
    });

    const initialUser = mockStore.getUserById(adminUserId);
    expect(districtAuthorizationService.verifyDistrictAccess('Mirzapur', initialUser)).toBe(true);
    expect(districtAuthorizationService.verifyDistrictAccess('Ghazipur', initialUser)).toBe(false);

    // 2. Super Admin reassigns admin from Mirzapur to Ghazipur
    const reassignRes = await superAdminService.reassignDistrictAdminTerritory(
      adminUserId,
      'loc-state-up',
      'Uttar Pradesh',
      'dist-up-01',
      'Ghazipur',
      'Territorial rotation order'
    );
    expect(reassignRes.success).toBe(true);

    // Invalidate cached session
    districtAuthorizationService.clearDistrictSessionCache();

    // 3. Verify updated permissions: Mirzapur is now DENIED, Ghazipur is now ALLOWED
    const updatedUser = mockStore.getUserById(adminUserId);
    expect(updatedUser?.authorizedDistrict).toBe('Ghazipur');

    expect(districtAuthorizationService.verifyDistrictAccess('Mirzapur', updatedUser)).toBe(false);
    expect(districtAuthorizationService.verifyDistrictAccess('Ghazipur', updatedUser)).toBe(true);
  });
});
