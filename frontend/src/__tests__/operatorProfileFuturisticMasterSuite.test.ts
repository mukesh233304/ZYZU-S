import { describe, it, expect, beforeEach } from 'vitest';
import { operatorService, INITIAL_OPERATOR } from '../services/operatorService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Operator Profile & Security Enclave Futuristic Capabilities', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';

  beforeEach(() => {
    safeStorage.removeItem('fp_study_material_operators');
    safeStorage.removeItem('fp_operator_activity_logs');
  });

  describe('1. Operator Profile Data Integrity & System Identity', () => {
    it('Should load operator profile details with immutable system operatorId', async () => {
      const op = await operatorService.getOperatorById(operatorId);
      expect(op).toBeDefined();
      expect(op?.operatorId).toBe('OPR-IN-2026-001');
      expect(op?.role).toBe('STUDY_MATERIAL_OPERATOR');
      expect(op?.status).toBe('ACTIVE');
      expect(op?.state).toBe('Uttar Pradesh');
      expect(op?.district).toBe('Varanasi');
      expect(op?.permissions.length).toBeGreaterThanOrEqual(10);
    });

    it('Should allow Operator to update personal contact info and bureau address', async () => {
      const updated = await operatorService.updateOperator(operatorId, {
        name: 'Sunita Verma (Academic Head)',
        mobile: '9876543299',
        address: 'Bhelupur Content Bureau, Near BHU Campus, Varanasi'
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Sunita Verma (Academic Head)');
      expect(updated?.mobile).toBe('9876543299');
      expect(updated?.address).toContain('Bhelupur Content Bureau');
      // Crucial: system operatorId must remain immutable
      expect(updated?.operatorId).toBe('OPR-IN-2026-001');
    });

    it('Should allow avatar staging and updates', async () => {
      const newAvatar = 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250';
      const updated = await operatorService.updateOperator(operatorId, {
        avatarUrl: newAvatar
      });

      expect(updated?.avatarUrl).toBe(newAvatar);
    });
  });

  describe('2. Security Audit & Activity Logging for Profile Actions', () => {
    it('Should log profile changes into immutable activity log stream', async () => {
      const log = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'PROFILE_UPDATE',
        entity: 'PROFILE',
        entityId: operatorId,
        entityTitle: operatorName,
        details: 'Rotated operator account password with entropy verification and re-keyed session.'
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('PROFILE_UPDATE');
      expect(log.details).toContain('Rotated operator account password');

      const allLogs = await operatorService.getActivityLogs(operatorId);
      expect(allLogs.some((l) => l.action === 'PROFILE_UPDATE')).toBe(true);
    });
  });

  describe('3. Granular Permissions Breakdown & Authority Categorization', () => {
    it('Should verify study material permissions are granted to operator', () => {
      const perms = INITIAL_OPERATOR.permissions;
      expect(perms).toContain('view_study_material');
      expect(perms).toContain('upload_study_material');
      expect(perms).toContain('publish_study_material');
    });

    it('Should verify mock test and AI authoring permissions are granted to operator', () => {
      const perms = INITIAL_OPERATOR.permissions;
      expect(perms).toContain('view_mock_tests');
      expect(perms).toContain('create_mock_test');
      expect(perms).toContain('publish_mock_test');
      expect(perms).toContain('manage_question_bank');
      expect(perms).toContain('ask_ai');
      expect(perms).toContain('generate_questions');
      expect(perms).toContain('approve_ai_questions');
    });

    it('Should verify operator stats are populated with valid metrics', () => {
      const stats = INITIAL_OPERATOR.stats;
      expect(stats.materialsUploaded).toBeGreaterThanOrEqual(10);
      expect(stats.materialsPublished).toBeGreaterThanOrEqual(5);
      expect(stats.mockTestsCreated).toBeGreaterThanOrEqual(5);
      expect(stats.questionsCreated).toBeGreaterThanOrEqual(100);
      expect(stats.materialViewsCount).toBeGreaterThan(0);
      expect(stats.materialDownloadsCount).toBeGreaterThan(0);
    });
  });
});
