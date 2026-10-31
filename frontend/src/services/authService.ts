// FOCUSPOINT Authentication Service Abstraction Layer
// Prepared for future InsForge BaaS integration

import { User, UserRole } from '../types';
import { mockStore } from '../mock/store';
import { compressImage } from '../utils/imageUtils';
import { safeStorage } from '../utils/storageUtils';
import { notificationService } from './notificationService';
import { districtAuthorizationService } from './districtAuthorizationService';

const CURRENT_USER_KEY = 'fp_current_session_user';
const CREDENTIALS_STORAGE_KEY = 'fp_auth_credentials';

export interface AuthCredentialRecord {
  userId: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  isTemporaryPassword?: boolean;
  firstLoginCompleted?: boolean;
  createdAt: string;
  lastRotatedAt?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  errorType?: 'WRONG_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_INACTIVE' | 'MISSING_ASSIGNMENT' | 'UNAUTHORIZED_ROLE';
  requiresPasswordChange?: boolean;
}

function getStoredCredentialsMap(): Record<string, AuthCredentialRecord> {
  let map: Record<string, AuthCredentialRecord> = {};
  try {
    const raw = safeStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (raw) map = JSON.parse(raw);
  } catch {
    map = {};
  }

  // Seed default district admin credentials if not yet initialized
  if (!map['usr-admin-ghazipur'] && !map['da-ghazipur-01'] && !map['fp-da-up-gha-001']) {
    const defaultGhazipurCred: AuthCredentialRecord = {
      userId: 'usr-admin-ghazipur',
      email: 'admin.ghazipur@focuspoint.internal',
      mobile: '9876543214',
      password: 'FocusPoint@Ghazipur2026',
      role: 'DISTRICT_ADMIN',
      isTemporaryPassword: false,
      firstLoginCompleted: true,
      createdAt: '2026-07-01T00:00:00Z'
    };
    map['usr-admin-ghazipur'] = defaultGhazipurCred;
    map['da-ghazipur-01'] = defaultGhazipurCred;
    map['fp-da-up-gha-001'] = defaultGhazipurCred;
    map['fp-da-ghaz-001'] = defaultGhazipurCred;
    map['da-01'] = defaultGhazipurCred;
    map['usr-admin-gzp'] = defaultGhazipurCred;
    map['admin.ghazipur@focuspoint.internal'] = defaultGhazipurCred;
    map['virendra.singh@focuspoint.internal'] = defaultGhazipurCred;
    map['9876543214'] = defaultGhazipurCred;
    map['9415248102'] = defaultGhazipurCred;
  }

  return map;
}

function saveStoredCredentialsMap(map: Record<string, AuthCredentialRecord>) {
  safeStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(map));
}

