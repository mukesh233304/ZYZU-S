// FOCUSPOINT Study Material Service
// Unified orchestrator for Class/Subject Access Evaluation,
// Multi-tier Pricing Hierarchy, Download Quota Metering, and Checkout

import { mockStore } from '../mock/store';
import { 
  StudyMaterial, 
  StudyMaterialAccessEvaluation, 
  StudyMaterialOffer, 
  StudyMaterialPricingRule, 
  StudyMaterialDownloadPolicy,
  StudyMaterialPurchase,
  StudyMaterialDownloadRecord,
  DownloadAllowance,
  User,
  Student
} from '../types';

export const studyMaterialService = {
  /**
   * Retrieves list of study materials with optional filtering
   */
  getMaterials(filters?: {
    class?: string;
    category?: string;
    subject?: string;
    isPaid?: boolean;
    search?: string;
    status?: string;
  }): StudyMaterial[] {
    return mockStore.getStudyMaterials(filters);
  },

  /**
   * Retrieves a single study material by ID
   */
  getMaterialById(id: string): StudyMaterial | undefined {
    return mockStore.getStudyMaterialById(id);
  },

  /**
   * Resolves effective price based on multi-tier hierarchy:
   * 1. Student Override
   * 2. District Override (matching student's district)
   * 3. Base Price with any active special offer percentage
   */
  resolvePrice(material: StudyMaterial, student?: User | Student | null): {
    originalPrice: number;
    effectivePrice: number;
    tierApplied: string;
    discountFromBase: number;
  } {
    const originalPrice = material.basePrice || 0;
    if (!material.isPaid || originalPrice === 0) {
      return { originalPrice: 0, effectivePrice: 0, tierApplied: 'FREE', discountFromBase: 0 };
    }

    const rules = mockStore.getStudyMaterialPricingRules().filter(r => r.isActive);

    // 1. Student Override
    if (student?.id) {
      const studentRule = rules.find(
        r => r.level === 'STUDENT' && r.targetEntityId === student.id && (r.materialId === material.id || !r.materialId)
      );
      if (studentRule) {
        return {
          originalPrice,
          effectivePrice: studentRule.price,
          tierApplied: `Student Personalized Special (₹${studentRule.price})`,
          discountFromBase: Math.max(0, originalPrice - studentRule.price)
        };
      }
    }

    // 2. District Override
    const studentDistrict = (student as any)?.district || (student as any)?.districtName || '';
    if (studentDistrict) {
      const districtRule = rules.find(
        r => r.level === 'DISTRICT' && 
             r.targetEntityId?.toLowerCase() === studentDistrict.toLowerCase() &&
             (r.materialId === material.id || !r.materialId)
      );
      if (districtRule) {
        return {
          originalPrice,
          effectivePrice: districtRule.price,
          tierApplied: `${districtRule.targetEntityName || studentDistrict} District Subsidized (₹${districtRule.price})`,
          discountFromBase: Math.max(0, originalPrice - districtRule.price)
        };
      }
    }

    // 3. Pan-India Base Price with Special Offer (if configured)
    let effectivePrice = originalPrice;
    let tierApplied = 'Pan-India Standard';
    let discountFromBase = 0;

    if (material.specialOfferPercentage && material.specialOfferPercentage > 0) {
      const offVal = Math.round((originalPrice * material.specialOfferPercentage) / 100);
      effectivePrice = Math.max(0, originalPrice - offVal);
      tierApplied = material.specialOfferLabel || `${material.specialOfferPercentage}% Special Discount`;
      discountFromBase = offVal;
    }

    return {
      originalPrice,
      effectivePrice,
      tierApplied,
      discountFromBase
    };
  },

  /**
   * Evaluates student's authorization to access, view preview, or download a study material
   */
  evaluateAccess(params: {
    material: StudyMaterial;
    student: User | Student | null;
  }): StudyMaterialAccessEvaluation {
    const { material, student } = params;

    const studentClass = (student as any)?.grade || (student as any)?.currentClass || '';
    const studentDistrict = (student as any)?.district || (student as any)?.districtName || '';
    const hasPurchased = student?.id ? mockStore.hasStudentPurchased(student.id, material.id) : false;

    // 1. Check Class Match
    let classMatch = true;
    if (student && studentClass && material.targetClass && material.targetClass !== 'All') {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sNorm = normalize(studentClass);
      const mNorm = normalize(material.targetClass);

      // E.g. Class 7 student cannot access Class 10 or Class 12 materials
      classMatch = sNorm === mNorm || sNorm.includes(mNorm) || mNorm.includes(sNorm);
    }

    if (!classMatch) {
      return {
        isAllowed: false,
        reason: 'CLASS_MISMATCH',
        message: `Restricted: This study material is curated strictly for ${material.targetClass}. Your current profile is registered as ${studentClass || 'another class'}.`,
        classMatch: false,
        requiresPurchase: material.isPaid && !hasPurchased,
        isSubjectLocked: false,
        price: material.basePrice,
        originalPrice: material.basePrice,
        discountAmount: 0,
        hasPurchased,
        canDownload: false
      };
    }

    // 2. Check Subject Lock (Specialized Home Tutor requirement)
    let isSubjectLocked = false;
    if (material.requiresSubjectTutorUnlock) {
      if (!hasPurchased) {
        let hasActiveSubjectTutor = false;
        if (student?.id) {
          // Check if student has an active tutor request / assigned teacher for this subject
          const tutorRequests = mockStore.getTutorRequests().filter(
            tr => tr.studentId === student.id && (
              tr.status === 'ACTIVE' || 
              tr.status === 'TEACHER_ALLOTTED' || 
              tr.status === 'active' || 
              tr.status === 'teacher_assigned'
            )
          );
          const assignments = mockStore.getTeacherAssignments().filter(
            a => a.studentId === student.id && (a.status === 'ACTIVE' || (a.status as any) === 'active')
          );

          const matSub = (material.subject || '').toLowerCase().trim();
          const matchesSubject = (sub: string) => {
            const s = (sub || '').toLowerCase().trim();
            if (s === matSub) return true;
            if (s.includes(matSub) || matSub.includes(s)) return true;
            // Common aliases
            if ((matSub === 'mathematics' || matSub === 'maths' || matSub === 'math') && 
                (s === 'mathematics' || s === 'maths' || s === 'math')) return true;
            if ((matSub === 'physics' || matSub === 'chemistry' || matSub === 'biology') && 
                (s === 'science' || s === 'pcm' || s === 'pcb')) return true;
            return false;
          };

          hasActiveSubjectTutor = 
            tutorRequests.some(tr => tr.subjects?.some(matchesSubject)) ||
            assignments.some(a => a.subjects?.some(matchesSubject));
        }

        if (!hasActiveSubjectTutor) {
          isSubjectLocked = true;
          return {
            isAllowed: false,
            reason: 'SUBJECT_LOCK',
            message: `Specialized Access: Enrolled ZYZU'S Home Tutor for ${material.subject} required to unlock this advanced module.`,
            classMatch: true,
            requiresPurchase: material.isPaid && !hasPurchased,
            isSubjectLocked: true,
            price: material.basePrice,
            originalPrice: material.basePrice,
            discountAmount: 0,
            hasPurchased,
            canDownload: false
          };
        }
      }
    }

    // 3. Resolve Pricing
    const priceInfo = this.resolvePrice(material, student);
    const requiresPurchase = material.isPaid && !hasPurchased;

    if (requiresPurchase) {
      return {
        isAllowed: false,
        reason: 'NEEDS_PURCHASE',
        message: `Paid Material: Complete checkout to unlock and download full PDF (${material.pageCount} pages).`,
        classMatch: true,
        requiresPurchase: true,
        isSubjectLocked: false,
        price: priceInfo.effectivePrice,
        originalPrice: priceInfo.originalPrice,
        discountAmount: priceInfo.discountFromBase,
        hasPurchased: false,
        canDownload: false
      };
    }

    // 4. Check Download Quota for Free Downloads
    if (!material.isPaid && !hasPurchased && student?.id) {
      const allowance = mockStore.getStudentDownloadAllowance(student.id, studentDistrict, studentClass);
      if (!allowance.canDownloadFree) {
        return {
          isAllowed: false,
          reason: 'DOWNLOAD_LIMIT_REACHED',
          message: `Monthly download quota exhausted (${allowance.usedDownloads}/${allowance.allowedMonthlyQuota} used). Your limit resets on ${allowance.nextResetDate}.`,
          classMatch: true,
          requiresPurchase: false,
          isSubjectLocked: false,
          price: 0,
          originalPrice: 0,
          discountAmount: 0,
          hasPurchased: false,
          canDownload: false
        };
      }
    }

    // Access granted!
    return {
      isAllowed: true,
      reason: 'OK',
      message: 'Access Granted: You can view and download this study material.',
      classMatch: true,
      requiresPurchase: false,
      isSubjectLocked: false,
      price: priceInfo.effectivePrice,
      originalPrice: priceInfo.originalPrice,
      discountAmount: priceInfo.discountFromBase,
      hasPurchased,
      canDownload: true
    };
  },

  /**
   * Retrieves live download allowance for a student
   */
  getDownloadAllowance(studentId: string, district?: string, currentClass?: string): DownloadAllowance {
    return mockStore.getStudentDownloadAllowance(studentId, district, currentClass);
  },

  /**
   * Validates promotional coupon code for a material
   */
  validateCoupon(
    code: string,
    materialId: string,
    student?: User | Student | null
  ): { valid: boolean; offer?: StudyMaterialOffer; message: string; discountAmount: number } {
    const district = (student as any)?.district || (student as any)?.districtName || '';
    const currentClass = (student as any)?.grade || (student as any)?.currentClass || '';
    return mockStore.validateStudyMaterialCoupon(code, materialId, district, currentClass);
  },

  /**
   * Records a study material purchase and triggers invoice reference
   */
  purchaseMaterial(params: {
    materialId: string;
    student: User | Student;
    couponCode?: string;
    paymentMethod: string;
    transactionReference?: string;
  }): StudyMaterialPurchase {
    const { materialId, student, couponCode, paymentMethod, transactionReference } = params;
    const material = mockStore.getStudyMaterialById(materialId);
    if (!material) {
      throw new Error('Study material not found.');
    }

    const priceInfo = this.resolvePrice(material, student);
    let finalAmount = priceInfo.effectivePrice;
    let couponDiscount = 0;

    if (couponCode) {
      const couponRes = this.validateCoupon(couponCode, materialId, student);
      if (couponRes.valid) {
        couponDiscount = couponRes.discountAmount;
        finalAmount = Math.max(0, finalAmount - couponDiscount);
      }
    }

    const purchase = mockStore.recordStudyMaterialPurchase({
      studentId: student.id,
      studentName: student.name,
      materialId: material.id,
      materialTitle: material.title,
      targetClass: material.targetClass,
      subject: material.subject,
      basePrice: material.basePrice,
      discountAmount: priceInfo.discountFromBase + couponDiscount,
      couponCode: couponCode || undefined,
      finalAmountPaid: finalAmount,
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod || 'UPI',
      transactionReference: transactionReference || `FP-TXN-${Date.now().toString().slice(-8)}`,
      districtId: (student as any)?.districtId || (student as any)?.district || 'ghazipur',
      districtName: (student as any)?.districtName || (student as any)?.district || 'Ghazipur'
    });

    return purchase;
  },

  /**
   * Executes download: checks access, tallies quota, and initiates client-side PDF file stream
   */
  downloadMaterial(params: {
    materialId: string;
    student: User | Student;
  }): {
    success: boolean;
    record?: StudyMaterialDownloadRecord;
    allowance: DownloadAllowance;
    error?: string;
  } {
    const { materialId, student } = params;
    const material = mockStore.getStudyMaterialById(materialId);
    if (!material) {
      return {
        success: false,
        allowance: mockStore.getStudentDownloadAllowance(student.id),
        error: 'Study material not found.'
      };
    }

    const evaluation = this.evaluateAccess({ material, student });
    if (!evaluation.canDownload) {
      return {
        success: false,
        allowance: mockStore.getStudentDownloadAllowance(student.id),
        error: evaluation.message
      };
    }

    const wasPaidDownload = evaluation.hasPurchased;
    const quotaConsumed = !wasPaidDownload; // Free downloads consume monthly quota

    const record = mockStore.recordStudyMaterialDownload({
      studentId: student.id,
      studentName: student.name,
      materialId: material.id,
      materialTitle: material.title,
      targetClass: material.targetClass,
      subject: material.subject,
      fileVersion: material.currentVersion,
      wasPaidDownload,
      quotaConsumed,
      deviceIp: '127.0.0.1'
    });

    // Trigger synthetic download of document in browser context
    if (typeof document !== 'undefined') {
      try {
        const link = document.createElement('a');
        link.href = material.fullPdfUrl || '#';
        link.setAttribute('download', material.fileName || `${material.title}.pdf`);
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.warn('Synthetic anchor click simulation:', e);
      }
    }

    const updatedAllowance = mockStore.getStudentDownloadAllowance(
      student.id,
      (student as any)?.district,
      (student as any)?.grade
    );

    return {
      success: true,
      record,
      allowance: updatedAllowance
    };
  },

  /**
   * Retrieves student's download history
   */
  getStudentDownloadHistory(studentId: string): StudyMaterialDownloadRecord[] {
    return mockStore.getStudentDownloadHistory(studentId);
  },

  /**
   * Retrieves student's purchase list
   */
  getStudentPurchases(studentId: string): StudyMaterialPurchase[] {
    return mockStore.getStudentPurchases(studentId);
  },

  // ==========================================
  // ADMIN & CONFIGURATION METHODS
  // ==========================================

  saveMaterial(materialData: Partial<StudyMaterial>): StudyMaterial {
    return mockStore.saveStudyMaterial(materialData);
  },

  deleteMaterial(id: string): boolean {
    return mockStore.deleteStudyMaterial(id);
  },

  uploadNewVersion(
    materialId: string,
    versionData: {
      fileUrl: string;
      fileName: string;
      fileSize: string;
      pageCount: number;
      versionNumber: string;
      changeLog: string;
      uploadedBy: string;
    }
  ): StudyMaterial | undefined {
    return mockStore.uploadStudyMaterialVersion(materialId, versionData);
  },

  getPricingRules(): StudyMaterialPricingRule[] {
    return mockStore.getStudyMaterialPricingRules();
  },

  savePricingRule(rule: Partial<StudyMaterialPricingRule>): StudyMaterialPricingRule {
    return mockStore.saveStudyMaterialPricingRule(rule);
  },

  deletePricingRule(id: string): boolean {
    return mockStore.deleteStudyMaterialPricingRule(id);
  },

  getOffers(): StudyMaterialOffer[] {
    return mockStore.getStudyMaterialOffers();
  },

  saveOffer(offer: Partial<StudyMaterialOffer>): StudyMaterialOffer {
    return mockStore.saveStudyMaterialOffer(offer);
  },

  deleteOffer(id: string): boolean {
    return mockStore.deleteStudyMaterialOffer(id);
  },

  getDownloadPolicies(): StudyMaterialDownloadPolicy[] {
    return mockStore.getStudyMaterialDownloadPolicies();
  },

  saveDownloadPolicy(policy: Partial<StudyMaterialDownloadPolicy>): StudyMaterialDownloadPolicy {
    return mockStore.saveStudyMaterialDownloadPolicy(policy);
  },

  getAllDownloads(): StudyMaterialDownloadRecord[] {
    return mockStore.getAllDownloadRecords();
  },

  getAllPurchases(): StudyMaterialPurchase[] {
    return mockStore.getAllPurchases();
  },

  /**
   * Aggregates platform-wide analytics for study material module
   */
  getAnalyticsSummary() {
    const materials = mockStore.getStudyMaterials({ status: 'ALL' });
    const downloads = mockStore.getAllDownloadRecords();
    const purchases = mockStore.getAllPurchases();

    const totalMaterials = materials.length;
    const publishedMaterials = materials.filter(m => m.status === 'PUBLISHED').length;
    const paidMaterials = materials.filter(m => m.isPaid).length;
    const freeMaterials = totalMaterials - paidMaterials;
    const totalDownloadsCount = downloads.length;
    const totalPurchasesCount = purchases.length;
    const totalSalesVolume = purchases.reduce((sum, p) => sum + (p.finalAmountPaid || 0), 0);

    return {
      totalMaterials,
      publishedMaterials,
      paidMaterials,
      freeMaterials,
      totalDownloadsCount,
      totalPurchasesCount,
      totalSalesVolume,
      topDownloaded: [...materials].sort((a, b) => b.totalDownloads - a.totalDownloads).slice(0, 5)
    };
  },

  /**
   * Bulk updates multiple study materials
   */
  bulkUpdateMaterials(ids: string[], updates: Partial<StudyMaterial>): number {
    let count = 0;
    ids.forEach(id => {
      const mat = mockStore.getStudyMaterialById(id);
      if (mat) {
        mockStore.saveStudyMaterial({ ...mat, ...updates });
        count++;
      }
    });
    return count;
  },

  /**
   * Bulk deletes / archives multiple study materials
   */
  bulkDeleteMaterials(ids: string[]): number {
    let count = 0;
    ids.forEach(id => {
      if (mockStore.deleteStudyMaterial(id)) {
        count++;
      }
    });
    return count;
  },

  /**
   * Exports study materials in JSON or CSV
   */
  exportMaterials(format: 'json' | 'csv', materials: StudyMaterial[]): string {
    if (format === 'json') {
      return JSON.stringify(materials, null, 2);
    }
    const headers = [
      'ID',
      'Title',
      'Category',
      'Class',
      'Subject',
      'Version',
      'IsPaid',
      'BasePrice',
      'TutorLock',
      'TotalDownloads',
      'TotalPurchases',
      'Status'
    ];
    const rows = materials.map(m => [
      m.id,
      `"${(m.title || '').replace(/"/g, '""')}"`,
      m.category,
      m.targetClass,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      m.currentVersion,
      m.isPaid ? 'PAID' : 'FREE',
      m.basePrice || 0,
      m.requiresSubjectTutorUnlock ? 'YES' : 'NO',
      m.totalDownloads || 0,
      m.totalPurchases || 0,
      m.status
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  /**
   * Exports study material purchases in JSON or CSV
   */
  exportPurchases(format: 'json' | 'csv', purchases: StudyMaterialPurchase[]): string {
    if (format === 'json') {
      return JSON.stringify(purchases, null, 2);
    }
    const headers = [
      'PurchaseID',
      'StudentID',
      'StudentName',
      'MaterialID',
      'MaterialTitle',
      'AmountPaid',
      'PaymentMethod',
      'Status',
      'TransactionRef',
      'Date'
    ];
    const rows = purchases.map(p => [
      p.id,
      p.studentId,
      `"${(p.studentName || '').replace(/"/g, '""')}"`,
      p.materialId,
      `"${(p.materialTitle || '').replace(/"/g, '""')}"`,
      p.finalAmountPaid,
      p.paymentMethod,
      p.paymentStatus,
      p.transactionReference,
      p.purchaseDate
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
