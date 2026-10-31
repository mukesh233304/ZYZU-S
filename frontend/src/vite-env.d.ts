/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BANK_ACCOUNT_NAME?: string;
  readonly VITE_BANK_ACCOUNT_NUMBER?: string;
  readonly VITE_BANK_IFSC?: string;
  readonly VITE_BANK_NAME?: string;
  readonly VITE_BANK_BRANCH?: string;
  readonly VITE_UPI_VPA?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
