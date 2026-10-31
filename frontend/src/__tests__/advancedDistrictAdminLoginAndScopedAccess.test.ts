import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService } from '../services/superAdminService';
import { authService } from '../services/authService';
import { districtAdminService } from '../services/districtAdminService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';
import { User } from '../types';

describe('FOCUSPOINT — Section 36 Acceptance Tests: District Admin Login, Credential Delivery & District-Scoped Access', () => {
  beforeEach(() => {
    // Reset volatile test states and reseed base stores
    safeStorage.removeItem('fp_auth_credentials');
    safeStorage.removeItem('fp_district_admin_records');
    safeStorage.removeItem('fp_mock_store_v1');
    safeStorage.removeItem('fp_current_session_user');
    safeStorage.removeItem('fp_user');
    safeStorage.removeItem('fp_token');
    (mockStore as any).loadFromStorage();
  });

  // Test 1 — District Admin creation
  it('Test 1 — District Admin creation: Super Admin creates District Admin, assigns Ghazipur, and activates account', async () => {
    const appointParams = {
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      whatsappNumber: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    };

    const result = await superAdminService.appointDistrictAdminWithCredentials(appointParams);
    expect(result.success).toBe(true);

    // Verify Account ACTIVE, Role DISTRICT_ADMIN, District Assignment = Ghazipur
    const createdUser = mockStore.getUserById('FP-DA-UP-GHA-001');
    expect(createdUser).toBeDefined();
    expect(createdUser?.role).toBe('DISTRICT_ADMIN');
    expect(createdUser?.accountStatus).toBe('ACTIVE');
    expect(createdUser?.authorizedDistrict).toBe('Ghazipur');
    expect(createdUser?.authorizedState).toBe('Uttar Pradesh');

    // Verify credentials map stored
    const cred = authService.getUserCredential('FP-DA-UP-GHA-001');
    expect(cred).toBeDefined();
    expect(cred?.password).toBe('FocusPoint@Ghazipur2026');
    expect(cred?.isTemporaryPassword).toBe(true);
  });

  // Test 2 — Login with User ID
  it('Test 2 — Login: District Admin signs in with permanent User ID and password successfully', async () => {
    // Appoint admin
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    // Test case-insensitive User ID login
    const loginResult = await authService.login('fp-da-up-gha-001', 'FocusPoint@Ghazipur2026');
    expect(loginResult.success).toBe(true);
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user?.role).toBe('DISTRICT_ADMIN');
    expect(loginResult.user?.authorizedDistrict).toBe('Ghazipur');
    expect(loginResult.requiresPasswordChange).toBe(true);
  });

  // Test 3 — Email login
  it('Test 3 — Email login: District Admin signs in with registered email and password successfully', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const loginResult = await authService.login('MANOJ.GHAZIPUR@FOCUSPOINT.INTERNAL', 'FocusPoint@Ghazipur2026');
    expect(loginResult.success).toBe(true);
    expect(loginResult.user?.id).toBe('FP-DA-UP-GHA-001');
    expect(loginResult.user?.email).toBe('manoj.ghazipur@focuspoint.internal');
  });

  // Test 4 — Mobile login
  it('Test 4 — Mobile login: District Admin signs in with registered mobile (+91 format and raw digits)', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    // Raw 10 digits
    const rawRes = await authService.login('9876543214', 'FocusPoint@Ghazipur2026');
    expect(rawRes.success).toBe(true);

    // +91 format with spacing
    const formattedRes = await authService.login('+91 98765 43214', 'FocusPoint@Ghazipur2026');
    expect(formattedRes.success).toBe(true);
  });

  // Test 5 — Wrong password
  it('Test 5 — Wrong password: login fails with exact verification failure message', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const res = await authService.login('FP-DA-UP-GHA-001', 'IncorrectPass123!');
    expect(res.success).toBe(false);
    expect(res.errorType).toBe('WRONG_CREDENTIALS');
    expect(res.error).toBe('The login credentials could not be verified. Please check your User ID, email/mobile and password.');
  });

  // Test 6 — Suspended account
  it('Test 6 — Suspended account: login fails with exact Account Suspended error message', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    // Super Admin suspends the admin
    await superAdminService.updateDistrictAdminStatus('FP-DA-UP-GHA-001', 'SUSPENDED');

    const res = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(res.success).toBe(false);
    expect(res.errorType).toBe('ACCOUNT_SUSPENDED');
    expect(res.error).toBe('Your District Admin account is currently suspended. Please contact the Super Admin.');
  });

  // Test 7 — No district assignment
  it('Test 7 — No district assignment: user with no assigned district is rejected with exact message', async () => {
    // Create a user without district assignment
    const unassignedUser: User = {
      id: 'da-unassigned-99',
      userId: 'FP-DA-UNASSIGNED-99',
      name: 'Unassigned Officer',
      email: 'unassigned@focuspoint.internal',
      mobile: '9111222333',
      role: 'DISTRICT_ADMIN',
      accountStatus: 'ACTIVE',
      isActive: true,
    };
    mockStore.addUser(unassignedUser);
    authService.storeUserCredential('FP-DA-UNASSIGNED-99', 'unassigned@focuspoint.internal', '9111222333', 'ValidPass@2026', 'DISTRICT_ADMIN');

    const res = await authService.login('FP-DA-UNASSIGNED-99', 'ValidPass@2026');
    expect(res.success).toBe(false);
    expect(res.errorType).toBe('MISSING_ASSIGNMENT');
    expect(res.error).toBe('Your account is active, but no district has been assigned to you. Please contact the Super Admin.');
  });

  // Test 8 — Correct district data access
  it('Test 8 — Correct district: Ghazipur District Admin can access Ghazipur data', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const loginRes = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(loginRes.success).toBe(true);

    // Access Ghazipur stats and teachers
    const stats = await districtAdminService.getDistrictStats('Ghazipur');
    expect(stats).toBeDefined();

    const teachers = await districtAdminService.getTeachers('Ghazipur');
    expect(Array.isArray(teachers)).toBe(true);
  });

  // Test 9 — Wrong district data access
  it('Test 9 — Wrong district: Ghazipur District Admin attempting Varanasi data is denied with 403 FORBIDDEN', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const loginRes = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(loginRes.success).toBe(true);

    // Attempt to access Varanasi data
    await expect(districtAdminService.getDistrictStats('Varanasi')).rejects.toThrow(
      /403 FORBIDDEN: Access Denied/
    );

    await expect(districtAdminService.getTeachers('Varanasi')).rejects.toThrow(
      /403 FORBIDDEN: Access Denied/
    );
  });

  // Test 10 — URL manipulation
  it('Test 10 — URL manipulation: changing requested district parameter fails backend verification', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const loginRes = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(loginRes.success).toBe(true);

    // Manipulate requested district to 'Lucknow'
    await expect(districtAdminService.getLibraries('Lucknow')).rejects.toThrow(/403 FORBIDDEN/);
    await expect(districtAdminService.getStudents('Prayagraj')).rejects.toThrow(/403 FORBIDDEN/);
  });

  // Test 11 — Reassignment
  it('Test 11 — Reassignment: Super Admin reassigns Ghazipur to Varanasi, updating authorization context immediately', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const loginRes = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(loginRes.success).toBe(true);

    // Initially Ghazipur allowed, Varanasi denied
    expect(await districtAdminService.getDistrictStats('Ghazipur')).toBeDefined();
    await expect(districtAdminService.getDistrictStats('Varanasi')).rejects.toThrow(/403 FORBIDDEN/);

    // Super Admin reassigns admin from Ghazipur to Varanasi (newStateName: Uttar Pradesh, newDistrictName: Varanasi)
    await superAdminService.reassignDistrictAdmin('FP-DA-UP-GHA-001', 'Uttar Pradesh', 'Varanasi', 'Official Territorial Restructuring');

    // After reassignment, Varanasi is ALLOWED and Ghazipur is DENIED
    expect(await districtAdminService.getDistrictStats('Varanasi')).toBeDefined();
    await expect(districtAdminService.getDistrictStats('Ghazipur')).rejects.toThrow(/403 FORBIDDEN/);
  });

  // Test 12 — Suspension
  it('Test 12 — Suspension: Super Admin suspends District Admin; session is immediately revoked and new login rejected', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    const loginRes = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(loginRes.success).toBe(true);

    const currentUser = await authService.getCurrentUser();
    expect(currentUser?.authorizedDistrict).toBe('Ghazipur');

    // Super Admin suspends the District Admin
    await superAdminService.updateDistrictAdminStatus('FP-DA-UP-GHA-001', 'SUSPENDED');

    // Existing session must be revoked immediately
    const sessionUser = await authService.getCurrentUser();
    expect(sessionUser).toBeNull();

    // New login must be rejected with Account Suspended message
    const newLogin = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(newLogin.success).toBe(false);
    expect(newLogin.errorType).toBe('ACCOUNT_SUSPENDED');
    expect(newLogin.error).toContain('account is currently suspended');
  });

  // Additional Test — Forced First-Login Password Rotation
  it('Forced Password Change: temporary password prompts first-login rotation and requires new password on subsequent logins', async () => {
    await superAdminService.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      adminName: 'Manoj Kumar Rai',
      adminEmail: 'manoj.ghazipur@focuspoint.internal',
      adminPhone: '9876543214',
      userId: 'FP-DA-UP-GHA-001',
      temporaryPassword: 'FocusPoint@Ghazipur2026',
      replaceExisting: true,
    });

    // 1. Login with temporary password returns requiresPasswordChange: true
    const firstLogin = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(firstLogin.success).toBe(true);
    expect(firstLogin.requiresPasswordChange).toBe(true);

    // 2. Perform rotation
    const rotateRes = await authService.changeDistrictAdminPassword('FP-DA-UP-GHA-001', 'MyNewSecurePass@2026!');
    expect(rotateRes.success).toBe(true);

    // 3. Old temporary password fails
    const oldLogin = await authService.login('FP-DA-UP-GHA-001', 'FocusPoint@Ghazipur2026');
    expect(oldLogin.success).toBe(false);

    // 4. New password succeeds with requiresPasswordChange: false
    const newLogin = await authService.login('FP-DA-UP-GHA-001', 'MyNewSecurePass@2026!');
    expect(newLogin.success).toBe(true);
    expect(newLogin.requiresPasswordChange).toBe(false);
  });

  // Additional Test — Super Admin Pan-India Access Override
  it('Super Admin Override: Super Admin can query and manage any district without 403 restrictions', async () => {
    // Set active user as SUPER_ADMIN
    const superAdminUser: User = {
      id: 'usr-super-admin-01',
      name: 'Mukesh Sonkar',
      email: 'superadmin@focuspoint.com',
      role: 'SUPER_ADMIN',
      accountStatus: 'ACTIVE',
      isActive: true,
    };
    mockStore.addUser(superAdminUser);
    safeStorage.setItem('fp_current_session_user', JSON.stringify(superAdminUser));
    safeStorage.setItem('fp_user', JSON.stringify(superAdminUser));
    safeStorage.setItem('fp_token', 'fp_session_superadmin');

    // Can access Ghazipur
    const ghazipurStats = await districtAdminService.getDistrictStats('Ghazipur');
    expect(ghazipurStats).toBeDefined();

    // Can access Varanasi
    const varanasiStats = await districtAdminService.getDistrictStats('Varanasi');
    expect(varanasiStats).toBeDefined();

    // Can access Lucknow
    const lucknowTeachers = await districtAdminService.getTeachers('Lucknow');
    expect(Array.isArray(lucknowTeachers)).toBe(true);
  });
});
