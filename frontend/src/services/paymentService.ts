import { PAYMENT_CONFIG, buildUpiPaymentUri } from '../constants/paymentConfig';

export interface PaymentInitiationResult {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  gatewayResponse?: any;
  error?: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentService = {
  getPaymentConfig() {
    return PAYMENT_CONFIG;
  },

  getUpiUri(amount: number, invoiceNumber: string, studentName: string) {
    const txnRef = `FP-${invoiceNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;
    return buildUpiPaymentUri({
      vpa: PAYMENT_CONFIG.upi.vpa,
      payeeName: PAYMENT_CONFIG.upi.payeeName,
      amount,
      transactionNote: `Fee ${invoiceNumber} ${studentName}`,
      transactionRef: txnRef,
    });
  },

  async openRazorpayCheckout(params: {
    amount: number;
    invoiceNumber: string;
    description: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    onSuccess: (txnId: string, details: any) => void;
    onError: (err: string) => void;
  }): Promise<void> {
    const { amount, invoiceNumber, description, studentName, studentEmail, studentPhone, onSuccess, onError } = params;

    // Check if live key is configured
    if (PAYMENT_CONFIG.razorpay.isConfigured && PAYMENT_CONFIG.razorpay.keyId) {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        onError('Failed to connect to Razorpay Gateway. Please verify internet connection.');
        return;
      }

      const options = {
        key: PAYMENT_CONFIG.razorpay.keyId,
        amount: Math.round(amount * 100), // paise
        currency: PAYMENT_CONFIG.razorpay.currency,
        name: PAYMENT_CONFIG.razorpay.merchantName,
        description: `${description} (${invoiceNumber})`,
        image: '/assets/images/focuspoint_hero_bg.jpg',
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentPhone,
        },
        notes: {
          invoiceNumber,
          purpose: 'FocusPoint Tuition / Library Fee',
        },
        theme: {
          color: PAYMENT_CONFIG.razorpay.themeColor,
        },
        handler: (response: any) => {
          onSuccess(response.razorpay_payment_id || `RZP-TXN-${Date.now().toString().slice(-8)}`, response);
        },
        modal: {
          ondismiss: () => {
            onError('Payment session was dismissed by the user.');
          },
        },
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        onError(err.message || 'Error opening Razorpay checkout.');
      }
    } else {
      // Test / Sandbox Mode with clear instruction
      onError('RAZORPAY_SANDBOX_FALLBACK');
    }
  },
};
