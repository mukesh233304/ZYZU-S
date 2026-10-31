import React from 'react';
import { UnifiedFeeReceipt, convertReceiptDataToDocument } from '../documents/UnifiedFeeReceipt';

export interface ReceiptData {
  receiptNumber: string;
  invoiceNumber?: string;
  date: string;
  studentName: string;
  studentId: string;
  studentMobile?: string;
  studentEmail?: string;
  district?: string;
  serviceType: 'HOME_TUTOR' | 'STUDY_LIBRARY' | 'STUDY_MATERIAL' | 'MOCK_TEST' | 'SUBSCRIPTION' | 'DIGITAL_STORE' | string;
  serviceName: string; // Teacher name, Library name, or Product name
  serviceDetails?: string; // Subjects, Shift/Seat, or Plan details
  billingPeriod: string;
  amount: number; // Final paid amount
  baseAmount?: number; // Base fee before concessions
  originalAmount?: number; // Pre-discount amount
  offerDiscount?: number;
  offerName?: string;
  couponCode?: string;
  couponDiscount?: number;
  otherDiscount?: number;
  discount?: number;
  tax?: number;
  totalAmount?: number;
  paymentMethod: string;
  transactionId: string;
  status: 'PAID';
}

export interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
  currentUserRole?: string;
  currentUserId?: string;
}

/**
 * Standardized ZYZU'S Official Receipt Modal:
 * Renders using the Unified FocusPoint Fee Receipt and Document Viewer architecture.
 * Ensures identical typography, cyber security seal, EMV smart chip,
 * 2x retina PNG export, offline HTML download, and print compatibility across:
 * - Fees & Invoice
 * - My Documents
 * - My Library Booking
 * - Home Tuition
 */
export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  currentUserRole = 'STUDENT',
  currentUserId = 'user'
}) => {
  if (!isOpen || !data) return null;

  return (
    <UnifiedFeeReceipt
      isOpen={isOpen}
      onClose={onClose}
      receiptData={data}
      currentUserRole={currentUserRole}
      currentUserId={currentUserId}
    />
  );
};

export { convertReceiptDataToDocument };
