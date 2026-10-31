import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { expenditureService } from '../../services/expenditureService';
import { financeService } from '../../services/financeService';
import { DistrictExpenseClaim, ExpenseCategory, OfficialDocument } from '../../types/finance';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { FinancialDocumentViewer } from '../../components/finance/FinancialDocumentViewer';
import {
  Receipt,
  Plus,
  IndianRupee,
  Download,
  Search,
  Filter,
  Calendar,
  Building,
  MapPin,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Clock,
  Eye,
  Paperclip,
  Check,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  'Office Expenses',
  'Rent',
  'Electricity',
  'Internet',
  'Marketing',
  'Transportation',
  'Equipment',
  'Maintenance',
  'Stationery',
  'Software',
  'Salaries',
  'Travel',
  'Event Expenses',
  'Vendor Payments',
  'Infrastructure',
  'Miscellaneous'
];

import { districtAuthorizationService } from '../../services/districtAuthorizationService';

export const DistrictExpenses: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';
  const state = scope?.stateName || user?.state || 'Uttar Pradesh';

  const [claims, setClaims] = useState<DistrictExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Submit Expenditure Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields (Prompt #2)
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Marketing');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formExpenseDate, setFormExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [formVendorName, setFormVendorName] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'NEFT_RTGS' | 'CHEQUE' | 'CASH'>('NEFT_RTGS');
  const [formReferenceNumber, setFormReferenceNumber] = useState('');
  const [formBillNumber, setFormBillNumber] = useState('');
  const [formBillDate, setFormBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  
  // Attachments & Bank Details
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formBankName, setFormBankName] = useState('State Bank of India');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formIfscCode, setFormIfscCode] = useState('');
  const [formUpiId, setFormUpiId] = useState('');
  const [attachments, setAttachments] = useState<
    { id: string; name: string; url: string; fileType: string; sizeBytes: number; uploadedAt: string }[]
  >([]);

  // Official Document Viewer
  const [activeReceipt, setActiveReceipt] = useState<OfficialDocument | null>(null);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);

  // Detailed Claim View Drawer / Modal
  const [inspectingClaim, setInspectingClaim] = useState<DistrictExpenseClaim | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    try {
      districtAuthorizationService.verifyDistrictAccess(district, 'expenses', 'READ');
      const data = await expenditureService.getClaims(district);
      setClaims(data);
    } catch (e: any) {
      console.error('Error loading claims:', e);
      addToast(e?.message || 'Error loading district claims', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [district]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: f.name,
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
        fileType: f.type || 'application/pdf',
        sizeBytes: f.size || 185000,
        uploadedAt: new Date().toISOString()
      }));
      setAttachments(prev => [...prev, ...newFiles]);
      addToast(`${newFiles.length} file(s) attached successfully`, 'success');
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      addToast('Please enter a valid claimed amount', 'error');
      return;
    }
    if (!formVendorName.trim()) {
      addToast('Vendor / Payee name is required', 'error');
      return;
    }
    if (!formBillNumber.trim()) {
      addToast('Bill / Invoice number is required', 'error');
      return;
    }
    if (!formDescription.trim()) {
      addToast('Description is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await expenditureService.submitClaim({
        district,
        state,
        category: formCategory,
        subCategory: formSubCategory || undefined,
        description: formDescription,
        purpose: formPurpose || formDescription,
        claimedAmount: Number(formAmount),
        expenseDate: formExpenseDate,
        vendorName: formVendorName,
        paymentMethod: formPaymentMethod,
        referenceNumber: formReferenceNumber || undefined,
        billNumber: formBillNumber,
        billDate: formBillDate,
        notes: formNotes || undefined,
        supportingDocuments: attachments.length > 0 ? attachments : undefined,
        bankDetails: formAccountNumber
          ? {
              accountHolderName: formAccountHolder || formVendorName,
              bankName: formBankName,
              accountNumberMasked: `XXXX XXXX ${formAccountNumber.slice(-4)}`,
              ifscCode: formIfscCode || 'SBIN0001244',
              upiId: formUpiId || undefined,
              verified: true
            }
          : undefined,
        submittedByAdminId: scope?.userId || user?.id || 'admin_district',
        submittedByAdminName: user?.name || 'District Admin'
      });

      addToast(`Expenditure claim of ${formatINR(created.claimedAmount)} submitted to Super Admin!`, 'success');
      setIsSubmitModalOpen(false);
      resetForm();
      await loadClaims();
    } catch (err: any) {
      addToast(err?.message || 'Failed to submit claim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormCategory('Marketing');
    setFormSubCategory('');
    setFormDescription('');
    setFormPurpose('');
    setFormAmount('');
    setFormVendorName('');
    setFormReferenceNumber('');
    setFormBillNumber('');
    setFormNotes('');
    setAttachments([]);
  };

  // Filtered Claims
  const filteredClaims = claims.filter(c => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.vendorName.toLowerCase().includes(q) ||
        c.billNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const totalClaimedSum = filteredClaims.reduce((sum, c) => sum + c.claimedAmount, 0);
  const totalApprovedSum = filteredClaims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
  const totalPaidSum = filteredClaims.reduce((sum, c) => sum + c.alreadyPaidAmount, 0);
  const totalRemainingSum = filteredClaims.reduce((sum, c) => sum + c.remainingAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title={`${district} District — Expenditure & Bill Verification`}
        subtitle="Submit operational claims with invoices, track Super Admin approval workflow, and download official payment receipts"
        breadcrumbs={[
          { label: 'District Administration', href: '/district-admin/dashboard' },
          { label: 'Expenditures & Claims' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const headers = ['Claim ID', 'Date', 'Category', 'Vendor', 'Bill No', 'Claimed (INR)', 'Approved (INR)', 'Paid (INR)', 'Remaining (INR)', 'Status'];
                const rows = filteredClaims.map(c => [
                  c.id,
                  c.expenseDate,
                  c.category,
                  `"${c.vendorName}"`,
                  c.billNumber,
                  c.claimedAmount,
                  c.approvedAmount || 0,
                  c.alreadyPaidAmount,
                  c.remainingAmount,
                  c.status
                ]);
                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `${district}_Expenditure_Claims_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Claims Sheet
            </Button>

            <Button
              size="sm"
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Submit Expenditure Claim
            </Button>
          </div>
        }
      />

      {/* KPI Cards (Prompt #5: Claimed vs Approved vs Paid vs Remaining) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Claimed Amount"
          value={formatINR(totalClaimedSum)}
          change="Submitted operational claims"
          isPositive={false}
          icon={<Receipt className="w-6 h-6 text-slate-700" />}
        />
        <StatCard
          title="Super Admin Approved"
          value={formatINR(totalApprovedSum)}
          change="Payable amount eligible for disbursement"
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6 text-brand-600" />}
        />
        <StatCard
          title="Confirmed Paid Amount"
          value={formatINR(totalPaidSum)}
          change="Disbursed to vendor / account"
          isPositive={true}
          icon={<IndianRupee className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Remaining Balance"
          value={formatINR(totalRemainingSum)}
          change="Approved minus already paid"
          isPositive={totalRemainingSum === 0}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
        />
      </div>

      {/* Filters Bar */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search vendor, bill number, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
            >
              <option value="ALL">All Categories</option>
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DOCUMENT_REQUIRED">Document Required</option>
              <option value="APPROVED">Approved</option>
              <option value="PARTIALLY_APPROVED">Partially Approved</option>
              <option value="PAYMENT_QUEUED">Payment Queued</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAYMENT_FAILED">Payment Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Claims List */}
      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Claim ID / Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor / Payee</th>
                <th className="px-4 py-3">Bill Number</th>
                <th className="px-4 py-3 text-right">Claimed</th>
                <th className="px-4 py-3 text-right">Approved</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Remaining</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No expenditure submitted yet.
                  </td>
                </tr>
              ) : (
                filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono">
                      <p className="font-bold text-slate-900">{claim.id}</p>
                      <p className="text-[10px] text-slate-400">{claim.expenseDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {claim.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{claim.vendorName}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{claim.billNumber}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{formatINR(claim.claimedAmount)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {claim.approvedAmount !== undefined ? formatINR(claim.approvedAmount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700 font-bold">
                      {formatINR(claim.alreadyPaidAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-700 font-bold">
                      {formatINR(claim.remainingAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          claim.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'APPROVED' || claim.status === 'PAYMENT_QUEUED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : claim.status === 'PARTIALLY_APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : claim.status === 'DOCUMENT_REQUIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {claim.status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {claim.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInspectingClaim(claim)}
                          className="text-xs font-bold"
                        >
                          Details
                        </Button>

                        {claim.status === 'PAID' && claim.receiptNumber && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const doc = await expenditureService.getClaimReceipt(claim.receiptNumber!);
                              if (doc) {
                                setActiveReceipt(doc);
                                setIsReceiptViewerOpen(true);
                              }
                            }}
                            className="text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Official Receipt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* SUBMIT EXPENDITURE CLAIM MODAL (Prompt #2: Complete Form) */}
      {/* ============================================================== */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title={`Submit Expenditure Claim — ${district}`}
        >
          <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expenditure Category *</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900"
                  required
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-Category (Optional)</label>
                <Input
                  value={formSubCategory}
                  onChange={e => setFormSubCategory(e.target.value)}
                  placeholder="e.g. Printing, Generator Fuel, Cable..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Claimed Amount (INR) *</label>
                <Input
                  type="number"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  placeholder="₹25,000"
                  className="font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Date *</label>
                <Input
                  type="date"
                  value={formExpenseDate}
                  onChange={e => setFormExpenseDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method Preference</label>
                <select
                  value={formPaymentMethod}
                  onChange={e => setFormPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="NEFT_RTGS">NEFT / RTGS Bank Transfer</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="CHEQUE">Bank Cheque</option>
                  <option value="CASH">Cash Reimbursement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor / Payee Name *</label>
                <Input
                  value={formVendorName}
                  onChange={e => setFormVendorName(e.target.value)}
                  placeholder="e.g. Maurya Digital Print Hub"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bill / Invoice Number *</label>
                <Input
                  value={formBillNumber}
                  onChange={e => setFormBillNumber(e.target.value)}
                  placeholder="e.g. INV-2026-891"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description *</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Detailed breakdown of goods or services procured..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-brand-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Purpose / Justification *</label>
              <Input
                value={formPurpose}
                onChange={e => setFormPurpose(e.target.value)}
                placeholder="e.g. Expand student enrollment ahead of autumn academic term"
                required
              />
            </div>

            {/* Bank Details for Beneficiary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Beneficiary Bank / Payment Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Bank Name (e.g. SBI)"
                  value={formBankName}
                  onChange={e => setFormBankName(e.target.value)}
                />
                <Input
                  placeholder="Account Number"
                  value={formAccountNumber}
                  onChange={e => setFormAccountNumber(e.target.value)}
                />
                <Input
                  placeholder="IFSC Code"
                  value={formIfscCode}
                  onChange={e => setFormIfscCode(e.target.value)}
                />
              </div>
            </div>

            {/* Multi-Attachment Upload (Prompt #2: Supported documents PDF, JPG, JPEG, PNG) */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Supporting Documents (PDF, JPG, JPEG, PNG)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50/50">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-slate-600 font-medium text-xs">Click or drag to attach invoice & proof slips</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleSimulatedFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 text-xs">
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Attached</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} className="bg-brand-600 text-white font-bold">
                Submit Claim to Super Admin
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* CLAIM DETAILS DRAWER / MODAL */}
      {/* ============================================================== */}
      {inspectingClaim && (
        <Modal
          isOpen={!!inspectingClaim}
          onClose={() => setInspectingClaim(null)}
          title={`Claim Details: ${inspectingClaim.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm text-slate-900">{inspectingClaim.vendorName}</span>
                  <p className="text-slate-500">Bill: {inspectingClaim.billNumber} ({inspectingClaim.billDate})</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  {inspectingClaim.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Claimed</span>
                  <span className="font-bold text-slate-800">{formatINR(inspectingClaim.claimedAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Approved</span>
                  <span className="font-bold text-slate-800">
                    {inspectingClaim.approvedAmount !== undefined ? formatINR(inspectingClaim.approvedAmount) : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block font-sans font-bold">Paid</span>
                  <span className="font-bold text-emerald-700">{formatINR(inspectingClaim.alreadyPaidAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-sans font-bold">Remaining</span>
                  <span className="font-bold text-amber-700">{formatINR(inspectingClaim.remainingAmount)}</span>
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            <div>
              <label className="font-bold text-slate-700 block mb-2">Claim Lifecycle Timeline</label>
              <div className="space-y-2 border-l-2 border-brand-200 pl-3 ml-2">
                {inspectingClaim.timeline.map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-brand-600 border border-white" />
                    <p className="font-bold text-slate-800">{event.status} — {event.actorName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                    {event.note && <p className="text-slate-600 mt-0.5">{event.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setInspectingClaim(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Receipt Viewer */}
      <FinancialDocumentViewer
        isOpen={isReceiptViewerOpen}
        onClose={() => setIsReceiptViewerOpen(false)}
        document={activeReceipt}
      />
    </div>
  );
};
