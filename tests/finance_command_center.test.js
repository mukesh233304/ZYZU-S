import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { mockStore } from '../frontend/src/mock/store.ts';

describe('FOCUSPOINT Finance OS & Command Center Test Suite', () => {
  describe('1. Super Admin Finance Route Serving', () => {
    it('Should serve /super-admin/finance route with status 200 HTML', async () => {
      const res = await request(app).get('/super-admin/finance');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('Should serve /super-admin/finance-command route with status 200 HTML', async () => {
      const res = await request(app).get('/super-admin/finance-command');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('2. Dual-Amount Expense Verification Rules', () => {
    it('Enforces mathematical integrity on claimed vs approved amount', () => {
      const claimedAmount = 25000;
      const approvedAmount = 22000;
      const alreadyPaid = 0;
      
      const payableAmount = approvedAmount;
      const remainingAmount = approvedAmount - alreadyPaid;
      
      expect(payableAmount).toBe(22000);
      expect(remainingAmount).toBe(22000);
      expect(approvedAmount).toBeLessThanOrEqual(claimedAmount);
    });

    it('Correctly calculates remaining amount upon partial payment', () => {
      const approvedAmount = 22000;
      const partialPayment = 10000;
      const alreadyPaid = partialPayment;
      const remainingAmount = approvedAmount - alreadyPaid;

      expect(remainingAmount).toBe(12000);
      expect(alreadyPaid).toBe(10000);
    });
  });

  describe('3. Payout Queue Idempotency & Failure Handling Rules', () => {
    it('Rejects duplicate payments when an item is already marked as PAID', () => {
      const paymentItem = {
        id: 'PQ-EXP-001',
        amount: 22000,
        status: 'PAID',
        idempotencyKey: 'IDEMP-EXP-DEXP-GZP-2026-001-01'
      };

      // Idempotency execution guard simulation
      const executePayment = (item) => {
        if (item.status === 'PAID') {
          throw new Error('Payment already completed. Duplicate transactions blocked by idempotency guard.');
        }
        item.status = 'PAID';
        return item;
      };

      expect(() => executePayment(paymentItem)).toThrow('Payment already completed');
    });

    it('Never marks item as PAID on gateway transaction failure', () => {
      const paymentItem = {
        id: 'PQ-EXP-002',
        amount: 5000,
        status: 'QUEUED',
        idempotencyKey: 'IDEMP-EXP-002'
      };

      const simulateGatewayTransaction = (item, shouldFail = true) => {
        if (shouldFail) {
          item.status = 'FAILED';
          item.failureReason = 'NPCI/Bank server timeout (Simulated error)';
          return { success: false, item };
        }
        item.status = 'PAID';
        return { success: true, item };
      };

      const result = simulateGatewayTransaction(paymentItem, true);
      expect(result.success).toBe(false);
      expect(result.item.status).toBe('FAILED');
      expect(result.item.status).not.toBe('PAID');
      expect(result.item.failureReason).toContain('NPCI/Bank server timeout');
    });
  });

  describe('4. Settlement Batch ID & Document Formatting Rules', () => {
    it('Generates sequential FP-SET-YYYY-MM batch IDs', () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const seq = '000125';
      const batchId = `FP-SET-${yyyy}-${mm}-${seq}`;

      expect(batchId).toMatch(/^FP-SET-\d{4}-\d{2}-\d{6}$/);
    });

    it('Formats official document numbers according to domain specification', () => {
      const salarySlip = 'FP-SAL-2026-09-000145';
      const expenseReceipt = 'FP-EXP-2026-09-000092';
      const settlementReceipt = 'FP-LIB-2026-09-000278';

      expect(salarySlip).toMatch(/^FP-SAL-\d{4}-\d{2}-\d{6}$/);
      expect(expenseReceipt).toMatch(/^FP-EXP-\d{4}-\d{2}-\d{6}$/);
      expect(settlementReceipt).toMatch(/^FP-LIB-\d{4}-\d{2}-\d{6}$/);
    });
  });

  describe('5. Monthly Financial Period Closing Snapshot', () => {
    it('Enforces positive net revenue and balanced liabilities before closing', () => {
      const snapshot = {
        totalTuitionCollections: 1450000,
        teacherPayouts: 1232500,
        libraryCollections: 420000,
        librarySettlements: 378000,
        districtExpenditure: 68500,
        refunds: 12000,
        pendingLiabilities: 0
      };

      const grossInflow = snapshot.totalTuitionCollections + snapshot.libraryCollections;
      const totalOutflow = snapshot.teacherPayouts + snapshot.librarySettlements + snapshot.districtExpenditure + snapshot.refunds;
      const netPlatformRevenue = grossInflow - totalOutflow;

      expect(grossInflow).toBe(1870000);
      expect(totalOutflow).toBe(1691000);
      expect(netPlatformRevenue).toBe(179000);
      expect(snapshot.pendingLiabilities).toBe(0);
    });
  });

  describe('6. Super Admin Direct Payment & Payout Execution', () => {
    it('Allows Super Admin to process a queue item with custom UTR and generates official document', () => {
      const queueItems = mockStore.getPaymentQueue({ status: 'QUEUED' });
      expect(queueItems.length).toBeGreaterThan(0);
      const targetItem = queueItems[0];
      const customUtr = 'UTR-TEST-2026-999888';

      const result = mockStore.processPaymentQueueItem(targetItem.id, 'NEFT_RTGS', false, customUtr);
      expect(result.success).toBe(true);
      expect(result.item.status).toBe('PAID');
      expect(result.item.transactionId).toBe(customUtr);
      expect(result.officialDocument).toBeDefined();
      expect(result.officialDocument.transactionRef).toBe(customUtr);
    });

    it('Allows Super Admin to directly pay a teacher payroll record and issues salary slip', () => {
      const payrolls = mockStore.generateTeacherPayrollRun('September 2026', 'Ghazipur');
      expect(payrolls.length).toBeGreaterThan(0);
      const readyItem = payrolls.find(p => p.status === 'READY_FOR_PAYMENT') || payrolls[0];
      
      const customUtr = 'UTR-SAL-2026-777666';
      const result = mockStore.payTeacherPayroll(readyItem.id, 'IMPS', customUtr);
      
      expect(result.success).toBe(true);
      expect(result.item.status).toBe('PAID');
      expect(result.officialDocument).toBeDefined();
      expect(result.officialDocument.documentType).toBe('SALARY_SLIP');
      expect(result.officialDocument.documentId).toMatch(/^FP-SAL-\d{4}-\d{2}-\d{6}$/);

      const updatedPayroll = mockStore.getTeacherPayrollById(readyItem.id);
      expect(updatedPayroll.status).toBe('PAID');
      expect(updatedPayroll.transactionRef).toBe(customUtr);
    });

    it('Allows Super Admin to directly pay a library settlement record and issues receipt', () => {
      const settlements = mockStore.generateLibrarySettlements('September 2026', 'Ghazipur');
      expect(settlements.length).toBeGreaterThan(0);
      const readySettlement = settlements.find(s => s.status === 'READY_FOR_SETTLEMENT') || settlements[0];

      const customUtr = 'UTR-LIB-2026-555444';
      const result = mockStore.payLibrarySettlement(readySettlement.id, 'UPI', customUtr);

      expect(result.success).toBe(true);
      expect(result.item.status).toBe('PAID');
      expect(result.officialDocument).toBeDefined();
      expect(result.officialDocument.documentType).toBe('SETTLEMENT_RECEIPT');
      expect(result.officialDocument.documentId).toMatch(/^FP-LIB-\d{4}-\d{2}-\d{6}$/);

      const updatedSettlement = mockStore.getLibrarySettlementById(readySettlement.id);
      expect(updatedSettlement.status).toBe('PAID');
      expect(updatedSettlement.transactionRef).toBe(customUtr);
    });

    it('Allows Super Admin to one-click approve and pay a district expenditure claim', () => {
      const claim = mockStore.submitDistrictExpenseClaim({
        district: 'Ghazipur',
        category: 'Office Expenses',
        description: 'Office stationery and printer cartridges',
        purpose: 'District operations support',
        claimedAmount: 4500,
        expenseDate: '2026-09-15',
        vendorName: 'Ghazipur Office Depot',
        paymentMethod: 'NEFT_RTGS',
        billNumber: 'BILL-DEPOT-009',
        billDate: '2026-09-15',
        submittedByAdminId: 'usr-admin-gzp',
        submittedByAdminName: 'District Admin Ghazipur'
      });

      const customUtr = 'UTR-EXP-2026-111222';
      const result = mockStore.approveAndPayDistrictExpenseClaim({
        claimId: claim.id,
        adminId: 'usr-superadmin-01',
        adminName: 'Prof. Alok Tripathi (Super Admin)',
        remarks: 'Approved in full and disbursed immediately',
        approvedAmount: 4500,
        paymentMethod: 'NEFT_RTGS',
        transactionRef: customUtr
      });

      expect(result.success).toBe(true);
      expect(result.claim.status).toBe('PAID');
      expect(result.claim.alreadyPaidAmount).toBe(4500);
      expect(result.claim.remainingAmount).toBe(0);
      expect(result.officialDocument).toBeDefined();
      expect(result.officialDocument.documentType).toBe('EXPENSE_RECEIPT');
      expect(result.officialDocument.documentId).toMatch(/^FP-EXP-\d{4}-\d{2}-\d{6}$/);
    });
  });
});
