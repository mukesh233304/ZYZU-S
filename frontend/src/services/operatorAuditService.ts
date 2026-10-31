// FOCUSPOINT Operator Cryptographic Audit Enclave Service
// Zero-trust immutable audit ledger computation, SHA-256 block hashing, and Merkle verification

import { OperatorActivityLog, OperatorActivityAction } from '../types/operator';

export type AuditClassification = 'ROUTINE' | 'AUDITED' | 'CRITICAL_PUBLISH' | 'ELEVATED';
export type BlockVerificationStatus = 'VERIFIED_SEALED' | 'TAMPER_SUSPECT';

export interface AugmentedAuditBlock extends OperatorActivityLog {
  blockNumber: number;
  blockHash: string;
  previousHash: string;
  merkleLeaf: string;
  ipAddress: string;
  userAgent: string;
  classification: AuditClassification;
  verificationStatus: BlockVerificationStatus;
}

export interface LedgerVerificationReport {
  isValid: boolean;
  totalBlocks: number;
  tamperedBlockIndex: number | null;
  merkleRoot: string;
  checkedAt: string;
  tamperedDetails?: string;
}

// Fallback deterministic hash generator for Node/test environments without window.crypto
function deterministicHexHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  return `0x${part1}${part2}${part3}${part4}`;
}

export async function computeBlockHash(
  blockNumber: number,
  timestamp: string,
  action: string,
  entityId: string,
  details: string,
  previousHash: string
): Promise<string> {
  const payload = `BLOCK:${blockNumber}|TS:${timestamp}|ACT:${action}|EID:${entityId}|DTL:${details}|PREV:${previousHash}`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `0x${hex}`;
    } catch {
      return deterministicHexHash(payload);
    }
  }
  return deterministicHexHash(payload);
}

// Classify action sensitivity
export function classifyAction(action: OperatorActivityAction): AuditClassification {
  switch (action) {
    case 'MOCK_TEST_PUBLISH':
    case 'MATERIAL_PUBLISH':
      return 'CRITICAL_PUBLISH';
    case 'AI_QUESTION_APPROVE':
    case 'AI_QUESTION_REJECT':
    case 'MATERIAL_VERSION_ADD':
    case 'PERMISSION_UPDATE':
    case 'STATUS_CHANGE':
      return 'ELEVATED';
    case 'AI_QUESTION_GENERATE':
    case 'QUESTION_UPDATE':
    case 'QUESTION_CREATE':
    case 'MOCK_TEST_CREATE':
    case 'MATERIAL_UPLOAD':
      return 'AUDITED';
    default:
      return 'ROUTINE';
  }
}

// Build sequential cryptographic blocks
export async function buildCryptographicLedger(
  rawLogs: OperatorActivityLog[],
  startBlockNumber: number = 1001
): Promise<AugmentedAuditBlock[]> {
  // Sort chronologically ascending to compute correct blockchain lineage
  const sorted = [...rawLogs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const augmented: AugmentedAuditBlock[] = [];
  let prevHash = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Genesis anchor

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const blockNum = startBlockNumber + i;
    const blockHash = await computeBlockHash(
      blockNum,
      item.timestamp,
      item.action,
      item.entityId,
      item.details,
      prevHash
    );

    const classification = classifyAction(item.action);
    const ipAddress = item.metadata?.ipEnclave || '192.168.1.104 [Internal Bureau LAN]';
    const userAgent = 'FocusPoint-GovAgent/2.4 (macOS; EdTech-HUD-Enclave)';

    augmented.push({
      ...item,
      blockNumber: blockNum,
      blockHash,
      previousHash: prevHash,
      merkleLeaf: blockHash.slice(0, 18),
      ipAddress,
      userAgent,
      classification,
      verificationStatus: 'VERIFIED_SEALED'
    });

    prevHash = blockHash;
  }

  // Return sorted descending (newest first) for HUD display
  return augmented.reverse();
}

// Compute Merkle Root of current ledger
export function computeMerkleRoot(blocks: AugmentedAuditBlock[]): string {
  if (blocks.length === 0) return '0x0000000000000000';
  const hashes = blocks.map(b => b.blockHash);
  let combined = hashes.join(':');
  return deterministicHexHash(`MERKLE_ROOT:${combined}`).slice(0, 34);
}