export const authService = {
  // Store user credential for immediate login without database intervention
  storeUserCredential(
    userId: string, 
    email: string, 
    mobile: string, 
    password: string, 
    role: string = 'DISTRICT_ADMIN',
    isTemporary: boolean = false
  ) {
    const map = getStoredCredentialsMap();
    const cleanMobileDigits = (mobile || '').replace(/\D/g, '');
    const last10 = cleanMobileDigits.length >= 10 ? cleanMobileDigits.slice(-10) : '';

    const record: AuthCredentialRecord = {
      userId: (userId || '').trim(),
      email: (email || '').toLowerCase().trim(),
      mobile: (mobile || '').trim(),
      password: (password || '').trim(),
      role,
      isTemporaryPassword: isTemporary,
      firstLoginCompleted: !isTemporary,
      createdAt: new Date().toISOString()
    };

    if (userId && userId.trim()) map[userId.toLowerCase().trim()] = record;
    if (email && email.trim()) map[email.toLowerCase().trim()] = record;
    if (mobile && mobile.trim()) map[mobile.trim()] = record;
    if (cleanMobileDigits.length >= 7) map[cleanMobileDigits] = record;
    if (last10.length >= 10) map[last10] = record;

    saveStoredCredentialsMap(map);
  },

  // Update password and complete first-login rotation
  async changeDistrictAdminPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const map = getStoredCredentialsMap();
    const cleanId = (userId || '').toLowerCase().trim();
    const target = this.getUserCredential(cleanId);
    
    if (!target) {
      return { success: false, error: 'User credential record not found.' };
    }

    target.password = newPassword.trim();
    target.isTemporaryPassword = false;
    target.firstLoginCompleted = true;
    target.lastRotatedAt = new Date().toISOString();

    // Re-index
    if (target.userId) map[target.userId.toLowerCase().trim()] = target;
    if (target.email) map[target.email.toLowerCase().trim()] = target;
    if (target.mobile) {
      map[target.mobile.trim()] = target;
      const digits = target.mobile.replace(/\D/g, '');
      if (digits) map[digits] = target;
      if (digits.length >= 10) map[digits.slice(-10)] = target;
    }
    saveStoredCredentialsMap(map);

    // Also update in appointed District Admin records storage if present
    try {
      const storedAdmins = safeStorage.getItem('fp_district_admin_records');
      if (storedAdmins) {
        const admins: any[] = JSON.parse(storedAdmins);
        const match = admins.find(a => (a.userId && a.userId.toLowerCase() === cleanId) || (a.id && a.id.toLowerCase() === cleanId));
        if (match) {
          match.temporaryPassword = newPassword.trim();
          safeStorage.setItem('fp_district_admin_records', JSON.stringify(admins));
        }
      }
    } catch {}

    mockStore.logAudit({
      id: `aud-${Date.now()}`,
      action: 'UPDATE_DISTRICT_ADMIN_PASSWORD',
      details: `Password changed and initial credential rotation completed for ${target.userId || target.email}`,
      timestamp: new Date().toISOString(),
      adminRole: 'DISTRICT_ADMIN'
    });

    return { success: true };
  },

  getUserCredential(identifier: string): AuthCredentialRecord | undefined {
    if (!identifier || !identifier.trim()) return undefined;
    const clean = identifier.toLowerCase().trim();
    const digits = identifier.replace(/\D/g, '');
    const last10 = digits.length >= 10 ? digits.slice(-10) : '';
    const map = getStoredCredentialsMap();

    // 1. Direct key match (userId or email or exact mobile)
    if (map[clean]) return map[clean];
    if (map[identifier.trim()]) return map[identifier.trim()];

    // 2. Digits match for mobile
    if (digits.length >= 7 && map[digits]) return map[digits];
    if (last10.length >= 10 && map[last10]) return map[last10];

    // 3. Scan values
    const values = Object.values(map);
    const found = values.find(rec =>
      (rec.userId && rec.userId.toLowerCase().trim() === clean) ||
      (rec.email && rec.email.toLowerCase().trim() === clean) ||
      (last10.length >= 10 && rec.mobile && rec.mobile.replace(/\D/g, '').endsWith(last10))
    );
    if (found) return found;

    return undefined;
  },

  // Validate active session
  validateSession(): boolean {
    const raw = safeStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return false;
    try {
      const u: User = JSON.parse(raw);
      if (u.role === 'DISTRICT_ADMIN' || (u as any).role === 'district_admin') {
        const freshUser = mockStore.getUserById(u.id);
        if (freshUser && (freshUser.accountStatus === 'SUSPENDED' || freshUser.accountStatus === 'DEACTIVATED' || freshUser.isActive === false)) {
          safeStorage.removeItem(CURRENT_USER_KEY);
          safeStorage.removeItem('fp_user');
          safeStorage.removeItem('fp_token');
          return false;
        }
        const storedAdmins = safeStorage.getItem('fp_district_admin_records');
        if (storedAdmins) {
          const admins: any[] = JSON.parse(storedAdmins);
          const currentAdmin = admins.find(a => a.userId === u.id || a.id === u.id);
          if (currentAdmin && (currentAdmin.status === 'SUSPENDED' || currentAdmin.status === 'DEACTIVATED' || currentAdmin.status === 'INACTIVE')) {
            safeStorage.removeItem(CURRENT_USER_KEY);
            safeStorage.removeItem('fp_user');
            safeStorage.removeItem('fp_token');
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  // Get active session user
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.validateSession()) {
        return null;
      }
      const stored = safeStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const user: User = JSON.parse(stored);
        const refreshed = mockStore.getUserById(user.id);
        const active: User = refreshed ? { ...refreshed, ...user } : user;

        const cachedAvatar = safeStorage.getItem(`fp_user_avatar_${active.id}`) || 
          (active.email ? safeStorage.getItem(`fp_user_avatar_${active.email.toLowerCase()}`) : null) ||
          ((active.role === 'LIBRARY_OWNER' || (active as any).role === 'library_owner') ? safeStorage.getItem('fp_owner_avatar') : null) ||
          ((active.role === 'SUPER_ADMIN' || (active as any).role === 'super_admin') ? safeStorage.getItem('fp_super_admin_avatar') : null);
        if (cachedAvatar && (!active.avatarUrl || active.avatarUrl.trim().length === 0)) {
          active.avatarUrl = cachedAvatar;
          active.avatar = cachedAvatar;
        }

        return active;
      }
    } catch (e) {
      console.warn('Failed to parse current user from storage');
    }
    const defaultUser = mockStore.getUserById('usr-student-aryan') || mockStore.getUsers()[0];
    if (defaultUser) {
      safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return null;
  },

  // Login with Email/Mobile/User ID + Password
  async login(identifier: string, password?: string): Promise<LoginResult> {
    await new Promise(r => setTimeout(r, 200)); // Network latency simulation
    const cleanId = (identifier || '').trim().toLowerCase();
    const rawId = (identifier || '').trim();
    const digits = rawId.replace(/\D/g, '');
    const last10 = digits.slice(-10);

    // 1. Search in master mockStore users
    let user = mockStore.getUsers().find(u => {
      const uDigits = (u.mobile || u.phone || '').replace(/\D/g, '');
      return (
        (u.email && u.email.toLowerCase() === cleanId) || 
        (u.mobile && u.mobile === rawId) ||
        (u.phone && u.phone === rawId) ||
        (u.id && u.id.toLowerCase() === cleanId) ||
        ((u as any).userId && (u as any).userId.toLowerCase() === cleanId) ||
        ((u as any).adminId && (u as any).adminId.toLowerCase() === cleanId) ||
        ((u as any).operatorId && (u as any).operatorId.toLowerCase() === cleanId) ||
        (last10.length >= 10 && uDigits.length >= 10 && uDigits.endsWith(last10))
      );
    });

    // 2. Search in appointed District Admin records storage if not found in mockStore
    if (!user) {
      try {
        const storedAdmins = safeStorage.getItem('fp_district_admin_records');
        if (storedAdmins) {
          const admins: any[] = JSON.parse(storedAdmins);
          const matched = admins.find(a => {
            const aDigits = (a.phone || a.whatsappNumber || '').replace(/\D/g, '');
            return (
              (a.userId && a.userId.toLowerCase() === cleanId) ||
              (a.email && a.email.toLowerCase() === cleanId) ||
              (a.phone && a.phone.replace(/\D/g, '') === digits) ||
              (last10.length >= 10 && aDigits.length >= 10 && aDigits.endsWith(last10)) ||
              (a.id && a.id.toLowerCase() === cleanId)
            );
          });

          if (matched) {
            user = {
              id: matched.userId || matched.id,
              userId: matched.userId || matched.id,
              name: matched.name,
              email: matched.email,
              mobile: matched.phone,
              phone: matched.phone,
              whatsappNumber: matched.whatsappNumber || matched.phone,
              role: 'DISTRICT_ADMIN',
              districtId: `dist-${(matched.districtName || '').toLowerCase().replace(/\s+/g, '-')}`,
              districtName: matched.districtName,
              district: matched.districtName,
              stateName: matched.stateName,
              state: matched.stateName,
              authorizedDistrict: matched.districtName,
              authorizedState: matched.stateName,
              isActive: matched.status === 'ACTIVE',
              status: matched.status === 'ACTIVE' ? 'active' : 'suspended',
              accountStatus: matched.status,
              avatarUrl: matched.avatarUrl,
              avatar: matched.avatarUrl,
            } as User;
            mockStore.addUser(user);
          }
        }
      } catch (err) {
        console.warn('District Admin lookup error in authService', err);
      }
    }

    // 3. Search in appointed operators storage if not found in mockStore
    if (!user) {
      try {
        const storedOps = safeStorage.getItem('fp_study_material_operators');
        if (storedOps) {
          const ops: any[] = JSON.parse(storedOps);
          const matchedOp = ops.find(
            op => (op.operatorId && op.operatorId.toLowerCase() === cleanId) ||
                  (op.email && op.email.toLowerCase() === cleanId) ||
                  (op.mobile && op.mobile === rawId) ||
                  (op.id && op.id.toLowerCase() === cleanId)
          );
          if (matchedOp) {
            user = {
              id: matchedOp.id,
              name: matchedOp.name,
              email: matchedOp.email,
              mobile: matchedOp.mobile,
              role: 'STUDY_MATERIAL_OPERATOR',
              operatorId: matchedOp.operatorId,
              districtId: 'dist-vns',
              districtName: matchedOp.district || 'Varanasi',
              stateName: matchedOp.state || 'Uttar Pradesh',
              isActive: matchedOp.status === 'ACTIVE',
              accountStatus: matchedOp.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
              avatarUrl: matchedOp.avatarUrl,
              avatar: matchedOp.avatarUrl,
            } as User;
            mockStore.addUser(user);
          }
        }
      } catch (err) {
        console.warn('Operator lookup error in authService', err);
      }
    }

    if (!user) {
      return { 
        success: false, 
        errorType: 'WRONG_CREDENTIALS', 
        error: 'The login credentials could not be verified. Please check your User ID, email/mobile and password.' 
      };
    }

    // Verify password against stored credentials map
    const cred = this.getUserCredential(cleanId) || 
                 this.getUserCredential(user.id) || 
                 (user.userId ? this.getUserCredential(user.userId) : undefined) ||
                 (user.email ? this.getUserCredential(user.email) : undefined) ||
                 (user.mobile ? this.getUserCredential(user.mobile) : undefined);

    if (password !== undefined) {
      if (cred && cred.password) {
        if (cred.password.trim() !== password.trim()) {
          return { 
            success: false, 
            errorType: 'WRONG_CREDENTIALS', 
            error: 'The login credentials could not be verified. Please check your User ID, email/mobile and password.' 
          };
        }
      } else if (user.role === 'DISTRICT_ADMIN' || (user as any).role === 'district_admin') {
        // Fallback for default demo district admin credentials
        if (password.trim() !== 'FocusPoint@Ghazipur2026' && password.trim() !== 'password123' && password.trim() !== 'admin123') {
          return { 
            success: false, 
            errorType: 'WRONG_CREDENTIALS', 
            error: 'The login credentials could not be verified. Please check your User ID, email/mobile and password.' 
          };
        }
      }
    }

    // Account Status Verification (Section #10, #11, #12, #17, #27)
    // 1. Check Deactivated / Inactive
    const isDeactivated = 
      user.accountStatus === 'DEACTIVATED' || 
      (user as any).status === 'deactivated' || 
      user.accountStatus === 'INACTIVE' || 
      (user as any).status === 'inactive';

    if (isDeactivated) {
      return { 
        success: false, 
        errorType: 'ACCOUNT_INACTIVE', 
        error: 'Your District Admin access has been deactivated.' 
      };
    }

    // 2. Check Suspended
    const isSuspended = 
      user.accountStatus === 'SUSPENDED' || 
      (user as any).status === 'suspended' || 
      (user as any).status === 'SUSPENDED';

    if (isSuspended) {
      return { 
        success: false, 
        errorType: 'ACCOUNT_SUSPENDED', 
        error: user.role === 'DISTRICT_ADMIN' || (user as any).role === 'district_admin'
          ? 'Your District Admin account is currently suspended. Please contact the Super Admin.'
          : 'Your account is currently suspended. Please contact the administrator.'
      };
    }

    if (user.isActive === false) {
      return { 
        success: false, 
        errorType: 'ACCOUNT_INACTIVE', 
        error: 'This account is currently inactive. Please contact the administrator.' 
      };
    }

    // District Admin Isolation & Assignment validation (Section #8, #10, #11, #12)
    if (user.role === 'DISTRICT_ADMIN' || (user as any).role === 'district_admin') {
      const assignedDist = user.authorizedDistrict || user.districtName || user.district;
      if (!assignedDist || assignedDist.trim() === '') {
        return { 
          success: false, 
          errorType: 'MISSING_ASSIGNMENT', 
          error: 'Your account is active, but no district has been assigned to you. Please contact the Super Admin.' 
        };
      }
      user.authorizedDistrict = assignedDist;
      user.authorizedState = user.authorizedState || user.stateName || user.state || 'Uttar Pradesh';
      user.districtName = assignedDist;
      user.district = assignedDist;
    }

    if (user.role === 'SUPER_ADMIN' || (user as any).role === 'super_admin') {
      const cached = safeStorage.getItem('fp_super_admin_avatar') || safeStorage.getItem(`fp_user_avatar_${user.id}`);
      if (cached) {
        user.avatarUrl = cached;
        user.avatar = cached;
      }
    }

    if (user.role === 'LIBRARY_OWNER' || (user as any).role === 'library_owner') {
      const cached = safeStorage.getItem(`fp_user_avatar_${user.id}`) || safeStorage.getItem('fp_owner_avatar');
      if (cached) {
        user.avatarUrl = cached;
        user.avatar = cached;
      }
    }

    const requiresPasswordChange = Boolean(cred?.isTemporaryPassword && !cred?.firstLoginCompleted);

    user.lastLogin = new Date().toISOString();
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    safeStorage.setItem('fp_user', JSON.stringify(user));
    safeStorage.setItem('fp_token', `fp_session_${user.id}_${Date.now()}`);

    return { 
      success: true, 
      requiresPasswordChange, 
      user 
    };
  },

  // Authorized Super Admin Setup & Bootstrap (Section #3, #4)
  async registerSuperAdmin(params: {
    name: string;
    email: string;
    mobile: string;
    whatsappNumber?: string;
    password: string;
    bootstrapKey: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(r => setTimeout(r, 400));
    
    // Master security authorization check (Section #3, #4)
    const validKeys = ['FocusPoint@SuperAdmin2026!', 'SUPERADMIN_2026', 'FocusPointAdminMasterKey#99', 'SuperAdmin@FocusPoint2026!'];
    if (!validKeys.includes(params.bootstrapKey.trim())) {
      return { success: false, error: 'Invalid Super Admin Master Security Key. Authorized credentials required for setup.' };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const existing = mockStore.getUsers().find(u => u.email.toLowerCase() === cleanEmail && (u.role === 'SUPER_ADMIN' || (u as any).role === 'super_admin'));
    
    let photo = params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    if (photo && photo.startsWith('data:image/')) {
      try {
        photo = await compressImage(photo, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
      } catch (e) {
        console.warn('Avatar compression error:', e);
      }
    }

    const superAdminUser: User = {
      id: existing ? existing.id : `usr-superadmin-${Date.now().toString().slice(-4)}`,
      name: params.name.trim(),
      email: cleanEmail,
      mobile: params.mobile.trim(),
      phone: params.mobile.trim(),
      whatsappNumber: (params.whatsappNumber || params.mobile).trim(),
      role: 'SUPER_ADMIN',
      accountStatus: 'ACTIVE',
      isActive: true,
      avatarUrl: photo,
      avatar: photo,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    if (existing) {
      mockStore.updateUser(existing.id, superAdminUser);
    } else {
      mockStore.addUser(superAdminUser);
    }

    safeStorage.setItem('fp_super_admin_avatar', photo);
    safeStorage.setItem(`fp_user_avatar_${superAdminUser.id}`, photo);
    safeStorage.setItem(`fp_user_avatar_${cleanEmail}`, photo);

    this.storeUserCredential(superAdminUser.id, cleanEmail, params.mobile, params.password, 'SUPER_ADMIN');

    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(superAdminUser));
    safeStorage.setItem('fp_user', JSON.stringify(superAdminUser));

    mockStore.logAudit({
      id: `aud-${Date.now()}`,
      action: 'SUPER_ADMIN_BOOTSTRAP_SETUP',
      details: `Super Admin account initialized and activated for ${params.name} (${cleanEmail})`,
      timestamp: new Date().toISOString(),
      adminRole: 'SUPER_ADMIN'
    });

    notificationService.sendWhatsAppRegistrationConfirmation({
      role: 'SUPER_ADMIN',
      name: params.name,
      userId: superAdminUser.id,
      mobile: params.mobile,
      whatsappNumber: params.whatsappNumber || params.mobile,
      details: {
        adminId: superAdminUser.id,
        email: cleanEmail,
      }
    }).catch(err => console.warn('Super Admin WhatsApp confirmation notice:', err));

    return { success: true, user: superAdminUser };
  },

  // Switch role for developer / reviewer preview
  async switchRole(role: UserRole, userId?: string): Promise<User | null> {
    const rawRole = String(role || '').toUpperCase();
    const isStudentRole = rawRole === 'STUDENT' || rawRole === 'LIBRARY_STUDENT' || rawRole === 'STUDENT_LIBRARY';
    
    // 1. Look up by explicit userId if provided
    let target: User | undefined;
    if (userId) {
      target = mockStore.getUserById(userId);
    }

    // 2. Look up by specific student ID if it is a student role
    if (!target && isStudentRole) {
      target = mockStore.getUserById('usr-student-aryan') || 
               mockStore.getUsers().find(u => (u.role || '').toUpperCase() === 'STUDENT');
    }

    // 3. Fallback: case-insensitive role match across mockStore
    if (!target) {
      target = mockStore.getUsers().find(u => (u.role || '').toUpperCase() === rawRole);
    }

    // 4. Guaranteed fallbacks for each standard role
    if (!target) {
      if (isStudentRole) {
        target = mockStore.getUserById('usr-student-aryan');
      } else if (rawRole === 'TEACHER') {
        target = mockStore.getUserById('usr-teacher-rajesh');
      } else if (rawRole === 'LIBRARY_OWNER') {
        target = mockStore.getUserById('usr-lib-suresh');
      } else if (rawRole === 'DISTRICT_ADMIN') {
        target = mockStore.getUserById('usr-admin-ghazipur');
      } else if (rawRole === 'SUPER_ADMIN') {
        target = mockStore.getUserById('usr-super-admin');
      } else if (rawRole === 'STUDY_MATERIAL_OPERATOR' || rawRole === 'OPERATOR') {
        target = mockStore.getUserById('usr-operator-sunita');
      }
    }

    if (target) {
      const resolvedRole = (isStudentRole && rawRole === 'LIBRARY_STUDENT' ? 'LIBRARY_STUDENT' : (target.role || rawRole)) as UserRole;
      const activeTarget: User = {
        ...target,
        role: resolvedRole,
        isActive: true,
      };

      if (activeTarget.role === 'LIBRARY_OWNER' || (activeTarget as any).role === 'library_owner') {
        const cached = safeStorage.getItem(`fp_user_avatar_${activeTarget.id}`) || safeStorage.getItem('fp_owner_avatar');
        if (cached) {
          activeTarget.avatarUrl = cached;
          activeTarget.avatar = cached;
        }
      }

      // Ensure mockStore has this updated active user
      try {
        if (!mockStore.getUserById(activeTarget.id)) {
          mockStore.addUser(activeTarget);
        } else {
          mockStore.updateUser(activeTarget.id, activeTarget);
        }
      } catch (storeErr) {
        console.warn('MockStore user update warning:', storeErr);
      }

      // Persist in session storage keys quota-safely
      try {
        safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeTarget));
        safeStorage.setItem('fp_user', JSON.stringify(activeTarget));
      } catch (storageErr) {
        console.warn('safeStorage fallback active for user session:', storageErr);
      }

      // Clear any stale tokens so mock data isn't blocked by invalid token
      safeStorage.removeItem('fp_token');

      return activeTarget;
    }
    return null;
  },

  // Register student
  async registerStudent(data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(r => setTimeout(r, 400));
    const newUser: User = {
      id: `usr-student-${Date.now()}`,
      name: data.name || 'Student',
      email: data.email || '',
      mobile: data.mobile || '',
      role: 'STUDENT',
      districtId: data.districtId || 'dist-gzp',
      districtName: data.districtName || 'Ghazipur',
      city: data.city,
      area: data.area,
      address: data.address,
      pincode: data.pincode,
      createdAt: new Date().toISOString(),
      isActive: true,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
    };

    mockStore.addUser(newUser);
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    safeStorage.setItem('fp_user', JSON.stringify(newUser));

    // Automated Registration WhatsApp Confirmation (Section #21 - #23)
    notificationService.sendWhatsAppRegistrationConfirmation({
      role: 'STUDENT',
      name: newUser.name,
      userId: newUser.id,
      mobile: newUser.mobile || '',
      whatsappNumber: (newUser as any).whatsappNumber || newUser.mobile || '',
      details: {
        studentId: newUser.id,
      }
    }).catch(err => console.warn('Non-blocking WhatsApp confirmation notice:', err));

    return { success: true, user: newUser };
  },

  // Register teacher (initial status PENDING)
  async registerTeacher(data: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(r => setTimeout(r, 500));
    const newTeacher = {
      id: `usr-teacher-${Date.now()}`,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      role: 'TEACHER' as const,
      districtId: data.districtId || 'dist-gzp',
      districtName: data.districtName || 'Ghazipur',
      city: data.city || 'Ghazipur',
      area: data.area || 'Saidpur',
      address: data.address || '',
      pincode: data.pincode || '',
      verificationStatus: 'PENDING' as const,
      highestQualification: data.highestQualification || 'Graduate',
      degree: data.degree || 'Degree',
      university: data.university || 'University',
      passingYear: Number(data.passingYear) || 2022,
      experienceYears: Number(data.experienceYears) || 2,
      subjects: data.subjects || ['Mathematics'],
      classes: data.classes || ['Class 10'],
      specializations: data.specializations || ['Foundation'],
      boards: data.boards || ['CBSE'],
      teachingMode: data.teachingMode || 'OFFLINE_HOME',
      expectedFeeMonthly: Number(data.expectedFeeMonthly) || 3000,
      feeRange: `₹${data.expectedFeeMonthly || 3000} / month`,
      availabilityDays: data.availabilityDays || ['Monday', 'Wednesday', 'Friday'],
      availabilitySlots: data.availabilitySlots || ['05:00 PM - 07:00 PM'],
      areasServed: data.areasServed || ['Saidpur'],
      bio: data.bio || '',
      rating: 0,
      reviewsCount: 0,
      totalReviews: 0,
      assignedStudentsCount: 0,
      documentsUploaded: {},
      experienceRecords: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      avatarUrl: '',
    };

    mockStore.addTeacher(newTeacher);
    mockStore.addUser(newTeacher);
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newTeacher));
    safeStorage.setItem('fp_user', JSON.stringify(newTeacher));

    // Automated Registration WhatsApp Confirmation (Section #21 - #24)
    notificationService.sendWhatsAppRegistrationConfirmation({
      role: 'TEACHER',
      name: newTeacher.name,
      userId: newTeacher.id,
      mobile: newTeacher.mobile || '',
      whatsappNumber: (newTeacher as any).whatsappNumber || newTeacher.mobile || '',
      details: {
        teacherId: newTeacher.id,
        status: 'Under Review',
      }
    }).catch(err => console.warn('Non-blocking WhatsApp confirmation notice:', err));

    return { success: true };
  },

  // Register Library Owner (initial status PENDING)
  async registerLibraryOwner(data: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(r => setTimeout(r, 400));
    const newOwner: User = {
      id: `usr-owner-${Date.now()}`,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      role: 'LIBRARY_OWNER',
      districtId: data.districtId || 'dist-gzp',
      districtName: data.districtName || 'Ghazipur',
      city: data.city,
      area: data.area,
      address: data.address,
      pincode: data.pincode,
      createdAt: new Date().toISOString(),
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    };

    mockStore.addUser(newOwner);
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newOwner));
    safeStorage.setItem('fp_user', JSON.stringify(newOwner));

    // Automated Registration WhatsApp Confirmation (Section #21 - #25)
    notificationService.sendWhatsAppRegistrationConfirmation({
      role: 'LIBRARY_OWNER',
      name: newOwner.name,
      userId: newOwner.id,
      mobile: newOwner.mobile || '',
      whatsappNumber: (newOwner as any).whatsappNumber || newOwner.mobile || '',
      details: {
        ownerId: newOwner.id,
      }
    }).catch(err => console.warn('Non-blocking WhatsApp confirmation notice:', err));

    return { success: true };
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(r => setTimeout(r, 100));

    // Automatically optimize and compress avatar image if passed as a data URL
    if (updates.avatarUrl && updates.avatarUrl.startsWith('data:image/')) {
      try {
        const compressed = await compressImage(updates.avatarUrl, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
        updates.avatarUrl = compressed;
        updates.avatar = compressed;
      } catch (e) {
        console.warn('Avatar compression failed, using original data URL:', e);
      }
    } else if (updates.avatar && updates.avatar.startsWith('data:image/')) {
      try {
        const compressed = await compressImage(updates.avatar, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
        updates.avatarUrl = compressed;
        updates.avatar = compressed;
      } catch (e) {
        console.warn('Avatar compression failed, using original data URL:', e);
      }
    }

    const updated = mockStore.updateUser(userId, updates);
    if (updated) {
      try {
        safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        safeStorage.setItem('fp_user', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not store full current user, caching essentials:', err);
      }
      return { success: true, user: updated };
    }
    return { success: false, error: 'User not found' };
  },

  // Logout
  async logout(): Promise<void> {
    districtAuthorizationService.clearDistrictSessionCache();
    safeStorage.removeItem(CURRENT_USER_KEY);
    safeStorage.removeItem('fp_user');
  }
};
