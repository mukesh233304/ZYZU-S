import { describe, it, expect, beforeEach } from 'vitest';
import { 
  auditService, 
  generateDeterministicHash, 
  computeRecordHash 
} from '../services/auditService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — SUPER ADMIN IMMUTABLE AUDIT TRAIL MASTER SUITE', () => {
  beforeEach(() => {
    safeStorage.removeItem('fp_super_admin_audit_logs_v2');
  });

  describe('1. Deterministic Cryptographic Hash Engine', () => {
    it('generates consistent 64-character hexadecimal SHA-256 style hashes', () => {
      const hash1 = generateDeterministicHash('FOCUSPOINT_SOVEREIGN_GENESIS_ROOT');
      const hash2 = generateDeterministicHash('FOCUSPOINT_SOVEREIGN_GENESIS_ROOT');

      expect(hash1).toBeDefined();
      expect(hash1.length).toBe(64);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
      expect(hash1).toBe(hash2); // Determinism
    });

    it('demonstrates avalanche sensitivity when payload varies by a single character', () => {
      const basePayload = 'action:COMMISSION_OVERRIDE;value:5.0%';
      const alteredPayload = 'action:COMMISSION_OVERRIDE;value:5.1%';

      const hashA = generateDeterministicHash(basePayload);
      const hashB = generateDeterministicHash(alteredPayload);

      expect(hashA).not.toBe(hashB);
      // Avalanche test: at least 15 characters should differ
      let differences = 0;
      for (let i = 0; i < 64; i++) {
        if (hashA[i] !== hashB[i]) differences++;
      }
      expect(differences).toBeGreaterThan(15);
    });

    it('accurately computes record digest including parent hash', () => {
      const record = {
        id: 'aud-test-01',
        blockIndex: 1,
        timestamp: '2026-10-12 12:00:00',
        actorId: 'usr-superadmin',
        action: 'POLICY_OVERRIDE',
        module: 'COMMISSION_ENGINE',
        target: 'Test Library',
        previousValue: '8%',
        newValue: '5%',
        parentHash: '0000000000000000000000000000000000000000000000000000000000000000',
        status: 'SUCCESS'
      };

      const digest = computeRecordHash(record);
      expect(digest.length).toBe(64);
      expect(digest).toBe(computeRecordHash(record));
    });
  });

  describe('2. Sovereign Genesis Initialization & Block Sequence', () => {
    it('initializes default sovereign Merkle chain with genesis block #0', async () => {
      const logs = await auditService.getAuditLogs();

      expect(logs.length).toBeGreaterThanOrEqual(10);

      // Raw blocks in storage should have genesis at index 0
      const raw = auditService.getRawLogs();
      const genesis = raw[0];

      expect(genesis.blockIndex).toBe(0);
      expect(genesis.parentHash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
      expect(genesis.isImmutable).toBe(true);
      expect(genesis.verificationStatus).toBe('VERIFIED_SEALED');
      expect(genesis.merkleHash).toBeDefined();
      expect(genesis.merkleHash?.length).toBe(64);
    });

    it('links every block in the default chain to its predecessor', () => {
      const raw = auditService.getRawLogs();

      for (let i = 1; i < raw.length; i++) {
        const prev = raw[i - 1];
        const curr = raw[i];

        expect(curr.blockIndex).toBe(i);
        expect(curr.parentHash).toBe(prev.merkleHash);
        expect(curr.isImmutable).toBe(true);
      }
    });

    it('covers key governance subsystems in default seed records', async () => {
      const logs = await auditService.getAuditLogs();
      const modules = new Set(logs.map(l => l.module));

      expect(modules.has('SYSTEM_GOVERNANCE')).toBe(true);
      expect(modules.has('ADMIN_GOVERNANCE')).toBe(true);
      expect(modules.has('COMMISSION_ENGINE')).toBe(true);
      expect(modules.has('OFFER_SYSTEM')).toBe(true);
      expect(modules.has('DISTRICT_COMMAND')).toBe(true);
      expect(modules.has('ADMIN_FINANCES')).toBe(true);
      expect(modules.has('EXAM_MASTER')).toBe(true);
      expect(modules.has('PAID_VAULT')).toBe(true);
      expect(modules.has('SECURITY_CENTER')).toBe(true);
    });
  });

  describe('3. Immutable Block Append & Parent-Child Chaining', () => {
    it('appends a new block and correctly links to chain head', async () => {
      const beforeLogs = auditService.getRawLogs();
      const headBefore = beforeLogs[beforeLogs.length - 1];

      const newRecord = await auditService.record({
        action: 'EMERGENCY_LOCKDOWN_TRIGGERED',
        module: 'SECURITY_CENTER',
        target: 'District Admin Terminal Ghazipur',
        targetId: 'usr-admin-gzp',
        district: 'Ghazipur',
        previousValue: 'TERMINAL_ACTIVE',
        newValue: 'SECURITY_QUARANTINE_ENFORCED',
        severity: 'CRITICAL',
        status: 'SUCCESS'
      });

      expect(newRecord).toBeDefined();
      expect(newRecord.blockIndex).toBe((headBefore.blockIndex ?? 0) + 1);
      expect(newRecord.parentHash).toBe(headBefore.merkleHash);
      expect(newRecord.merkleHash?.length).toBe(64);
      expect(newRecord.isImmutable).toBe(true);
      expect(newRecord.verificationStatus).toBe('VERIFIED_SEALED');

      // Verify the new block is persisted
      const afterLogs = auditService.getRawLogs();
      expect(afterLogs.length).toBe(beforeLogs.length + 1);
      expect(afterLogs[afterLogs.length - 1].id).toBe(newRecord.id);
    });

    it('records state mutation diff values accurately', async () => {
      const record = await auditService.record({
        action: 'COMMISSION_RATE_ADJUST',
        module: 'COMMISSION_ENGINE',
        target: 'Central Library Prayagraj',
        previousValue: 'Standard 8%',
        newValue: 'Special 6%',
        severity: 'WARNING'
      });

      expect(record.previousValue).toBe('Standard 8%');
      expect(record.newValue).toBe('Special 6%');
      expect(record.severity).toBe('WARNING');
    });
  });

  describe('4. Cryptographic Chain Integrity Verification', () => {
    it('verifies 100% cryptographic integrity on pristine ledger', async () => {
      const report = await auditService.verifyChainIntegrity();

      expect(report.isValid).toBe(true);
      expect(report.totalBlocks).toBeGreaterThanOrEqual(10);
      expect(report.brokenIndex).toBeNull();
      expect(report.anomaliesDetected).toBe(0);
      expect(report.rootHash).toMatch(/^[0-9a-f]{64}$/);
      expect(report.message).toContain('All');
      expect(report.message).toContain('blocks verified');
    });

    it('maintains integrity after appending multiple consecutive blocks', async () => {
      await auditService.record({ action: 'TEST_ACTION_1', module: 'SYSTEM_GOVERNANCE', target: 'Target 1' });
      await auditService.record({ action: 'TEST_ACTION_2', module: 'SYSTEM_GOVERNANCE', target: 'Target 2' });
      await auditService.record({ action: 'TEST_ACTION_3', module: 'SYSTEM_GOVERNANCE', target: 'Target 3' });

      const report = await auditService.verifyChainIntegrity();
      expect(report.isValid).toBe(true);
      expect(report.brokenIndex).toBeNull();
    });
  });

  describe('5. Tamper Detection & Forensic Alarm (Security Drill)', () => {
    it('detects payload tampering and pinpoints the corrupted block ID', async () => {
      const raw = auditService.getRawLogs();
      const targetBlock = raw[3]; // Modify block #3

      // Simulate malicious tampering in storage
      await auditService.simulateTamperTest(targetBlock.id, 'MALICIOUS_UNAUTHORIZED_MUTATION');

      // Run cryptographic verifier
      const report = await auditService.verifyChainIntegrity();

      expect(report.isValid).toBe(false);
      expect(report.brokenIndex).toBe(targetBlock.blockIndex);
      expect(report.tamperedBlockId).toBe(targetBlock.id);
      expect(report.message).toContain('corrupted');
    });

    it('restores the sovereign chain back to verified state', async () => {
      const raw = auditService.getRawLogs();
      await auditService.simulateTamperTest(raw[2].id);

      // Verify it is tampered
      let report = await auditService.verifyChainIntegrity();
      expect(report.isValid).toBe(false);

      // Restore sovereign chain
      report = await auditService.restoreChain();
      expect(report.isValid).toBe(true);
      expect(report.brokenIndex).toBeNull();
    });
  });

  describe('6. Multi-Dimensional Filtering & Search', () => {
    it('filters records by subsystem module', async () => {
      const commLogs = await auditService.getAuditLogs({ module: 'COMMISSION_ENGINE' });
      expect(commLogs.length).toBeGreaterThan(0);
      commLogs.forEach(l => expect(l.module).toBe('COMMISSION_ENGINE'));

      const finLogs = await auditService.getAuditLogs({ module: 'ADMIN_FINANCES' });
      expect(finLogs.length).toBeGreaterThan(0);
      finLogs.forEach(l => expect(l.module).toBe('ADMIN_FINANCES'));
    });

    it('filters records by territory district', async () => {
      const gzpLogs = await auditService.getAuditLogs({ district: 'Ghazipur' });
      expect(gzpLogs.length).toBeGreaterThan(0);
      gzpLogs.forEach(l => expect(l.district?.toLowerCase()).toBe('ghazipur'));
    });

    it('filters records by severity level', async () => {
      const critLogs = await auditService.getAuditLogs({ severity: 'CRITICAL' });
      expect(critLogs.length).toBeGreaterThan(0);
      critLogs.forEach(l => expect(l.severity).toBe('CRITICAL'));
    });

    it('searches by action keyword, actor name, or target entity', async () => {
      const searchAction = await auditService.getAuditLogs({ search: 'COMMISSION' });
      expect(searchAction.length).toBeGreaterThan(0);

      const searchActor = await auditService.getAuditLogs({ search: 'Sonkar' });
      expect(searchActor.length).toBeGreaterThan(0);

      const searchTarget = await auditService.getAuditLogs({ search: 'Virendra' });
      expect(searchTarget.length).toBeGreaterThan(0);
    });
  });

  describe('7. Cognitive Anomaly Detection & Ledger Stats', () => {
    it('detects cognitive security anomalies when anomalies exist', async () => {
      const anomalies = await auditService.detectSecurityAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
      expect(anomalies.length).toBeGreaterThan(0);

      const policySpike = anomalies.find(a => a.type === 'POLICY_SPIKE');
      expect(policySpike).toBeDefined();
      expect(policySpike?.severity).toBe('WARNING');
      expect(policySpike?.recommendation).toBeDefined();
    });

    it('computes complete ledger statistics', async () => {
      const stats = await auditService.getLedgerStats();

      expect(stats.totalRecords).toBeGreaterThanOrEqual(10);
      expect(stats.verifiedBlocks).toBeGreaterThanOrEqual(10);
      expect(stats.activeModules).toBeGreaterThanOrEqual(5);
      expect(stats.monitoredDistricts).toBeGreaterThanOrEqual(2);
      expect(stats.latestMerkleRoot.length).toBe(64);
      expect(stats.integrityPercentage).toBe(100);
      expect(stats.lastSealedTimestamp).toBeDefined();
    });
  });

  describe('8. Multi-Format Export Engine', () => {
    it('exports audit logs as valid JSON string', async () => {
      const logs = await auditService.getAuditLogs();
      const jsonExport = auditService.exportAuditLogs('json', logs);

      expect(typeof jsonExport).toBe('string');
      const parsed = JSON.parse(jsonExport);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(logs.length);
      expect(parsed[0].merkleHash).toBeDefined();
    });

    it('exports audit logs as compliant CSV format', async () => {
      const logs = await auditService.getAuditLogs();
      const csvExport = auditService.exportAuditLogs('csv', logs);

      expect(typeof csvExport).toBe('string');
      const lines = csvExport.split('\n');
      expect(lines.length).toBeGreaterThan(logs.length);
      expect(lines[0]).toContain('BlockHeight,ID,Timestamp,ActorName');
      expect(lines[0]).toContain('MerkleHash,ParentHash');
    });

    it('exports audit logs as signed Cryptographic Proof Certificate', async () => {
      const logs = await auditService.getAuditLogs();
      const certExport = auditService.exportAuditLogs('certificate', logs);

      expect(certExport).toMatch(/(FOCUSPOINT|ZYZU'S) SOVEREIGN CRYPTOGRAPHIC AUDIT CERTIFICATE/);
      expect(certExport).toContain('TAMPER-EVIDENT SHA-256 MERKLE LEDGER PROOF OF INTEGRITY');
      expect(certExport).toContain('Head Merkle Root:');
      expect(certExport).toContain('BLOCK HASH MANIFEST');
    });
  });
});