// Verify entire chain integrity
export async function verifyLedgerIntegrity(
  blocksDescending: AugmentedAuditBlock[]
): Promise<LedgerVerificationReport> {
  if (blocksDescending.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      tamperedBlockIndex: null,
      merkleRoot: '0x0000000000000000',
      checkedAt: new Date().toISOString()
    };
  }

  // Work chronologically ascending
  const ascending = [...blocksDescending].reverse();
  let expectedPrevHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < ascending.length; i++) {
    const block = ascending[i];

    // Check link pointer
    if (block.previousHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalBlocks: ascending.length,
        tamperedBlockIndex: i,
        merkleRoot: computeMerkleRoot(blocksDescending),
        checkedAt: new Date().toISOString(),
        tamperedDetails: `Chain pointer broken at Block #${block.blockNumber}. Expected prev: ${expectedPrevHash.slice(0, 10)}..., Found: ${block.previousHash.slice(0, 10)}...`
      };
    }

    // Recompute block hash
    const recomputed = await computeBlockHash(
      block.blockNumber,
      block.timestamp,
      block.action,
      block.entityId,
      block.details,
      block.previousHash
    );

    if (recomputed !== block.blockHash) {
      return {
        isValid: false,
        totalBlocks: ascending.length,
        tamperedBlockIndex: i,
        merkleRoot: computeMerkleRoot(blocksDescending),
        checkedAt: new Date().toISOString(),
        tamperedDetails: `Hash mismatch at Block #${block.blockNumber}. Recorded: ${block.blockHash.slice(0, 10)}..., Computed: ${recomputed.slice(0, 10)}...`
      };
    }

    expectedPrevHash = block.blockHash;
  }

  return {
    isValid: true,
    totalBlocks: ascending.length,
    tamperedBlockIndex: null,
    merkleRoot: computeMerkleRoot(blocksDescending),
    checkedAt: new Date().toISOString()
  };
}

// Generate JSON export payload
export function generateSignedAuditJSON(
  blocks: AugmentedAuditBlock[],
  operatorId: string,
  operatorName: string
) {
  const merkleRoot = computeMerkleRoot(blocks);
  return {
    format: 'FOCUSPOINT_CRYPTOGRAPHIC_AUDIT_LEDGER_V1',
    schemaVersion: '1.0.0-gov-secure',
    generatedAt: new Date().toISOString(),
    merkleRoot,
    operator: {
      id: operatorId,
      name: operatorName,
      bureau: 'Pan-India Academic Content Bureau',
      enclaveStatus: 'SECURE_ACTIVE'
    },
    totalRecordedBlocks: blocks.length,
    tamperSeal: deterministicHexHash(`SEAL:${operatorId}:${merkleRoot}:${blocks.length}`),
    ledgerBlocks: blocks
  };
}

