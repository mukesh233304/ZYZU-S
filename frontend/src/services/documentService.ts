// FOCUSPOINT Universal Document, Receipt, ID Card & Credential Service
// Central reusable document engine powering Student, Teacher, Library Owner, District Admin, and Super Admin

import { 
  UniversalIDCardData, 
  UniversalIDRole, 
  LibraryCertificateData, 
  DistrictAdminSalaryPaymentParams, 
  DistrictAdminSalarySlipData, 
  UnifiedFocusPointDocument,
  DocumentFilterOptions,
  DocumentKPISummary,
  DocumentVerificationResult
} from '../types';
import { mockStore } from '../mock/store';

export const documentService = {
  /**
   * Retrieves role-authorized documents with optional multi-criteria filters.
   */
  async getMyDocuments(
    userId: string,
    role: string,
    filters?: DocumentFilterOptions
  ): Promise<UnifiedFocusPointDocument[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getUserDocuments(userId, role, filters);
  },

  /**
   * Retrieves single document by internal ID or public document number.
   */
  async getDocumentById(documentIdOrNumber: string): Promise<UnifiedFocusPointDocument | null> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getDocumentById(documentIdOrNumber);
  },

  /**
   * Retrieves recent documents for home dashboard widgets.
   */
  async getRecentDocuments(
    userId: string,
    role: string,
    limit: number = 4
  ): Promise<UnifiedFocusPointDocument[]> {
    await new Promise(r => setTimeout(r, 50));
    const docs = mockStore.getUserDocuments(userId, role);
    return docs.slice(0, limit);
  },

  /**
   * Computes KPI summary numbers for user dashboard.
   */
  async getDocumentKPISummary(userId: string, role: string): Promise<DocumentKPISummary> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getDocumentKPISummary(userId, role);
  },

  /**
   * Logs a user interaction (VIEWED, DOWNLOADED, PRINTED, SHARED) in the immutable audit trail.
   */
  async recordDocumentAction(
    documentNumber: string,
    action: 'VIEWED' | 'DOWNLOADED' | 'PRINTED' | 'SHARED' | 'VERIFIED',
    userId: string,
    role: string,
    details?: string
  ): Promise<void> {
    mockStore.recordDocumentAudit(documentNumber, action, userId, role, details);
  },

  /**
   * Verifies authenticity of a document by document number or QR payload.
   */
  async verifyDocument(documentNumber: string): Promise<DocumentVerificationResult> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.verifyDocument(documentNumber);
  },

  /**
    * Checks if a user (specifically students) satisfies strict service eligibility to generate an ID card.
    */
  async checkIdCardEligibility(userId: string): Promise<{
    eligible: boolean;
    reason?: string;
    serviceType?: 'HOME_TUITION' | 'LIBRARY' | 'BOTH';
    activeTuitionDetails?: any;
    activeLibraryDetails?: any;
  }> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.checkStudentIdCardEligibility(userId);
  },

  /**
    * Generates or retrieves an ID card for an eligible user.
    */
  async generateIdCard(userId: string): Promise<UnifiedFocusPointDocument> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.generateIdCardDocument(userId);
  },

  /**
   * Checks if an educator qualifies for official Teacher Verification Certificate.
   */
  async checkTeacherCertificateEligibility(teacherId: string) {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.checkTeacherCertificateEligibility(teacherId);
  },

  /**
   * Generates or retrieves official Teacher Verification Certificate.
   */
  async getOrCreateTeacherCertificate(teacherId: string): Promise<UnifiedFocusPointDocument> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.getOrCreateTeacherCertificate(teacherId);
  },

  /**
   * Persists a newly created document or official receipt into the repository.
   */
  async addDocument(doc: UnifiedFocusPointDocument): Promise<UnifiedFocusPointDocument> {
    await new Promise(r => setTimeout(r, 40));
    return mockStore.addUnifiedDocument(doc);
  },

  /**
   * Super Admin operation: Reissue a corrected document while archiving the historical version.
   */
  async reissueDocument(
    documentNumber: string,
    reason: string,
    adminId: string,
    adminName: string
  ): Promise<UnifiedFocusPointDocument> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.reissueDocument(documentNumber, reason, adminId, adminName);
  },

  // =========================================================================
  // BACKWARDS COMPATIBILITY METHODS
  // =========================================================================

  /**
   * Generates Universal ID Card Data for any platform user across all 5 roles.
   */
  async getUniversalIDCard(userId: string): Promise<UniversalIDCardData> {
    await new Promise(r => setTimeout(r, 80));
    const user = mockStore.getUserById(userId);

    const roleMap: Record<string, UniversalIDRole> = {
      STUDENT: 'STUDENT',
      student: 'STUDENT',
      TEACHER: 'TEACHER',
      teacher: 'TEACHER',
      LIBRARY_STUDENT: 'STUDENT',
      library_student: 'STUDENT',
      LIBRARY_OWNER: 'LIBRARY_OWNER',
      library_owner: 'LIBRARY_OWNER',
      DISTRICT_ADMIN: 'DISTRICT_ADMIN',
      district_admin: 'DISTRICT_ADMIN',
      SUPER_ADMIN: 'SUPER_ADMIN',
      super_admin: 'SUPER_ADMIN',
    };

    const resolvedRole: UniversalIDRole = user ? (roleMap[user.role] || 'STUDENT') : 'SUPER_ADMIN';

    const isSA = resolvedRole === 'SUPER_ADMIN';
    let resolvedAvatar = user?.avatarUrl || (user as any)?.avatar || '';
    if (isSA) {
      try {
        const isDeleted = localStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
        if (isDeleted) {
          resolvedAvatar = '';
        } else {
          const saCached = localStorage.getItem('fp_super_admin_avatar') || localStorage.getItem('fp_superadmin_avatar');
          if (saCached) resolvedAvatar = saCached;
        }
      } catch {}
    }

    return {
      id: user?.id || 'usr-superadmin',
      uniqueIdNumber: `FP-${resolvedRole.substring(0, 3)}-${(user?.id || '999').replace(/\D/g, '').padStart(6, '0') || '100412'}`,
      fullName: user?.name || 'Mukesh Sonkar',
      role: resolvedRole,
      designation: user?.designation || (resolvedRole === 'SUPER_ADMIN' ? 'Chief Platform Architect' : `${resolvedRole} Associate`),
      stateName: user?.stateName || 'Uttar Pradesh',
      districtName: user?.districtName || user?.district || 'Ghazipur',
      localityName: user?.localityName || user?.city || 'Saidpur',
      joiningDate: user?.createdAt ? user.createdAt.substring(0, 10) : '2026-01-15',
      validUntil: '2027-03-31',
      avatarUrl: resolvedAvatar,
      bloodGroup: 'B+ (Verified)',
      emergencyContact: user?.mobile || '+91 99999 99999',
      authorizedSignatureBy: 'FOCUSPOINT Directorate, New Delhi'
    };
  },

  /**
   * Generates Verified & Partnered Certificate Data for an approved library facility.
   */
  async getLibraryCertificate(libraryId: string): Promise<LibraryCertificateData | null> {
    await new Promise(r => setTimeout(r, 80));
    const library = mockStore.getLibraryById(libraryId) || mockStore.getLibraries()[0];
    if (!library) return null;

    return {
      certificateId: `CERT-FP-LIB-${library.id.replace(/\D/g, '') || '90214'}`,
      libraryName: library.name,
      libraryId: library.id,
      ownerName: library.ownerName || 'Verified Study Partner',
      ownerId: library.ownerId || 'usr-owner-01',
      fullAddress: library.address || 'Near Sub-District Hospital, Main Market Road',
      locality: (library as any).locality || library.localityId || 'Saidpur',
      districtName: library.district || 'Ghazipur',
      stateName: 'Uttar Pradesh',
      joiningDate: '2026-02-01',
      issueDate: '2026-02-05',
      validUntil: '2027-02-04',
      isVerified: true,
      isPartnered: true,
      sealsApproved: true,
    };
  },

  /**
   * Generates District Admin Salary Slip
   */
  async generateDistrictAdminSalarySlip(payment: DistrictAdminSalaryPaymentParams): Promise<DistrictAdminSalarySlipData> {
    await new Promise(r => setTimeout(r, 100));
    const net = Number(payment.baseSalary) + Number(payment.adjustments) - Number(payment.deductions);

    return {
      slipId: `SLIP-DA-${Date.now().toString().slice(-6)}`,
      adminName: payment.adminName,
      adminId: payment.adminId,
      districtName: payment.districtName,
      stateName: 'Uttar Pradesh',
      salaryMonth: payment.salaryPeriod,
      baseSalary: Number(payment.baseSalary),
      adjustments: Number(payment.adjustments),
      deductions: Number(payment.deductions),
      netSalary: net,
      paymentDate: payment.paymentDate,
      transactionReference: `SIM-TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'SIMULATION'
    };
  }
};
