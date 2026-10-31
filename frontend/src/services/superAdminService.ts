// FOCUSPOINT Super Admin Service Abstraction Layer
// Comprehensive Pan-India Enterprise Governance Operations

import { 
  District, 
  User, 
  AuditLog, 
  Teacher, 
  Library, 
  VerificationStatus,
  SuperAdminProfileData, 
  DistrictAdminRecord, 
  DistrictAdminSalaryPaymentParams,
  CustomCommissionOverride,
  SuperAdminOfferDefinition,
  CommissionService,
  CommissionScope,
  HomeTuitionStudentRecord,
  HomeTuitionEnrollmentStatus,
  LibraryStudentRecord
} from '../types';
import { 
  UnifiedBookingRecord, 
  BookingsCockpitKPIs, 
  UnifiedBookingStatus 
} from '../types/superAdmin';
import { mockStore } from '../mock/store';
import { auditService } from './auditService';
import { authService } from './authService';
import { notificationService } from './notificationService';
import { safeStorage } from '../utils/storageUtils';
import { compressImage } from '../utils/imageUtils';
import { INITIAL_HOME_TUITION_STUDENTS } from '../mock/data/homeTuitionStudents';

export const DISTRICT_ADMINS_STORAGE_KEY = 'fp_district_admin_records';
export const HOME_TUITION_STUDENTS_STORAGE_KEY = 'fp_home_tuition_students_v2';
export const TEACHERS_STORAGE_KEY = 'fp_super_admin_pan_india_teachers';
export const LIBRARY_STUDENTS_STORAGE_KEY = 'fp_super_admin_library_students_v3';
export const BOOKINGS_STORAGE_KEY = 'fp_super_admin_bookings_master_v1';

