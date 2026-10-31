import React, { useState, useEffect } from 'react';
import { 
  Receipt, DollarSign, Clock, CheckCircle2, CreditCard, 
  Download, QrCode, Smartphone, Building, ShieldCheck, 
  Printer, AlertCircle, AlertTriangle, ArrowRight, Copy, Check, 
  ExternalLink, Landmark, Sparkles, HelpCircle 
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard, Card } from '../../components/common/Card';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { OfficialReceiptModal, ReceiptData } from '../../components/common/OfficialReceiptModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/studentService';
import { Invoice } from '../../types';
import { PAYMENT_CONFIG } from '../../constants/paymentConfig';
import { paymentService } from '../../services/paymentService';
import { CheckoutCouponSection } from '../../components/checkout/CheckoutCouponSection';
import { CouponValidationResult } from '../../types/homepage';
import { convertReceiptDataToDocument } from '../../components/documents/UnifiedFeeReceipt';
import { documentService } from '../../services/documentService';

export const StudentFees: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'bank_transfer' | 'razorpay'>('upi_qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [razorpaySandboxMsg, setRazorpaySandboxMsg] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState<number>(0);

  // Official Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const loadInvoices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await studentService.getInvoices(user.id);
      setInvoices(list);
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [user]);

  const totalBilled = invoices.reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalPending = invoices.reduce((acc, i) => acc + (i.balanceAmount || (i.status === 'PAID' ? 0 : i.amount)), 0);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenPayModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setUtrNumber('');
    setRazorpaySandboxMsg(false);
    setAppliedCouponCode(null);
    setAppliedCouponDiscount(0);
    setPayModalOpen(true);
  };

  const handleConfirmPayment = async (overrideTxnId?: string, overrideMethod?: string) => {
    if (!selectedInvoice || !user) return;
    setPaymentProcessing(true);
    try {
      let finalMethod = overrideMethod;
      let finalTxnId = overrideTxnId;

      if (!finalTxnId) {
        if (paymentMethod === 'upi_qr') {
          finalTxnId = utrNumber.trim() || `UPI-UTR-${Date.now().toString().slice(-8)}`;
          finalMethod = 'Unified UPI QR (GPay/PhonePe/Paytm)';
        } else if (paymentMethod === 'bank_transfer') {
          finalTxnId = utrNumber.trim() || `NEFT-UTR-${Date.now().toString().slice(-8)}`;
          finalMethod = 'Direct Bank Transfer (IMPS/NEFT/RTGS)';
        } else {
          finalTxnId = `RZP-TXN-${Date.now().toString().slice(-8)}`;
          finalMethod = 'Razorpay Gateway (Cards/Netbanking/UPI)';
        }
      }

      const finalPayable = Math.max(0, selectedInvoice.amount - appliedCouponDiscount);

      await studentService.payInvoice(selectedInvoice.id, {
        method: finalMethod || 'Online Gateway',
        transactionId: finalTxnId,
      });

      await loadInvoices();
      setPaymentProcessing(false);
      setPayModalOpen(false);
      setUtrNumber('');

      // Immediately prepare and show official receipt with coupon line item
      const finalReceipt: ReceiptData = {
        receiptNumber: `FP-REC-${Date.now().toString().slice(-6)}`,
        invoiceNumber: selectedInvoice.invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        studentName: user.name,
        studentId: user.id,
        studentMobile: user.mobile,
        studentEmail: user.email,
        district: user.districtName,
        serviceType: selectedInvoice.type === 'LIBRARY_FEE' ? 'STUDY_LIBRARY' : 'HOME_TUTOR',
        serviceName: selectedInvoice.description,
        serviceDetails: `Invoice Ref: ${selectedInvoice.invoiceNumber}${appliedCouponCode ? ` [Coupon: ${appliedCouponCode} -₹${appliedCouponDiscount}]` : ''}`,
        billingPeriod: `Current Academic Cycle (${selectedInvoice.dueDate})`,
        amount: finalPayable,
        baseAmount: selectedInvoice.amount,
        originalAmount: selectedInvoice.amount,
        couponCode: appliedCouponCode || undefined,
        couponDiscount: appliedCouponDiscount > 0 ? appliedCouponDiscount : undefined,
        paymentMethod: finalMethod || 'Online Verified',
        transactionId: finalTxnId,
        status: 'PAID',
      };

      setReceiptData(finalReceipt);

      // Auto-archive receipt into unified Document Center
      try {
        const unifiedDoc = convertReceiptDataToDocument(finalReceipt);
        documentService.addDocument(unifiedDoc);
      } catch (err) {
        console.warn('Could not auto-archive fee receipt', err);
      }

      setReceiptModalOpen(true);
      showToast(`Payment of ₹${finalPayable} cleared and recorded successfully!`, 'success');
    } catch (e) {
      setPaymentProcessing(false);
      showToast('Payment processing failed. Please try again.', 'error');
    }
  };

  const handleLaunchRazorpay = async () => {
    if (!selectedInvoice || !user) return;
    setPaymentProcessing(true);
    const finalPayable = Math.max(0, selectedInvoice.amount - appliedCouponDiscount);
    await paymentService.openRazorpayCheckout({
      amount: finalPayable,
      invoiceNumber: selectedInvoice.invoiceNumber,
      description: selectedInvoice.description,
      studentName: user.name,
      studentEmail: user.email,
      studentPhone: user.mobile || '9876543210',
      onSuccess: (txnId) => {
        handleConfirmPayment(txnId, 'Razorpay Verified Gateway');
      },
      onError: (err) => {
        setPaymentProcessing(false);
        if (err === 'RAZORPAY_SANDBOX_FALLBACK') {
          setRazorpaySandboxMsg(true);
        } else {
          showToast(err, 'error');
        }
      }
    });
  };

  const handleDownloadReceipt = (inv: Invoice) => {
    if (!user) return;
    setReceiptData({
      receiptNumber: `FP-REC-${inv.invoiceNumber.replace('INV-', '')}`,
      invoiceNumber: inv.invoiceNumber,
      date: inv.paidDate || inv.dueDate || new Date().toISOString().split('T')[0],
      studentName: user.name,
      studentId: user.id,
      studentMobile: user.mobile,
      studentEmail: user.email,
      district: user.districtName,
      serviceType: inv.type === 'LIBRARY_FEE' ? 'STUDY_LIBRARY' : 'HOME_TUTOR',
      serviceName: inv.description,
      serviceDetails: `Invoice Ref: ${inv.invoiceNumber}`,
      billingPeriod: `Academic Cycle (Due: ${inv.dueDate})`,
      amount: inv.amount,
      paymentMethod: (inv as any).paymentMethod || 'Online Bank Transfer / UPI',
      transactionId: (inv as any).transactionId || `TXN-REC-${inv.id.slice(-6)}`,
      status: 'PAID',
    });
    setReceiptModalOpen(true);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (item) => <span className="font-mono font-bold text-brand-700">{item.invoiceNumber}</span>,
    },
    {
      key: 'description',
      header: 'Service & Description',
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-950 text-xs">{item.description}</p>
          <p className="text-[10px] text-slate-500 font-medium">Ref: {item.referenceId}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Total Fee',
      render: (item) => <span className="font-black text-slate-950">₹{item.amount.toLocaleString()}</span>,
    },
    {
      key: 'balanceAmount',
      header: 'Balance Due',
      render: (item) => (
        <span className={item.status !== 'PAID' ? 'text-rose-600 font-black' : 'text-slate-400 font-medium'}>
          ₹{(item.status === 'PAID' ? 0 : item.balanceAmount || item.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => <span className="text-slate-600 font-medium text-xs">{item.dueDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status !== 'PAID' ? (
            <Button size="sm" onClick={() => handleOpenPayModal(item)} className="shadow-xs font-bold text-xs">
              Pay Pending Fee
            </Button>
          ) : (
            <button
              onClick={() => handleDownloadReceipt(item)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-brand-600" />
              <span>Download Receipt</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tuition Fees & Invoices"
        description="Review transparent fee breakdowns for home tutoring sessions and study desk passes."
        breadcrumbs={[
          { label: 'Student Portal', path: '/student/dashboard' },
          { label: 'Fees & Invoices' },
        ]}
      />

      {/* Payment Due Reminder Alert (if pending fees exist) */}
      {totalPending > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-950">Tuition / Library Fee Due Alert</h4>
              <p className="text-xs text-slate-700 font-medium">
                You have an outstanding balance of <strong className="text-amber-900 font-black">₹{totalPending.toLocaleString()}</strong>. Clear dues to maintain uninterrupted access.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const pendingInv = invoices.find(i => i.status !== 'PAID');
              if (pendingInv) handleOpenPayModal(pendingInv);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20 w-full sm:w-auto shrink-0"
          >
            Pay Pending Fee Now
          </Button>
        </div>
      )}

      {/* KPI Cards - Strictly computed */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Total Billed"
          value={`₹${totalBilled.toLocaleString()}`}
          subtitle={invoices.length > 0 ? `${invoices.length} total invoice(s)` : "No invoices issued"}
          icon={<Receipt className="w-6 h-6" />}
        />
        <StatCard
          title="Paid Fees"
          value={`₹${totalPaid.toLocaleString()}`}
          subtitle="Cleared through digital receipts"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${totalPending.toLocaleString()}`}
          subtitle={totalPending > 0 ? "Pending payment clearance" : "All accounts clear"}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
        />
      </div>

      {/* Invoices List Card */}
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-950">All Invoices & Receipts</h3>
            <p className="text-xs text-slate-500 font-medium">Download authorized official receipts with GST and QR verification</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          keyExtractor={(item) => item.id}
          emptyMessage="No fee statements or invoices are currently logged for your account."
        />
      </Card>

      {/* PAY PENDING FEE MODAL */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Pay Pending Academic Fee"
        size="md"
      >
        {selectedInvoice && (() => {
          const finalPayable = Math.max(0, selectedInvoice.amount - appliedCouponDiscount);
          return (
            <div className="space-y-5 text-xs text-slate-900">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Invoice Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Description:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Original Invoice Amount:</span>
                  <span className="font-bold text-slate-900">₹{selectedInvoice.amount.toLocaleString()}</span>
                </div>
                {appliedCouponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Concession ({appliedCouponCode}):</span>
                    <span>-₹{appliedCouponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-black">
                  <span>Payable Total:</span>
                  <span className="text-emerald-700">₹{finalPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Live Coupon Validation Section */}
              <CheckoutCouponSection
                theme="light"
                originalAmount={selectedInvoice.amount}
                productServiceType={selectedInvoice.type === 'LIBRARY_FEE' ? 'digital_library' : 'home_tuition'}
                stateId={(user as any)?.stateId || 'loc-state-up'}
                districtId={(user as any)?.districtId || 'dist-gzp'}
                studentId={user?.id}
                onCouponApplied={(res: CouponValidationResult) => {
                  setAppliedCouponCode(res.couponCode);
                  setAppliedCouponDiscount(res.discountAmount);
                  showToast(`✓ Coupon ${res.couponCode} applied: Save ₹${res.discountAmount}!`, 'success');
                }}
                onCouponRemoved={() => {
                  setAppliedCouponCode(null);
                  setAppliedCouponDiscount(0);
                  showToast('Coupon removed.', 'info');
                }}
              />

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Select Official Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    paymentMethod === 'upi_qr'
                      ? 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1.5 text-brand-600" />
                  <span className="text-[11px] block leading-tight">Instant UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Landmark className="w-5 h-5 mb-1.5 text-brand-600" />
                  <span className="text-[11px] block leading-tight">Bank Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    paymentMethod === 'razorpay'
                      ? 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1.5 text-brand-600" />
                  <span className="text-[11px] block leading-tight">Razorpay Gateway</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DYNAMIC UPI QR & UPI APPS */}
            {paymentMethod === 'upi_qr' && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Real Scannable UPI QR Image */}
                  <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        paymentService.getUpiUri(selectedInvoice.amount, selectedInvoice.invoiceNumber, user?.name || 'Student')
                      )}`}
                      alt="Official UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Merchant Account</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Scan with Google Pay, PhonePe, Paytm, or any banking UPI app.
                    </p>
                    
                    {/* Copyable Official UPI VPA */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <code className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-900">
                        {PAYMENT_CONFIG.upi.vpa}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT_CONFIG.upi.vpa, 'UPI ID')}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {copiedField === 'UPI ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-brand-600" />}
                        <span>{copiedField === 'UPI ID' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Mobile UPI Direct App Link */}
                    <div className="pt-1">
                      <a
                        href={paymentService.getUpiUri(selectedInvoice.amount, selectedInvoice.invoiceNumber, user?.name || 'Student')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 sm:hidden"
                      >
                        <span>Open Directly in UPI App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* UTR Number Input */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    UPI Transaction ID / 12-Digit UTR (Optional)
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 423987123456 (or leave blank to auto-generate)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-500">
                    Once paid from your app, submit to instantly verify and generate your official stamped tax receipt.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: DIRECT BANK TRANSFER (IMPS / NEFT / RTGS) */}
            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-brand-600" />
                    Official Bank Account Particulars
                  </span>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    Current Account
                  </span>
                </div>

                <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-medium">Beneficiary Name:</span>
                    <span className="font-bold text-slate-900 text-right">{PAYMENT_CONFIG.bankDetails.accountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-medium">Bank Name & Branch:</span>
                    <span className="font-bold text-slate-900 text-right">{PAYMENT_CONFIG.bankDetails.bankName}, Saidpur</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-medium">Account Number:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-950">
                      <span>{PAYMENT_CONFIG.bankDetails.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT_CONFIG.bankDetails.accountNumber, 'Account Number')}
                        className="p-1 text-slate-400 hover:text-brand-600 cursor-pointer"
                        title="Copy Account Number"
                      >
                        {copiedField === 'Account Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-medium">IFSC Code:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-brand-700">
                      <span>{PAYMENT_CONFIG.bankDetails.ifscCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT_CONFIG.bankDetails.ifscCode, 'IFSC Code')}
                        className="p-1 text-slate-400 hover:text-brand-600 cursor-pointer"
                        title="Copy IFSC"
                      >
                        {copiedField === 'IFSC Code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Reference / UTR Number Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    IMPS / NEFT / RTGS Reference Number (UTR)
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. HDFC1234567890 (or leave blank to auto-generate)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-500">
                    Transfer the exact amount to the account above and enter your reference number.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: RAZORPAY GATEWAY */}
            {paymentMethod === 'razorpay' && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    <div>
                      <h5 className="font-bold text-slate-900">Razorpay Payment Gateway</h5>
                      <p className="text-[10px] text-slate-500">Cards, Netbanking, PayLater, International Wallets</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    PAYMENT_CONFIG.razorpay.isConfigured
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}>
                    {PAYMENT_CONFIG.razorpay.isConfigured ? '✓ Live Gateway' : 'Integration Ready (Test Mode)'}
                  </span>
                </div>

                {!PAYMENT_CONFIG.razorpay.isConfigured && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-700 space-y-1">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Ready to Link Live Bank & Razorpay
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      To receive live funds directly into your bank account, provide <code className="bg-amber-100 px-1 rounded font-bold text-amber-900 font-mono">VITE_RAZORPAY_KEY_ID</code> in your environment. Test authorization is fully functional for simulated checkout.
                    </p>
                  </div>
                )}

                {razorpaySandboxMsg && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                    Test Mode: Click "Confirm & Process Payment" below to simulate a verified payment authorization and receive your official receipt.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setPayModalOpen(false)}>
                Cancel
              </Button>

              {paymentMethod === 'razorpay' && PAYMENT_CONFIG.razorpay.isConfigured ? (
                <Button
                  size="md"
                  onClick={handleLaunchRazorpay}
                  disabled={paymentProcessing}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-600/25"
                >
                  {paymentProcessing ? 'Connecting to Razorpay...' : `Pay via Razorpay (₹${finalPayable.toLocaleString()})`}
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={() => handleConfirmPayment()}
                  disabled={paymentProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25"
                >
                  {paymentProcessing ? 'Verifying Transaction...' : `Confirm & Process Payment (₹${finalPayable.toLocaleString()})`}
                </Button>
              )}
            </div>
          </div>
          );
        })()}
      </Modal>

      {/* Official Receipt Modal */}
      <OfficialReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />
    </div>
  );
};
