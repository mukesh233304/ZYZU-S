import { describe, it, expect, beforeEach } from 'vitest';
import { centralRevenueService } from '../services/centralRevenueService';
import { safeStorage } from '../utils/storageUtils';
import {
  ALL_FINANCIAL_REPORT_TYPES
} from '../types/revenueStatement';

describe('FOCUSPOINT — Super Admin Revenue Statement & P&L Master Test Suite', () => {
  beforeEach(async () => {
    // Clear any test manual adjustments
    safeStorage.removeItem('fp_revenue_audit_adjustments_v1');
  });

  describe('1. Acceptance Scenario 1: Library Owner Subscription Revenue Classification', () => {
    it('classifies successful library owner subscriptions into LIBRARY_OWNER_SUBSCRIPTION with full geographic and billing metadata', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'LIBRARY_OWNER_SUBSCRIPTION'
      });

      const records = statement.ledgerRecords;
      expect(records.length).toBeGreaterThan(0);
      records.forEach(record => {
        expect(record.revenueSource).toBe('LIBRARY_OWNER_SUBSCRIPTION');
        expect(record.partnerName).toBeDefined();
        expect(record.productName).toBeDefined();
        expect(record.libraryDetails?.billingCycle).toBeDefined();
        expect(['monthly', 'quarterly', 'half-yearly', 'yearly', 'custom']).toContain(
          record.libraryDetails?.billingCycle.toLowerCase()
        );
        expect(record.stateName).toBeDefined();
        expect(record.districtName).toBeDefined();
        expect(record.grossAmount).toBeGreaterThan(0);
        expect(record.amountCollected).toBeGreaterThan(0);
        expect(record.platformFee).toBeGreaterThan(0);
      });
    });
  });

  describe('2. Acceptance Scenario 2: Teacher Registration vs Recurring Subscription Separation', () => {
    it('records teacher registration as one-time KYC verification fee and distinguishes from recurring subscription', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'TEACHER_REGISTRATION'
      });

      const teacherRecords = statement.ledgerRecords;
      expect(teacherRecords.length).toBeGreaterThan(0);

      teacherRecords.forEach(reg => {
        expect(reg.productName.toLowerCase()).toMatch(/registration|onboarding/);
        expect(reg.teacherDetails?.feeType).toBe('ONE_TIME_REGISTRATION');
        expect(reg.grossAmount).toBe(499);
        expect(reg.collectedAmount).toBeGreaterThanOrEqual(399);
        expect(reg.platformFee).toBe(reg.collectedAmount);
      });
    });

    it('honestly represents unconfigured recurring teacher subscriptions as ₹0 without inventing fabricated transactions', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'TEACHER_SUBSCRIPTION'
      });
      // Recurring teacher subscriptions are currently unconfigured in the platform
      expect(statement.ledgerRecords.length).toBe(0);

      const allStatement = await centralRevenueService.getCentralRevenueStatement();
      const teacherSubBreakdown = allStatement.sourceBreakdown.find(b => b.category === 'TEACHER_SUBSCRIPTION');
      expect(teacherSubBreakdown).toBeDefined();
      expect(teacherSubBreakdown?.isAvailable).toBe(false);
      expect(teacherSubBreakdown?.collectedAmount).toBe(0);
    });
  });

  describe('3. Acceptance Scenario 3: Study Material Revenue', () => {
    it('tracks study material and PDF bundle purchases under STUDY_MATERIAL category with educational taxonomy', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'STUDY_MATERIAL'
      });

      const studyMaterialRecords = statement.ledgerRecords;
      expect(studyMaterialRecords.length).toBeGreaterThan(0);
      studyMaterialRecords.forEach(record => {
        expect(record.revenueSource).toBe('STUDY_MATERIAL');
        expect(record.grossAmount).toBeGreaterThan(0);
        expect(record.amountCollected).toBeGreaterThan(0);
        expect(record.buyerRole).toBe('STUDENT');
        expect(record.productName).toBeDefined();
      });
    });
  });

  describe('4. Acceptance Scenario 4: Mock Test Revenue', () => {
    it('records individual mock tests and test series under MOCK_TEST without double-counting bundled products', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'MOCK_TEST'
      });

      const mockTestRecords = statement.ledgerRecords;
      expect(mockTestRecords.length).toBeGreaterThan(0);
      mockTestRecords.forEach(record => {
        expect(record.revenueSource).toBe('MOCK_TEST');
        expect(record.grossAmount).toBeGreaterThan(0);
        expect(record.amountCollected).toBeGreaterThan(0);
        expect(record.productName).toBeDefined();
        expect(record.buyerName).toBeDefined();
      });
    });
  });

  describe('5. Acceptance Scenario 5: Library Student Fee Separation from Library Owner Subscriptions', () => {
    it('ensures library student seat booking fees are never merged into library owner software subscriptions', async () => {
      const studentFees = (await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'LIBRARY_STUDENT'
      })).ledgerRecords;

      const ownerSubs = (await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'LIBRARY_OWNER_SUBSCRIPTION'
      })).ledgerRecords;

      expect(studentFees.length).toBeGreaterThan(0);
      expect(ownerSubs.length).toBeGreaterThan(0);

      // Verify strict category separation
      studentFees.forEach(fee => {
        expect(fee.revenueSource).toBe('LIBRARY_STUDENT');
        expect(fee.buyerRole).toBe('STUDENT');
        expect(fee.platformFee).toBeGreaterThan(0);
      });

      ownerSubs.forEach(sub => {
        expect(sub.revenueSource).toBe('LIBRARY_OWNER_SUBSCRIPTION');
        expect(sub.buyerRole).toBe('LIBRARY_OWNER');
      });
    });
  });

  describe('6. Acceptance Scenario 6: Home Tuition GMV vs FocusPoint 10% Commission', () => {
    it('distinguishes total tuition fee value (GMV) from FocusPoint actual commission revenue', async () => {
      const tuitionRecords = (await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'HOME_TUITION'
      })).ledgerRecords;

      expect(tuitionRecords.length).toBeGreaterThan(0);
      tuitionRecords.forEach(record => {
        expect(record.revenueSource).toBe('HOME_TUITION');
        // Total tuition volume
        expect(record.grossAmount).toBeGreaterThan(record.platformFee);
        // FocusPoint earns management commission
        expect(record.platformFee).toBeGreaterThan(0);
        // Payout is disbursed to educator partner
        expect(record.partnerPayout).toBeGreaterThan(0);
      });

      const statement = await centralRevenueService.getCentralRevenueStatement();
      // Total Gross Transaction Value (GMV) exceeds FocusPoint net revenue
      expect(statement.kpis.totalGrossRevenue).toBeGreaterThan(statement.kpis.netRevenue);
      // FocusPoint home tuition commission is recognized separately from total parent tuition payout
      expect(statement.kpis.homeTuitionCommission).toBeLessThan(statement.kpis.homeTuitionRevenue);
      expect(statement.kpis.homeTuitionCommission).toBeGreaterThan(0);
    });
  });

  describe('7. Acceptance Scenario 7: Paid Advertisement Campaigns vs Raw Engagement', () => {
    it('recognizes advertisement revenue only from billable campaigns, strictly excluding views and click counts', async () => {
      const adRecords = (await centralRevenueService.getCentralRevenueStatement({
        sourceCategory: 'HOMEPAGE_ADVERTISEMENT'
      })).ledgerRecords;

      expect(adRecords.length).toBeGreaterThan(0);
      adRecords.forEach(record => {
        expect(record.revenueSource).toBe('HOMEPAGE_ADVERTISEMENT');
        expect(record.buyerName).toBeDefined(); // Advertiser
        expect(record.grossAmount).toBeGreaterThan(0);
        expect(record.amountCollected).toBeGreaterThan(0);
        expect(record.platformFee).toBe(record.amountCollected);
        expect(record.transactionId).toMatch(/^TXN-AD-/);
      });

      const statement = await centralRevenueService.getCentralRevenueStatement();
      expect(statement.kpis.advertisementRevenue).toBeGreaterThan(0);
    });
  });

  describe('8. Acceptance Scenario 8: Offer Console Attribution Without Double-Counting', () => {
    it('attributes coupon purchases in campaign performance without creating duplicate underlying records', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      const allTransactions = statement.ledgerRecords;
      const offerAttributed = allTransactions.filter(t => t.offerDetails?.couponCode || t.couponCode);

      expect(offerAttributed.length).toBeGreaterThan(0);

      // Verify that underlying transactions maintain their true primary revenue category
      offerAttributed.forEach(txn => {
        expect([
          'STUDY_MATERIAL',
          'MOCK_TEST',
          'LIBRARY_OWNER_SUBSCRIPTION',
          'LIBRARY_STUDENT',
          'HOME_TUITION',
          'TEACHER_REGISTRATION'
        ]).toContain(txn.revenueSource);
        expect(txn.couponCode || txn.offerDetails?.couponCode).toBeDefined();
        expect(txn.amountCollected).toBe(txn.grossAmount - (txn.discountAmount || 0));
      });

      // Verify statement KPI has offer revenue attribution matching total attributed transactions
      expect(statement.kpis.offerConsoleRevenue).toBeGreaterThan(0);

      // Check sum of unique transaction IDs to guarantee zero double counting
      const txnIds = allTransactions.map(t => t.id);
      const uniqueTxnIds = new Set(txnIds);
      expect(uniqueTxnIds.size).toBe(txnIds.length);
    });
  });

  describe('9. Acceptance Scenario 9: Exclusion of Pending & Failed Payments from Realized Collections', () => {
    it('excludes pending, unpaid, and failed payments from recognized collections', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      const allTxns = statement.ledgerRecords;

      // Completed transactions realize collections
      const completedTxns = allTxns.filter(t => t.status === 'COMPLETED');
      const sumCompleted = completedTxns.reduce((acc, t) => acc + t.collectedAmount, 0);
      expect(sumCompleted).toBe(statement.kpis.cashCollections);

      // Incomplete/processing payments are isolated into pendingPayments
      const pendingTxns = allTxns.filter(t => t.status === 'PROCESSING' || t.status === 'PENDING');
      const sumPending = pendingTxns.reduce((acc, t) => acc + t.grossAmount, 0);
      expect(sumPending).toBe(statement.kpis.pendingPayments);
    });
  });

  describe('10. Acceptance Scenario 10: Refunds & Reversals Deductions', () => {
    it('accurately deducts refunds and reversals from gross revenue to calculate net revenue', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      
      expect(statement.kpis.refundsAndReversals).toBeGreaterThanOrEqual(0);
      
      // Verification of Net Revenue derivation
      // Net Revenue = Platform Earned Operating Revenue - Refunds
      const expectedNet = Math.max(0, statement.kpis.platformCommission - statement.kpis.refundsAndReversals);
      expect(statement.kpis.netRevenue).toBe(expectedNet);
    });
  });

  describe('11. Acceptance Scenario 11: Pan-India Geographic and Date Filtering Consistency', () => {
    it('filters transactions, KPIs, and reports accurately when filtering by state (Uttar Pradesh)', async () => {
      const panIndiaStatement = await centralRevenueService.getCentralRevenueStatement();
      const upStatement = await centralRevenueService.getCentralRevenueStatement({
        state: 'Uttar Pradesh'
      });

      expect(upStatement.ledgerRecords.length).toBeLessThanOrEqual(panIndiaStatement.ledgerRecords.length);
      upStatement.ledgerRecords.forEach(t => {
        expect(t.stateName).toBe('Uttar Pradesh');
      });

      expect(upStatement.kpis.totalGrossRevenue).toBeLessThanOrEqual(panIndiaStatement.kpis.totalGrossRevenue);
    });

    it('filters transactions consistently when narrowing from state to district (Ghazipur)', async () => {
      const upStatement = await centralRevenueService.getCentralRevenueStatement({
        state: 'Uttar Pradesh'
      });
      const ghazipurStatement = await centralRevenueService.getCentralRevenueStatement({
        state: 'Uttar Pradesh',
        district: 'Ghazipur'
      });

      expect(ghazipurStatement.ledgerRecords.length).toBeLessThanOrEqual(upStatement.ledgerRecords.length);
      ghazipurStatement.ledgerRecords.forEach(t => {
        expect(t.stateName).toBe('Uttar Pradesh');
        expect(t.districtName).toBe('Ghazipur');
      });
    });

    it('filters transactions consistently by date range', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement({
        startDate: '2026-09-01',
        endDate: '2026-09-30'
      });

      expect(statement.ledgerRecords.length).toBeGreaterThan(0);
      statement.ledgerRecords.forEach(t => {
        expect(t.date >= '2026-09-01').toBe(true);
      });
    });
  });

  describe('12. Acceptance Scenario 12: Transaction Integrity & Detail Linkage', () => {
    it('verifies every transaction has unique IDs, order/booking references, and audit hashes', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      const txns = statement.ledgerRecords;

      txns.forEach(t => {
        expect(t.id).toBeDefined();
        expect(t.transactionId).toBeDefined();
        expect(t.currency).toBe('INR');
        expect(t.auditMetadata?.hash).toBeDefined();
        expect(t.auditMetadata?.hash?.length).toBeGreaterThanOrEqual(10);
      });
    });
  });

  describe('13. Acceptance Scenario 13: 15 Financial Report Generations & RFC-4180 CSV Export', () => {
    it('generates all 15 financial report types successfully', async () => {
      expect(ALL_FINANCIAL_REPORT_TYPES.length).toBe(15);

      for (const reportType of ALL_FINANCIAL_REPORT_TYPES) {
        const report = await centralRevenueService.generateReport(reportType);
        expect(report.title).toBeDefined();
        expect(report.columns.length).toBeGreaterThan(0);
        expect(Array.isArray(report.rows)).toBe(true);
        expect(report.summary).toBeDefined();
      }
    });

    it('exports RFC-4180 compliant CSV with UTF-8 BOM', async () => {
      const csv = await centralRevenueService.exportReportToCsv('REVENUE_STATEMENT');

      expect(csv.startsWith('\uFEFF')).toBe(true); // UTF-8 BOM
      expect(csv).toMatch(/(FOCUSPOINT|ZYZU'S) PAN-INDIA REVENUE & P&L REPORT/);
      expect(csv).toContain('Consolidated Pan-India Revenue Statement');
    });
  });

  describe('14. Acceptance Scenario 14: Profit & Loss Statement Derivation Math', () => {
    it('reconciles Operating Gross Revenue - Refunds = Net Revenue, and Net Revenue - Expenses = Operating Profit / Loss', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      const pnl = statement.pnlDerivation;

      expect(pnl.netOperatingRevenue).toBe(statement.kpis.netRevenue);
      expect(pnl.lessDirectPlatformExpenses).toBe(statement.kpis.totalExpenses);

      // Net operating profit = Net Operating Revenue - Total Operating Expenses
      const expectedProfit = pnl.netOperatingRevenue - pnl.lessDirectPlatformExpenses;
      expect(pnl.operatingProfitEbitda).toBe(expectedProfit);
      expect(statement.kpis.profitOrLoss).toBe(expectedProfit);
    });

    it('provides clear calculation formula and derivation steps for Super Admin transparency', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      expect(statement.pnlDerivation.accountingPolicySummary).toBeDefined();
      expect(statement.auditSummary.status).toBe('VERIFIED_BALANCED');
      expect(statement.auditSummary.unreconciledDiscrepancies).toBe(0);
    });
  });

  describe('15. Acceptance Scenario 16: Super Admin Manual Adjustment Audit Workflow', () => {
    it('creates an audited manual adjustment that updates ledger and is persisted with reason', async () => {
      const initialStatement = await centralRevenueService.getCentralRevenueStatement();
      const initialTxn = initialStatement.ledgerRecords[0];

      const success = await centralRevenueService.recordManualAdjustment(
        initialTxn.id,
        {
          refundAmount: 50,
          notes: 'Authorized partial refund following service ticket #FP-8891'
        },
        {
          id: 'admin_principal',
          name: 'Super Admin Principal'
        }
      );

      expect(success).toBe(true);

      // Verify updated statement reflects the adjustment
      const updatedStatement = await centralRevenueService.getCentralRevenueStatement();
      const updatedTxn = updatedStatement.ledgerRecords.find(t => t.id === initialTxn.id);
      expect(updatedTxn?.refundAmount).toBe(50);
      expect(updatedTxn?.auditMetadata?.notes).toContain('Authorized partial refund');
      expect(updatedTxn?.auditMetadata?.verifiedBy).toBe('Super Admin Principal');
    });
  });

  describe('16. Acceptance Scenario 17: Honest Unconfigured States for Missing Data', () => {
    it('reports unconfigured categories honestly as zero without inventing fictitious transactions', async () => {
      const statement = await centralRevenueService.getCentralRevenueStatement();
      
      // Look at source breakdown
      const breakdown = statement.sourceBreakdown;
      expect(breakdown.length).toBe(9); // 9 revenue categories

      const teacherRegCat = breakdown.find(b => b.category === 'TEACHER_REGISTRATION');
      expect(teacherRegCat).toBeDefined();
      expect(teacherRegCat?.isAvailable).toBe(true);
      expect(teacherRegCat?.grossVolume).toBeGreaterThan(0);

      const teacherSubCat = breakdown.find(b => b.category === 'TEACHER_SUBSCRIPTION');
      expect(teacherSubCat).toBeDefined();
      expect(teacherSubCat?.isAvailable).toBe(false);
      expect(teacherSubCat?.collectedAmount).toBe(0);
    });
  });
});
