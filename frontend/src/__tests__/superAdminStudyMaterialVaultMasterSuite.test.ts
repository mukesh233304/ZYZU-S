import { describe, it, expect, beforeEach } from 'vitest';
import { studyMaterialService } from '../services/studyMaterialService';
import { mockStore } from '../mock/store';
import { StudyMaterial, User } from '../types';

describe('FOCUSPOINT — Super Admin Study Material & Paid Vault Master Test Suite', () => {
  const dummyStudent: User = {
    id: 'student-vault-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'STUDENT',
    district: 'Ghazipur',
    grade: 'Class 10',
    createdAt: new Date().toISOString()
  } as any;

  beforeEach(() => {
    // Ensure mock store is initialized and state is ready
  });

  describe('1. Inventory Repository & Multi-Facet Filtering', () => {
    it('retrieves vault study materials and supports multi-facet filtering', () => {
      const allMaterials = studyMaterialService.getMaterials({ status: 'ALL' });
      expect(allMaterials.length).toBeGreaterThan(0);

      const first = allMaterials[0];
      expect(first.id).toBeDefined();
      expect(first.title).toBeDefined();
      expect(first.currentVersion).toBeDefined();
      expect(first.fullPdfUrl).toBeDefined();

      // Filter by category
      const academicList = studyMaterialService.getMaterials({ category: 'ACADEMIC' });
      academicList.forEach(m => {
        expect(m.category).toBe('ACADEMIC');
      });

      // Filter by isPaid
      const paidList = studyMaterialService.getMaterials({ isPaid: true });
      paidList.forEach(m => {
        expect(m.isPaid).toBe(true);
      });

      const freeList = studyMaterialService.getMaterials({ isPaid: false });
      freeList.forEach(m => {
        expect(m.isPaid).toBe(false);
      });
    });

    it('searches study materials by title and subject keyword', () => {
      const all = studyMaterialService.getMaterials({ status: 'ALL' });
      const sample = all[0];
      const keyword = sample.title.split(' ')[0];

      const searchResults = studyMaterialService.getMaterials({ search: keyword });
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(
        searchResults.some(m => 
          m.title.toLowerCase().includes(keyword.toLowerCase()) || 
          m.subject.toLowerCase().includes(keyword.toLowerCase())
        )
      ).toBe(true);
    });
  });

  describe('2. Multi-Tier Commercial Pricing Hierarchy', () => {
    it('resolves free material pricing to zero with FREE tier label', () => {
      const freeMaterial: StudyMaterial = {
        id: 'mat-free-test',
        title: 'NCERT Class 10 Math Formula Sheet',
        description: 'Comprehensive math formula sheet for Class 10 board prep',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Mathematics',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'Hindi + English',
        difficultyLevel: 'MEDIUM',
        tags: ['formulas', 'math'],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 2,
        fullPdfUrl: '/test.pdf',
        fileName: 'formulas.pdf',
        fileSize: '1.2 MB',
        pageCount: 15,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED',
        totalDownloads: 120,
        totalPurchases: 0,
        rating: 4.8,
        reviewCount: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const pricing = studyMaterialService.resolvePrice(freeMaterial, dummyStudent);
      expect(pricing.effectivePrice).toBe(0);
      expect(pricing.tierApplied).toBe('FREE');
    });

    it('resolves district-level subsidized pricing override when available', () => {
      // Create a district override rule in mockStore
      mockStore.saveStudyMaterialPricingRule({
        level: 'DISTRICT',
        targetEntityId: 'ghazipur',
        targetEntityName: 'Ghazipur District Cell',
        price: 29,
        currency: 'INR',
        notes: 'Rural District Subsidized Access',
        isActive: true
      });

      const paidMaterial: StudyMaterial = {
        id: 'mat-paid-test-district',
        title: 'Complete Class 10 Science Blueprint',
        description: 'High-yield Class 10 Science exam blueprint with diagram cheat sheets',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Science',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'English',
        difficultyLevel: 'HARD',
        tags: ['science'],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 3,
        fullPdfUrl: '/test.pdf',
        fileName: 'science.pdf',
        fileSize: '5.2 MB',
        pageCount: 50,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: true,
        basePrice: 199,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED',
        totalDownloads: 45,
        totalPurchases: 10,
        rating: 4.9,
        reviewCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const resolved = studyMaterialService.resolvePrice(paidMaterial, dummyStudent);
      expect(resolved.effectivePrice).toBe(29);
      expect(resolved.tierApplied).toContain('Ghazipur District Cell');
      expect(resolved.discountFromBase).toBe(199 - 29);
    });

    it('resolves personalized student-level pricing override taking precedence over district', () => {
      mockStore.saveStudyMaterialPricingRule({
        level: 'STUDENT',
        targetEntityId: dummyStudent.id,
        targetEntityName: 'Aarav Sharma Special Grant',
        price: 9,
        currency: 'INR',
        notes: 'Scholarship Recipient',
        isActive: true
      });

      const paidMaterial: StudyMaterial = {
        id: 'mat-paid-student-test',
        title: 'Master Physics Revision Capsule',
        description: 'Class 10 Physics numerical revision capsule and derivations',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Science',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'English',
        difficultyLevel: 'HARD',
        tags: ['physics'],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 3,
        fullPdfUrl: '/test.pdf',
        fileName: 'physics.pdf',
        fileSize: '4.2 MB',
        pageCount: 40,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: true,
        basePrice: 149,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED',
        totalDownloads: 20,
        totalPurchases: 5,
        rating: 4.9,
        reviewCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const resolved = studyMaterialService.resolvePrice(paidMaterial, dummyStudent);
      expect(resolved.effectivePrice).toBe(9);
      expect(resolved.tierApplied).toContain('Student Personalized Special');
    });
  });

  describe('3. Promotional Coupon Engine & Concession Calculation', () => {
    it('creates coupon, validates discount and applies correct concession', () => {
      const testCoupon = studyMaterialService.saveOffer({
        title: 'Master 50% Concession',
        code: 'TESTMASTER50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderValue: 50,
        isActive: true,
        stackable: false,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
      });

      expect(testCoupon.id).toBeDefined();
      expect(testCoupon.code).toBe('TESTMASTER50');

      // Validate against a material
      const materials = studyMaterialService.getMaterials({ isPaid: true });
      const testMat = materials[0] || { id: 'mat-001', basePrice: 100 };

      const validation = studyMaterialService.validateCoupon('TESTMASTER50', testMat.id, dummyStudent);
      expect(validation.valid).toBe(true);
      expect(validation.offer?.code).toBe('TESTMASTER50');
      expect(validation.discountAmount).toBeGreaterThan(0);
    });

    it('rejects nonexistent or expired coupons with an informative failure message', () => {
      const res = studyMaterialService.validateCoupon('INVALIDCODE999', 'any-mat-id', dummyStudent);
      expect(res.valid).toBe(false);
      expect(res.discountAmount).toBe(0);
      expect(res.message).toBeDefined();
    });
  });

  describe('4. Class Matching & Access Evaluation', () => {
    it('denies access if student grade does not match target class', () => {
      const studentClass7: User = {
        ...dummyStudent,
        id: 'student-class7-001',
        grade: 'Class 7'
      } as any;

      const class10Material: StudyMaterial = {
        id: 'mat-class10-specific',
        title: 'Class 10 Advanced Trigonometry',
        description: 'Advanced trigonometry proofs and heights and distances exercises',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Mathematics',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'Hindi',
        difficultyLevel: 'HARD',
        tags: [],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 2,
        fullPdfUrl: '/trig.pdf',
        fileName: 'trig.pdf',
        fileSize: '3 MB',
        pageCount: 25,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED',
        totalDownloads: 10,
        totalPurchases: 0,
        rating: 5.0,
        reviewCount: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const evaluation = studyMaterialService.evaluateAccess({
        material: class10Material,
        student: studentClass7
      });

      expect(evaluation.isAllowed).toBe(false);
      expect(evaluation.reason).toBe('CLASS_MISMATCH');
      expect(evaluation.canDownload).toBe(false);
    });

    it('requires home tutor unlock if module requires subject tutor and none is allotted', () => {
      const studentWithoutTutor: User = {
        ...dummyStudent,
        id: 'student-no-tutor-999'
      } as any;

      const tutorLockedMaterial: StudyMaterial = {
        id: 'mat-tutor-locked-test',
        title: 'Class 10 Olympiad Advanced Physics',
        description: 'Olympiad stage-2 physics problem set requiring tutor guidance',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Physics',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'English',
        difficultyLevel: 'EXEMPLAR',
        tags: [],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 3,
        fullPdfUrl: '/olympiad.pdf',
        fileName: 'olympiad.pdf',
        fileSize: '6 MB',
        pageCount: 45,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        requiresSubjectTutorUnlock: true,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED',
        totalDownloads: 5,
        totalPurchases: 0,
        rating: 5.0,
        reviewCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const evaluation = studyMaterialService.evaluateAccess({
        material: tutorLockedMaterial,
        student: studentWithoutTutor
      });

      expect(evaluation.isAllowed).toBe(false);
      expect(evaluation.reason).toBe('SUBJECT_LOCK');
      expect(evaluation.isSubjectLocked).toBe(true);
      expect(evaluation.canDownload).toBe(false);
    });
  });

  describe('5. Purchase Checkout, Quota Metering & DRM Stamping', () => {
    it('executes checkout and grants verified purchase status', () => {
      const paidMaterial = studyMaterialService.saveMaterial({
        title: 'Class 10 Chemistry Complete Formulae & Reaction Maps',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Chemistry',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'Bilingual',
        difficultyLevel: 'MEDIUM',
        tags: ['reactions', 'chemistry'],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 3,
        fullPdfUrl: '/chemistry.pdf',
        fileName: 'chemistry.pdf',
        fileSize: '3.8 MB',
        pageCount: 32,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: true,
        basePrice: 89,
        specialOfferPercentage: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED'
      });

      const purchase = studyMaterialService.purchaseMaterial({
        materialId: paidMaterial.id,
        student: dummyStudent,
        paymentMethod: 'UPI',
        transactionReference: 'TEST-TXN-UPI-998811'
      });

      expect(purchase.id).toBeDefined();
      expect(purchase.studentId).toBe(dummyStudent.id);
      expect(purchase.materialId).toBe(paidMaterial.id);
      expect(purchase.paymentStatus).toBe('PAID');
      expect(purchase.transactionReference).toBe('TEST-TXN-UPI-998811');

      // Now evaluate access: student must have access granted because they purchased
      const evalAfterPurchase = studyMaterialService.evaluateAccess({
        material: paidMaterial,
        student: dummyStudent
      });
      expect(evalAfterPurchase.hasPurchased).toBe(true);
      expect(evalAfterPurchase.canDownload).toBe(true);
    });

    it('records download event and tracks quota correctly', () => {
      const freeMaterial = studyMaterialService.saveMaterial({
        title: 'Class 10 Biology Diagrams & Labels Quick Guide',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Biology',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'English',
        difficultyLevel: 'EASY',
        tags: ['biology'],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 2,
        fullPdfUrl: '/bio.pdf',
        fileName: 'bio.pdf',
        fileSize: '2.1 MB',
        pageCount: 18,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        specialOfferPercentage: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED'
      });

      const downloadRes = studyMaterialService.downloadMaterial({
        materialId: freeMaterial.id,
        student: dummyStudent
      });

      expect(downloadRes.success).toBe(true);
      expect(downloadRes.record).toBeDefined();
      expect(downloadRes.record?.studentId).toBe(dummyStudent.id);
      expect(downloadRes.record?.materialId).toBe(freeMaterial.id);
      expect(downloadRes.allowance).toBeDefined();
    });
  });

  describe('6. Bulk Operations & Export Telemetry', () => {
    it('executes bulk updates across selected material items', () => {
      const mat1 = studyMaterialService.saveMaterial({
        title: 'Bulk Test Material 1',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Math',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'Hindi',
        difficultyLevel: 'MEDIUM',
        tags: [],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 1,
        fullPdfUrl: '/test1.pdf',
        fileName: 'test1.pdf',
        fileSize: '1 MB',
        pageCount: 10,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED'
      });

      const mat2 = studyMaterialService.saveMaterial({
        title: 'Bulk Test Material 2',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Science',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'English',
        difficultyLevel: 'MEDIUM',
        tags: [],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 1,
        fullPdfUrl: '/test2.pdf',
        fileName: 'test2.pdf',
        fileSize: '1 MB',
        pageCount: 10,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED'
      });

      const updatedCount = studyMaterialService.bulkUpdateMaterials([mat1.id, mat2.id], {
        isPaid: true,
        basePrice: 49
      });

      expect(updatedCount).toBe(2);

      const m1Updated = studyMaterialService.getMaterialById(mat1.id);
      const m2Updated = studyMaterialService.getMaterialById(mat2.id);
      expect(m1Updated?.isPaid).toBe(true);
      expect(m1Updated?.basePrice).toBe(49);
      expect(m2Updated?.isPaid).toBe(true);
      expect(m2Updated?.basePrice).toBe(49);
    });

    it('executes bulk delete on specified material items', () => {
      const mat = studyMaterialService.saveMaterial({
        title: 'To Be Deleted Material',
        category: 'ACADEMIC',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Hindi',
        stream: 'General',
        academicSession: '2026-2027',
        language: 'Hindi',
        difficultyLevel: 'EASY',
        tags: [],
        thumbnailUrl: '',
        previewPdfUrl: '',
        previewPageCount: 1,
        fullPdfUrl: '/del.pdf',
        fileName: 'del.pdf',
        fileSize: '1 MB',
        pageCount: 5,
        currentVersion: 'v1.0',
        versionHistory: [],
        isPaid: false,
        basePrice: 0,
        requiresSubjectTutorUnlock: false,
        isFeatured: false,
        isVerified: true,
        verifiedBy: 'Academic Cell',
        status: 'PUBLISHED'
      });

      const deletedCount = studyMaterialService.bulkDeleteMaterials([mat.id]);
      expect(deletedCount).toBe(1);
      const archivedMat = studyMaterialService.getMaterialById(mat.id);
      expect(archivedMat?.status).toBe('ARCHIVED');
      const activeList = studyMaterialService.getMaterials({ status: 'PUBLISHED' });
      expect(activeList.some(m => m.id === mat.id)).toBe(false);
    });

    it('exports study materials inventory into valid JSON and CSV formats', () => {
      const materials = studyMaterialService.getMaterials({ status: 'ALL' });
      
      const jsonExport = studyMaterialService.exportMaterials('json', materials);
      expect(jsonExport).toContain('[');
      const parsed = JSON.parse(jsonExport);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(materials.length);

      const csvExport = studyMaterialService.exportMaterials('csv', materials);
      expect(csvExport).toContain('ID,Title,Category,Class,Subject,Version,IsPaid,BasePrice');
      const lines = csvExport.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('exports purchase transactions into valid JSON and CSV formats', () => {
      const purchases = studyMaterialService.getAllPurchases();

      const jsonExport = studyMaterialService.exportPurchases('json', purchases);
      const parsed = JSON.parse(jsonExport);
      expect(Array.isArray(parsed)).toBe(true);

      const csvExport = studyMaterialService.exportPurchases('csv', purchases);
      expect(csvExport).toContain('PurchaseID,StudentID,StudentName,MaterialID');
      const lines = csvExport.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });
  });
});
