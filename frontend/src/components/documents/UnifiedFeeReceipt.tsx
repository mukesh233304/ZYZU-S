import React from 'react';
import { UnifiedFocusPointDocument, DocumentLineItem } from '../../types/document';
import { UnifiedDocumentViewer } from './UnifiedDocumentViewer';
import { ReceiptData } from '../common/OfficialReceiptModal';

export interface UnifiedFeeReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData?: ReceiptData | null;
  document?: UnifiedFocusPointDocument | null;
  currentUserRole?: string;
  currentUserId?: string;
}

/**
 * Converts structured receipt data into a UnifiedFocusPointDocument
 * following the global FocusPoint receipt design system.
 */
export function convertReceiptDataToDocument(data: ReceiptData): UnifiedFocusPointDocument {
  const isLibrary = data.serviceType === 'STUDY_LIBRARY' || (data.serviceType as string) === 'LIBRARY';
  const cleanNum = data.receiptNumber.replace(/^REC-|^FP-REC-|^RCP-|^FP-RCP-/, '');
  const docNumber = data.receiptNumber.startsWith('FP-') 
    ? data.receiptNumber 
    : (data.receiptNumber.startsWith('RCP-') ? `FP-${data.receiptNumber}` : `FP-REC-${cleanNum}`);

  const baseAmount = data.originalAmount || (
    data.amount + (data.couponDiscount || 0) + (data.offerDiscount || 0) + (data.otherDiscount || 0)
  );

  const lineItems: DocumentLineItem[] = [
    {
      label: isLibrary 
        ? `Dedicated Study Desk Pass — ${data.serviceName}` 
        : `Academic Service Enrolment — ${data.serviceName}`,
      amount: baseAmount,
    },
    ...(data.offerDiscount && data.offerDiscount > 0 ? [
      {
        label: `Special Promotional Concession ${data.offerName ? `(${data.offerName})` : ''}`,
        amount: -data.offerDiscount,
        isDeduction: true,
      }
    ] : []),
    ...(data.couponDiscount && data.couponDiscount > 0 ? [
      {
        label: `Coupon Concession Applied (${data.couponCode || 'PROMO'})`,
        amount: -data.couponDiscount,
        isDeduction: true,
      }
    ] : []),
    ...(data.otherDiscount && data.otherDiscount > 0 ? [
      {
        label: 'Scholarship / Regional Concession',
        amount: -data.otherDiscount,
        isDeduction: true,
      }
    ] : []),
    ...(data.serviceDetails ? [
      {
        label: `Allocation Specifications: ${data.serviceDetails}`,
        amount: 0,
      }
    ] : []),
    {
      label: "ZYZU'S Automated Clearinghouse Ledger Reconciliation",
      amount: 0,
    },
    {
      label: 'Reconciled Settlement in Full (Zero Dues)',
      amount: data.amount,
      isHighlight: true,
    }
  ];

  return {
    id: `doc-${docNumber}`,
    documentNumber: docNumber,
    title: isLibrary 
      ? `ZYZU'S Official Library Desk Fee Receipt — ${data.serviceName}` 
      : `ZYZU'S Official Home Tuition Fee Receipt — ${data.serviceName}`,
    category: 'PAYMENT',
    documentType: isLibrary ? 'LIBRARY_SEAT_RECEIPT' : 'TUITION_FEE_RECEIPT',
    recipientId: data.studentId,
    recipientName: data.studentName,
    recipientRole: 'STUDENT',
    recipientEmail: data.studentEmail,
    recipientPhone: data.studentMobile,
    district: data.district || 'Uttar Pradesh',
    state: 'Uttar Pradesh',
    locality: data.serviceDetails?.split('•')?.[0]?.trim() || data.district,
    authorizedBy: isLibrary 
      ? (data.serviceName || "ZYZU'S Partner Study Library") 
      : (data.serviceName || "ZYZU'S Certified Tutor"),
    authorizedRole: isLibrary ? 'LIBRARY_OWNER' : 'TEACHER',
    qrVerificationUrl: `https://zyzus.com/verify/doc/${docNumber}`,
    qrVerificationHash: `SHA256-${cleanNum}-VERIFIED`,
    version: 1,
    isCurrent: true,
    issueDate: data.date,
    status: 'READY',
    paymentStatus: 'PAID',
    amount: data.amount,
    finalAmount: data.amount,
    originalAmount: baseAmount,
    offerDiscount: data.offerDiscount,
    offerName: data.offerName,
    couponCode: data.couponCode,
    couponDiscount: data.couponDiscount,
    otherDiscount: data.otherDiscount,
    currency: 'INR',
    paymentMethod: data.paymentMethod || 'Online (UPI / Direct Clearing)',
    paymentId: data.transactionId || `TXN-${cleanNum}`,
    transactionId: data.transactionId || `TXN-${cleanNum}`,
    transactionRef: data.transactionId || `UPI/ZYZUS/${cleanNum}`,
    billingPeriod: data.billingPeriod || 'Current Billing Cycle',
    lineItems,
    metadata: {
      invoiceNumber: data.invoiceNumber || `ZYZUS-INV-${cleanNum}`,
      serviceType: data.serviceType,
      serviceName: data.serviceName,
      serviceDetails: data.serviceDetails,
      libraryName: isLibrary ? data.serviceName : undefined,
      teacherName: !isLibrary ? data.serviceName : undefined,
      couponCode: data.couponCode,
      couponDiscount: data.couponDiscount,
      offerDiscount: data.offerDiscount,
      originalAmount: baseAmount,
      finalAmount: data.amount,
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: new Date().toISOString(),
        performedBy: 'System Auto-Billing Engine',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * UnifiedFeeReceipt: Standalone or modal wrapper rendering the exact same 
 * futuristic ZYZU'S receipt layout used in My Documents, Fees & Invoices, 
 * Tuition, Library Bookings, and Subscriptions.
 */
export const UnifiedFeeReceipt: React.FC<UnifiedFeeReceiptProps> = ({
  isOpen,
  onClose,
  receiptData,
  document,
  currentUserRole = 'STUDENT',
  currentUserId = 'user'
}) => {
  if (!isOpen) return null;

  const doc = document || (receiptData ? convertReceiptDataToDocument(receiptData) : null);
  if (!doc) return null;

  return (
    <UnifiedDocumentViewer
      isOpen={isOpen}
      onClose={onClose}
      document={doc}
      currentUserRole={currentUserRole}
      currentUserId={currentUserId}
    />
  );
};
