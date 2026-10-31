// FOCUSPOINT Enterprise Payment Configuration
// Centralized configuration for Direct Bank Transfers, Unified UPI QR, and Razorpay Gateway
// To connect your live bank and Razorpay gateway, configure these in your .env:
// VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
// VITE_BANK_ACCOUNT_NO=xxxxxxxxxxxx
// VITE_BANK_IFSC=HDFC000xxxx
// VITE_BANK_BENEFICIARY="FOCUSPOINT EDUCATION TECHNOLOGIES PVT LTD"
// VITE_UPI_ID=focuspoint@hdfcbank

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  accountType: string;
}

export interface UpiDetails {
  vpa: string;
  payeeName: string;
  merchantCode?: string;
}

export interface RazorpayConfig {
  keyId: string;
  merchantName: string;
  currency: string;
  themeColor: string;
  isConfigured: boolean;
}

export const PAYMENT_CONFIG: {
  bankDetails: BankDetails;
  upi: UpiDetails;
  razorpay: RazorpayConfig;
} = {
  // 1. Official Corporate Bank Account for Direct IMPS / NEFT / RTGS
  bankDetails: {
    accountHolder: (import.meta.env.VITE_BANK_BENEFICIARY as string) || 'FOCUSPOINT EDUCATION TECHNOLOGIES PVT. LTD.',
    accountNumber: (import.meta.env.VITE_BANK_ACCOUNT_NO as string) || '50200084729104',
    ifscCode: (import.meta.env.VITE_BANK_IFSC as string) || 'HDFC0001234',
    bankName: (import.meta.env.VITE_BANK_NAME as string) || 'HDFC Bank Ltd.',
    branch: (import.meta.env.VITE_BANK_BRANCH as string) || 'Saidpur Branch, Ghazipur, UP – 233304',
    accountType: 'Current Account',
  },

  // 2. Official UPI VPA & Merchant Routing
  upi: {
    vpa: (import.meta.env.VITE_UPI_ID as string) || 'focuspoint@hdfcbank',
    payeeName: 'FocusPoint Technologies',
    merchantCode: '5411',
  },

  // 3. Razorpay Payment Gateway Integration
  razorpay: {
    keyId: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || '',
    merchantName: 'FocusPoint Education Technologies',
    currency: 'INR',
    themeColor: '#4f46e5',
    isConfigured: Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID && (import.meta.env.VITE_RAZORPAY_KEY_ID as string).startsWith('rzp_')),
  },
};

/**
 * Generate a standard UPI payment URI that opens UPI apps on mobile or displays in QR
 */
export const buildUpiPaymentUri = (params: {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionRef: string;
}): string => {
  const q = new URLSearchParams({
    pa: params.vpa,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: 'INR',
    tn: params.transactionNote,
    tr: params.transactionRef,
  });
  return `upi://pay?${q.toString()}`;
};
