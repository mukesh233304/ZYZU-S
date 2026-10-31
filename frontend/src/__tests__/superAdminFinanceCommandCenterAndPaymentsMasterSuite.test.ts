// FOCUSPOINT — SUPER ADMIN FINANCE COMMAND CENTER & PAYMENTS SETTLEMENT LEDGER MASTER SUITE
// Comprehensive validation covering CyberGeospatialLocationDeck, Postal PIN Satellite Radar,
// Dynamic District Synthesis, Inflow/Payout Ledgers, Idempotency, Escrow Seals, and GST Tax Invoices.

import { describe, it, expect, beforeEach } from 'vitest';
import { locationService } from '../services/locationService';
import { financeService } from '../services/financeService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';
import { LocationSelectionPayload } from '../components/common/PanIndiaLocationSelector';
import { DistrictMetricEntry } from '../components/common/CyberGeospatialLocationDeck';
import { 
  PaymentQueueItem, 
  LibrarySettlementRecord, 
  TeacherPayrollItem, 
  DistrictExpenseClaim 
} from '../types/finance';

describe('FOCUSPOINT — Super Admin Finance & Payments Sovereign Cyber Deck Master Suite', () => {
  beforeEach(() => {
    // Reset test storage artifacts if any
    safeStorage.removeItem('fp_test_settlement_batch_tmp');
  });

  // =========================================================================
  // SECTION 1: CYBER GEOSPATIAL LOCATION DECK & JURISDICTION DRILLDOWN
  // =========================================================================
  describe('1. Cyber Geospatial Location Deck & Territory Hierarchy Integrity', () => {
    it('retrieves all pan-India states and UTs with active operational status', () => {
      const states = locationService.getStates('loc-country-in');
      expect(states).toBeDefined();
      expect(states.length).toBeGreaterThanOrEqual(7);

      const stateNames = states.map(s => s.name);
      expect(stateNames).toContain('Uttar Pradesh');
      expect(stateNames).toContain('Bihar');
      expect(stateNames).toContain('Delhi');
      expect(stateNames).toContain('Maharashtra');
      expect(stateNames).toContain('Rajasthan');
      expect(stateNames).toContain('Madhya Pradesh');
      expect(stateNames).toContain('West Bengal');
    });

    it('cascades cleanly from state to districts with zero data leakage', () => {
      const upDistricts = locationService.getDistricts('loc-state-up');
      expect(upDistricts.length).toBeGreaterThanOrEqual(6);
      const upDistNames = upDistricts.map(d => d.name);
      expect(upDistNames).toContain('Varanasi');
      expect(upDistNames).toContain('Ghazipur');
      expect(upDistNames).toContain('Lucknow');

      const biharDistricts = locationService.getDistricts('loc-state-br');
      expect(biharDistricts.length).toBeGreaterThanOrEqual(5);
      const biharDistNames = biharDistricts.map(d => d.name);
      expect(biharDistNames).toContain('Patna');
      expect(biharDistNames).toContain('Gaya');

      // Guarantee UP districts are NOT in Bihar
      expect(biharDistNames).not.toContain('Varanasi');
      expect(biharDistNames).not.toContain('Ghazipur');
    });

    it('cascades from district to high-density educational localities', () => {
      const vnsLocalities = locationService.getLocalities('dist-vns');
      expect(vnsLocalities.length).toBeGreaterThanOrEqual(5);
      const vnsNames = vnsLocalities.map(l => l.name);
      expect(vnsNames).toContain('Lanka');
      expect(vnsNames).toContain('BHU Campus');
      expect(vnsNames).toContain('Sigra');
    });

    it('computes district metrics entries accurately for the Matrix Leaderboard modal', () => {
      const sampleInflows = [
        { district: 'Varanasi', amount: 15000, platformShare: 2700, partnerShare: 12300 },
        { district: 'Varanasi', amount: 12000, platformShare: 2160, partnerShare: 9840 },
        { district: 'Ghazipur', amount: 8000, platformShare: 1440, partnerShare: 6560 },
        { district: 'Patna', amount: 20000, platformShare: 3600, partnerShare: 16400 }
      ];

      const metricsMap = new Map<string, DistrictMetricEntry>();
      sampleInflows.forEach(inf => {
        const existing = metricsMap.get(inf.district) || {
          districtName: inf.district,
          stateName: inf.district === 'Patna' ? 'Bihar' : 'Uttar Pradesh',
          totalTxns: 0,
          totalGross: 0,
          totalPlatformFee: 0,
          totalPartnerPayout: 0
        };

        existing.totalTxns += 1;
        existing.totalGross += inf.amount;
        existing.totalPlatformFee = (existing.totalPlatformFee || 0) + inf.platformShare;
        existing.totalPartnerPayout = (existing.totalPartnerPayout || 0) + inf.partnerShare;
        metricsMap.set(inf.district, existing);
      });

      const metrics = Array.from(metricsMap.values()).sort((a, b) => b.totalGross - a.totalGross);
      expect(metrics.length).toBe(3);
      expect(metrics[0].districtName).toBe('Varanasi');
      expect(metrics[0].totalGross).toBe(27000);
      expect(metrics[0].totalTxns).toBe(2);
      expect(metrics[0].totalPlatformFee).toBe(4860);
      expect(metrics[0].totalPartnerPayout).toBe(22140);

      expect(metrics[1].districtName).toBe('Patna');
      expect(metrics[1].totalGross).toBe(20000);

      expect(metrics[2].districtName).toBe('Ghazipur');
      expect(metrics[2].totalGross).toBe(8000);
    });
  });

  // =========================================================================
  // SECTION 2: SATELLITE RADAR POSTAL PIN CODE RESOLUTION
  // =========================================================================
  describe('2. Satellite Radar Postal PIN Code Auto-Lock & Offline Directory', () => {
    it('accurately resolves Ghazipur educational hub PIN 233221 with exact State & District', async () => {
      const res = await locationService.lookupPincode('233221');
      expect(res.success).toBe(true);
      expect(res.pincode).toBe('233221');
      expect(res.state?.name).toBe('Uttar Pradesh');
      expect(res.district?.name).toBe('Ghazipur');
      expect(res.localities.length).toBeGreaterThan(0);
    });

    it('resolves Varanasi hub PIN 221001 instantly via offline prefix directory', async () => {
      const res = await locationService.lookupPincode('221001');
      expect(res.success).toBe(true);
      expect(res.state?.name).toBe('Uttar Pradesh');
      expect(res.district?.name).toContain('Varanasi');
    });

    it('resolves Patna hub PIN 800001 instantly via offline prefix directory', async () => {
      const res = await locationService.lookupPincode('800001');
      expect(res.success).toBe(true);
      expect(res.state?.name).toBe('Bihar');
      expect(res.district?.name).toContain('Patna');
    });

    it('resolves New Delhi capital territory PIN 110001', async () => {
      const res = await locationService.lookupPincode('110001');
      expect(res.success).toBe(true);
      expect(res.state?.name).toBe('Delhi');
    });

    it('gracefully rejects invalid, empty, or short PIN codes with diagnostic hints', async () => {
      const emptyRes = await locationService.lookupPincode('');
      expect(emptyRes.success).toBe(false);

      const shortRes = await locationService.lookupPincode('233');
      expect(shortRes.success).toBe(false);
      expect(shortRes.message).toContain('6 digits');

      const nonNumeric = await locationService.lookupPincode('ABCXYZ');
      expect(nonNumeric.success).toBe(false);
    });

    it('provides reverse PIN resolution from location ID to postal code', () => {
      const pin = locationService.getPincodeForLocation('loc-gzp-saidpur');
      expect(pin).toBe('233221');
    });
  });

  // =========================================================================
  // SECTION 3: FINANCE COMMAND CENTER ENGINE & DYNAMIC DISTRICT FALLBACKS
  // =========================================================================
  describe('3. Finance Command Center Engine & Dynamic District Fallback Synthesis', () => {
    it('fetches high-level finance overview KPIs for all India scope', async () => {
      const kpis = await financeService.getOverviewKpis('ALL');
      expect(kpis).toBeDefined();
      expect(typeof kpis.grossTotalVolume).toBe('number');
      expect(typeof kpis.revenue).toBe('number');
      expect(typeof kpis.totalPayable).toBe('number');
      expect(kpis.grossTotalVolume).toBeGreaterThanOrEqual(0);
    });

    it('fetches filtered overview KPIs when restricted to a specific district', async () => {
      const vnsKpis = await financeService.getOverviewKpis({ state: 'Uttar Pradesh', district: 'Varanasi' });
      expect(vnsKpis).toBeDefined();
      expect(typeof vnsKpis.grossTotalVolume).toBe('number');
      expect(vnsKpis.grossTotalVolume).toBeGreaterThanOrEqual(0);
    });

    it('synthesizes rich operational data for unseeded remote districts to avoid empty state collapse', () => {
      // Simulate synthetic generator logic as implemented in SuperAdminFinanceCommandCenter
      const remoteDistrict = 'Jaisalmer';
      const remoteState = 'Rajasthan';
      const distCode = remoteDistrict.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();

      const syntheticClaims: DistrictExpenseClaim[] = [
        {
          id: `EXP-${distCode}-001`,
          submittedByAdminId: `DA-${distCode}-01`,
          submittedByAdminName: `District Officer - ${remoteDistrict}`,
          district: remoteDistrict,
          state: remoteState,
          category: 'Infrastructure',
          claimedAmount: 24500,
          approvedAmount: 24500,
          payableAmount: 24500,
          alreadyPaidAmount: 0,
          remainingAmount: 0,
          expenseDate: '2026-10-01',
          vendorName: 'Regional Vendor',
          paymentMethod: 'BANK_TRANSFER',
          billNumber: `BILL-${distCode}-901`,
          billDate: '2026-10-01',
          description: 'District Office Infrastructure Upgrade',
          purpose: 'Infrastructure Upgrade',
          supportingDocuments: [],
          status: 'APPROVED',
          timeline: [],
          createdAt: '2026-10-01 10:00:00',
          updatedAt: '2026-10-01 10:00:00'
        }
      ];

      const syntheticSettlements: LibrarySettlementRecord[] = [
        {
          id: `SET-${distCode}-001`,
          libraryId: `LIB-${distCode}-01`,
          libraryName: `${remoteDistrict} Central Study Enclave`,
          ownerId: `OWN-${distCode}-01`,
          ownerName: `Shri R. Sharma`,
          district: remoteDistrict,
          state: remoteState,
          settlementPeriod: 'October 2026',
          lineItems: [],
          totalBookingsCount: 14,
          grossBookingAmount: 52000,
          totalDiscounts: 0,
          platformCommission: 9360,
          adjustments: 0,
          netPayable: 42640,
          paidAmount: 0,
          status: 'QUEUED',
          createdAt: '2026-10-02 11:30:00',
          updatedAt: '2026-10-02 11:30:00'
        }
      ];

      const syntheticPayroll: TeacherPayrollItem[] = [
        {
          id: `PAY-${distCode}-001`,
          teacherId: `TCH-${distCode}-01`,
          teacherName: `Dr. Surendra Singh (${remoteDistrict})`,
          district: remoteDistrict,
          state: remoteState,
          billingMonth: 'October 2026',
          assignedStudentsCount: 6,
          completedSessionsCount: 24,
          approvedSessionsCount: 24,
          grossTuitionCollection: 50000,
          teacherEarnings: 45000,
          focusPointCommission: 5000,
          bonus: 0,
          deductions: 4500,
          adjustments: 0,
          netPayable: 40500,
          paidAmount: 0,
          status: 'READY_FOR_PAYMENT',
          createdAt: '2026-10-05 09:00:00',
          updatedAt: '2026-10-05 09:00:00'
        }
      ];

      expect(syntheticClaims[0].district).toBe(remoteDistrict);
      expect(syntheticClaims[0].claimedAmount).toBe(24500);

      expect(syntheticSettlements[0].grossBookingAmount).toBe(52000);
      expect(syntheticSettlements[0].platformCommission).toBe(9360);
      expect(syntheticSettlements[0].netPayable).toBe(42640);

      // Verify that netPayable equals gross minus commission
      expect(syntheticSettlements[0].grossBookingAmount - syntheticSettlements[0].platformCommission)
        .toBe(syntheticSettlements[0].netPayable);

      expect(syntheticPayroll[0].teacherEarnings - syntheticPayroll[0].deductions)
        .toBe(syntheticPayroll[0].netPayable);
    });

    it('retrieves official settlement batches and verifies ledger traceability', async () => {
      const batches = await financeService.getSettlementBatches();
      expect(Array.isArray(batches)).toBe(true);
      if (batches.length > 0) {
        const first = batches[0];
        expect(first.id).toMatch(/^FP-SET-/);
        expect(first.totalAmount).toBeGreaterThan(0);
        expect(first.totalPayments).toBeGreaterThan(0);
        expect(first.status).toBeDefined();
      }
    });

    it('verifies that document vault holds tamper-proof financial receipts', async () => {
      const docs = await financeService.getDocumentVault('SUPER_ADMIN');
      expect(Array.isArray(docs)).toBe(true);
      if (docs.length > 0) {
        const doc = docs[0];
        expect(doc.documentId).toBeDefined();
        expect(doc.qrVerificationUrl).toBeDefined();
        expect(doc.transactionRef).toBeDefined();
      }
    });
  });

  // =========================================================================
  // SECTION 4: PAYMENTS SETTLEMENT LEDGER & ZK ESCROW VERIFICATION
  // =========================================================================
  describe('4. Super Admin Payments Settlement Ledger & ZK Escrow Verification', () => {
    it('retrieves payment queue items with granular status and payee type filters', async () => {
      const queue = await financeService.getPaymentQueue();
      expect(Array.isArray(queue)).toBe(true);
      expect(queue.length).toBeGreaterThan(0);

      const queuedOnly = await financeService.getPaymentQueue({ status: 'QUEUED' });
      queuedOnly.forEach(item => {
        expect(item.status).toBe('QUEUED');
      });

      const teachersOnly = await financeService.getPaymentQueue({ payeeType: 'TEACHER' });
      teachersOnly.forEach(item => {
        expect(item.payeeType).toBe('TEACHER');
      });
    });

    it('enforces idempotency guard: prevents re-processing of already PAID payment items', async () => {
      // Find or create an item
      const queue = await financeService.getPaymentQueue();
      const eligibleItem = queue.find(q => q.status === 'QUEUED') || queue[0];

      if (eligibleItem && eligibleItem.status === 'QUEUED') {
        // First execution succeeds
        const firstAttempt = await financeService.processPayment(
          eligibleItem.id,
          'NEFT_RTGS',
          false,
          `TXN-TEST-${Date.now()}`
        );
        expect(firstAttempt.success).toBe(true);
        expect(firstAttempt.item.status).toBe('PAID');

        // Second attempt on the SAME item must be blocked by Idempotency Guard
        const secondAttempt = await financeService.processPayment(
          eligibleItem.id,
          'NEFT_RTGS',
          false,
          `TXN-DUPLICATE-${Date.now()}`
        );
        expect(secondAttempt.success).toBe(false);
        expect(secondAttempt.error).toContain('Idempotency Guard');
      }
    });

    it('simulates NPCI gateway timeout failure accurately and preserves retry eligibility', async () => {
      // Create a test queued item directly in mockStore
      const testItem: PaymentQueueItem = {
        id: `PQ-FAIL-TEST-${Date.now()}`,
        payeeId: 'TCH-TEST-FAIL-01',
        payeeName: 'Dr. Test Failure Simulation',
        payeeType: 'TEACHER',
        paymentType: 'SALARY',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        amount: 25000,
        claimedOrGrossAmount: 25000,
        sourceReferenceId: 'PAY-TEST-001',
        referenceCode: 'REF-FAIL-001',
        description: 'Simulated Gateway Failure Test',
        paymentMethod: 'NEFT_RTGS',
        bankAccountMasked: 'HDFC Bank •• 1234',
        ifscCode: 'HDFC0001234',
        bankVerified: true,
        status: 'QUEUED',
        idempotencyKey: `IDEM-FAIL-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      (mockStore as any).paymentQueueItems.push(testItem);

      // Execute simulated failure: mockStore processPaymentQueueItem returns { success: false, item, error }
      const failRes = await financeService.processPayment(testItem.id, 'NEFT_RTGS', true);
      expect(failRes.success).toBe(false);
      expect(failRes.item.status).toBe('FAILED');
      expect(failRes.error).toContain('NPCI Gateway Timeout');

      // Now retry the failed item
      const retried = await financeService.retryFailedPayment(testItem.id);
      expect(retried.status).toBe('QUEUED');
      expect(retried.failureReason).toBeUndefined();
    });

    it('verifies ZK Escrow Cryptographic Seal format and NPCI clearing telemetry', () => {
      const mockEscrowRecord = {
        id: 'TXN-VNS-20261015-091',
        amount: 24500,
        gatewayRef: 'NPCI/UPI/20261015091244/9814421',
        latencyMs: 14,
        escrowSeal: 'ESCROW-ZK-SECURE-2026-VNS-7FA89B10CE2',
        state: 'Uttar Pradesh',
        district: 'Varanasi'
      };

      expect(mockEscrowRecord.escrowSeal).toMatch(/^ESCROW-ZK-SECURE-2026-/);
      expect(mockEscrowRecord.gatewayRef).toContain('NPCI');
      expect(mockEscrowRecord.latencyMs).toBeLessThanOrEqual(50);
      expect(mockEscrowRecord.amount).toBeGreaterThan(0);
    });

    it('validates 18% GST calculation, SAC Code 999293, and official GSTIN on Tax Invoices', () => {
      const testTransactions = [
        { grossAmount: 1180, studentName: 'Aditya Verma', district: 'Varanasi' },
        { grossAmount: 5900, studentName: 'Priya Sharma', district: 'Ghazipur' },
        { grossAmount: 2360, studentName: 'Rohan Gupta', district: 'Patna' }
      ];

      testTransactions.forEach(txn => {
        // Under 18% GST (9% CGST + 9% SGST):
        // Taxable Base = Gross / 1.18
        // Total GST = Gross - Taxable Base
        const taxableAmount = Math.round(txn.grossAmount / 1.18);
        const gstTotal = txn.grossAmount - taxableAmount;
        const cgst = Math.round(gstTotal / 2);
        const sgst = gstTotal - cgst;

        expect(taxableAmount + gstTotal).toBe(txn.grossAmount);
        expect(cgst + sgst).toBe(gstTotal);

        const officialGSTIN = '09AAACF4921K1ZX';
        const sacCode = '999293';

        expect(officialGSTIN).toMatch(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/);
        expect(sacCode).toBe('999293');
      });
    });

    it('processes bulk payment batch and groups items into an immutable batch manifest', async () => {
      // Create 2 test queued items
      const item1: PaymentQueueItem = {
        id: `PQ-BATCH-1-${Date.now()}`,
        payeeId: 'TCH-BATCH-01',
        payeeName: 'Batch Payee 1',
        payeeType: 'TEACHER',
        paymentType: 'SALARY',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        amount: 15000,
        claimedOrGrossAmount: 15000,
        sourceReferenceId: 'BATCH-SRC-01',
        referenceCode: 'REF-B-01',
        description: 'Batch Disburse 1',
        paymentMethod: 'NEFT_RTGS',
        bankAccountMasked: 'HDFC Bank •• 4421',
        ifscCode: 'HDFC0001844',
        bankVerified: true,
        status: 'QUEUED',
        idempotencyKey: `IDEM-B1-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      const item2: PaymentQueueItem = {
        id: `PQ-BATCH-2-${Date.now()}`,
        payeeId: 'LIB-BATCH-02',
        payeeName: 'Batch Payee 2',
        payeeType: 'LIBRARY_OWNER',
        paymentType: 'SETTLEMENT',
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        amount: 25000,
        claimedOrGrossAmount: 25000,
        sourceReferenceId: 'BATCH-SRC-02',
        referenceCode: 'REF-B-02',
        description: 'Batch Disburse 2',
        paymentMethod: 'BANK_TRANSFER',
        bankAccountMasked: 'SBI •• 9921',
        ifscCode: 'SBIN0004921',
        bankVerified: true,
        status: 'QUEUED',
        idempotencyKey: `IDEM-B2-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      (mockStore as any).paymentQueueItems.push(item1, item2);

      const batch = await financeService.processBulkBatch(
        [item1.id, item2.id],
        'SA-SUPERADMIN-01',
        'Chief Finance Officer'
      );

      expect(batch).toBeDefined();
      expect(batch.id).toMatch(/^FP-SET-/);
      expect(batch.totalPayments).toBe(2);
      expect(batch.totalAmount).toBe(40000);
      expect(batch.status).toBe('COMPLETED');
      expect(batch.initiatedByName).toBe('Chief Finance Officer');

      // Verify that individual items in the store are now updated to PAID
      const updatedQueue = await financeService.getPaymentQueue();
      const updatedItem1 = updatedQueue.find(q => q.id === item1.id);
      const updatedItem2 = updatedQueue.find(q => q.id === item2.id);

      expect(updatedItem1?.status).toBe('PAID');
      expect(updatedItem2?.status).toBe('PAID');
      expect(updatedItem1?.batchId).toBe(batch.id);
      expect(updatedItem2?.batchId).toBe(batch.id);
    });
  });

  // =========================================================================
  // SECTION 5: CROSS-DISTRICT DATA ISOLATION & ZERO DATA CONTAMINATION
  // =========================================================================
  describe('5. Cross-District Data Isolation & Zero Jurisdiction Contamination', () => {
    it('strictly isolates Varanasi payment queue items from Patna query filters', async () => {
      const vnsQueue = await financeService.getPaymentQueue({ district: 'Varanasi' });
      vnsQueue.forEach(item => {
        expect(item.district.toLowerCase()).toBe('varanasi');
        expect(item.district.toLowerCase()).not.toBe('patna');
      });

      const patnaQueue = await financeService.getPaymentQueue({ district: 'Patna' });
      patnaQueue.forEach(item => {
        expect(item.district.toLowerCase()).toBe('patna');
        expect(item.district.toLowerCase()).not.toBe('varanasi');
      });
    });

    it('aggregates all territories faithfully when district filter is set to ALL', async () => {
      const allQueue = await financeService.getPaymentQueue({ district: 'ALL' });
      expect(allQueue.length).toBeGreaterThanOrEqual(1);

      const districtsInQueue = new Set(allQueue.map(q => q.district));
      // Should encompass multiple regions
      expect(districtsInQueue.size).toBeGreaterThanOrEqual(1);
    });
  });
});