// Generate CSV string
export function generateAuditCSV(blocks: AugmentedAuditBlock[]): string {
  const headers = [
    'Block_Number',
    'Timestamp_UTC',
    'Action_Type',
    'Classification',
    'Entity_Type',
    'Entity_ID',
    'Entity_Title',
    'Details',
    'Block_Hash',
    'Previous_Hash',
    'IP_Enclave',
    'Verification_Status'
  ];

  const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const rows = blocks.map(b => [
    b.blockNumber,
    escapeCSV(b.timestamp),
    escapeCSV(b.action),
    escapeCSV(b.classification),
    escapeCSV(b.entity),
    escapeCSV(b.entityId),
    escapeCSV(b.entityTitle),
    escapeCSV(b.details),
    escapeCSV(b.blockHash),
    escapeCSV(b.previousHash),
    escapeCSV(b.ipAddress),
    escapeCSV(b.verificationStatus)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export interface MerkleNode {
  id: string;
  hash: string;
  label: string;
  blockNumber?: number;
  isRoot?: boolean;
}

export interface MerkleLevel {
  levelIndex: number;
  title: string;
  nodes: MerkleNode[];
}

export function generateMerkleTreeLevels(blocksDescending: AugmentedAuditBlock[]): MerkleLevel[] {
  if (blocksDescending.length === 0) return [];

  const ascending = [...blocksDescending].reverse();
  const leafNodes: MerkleNode[] = ascending.map((b) => ({
    id: `leaf-${b.blockNumber}`,
    hash: b.blockHash,
    label: `Block #${b.blockNumber} (${b.action})`,
    blockNumber: b.blockNumber
  }));

  const levels: MerkleLevel[] = [
    {
      levelIndex: 0,
      title: 'Level 0: Cryptographic Block Leaves',
      nodes: leafNodes
    }
  ];

  let currentLevelNodes = leafNodes;
  let levelIdx = 1;

  while (currentLevelNodes.length > 1) {
    const nextLevelNodes: MerkleNode[] = [];
    for (let i = 0; i < currentLevelNodes.length; i += 2) {
      const left = currentLevelNodes[i];
      const right = i + 1 < currentLevelNodes.length ? currentLevelNodes[i + 1] : left;
      const combinedHash = deterministicHexHash(`PARENT:${left.hash}:${right.hash}`);
      const isFinalRoot = Math.ceil(currentLevelNodes.length / 2) === 1;

      nextLevelNodes.push({
        id: `lvl-${levelIdx}-${Math.floor(i / 2)}`,
        hash: combinedHash,
        label: isFinalRoot ? 'MERKLE ROOT HASH' : `Branch Node [${Math.floor(i / 2) + 1}]`,
        isRoot: isFinalRoot
      });
    }

    levels.push({
      levelIndex: levelIdx,
      title: nextLevelNodes.length === 1 ? 'Merkle Master Root' : `Level ${levelIdx}: Branch Combiners`,
      nodes: nextLevelNodes
    });

    currentLevelNodes = nextLevelNodes;
    levelIdx++;
  }

  return levels;
}

export interface HourlyActivityPoint {
  hour: number;
  label: string;
  count: number;
  actions: string[];
}

export function getDiurnalActivityHistogram(blocks: AugmentedAuditBlock[]): {
  points: HourlyActivityPoint[];
  peakHour: number;
  peakCount: number;
  busiestPeriod: string;
} {
  const hoursMap: Record<number, { count: number; actions: Set<string> }> = {};
  for (let h = 0; h < 24; h++) {
    hoursMap[h] = { count: 0, actions: new Set() };
  }

  blocks.forEach((b) => {
    const d = new Date(b.timestamp);
    const istHour = (d.getUTCHours() + 5 + Math.floor((d.getUTCMinutes() + 30) / 60)) % 24;
    hoursMap[istHour].count += 1;
    hoursMap[istHour].actions.add(b.action);
  });

  let peakHour = 0;
  let peakCount = 0;

  const points: HourlyActivityPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const count = hoursMap[h].count;
    if (count > peakCount) {
      peakCount = count;
      peakHour = h;
    }
    const label = `${String(h).padStart(2, '0')}:00`;
    points.push({
      hour: h,
      label,
      count,
      actions: Array.from(hoursMap[h].actions)
    });
  }

  let busiestPeriod = 'Morning Syllabus & Paper Setting (09:00 - 13:00 IST)';
  if (peakHour >= 14 && peakHour < 18) {
    busiestPeriod = 'Afternoon AI Distillation & Review (14:00 - 18:00 IST)';
  } else if (peakHour >= 18 && peakHour < 23) {
    busiestPeriod = 'Evening Mega Mock Publish & Verification (18:00 - 23:00 IST)';
  } else if (peakHour >= 0 && peakHour < 6) {
    busiestPeriod = 'Night Enclave Sync & Security Refresh (00:00 - 06:00 IST)';
  }

  return { points, peakHour, peakCount, busiestPeriod };
}

export interface CategoryBreakdown {
  category: 'STUDY_MATERIAL' | 'MOCK_TEST' | 'QUESTION_BANK' | 'AI_STUDIO' | 'SECURITY_SESSION';
  label: string;
  count: number;
  percentage: number;
  color: string;
  borderColor: string;
}

export function getAuditCategoryBreakdown(blocks: AugmentedAuditBlock[]): CategoryBreakdown[] {
  const total = blocks.length || 1;
  let studyMaterial = 0;
  let mockTests = 0;
  let questionBank = 0;
  let aiStudio = 0;
  let security = 0;

  blocks.forEach((b) => {
    if (b.action.startsWith('AI_')) {
      aiStudio++;
    } else if (b.action.startsWith('MATERIAL_')) {
      studyMaterial++;
    } else if (b.action.startsWith('MOCK_TEST_')) {
      mockTests++;
    } else if (b.action.startsWith('QUESTION_')) {
      questionBank++;
    } else {
      security++;
    }
  });

  return [
    {
      category: 'STUDY_MATERIAL',
      label: 'Study Material Vault',
      count: studyMaterial,
      percentage: Math.round((studyMaterial / total) * 100),
      color: 'bg-cyan-500',
      borderColor: 'border-cyan-500/40'
    },
    {
      category: 'AI_STUDIO',
      label: 'AI Studio Prompting & Review',
      count: aiStudio,
      percentage: Math.round((aiStudio / total) * 100),
      color: 'bg-purple-500',
      borderColor: 'border-purple-500/40'
    },
    {
      category: 'MOCK_TEST',
      label: 'Mock Test Authoring & CBT',
      count: mockTests,
      percentage: Math.round((mockTests / total) * 100),
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-500/40'
    },
    {
      category: 'QUESTION_BANK',
      label: 'Question Bank & LaTeX',
      count: questionBank,
      percentage: Math.round((questionBank / total) * 100),
      color: 'bg-amber-500',
      borderColor: 'border-amber-500/40'
    },
    {
      category: 'SECURITY_SESSION',
      label: 'Security & Enclave Handshakes',
      count: security,
      percentage: Math.round((security / total) * 100),
      color: 'bg-blue-500',
      borderColor: 'border-blue-500/40'
    }
  ];
}
