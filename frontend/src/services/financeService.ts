// FOCUSPOINT Finance OS — Central Finance Service
import { mockStore } from '../mock/store';
import {
  PaymentQueueItem,
  SettlementBatch,
  MonthlyClosingRecord,
  FinancialAuditLog,
  FinanceSettingsConfig,
  OfficialDocument
} from '../types/finance';

export const financeService = {
  /**
   * Retrieves live high-level Finance Overview KPIs
   */
  async getOverviewKpis(filter: string | { state?: string; district?: string; locality?: string } = 'ALL'): Promise<any> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getFinanceOverviewKpis(filter);
  },

  /**
   * Fetches unified Payment Queue items with filters
   */
  async getPaymentQueue(filters?: {
    payeeType?: string;
    state?: string;
    district?: string;
    status?: string;
    paymentType?: string;
  }): Promise<PaymentQueueItem[]> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.getPaymentQueue(filters);
  },

  /**
   * Processes a single payment queue item with simulated gateway confirmation
   */
  async processPayment(
    itemId: string,
    paymentMethod: string = 'NEFT_RTGS',
    simulateFailure: boolean = false,
    transactionRef?: string
  ): Promise<{ success: boolean; item: PaymentQueueItem; officialDocument?: OfficialDocument; error?: string }> {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.processPaymentQueueItem(itemId, paymentMethod, simulateFailure, transactionRef);
  },

  /**
   * Processes a bulk batch of selected payment queue items
   */
  async processBulkBatch(
    itemIds: string[],
    adminId: string,
    adminName: string
  ): Promise<SettlementBatch> {
    await new Promise(r => setTimeout(r, 300));
    return mockStore.processBulkPaymentBatch(itemIds, adminId, adminName);
  },

  /**
   * Retrieves all historical settlement batches
   */
  async getSettlementBatches(): Promise<SettlementBatch[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getSettlementBatches();
  },

  /**
   * Retrieves batch details with line items
   */
  async getSettlementBatchById(batchId: string): Promise<{ batch: SettlementBatch; items: PaymentQueueItem[] } | null> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getSettlementBatchById(batchId);
  },

  /**
   * Retries a failed payment item
   */
  async retryFailedPayment(itemId: string): Promise<PaymentQueueItem> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.retryFailedPayment(itemId);
  },

  /**
   * Fetches official documents for the Document Vault based on caller role
   */
  async getDocumentVault(role?: string, entityId?: string, district?: string): Promise<OfficialDocument[]> {
    await new Promise(r => setTimeout(r, 70));
    return mockStore.getAllOfficialDocuments(role, entityId, district);
  },

  /**
   * Verifies an official document by its ID (QR verification flow)
   */
  async verifyDocument(documentId: string): Promise<OfficialDocument | null> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getOfficialDocument(documentId);
  },

  /**
   * Retrieves an official document by documentId
   */
  async getOfficialDocument(documentId: string): Promise<OfficialDocument | null> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getOfficialDocument(documentId);
  },

  /**
   * Retrieves monthly closing records
   */
  async getMonthlyClosings(district?: string): Promise<MonthlyClosingRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getMonthlyClosingRecords(district);
  },

  /**
   * Closes a financial period snapshot
   */
  async closeFinancialMonth(
    month: string,
    year: number,
    district: string,
    closedBy: string,
    closedByName: string
  ): Promise<MonthlyClosingRecord> {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.closeFinancialMonth(month, year, district, closedBy, closedByName);
  },

  /**
   * Retrieves configurable finance settings
   */
  async getSettings(): Promise<FinanceSettingsConfig> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getFinanceSettings();
  },

  /**
   * Updates finance settings
   */
  async updateSettings(updates: Partial<FinanceSettingsConfig>): Promise<FinanceSettingsConfig> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateFinanceSettings(updates);
  },

  /**
   * Toggles expense category active state
   */
  async toggleCategory(categoryId: string, isActive: boolean): Promise<FinanceSettingsConfig> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.toggleExpenseCategory(categoryId, isActive);
  },

  /**
   * Adds an expense category
   */
  async addCategory(name: any, subCategories: string[]): Promise<FinanceSettingsConfig> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.addExpenseCategory(name, subCategories);
  },

  /**
   * Retrieves immutable financial audit logs
   */
  async getAuditLogs(district?: string, entityType?: string): Promise<FinancialAuditLog[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getFinancialAuditLogs(district, entityType);
  }
};
