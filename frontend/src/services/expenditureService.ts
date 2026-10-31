// FOCUSPOINT Finance OS — District Expenditure Service
import { mockStore } from '../mock/store';
import { DistrictExpenseClaim, ExpenseClaimStatus, ExpenseCategory, OfficialDocument } from '../types/finance';

export const expenditureService = {
  /**
   * Retrieves district expenditure claims
   */
  async getClaims(district: string = 'ALL', status: string = 'ALL', category: string = 'ALL'): Promise<DistrictExpenseClaim[]> {
    await new Promise(r => setTimeout(r, 70));
    return mockStore.getDistrictExpenseClaims(district, status, category);
  },

  /**
   * Retrieves single expenditure claim by ID
   */
  async getClaimById(id: string): Promise<DistrictExpenseClaim | undefined> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getDistrictExpenseClaimById(id);
  },

  /**
   * Submits a new expenditure claim with multi-document attachments
   */
  async submitClaim(claimData: {
    district: string;
    state?: string;
    category: ExpenseCategory;
    subCategory?: string;
    description: string;
    purpose: string;
    claimedAmount: number;
    expenseDate: string;
    vendorName: string;
    paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'NEFT_RTGS' | 'CASH';
    referenceNumber?: string;
    billNumber: string;
    billDate: string;
    notes?: string;
    supportingDocuments?: { id: string; name: string; url: string; fileType: string; sizeBytes: number; uploadedAt: string }[];
    bankDetails?: {
      accountHolderName: string;
      bankName: string;
      accountNumberMasked: string;
      ifscCode: string;
      upiId?: string;
      verified: boolean;
    };
    submittedByAdminId: string;
    submittedByAdminName: string;
  }): Promise<DistrictExpenseClaim> {
    await new Promise(r => setTimeout(r, 120));
    return mockStore.submitDistrictExpenseClaim(claimData);
  },

  /**
   * Super Admin reviews and transitions claim status
   */
  async reviewClaim(params: {
    claimId: string;
    status: ExpenseClaimStatus;
    adminId: string;
    adminName: string;
    remarks?: string;
    approvedAmount?: number;
    rejectionReason?: string;
  }): Promise<DistrictExpenseClaim> {
    await new Promise(r => setTimeout(r, 120));
    return mockStore.reviewDistrictExpenseClaim(params);
  },

  /**
   * Super Admin one-click approves and executes disbursement
   */
  async approveAndPayClaim(params: {
    claimId: string;
    adminId: string;
    adminName: string;
    remarks?: string;
    approvedAmount?: number;
    paymentMethod?: string;
    transactionRef?: string;
  }): Promise<{ success: boolean; claim?: DistrictExpenseClaim; item?: any; officialDocument?: OfficialDocument; error?: string }> {
    await new Promise(r => setTimeout(r, 200));
    return mockStore.approveAndPayDistrictExpenseClaim(params);
  },

  /**
   * Retrieves official payment receipt for an expenditure claim
   */
  async getClaimReceipt(receiptNumber: string): Promise<OfficialDocument | null> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getOfficialDocument(receiptNumber);
  }
};
