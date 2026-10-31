// FOCUSPOINT Operator Cryptographic Audit Enclave Master Suite
// Verifies SHA-256 block hashing, Merkle integrity scans, action classification, and tamper detection

import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeBlockHash,
  classifyAction,
  buildCryptographicLedger,
  computeMerkleRoot,
  verifyLedgerIntegrity,
  generateSignedAuditJSON,
  generateAuditCSV,
  generateMerkleTreeLevels,
  getDiurnalActivityHistogram,
  getAuditCategoryBreakdown,
  AugmentedAuditBlock
} from '../services/operatorAuditService';
import { operatorService } from '../services/operatorService';
import { OperatorActivityLog } from '../types/operator';

describe('Operator Cryptographic Audit Enclave & Immutable Ledger', () => {
  const sampleLogs: OperatorActivityLog[] = [
    {
      id: 'log-test-01',
      operatorId: 'usr-operator-sunita',
      operatorName: 'Sunita Verma',
      action: 'LOGIN',
      entity: 'PROFILE',
      entityId: 'usr-operator-sunita',
      entityTitle: 'Operator Console Session',
      details: 'Signed into Pan-India Exam & Study Material Command Center',
      timestamp: '2026-10-14T03:00:00Z'
    },
    {
      id: 'log-test-02',
      operatorId: 'usr-operator-sunita',
      operatorName: 'Sunita Verma',
      action: 'AI_QUESTION_GENERATE',
      entity: 'QUESTION',
      entityId: 'batch-test-01',
      entityTitle: 'UP Police Constable Reasoning Batch',
      details: 'Generated 20 syllogism questions',
      timestamp: '2026-10-14T03:30:00Z'
    },
    {
      id: 'log-test-03',
      operatorId: 'usr-operator-sunita',
      operatorName: 'Sunita Verma',
      action: 'AI_QUESTION_APPROVE',
      entity: 'QUESTION',
      entityId: 'q-test-01',
      entityTitle: 'Compound Interest Multi-Step',
      details: 'Pedagogical audit passed: formula verified',
      timestamp: '2026-10-14T04:00:00Z'
    },
    {
      id: 'log-test-04',
      operatorId: 'usr-operator-sunita',
      operatorName: 'Sunita Verma',
      action: 'MOCK_TEST_PUBLISH',
      entity: 'MOCK_TEST',
      entityId: 'mock-test-pet-01',
      entityTitle: 'UPSSSC PET 2026 Mega Mock',
      details: 'Published 100-question test with negative marking 0.25',
      timestamp: '2026-10-14T05:00:00Z'
    }
  ];

  describe('1. SHA-256 Block Hashing Engine', () => {
    it('computes deterministic hexadecimal block hashes prefixed with 0x', async () => {
      const hash1 = await computeBlockHash(1001, '2026-10-14T03:00:00Z', 'LOGIN', 'usr-01', 'Login ok', '0x000');
      const hash2 = await computeBlockHash(1001, '2026-10-14T03:00:00Z', 'LOGIN', 'usr-01', 'Login ok', '0x000');
      expect(hash1).toMatch(/^0x[0-9a-fA-F]+/);
      expect(hash1).toEqual(hash2);
    });

    it('produces distinct hashes when block details change', async () => {
      const hash1 = await computeBlockHash(1001, '2026-10-14T03:00:00Z', 'LOGIN', 'usr-01', 'Login ok', '0x000');
      const hash2 = await computeBlockHash(1001, '2026-10-14T03:00:00Z', 'LOGIN', 'usr-01', 'Tampered details', '0x000');
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('2. Action Classification & Sensitivity Tiering', () => {
    it('classifies critical publication actions as CRITICAL_PUBLISH', () => {
      expect(classifyAction('MOCK_TEST_PUBLISH')).toBe('CRITICAL_PUBLISH');
      expect(classifyAction('MATERIAL_PUBLISH')).toBe('CRITICAL_PUBLISH');
    });

    it('classifies AI approvals, rejections, and version additions as ELEVATED', () => {
      expect(classifyAction('AI_QUESTION_APPROVE')).toBe('ELEVATED');
      expect(classifyAction('AI_QUESTION_REJECT')).toBe('ELEVATED');
      expect(classifyAction('MATERIAL_VERSION_ADD')).toBe('ELEVATED');
      expect(classifyAction('PERMISSION_UPDATE')).toBe('ELEVATED');
    });

    it('classifies question creation, updates, and AI batches as AUDITED', () => {
      expect(classifyAction('AI_QUESTION_GENERATE')).toBe('AUDITED');
      expect(classifyAction('QUESTION_CREATE')).toBe('AUDITED');
      expect(classifyAction('QUESTION_UPDATE')).toBe('AUDITED');
      expect(classifyAction('MOCK_TEST_CREATE')).toBe('AUDITED');
    });

    it('classifies session handshakes as ROUTINE', () => {
      expect(classifyAction('LOGIN')).toBe('ROUTINE');
      expect(classifyAction('LOGOUT')).toBe('ROUTINE');
    });
  });

  describe('3. Blockchain Lineage & Merkle Proof Generation', () => {
    it('builds sequential cryptographic blocks with valid predecessor links', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      expect(blocks.length).toBe(4);

      // blocks are returned sorted descending (newest first: 1004 down to 1001)
      expect(blocks[0].blockNumber).toBe(1004);
      expect(blocks[3].blockNumber).toBe(1001);

      // Verify genesis block predecessor hash is all zeros
      expect(blocks[3].previousHash).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');

      // Verify chain linkages (block 1002 previousHash === block 1001 blockHash)
      expect(blocks[2].previousHash).toBe(blocks[3].blockHash);
      expect(blocks[1].previousHash).toBe(blocks[2].blockHash);
      expect(blocks[0].previousHash).toBe(blocks[1].blockHash);
    });

    it('computes a consistent Merkle root across identical block states', async () => {
      const blocks1 = await buildCryptographicLedger(sampleLogs, 1001);
      const blocks2 = await buildCryptographicLedger(sampleLogs, 1001);

      const root1 = computeMerkleRoot(blocks1);
      const root2 = computeMerkleRoot(blocks2);

      expect(root1).toMatch(/^0x[0-9a-fA-F]+/);
      expect(root1).toBe(root2);
    });
  });

  describe('4. Ledger Integrity Verification & Anti-Tamper Detection', () => {
    it('verifies an uncorrupted block chain returns valid status and zero anomalies', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      const report = await verifyLedgerIntegrity(blocks);

      expect(report.isValid).toBe(true);
      expect(report.totalBlocks).toBe(4);
      expect(report.tamperedBlockIndex).toBeNull();
      expect(report.merkleRoot).toBeTruthy();
    });

    it('flags an integrity breach when an adversary alters payload details in a sealed block', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      
      // Clone and tamper with block #1002
      const tamperedBlocks = blocks.map(b => ({ ...b }));
      const target = tamperedBlocks.find(b => b.blockNumber === 1002);
      if (target) {
        target.details = 'MALICIOUS UNVETTED TAMPER: Injected unauthorized exam answers';
      }

      const report = await verifyLedgerIntegrity(tamperedBlocks);
      expect(report.isValid).toBe(false);
      expect(report.tamperedBlockIndex).not.toBeNull();
      expect(report.tamperedDetails).toContain('Hash mismatch');
    });

    it('flags an integrity breach when an adversary mutates the previous block pointer', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      
      const tamperedBlocks = blocks.map(b => ({ ...b }));
      const target = tamperedBlocks.find(b => b.blockNumber === 1003);
      if (target) {
        target.previousHash = '0xdeadbeef00000000000000000000000000000000000000000000000000000000';
      }

      const report = await verifyLedgerIntegrity(tamperedBlocks);
      expect(report.isValid).toBe(false);
      expect(report.tamperedDetails).toContain('Chain pointer broken');
    });
  });

  describe('5. Audit Dossier Generation & Compliance Export', () => {
    it('formats a tamper-sealed signed JSON audit dossier', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      const dossier = generateSignedAuditJSON(blocks, 'usr-operator-sunita', 'Sunita Verma');

      expect(dossier.format).toBe('FOCUSPOINT_CRYPTOGRAPHIC_AUDIT_LEDGER_V1');
      expect(dossier.operator.id).toBe('usr-operator-sunita');
      expect(dossier.totalRecordedBlocks).toBe(4);
      expect(dossier.merkleRoot).toBeTruthy();
      expect(dossier.tamperSeal).toBeTruthy();
      expect(dossier.ledgerBlocks.length).toBe(4);
    });

    it('formats a CSV export conforming to regulatory compliance standards', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      const csv = generateAuditCSV(blocks);

      expect(csv).toContain('Block_Number,Timestamp_UTC,Action_Type');
      expect(csv).toContain('1004');
      expect(csv).toContain('MOCK_TEST_PUBLISH');
      expect(csv).toContain('CRITICAL_PUBLISH');
      expect(csv.split('\n').length).toBe(5); // Header + 4 data rows
    });
  });

  describe('6. Operator Service Integration', () => {
    it('retrieves default activity logs with populated metadata for Sunita Verma', async () => {
      const logs = await operatorService.getActivityLogs('usr-operator-sunita');
      expect(logs.length).toBeGreaterThanOrEqual(10);

      const hasPublish = logs.some(l => l.action === 'MOCK_TEST_PUBLISH');
      const hasAi = logs.some(l => l.action === 'AI_QUESTION_GENERATE');
      const hasLogin = logs.some(l => l.action === 'LOGIN');

      expect(hasPublish).toBe(true);
      expect(hasAi).toBe(true);
      expect(hasLogin).toBe(true);
    });
  });

  describe('7. Merkle Tree Topology, Diurnal Chronograph & Focus Breakdown', () => {
    it('generates a multi-level Merkle tree topology ending in a single master root', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      const levels = generateMerkleTreeLevels(blocks);

      expect(levels.length).toBeGreaterThanOrEqual(2);
      expect(levels[0].levelIndex).toBe(0);
      expect(levels[0].nodes.length).toBe(4);

      const topLevel = levels[levels.length - 1];
      expect(topLevel.nodes.length).toBe(1);
      expect(topLevel.nodes[0].isRoot).toBe(true);
      expect(topLevel.nodes[0].hash).toMatch(/^0x[0-9a-fA-F]+/);
    });

    it('computes 24 diurnal hourly bins and detects peak operator activity', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      const diurnal = getDiurnalActivityHistogram(blocks);

      expect(diurnal.points.length).toBe(24);
      expect(diurnal.peakCount).toBeGreaterThanOrEqual(1);
      expect(diurnal.busiestPeriod).toBeTruthy();
    });

    it('categorizes operator operations into 5 educational focus domains', async () => {
      const blocks = await buildCryptographicLedger(sampleLogs, 1001);
      const categories = getAuditCategoryBreakdown(blocks);

      expect(categories.length).toBe(5);
      const sumCounts = categories.reduce((acc, c) => acc + c.count, 0);
      expect(sumCounts).toBe(4);
    });
  });
});