export const superAdminService = {
  /**
   * Retrieves Super Admin Profile data
   */
  async getSuperAdminProfile(): Promise<SuperAdminProfileData> {
    await new Promise(r => setTimeout(r, 80));
    const isDeleted = localStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
    const saCached = isDeleted
      ? ''
      : (localStorage.getItem('fp_super_admin_avatar') ||
         localStorage.getItem('fp_superadmin_avatar') ||
         localStorage.getItem('fp_user_avatar_usr-super-admin') ||
         localStorage.getItem('fp_user_avatar_usr-superadmin') ||
         '');

    const cached = localStorage.getItem('fp_super_admin_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (isDeleted) {
          parsed.avatarUrl = '';
        } else if (saCached) {
          parsed.avatarUrl = saCached;
        }
        return parsed;
      } catch {}
    }

    const defaultProfile: SuperAdminProfileData = {
      id: 'usr-superadmin',
      name: 'Mukesh Sonkar',
      email: 'superadmin@focuspoint.internal',
      phone: '+91 99999 99999',
      designation: 'Chief Platform Architect & Director',
      role: 'SUPER_ADMIN',
      avatarUrl: isDeleted ? '' : (saCached || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'),
      bio: 'Directing the Pan-India expansion of the FOCUSPOINT Home Tuition & Self-Study Library ecosystem.',
      department: 'Central Directorate & Executive Office',
      employeeId: 'FP-EXEC-001',
      joinedDate: '2026-01-01',
      lastLogin: new Date().toISOString(),
      securitySettings: {
        twoFactorEnabled: true,
        emailAlertsOnLogin: true,
        sessionTimeoutMinutes: 60,
        ipWhitelistingEnabled: false,
      },
      notificationPreferences: {
        highValueTransactions: true,
        districtAdminAppointments: true,
        escalatedSupportTickets: true,
        systemAlerts: true,
        dailyExecutiveDigest: true,
      }
    };
    return defaultProfile;
  },

  /**
   * Updates Super Admin Profile & syncs image across application components
   */
  async updateSuperAdminProfile(updates: Partial<SuperAdminProfileData>): Promise<SuperAdminProfileData> {
    await new Promise(r => setTimeout(r, 120));
    const current = await this.getSuperAdminProfile();
    const updated = { ...current, ...updates };

    localStorage.setItem('fp_super_admin_profile', JSON.stringify(updated));

    // Synchronize avatar to user store if avatarUrl changed or deleted
    if (updates.avatarUrl && updates.avatarUrl.trim().length > 0) {
      localStorage.setItem('fp_super_admin_avatar', updates.avatarUrl);
      localStorage.setItem('fp_superadmin_avatar', updates.avatarUrl);
      localStorage.setItem(`fp_user_avatar_${current.id}`, updates.avatarUrl);
      localStorage.setItem('fp_user_avatar_usr-super-admin', updates.avatarUrl);
      localStorage.setItem('fp_user_avatar_usr-superadmin', updates.avatarUrl);
      if (updated.email) localStorage.setItem(`fp_user_avatar_${updated.email.toLowerCase()}`, updates.avatarUrl);
      localStorage.removeItem('fp_super_admin_avatar_deleted');

      mockStore.updateUser(current.id, {
        avatarUrl: updates.avatarUrl,
        avatar: updates.avatarUrl,
        name: updated.name,
      });
      mockStore.updateUser('usr-super-admin', {
        avatarUrl: updates.avatarUrl,
        avatar: updates.avatarUrl,
        name: updated.name,
      });
      mockStore.updateUser('usr-superadmin', {
        avatarUrl: updates.avatarUrl,
        avatar: updates.avatarUrl,
        name: updated.name,
      });
    } else if (updates.avatarUrl === '') {
      localStorage.removeItem('fp_super_admin_avatar');
      localStorage.removeItem('fp_superadmin_avatar');
      localStorage.removeItem(`fp_user_avatar_${current.id}`);
      localStorage.removeItem('fp_user_avatar_usr-super-admin');
      localStorage.removeItem('fp_user_avatar_usr-superadmin');
      if (updated.email) localStorage.removeItem(`fp_user_avatar_${updated.email.toLowerCase()}`);
      localStorage.setItem('fp_super_admin_avatar_deleted', 'true');

      mockStore.updateUser(current.id, {
        avatarUrl: '',
        avatar: '',
        name: updated.name,
      });
      mockStore.updateUser('usr-super-admin', {
        avatarUrl: '',
        avatar: '',
        name: updated.name,
      });
      mockStore.updateUser('usr-superadmin', {
        avatarUrl: '',
        avatar: '',
        name: updated.name,
      });
    }

    await auditService.record({
      actorName: updated.name,
      action: 'UPDATE_SUPER_ADMIN_PROFILE',
      module: 'SECURITY_PROFILE',
      target: 'Super Admin Personal Credentials',
      newValue: updates.avatarUrl === '' ? 'Deleted profile picture' : (updates.avatarUrl ? 'Updated profile picture' : `Updated designation: ${updated.designation}`),
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Platform Overview Stats (Supports Pan-India 13-KPI dashboard)
   * Dynamically filters and calculates by State, District, and Period
   */
  async getPlatformStats(filters?: { stateName?: string; districtName?: string; localityName?: string; datePreset?: string }) {
    await new Promise(r => setTimeout(r, 60));
    const districts = mockStore.getDistricts();
    const teachers = mockStore.getTeachers();
    const libraries = mockStore.getLibraries();
    const bookings = mockStore.getBookings();

    const isDistrictFiltered = !!(filters?.districtName && filters.districtName !== 'All Districts');
    const isStateFiltered = !!(filters?.stateName && filters.stateName !== 'All States');

    // Preset mapping for high-activity operational territories
    const DISTRICT_PRESETS: Record<string, {
      monthlyPlatformGMV: number;
      verifiedEducators: number;
      selfStudyLibraries: number;
      activeTuitionStudents: number;
      activeLibraryStudents: number;
      totalLibrarySeats: number;
      allotmentVelocityHours: number;
    }> = {
      'ghazipur': {
        monthlyPlatformGMV: 318000,
        verifiedEducators: 48,
        selfStudyLibraries: 12,
        activeTuitionStudents: 412,
        activeLibraryStudents: 248,
        totalLibrarySeats: 720,
        allotmentVelocityHours: 2.8,
      },
      'varanasi': {
        monthlyPlatformGMV: 430000,
        verifiedEducators: 62,
        selfStudyLibraries: 16,
        activeTuitionStudents: 560,
        activeLibraryStudents: 336,
        totalLibrarySeats: 960,
        allotmentVelocityHours: 3.1,
      },
      'lucknow': {
        monthlyPlatformGMV: 615000,
        verifiedEducators: 85,
        selfStudyLibraries: 24,
        activeTuitionStudents: 720,
        activeLibraryStudents: 432,
        totalLibrarySeats: 1440,
        allotmentVelocityHours: 3.6,
      },
      'kanpur nagar': {
        monthlyPlatformGMV: 375000,
        verifiedEducators: 52,
        selfStudyLibraries: 14,
        activeTuitionStudents: 430,
        activeLibraryStudents: 258,
        totalLibrarySeats: 840,
        allotmentVelocityHours: 3.2,
      },
      'patna': {
        monthlyPlatformGMV: 408000,
        verifiedEducators: 58,
        selfStudyLibraries: 15,
        activeTuitionStudents: 490,
        activeLibraryStudents: 294,
        totalLibrarySeats: 900,
        allotmentVelocityHours: 3.4,
      },
      'mau': {
        monthlyPlatformGMV: 150000,
        verifiedEducators: 22,
        selfStudyLibraries: 5,
        activeTuitionStudents: 185,
        activeLibraryStudents: 110,
        totalLibrarySeats: 300,
        allotmentVelocityHours: 4.2,
      },
      'ballia': {
        monthlyPlatformGMV: 123000,
        verifiedEducators: 18,
        selfStudyLibraries: 4,
        activeTuitionStudents: 140,
        activeLibraryStudents: 84,
        totalLibrarySeats: 240,
        allotmentVelocityHours: 4.8,
      }
    };

    if (isDistrictFiltered) {
      const dKey = filters!.districtName!.toLowerCase().trim();
      const preset = DISTRICT_PRESETS[dKey];

      let gmv = 240000;
      let educators = 34;
      let libs = 8;
      let tuitionStudents = 260;
      let libraryStudents = 150;
      let seats = 480;
      let velocityHours = 3.2;

      if (preset) {
        gmv = preset.monthlyPlatformGMV;
        educators = preset.verifiedEducators;
        libs = preset.selfStudyLibraries;
        tuitionStudents = preset.activeTuitionStudents;
        libraryStudents = preset.activeLibraryStudents;
        seats = preset.totalLibrarySeats;
        velocityHours = preset.allotmentVelocityHours;
      } else {
        // Deterministic synthesis based on district name hash
        let hash = 0;
        for (let i = 0; i < dKey.length; i++) hash = (hash * 31 + dKey.charCodeAt(i)) & 0xffffffff;
        const absHash = Math.abs(hash);
        gmv = 180000 + (absHash % 240000);
        educators = 24 + (absHash % 35);
        libs = 5 + (absHash % 12);
        tuitionStudents = 180 + (absHash % 280);
        libraryStudents = Math.round(tuitionStudents * 0.6);
        seats = libs * 60;
        velocityHours = 2.6 + ((absHash % 15) / 10);
      }

      // If locality filtered, scale by ~25%
      if (filters?.localityName && filters.localityName !== 'All Localities') {
        gmv = Math.round(gmv * 0.28);
        educators = Math.max(3, Math.round(educators * 0.25));
        libs = Math.max(1, Math.round(libs * 0.25));
        tuitionStudents = Math.max(15, Math.round(tuitionStudents * 0.25));
        libraryStudents = Math.max(10, Math.round(libraryStudents * 0.25));
        seats = Math.max(40, Math.round(seats * 0.25));
      }

      const platformRev = Math.round(gmv * 0.08);
      const pendingPay = Math.round(gmv * 0.02);
      const expenses = Math.round(gmv * 0.037);
      const netRev = platformRev - expenses;

      return {
        monthlyPlatformGMV: gmv,
        operatingDistricts: 1,
        verifiedEducators: educators,
        selfStudyLibraries: libs,
        activeTuitionStudents: tuitionStudents,
        activeLibraryStudents: libraryStudents,
        authorizedDistrictAdmins: 1,
        allotmentVelocityHours: velocityHours,
        totalLibrarySeats: seats,
        platformRevenue: platformRev,
        pendingPayouts: pendingPay,
        platformExpenses: expenses,
        netPlatformRevenue: netRev,

        totalDistricts: 1,
        activeDistricts: 1,
        totalStudents: tuitionStudents + libraryStudents,
        totalTeachers: educators,
        totalLibraries: libs,
        totalBookings: Math.round(libraryStudents * 0.45),
      };
    }

    if (isStateFiltered) {
      const stateLower = filters!.stateName!.toLowerCase();
      // UP has 6 preset active districts, Bihar has 1, other states dynamically scale
      let activeDistrictsCount = 1;
      let multiplier = 0.25;

      if (stateLower.includes('uttar')) {
        activeDistrictsCount = 6;
        multiplier = 0.83; // UP carries ~83% of current network
      } else if (stateLower.includes('bihar')) {
        activeDistrictsCount = 1;
        multiplier = 0.17;
      } else {
        multiplier = 0.12;
      }

      const gmv = Math.round(2419000 * multiplier);
      const platformRev = Math.round(gmv * 0.08);
      const expenses = Math.round(gmv * 0.037);
      const pendingPay = Math.round(gmv * 0.02);
      const netRev = platformRev - expenses;

      const educators = Math.round(148 * multiplier);
      const libs = Math.round(28 * multiplier);
      const tuitionStudents = Math.round(742 * multiplier);
      const libraryStudents = Math.round(890 * multiplier);
      const seats = Math.round(1680 * multiplier);

      return {
        monthlyPlatformGMV: gmv,
        operatingDistricts: activeDistrictsCount,
        verifiedEducators: educators,
        selfStudyLibraries: libs,
        activeTuitionStudents: tuitionStudents,
        activeLibraryStudents: libraryStudents,
        authorizedDistrictAdmins: activeDistrictsCount,
        allotmentVelocityHours: 3.3,
        totalLibrarySeats: seats,
        platformRevenue: platformRev,
        pendingPayouts: pendingPay,
        platformExpenses: expenses,
        netPlatformRevenue: netRev,

        totalDistricts: activeDistrictsCount,
        activeDistricts: activeDistrictsCount,
        totalStudents: tuitionStudents + libraryStudents,
        totalTeachers: educators,
        totalLibraries: libs,
        totalBookings: Math.round(libraryStudents * 0.45),
      };
    }

    // Default: Pan-India National Platform Numbers
    return {
      monthlyPlatformGMV: 2419000,
      operatingDistricts: districts.length || 7,
      verifiedEducators: teachers.filter(t => t.isActive).length || 148,
      selfStudyLibraries: libraries.length || 28,
      activeTuitionStudents: 742,
      activeLibraryStudents: 890,
      authorizedDistrictAdmins: 7,
      allotmentVelocityHours: 3.4,
      totalLibrarySeats: 1680,
      platformRevenue: 193520,
      pendingPayouts: 48200,
      platformExpenses: 90200,
      netPlatformRevenue: 103320,

      // Backwards-compatible aliases
      totalDistricts: districts.length || 7,
      activeDistricts: districts.filter(d => d.isActive).length || 7,
      totalStudents: 1632,
      totalTeachers: teachers.length || 148,
      totalLibraries: libraries.length || 28,
      totalBookings: bookings.length || 184,
    };
  },

  async getGlobalAnalytics() {
    return this.getPlatformStats();
  },

  async getDistricts(): Promise<District[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getDistricts();
  },

  async createDistrict(name: string, state: string, code: string): Promise<District> {
    await new Promise(r => setTimeout(r, 150));
    const newDistrict: District = {
      id: `dist-${code.toLowerCase()}`,
      name,
      state,
      code,
      isActive: true,
      totalStudents: 0,
      totalTeachers: 0,
      totalLibraries: 0,
    };
    mockStore.addDistrict(newDistrict);
    await auditService.record({
      action: 'CREATE_DISTRICT',
      module: 'DISTRICT_REGISTRY',
      target: `${name}, ${state} (${code})`,
      status: 'SUCCESS'
    });
    return newDistrict;
  },

  /**
   * District Admins List with persistent storage support
   */
  async getDistrictAdmins(): Promise<DistrictAdminRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    try {
      const stored = safeStorage.getItem(DISTRICT_ADMINS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load district admins from storage:', e);
    }

    const defaultList: DistrictAdminRecord[] = [
      {
        id: 'da-01',
        userId: 'usr-admin-gzp',
        name: 'Virendra Pratap Singh',
        email: 'virendra.singh@focuspoint.internal',
        phone: '+91 94152 48102',
        whatsappNumber: '+91 94152 48102',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        status: 'ACTIVE',
        assignedDate: '2026-02-01',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        qualification: 'M.Sc. Physics (BHU), B.Ed',
        address: 'Civil Lines, Ghazipur Collectorate Compound, UP',
        assignedBy: 'Super Admin HQ',
        effectiveFrom: '2026-02-01',
        totalTeachers: 48,
        totalStudents: 412,
        totalLibraries: 12,
        districtGMV: 318000,
        growthPercentage: 24.5,
        salaryDetails: {
          baseSalary: 25000,
          allowances: 3000,
          deductions: 1000,
          netPayable: 27000,
          lastPaidDate: '2026-08-31',
          paymentStatus: 'SIMULATION'
        }
      },
      {
        id: 'da-02',
        userId: 'usr-admin-vns',
        name: 'Anjali Srivastava',
        email: 'anjali.vns@focuspoint.internal',
        phone: '+91 98390 12845',
        whatsappNumber: '+91 98390 12845',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        status: 'ACTIVE',
        assignedDate: '2026-02-15',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        qualification: 'M.A. Public Administration',
        address: 'Bhelupur, Varanasi, UP',
        assignedBy: 'Super Admin HQ',
        effectiveFrom: '2026-02-15',
        totalTeachers: 62,
        totalStudents: 560,
        totalLibraries: 16,
        districtGMV: 430000,
        growthPercentage: 28.2,
        salaryDetails: {
          baseSalary: 28000,
          allowances: 3500,
          deductions: 1200,
          netPayable: 30300,
          lastPaidDate: '2026-08-31',
          paymentStatus: 'SIMULATION'
        }
      },
      {
        id: 'da-03',
        userId: 'usr-admin-lko',
        name: 'Devendra Nath Trivedi',
        email: 'devendra.lko@focuspoint.internal',
        phone: '+91 94501 88412',
        whatsappNumber: '+91 94501 88412',
        stateName: 'Uttar Pradesh',
        districtName: 'Lucknow',
        status: 'ACTIVE',
        assignedDate: '2026-03-01',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        qualification: 'M.Ed, Educational Administration',
        address: 'Hazratganj, Lucknow, UP',
        assignedBy: 'Super Admin HQ',
        effectiveFrom: '2026-03-01',
        totalTeachers: 85,
        totalStudents: 720,
        totalLibraries: 24,
        districtGMV: 615000,
        growthPercentage: 35.6,
        salaryDetails: {
          baseSalary: 32000,
          allowances: 4000,
          deductions: 1500,
          netPayable: 34500,
          lastPaidDate: '2026-08-31',
          paymentStatus: 'SIMULATION'
        }
      },
      {
        id: 'da-04',
        userId: 'usr-admin-ballia',
        name: 'Alok Nath Singh',
        email: 'alok.ballia@focuspoint.internal',
        phone: '+91 94511 23456',
        whatsappNumber: '+91 94511 23456',
        stateName: 'Uttar Pradesh',
        districtName: 'Ballia',
        status: 'ACTIVE',
        assignedDate: '2026-03-10',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        qualification: 'M.Sc. Mathematics, B.Ed',
        address: 'Collectorate Road, Ballia, UP',
        assignedBy: 'Super Admin HQ',
        effectiveFrom: '2026-03-10',
        totalTeachers: 38,
        totalStudents: 295,
        totalLibraries: 9,
        districtGMV: 245000,
        growthPercentage: 19.8,
        salaryDetails: {
          baseSalary: 25000,
          allowances: 2500,
          deductions: 800,
          netPayable: 26700,
          lastPaidDate: '2026-08-31',
          paymentStatus: 'SIMULATION'
        }
      },
      {
        id: 'da-05',
        userId: 'usr-admin-patna',
        name: 'Manoj Kumar Jha',
        email: 'manoj.patna@focuspoint.internal',
        phone: '+91 98350 77123',
        whatsappNumber: '+91 98350 77123',
        stateName: 'Bihar',
        districtName: 'Patna',
        status: 'ACTIVE',
        assignedDate: '2026-03-15',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
        qualification: 'Ph.D. Education, M.Sc. Physics',
        address: 'Boring Road, Patna, Bihar',
        assignedBy: 'Super Admin HQ',
        effectiveFrom: '2026-03-15',
        totalTeachers: 52,
        totalStudents: 480,
        totalLibraries: 14,
        districtGMV: 389000,
        growthPercentage: 31.4,
        salaryDetails: {
          baseSalary: 28000,
          allowances: 3000,
          deductions: 1000,
          netPayable: 30000,
          lastPaidDate: '2026-08-31',
          paymentStatus: 'SIMULATION'
        }
      },
      {
        id: 'da-06',
        userId: 'usr-admin-delhi',
        name: 'Vikramaditya Sharma',
        email: 'vikram.delhi@focuspoint.internal',
        phone: '+91 98110 54321',
        whatsappNumber: '+91 98110 54321',
        stateName: 'Delhi',
        districtName: 'Delhi',
        status: 'ACTIVE',
        assignedDate: '2026-04-01',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
        qualification: 'MBA, B.Tech',
        address: 'Connaught Place, Central Delhi',
        assignedBy: 'Super Admin HQ',
        effectiveFrom: '2026-04-01',
        totalTeachers: 94,
        totalStudents: 880,
        totalLibraries: 28,
        districtGMV: 780000,
        growthPercentage: 42.0,
        salaryDetails: {
          baseSalary: 35000,
          allowances: 5000,
          deductions: 2000,
          netPayable: 38000,
          lastPaidDate: '2026-08-31',
          paymentStatus: 'SIMULATION'
        }
      }
    ];

    safeStorage.setItem(DISTRICT_ADMINS_STORAGE_KEY, JSON.stringify(defaultList));
    return defaultList;
  },

  /**
   * One Active District Admin Rule Checker (Section #14)
   * Verifies if a district already has an appointed active administrator
   */
  async checkDistrictAdminAssignment(districtName: string, stateName: string): Promise<{ hasActiveAdmin: boolean; existingAdmin?: DistrictAdminRecord }> {
    const admins = await this.getDistrictAdmins();
    const existing = admins.find(a => 
      a.districtName.toLowerCase().trim() === districtName.toLowerCase().trim() &&
      a.stateName.toLowerCase().trim() === stateName.toLowerCase().trim() &&
      a.status === 'ACTIVE'
    );
    return { hasActiveAdmin: !!existing, existingAdmin: existing };
  },

  /**
   * 4-Step Appointment of a District Admin with Credentials setup & Automated WhatsApp Dispatch
   * (Section #1, #7, #8, #9, #10, #14, #18, #26)
   */
  async appointDistrictAdminWithCredentials(params: {
    stateName: string;
    districtName: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    whatsappNumber?: string;
    userId: string;
    temporaryPassword: string;
    qualification?: string;
    address?: string;
    avatarUrl?: string;
    replaceExisting?: boolean;
  }) {
    await new Promise(r => setTimeout(r, 200));
    const admins = await this.getDistrictAdmins();

    // Check if replacing an existing admin for the district
    if (params.replaceExisting) {
      const prevAdmin = admins.find(a => 
        a.districtName.toLowerCase() === params.districtName.toLowerCase() &&
        a.stateName.toLowerCase() === params.stateName.toLowerCase() &&
        a.status === 'ACTIVE' &&
        a.userId !== params.userId
      );
      if (prevAdmin) {
        prevAdmin.status = 'INACTIVE';
        if (!prevAdmin.reassignmentHistory) prevAdmin.reassignmentHistory = [];
        prevAdmin.reassignmentHistory.push({
          previousDistrict: prevAdmin.districtName,
          previousState: prevAdmin.stateName,
          reassignedAt: new Date().toISOString(),
          reason: `Replaced by ${params.adminName}`
        });
        mockStore.updateUser(prevAdmin.userId, { accountStatus: 'DEACTIVATED', isActive: false });
      }
    }

    // Process photo if data URL
    let photo = params.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200';
    if (photo && photo.startsWith('data:image/')) {
      try {
        photo = await compressImage(photo, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
      } catch (e) {
        console.warn('Avatar compression fallback:', e);
      }
    }

    const newRecord: DistrictAdminRecord = {
      id: `da-${Date.now().toString().slice(-4)}`,
      userId: params.userId,
      name: params.adminName,
      email: params.adminEmail,
      phone: params.adminPhone,
      whatsappNumber: params.whatsappNumber || params.adminPhone,
      stateName: params.stateName,
      districtName: params.districtName,
      status: 'ACTIVE',
      assignedDate: new Date().toISOString().slice(0, 10),
      avatarUrl: photo,
      qualification: params.qualification || 'M.A. / M.Sc. Graduate',
      address: params.address || `${params.districtName} Collectorate Complex, ${params.stateName}`,
      temporaryPassword: params.temporaryPassword,
      assignedBy: 'Super Admin HQ (Institutional Registry)',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      credentialsDispatched: true,
      whatsappConfirmationSent: true,
      totalTeachers: 0,
      totalStudents: 0,
      totalLibraries: 0,
      districtGMV: 0,
      growthPercentage: 0,
      salaryDetails: {
        baseSalary: 25000,
        allowances: 3000,
        deductions: 1000,
        netPayable: 27000,
        lastPaidDate: new Date().toISOString().slice(0, 10),
        paymentStatus: 'SIMULATION'
      }
    };

    // Save into persistent registry
    let updatedAdmins = admins.filter(a => a.userId !== params.userId);
    if (params.replaceExisting) {
      updatedAdmins = updatedAdmins.map(a => {
        if (a.districtName.toLowerCase() === params.districtName.toLowerCase() && a.status === 'ACTIVE' && a.userId !== params.userId) {
          const prevUser = mockStore.getUserById(a.userId);
          if (prevUser) {
            mockStore.updateUser(a.userId, { ...prevUser, accountStatus: 'INACTIVE', isActive: false, status: 'inactive' });
          }
          return { ...a, status: 'INACTIVE' as const };
        }
        return a;
      });
    }
    updatedAdmins = [newRecord, ...updatedAdmins];
    safeStorage.setItem(DISTRICT_ADMINS_STORAGE_KEY, JSON.stringify(updatedAdmins));

    // Register active user in mockStore with district context
    const districts = mockStore.getDistricts();
    const dist = districts.find(d => d.name.toLowerCase() === params.districtName.toLowerCase());
    if (dist) {
      dist.adminName = params.adminName;
      dist.activeAdminName = params.adminName;
      dist.activeAdminId = params.userId;
    }

    const newUser: User = {
      id: params.userId,
      name: params.adminName,
      email: params.adminEmail.toLowerCase().trim(),
      mobile: params.adminPhone.trim(),
      phone: params.adminPhone.trim(),
      whatsappNumber: (params.whatsappNumber || params.adminPhone).trim(),
      role: 'DISTRICT_ADMIN',
      districtId: dist ? dist.id : `dist-${params.districtName.toLowerCase().replace(/\s+/g, '-')}`,
      districtName: params.districtName,
      district: params.districtName,
      stateName: params.stateName,
      state: params.stateName,
      authorizedDistrict: params.districtName,
      authorizedState: params.stateName,
      accountStatus: 'ACTIVE',
      isActive: true,
      avatarUrl: photo,
      avatar: photo,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const existingUser = mockStore.getUserById(params.userId);
    if (existingUser) {
      mockStore.updateUser(params.userId, newUser);
    } else {
      mockStore.addUser(newUser);
    }

    // Save avatar in dedicated key
    safeStorage.setItem(`fp_user_avatar_${params.userId}`, photo);
    if (params.adminEmail) safeStorage.setItem(`fp_user_avatar_${params.adminEmail.toLowerCase()}`, photo);

    // Save credential in auth credentials map for immediate login (marked temporary for forced first login rotation)
    authService.storeUserCredential(params.userId, params.adminEmail, params.adminPhone, params.temporaryPassword, 'DISTRICT_ADMIN', true);

    // Trigger WhatsApp Congratulatory Notification with User ID & Temporary Password (Section #1, #26)
    try {
      await notificationService.sendWhatsAppRegistrationConfirmation({
        role: 'DISTRICT_ADMIN',
        name: params.adminName,
        userId: params.userId,
        recipientPhone: params.whatsappNumber || params.adminPhone,
        whatsappNumber: params.whatsappNumber || params.adminPhone,
        mobile: params.adminPhone,
        district: params.districtName,
        state: params.stateName,
        temporaryPassword: params.temporaryPassword,
        details: {
          district: params.districtName,
          state: params.stateName,
          temporaryPassword: params.temporaryPassword,
          userId: params.userId,
        }
      });
    } catch (notifErr) {
      console.warn('WhatsApp congratulation non-blocking error:', notifErr);
    }

    await auditService.record({
      action: 'APPOINT_DISTRICT_ADMIN',
      module: 'ADMIN_GOVERNANCE',
      target: `${params.adminName} (${params.districtName}, ${params.stateName})`,
      newValue: `Admin ID: ${params.userId} | Email: ${params.adminEmail} | WhatsApp Dispatched to ${params.whatsappNumber || params.adminPhone}`,
      district: params.districtName,
      state: params.stateName,
      status: 'SUCCESS'
    });

    return {
      success: true,
      adminRecord: newRecord,
      credentials: {
        userId: params.userId,
        email: params.adminEmail,
        temporaryPassword: params.temporaryPassword,
        district: params.districtName,
        state: params.stateName,
        issuedAt: new Date().toISOString(),
      }
    };
  },

  /**
   * District Admin Reassignment to another District (Section #13)
   */
  async reassignDistrictAdmin(
    userIdOrAdminId: string, 
    newStateName: string, 
    newDistrictName: string, 
    reason?: string
  ): Promise<{ success: boolean; admin?: DistrictAdminRecord; error?: string }> {
    await new Promise(r => setTimeout(r, 150));
    const admins = await this.getDistrictAdmins();
    const admin = admins.find(a => a.userId === userIdOrAdminId || a.id === userIdOrAdminId);
    if (!admin) {
      throw new Error(`District Admin with ID ${userIdOrAdminId} not found`);
    }

    const previousDistrict = admin.districtName;
    const previousState = admin.stateName;

    if (!admin.reassignmentHistory) admin.reassignmentHistory = [];
    admin.reassignmentHistory.push({
      previousDistrict,
      previousState,
      reassignedAt: new Date().toISOString(),
      reason: reason || 'Administrative Jurisdictional Transfer by Super Admin'
    });

    admin.districtName = newDistrictName;
    admin.stateName = newStateName;
    admin.assignedDate = new Date().toISOString().slice(0, 10);

    safeStorage.setItem(DISTRICT_ADMINS_STORAGE_KEY, JSON.stringify(admins));

    // Update in mockStore User
    const user = mockStore.getUserById(admin.userId);
    if (user) {
      user.districtName = newDistrictName;
      user.district = newDistrictName;
      user.authorizedDistrict = newDistrictName;
      user.stateName = newStateName;
      user.state = newStateName;
      user.authorizedState = newStateName;
      mockStore.updateUser(admin.userId, user);
    }

    // Update old and new district models
    const districts = mockStore.getDistricts();
    const oldDist = districts.find(d => d.name.toLowerCase() === previousDistrict.toLowerCase());
    if (oldDist && oldDist.activeAdminId === admin.userId) {
      oldDist.adminName = undefined;
      oldDist.activeAdminName = undefined;
      oldDist.activeAdminId = undefined;
    }
    const newDist = districts.find(d => d.name.toLowerCase() === newDistrictName.toLowerCase());
    if (newDist) {
      newDist.adminName = admin.name;
      newDist.activeAdminName = admin.name;
      newDist.activeAdminId = admin.userId;
    }

    // Update active session in safeStorage if this admin is currently logged in (Section #13, #21)
    const currentSessionRaw = safeStorage.getItem('fp_current_session_user');
    if (currentSessionRaw) {
      try {
        const sessUser = JSON.parse(currentSessionRaw);
        if (sessUser.id === admin.userId || sessUser.id === admin.id || (sessUser.userId && sessUser.userId === admin.userId)) {
          sessUser.authorizedDistrict = newDistrictName;
          sessUser.authorizedState = newStateName;
          sessUser.districtName = newDistrictName;
          sessUser.district = newDistrictName;
          sessUser.stateName = newStateName;
          sessUser.state = newStateName;
          safeStorage.setItem('fp_current_session_user', JSON.stringify(sessUser));
          safeStorage.setItem('fp_user', JSON.stringify(sessUser));
        }
      } catch {}
    }

    await auditService.record({
      action: 'REASSIGN_DISTRICT_ADMIN',
      module: 'ADMIN_GOVERNANCE',
      target: `${admin.name} (Transferred from ${previousDistrict} to ${newDistrictName})`,
      newValue: reason || 'Jurisdictional transfer',
      district: newDistrictName,
      state: newStateName,
      status: 'SUCCESS'
    });

    // Notify on WhatsApp
    try {
      notificationService.sendWhatsAppRegistrationConfirmation({
        role: 'DISTRICT_ADMIN',
        name: admin.name,
        userId: admin.userId,
        recipientPhone: admin.whatsappNumber || admin.phone,
        district: newDistrictName,
        state: newStateName,
        temporaryPassword: admin.temporaryPassword || 'Your current password remains valid',
        details: {
          district: newDistrictName,
          state: newStateName,
          reason: reason || 'Jurisdictional transfer'
        }
      });
    } catch {}

    return { success: true, admin };
  },

  async reassignDistrictAdminTerritory(
    userIdOrAdminId: string,
    _stateId: string,
    newStateName: string,
    _districtId: string,
    newDistrictName: string,
    reason?: string
  ): Promise<{ success: boolean; admin?: DistrictAdminRecord; error?: string }> {
    return this.reassignDistrictAdmin(userIdOrAdminId, newStateName, newDistrictName, reason);
  },

  /**
   * Update District Admin Status (Active, Suspended, Deactivated) (Section #16, #17)
   */
  async updateDistrictAdminStatus(
    userIdOrAdminId: string, 
    status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED', 
    reason?: string
  ): Promise<{ success: boolean; admin?: DistrictAdminRecord; error?: string }> {
    await new Promise(r => setTimeout(r, 120));
    const admins = await this.getDistrictAdmins();
    const admin = admins.find(a => a.userId === userIdOrAdminId || a.id === userIdOrAdminId);
    if (!admin) {
      throw new Error(`District Admin with ID ${userIdOrAdminId} not found`);
    }

    admin.status = status;
    safeStorage.setItem(DISTRICT_ADMINS_STORAGE_KEY, JSON.stringify(admins));

    mockStore.updateUser(admin.userId, {
      accountStatus: status,
      isActive: status === 'ACTIVE',
      status: status === 'ACTIVE' ? 'active' : (status === 'DEACTIVATED' ? 'deactivated' : 'suspended')
    });

    // Invalidate active session if suspended or deactivated (Section #27, Acceptance Test 12)
    const currentSessionRaw = safeStorage.getItem('fp_current_session_user');
    if (currentSessionRaw) {
      try {
        const sessUser = JSON.parse(currentSessionRaw);
        if (sessUser.id === admin.userId || sessUser.id === admin.id || (sessUser.userId && sessUser.userId === admin.userId)) {
          if (status === 'SUSPENDED' || status === 'DEACTIVATED') {
            safeStorage.removeItem('fp_current_session_user');
            safeStorage.removeItem('fp_user');
            safeStorage.removeItem('fp_token');
          } else {
            sessUser.accountStatus = status;
            sessUser.isActive = status === 'ACTIVE';
            safeStorage.setItem('fp_current_session_user', JSON.stringify(sessUser));
            safeStorage.setItem('fp_user', JSON.stringify(sessUser));
          }
        }
      } catch {}
    }

    await auditService.record({
      action: status === 'SUSPENDED' ? 'SUSPEND_DISTRICT_ADMIN' : (status === 'ACTIVE' ? 'ACTIVATE_DISTRICT_ADMIN' : 'DEACTIVATE_DISTRICT_ADMIN'),
      module: 'ADMIN_GOVERNANCE',
      target: `${admin.name} (${admin.districtName})`,
      newValue: `Status changed to ${status}${reason ? ' | Reason: ' + reason : ''}`,
      district: admin.districtName,
      state: admin.stateName,
      status: 'SUCCESS'
    });

    return { success: true, admin };
  },

  /**
   * Reset District Admin Credentials and Dispatch WhatsApp Alert (Section #16, #18)
   */
  async resetDistrictAdminCredentials(
    userIdOrAdminId: string, 
    customPassword?: string
  ): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
    await new Promise(r => setTimeout(r, 150));
    const admins = await this.getDistrictAdmins();
    const admin = admins.find(a => a.userId === userIdOrAdminId || a.id === userIdOrAdminId);
    if (!admin) {
      throw new Error(`District Admin with ID ${userIdOrAdminId} not found`);
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let newPassword = customPassword || 'FP@';
    if (!customPassword) {
      for (let i = 0; i < 8; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    admin.temporaryPassword = newPassword;
    safeStorage.setItem(DISTRICT_ADMINS_STORAGE_KEY, JSON.stringify(admins));

    // Store updated credential marked as temporary so District Admin must rotate it on next login
    authService.storeUserCredential(admin.userId, admin.email, admin.phone, newPassword, 'DISTRICT_ADMIN', true);

    try {
      await notificationService.sendWhatsAppRegistrationConfirmation({
        role: 'DISTRICT_ADMIN',
        name: admin.name,
        userId: admin.userId,
        recipientPhone: admin.whatsappNumber || admin.phone,
        district: admin.districtName,
        state: admin.stateName,
        temporaryPassword: newPassword,
        details: {
          district: admin.districtName,
          state: admin.stateName,
          temporaryPassword: newPassword,
          userId: admin.userId,
        }
      });
    } catch {}

    await auditService.record({
      action: 'RESET_DISTRICT_ADMIN_CREDENTIALS',
      module: 'ADMIN_GOVERNANCE',
      target: `${admin.name} (${admin.districtName})`,
      newValue: `New temporary password generated & dispatched to ${admin.whatsappNumber || admin.phone}`,
      district: admin.districtName,
      state: admin.stateName,
      status: 'SUCCESS'
    });

    return { success: true, temporaryPassword: newPassword };
  },

  /**
   * Direct District Command Override execution by Super Admin
   */
  async executeDistrictCommandAction(params: {
    districtName: string;
    actionType: string;
    targetTitle: string;
    details: string;
  }) {
    await new Promise(r => setTimeout(r, 150));
    await auditService.record({
      action: `SUPER_ADMIN_OVERRIDE_${params.actionType.toUpperCase()}`,
      module: 'DISTRICT_COMMAND',
      target: params.targetTitle,
      district: params.districtName,
      newValue: params.details,
      status: 'SUCCESS'
    });
    return { success: true, message: `Override action '${params.actionType}' applied to ${params.districtName}` };
  },

  /**
   * District Admin Salary Payout Simulation
   */
  async disburseDistrictAdminSalary(params: DistrictAdminSalaryPaymentParams) {
    await new Promise(r => setTimeout(r, 200));
    const netPayable = Number(params.baseSalary) + Number(params.adjustments) - Number(params.deductions);

    await auditService.record({
      action: 'SALARY_PAYOUT_SIMULATION',
      module: 'ADMIN_FINANCES',
      target: `${params.adminName} (${params.districtName})`,
      district: params.districtName,
      newValue: `Salary Month: ${params.salaryPeriod} | Net: ₹${netPayable} (SIMULATION)`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      status: 'SIMULATION',
      netPayable,
      message: 'District Admin salary processed in Simulation Mode (Backend banking provider integration pending)'
    };
  },

  // Backwards compatibility methods
  async appointDistrictAdmin(params: { districtName: string; adminName: string; adminEmail: string; adminPhone: string }) {
    return this.appointDistrictAdminWithCredentials({
      stateName: 'Uttar Pradesh',
      districtName: params.districtName,
      adminName: params.adminName,
      adminEmail: params.adminEmail,
      adminPhone: params.adminPhone,
      userId: `da-${params.districtName.toLowerCase().slice(0, 3)}`,
      temporaryPassword: `Focus@${Math.floor(1000 + Math.random() * 9000)}!`
    });
  },

  async assignDistrictAdmin(districtId: string, adminUserId: string, adminName: string) {
    const dist = mockStore.getDistrictById(districtId);
    if (dist) {
      dist.activeAdminName = adminName;
      dist.adminName = adminName;
    }
    return dist;
  },

  async getUsers(): Promise<User[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getUsers();
  },

  async getGlobalUsers(): Promise<User[]> {
    return this.getUsers();
  },

  async getGlobalStudents(): Promise<any[]> {
    await new Promise(r => setTimeout(r, 100));
    const users = mockStore.getUsers();
    const students = users.filter(u => (u.role || '').toUpperCase() === 'STUDENT' || (u.role || '').toUpperCase() === 'LIBRARY_STUDENT');
    return students.map((s: any) => ({
      ...s,
      grade: s.grade || 'Class 11 (Science)',
      board: s.board || 'CBSE',
      targetExam: s.targetExam || 'JEE Main / Boards',
      schoolName: s.schoolName || 'Kendriya Vidyalaya',
      activeTutorName: 'Dr. Rajesh Sharma',
      activeLibraryName: 'Saraswati Self-Study Library',
      attendanceRate: 94,
    }));
  },

  /**
   * Retrieves all Pan-India Home Tuition student learners with real-time telemetry
   */
  async getPanIndiaHomeTuitionStudents(): Promise<HomeTuitionStudentRecord[]> {
    await new Promise(r => setTimeout(r, 80));
    try {
      const cached = safeStorage.getItem(HOME_TUITION_STUDENTS_STORAGE_KEY);
      if (cached) {
        const parsed: HomeTuitionStudentRecord[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached home tuition students', e);
    }

    // Default initialization with full dataset
    try {
      safeStorage.setItem(HOME_TUITION_STUDENTS_STORAGE_KEY, JSON.stringify(INITIAL_HOME_TUITION_STUDENTS));
    } catch {}
    return [...INITIAL_HOME_TUITION_STUDENTS];
  },

  /**
   * Master profile update for Home Tuition Student with audit logging
   */
  async updateHomeTuitionStudent(
    studentId: string, 
    updates: Partial<HomeTuitionStudentRecord> & { reason?: string }
  ): Promise<HomeTuitionStudentRecord | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaHomeTuitionStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const previous = { ...all[idx] };
    const { reason, ...cleanUpdates } = updates;
    const updated: HomeTuitionStudentRecord = {
      ...previous,
      ...cleanUpdates,
      updatedAt: new Date().toISOString()
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(HOME_TUITION_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    // Also sync with mockStore user if matching
    if (updated.userId || updated.id) {
      mockStore.updateUser(updated.userId || updated.id, {
        name: updated.name,
        email: updated.email,
        mobile: updated.mobile,
        district: updated.districtName,
        districtName: updated.districtName,
        state: updated.stateName,
        stateName: updated.stateName,
        localityName: updated.localityName,
        area: updated.areaName,
        address: updated.address,
        pincode: updated.pincode,
        grade: updated.grade,
        schoolName: updated.schoolName,
        targetExam: updated.targetExam,
        parentName: updated.parentName,
        parentPhone: updated.parentPhone,
        isActive: updated.enrollmentStatus === 'ACTIVE'
      });
    }

    await auditService.record({
      action: 'UPDATE_HOME_TUITION_STUDENT',
      module: 'STUDENTS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName,
      state: updated.stateName,
      previousValue: `Status: ${previous.enrollmentStatus}, Grade: ${previous.grade}, Tutor: ${previous.assignedTutorName || 'None'}`,
      newValue: `Fields: ${Object.keys(cleanUpdates).join(', ')}. Reason: ${reason || 'Master Profile Override by Super Admin'}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Reallocate or allot verified home tutor with audit trail
   */
  async reallocateHomeTuitionTutor(
    studentId: string,
    tutorId: string,
    tutorName: string,
    tutorPhone?: string,
    specialization?: string,
    notes?: string
  ): Promise<HomeTuitionStudentRecord | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaHomeTuitionStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const prevTutor = all[idx].assignedTutorName || 'Unassigned';
    all[idx] = {
      ...all[idx],
      assignedTutorId: tutorId,
      assignedTutorName: tutorName,
      assignedTutorPhone: tutorPhone || '9876543211',
      assignedTutorSpecialization: specialization || 'Verified Secondary & Senior Secondary Educator',
      enrollmentStatus: 'ACTIVE',
      updatedAt: new Date().toISOString(),
      notes: notes ? `${all[idx].notes || ''}\n[Reallocation]: ${notes}`.trim() : all[idx].notes
    };

    try {
      safeStorage.setItem(HOME_TUITION_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'REALLOCATE_HOME_TUTOR',
      module: 'STUDENTS_REGISTRY',
      target: all[idx].name,
      targetId: all[idx].id,
      district: all[idx].districtName,
      state: all[idx].stateName,
      previousValue: `Tutor: ${prevTutor}`,
      newValue: `Reassigned to ${tutorName} (${tutorId}). Notes: ${notes || 'Super Admin Override Allotment'}`,
      status: 'SUCCESS'
    });

    return all[idx];
  },

  /**
   * Directly onboards a new home tuition student into the platform
   */
  async createHomeTuitionStudent(
    record: Omit<HomeTuitionStudentRecord, 'id' | 'createdAt'>
  ): Promise<HomeTuitionStudentRecord> {
    await new Promise(r => setTimeout(r, 120));
    const all = await this.getPanIndiaHomeTuitionStudents();
    const newId = `stu-ht-${Date.now().toString().slice(-4)}`;
    const newStudent: HomeTuitionStudentRecord = {
      ...record,
      id: newId,
      userId: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    all.unshift(newStudent);
    try {
      safeStorage.setItem(HOME_TUITION_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    // Register into mock store
    mockStore.addUser({
      id: newId,
      name: newStudent.name,
      email: newStudent.email,
      mobile: newStudent.mobile,
      role: 'STUDENT',
      district: newStudent.districtName,
      districtName: newStudent.districtName,
      state: newStudent.stateName,
      stateName: newStudent.stateName,
      localityName: newStudent.localityName,
      area: newStudent.areaName,
      address: newStudent.address,
      pincode: newStudent.pincode,
      grade: newStudent.grade,
      schoolName: newStudent.schoolName,
      targetExam: newStudent.targetExam,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      isActive: newStudent.enrollmentStatus === 'ACTIVE',
      createdAt: newStudent.createdAt
    });

    await auditService.record({
      action: 'DIRECT_ONBOARD_STUDENT',
      module: 'STUDENTS_REGISTRY',
      target: newStudent.name,
      targetId: newStudent.id,
      district: newStudent.districtName,
      state: newStudent.stateName,
      newValue: `Direct Onboarding by Super Admin. Roll: ${newStudent.rollNumber}, Grade: ${newStudent.grade}, Tutor: ${newStudent.assignedTutorName || 'None'}`,
      status: 'SUCCESS'
    });

    return newStudent;
  },

  /**
   * Toggles enrollment status of home tuition student
   */
  async toggleHomeTuitionStatus(
    studentId: string, 
    nextStatus: HomeTuitionEnrollmentStatus
  ): Promise<HomeTuitionStudentRecord | null> {
    await new Promise(r => setTimeout(r, 80));
    const all = await this.getPanIndiaHomeTuitionStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const previousStatus = all[idx].enrollmentStatus;
    all[idx] = {
      ...all[idx],
      enrollmentStatus: nextStatus,
      updatedAt: new Date().toISOString()
    };

    try {
      safeStorage.setItem(HOME_TUITION_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'TOGGLE_STUDENT_STATUS',
      module: 'STUDENTS_REGISTRY',
      target: all[idx].name,
      targetId: all[idx].id,
      district: all[idx].districtName,
      state: all[idx].stateName,
      previousValue: `Status was ${previousStatus}`,
      newValue: `Status changed to ${nextStatus}`,
      status: 'SUCCESS'
    });

    return all[idx];
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'pending') {
    await new Promise(r => setTimeout(r, 100));
    const users = mockStore.getUsers();
    const u = users.find(x => x.id === userId);
    if (u) u.status = status;
    await auditService.record({
      action: 'UPDATE_USER_STATUS',
      module: 'USER_DIRECTORY',
      target: u ? u.name : userId,
      newValue: `Status changed to ${status}`,
      status: 'SUCCESS'
    });
    return u;
  },

  async updateUserProfileMaster(
    userId: string,
    updates: Partial<User> & { reason?: string; modifiedFields?: string[] }
  ): Promise<User | undefined> {
    await new Promise(r => setTimeout(r, 120));
    const { reason, modifiedFields, ...userUpdates } = updates;
    const existing = mockStore.getUserById(userId);
    const updated = mockStore.updateUser(userId, userUpdates);

    await auditService.record({
      action: 'USER_PROFILE_MASTER_CORRECTION',
      module: 'USER_DIRECTORY',
      target: updated?.name || existing?.name || userId,
      targetId: userId,
      district: updated?.district || (updated as any)?.districtName || 'Pan-India',
      state: (updated as any)?.state || (updated as any)?.stateName || 'Uttar Pradesh',
      previousValue: existing ? `Status: ${existing.status}, Name: ${existing.name}` : 'N/A',
      newValue: `Fields: ${(modifiedFields || Object.keys(userUpdates)).join(', ')}. Reason: ${reason || 'Master Correction by Super Admin'}`,
      status: 'SUCCESS'
    });

    return updated || undefined;
  },

  async getAllTeachers(): Promise<Teacher[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getTeachers();
  },

  async getAllLibraries(): Promise<Library[]> {
    await new Promise(r => setTimeout(r, 100));
    const raw = mockStore.getLibraries();
    return raw.map((lib, idx) => {
      const defaultBadges = [
        'ISO_27001_PHYSICAL_SECURITY',
        'SILENT_SANCTUARY_ACCREDITED'
      ];
      if (idx % 2 === 0) defaultBadges.push('24_7_ALL_NIGHTER_HUB');
      if (idx % 3 === 0) defaultBadges.push('WOMEN_SAFETY_CERTIFIED');
      if (idx % 2 === 1) defaultBadges.push('OPTICAL_FIBER_VERIFIED');

      const isVerified = (lib.verificationStatus === 'APPROVED' || (lib as any).status === 'active');

      const seededLib: Library = {
        ...lib,
        accreditationBadges: lib.accreditationBadges || defaultBadges,
        iotSensors: lib.iotSensors || {
          decibels: 24 + ((idx * 3) % 8),
          temperatureC: 21.2 + ((idx * 2) % 4) * 0.3,
          wifiPingMs: 8 + (idx % 6),
          powerBackupHealth: 98 + (idx % 3),
          biometricTurnstileOnline: true
        },
        aiSafetyScore: lib.aiSafetyScore || (isVerified ? 99.4 : 94.2),
        sha3AuditSeal: lib.sha3AuditSeal || `0x9F4B${(idx * 7392 + 1042).toString(16).toUpperCase()}88C2E71A`,
        managerContact: lib.managerContact || {
          name: lib.ownerName || 'Branch Facility Director',
          phone: lib.ownerPhone || '9876543210',
          emergencyHotline: '1800-572-FOCUS'
        },
        floorplanConfig: lib.floorplanConfig || {
          rows: 6,
          columns: 10,
          silentPods: 8,
          acZones: 3
        },
        payoutData: lib.payoutData || {
          grossMonthlyRevenue: (lib.totalSeats || 50) * (lib.monthlyFee || 499) * 0.75,
          platformCommission: Math.round(((lib.totalSeats || 50) * (lib.monthlyFee || 499) * 0.75) * 0.10),
          tdsDeducted: Math.round(((lib.totalSeats || 50) * (lib.monthlyFee || 499) * 0.75) * 0.01),
          netPayout: Math.round(((lib.totalSeats || 50) * (lib.monthlyFee || 499) * 0.75) * 0.89),
          lastSettlementDate: '2026-10-01'
        }
      };
      return seededLib;
    });
  },

  async updateLibraryStatus(
    libraryId: string, 
    status: VerificationStatus, 
    remarks?: string,
    auditMeta?: { verifiedBy?: string; verifiedAt?: string; remarks?: string }
  ): Promise<Library | null> {
    await new Promise(r => setTimeout(r, 120));
    const updated = mockStore.updateLibraryStatus(libraryId, status, remarks, auditMeta);
    if (updated) {
      try {
        await auditService.record({
          action: status === 'APPROVED' ? 'LIBRARY_ACCREDITED' : 'LIBRARY_STATUS_CHANGED',
          module: 'LIBRARY_NETWORK',
          target: `${updated.name} (${libraryId})`,
          district: updated.districtName || updated.district || 'Ghazipur',
          state: updated.stateName || (updated as any).state || 'Uttar Pradesh',
          newValue: `Status set to ${status}${remarks ? `. Remarks: ${remarks}` : ''}`,
          status: 'SUCCESS'
        });
      } catch (err) {
        console.warn('Audit log write error:', err);
      }
    }
    return updated;
  },

  /**
   * Awards or toggles holographic accreditation badges for a partner study library
   */
  async awardLibraryAccreditationBadge(libraryId: string, badgeName: string): Promise<Library | null> {
    await new Promise(r => setTimeout(r, 120));
    const all = await this.getAllLibraries();
    const lib = all.find(l => l.id === libraryId);
    if (!lib) return null;

    const currentBadges = Array.isArray(lib.accreditationBadges) ? [...lib.accreditationBadges] : [];
    const index = currentBadges.indexOf(badgeName);
    let updatedBadges: string[];
    let actionType: 'AWARDED' | 'REVOKED';

    if (index >= 0) {
      currentBadges.splice(index, 1);
      updatedBadges = currentBadges;
      actionType = 'REVOKED';
    } else {
      currentBadges.push(badgeName);
      updatedBadges = currentBadges;
      actionType = 'AWARDED';
    }

    const updated = mockStore.updateLibrary(libraryId, { accreditationBadges: updatedBadges });
    if (updated) {
      updated.accreditationBadges = updatedBadges;
    }

    await auditService.record({
      action: 'LIBRARY_BADGE_TOGGLED',
      module: 'LIBRARY_NETWORK',
      target: `${lib.name} (${libraryId})`,
      targetId: libraryId,
      district: lib.districtName || lib.district || 'Ghazipur',
      newValue: `${actionType} accreditation badge: ${badgeName}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * 1-Click Desk Dispatch: Directly reserves / assigns a student seat in a partner study hall
   */
  async dispatchSeatAllocation(libraryId: string, params: {
    studentName: string;
    studentPhone: string;
    shiftName: string;
    seatNumber?: string;
    monthlyFee: number;
    examFocus?: string;
  }): Promise<{ success: boolean; bookingId: string; seatAllocated: string; library: Library }> {
    await new Promise(r => setTimeout(r, 150));
    const lib = mockStore.getLibraryById(libraryId);
    if (!lib) throw new Error(`Library ${libraryId} not found`);

    const bookingId = `BK-DISPATCH-${Date.now().toString().slice(-6)}`;
    const seatAllocated = params.seatNumber || `A-${Math.floor(Math.random() * 20) + 1}`;

    try {
      mockStore.createManualBooking({
        libraryId,
        libraryName: lib.name,
        studentName: params.studentName,
        studentPhone: params.studentPhone,
        seatNumber: seatAllocated,
        shiftName: params.shiftName,
        bookingType: 'DAILY_SEAT',
        amount: params.monthlyFee,
        paymentStatus: 'PAID',
        bookingDate: new Date().toISOString().slice(0, 10),
        status: 'CONFIRMED'
      } as any);
    } catch (e) {
      console.warn('Manual booking addition notice:', e);
      // Fallback manual decrement if createManualBooking encountered issue
      const currentVacant = lib.availableSeats ?? 18;
      mockStore.updateLibrary(libraryId, { availableSeats: Math.max(0, currentVacant - 1) });
    }

    const updated = mockStore.getLibraryById(libraryId) || lib;

    await auditService.record({
      action: 'STUDENT_SEAT_DISPATCHED',
      module: 'LIBRARY_NETWORK',
      target: `${lib.name} // Seat ${seatAllocated}`,
      targetId: bookingId,
      district: lib.districtName || lib.district || 'Ghazipur',
      newValue: `Allocated to ${params.studentName} (${params.studentPhone}) | Shift: ${params.shiftName} | Fee: ₹${params.monthlyFee}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      bookingId,
      seatAllocated,
      library: updated
    };
  },

  /**
   * Runs automated AI facility & life-safety radar telemetry diagnostic scan
   */
  async runAutomatedFacilitySafetyScan(libraryId?: string): Promise<{
    totalNodesAudited: number;
    passedGateCount: number;
    safetyComplianceIndex: number;
    sha3AuditSeal: string;
    timestamp: string;
    diagnostics: {
      fireSafetyNOC: string;
      powerGridFailover: string;
      opticalFiberBroadband: string;
      soundAcousticsIndex: string;
      biometricTurnstiles: string;
    };
  }> {
    await new Promise(r => setTimeout(r, 300));
    const libraries = mockStore.getLibraries();
    const count = libraryId ? 1 : libraries.length;

    const result = {
      totalNodesAudited: count,
      passedGateCount: count,
      safetyComplianceIndex: 99.8,
      sha3AuditSeal: `0xSHA3-${Date.now().toString(16).toUpperCase()}-SAFE-NODE`,
      timestamp: new Date().toISOString(),
      diagnostics: {
        fireSafetyNOC: '100% Certified (Smoke detectors & ABC Extinguishers current)',
        powerGridFailover: 'Dual Silent DG + Inverter active (<5ms cutover)',
        opticalFiberBroadband: '100+ Mbps Pin-Drop Optical Line (Ping: 9ms)',
        soundAcousticsIndex: 'Pin-Drop Sanctuary Benchmark Cleared (26.8 dB Avg)',
        biometricTurnstiles: 'UIDAI / RFID Gate Telemetry Synced with WhatsApp Alerts'
      }
    };

    await auditService.record({
      action: 'RUN_FACILITY_SAFETY_SCAN',
      module: 'LIBRARY_NETWORK',
      target: libraryId ? `Library ${libraryId}` : `Global Network (${count} Nodes)`,
      targetId: 'AI_FACILITY_RADAR',
      district: 'PAN_INDIA',
      newValue: `Compliance Index: 99.8% | Seal: ${result.sha3AuditSeal}`,
      status: 'SUCCESS'
    });

    return result;
  },

  /**
   * Generates official platform revenue escrow settlement voucher
   */
  async generateLibrarySettlementVoucher(libraryId: string, month = 'October 2026'): Promise<{
    voucherId: string;
    libraryId: string;
    libraryName: string;
    ownerName: string;
    period: string;
    grossBookings: number;
    platformCommission: number;
    tdsDeducted: number;
    netPayout: number;
    utrNumber: string;
    escrowStatus: 'SETTLED' | 'ESCROW_PENDING';
    generatedAt: string;
  }> {
    await new Promise(r => setTimeout(r, 120));
    const lib = mockStore.getLibraryById(libraryId) || {
      name: 'FocusPoint Partner Study Hall',
      ownerName: 'Library Partner',
      totalSeats: 50,
      monthlyFee: 499
    };

    const seats = lib.totalSeats || 50;
    const fee = lib.monthlyFee || 499;
    const grossBookings = Math.round(seats * fee * 0.82);
    const platformCommission = Math.round(grossBookings * 0.10);
    const tdsDeducted = Math.round(grossBookings * 0.01);
    const netPayout = grossBookings - platformCommission - tdsDeducted;
    const voucherId = `VCHR-${Date.now().toString().slice(-8)}`;
    const utrNumber = `FPESCROW${Date.now().toString().slice(-10)}`;

    const voucher = {
      voucherId,
      libraryId,
      libraryName: lib.name,
      ownerName: lib.ownerName || 'Study Partner',
      period: month,
      grossBookings,
      platformCommission,
      tdsDeducted,
      netPayout,
      utrNumber,
      escrowStatus: 'SETTLED' as const,
      generatedAt: new Date().toISOString()
    };

    await auditService.record({
      action: 'LIBRARY_SETTLEMENT_VOUCHER_GENERATED',
      module: 'LIBRARY_NETWORK',
      target: `${lib.name} (${libraryId})`,
      targetId: voucherId,
      district: (lib as any).districtName || (lib as any).district || 'Ghazipur',
      newValue: `Gross: ₹${grossBookings} | Net Disbursed: ₹${netPayout} | UTR: ${utrNumber}`,
      status: 'SUCCESS'
    });

    return voucher;
  },

  /**
   * Onboards a new partner study library directly with immediate node activation
   */
  async onboardPartnerLibrary(params: Partial<Library>): Promise<Library> {
    await new Promise(r => setTimeout(r, 200));
    const id = params.id || `lib-node-${Date.now().toString().slice(-6)}`;
    const total = params.totalSeats || 60;

    const newLib: Library = {
      id,
      name: params.name || 'Universal Modern Study Sanctuary',
      ownerId: params.ownerId || `user-lib-owner-${Date.now().toString().slice(-4)}`,
      ownerName: params.ownerName || 'Authorized Partner',
      ownerPhone: params.ownerPhone || '9876543210',
      ownerEmail: params.ownerEmail || 'partner.library@focuspoint.internal',
      description: params.description || 'Modern high-tech self-study library with dual-band optical fiber, silent air conditioning, and ergonomic seating.',
      district: params.district || 'Ghazipur',
      districtName: params.districtName || params.district || 'Ghazipur',
      state: params.state || 'Uttar Pradesh',
      stateName: params.stateName || params.state || 'Uttar Pradesh',
      area: params.area || 'Collectorate Road',
      address: params.address || 'Civil Lines, Near Collectorate Complex',
      pincode: params.pincode || '233001',
      totalSeats: total,
      availableSeats: params.availableSeats ?? Math.round(total * 0.4),
      monthlyFee: params.monthlyFee || 499,
      monthlyStartingPrice: params.monthlyStartingPrice || params.monthlyFee || 499,
      hourlyRate: params.hourlyRate || 30,
      verificationStatus: params.verificationStatus || 'APPROVED',
      status: 'active',
      facilities: params.facilities || [
        'Dual-Band Wi-Fi (100+ Mbps)',
        'Full Power Backup Inverter/DG',
        'CCTV Surveillance with 30-Day Backup',
        'Ergonomic Posture Cushion Chairs',
        'Air Conditioning & Climate Control',
        'RO Purified Hot/Cold Drinking Water'
      ],
      shifts: params.shifts || [
        { id: 'shift-1', name: 'Morning Shift (06:00 AM - 12:00 PM)', startTime: '06:00', endTime: '12:00', price: 299 },
        { id: 'shift-2', name: 'Afternoon Shift (12:00 PM - 06:00 PM)', startTime: '12:00', endTime: '18:00', price: 299 },
        { id: 'shift-3', name: 'Night Owl Shift (06:00 PM - 12:00 AM)', startTime: '18:00', endTime: '00:00', price: 349 },
        { id: 'shift-4', name: '24/7 All-Day Access Pass', startTime: '00:00', endTime: '23:59', price: 599 }
      ],
      accreditationBadges: params.accreditationBadges || [
        'ISO_27001_PHYSICAL_SECURITY',
        'SILENT_SANCTUARY_ACCREDITED',
        'WOMEN_SAFETY_CERTIFIED'
      ],
      iotSensors: {
        decibels: 25.4,
        temperatureC: 21.0,
        wifiPingMs: 9,
        powerBackupHealth: 100,
        biometricTurnstileOnline: true
      },
      aiSafetyScore: 99.6,
      sha3AuditSeal: `0xSHA3-${Date.now().toString(16).toUpperCase()}-ACCREDITED`,
      createdAt: new Date().toISOString()
    };

    mockStore.addLibrary(newLib);

    await auditService.record({
      action: 'PARTNER_LIBRARY_ONBOARDED',
      module: 'LIBRARY_NETWORK',
      target: `${newLib.name} (${newLib.id})`,
      targetId: newLib.id,
      district: newLib.districtName || newLib.district || 'Ghazipur',
      newValue: `Created partner study facility with ${newLib.totalSeats} seats. Status: ${newLib.verificationStatus}`,
      status: 'SUCCESS'
    });

    return newLib;
  },

  /**
   * Retrieves all Pan-India Unified Bookings combining Home Tuition 1-on-1 allotments
   * and Self-Study Library Desk reservations with real-time audit persistence.
   */
  async getPanIndiaUnifiedBookings(): Promise<UnifiedBookingRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    try {
      const cached = safeStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached unified bookings', e);
    }

    const rawLibraryBookings = mockStore.getBookings();
    const rawTutorRequests = mockStore.getTutorRequests();
    const allUsers = mockStore.getUsers();
    const allTeachers = mockStore.getTeachers();
    const allLibraries = mockStore.getLibraries();

    const userMap = new Map<string, any>();
    allUsers.forEach(u => {
      userMap.set(u.id, u);
      if (u.name) userMap.set(u.name.toLowerCase(), u);
    });

    const teacherMap = new Map<string, any>();
    allTeachers.forEach(t => {
      teacherMap.set(t.id, t);
      if (t.name) teacherMap.set(t.name.toLowerCase(), t);
    });

    const libraryMap = new Map<string, any>();
    allLibraries.forEach(l => {
      libraryMap.set(l.id, l);
      if (l.name) libraryMap.set(l.name.toLowerCase(), l);
    });

    const unified: UnifiedBookingRecord[] = [];

    // 1. Process Home Tuition Allotments & Bookings
    rawTutorRequests.forEach((req, idx) => {
      const studentUser = userMap.get(req.studentId) || userMap.get(req.studentName?.toLowerCase());
      const teacher = teacherMap.get(req.allottedTeacherId || req.assignedTeacherId || '') || 
                     teacherMap.get(req.allottedTeacherName?.toLowerCase() || '') ||
                     allTeachers[idx % (allTeachers.length || 1)];

      const isPaid = req.paymentStatus === 'PAID' || idx % 3 !== 1;
      const monthlyAmount = req.budgetMonthly || req.budgetMax || 4500;
      const paidAmount = isPaid ? monthlyAmount : Math.round(monthlyAmount * 0.4);
      const dueAmount = monthlyAmount - paidAmount;
      const platformCutPercent = 10;
      const platformCutAmount = Math.round(monthlyAmount * 0.1);

      const statusMap: Record<string, UnifiedBookingStatus> = {
        ALLOCATED: 'ACTIVE',
        ALLOTED: 'ACTIVE',
        COMPLETED: 'COMPLETED',
        PENDING: 'PENDING',
        CANCELLED: 'CANCELLED',
        REJECTED: 'CANCELLED',
      };
      const status: UnifiedBookingStatus = (statusMap[req.status] || (req.allottedTeacherId ? 'ACTIVE' : 'PENDING'));

      unified.push({
        id: req.id,
        refNumber: `FP-HTB-${req.id.replace('req-', '').toUpperCase().padStart(4, '0')}`,
        serviceType: 'HOME_TUITION',
        studentId: req.studentId || `std-ht-${idx + 1}`,
        studentName: req.studentName || 'Student Learner',
        studentMobile: req.studentMobile || req.studentPhone || studentUser?.phone || studentUser?.mobile || '9876543210',
        studentEmail: studentUser?.email || `${(req.studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@focuspoint.internal`,
        studentAvatar: studentUser?.avatarUrl || studentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        grade: req.className || req.grade || 'Class 10 CBSE',
        guardianName: studentUser?.parentName || 'Parent / Guardian',
        guardianPhone: studentUser?.parentPhone || req.studentPhone || '9876543210',
        district: req.districtName || req.district || 'Varanasi',
        state: req.stateName || 'Uttar Pradesh',
        locality: req.localityName || req.area || 'Lanka Educational Hub',
        pincode: req.pincode || '221005',
        subject: Array.isArray(req.subjects) ? req.subjects.join(', ') : (req.subjects || 'Mathematics & Physics'),
        subjects: Array.isArray(req.subjects) ? req.subjects : ['Mathematics', 'Science'],
        teacherId: teacher?.id || req.allottedTeacherId || 'tch-01',
        teacherName: teacher?.name || req.allottedTeacherName || 'Dr. Alok Verma',
        teacherAvatar: teacher?.avatarUrl || teacher?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        teacherPhone: teacher?.phone || teacher?.mobile || '+91 94150 12345',
        teacherExperience: teacher?.experienceYears ? `${teacher.experienceYears}+ Years` : '7+ Years Academic Exp',
        teachingMode: req.demoMode || 'HOME_VISIT',
        sessionRate: Math.round(monthlyAmount / 12),
        monthlyAmount,
        paidAmount,
        dueAmount,
        platformCutPercent,
        platformCutAmount,
        startDate: req.allotmentDate || req.submittedAt?.split('T')[0] || '2026-08-01',
        endDate: '2026-12-31',
        status,
        paymentStatus: isPaid ? 'PAID' : (dueAmount === monthlyAmount ? 'PENDING' : 'PARTIAL'),
        paymentMethod: req.paymentMethod || 'UPI Autopay (Razorpay)',
        reassignmentCount: 0,
        createdDate: req.submittedAt || '2026-08-01T10:00:00Z',
        updatedDate: new Date().toISOString(),
        notes: req.additionalNotes || '1-on-1 personalized home tutoring curriculum aligned with Board syllabus.'
      });
    });

    // 2. Process Library Desk Bookings & Passes
    rawLibraryBookings.forEach((b, idx) => {
      const studentUser = userMap.get(b.studentId || b.userId || '') || userMap.get(b.studentName?.toLowerCase());
      const library = libraryMap.get(b.libraryId) || allLibraries[idx % (allLibraries.length || 1)];

      const isPaid = b.paymentStatus === 'PAID' || b.paymentStatus === 'paid' || idx % 4 !== 2;
      const monthlyAmount = Number(b.totalAmount || b.amount || 800);
      const paidAmount = isPaid ? monthlyAmount : Math.round(monthlyAmount * 0.5);
      const dueAmount = monthlyAmount - paidAmount;
      const platformCutPercent = 5;
      const platformCutAmount = b.platformCut !== undefined ? b.platformCut : Math.round(monthlyAmount * 0.05);

      const statusMap: Record<string, UnifiedBookingStatus> = {
        CONFIRMED: 'ACTIVE',
        ACTIVE: 'ACTIVE',
        active: 'ACTIVE',
        completed: 'COMPLETED',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
        cancelled: 'CANCELLED',
        PAUSED: 'PAUSED',
        paused: 'PAUSED',
      };
      const status: UnifiedBookingStatus = statusMap[b.status] || 'ACTIVE';

      unified.push({
        id: b.id,
        refNumber: `FP-LIB-${b.id.replace('bk-', '').toUpperCase().padStart(4, '0')}`,
        serviceType: 'LIBRARY',
        studentId: b.studentId || b.userId || `std-lib-${idx + 1}`,
        studentName: b.studentName || 'Study Enthusiast',
        studentMobile: b.studentMobile || b.studentPhone || studentUser?.phone || studentUser?.mobile || '9876543210',
        studentEmail: studentUser?.email || `${(b.studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@focuspoint.internal`,
        studentAvatar: b.studentAvatar || studentUser?.avatarUrl || studentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        grade: b.rollNumber ? `Aspirant Roll #${b.rollNumber}` : 'Competitive Exam Aspirant',
        guardianName: b.guardianName || studentUser?.parentName || 'Self / Guardian',
        guardianPhone: studentUser?.parentPhone || b.studentPhone || '9876543210',
        district: b.district || library?.district || 'Varanasi',
        state: library?.state || 'Uttar Pradesh',
        locality: library?.area || 'Sigra Educational Corridor',
        pincode: library?.pincode || '221002',
        libraryId: library?.id || b.libraryId || 'lib-01',
        libraryName: library?.name || b.libraryName || 'Varanasi Central Self-Study Library',
        libraryAddress: library?.address || 'Sigra Main Road, Near Central Library, Varanasi',
        seatNumber: b.seatNumber || `Desk-${String.fromCharCode(65 + (idx % 6))}-${(idx % 20) + 1}`,
        shift: b.shift || b.shiftName || 'Morning Shift (06:00 AM - 02:00 PM)',
        shiftTiming: '06:00 AM - 02:00 PM',
        qrPassId: `QR-LIB-${b.id.slice(-6).toUpperCase()}`,
        qrPassActive: status === 'ACTIVE',
        monthlyAmount,
        paidAmount,
        dueAmount,
        platformCutPercent,
        platformCutAmount,
        startDate: b.startDate || '2026-08-15',
        endDate: b.endDate || '2026-11-15',
        status,
        paymentStatus: isPaid ? 'PAID' : (dueAmount === monthlyAmount ? 'PENDING' : 'PARTIAL'),
        paymentMethod: b.paymentMethod || 'UPI QR Instant',
        reassignmentCount: 0,
        createdDate: b.bookingDate || '2026-08-15T08:30:00Z',
        updatedDate: new Date().toISOString(),
        notes: `Reserved ergonomic self-study workstation with individual AC air-duct & high-speed optic fiber connectivity.`
      });
    });

    safeStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(unified));
    return unified;
  },

  async getAllBookings(): Promise<any[]> {
    return this.getPanIndiaUnifiedBookings();
  },

  /**
   * Reassigns Home Tutor with mandatory administrative audit log
   */
  async reassignHomeTutor(bookingId: string, newTeacherId: string, newTeacherName: string, reason: string, adminName: string = 'Mukesh Sonkar (Super Admin)'): Promise<UnifiedBookingRecord> {
    await new Promise(r => setTimeout(r, 90));
    const all = await this.getPanIndiaUnifiedBookings();
    const targetIdx = all.findIndex(b => b.id === bookingId);
    if (targetIdx === -1) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const current = all[targetIdx];
    const previousTeacher = current.teacherName || 'Unassigned';
    const updated: UnifiedBookingRecord = {
      ...current,
      teacherId: newTeacherId,
      teacherName: newTeacherName,
      reassignmentCount: (current.reassignmentCount || 0) + 1,
      lastReassignedAt: new Date().toISOString(),
      lastReassignedReason: reason,
      updatedDate: new Date().toISOString()
    };

    all[targetIdx] = updated;
    safeStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(all));

    await auditService.record({
      action: 'REASSIGN_HOME_TUTOR',
      module: 'BOOKINGS_ALLOTMENTS',
      target: `Home Tuition Allotment ${updated.refNumber} (${updated.studentName})`,
      targetId: updated.id,
      district: updated.district,
      state: updated.state,
      actorName: adminName,
      previousValue: `Educator: ${previousTeacher}`,
      newValue: `Reassigned To: ${newTeacherName} | Justification: ${reason}`,
      severity: 'WARNING',
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Reallocates Library Desk / Shift with mandatory administrative audit log
   */
  async reallocateLibraryDesk(bookingId: string, newSeatNumber: string, newShift: string, reason: string, adminName: string = 'Mukesh Sonkar (Super Admin)'): Promise<UnifiedBookingRecord> {
    await new Promise(r => setTimeout(r, 90));
    const all = await this.getPanIndiaUnifiedBookings();
    const targetIdx = all.findIndex(b => b.id === bookingId);
    if (targetIdx === -1) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const current = all[targetIdx];
    const prevAllocation = `${current.seatNumber || 'N/A'} (${current.shift || 'N/A'})`;
    const updated: UnifiedBookingRecord = {
      ...current,
      seatNumber: newSeatNumber,
      shift: newShift,
      updatedDate: new Date().toISOString(),
      notes: `${current.notes || ''} [Desk Reallocated: ${newSeatNumber} / ${newShift}]`
    };

    all[targetIdx] = updated;
    safeStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(all));

    await auditService.record({
      action: 'REALLOCATE_LIBRARY_DESK',
      module: 'BOOKINGS_ALLOTMENTS',
      target: `Library Reservation ${updated.refNumber} (${updated.studentName} @ ${updated.libraryName})`,
      targetId: updated.id,
      district: updated.district,
      state: updated.state,
      actorName: adminName,
      previousValue: `Allocation: ${prevAllocation}`,
      newValue: `New Allocation: Desk ${newSeatNumber} (${newShift}) | Justification: ${reason}`,
      severity: 'INFO',
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Toggles or updates Booking Status with mandatory administrative audit trace
   */
  async updateBookingStatus(bookingId: string, newStatus: UnifiedBookingStatus, reason: string, adminName: string = 'Mukesh Sonkar (Super Admin)'): Promise<UnifiedBookingRecord> {
    await new Promise(r => setTimeout(r, 90));
    const all = await this.getPanIndiaUnifiedBookings();
    const targetIdx = all.findIndex(b => b.id === bookingId);
    if (targetIdx === -1) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const current = all[targetIdx];
    const prevStatus = current.status;
    const updated: UnifiedBookingRecord = {
      ...current,
      status: newStatus,
      qrPassActive: newStatus === 'ACTIVE',
      updatedDate: new Date().toISOString()
    };

    all[targetIdx] = updated;
    safeStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(all));

    await auditService.record({
      action: 'UPDATE_BOOKING_STATUS',
      module: 'BOOKINGS_ALLOTMENTS',
      target: `Booking ${updated.refNumber} (${updated.studentName})`,
      targetId: updated.id,
      district: updated.district,
      state: updated.state,
      actorName: adminName,
      previousValue: `Status: ${prevStatus}`,
      newValue: `Status: ${newStatus} | Reason: ${reason}`,
      severity: newStatus === 'SUSPENDED' || newStatus === 'CANCELLED' ? 'CRITICAL' : 'INFO',
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Computes reactive 8-KPI Sovereign Metric Decks for Bookings Command Deck
   */
  calculateBookingsKPIs(bookings: UnifiedBookingRecord[]): BookingsCockpitKPIs {
    const totalAllotments = bookings.length;
    const activeTuitions = bookings.filter(b => b.serviceType === 'HOME_TUITION' && b.status === 'ACTIVE').length;
    const activeLibraryDesks = bookings.filter(b => b.serviceType === 'LIBRARY' && b.status === 'ACTIVE').length;
    const totalGrossValue = bookings.reduce((sum, b) => sum + (b.monthlyAmount || 0), 0);
    const totalTuitions = bookings.filter(b => b.serviceType === 'HOME_TUITION').length;
    const tutorDeploymentRate = totalTuitions > 0 ? Math.round((activeTuitions / totalTuitions) * 100) : 92;
    const qrPassesActive = bookings.filter(b => b.qrPassActive).length;
    const pendingReassignments = bookings.filter(b => b.status === 'PENDING').length;
    const averageMonthlyTicket = totalAllotments > 0 ? Math.round(totalGrossValue / totalAllotments) : 2850;

    return {
      totalAllotments,
      activeTuitions,
      activeLibraryDesks,
      totalGrossValue,
      tutorDeploymentRate,
      qrPassesActive,
      pendingReassignments,
      averageMonthlyTicket
    };
  },

  async getAuditLogs(districtId?: string): Promise<AuditLog[]> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.getAuditLogs(districtId);
  },

  /**
   * Retrieves all Pan-India Self-Study Library Students with real-time telemetry and state persistence
   */
  async getPanIndiaLibraryStudents(): Promise<LibraryStudentRecord[]> {
    await new Promise(r => setTimeout(r, 80));
    try {
      const cached = safeStorage.getItem(LIBRARY_STUDENTS_STORAGE_KEY);
      if (cached) {
        const parsed: LibraryStudentRecord[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached library students', e);
    }

    const rawStudents = mockStore.getLibraryStudents();
    const manualBookings = mockStore.getManualBookings('Ghazipur');
    const libraries = mockStore.getLibraries();

    const libMap = new Map<string, any>();
    libraries.forEach(l => libMap.set(l.id, l));

    const combined: LibraryStudentRecord[] = [];

    // 1. App & Profile Enrolled Library Students
    rawStudents.forEach((s, idx) => {
      const lib = libMap.get(s.libraryId);
      const isDue = idx % 4 === 1;
      const mFee = s.monthlyFee || 499;
      const paid = isDue ? Math.round(mFee * 0.5) : mFee;
      const due = mFee - paid;

      combined.push({
        id: s.id,
        userId: s.userId || s.id,
        name: s.name,
        mobile: s.mobile || '9876543210',
        email: s.userId ? `${s.name.toLowerCase().replace(/\s+/g, '.')}@focuspoint.internal` : 'student.library@focuspoint.internal',
        avatarUrl: s.avatarUrl || s.avatar,
        libraryId: s.libraryId,
        libraryName: lib?.name || 'Premier FocusPoint Study Hub',
        stateName: lib?.stateName || (lib as any)?.state || 'Uttar Pradesh',
        district: lib?.district || 'Ghazipur',
        districtName: lib?.district || 'Ghazipur',
        locality: lib?.locality || lib?.localityId || 'Saidpur',
        localityName: lib?.locality || lib?.localityId || 'Saidpur',
        seatNumber: s.seatNumber || `Desk ${String((idx % 30) + 1).padStart(2, '0')}`,
        shiftName: s.shiftName || 'Morning Shift (07:00 AM - 01:00 PM)',
        shiftTiming: '07:00 AM - 01:00 PM',
        bookingChannel: s.isOnlineUser ? 'APP_ONLINE' : 'COUNTER_MANUAL',
        monthlyFee: mFee,
        paidAmount: paid,
        dueAmount: due,
        feeStatus: due === 0 ? 'PAID' : 'PARTIAL',
        status: 'ACTIVE',
        joiningDate: s.joiningDate || '2026-08-01',
        validUntil: '2026-10-31',
        attendanceRate: s.attendanceRate || 92,
        bookedBy: s.isOnlineUser ? 'Student Self-Service Mobile App' : 'Library Reception Desk',
        targetExam: idx % 3 === 0 ? 'UPSC Civil Services 2027' : idx % 3 === 1 ? 'NEET UG 2027' : 'JEE Advanced / Mains',
        parentPhone: '9876543201',
        paymentMethod: s.isOnlineUser ? 'UPI (Razorpay PG)' : 'CASH COUNTER',
        lastPaymentDate: '2026-09-28',
        lastReceiptNumber: `FP-LIB-REC-2026-${String(8140 + idx).padStart(6, '0')}`
      });
    });

    // 2. Desk Walk-in Counter Cash Bookings
    manualBookings.forEach((m, idx) => {
      if (!combined.some(c => c.name.toLowerCase() === m.studentName.toLowerCase())) {
        const lib = libMap.get(m.libraryId);
        const mFee = m.monthlyFee || 500;
        const due = m.dueAmount || 0;
        const paid = m.paidAmount || (mFee - due);

        combined.push({
          id: m.id,
          userId: m.id,
          name: m.studentName,
          mobile: m.studentPhone || '+91 98765 00000',
          email: `${m.studentName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@offline.desk`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.studentName)}&background=334155&color=94a3b8`,
          libraryId: m.libraryId,
          libraryName: m.libraryName || lib?.name || 'Partner Study Hall Saidpur',
          stateName: lib?.stateName || 'Uttar Pradesh',
          district: lib?.district || 'Ghazipur',
          districtName: lib?.district || 'Ghazipur',
          locality: m.area || lib?.locality || 'Saidpur',
          localityName: m.area || lib?.locality || 'Saidpur',
          seatNumber: m.seatNumber || `Desk ${String((idx % 25) + 5).padStart(2, '0')}`,
          shiftName: m.shiftName || 'Evening Shift (01:00 PM - 07:00 PM)',
          shiftTiming: '01:00 PM - 07:00 PM',
          bookingChannel: 'COUNTER_MANUAL',
          monthlyFee: mFee,
          paidAmount: paid,
          dueAmount: due,
          feeStatus: due > 0 ? 'PARTIAL' : 'PAID',
          status: 'ACTIVE',
          joiningDate: m.startDate || '2026-08-15',
          validUntil: m.endDate || '2026-10-31',
          attendanceRate: 88,
          bookedBy: `Counter Walk-in (${m.bookedByName || 'Library Owner'})`,
          targetExam: 'UPPSC Combined State / Staff Selection Commission',
          parentPhone: '9876543202',
          paymentMethod: 'CASH COUNTER',
          lastPaymentDate: '2026-09-20',
          lastReceiptNumber: `FP-LIB-REC-2026-${String(9200 + idx).padStart(6, '0')}`
        });
      }
    });

    // 3. Multi-Territory Extended Seed Roster (Varanasi, Lucknow, Prayagraj, Patna, Delhi)
    const extendedLearners: LibraryStudentRecord[] = [
      {
        id: 'lib-std-varanasi-01',
        userId: 'usr-lib-varanasi-01',
        name: 'Aditya Srivastava',
        mobile: '9876543110',
        email: 'aditya.srivastava@focuspoint.internal',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        libraryId: 'lib-varanasi-sigra',
        libraryName: 'Kashi Digital Central Library & Research Hall',
        stateName: 'Uttar Pradesh',
        district: 'Varanasi',
        districtName: 'Varanasi',
        locality: 'Sigra',
        localityName: 'Sigra',
        seatNumber: 'Desk 04',
        shiftName: 'Full Day 24x7 Dedicated Seat',
        shiftTiming: '24 Hours Open Access',
        bookingChannel: 'APP_ONLINE',
        monthlyFee: 1200,
        paidAmount: 1200,
        dueAmount: 0,
        feeStatus: 'PAID',
        status: 'ACTIVE',
        joiningDate: '2026-08-01',
        validUntil: '2026-11-30',
        attendanceRate: 97,
        bookedBy: 'Student Self-Service Mobile App',
        targetExam: 'UPSC Civil Services CSE 2027',
        parentPhone: '9876543111',
        paymentMethod: 'UPI (PhonePe QR)',
        lastPaymentDate: '2026-09-30',
        lastReceiptNumber: 'FP-LIB-REC-2026-004812'
      },
      {
        id: 'lib-std-lucknow-02',
        userId: 'usr-lib-lucknow-02',
        name: 'Neha Pandey',
        mobile: '9876543112',
        email: 'neha.pandey@focuspoint.internal',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        libraryId: 'lib-lucknow-hazratganj',
        libraryName: 'Hazratganj Scholars Sanctuary Library',
        stateName: 'Uttar Pradesh',
        district: 'Lucknow',
        districtName: 'Lucknow',
        locality: 'Hazratganj',
        localityName: 'Hazratganj',
        seatNumber: 'Desk 18',
        shiftName: 'Night Owl Slot (06:00 PM - 12:00 AM)',
        shiftTiming: '06:00 PM - 12:00 AM',
        bookingChannel: 'APP_ONLINE',
        monthlyFee: 800,
        paidAmount: 800,
        dueAmount: 0,
        feeStatus: 'PAID',
        status: 'ACTIVE',
        joiningDate: '2026-09-01',
        validUntil: '2026-10-31',
        attendanceRate: 94,
        bookedBy: 'Student Self-Service Mobile App',
        targetExam: 'CA Final Group 2 Exams',
        parentPhone: '9876543113',
        paymentMethod: 'Credit Card (Visa)',
        lastPaymentDate: '2026-09-25',
        lastReceiptNumber: 'FP-LIB-REC-2026-005120'
      },
      {
        id: 'lib-std-patna-03',
        userId: 'usr-lib-patna-03',
        name: 'Vikash Kumar',
        mobile: '9876543114',
        email: 'vikash.kumar@focuspoint.internal',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        libraryId: 'lib-patna-boring-road',
        libraryName: 'Patna Achievers Self-Study Hub',
        stateName: 'Bihar',
        district: 'Patna',
        districtName: 'Patna',
        locality: 'Boring Road',
        localityName: 'Boring Road',
        seatNumber: 'Desk 07',
        shiftName: 'Morning Shift (06:00 AM - 12:00 PM)',
        shiftTiming: '06:00 AM - 12:00 PM',
        bookingChannel: 'COUNTER_MANUAL',
        monthlyFee: 650,
        paidAmount: 350,
        dueAmount: 300,
        feeStatus: 'PARTIAL',
        status: 'ACTIVE',
        joiningDate: '2026-09-05',
        validUntil: '2026-10-31',
        attendanceRate: 91,
        bookedBy: 'Reception Desk Counter',
        targetExam: 'BPSC 71st Combined Competitive Exam',
        parentPhone: '9876543115',
        paymentMethod: 'CASH COUNTER',
        lastPaymentDate: '2026-09-18',
        lastReceiptNumber: 'FP-LIB-REC-2026-006341'
      },
      {
        id: 'lib-std-delhi-04',
        userId: 'usr-lib-delhi-04',
        name: 'Tanvi Malik',
        mobile: '9876543116',
        email: 'tanvi.malik@focuspoint.internal',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        libraryId: 'lib-delhi-mukherjee-nagar',
        libraryName: 'Mukherjee Nagar Apex Study Pavilion',
        stateName: 'Delhi',
        district: 'New Delhi',
        districtName: 'New Delhi',
        locality: 'Mukherjee Nagar',
        localityName: 'Mukherjee Nagar',
        seatNumber: 'Desk 22',
        shiftName: 'Full Day 24x7 Dedicated Seat',
        shiftTiming: '24 Hours Open Access',
        bookingChannel: 'APP_ONLINE',
        monthlyFee: 1500,
        paidAmount: 1500,
        dueAmount: 0,
        feeStatus: 'PAID',
        status: 'ACTIVE',
        joiningDate: '2026-07-15',
        validUntil: '2026-12-31',
        attendanceRate: 99,
        bookedBy: 'Student Self-Service Mobile App',
        targetExam: 'UPSC Civil Services Prelims 2027',
        parentPhone: '9876543117',
        paymentMethod: 'Net Banking (HDFC)',
        lastPaymentDate: '2026-09-29',
        lastReceiptNumber: 'FP-LIB-REC-2026-007890'
      }
    ];

    extendedLearners.forEach(el => {
      if (!combined.some(c => c.name.toLowerCase() === el.name.toLowerCase())) {
        combined.push(el);
      }
    });

    try {
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(combined));
    } catch {}

    return combined;
  },

  /**
   * Reallocates Library Desk / Seat or Shift with audit logging
   */
  async reallocateLibrarySeat(
    studentId: string,
    newSeat: string,
    newShift?: string,
    reason?: string
  ): Promise<LibraryStudentRecord | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaLibraryStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const previous = { ...all[idx] };
    const updated: LibraryStudentRecord = {
      ...previous,
      seatNumber: newSeat,
      shiftName: newShift || previous.shiftName
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'REALLOCATE_LIBRARY_SEAT',
      module: 'LIBRARY_STUDENTS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || updated.district || 'Ghazipur',
      previousValue: `Seat: ${previous.seatNumber}, Shift: ${previous.shiftName}`,
      newValue: `Seat: ${newSeat}, Shift: ${newShift || previous.shiftName}${reason ? `. Reason: ${reason}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Records Library Student Fee Payment and generates official digital receipt
   */
  async recordLibraryStudentFeePayment(
    studentId: string,
    amount: number,
    paymentMethod: string = 'CASH COUNTER',
    transactionRef?: string
  ): Promise<{ student: LibraryStudentRecord; receiptNumber: string } | null> {
    await new Promise(r => setTimeout(r, 120));
    const all = await this.getPanIndiaLibraryStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const previous = all[idx];
    const newPaid = previous.paidAmount + amount;
    const newDue = Math.max(0, previous.dueAmount - amount);
    const receiptNumber = `FP-LIB-REC-2026-${Date.now().toString().slice(-6)}`;

    const updated: LibraryStudentRecord = {
      ...previous,
      paidAmount: newPaid,
      dueAmount: newDue,
      feeStatus: newDue === 0 ? 'PAID' : 'PARTIAL',
      paymentMethod,
      lastPaymentDate: new Date().toISOString().slice(0, 10),
      lastReceiptNumber: receiptNumber
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'RECORD_LIBRARY_FEE_PAYMENT',
      module: 'LIBRARY_STUDENTS_REGISTRY',
      target: `${updated.name} (${receiptNumber})`,
      targetId: updated.id,
      district: updated.districtName || updated.district,
      newValue: `Paid: ₹${amount}, Remaining Due: ₹${newDue}, Method: ${paymentMethod}, Ref: ${transactionRef || 'OFFLINE'}`,
      status: 'SUCCESS'
    });

    return { student: updated, receiptNumber };
  },

  /**
   * Toggles Library Student membership status (ACTIVE, SUSPENDED, EXPIRED, CANCELLED)
   */
  async toggleLibraryStudentStatus(
    studentId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED',
    reason?: string
  ): Promise<LibraryStudentRecord | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaLibraryStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const previous = all[idx];
    const updated: LibraryStudentRecord = {
      ...previous,
      status
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'TOGGLE_LIBRARY_STUDENT_STATUS',
      module: 'LIBRARY_STUDENTS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || updated.district,
      previousValue: `Status: ${previous.status}`,
      newValue: `Status: ${status}${reason ? `. Reason: ${reason}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Master profile correction for Library Student
   */
  async updateLibraryStudentMasterProfile(
    studentId: string,
    updates: Partial<LibraryStudentRecord> & { reason?: string }
  ): Promise<LibraryStudentRecord | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaLibraryStudents();
    const idx = all.findIndex(s => s.id === studentId || s.userId === studentId);
    if (idx === -1) return null;

    const previous = { ...all[idx] };
    const { reason, ...cleanUpdates } = updates;
    const updated: LibraryStudentRecord = {
      ...previous,
      ...cleanUpdates
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'UPDATE_LIBRARY_STUDENT_PROFILE',
      module: 'LIBRARY_STUDENTS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || updated.district,
      previousValue: `Seat: ${previous.seatNumber}, Fee: ₹${previous.monthlyFee}`,
      newValue: `Seat: ${updated.seatNumber}, Fee: ₹${updated.monthlyFee}${reason ? `. Reason: ${reason}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Direct Onboarding of Library Learner into registry
   */
  async onboardLibraryStudentDirect(data: Partial<LibraryStudentRecord>): Promise<LibraryStudentRecord> {
    await new Promise(r => setTimeout(r, 150));
    const all = await this.getPanIndiaLibraryStudents();
    const studentId = data.id || `lib-std-${Date.now().toString().slice(-6)}`;
    const receiptNum = `FP-LIB-REC-2026-${Date.now().toString().slice(-6)}`;
    const fee = data.monthlyFee || 600;
    const paid = data.paidAmount !== undefined ? data.paidAmount : fee;
    const due = Math.max(0, fee - paid);

    const newLearner: LibraryStudentRecord = {
      id: studentId,
      userId: studentId,
      name: data.name || 'New Library Learner',
      mobile: data.mobile || '9876500000',
      email: data.email || `${studentId}@focuspoint.internal`,
      avatarUrl: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Learner')}&background=7c3aed&color=ffffff`,
      libraryId: data.libraryId || 'lib-gzp-saidpur',
      libraryName: data.libraryName || 'Premier FocusPoint Study Hub',
      stateName: data.stateName || 'Uttar Pradesh',
      district: data.district || 'Ghazipur',
      districtName: data.districtName || data.district || 'Ghazipur',
      locality: data.locality || 'Saidpur',
      localityName: data.localityName || data.locality || 'Saidpur',
      seatNumber: data.seatNumber || `Desk ${String((all.length % 30) + 1).padStart(2, '0')}`,
      shiftName: data.shiftName || 'Morning Shift (07:00 AM - 01:00 PM)',
      shiftTiming: data.shiftTiming || '07:00 AM - 01:00 PM',
      bookingChannel: data.bookingChannel || 'COUNTER_MANUAL',
      monthlyFee: fee,
      paidAmount: paid,
      dueAmount: due,
      feeStatus: due === 0 ? 'PAID' : 'PARTIAL',
      status: 'ACTIVE',
      joiningDate: data.joiningDate || new Date().toISOString().slice(0, 10),
      validUntil: data.validUntil || '2026-11-30',
      attendanceRate: 95,
      bookedBy: data.bookedBy || 'Super Admin Master Console',
      targetExam: data.targetExam || 'General Competitive Exams',
      parentPhone: data.parentPhone || '9876500001',
      paymentMethod: data.paymentMethod || 'CASH COUNTER',
      lastPaymentDate: new Date().toISOString().slice(0, 10),
      lastReceiptNumber: receiptNum
    };

    all.unshift(newLearner);
    try {
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'ONBOARD_LIBRARY_STUDENT_DIRECT',
      module: 'LIBRARY_STUDENTS_REGISTRY',
      target: `${newLearner.name} (${newLearner.seatNumber})`,
      targetId: newLearner.id,
      district: newLearner.districtName || newLearner.district,
      newValue: `Facility: ${newLearner.libraryName}, Shift: ${newLearner.shiftName}, Fee: ₹${fee}`,
      status: 'SUCCESS'
    });

    return newLearner;
  },

  async getLeftTeachers(district: string = 'all'): Promise<any[]> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.getLeftTeachers(district);
  },

  // --- 7. Commission Overrides & Offers Management ---
  async getCommissionOverrides(): Promise<CustomCommissionOverride[]> {
    await new Promise(r => setTimeout(r, 80));
    const cached = safeStorage.getItem('fp_super_admin_commission_overrides');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    const defaults: CustomCommissionOverride[] = [
      {
        id: 'COMM-OVR-001',
        service: 'SELF_STUDY_LIBRARY',
        scope: 'LOCALITY',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        defaultCommissionRate: 8,
        customCommissionRate: 5,
        differenceRate: -3,
        effectiveDate: '2026-08-01',
        reason: 'Promotional inaugural tier for Saidpur central study hall cluster',
        status: 'ACTIVE',
        createdAt: '2026-08-01'
      },
      {
        id: 'COMM-OVR-002',
        service: 'HOME_TUITION',
        scope: 'DISTRICT',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        defaultCommissionRate: 10,
        customCommissionRate: 8,
        differenceRate: -2,
        effectiveDate: '2026-08-15',
        reason: 'Early educator onboarding incentive in Varanasi urban blocks',
        status: 'ACTIVE',
        createdAt: '2026-08-15'
      },
      {
        id: 'COMM-OVR-003',
        service: 'HOME_TUITION',
        scope: 'INDIVIDUAL',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        targetEntityId: 'usr-teacher-102',
        targetEntityName: 'Dr. Ramesh Verma',
        defaultCommissionRate: 10,
        customCommissionRate: 6,
        differenceRate: -4,
        effectiveDate: '2026-09-01',
        reason: 'Star Educator senior partner concession',
        status: 'ACTIVE',
        createdAt: '2026-09-01'
      }
    ];
    safeStorage.setItem('fp_super_admin_commission_overrides', JSON.stringify(defaults));
    return defaults;
  },

  async saveCommissionOverride(override: Omit<CustomCommissionOverride, 'id' | 'createdAt'>): Promise<CustomCommissionOverride> {
    await new Promise(r => setTimeout(r, 120));
    const list = await this.getCommissionOverrides();
    const newOverride: CustomCommissionOverride = {
      ...override,
      id: `COMM-OVR-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    list.unshift(newOverride);
    safeStorage.setItem('fp_super_admin_commission_overrides', JSON.stringify(list));

    await auditService.record({
      action: 'POLICY_COMMISSION_OVERRIDE',
      module: 'COMMISSION_ENGINE',
      target: `${newOverride.service} (${newOverride.scope}: ${newOverride.targetEntityName || newOverride.localityName || newOverride.districtName || 'Pan-India'})`,
      district: newOverride.districtName || 'Pan-India',
      state: newOverride.stateName || 'Uttar Pradesh',
      previousValue: `Default ${newOverride.defaultCommissionRate}%`,
      newValue: `Custom ${newOverride.customCommissionRate}%. Reason: ${newOverride.reason}`,
      status: 'SUCCESS'
    });

    return newOverride;
  },

  async toggleCommissionOverrideStatus(id: string): Promise<CustomCommissionOverride | null> {
    const list = await this.getCommissionOverrides();
    const item = list.find(x => x.id === id);
    if (!item) return null;
    item.status = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    safeStorage.setItem('fp_super_admin_commission_overrides', JSON.stringify(list));
    await auditService.record({
      action: 'COMMISSION_OVERRIDE_STATUS_TOGGLE',
      module: 'COMMISSION_ENGINE',
      target: item.id,
      newValue: `Status set to ${item.status}`,
      status: 'SUCCESS'
    });
    return item;
  },

  async deleteCommissionOverride(id: string): Promise<boolean> {
    let list = await this.getCommissionOverrides();
    list = list.filter(x => x.id !== id);
    safeStorage.setItem('fp_super_admin_commission_overrides', JSON.stringify(list));
    await auditService.record({
      action: 'COMMISSION_OVERRIDE_DELETED',
      module: 'COMMISSION_ENGINE',
      target: id,
      newValue: 'DELETED',
      status: 'SUCCESS'
    });
    return true;
  },

  async getSuperAdminOffers(): Promise<SuperAdminOfferDefinition[]> {
    await new Promise(r => setTimeout(r, 80));
    const cached = safeStorage.getItem('fp_super_admin_offers');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    const defaults: SuperAdminOfferDefinition[] = [
      {
        id: 'OFFER-001',
        name: 'Saidpur Grand Launch 30% OFF',
        couponCode: 'SAIDPUR30',
        service: 'SELF_STUDY_LIBRARY',
        scope: 'LOCALITY',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        discountType: 'PERCENTAGE',
        discountValue: 30,
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        usageLimit: 200,
        timesUsed: 42,
        termsAndConditions: ['Valid on first month library subscription', 'Saidpur district branch only'],
        status: 'ACTIVE'
      },
      {
        id: 'OFFER-002',
        name: 'Pan-India Student Fest Flat ₹200',
        couponCode: 'FOCUSFEST',
        service: 'HOME_TUITION',
        scope: 'PAN_INDIA',
        discountType: 'FIXED',
        discountValue: 200,
        startDate: '2026-09-10',
        endDate: '2026-10-15',
        usageLimit: 1000,
        timesUsed: 138,
        termsAndConditions: ['Minimum tuition booking of ₹1500', '1 redemption per student'],
        status: 'ACTIVE'
      }
    ];
    safeStorage.setItem('fp_super_admin_offers', JSON.stringify(defaults));
    return defaults;
  },

  async createSuperAdminOffer(offer: Omit<SuperAdminOfferDefinition, 'id' | 'timesUsed'>): Promise<SuperAdminOfferDefinition> {
    await new Promise(r => setTimeout(r, 120));
    const list = await this.getSuperAdminOffers();
    const newOffer: SuperAdminOfferDefinition = {
      ...offer,
      id: `OFFER-${Date.now().toString().slice(-4)}`,
      timesUsed: 0,
    };
    list.unshift(newOffer);
    safeStorage.setItem('fp_super_admin_offers', JSON.stringify(list));

    await auditService.record({
      action: 'OFFER_CREATED',
      module: 'OFFER_SYSTEM',
      target: `${newOffer.name} (${newOffer.couponCode})`,
      district: newOffer.districtName || 'Pan-India',
      state: newOffer.stateName || 'Uttar Pradesh',
      previousValue: 'None',
      newValue: `${newOffer.discountType === 'PERCENTAGE' ? `${newOffer.discountValue}%` : `₹${newOffer.discountValue}`} OFF (Code: ${newOffer.couponCode})`,
      status: 'SUCCESS'
    });

    return newOffer;
  },

  async toggleOfferStatus(id: string): Promise<SuperAdminOfferDefinition | null> {
    const list = await this.getSuperAdminOffers();
    const item = list.find(x => x.id === id);
    if (!item) return null;
    item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    safeStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    await auditService.record({
      action: 'OFFER_STATUS_TOGGLE',
      module: 'OFFER_SYSTEM',
      target: item.couponCode,
      newValue: `Status set to ${item.status}`,
      status: 'SUCCESS'
    });
    return item;
  },

  async deleteOffer(id: string): Promise<boolean> {
    let list = await this.getSuperAdminOffers();
    list = list.filter(x => x.id !== id);
    safeStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    await auditService.record({
      action: 'OFFER_DELETED',
      module: 'OFFER_SYSTEM',
      target: id,
      newValue: 'DELETED',
      status: 'SUCCESS'
    });
    return true;
  },

  /**
   * Bulk updates commission overrides (e.g. status)
   */
  async bulkUpdateCommissionOverrides(ids: string[], updates: Partial<CustomCommissionOverride>): Promise<number> {
    const list = await this.getCommissionOverrides();
    let updatedCount = 0;
    list.forEach(item => {
      if (ids.includes(item.id)) {
        Object.assign(item, updates);
        updatedCount++;
      }
    });
    safeStorage.setItem('fp_super_admin_commission_overrides', JSON.stringify(list));
    await auditService.record({
      action: 'BULK_COMMISSION_OVERRIDE_UPDATE',
      module: 'COMMISSION_ENGINE',
      target: `${updatedCount} Override Rules`,
      newValue: JSON.stringify(updates),
      status: 'SUCCESS'
    });
    return updatedCount;
  },

  /**
   * Bulk deletes commission overrides
   */
  async bulkDeleteCommissionOverrides(ids: string[]): Promise<number> {
    let list = await this.getCommissionOverrides();
    const originalLength = list.length;
    list = list.filter(item => !ids.includes(item.id));
    const deletedCount = originalLength - list.length;
    safeStorage.setItem('fp_super_admin_commission_overrides', JSON.stringify(list));
    await auditService.record({
      action: 'BULK_COMMISSION_OVERRIDE_DELETE',
      module: 'COMMISSION_ENGINE',
      target: `${deletedCount} Override Rules Deleted`,
      newValue: 'DELETED',
      status: 'SUCCESS'
    });
    return deletedCount;
  },

  /**
   * Bulk updates promotional offers (status)
   */
  async bulkToggleOffers(ids: string[], targetStatus?: 'ACTIVE' | 'INACTIVE'): Promise<number> {
    const list = await this.getSuperAdminOffers();
    let count = 0;
    list.forEach(off => {
      if (ids.includes(off.id)) {
        off.status = targetStatus || (off.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
        count++;
      }
    });
    safeStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    await auditService.record({
      action: 'BULK_OFFER_STATUS_UPDATE',
      module: 'OFFER_SYSTEM',
      target: `${count} Promotional Campaigns`,
      newValue: `Status set to ${targetStatus || 'TOGGLED'}`,
      status: 'SUCCESS'
    });
    return count;
  },

  /**
   * Bulk deletes promotional offers
   */
  async bulkDeleteOffers(ids: string[]): Promise<number> {
    let list = await this.getSuperAdminOffers();
    const originalLength = list.length;
    list = list.filter(off => !ids.includes(off.id));
    const deletedCount = originalLength - list.length;
    safeStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    await auditService.record({
      action: 'BULK_OFFER_DELETE',
      module: 'OFFER_SYSTEM',
      target: `${deletedCount} Campaigns Deleted`,
      newValue: 'DELETED',
      status: 'SUCCESS'
    });
    return deletedCount;
  },

  /**
   * Exports commission overrides into CSV or JSON
   */
  async exportCommissionOverrides(format: 'json' | 'csv', list?: CustomCommissionOverride[]): Promise<string> {
    const items = list || await this.getCommissionOverrides();
    if (format === 'json') {
      return JSON.stringify(items, null, 2);
    }
    const headers = [
      'ID',
      'Service',
      'Scope',
      'Geography/Entity',
      'DefaultRate',
      'CustomRate',
      'DifferenceRate',
      'EffectiveDate',
      'ExpiryDate',
      'Status',
      'AuditReason'
    ];
    const rows = items.map(ov => [
      ov.id,
      ov.service,
      ov.scope,
      `"${(ov.targetEntityName || ov.localityName || ov.districtName || 'Pan-India').replace(/"/g, '""')}"`,
      `${ov.defaultCommissionRate}%`,
      `${ov.customCommissionRate}%`,
      `${ov.differenceRate}%`,
      ov.effectiveDate,
      ov.expiryDate || 'PERPETUAL',
      ov.status,
      `"${(ov.reason || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  /**
   * Exports promotional offers into CSV or JSON
   */
  async exportOffers(format: 'json' | 'csv', list?: SuperAdminOfferDefinition[]): Promise<string> {
    const items = list || await this.getSuperAdminOffers();
    if (format === 'json') {
      return JSON.stringify(items, null, 2);
    }
    const headers = [
      'ID',
      'CampaignName',
      'CouponCode',
      'Service',
      'Scope',
      'TargetGeography',
      'DiscountType',
      'DiscountValue',
      'TimesUsed',
      'UsageLimit',
      'StartDate',
      'EndDate',
      'Status'
    ];
    const rows = items.map(off => [
      off.id,
      `"${(off.name || '').replace(/"/g, '""')}"`,
      off.couponCode,
      off.service,
      off.scope,
      `"${(off.targetEntityName || off.localityName || off.districtName || 'Pan-India').replace(/"/g, '""')}"`,
      off.discountType,
      off.discountType === 'PERCENTAGE' ? `${off.discountValue}%` : `₹${off.discountValue}`,
      off.timesUsed || 0,
      off.usageLimit || 0,
      off.startDate,
      off.endDate,
      off.status
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  /**
   * Deterministic commission resolution across hierarchical inheritance ladder:
   * INDIVIDUAL > LOCALITY > DISTRICT > STATE > PAN_INDIA (Default)
   */
  async resolveCommissionHierarchy(params: {
    service: CommissionService;
    stateName?: string;
    districtName?: string;
    localityName?: string;
    entityId?: string;
    entityName?: string;
  }): Promise<{
    effectiveRate: number;
    defaultRate: number;
    differenceRate: number;
    matchedRule: CustomCommissionOverride | null;
    hierarchyLevel: 'INDIVIDUAL' | 'LOCALITY' | 'DISTRICT' | 'STATE' | 'PAN_INDIA';
    notes: string;
  }> {
    const list = (await this.getCommissionOverrides()).filter(x => x.status === 'ACTIVE' && x.service === params.service);
    const defaultRate = params.service === 'HOME_TUITION' ? 10 : 8;

    // 1. INDIVIDUAL ENTITY (Highest Priority)
    if (params.entityId || params.entityName) {
      const match = list.find(r => 
        r.scope === 'INDIVIDUAL' && 
        ((params.entityId && r.targetEntityId === params.entityId) ||
         (params.entityName && r.targetEntityName && r.targetEntityName.toLowerCase().includes(params.entityName.toLowerCase())))
      );
      if (match) {
        return {
          effectiveRate: match.customCommissionRate,
          defaultRate: match.defaultCommissionRate || defaultRate,
          differenceRate: match.differenceRate,
          matchedRule: match,
          hierarchyLevel: 'INDIVIDUAL',
          notes: `Individual partner override active: ${match.targetEntityName || match.targetEntityId} (${match.reason})`
        };
      }
    }

    // 2. LOCALITY / BLOCK
    if (params.localityName) {
      const match = list.find(r => 
        r.scope === 'LOCALITY' && 
        r.localityName?.toLowerCase().trim() === params.localityName?.toLowerCase().trim() &&
        (!r.districtName || !params.districtName || r.districtName.toLowerCase() === params.districtName.toLowerCase())
      );
      if (match) {
        return {
          effectiveRate: match.customCommissionRate,
          defaultRate: match.defaultCommissionRate || defaultRate,
          differenceRate: match.differenceRate,
          matchedRule: match,
          hierarchyLevel: 'LOCALITY',
          notes: `Locality cluster override active: ${match.localityName} (${match.reason})`
        };
      }
    }

    // 3. DISTRICT
    if (params.districtName) {
      const match = list.find(r => 
        r.scope === 'DISTRICT' && 
        r.districtName?.toLowerCase().trim() === params.districtName?.toLowerCase().trim()
      );
      if (match) {
        return {
          effectiveRate: match.customCommissionRate,
          defaultRate: match.defaultCommissionRate || defaultRate,
          differenceRate: match.differenceRate,
          matchedRule: match,
          hierarchyLevel: 'DISTRICT',
          notes: `District territory override active: ${match.districtName} (${match.reason})`
        };
      }
    }

    // 4. STATE
    if (params.stateName) {
      const match = list.find(r => 
        r.scope === 'STATE' && 
        r.stateName?.toLowerCase().trim() === params.stateName?.toLowerCase().trim()
      );
      if (match) {
        return {
          effectiveRate: match.customCommissionRate,
          defaultRate: match.defaultCommissionRate || defaultRate,
          differenceRate: match.differenceRate,
          matchedRule: match,
          hierarchyLevel: 'STATE',
          notes: `State territory override active: ${match.stateName} (${match.reason})`
        };
      }
    }

    // 5. PAN_INDIA OVERRIDE
    const panIndiaRule = list.find(r => r.scope === 'PAN_INDIA');
    if (panIndiaRule) {
      return {
        effectiveRate: panIndiaRule.customCommissionRate,
        defaultRate: panIndiaRule.defaultCommissionRate || defaultRate,
        differenceRate: panIndiaRule.differenceRate,
        matchedRule: panIndiaRule,
        hierarchyLevel: 'PAN_INDIA',
        notes: `Pan-India general override active (${panIndiaRule.reason})`
      };
    }

    // System Fallback
    return {
      effectiveRate: defaultRate,
      defaultRate,
      differenceRate: 0,
      matchedRule: null,
      hierarchyLevel: 'PAN_INDIA',
      notes: `Standard Pan-India base rate (${defaultRate}%)`
    };
  },

  /**
   * Simulates full financial transaction breakdown with coupon validation and commission calculation
   */
  async simulateCommissionRevenue(params: {
    service: CommissionService;
    amount: number;
    stateName?: string;
    districtName?: string;
    localityName?: string;
    entityId?: string;
    entityName?: string;
    couponCode?: string;
  }): Promise<{
    grossAmount: number;
    discountAmount: number;
    netBaseAmount: number;
    commissionRate: number;
    platformCommissionAmount: number;
    partnerPayoutAmount: number;
    hierarchyLevel: string;
    couponApplied: SuperAdminOfferDefinition | null;
    couponMessage: string;
    breakdownSummary: string;
  }> {
    const { service, amount, stateName, districtName, localityName, entityId, entityName, couponCode } = params;
    const grossAmount = Math.max(0, amount);
    let discountAmount = 0;
    let couponApplied: SuperAdminOfferDefinition | null = null;
    let couponMessage = 'No coupon applied';

    if (couponCode && couponCode.trim()) {
      const allOffers = await this.getSuperAdminOffers();
      const codeNorm = couponCode.trim().toUpperCase();
      const found = allOffers.find(o => o.couponCode === codeNorm && o.status === 'ACTIVE');

      if (!found) {
        couponMessage = `Coupon code "${couponCode}" is invalid or expired`;
      } else if (found.service !== service) {
        couponMessage = `Coupon "${found.couponCode}" is valid only for ${found.service}`;
      } else {
        couponApplied = found;
        if (found.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((grossAmount * found.discountValue) / 100);
        } else {
          discountAmount = Math.min(grossAmount, found.discountValue);
        }
        couponMessage = `Applied ${found.name} (${found.couponCode}) saving ₹${discountAmount}`;
      }
    }

    const netBaseAmount = Math.max(0, grossAmount - discountAmount);
    const resolved = await this.resolveCommissionHierarchy({
      service,
      stateName,
      districtName,
      localityName,
      entityId,
      entityName
    });

    const commissionRate = resolved.effectiveRate;
    const platformCommissionAmount = Math.round((netBaseAmount * commissionRate) / 100);
    const partnerPayoutAmount = Math.max(0, netBaseAmount - platformCommissionAmount);

    return {
      grossAmount,
      discountAmount,
      netBaseAmount,
      commissionRate,
      platformCommissionAmount,
      partnerPayoutAmount,
      hierarchyLevel: resolved.hierarchyLevel,
      couponApplied,
      couponMessage,
      breakdownSummary: `Gross ₹${grossAmount} - Discount ₹${discountAmount} = Net ₹${netBaseAmount} | Platform Take (${commissionRate}%): ₹${platformCommissionAmount} | Partner Payout: ₹${partnerPayoutAmount}`
    };
  },

  // --- 8. Pan-India Teacher & Verified Faculty Enterprise Governance ---
  /**
   * Retrieves all Pan-India verified home tutors & faculty members with operational telemetry
   */
  async getPanIndiaFaculty(): Promise<Teacher[]> {
    await new Promise(r => setTimeout(r, 80));
    try {
      const cached = safeStorage.getItem(TEACHERS_STORAGE_KEY);
      if (cached) {
        const parsed: Teacher[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached pan-india teachers', e);
    }

    const defaultTeachers = mockStore.getTeachers().map((t, idx) => ({
      ...t,
      accreditationBadges: t.accreditationBadges || (
        t.verificationStatus === 'APPROVED'
          ? ['GOLD_STANDARD_EDUCATOR', 'POLICE_VERIFIED_SECURE', idx % 2 === 0 ? 'STEM_OLYMPIAD_MENTOR' : 'NEET_JEE_SPECIALIST']
          : ['PENDING_ACCREDITATION']
      ),
      policeClearanceCode: t.policeClearanceCode || `UP-POL-SEC-2026-${String(7400 + idx).padStart(5, '0')}`,
      biometricToken: t.biometricToken || `BIO-AADHAAR-${String(9100 + idx).padStart(6, '0')}`,
      teachingRadiusKm: t.teachingRadiusKm || (idx % 3 === 0 ? 12 : idx % 3 === 1 ? 8 : 15)
    }));
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(defaultTeachers));
    } catch {}
    return [...defaultTeachers];
  },

  /**
   * Master Profile update for Teacher with audit logging and mockStore sync
   */
  async updateTeacherMasterProfile(
    teacherId: string,
    updates: Partial<Teacher> & { reason?: string }
  ): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaFaculty();
    const idx = all.findIndex(t => t.id === teacherId);
    if (idx === -1) return null;

    const previous = { ...all[idx] };
    const { reason, ...cleanUpdates } = updates;
    const updated: Teacher = {
      ...previous,
      ...cleanUpdates,
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    // Sync with mockStore
    mockStore.updateUser(teacherId, {
      name: updated.name,
      email: updated.email,
      mobile: updated.mobile,
      district: updated.districtName || updated.district,
      districtName: updated.districtName || updated.district,
      state: updated.stateName || updated.state,
      stateName: updated.stateName || updated.state,
      localityName: updated.localityName || (updated as any).locality,
      area: updated.area,
      address: updated.address,
      pincode: updated.pincode,
      isActive: updated.isActive
    });

    await auditService.record({
      action: 'UPDATE_TEACHER_PROFILE',
      module: 'TEACHERS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || updated.district || 'Ghazipur',
      state: updated.stateName || updated.state || 'Uttar Pradesh',
      previousValue: `Fee: ₹${previous.expectedFeeMonthly || 0}, Status: ${previous.verificationStatus}, Active: ${previous.isActive}`,
      newValue: `Fee: ₹${updated.expectedFeeMonthly || 0}, Status: ${updated.verificationStatus}, Active: ${updated.isActive}${reason ? `. Reason: ${reason}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Toggles Teacher account status between ACTIVE and SUSPENDED with mandatory audit logging
   */
  async toggleTeacherStatus(teacherId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaFaculty();
    const idx = all.findIndex(t => t.id === teacherId);
    if (idx === -1) return null;

    const previous = all[idx];
    const updated: Teacher = {
      ...previous,
      isActive: status === 'ACTIVE',
      status: status === 'ACTIVE' ? 'active' : 'suspended',
      accountStatus: status
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    mockStore.updateUser(teacherId, {
      isActive: status === 'ACTIVE',
      status: status === 'ACTIVE' ? 'active' : 'suspended',
      accountStatus: status
    });

    await auditService.record({
      action: 'TOGGLE_TEACHER_STATUS',
      module: 'TEACHERS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || updated.district || 'Ghazipur',
      state: updated.stateName || updated.state || 'Uttar Pradesh',
      previousValue: `Status: ${previous.isActive ? 'ACTIVE' : 'SUSPENDED'}`,
      newValue: `Status: ${status}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Verifies or Rejects Teacher KYC & Academic Credentials with audit logging
   */
  async verifyTeacherCredentials(
    teacherId: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 120));
    const all = await this.getPanIndiaFaculty();
    const idx = all.findIndex(t => t.id === teacherId);
    if (idx === -1) return null;

    const previous = all[idx];
    const updated: Teacher = {
      ...previous,
      verificationStatus: status,
      rejectionReason: status === 'REJECTED' ? (reason || 'Credentials did not satisfy compliance') : undefined
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    mockStore.updateTeacherKYC(teacherId, status, reason, 'Super Administrator');

    await auditService.record({
      action: status === 'APPROVED' ? 'TEACHER_CREDENTIALS_VERIFIED' : 'TEACHER_CREDENTIALS_REJECTED',
      module: 'TEACHERS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || updated.district || 'Ghazipur',
      state: updated.stateName || updated.state || 'Uttar Pradesh',
      previousValue: `Verification: ${previous.verificationStatus}`,
      newValue: `Verification: ${status}${reason ? `. Reason: ${reason}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Direct Super Admin Onboarding of Verified Educator
   */
  async createDirectTeacher(data: Partial<Teacher>): Promise<Teacher> {
    await new Promise(r => setTimeout(r, 150));
    const all = await this.getPanIndiaFaculty();
    const teacherId = data.id || `usr-teacher-${Date.now().toString().slice(-6)}`;
    
    const newEducator: Teacher = {
      id: teacherId,
      name: data.name || 'New Faculty Educator',
      email: data.email || `${teacherId}@focuspoint.internal`,
      mobile: data.mobile || '9876500000',
      role: 'TEACHER',
      districtId: data.districtId || 'dist-gzp',
      districtName: data.districtName || 'Ghazipur',
      stateName: data.stateName || 'Uttar Pradesh',
      city: data.city || data.districtName || 'Ghazipur',
      area: data.area || 'Saidpur',
      address: data.address || 'Civil Lines',
      pincode: data.pincode || '233304',
      avatarUrl: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Faculty')}&background=0284c7&color=ffffff`,
      createdAt: new Date().toISOString(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      verificationStatus: data.verificationStatus || 'APPROVED',
      highestQualification: data.highestQualification || 'M.Sc. Mathematics',
      degree: data.degree || 'Master of Science',
      university: data.university || 'State University',
      passingYear: data.passingYear || 2020,
      experienceYears: data.experienceYears || 5,
      subjects: data.subjects && data.subjects.length > 0 ? data.subjects : ['Mathematics'],
      classes: data.classes && data.classes.length > 0 ? data.classes : ['Class 9', 'Class 10'],
      specializations: data.specializations || ['Foundation Prep', 'Concept Mastery'],
      boards: data.boards || ['CBSE', 'UP Board'],
      teachingMode: data.teachingMode || 'BOTH',
      expectedFeeMonthly: data.expectedFeeMonthly || 3000,
      feeRange: data.feeRange || '₹2,500 - ₹3,500 / month',
      availabilityDays: data.availabilityDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      availabilitySlots: data.availabilitySlots || ['04:00 PM - 06:00 PM'],
      areasServed: data.areasServed || [data.area || 'Saidpur'],
      bio: data.bio || 'Verified professional educator passionate about student academic growth.',
      rating: data.rating || 4.8,
      reviewsCount: data.reviewsCount || 10,
      assignedStudentsCount: data.assignedStudentsCount || 1,
      documentsUploaded: data.documentsUploaded || {
        idProof: 'Aadhaar_Card_Verified.pdf',
        degreeCertificate: 'Master_Degree.pdf'
      }
    };

    all.unshift(newEducator);
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    mockStore.addTeacher(newEducator);

    await auditService.record({
      action: 'ONBOARD_TEACHER_DIRECT',
      module: 'TEACHERS_REGISTRY',
      target: newEducator.name,
      targetId: newEducator.id,
      district: newEducator.districtName,
      state: newEducator.stateName,
      newValue: `Direct Onboard: ${newEducator.highestQualification}, Subjects: ${newEducator.subjects.join(', ')}`,
      status: 'SUCCESS'
    });

    return newEducator;
  },

  /**
   * Generates official Teacher Monthly Salary & Commission Slip
   */
  async generateTeacherSalarySlip(teacherId: string, month: string = 'October 2026'): Promise<{
    slipNumber: string;
    teacherId: string;
    teacherName: string;
    month: string;
    grossTuitionRevenue: number;
    platformCommissionRate: number;
    platformCommissionAmount: number;
    tdsDeduction: number;
    netDisbursedAmount: number;
    assignedStudentsCount: number;
    bankAccountMasked: string;
    utrNumber: string;
    disbursedDate: string;
    status: 'DISBURSED' | 'PROCESSING';
  }> {
    await new Promise(r => setTimeout(r, 120));
    const all = await this.getPanIndiaFaculty();
    const teacher = all.find(t => t.id === teacherId) || all[0];
    
    const count = teacher.assignedStudentsCount || 2;
    const avgFee = teacher.expectedFeeMonthly || 3500;
    const gross = count * avgFee;
    const commRate = 10; // 10% FocusPoint platform fee
    const commAmount = Math.round((gross * commRate) / 100);
    const tds = Math.round(gross * 0.01); // 1% Section 194C
    const net = gross - commAmount - tds;
    const slipNumber = `FP-SAL-2026-${month.slice(0, 3).toUpperCase()}-${(teacher.id || '0000').slice(-4)}`;
    const utr = `UTR${Date.now().toString().slice(-9)}IN`;

    const slip = {
      slipNumber,
      teacherId: teacher.id,
      teacherName: teacher.name,
      month,
      grossTuitionRevenue: gross,
      platformCommissionRate: commRate,
      platformCommissionAmount: commAmount,
      tdsDeduction: tds,
      netDisbursedAmount: net,
      assignedStudentsCount: count,
      bankAccountMasked: teacher.bankAccount?.accountNumber 
        ? `•••• •••• ${teacher.bankAccount.accountNumber.slice(-4)}` 
        : '•••• •••• 9821',
      utrNumber: utr,
      disbursedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'DISBURSED' as const
    };

    await auditService.record({
      action: 'GENERATE_TEACHER_SALARY_SLIP',
      module: 'PAYROLL_SYSTEM',
      target: `${teacher.name} (${slipNumber})`,
      targetId: teacher.id,
      district: teacher.districtName || 'Ghazipur',
      newValue: `Month: ${month}, Gross: ₹${gross}, Net: ₹${net}, UTR: ${utr}`,
      status: 'SUCCESS'
    });

    return slip;
  },

  /**
   * Awards or toggles cryptographic accreditation badges for an educator
   */
  async awardEducatorAccreditationBadge(
    teacherId: string,
    badge: string,
    notes?: string
  ): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 100));
    const all = await this.getPanIndiaFaculty();
    const idx = all.findIndex(t => t.id === teacherId);
    if (idx === -1) return null;

    const teacher = all[idx];
    const currentBadges = Array.isArray(teacher.accreditationBadges) ? [...teacher.accreditationBadges] : [];
    const hasBadge = currentBadges.includes(badge);
    const updatedBadges = hasBadge 
      ? currentBadges.filter(b => b !== badge) 
      : [...currentBadges, badge];

    const updated: Teacher = {
      ...teacher,
      accreditationBadges: updatedBadges
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: hasBadge ? 'REVOKE_EDUCATOR_BADGE' : 'AWARD_EDUCATOR_BADGE',
      module: 'TEACHERS_REGISTRY',
      target: updated.name,
      targetId: updated.id,
      district: updated.districtName || 'Ghazipur',
      newValue: `Badge: ${badge}${hasBadge ? ' (Revoked)' : ' (Awarded)'}${notes ? `. Notes: ${notes}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Dispatches and assigns a tuition student directly to a verified educator
   */
  async assignStudentToEducator(
    teacherId: string,
    studentName: string,
    subject: string,
    monthlyFee?: number,
    notes?: string
  ): Promise<Teacher | null> {
    await new Promise(r => setTimeout(r, 120));
    const all = await this.getPanIndiaFaculty();
    const idx = all.findIndex(t => t.id === teacherId);
    if (idx === -1) return null;

    const teacher = all[idx];
    const newCount = (teacher.assignedStudentsCount || 0) + 1;
    const updated: Teacher = {
      ...teacher,
      assignedStudentsCount: newCount
    };

    all[idx] = updated;
    try {
      safeStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    await auditService.record({
      action: 'ASSIGN_STUDENT_TO_EDUCATOR',
      module: 'TEACHERS_REGISTRY',
      target: `${teacher.name} ➔ ${studentName}`,
      targetId: teacher.id,
      district: teacher.districtName || 'Ghazipur',
      newValue: `Dispatched Student: ${studentName}, Subject: ${subject}, Fee: ₹${monthlyFee || teacher.expectedFeeMonthly || 3500}${notes ? `. Notes: ${notes}` : ''}`,
      status: 'SUCCESS'
    });

    return updated;
  },

  /**
   * Executes AI-Powered Cryptographic Credential & Registry Radar Scan
   */
  async runAutomatedAiCredentialScan(): Promise<{
    totalScanned: number;
    accreditedCount: number;
    flaggedCount: number;
    tamperProofCompliance: number;
    timestamp: string;
    scanHash: string;
  }> {
    await new Promise(r => setTimeout(r, 300));
    const all = await this.getPanIndiaFaculty();
    const accredited = all.filter(t => t.verificationStatus === 'APPROVED').length;
    const flagged = all.filter(t => t.verificationStatus === 'REJECTED' || !t.isActive).length;

    const result = {
      totalScanned: all.length,
      accreditedCount: accredited,
      flaggedCount: flagged,
      tamperProofCompliance: 99.4,
      timestamp: new Date().toISOString(),
      scanHash: `SHA3-512-BIO-${Date.now().toString(16).toUpperCase()}`
    };

    await auditService.record({
      action: 'RUN_AI_CREDENTIAL_SCAN',
      module: 'TEACHERS_REGISTRY',
      target: `Pan-India Faculty (${all.length} educators)`,
      targetId: 'AI_RADAR_SCANNER',
      district: 'ALL',
      newValue: `Accredited: ${accredited}, Flagged: ${flagged}, Compliance: 99.4%, Hash: ${result.scanHash}`,
      status: 'SUCCESS'
    });

    return result;
  }
};
