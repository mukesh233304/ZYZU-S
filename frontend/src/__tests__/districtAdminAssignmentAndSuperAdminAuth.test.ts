import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService } from '../services/superAdminService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — District Admin Assignment & Super Admin Authentication System', () => {
  beforeEach(() => {
    // Clean storage keys for isolated testing
    safeStorage.removeItem('fp_auth_credentials');
    safeStorage.removeItem('fp_district_admin_records');
    safeStorage.removeItem('fp_mock_store_v1');
    safeStorage.removeItem('fp_current_user');
    (mockStore as any).loadFromStorage();
  });

  describe('1. Super Admin Authentication & Authorized Setup Flow', () => {
    it('rejects Super Admin registration with an invalid master security key', async () => {
      const res = await authService.registerSuperAdmin({
        bootstrapKey: 'InvalidKey123',
        name: 'Master Admin',
        email: 'admin.test@focuspoint.internal',
        mobile: '9876543210',
        password: 'Password@2026',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid Super Admin Master Security Key');
    });

    it('successfully authorizes Super Admin registration with valid bootstrap key and enables login', async () => {
      const res = await authService.registerSuperAdmin({
        bootstrapKey: 'FocusPoint@SuperAdmin2026!',
        name: 'Chief Directorate Officer',
        email: 'chief.director@focuspoint.internal',
        mobile: '9415000099',
        whatsappNumber: '9415000099',
        password: 'ChiefExecutive@2026!',
      });

      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('SUPER_ADMIN');
      expect(res.user?.email).toBe('chief.director@focuspoint.internal');

      // Test direct sign-in with newly registered Super Admin credentials
      const loginRes = await authService.login('chief.director@focuspoint.internal', 'ChiefExecutive@2026!');
      expect(loginRes.success).toBe(true);

      const currentUser = await authService.getCurrentUser();
      expect(currentUser?.role).toBe('SUPER_ADMIN');
      expect(currentUser?.name).toBe('Chief Directorate Officer');

      // Also supports mobile number login
      const mobileLogin = await authService.login('9415000099', 'ChiefExecutive@2026!');
      expect(mobileLogin.success).toBe(true);
    });
  });

  describe('2. District Admin Appointment Flow & Usable Account Generation', () => {
    it('appoints District Admin, automatically creates active auth account and records credentials', async () => {
      const appointParams = {
        stateName: 'Uttar Pradesh',
        districtName: 'Ballia',
        adminName: 'Shri Vikramaditya Singh',
        adminEmail: 'vikram.ballia@focuspoint.internal',
        adminPhone: '9838001122',
        whatsappNumber: '9838001122',
        userId: 'da-ballia-01',
        temporaryPassword: 'BalliaSecurePass@2026',
      };

      const result = await superAdminService.appointDistrictAdminWithCredentials(appointParams);
      expect(result.success).toBe(true);
      expect(result.credentials.userId).toBe('da-ballia-01');
      expect(result.credentials.temporaryPassword).toBe('BalliaSecurePass@2026');

      // 1. Verify User exists in mockStore with DISTRICT_ADMIN role and Ballia jurisdiction
      const createdUser = mockStore.getUserById('da-ballia-01');
      expect(createdUser).toBeDefined();
      expect(createdUser?.name).toBe('Shri Vikramaditya Singh');
      expect(createdUser?.role).toBe('DISTRICT_ADMIN');
      expect(createdUser?.authorizedDistrict).toBe('Ballia');
      expect(createdUser?.authorizedState).toBe('Uttar Pradesh');
      expect(createdUser?.accountStatus).toBe('ACTIVE');

      // 2. Verify stored credential
      const cred = authService.getUserCredential('da-ballia-01');
      expect(cred).toBeDefined();
      expect(cred?.password).toBe('BalliaSecurePass@2026');
      expect(cred?.role).toBe('DISTRICT_ADMIN');
    });

    it('generates WhatsApp notification containing User ID and Temporary Password', async () => {
      const sendSpy = async (payload: any) => {
        return notificationService.sendWhatsAppRegistrationConfirmation(payload);
      };

      const notification = await sendSpy({
        role: 'DISTRICT_ADMIN',
        name: 'Smt. Ananya Mishra',
        userId: 'da-mau-01',
        mobile: '9450001234',
        whatsappNumber: '9450001234',
        details: {
          district: 'Mau',
          state: 'Uttar Pradesh',
          temporaryPassword: 'MauAdminPass@2026'
        }
      });

      expect(notification.status).toBe('DELIVERED');
      expect(notification.recipientPhone).toBe('9450001234');
      // Simulated WhatsApp link contains user ID and password
      expect(notification.whatsappUrl).toBeDefined();
      expect(notification.whatsappUrl).toContain('da-mau-01');
      expect(notification.whatsappUrl).toContain('MauAdminPass%402026');
    });
  });

  describe('3. Direct District Admin Sign-In & District Authorization', () => {
    it('allows newly appointed District Admin to sign in immediately using User ID and password', async () => {
      // Setup district admin for Ghazipur
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        adminName: 'Manoj Kumar Rai',
        adminEmail: 'manoj.rai@focuspoint.internal',
        adminPhone: '9415201122',
        whatsappNumber: '9415201122',
        userId: 'da-ghazipur-direct',
        temporaryPassword: 'Ghazipur@Pass2026',
        replaceExisting: true,
      });

      // Direct Login using User ID
      const loginWithUserId = await authService.login('da-ghazipur-direct', 'Ghazipur@Pass2026');
      expect(loginWithUserId.success).toBe(true);

      const loggedUser = await authService.getCurrentUser();
      expect(loggedUser).toBeDefined();
      expect(loggedUser?.role).toBe('DISTRICT_ADMIN');
      expect(loggedUser?.authorizedDistrict).toBe('Ghazipur');
      expect(loggedUser?.authorizedState).toBe('Uttar Pradesh');

      // Direct Login using registered mobile
      const loginWithMobile = await authService.login('9415201122', 'Ghazipur@Pass2026');
      expect(loginWithMobile.success).toBe(true);

      // Direct Login using email
      const loginWithEmail = await authService.login('manoj.rai@focuspoint.internal', 'Ghazipur@Pass2026');
      expect(loginWithEmail.success).toBe(true);
    });

    it('rejects login when password is incorrect without creating broken sessions', async () => {
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        adminName: 'Varanasi Officer',
        adminEmail: 'vns.admin@focuspoint.internal',
        adminPhone: '9415003344',
        userId: 'da-vns-test',
        temporaryPassword: 'CorrectPassword@123',
      });

      const badLogin = await authService.login('da-vns-test', 'WrongPassword@999');
      expect(badLogin.success).toBe(false);
      expect(badLogin.error).toMatch(/verified|incorrect/);
    });
  });

  describe('4. Account Status & Suspension Enforcement', () => {
    it('blocks login and returns prompt-compliant error when account is suspended', async () => {
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Prayagraj',
        adminName: 'Sunil Verma',
        adminEmail: 'sunil.prayagraj@focuspoint.internal',
        adminPhone: '9415007788',
        userId: 'da-prayagraj-01',
        temporaryPassword: 'PrayagrajPass@2026',
      });

      // Super Admin suspends the District Admin
      await superAdminService.updateDistrictAdminStatus(
        'da-prayagraj-01',
        'SUSPENDED',
        'Pending regulatory compliance review'
      );

      // Attempt to login should return specific prompt error message
      const suspendedLogin = await authService.login('da-prayagraj-01', 'PrayagrajPass@2026');
      expect(suspendedLogin.success).toBe(false);
      expect(suspendedLogin.error).toBe('Your District Admin account is currently suspended. Please contact the Super Admin.');

      // Super Admin reactivates account
      await superAdminService.updateDistrictAdminStatus(
        'da-prayagraj-01',
        'ACTIVE',
        'Compliance review completed and approved'
      );

      // Now login succeeds again
      const restoredLogin = await authService.login('da-prayagraj-01', 'PrayagrajPass@2026');
      expect(restoredLogin.success).toBe(true);
    });

    it('blocks login when account is deactivated', async () => {
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Gorakhpur',
        adminName: 'Gorakhpur Admin',
        adminEmail: 'gkp.admin@focuspoint.internal',
        adminPhone: '9415005566',
        userId: 'da-gkp-deact',
        temporaryPassword: 'GkpPassword@2026',
      });

      await superAdminService.updateDistrictAdminStatus(
        'da-gkp-deact',
        'DEACTIVATED',
        'Official retirement'
      );

      const deactLogin = await authService.login('da-gkp-deact', 'GkpPassword@2026');
      expect(deactLogin.success).toBe(false);
      expect(deactLogin.error).toMatch(/deactivated|inactive/);
    });
  });

  describe('5. One Active District Admin Rule & Reassignment', () => {
    it('detects existing active administrator for an occupied district', async () => {
      // First appointment
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Mirzapur',
        adminName: 'Officer Alpha',
        adminEmail: 'alpha.mirzapur@focuspoint.internal',
        adminPhone: '9415009988',
        userId: 'da-mirzapur-alpha',
        temporaryPassword: 'AlphaPass@2026',
      });

      // Check assignment
      const check = await superAdminService.checkDistrictAdminAssignment('Mirzapur', 'Uttar Pradesh');
      expect(check.hasActiveAdmin).toBe(true);
      expect(check.existingAdmin?.userId).toBe('da-mirzapur-alpha');
      expect(check.existingAdmin?.name).toBe('Officer Alpha');
    });

    it('replaces existing administrator when explicitly authorized with replaceExisting flag', async () => {
      // 1. Initial appointment of Alpha
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Mirzapur',
        adminName: 'Officer Alpha',
        adminEmail: 'alpha.mirzapur@focuspoint.internal',
        adminPhone: '9415009988',
        userId: 'da-mirzapur-alpha',
        temporaryPassword: 'AlphaPass@2026',
      });

      // 2. Second appointment of Beta with replaceExisting: true
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Mirzapur',
        adminName: 'Officer Beta',
        adminEmail: 'beta.mirzapur@focuspoint.internal',
        adminPhone: '9415009999',
        userId: 'da-mirzapur-beta',
        temporaryPassword: 'BetaPass@2026',
        replaceExisting: true,
      });

      const checkAfter = await superAdminService.checkDistrictAdminAssignment('Mirzapur', 'Uttar Pradesh');
      expect(checkAfter.hasActiveAdmin).toBe(true);
      expect(checkAfter.existingAdmin?.userId).toBe('da-mirzapur-beta');
      expect(checkAfter.existingAdmin?.name).toBe('Officer Beta');

      // Previous admin Alpha is now inactive
      const admins = await superAdminService.getDistrictAdmins();
      const alpha = admins.find(a => a.userId === 'da-mirzapur-alpha');
      expect(alpha?.status).toBe('INACTIVE');
    });

    it('reassigns District Admin to a new territory with full audit and authorization update', async () => {
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Chandauli',
        adminName: 'Officer Raman',
        adminEmail: 'raman.cnd@focuspoint.internal',
        adminPhone: '9415004411',
        userId: 'da-raman-01',
        temporaryPassword: 'RamanPass@2026',
      });

      // Reassign from Chandauli to Varanasi
      const reassignResult = await superAdminService.reassignDistrictAdmin(
        'da-raman-01',
        'Uttar Pradesh',
        'Varanasi',
        'Promoted to Divisional Hub Coordinator'
      );

      expect(reassignResult.success).toBe(true);
      expect(reassignResult.admin?.districtName).toBe('Varanasi');
      expect(reassignResult.admin?.reassignmentHistory).toBeDefined();
      expect(reassignResult.admin?.reassignmentHistory?.length).toBe(1);
      expect(reassignResult.admin?.reassignmentHistory?.[0].previousDistrict).toBe('Chandauli');

      // Next login immediately gives Varanasi territorial context
      const loginRes = await authService.login('da-raman-01', 'RamanPass@2026');
      expect(loginRes.success).toBe(true);
      const currentUser = await authService.getCurrentUser();
      expect(currentUser?.authorizedDistrict).toBe('Varanasi');
      expect(currentUser?.district).toBe('Varanasi');
    });

    it('resets District Admin password and updates authentication directory', async () => {
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: 'Uttar Pradesh',
        districtName: 'Jaunpur',
        adminName: 'Officer Jaunpur',
        adminEmail: 'jaunpur@focuspoint.internal',
        adminPhone: '9415002233',
        userId: 'da-jaunpur-01',
        temporaryPassword: 'InitialPass@2026',
      });

      const resetRes = await superAdminService.resetDistrictAdminCredentials(
        'da-jaunpur-01',
        'NewResetPass@2026'
      );

      expect(resetRes.success).toBe(true);
      expect(resetRes.temporaryPassword).toBe('NewResetPass@2026');

      // Old password should fail
      const oldLogin = await authService.login('da-jaunpur-01', 'InitialPass@2026');
      expect(oldLogin.success).toBe(false);

      // New password succeeds
      const newLogin = await authService.login('da-jaunpur-01', 'NewResetPass@2026');
      expect(newLogin.success).toBe(true);
    });
  });

  describe('6. Regression & Cross-Role Access Integrity', () => {
    it('preserves existing Student and Teacher login functionality without regression', async () => {
      // Student login
      const studentLogin = await authService.login('student.aryan@focuspoint.internal', 'password123');
      expect(studentLogin.success).toBe(true);
      const studentUser = await authService.getCurrentUser();
      expect(studentUser?.role).toBe('STUDENT');

      // Teacher login
      const teacherLogin = await authService.login('teacher.rajesh@focuspoint.internal', 'password123');
      expect(teacherLogin.success).toBe(true);
      const teacherUser = await authService.getCurrentUser();
      expect(teacherUser?.role).toBe('TEACHER');

      // Library Owner login
      const libraryOwnerLogin = await authService.login('owner.suresh@focuspoint.internal', 'password123');
      expect(libraryOwnerLogin.success).toBe(true);
      const ownerUser = await authService.getCurrentUser();
      expect(ownerUser?.role).toBe('LIBRARY_OWNER');
    });
  });
});
