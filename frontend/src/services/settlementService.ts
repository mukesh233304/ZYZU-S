// FOCUSPOINT Finance OS — Library Seat Booking Settlement Service
import { mockStore } from '../mock/store';
import { LibrarySettlementRecord, OfficialDocument } from '../types/finance';

export const settlementService = {
  /**
   * Retrieves library settlement records
   */
  async getSettlements(period: string = 'ALL', district: string = 'ALL', status: string = 'ALL', libraryId?: string): Promise<LibrarySettlementRecord[]> {
    await new Promise(r => setTimeout(r, 70));
    return mockStore.getLibrarySettlementRecords(period, district, status, libraryId);
  },

  async getLibrarySettlements(params?: { period?: string; district?: string; status?: string; libraryId?: string }): Promise<LibrarySettlementRecord[]> {
    return this.getSettlements(params?.period || 'ALL', params?.district || 'ALL', params?.status || 'ALL', params?.libraryId);
  },

  /**
   * Retrieves single library settlement by ID
   */
  async getSettlementById(id: string): Promise<LibrarySettlementRecord | undefined> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getLibrarySettlementById(id);
  },

  /**
   * Generates library seat booking settlements for a period
   */
  async generateSettlementRun(period: string = 'September 2026', district: string = 'ALL'): Promise<LibrarySettlementRecord[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.generateLibrarySettlements(period, district);
  },

  /**
   * Enqueues library settlement for payment
   */
  async queueSettlement(id: string): Promise<LibrarySettlementRecord> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.queueLibrarySettlement(id);
  },

  /**
   * Super Admin directly settles / pays library seat booking settlement
   */
  async paySettlement(
    settlementId: string,
    paymentMethod: string = 'NEFT_RTGS',
    transactionRef?: string
  ): Promise<{ success: boolean; item?: any; officialDocument?: OfficialDocument; error?: string }> {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.payLibrarySettlement(settlementId, paymentMethod, transactionRef);
  },

  /**
   * Retrieves official settlement payment receipt
   */
  async getSettlementReceipt(receiptNumber: string): Promise<OfficialDocument | null> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getOfficialDocument(receiptNumber);
  }
};
