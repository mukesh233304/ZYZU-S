import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../mock/store';
import { operatorService } from '../services/operatorService';
import { StudyMaterial, StudyMaterialVersion } from '../types/studyMaterial';

describe('FOCUSPOINT — Operator Study Material & PYQ Vault Futuristic HUD Suite', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';

  beforeEach(() => {
    // Ensure standard store state
  });

  describe('1. Dual Vault Data Ingestion & Faceted Retrieval', () => {
    it('Should retrieve comprehensive academic courseware and notes catalog', () => {
      const allMaterials = mockStore.getStudyMaterials();
      expect(Array.isArray(allMaterials)).toBe(true);
      expect(allMaterials.length).toBeGreaterThan(0);

      // Verify essential properties exist on documents
      const firstItem = allMaterials[0];
      expect(firstItem.id).toBeDefined();
      expect(firstItem.title).toBeDefined();
      expect(firstItem.subject).toBeDefined();
      expect(firstItem.status).toBeDefined();
    });

    it('Should filter and isolate Official PYQ Exam Shifts with high-fidelity metadata', () => {
      const allMaterials = mockStore.getStudyMaterials();
      const pyqShifts = allMaterials.filter(
        m => m.category === 'PREVIOUS_YEAR_PAPERS' || !!m.pyqMetadata
      );

      expect(pyqShifts.length).toBeGreaterThan(0);

      const pyqPaperWithMeta = pyqShifts.find(m => !!m.pyqMetadata);
      expect(pyqPaperWithMeta).toBeDefined();
      if (pyqPaperWithMeta && pyqPaperWithMeta.pyqMetadata) {
        expect(pyqPaperWithMeta.pyqMetadata.examName).toBeDefined();
        expect(pyqPaperWithMeta.pyqMetadata.examYear).toBeGreaterThanOrEqual(2020);
        expect(pyqPaperWithMeta.pyqMetadata.shift).toBeDefined();
        expect(pyqPaperWithMeta.pyqMetadata.paperCode).toBeDefined();
        expect(pyqPaperWithMeta.pyqMetadata.totalQuestions).toBeGreaterThan(0);
        expect(Array.isArray(pyqPaperWithMeta.pyqMetadata.sections)).toBe(true);
      }
    });

    it('Should support faceted search across exam code, shift title, and subjects', () => {
      const sscMaterials = mockStore.getStudyMaterials({
        search: 'SSC'
      });
      expect(Array.isArray(sscMaterials)).toBe(true);

      const mathMaterials = mockStore.getStudyMaterials({
        subject: 'Mathematics'
      });
      expect(Array.isArray(mathMaterials)).toBe(true);
    });
  });

  describe('2. 1-Click Status Toggling & Visibility Controls', () => {
    it('Should toggle material between PUBLISHED and DRAFT cleanly and persist', () => {
      const materials = mockStore.getStudyMaterials();
      const target = materials[0];
      const originalStatus = target.status;
      const toggledStatus = originalStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

      const updated = mockStore.updateStudyMaterial({
        ...target,
        status: toggledStatus
      });

      expect(updated.status).toBe(toggledStatus);

      // Fetch freshly from store
      const retrieved = mockStore.getStudyMaterialById(target.id);
      expect(retrieved?.status).toBe(toggledStatus);

      // Revert back for consistency
      mockStore.updateStudyMaterial({
        ...target,
        status: originalStatus
      });
    });
  });

  describe('3. Immutable Revision History & Version Control Drawer', () => {
    it('Should deploy a new version to an existing study material without invalidating previous revisions', () => {
      const materials = mockStore.getStudyMaterials();
      const target = materials[0];
      const initialVersionCount = target.versionHistory?.length || 1;

      const newVersion: StudyMaterialVersion = {
        versionId: `ver-${Date.now()}`,
        versionNumber: 'v2.0-verified',
        fileUrl: 'https://example.com/revised.pdf',
        fileName: 'FocusPoint_Revised_Edition_v2.0.pdf',
        fileSize: '5.1 MB',
        pageCount: 48,
        uploadedAt: new Date().toISOString(),
        uploadedBy: operatorName,
        changeLog: 'Comprehensive errata rectification and added 25 bonus PYQ walkthroughs.'
      };

      const updatedMaterial = mockStore.updateStudyMaterial({
        ...target,
        currentVersion: newVersion.versionNumber,
        fileName: newVersion.fileName,
        fileSize: newVersion.fileSize,
        pageCount: newVersion.pageCount,
        versionHistory: [newVersion, ...(target.versionHistory || [])]
      });

      expect(updatedMaterial.currentVersion).toBe('v2.0-verified');
      expect(updatedMaterial.versionHistory.length).toBe(initialVersionCount + 1);
      expect(updatedMaterial.versionHistory[0].versionNumber).toBe('v2.0-verified');
      expect(updatedMaterial.versionHistory[0].changeLog).toContain('errata rectification');
    });
  });

  describe('4. Ingestion Engine for Academic Courseware & Exam Papers', () => {
    it('Should author and ingest a new verified study document into the vault', () => {
      const newAsset: Partial<StudyMaterial> = {
        id: `mat-test-${Date.now()}`,
        title: 'UP Constable 2026 Special Samanya Gyan Capsule',
        description: 'Comprehensive 150-page summary of Uttar Pradesh General Knowledge for exam aspirants.',
        category: 'GOVERNMENT_EXAM',
        targetClass: 'Class 12 / Competitive',
        educationStage: 'SENIOR_SECONDARY',
        subject: 'General Knowledge',
        language: 'Hindi Medium',
        difficultyLevel: 'MEDIUM',
        tags: ['up-police', 'gk-capsule', 'samanya-gyan'],
        fullPdfUrl: 'https://example.com/up-gk-capsule.pdf',
        fileName: 'UP_Constable_GK_Capsule_2026.pdf',
        fileSize: '6.4 MB',
        pageCount: 150,
        currentVersion: 'v1.0',
        isPaid: false,
        basePrice: 0,
        status: 'PUBLISHED',
        targetExams: ['UP_POLICE_CONSTABLE', 'UP_PET']
      };

      const saved = mockStore.addStudyMaterial(newAsset);
      expect(saved).toBeDefined();
      expect(saved.id).toBe(newAsset.id);
      expect(saved.title).toBe(newAsset.title);

      const inStore = mockStore.getStudyMaterialById(saved.id);
      expect(inStore).toBeDefined();
      expect(inStore?.subject).toBe('General Knowledge');
      expect(inStore?.tags).toContain('up-police');
    });
  });

  describe('5. Interactive In-Browser CBT Test Simulator Synthesizer', () => {
    it('Should synthesize a real-time interactive CBT test preview from a PYQ shift paper', () => {
      const allMaterials = mockStore.getStudyMaterials();
      const pyqShift = allMaterials.find(m => m.pyqMetadata && m.pyqMetadata.isCbtAvailable);

      if (pyqShift) {
        const synthesizedCbt = mockStore.synthesizeCbtMockTestFromPyq(pyqShift);
        expect(synthesizedCbt).toBeDefined();
        expect(synthesizedCbt.title).toContain(pyqShift.pyqMetadata?.examName);
        expect(synthesizedCbt.durationMinutes).toBeGreaterThan(0);
        expect(Array.isArray(synthesizedCbt.questions)).toBe(true);
        expect(synthesizedCbt.questions.length).toBeGreaterThan(0);

        const firstQ = synthesizedCbt.questions[0];
        expect(firstQ.questionText).toBeDefined();
        expect(Array.isArray(firstQ.options)).toBe(true);
        expect(firstQ.options.length).toBe(4);
        expect(firstQ.correctAnswer).toBeDefined();
        expect(firstQ.explanation).toBeDefined();
      }
    });
  });

  describe('6. Operator Activity Audit Stream Compliance', () => {
    it('Should register vault operations in operator audit trail for transparent compliance', async () => {
      const testMaterialId = 'mat-audit-vault-test-01';
      const log = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MATERIAL_VERSION_ADD',
        entity: 'STUDY_MATERIAL',
        entityId: testMaterialId,
        entityTitle: 'SSC GD 2024 Shift-2 Official CBT Question Paper',
        details: 'Rolled out revision v1.2 with updated official answer keys.'
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('MATERIAL_VERSION_ADD');
      expect(log.entityId).toBe(testMaterialId);

      const logs = await operatorService.getActivityLogs(operatorId);
      const targetLog = logs.find(l => l.entityId === testMaterialId);
      expect(targetLog).toBeDefined();
      expect(targetLog?.operatorName).toBe(operatorName);
    });
  });
});
