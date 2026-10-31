import { describe, it, expect, beforeEach } from 'vitest';
import { 
  STUDY_MATERIAL_CLASSES, 
  STUDY_MATERIAL_CATEGORIES, 
  STUDY_MATERIAL_SUBJECTS,
  DEFAULT_MONTHLY_DOWNLOAD_LIMIT 
} from '../frontend/src/constants/studyMaterial.ts';
import { mockStore } from '../frontend/src/mock/store.ts';
import { studyMaterialService } from '../frontend/src/services/studyMaterialService.ts';

describe('FOCUSPOINT Study Material & Paid Content System Suite', () => {
  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  describe('1. Taxonomies and Standardization', () => {
    it('should define classes from Nursery to Class 12 across 5 stages', () => {
      expect(STUDY_MATERIAL_CLASSES.length).toBe(15);
      const classNames = STUDY_MATERIAL_CLASSES.map(c => c.name);
      expect(classNames).toContain('Nursery');
      expect(classNames).toContain('Class 7');
      expect(classNames).toContain('Class 10');
      expect(classNames).toContain('Class 12');
    });

    it('should define all 12 requested content categories', () => {
      expect(STUDY_MATERIAL_CATEGORIES.length).toBe(12);
      const categoryIds = STUDY_MATERIAL_CATEGORIES.map(c => c.id);
      expect(categoryIds).toContain('ACADEMIC');
      expect(categoryIds).toContain('COMPETITIVE_EXAM');
      expect(categoryIds).toContain('GOVERNMENT_EXAM');
      expect(categoryIds).toContain('PRACTICE_SETS');
      expect(categoryIds).toContain('NOTES');
      expect(categoryIds).toContain('QUESTION_BANKS');
      expect(categoryIds).toContain('SAMPLE_PAPERS');
      expect(categoryIds).toContain('PREVIOUS_YEAR_PAPERS');
      expect(categoryIds).toContain('REVISION_MATERIAL');
      expect(categoryIds).toContain('WORKSHEETS');
      expect(categoryIds).toContain('MOCK_TESTS');
    });

    it('should enforce default monthly download quota of 3', () => {
      expect(DEFAULT_MONTHLY_DOWNLOAD_LIMIT).toBe(3);
    });
  });

  describe('2. Class-Wise Access Control', () => {
    it('should allow Class 7 student to access Class 7 study materials', () => {
      const studentClass7 = {
        id: 'std-c7-01',
        name: 'Rahul Verma',
        grade: 'Class 7',
        district: 'Ghazipur'
      };

      const materialC7 = studyMaterialService.getMaterialById('mat-c7-sci-01');
      expect(materialC7).toBeDefined();

      const evaluation = studyMaterialService.evaluateAccess({
        material: materialC7,
        student: studentClass7
      });

      expect(evaluation.classMatch).toBe(true);
      expect(evaluation.isAllowed).toBe(true);
      expect(evaluation.canDownload).toBe(true);
    });

    it('should block Class 7 student from downloading Class 10 or Class 12 material', () => {
      const studentClass7 = {
        id: 'std-c7-01',
        name: 'Rahul Verma',
        grade: 'Class 7',
        district: 'Ghazipur'
      };

      const materialC10 = studyMaterialService.getMaterialById('mat-c10-math-01');
      expect(materialC10).toBeDefined();

      const evaluation = studyMaterialService.evaluateAccess({
        material: materialC10,
        student: studentClass7
      });

      expect(evaluation.classMatch).toBe(false);
      expect(evaluation.isAllowed).toBe(false);
      expect(evaluation.reason).toBe('CLASS_MISMATCH');
      expect(evaluation.canDownload).toBe(false);
    });
  });

  describe('3. Specialized Subject Tutor Unlock', () => {
    it('should block access to specialized module if student has no active tutor for that subject', () => {
      const studentClass11 = {
        id: 'std-c11-01',
        name: 'Priya Singh',
        grade: 'Class 11',
        district: 'Varanasi'
      };

      const kinematicsMod = studyMaterialService.getMaterialById('mat-c11-phy-01');
      expect(kinematicsMod).toBeDefined();
      expect(kinematicsMod.requiresSubjectTutorUnlock).toBe(true);

      const evaluation = studyMaterialService.evaluateAccess({
        material: kinematicsMod,
        student: studentClass11
      });

      expect(evaluation.classMatch).toBe(true);
      expect(evaluation.isSubjectLocked).toBe(true);
      expect(evaluation.isAllowed).toBe(false);
      expect(evaluation.reason).toBe('SUBJECT_LOCK');
    });
  });

  describe('4. Multi-Tier Pricing Hierarchy and Coupons', () => {
    it('should apply District price override over Pan-India base price', () => {
      const ghazipurStudent = {
        id: 'std-gzp-01',
        name: 'Amit Kumar',
        grade: 'Class 10',
        district: 'Ghazipur'
      };

      const c10Math = studyMaterialService.getMaterialById('mat-c10-math-01');
      // Base price is 149, but Ghazipur district override is 99
      const priceInfo = studyMaterialService.resolvePrice(c10Math, ghazipurStudent);
      expect(priceInfo.effectivePrice).toBe(99);
      expect(priceInfo.originalPrice).toBe(149);
    });

    it('should validate and apply percentage and flat promo coupons', () => {
      const student = {
        id: 'std-c10-02',
        name: 'Deepak',
        grade: 'Class 10',
        district: 'Ghazipur'
      };

      // Validate EXAMBOOST50 (Flat ₹50 OFF)
      const resFlat = studyMaterialService.validateCoupon('EXAMBOOST50', 'mat-c10-math-01', student);
      expect(resFlat.valid).toBe(true);
      expect(resFlat.discountAmount).toBe(50);

      // Validate FOCUS20 (20% OFF)
      const resPercent = studyMaterialService.validateCoupon('FOCUS20', 'mat-c10-math-01', student);
      expect(resPercent.valid).toBe(true);
      expect(resPercent.discountAmount).toBe(30); // 20% of 149 = 30
    });

    it('should reject invalid or expired coupon codes', () => {
      const student = { id: 'std-1', grade: 'Class 10' };
      const res = studyMaterialService.validateCoupon('INVALIDCODE99', 'mat-c10-math-01', student);
      expect(res.valid).toBe(false);
      expect(res.discountAmount).toBe(0);
    });
  });

  describe('5. Monthly Download Quota and Metering', () => {
    it('should track monthly quota and decrement remaining downloads', () => {
      const student = {
        id: 'std-quota-test-01',
        name: 'Neha Gupta',
        grade: 'Class 7',
        district: 'Lucknow'
      };

      const initialAllowance = studyMaterialService.getDownloadAllowance(student.id, student.district, student.grade);
      expect(initialAllowance.allowedMonthlyQuota).toBe(3);
      expect(initialAllowance.usedDownloads).toBe(0);
      expect(initialAllowance.remainingDownloads).toBe(3);
      expect(initialAllowance.canDownloadFree).toBe(true);

      // Download a free material
      const res = studyMaterialService.downloadMaterial({
        materialId: 'mat-c7-sci-01',
        student: student
      });

      expect(res.success).toBe(true);
      expect(res.allowance.usedDownloads).toBe(1);
      expect(res.allowance.remainingDownloads).toBe(2);
    });

    it('should block download when monthly limit is reached', () => {
      const student = {
        id: 'std-quota-exhaust-01',
        name: 'Vikas',
        grade: 'Class 7',
        district: 'Lucknow'
      };

      // Perform 3 downloads to exhaust limit
      studyMaterialService.downloadMaterial({ materialId: 'mat-c7-sci-01', student: student });
      studyMaterialService.downloadMaterial({ materialId: 'mat-c7-math-02', student: student });
      studyMaterialService.downloadMaterial({ materialId: 'mat-c7-eng-03', student: student });

      const exhaustedAllowance = studyMaterialService.getDownloadAllowance(student.id);
      expect(exhaustedAllowance.remainingDownloads).toBe(0);
      expect(exhaustedAllowance.canDownloadFree).toBe(false);

      // Attempt 4th download
      const attempt4 = studyMaterialService.downloadMaterial({ materialId: 'mat-c7-sci-01', student: student });
      expect(attempt4.success).toBe(false);
      expect(attempt4.error).toContain('Monthly download quota exhausted');
    });

    it('should not consume monthly free quota for paid purchased materials', () => {
      const student = {
        id: 'std-paid-dl-01',
        name: 'Karan',
        grade: 'Class 10',
        district: 'Ghazipur'
      };

      // Purchase material
      const purchase = studyMaterialService.purchaseMaterial({
        materialId: 'mat-c10-math-01',
        student: student,
        paymentMethod: 'UPI'
      });
      expect(purchase.paymentStatus).toBe('PAID');

      // Free allowance before download
      const allowanceBefore = studyMaterialService.getDownloadAllowance(student.id);
      expect(allowanceBefore.usedDownloads).toBe(0);

      // Download purchased material
      const dlRes = studyMaterialService.downloadMaterial({
        materialId: 'mat-c10-math-01',
        student: student
      });

      expect(dlRes.success).toBe(true);
      expect(dlRes.record.wasPaidDownload).toBe(true);
      expect(dlRes.record.quotaConsumed).toBe(false);

      // Free downloads should still be 0 used!
      const allowanceAfter = studyMaterialService.getDownloadAllowance(student.id);
      expect(allowanceAfter.usedDownloads).toBe(0);
      expect(allowanceAfter.remainingDownloads).toBe(allowanceBefore.allowedMonthlyQuota);
    });
  });

  describe('6. Super Admin & District Admin Capabilities', () => {
    it('should allow Super Admin to save new study material and manage versions', () => {
      const newMat = studyMaterialService.saveMaterial({
        title: 'Class 9 Physics: Motion & Force Full Notes',
        description: 'Comprehensive notes for Class 9 motion',
        targetClass: 'Class 9',
        educationStage: 'SECONDARY',
        category: 'NOTES',
        subject: 'Physics',
        academicSession: '2026-2027 (Current)',
        language: 'English Medium',
        difficultyLevel: 'MEDIUM',
        tags: ['Physics', 'Class 9', 'Motion'],
        fullPdfUrl: '/documents/class9-physics.pdf',
        fileName: 'Class9_Physics_Motion.pdf',
        fileSize: '5.2 MB',
        pageCount: 48,
        currentVersion: 'v1.0',
        isPaid: false,
        basePrice: 0,
        status: 'PUBLISHED'
      });

      expect(newMat.id).toBeDefined();
      expect(studyMaterialService.getMaterialById(newMat.id)).toBeDefined();

      // Upload version 1.1
      const updated = studyMaterialService.uploadNewVersion(newMat.id, {
        fileUrl: '/documents/class9-physics-v11.pdf',
        fileName: 'Class9_Physics_v11.pdf',
        fileSize: '5.5 MB',
        pageCount: 52,
        versionNumber: 'v1.1',
        changeLog: 'Added 20 practice questions',
        uploadedBy: 'Super Admin'
      });

      expect(updated.currentVersion).toBe('v1.1');
      expect(updated.versionHistory.length).toBe(2);
    });

    it('should allow District Admin to customize district download quota', () => {
      studyMaterialService.saveDownloadPolicy({
        level: 'DISTRICT',
        targetId: 'Varanasi',
        targetName: 'Varanasi District Quota Policy',
        monthlyLimit: 7
      });

      const varanasiStudentAllowance = studyMaterialService.getDownloadAllowance(
        'std-vns-99',
        'Varanasi',
        'Class 10'
      );

      expect(varanasiStudentAllowance.allowedMonthlyQuota).toBe(7);
      expect(varanasiStudentAllowance.policySource).toBe('DISTRICT_POLICY');
    });

    it('should allow Super Admin to toggle Tutor Lock on any material and reflect in student access', () => {
      const targetMat = studyMaterialService.getMaterialById('mat-c10-math-01');
      expect(targetMat).toBeDefined();
      expect(targetMat.requiresSubjectTutorUnlock).toBeFalsy();

      // Super Admin enables Tutor Lock
      const lockedMat = studyMaterialService.saveMaterial({
        ...targetMat,
        requiresSubjectTutorUnlock: true
      });
      expect(lockedMat.requiresSubjectTutorUnlock).toBe(true);

      // Student without Math tutor attempts access
      const student = {
        id: 'std-test-lock-01',
        name: 'Test Student',
        grade: 'Class 10',
        district: 'Ghazipur'
      };
      const evalLocked = studyMaterialService.evaluateAccess({
        material: lockedMat,
        student
      });
      expect(evalLocked.isSubjectLocked).toBe(true);
      expect(evalLocked.canDownload).toBe(false);
      expect(evalLocked.reason).toBe('SUBJECT_LOCK');

      // Super Admin removes Tutor Lock
      const unlockedMat = studyMaterialService.saveMaterial({
        ...lockedMat,
        requiresSubjectTutorUnlock: false
      });
      expect(unlockedMat.requiresSubjectTutorUnlock).toBe(false);

      const evalUnlocked = studyMaterialService.evaluateAccess({
        material: unlockedMat,
        student
      });
      expect(evalUnlocked.isSubjectLocked).toBe(false);
      expect(evalUnlocked.requiresPurchase).toBe(true);
      expect(evalUnlocked.reason).toBe('NEEDS_PURCHASE');
    });

    it('should grant access to tutor-locked material when student has active subject tutor allotment', () => {
      const kinematicsMod = studyMaterialService.getMaterialById('mat-c11-phy-01');
      expect(kinematicsMod.requiresSubjectTutorUnlock).toBe(true);

      const studentWithTutor = {
        id: 'std-with-tutor-99',
        name: 'Tutor Student',
        grade: 'Class 11',
        district: 'Varanasi'
      };

      // Add active tutor request with Physics subject
      mockStore.addTutorRequest({
        id: 'req-phy-99',
        studentId: studentWithTutor.id,
        studentName: studentWithTutor.name,
        className: 'Class 11',
        subjects: ['Physics', 'Mathematics'],
        districtId: 'Varanasi',
        districtName: 'Varanasi',
        status: 'TEACHER_ALLOTTED',
        allottedTeacherId: 'tch-01',
        allottedTeacherName: 'Dr. H.C. Verma',
        createdAt: new Date().toISOString()
      });

      const evaluation = studyMaterialService.evaluateAccess({
        material: kinematicsMod,
        student: studentWithTutor
      });

      expect(evaluation.classMatch).toBe(true);
      expect(evaluation.isSubjectLocked).toBe(false);
    });
  });
});
