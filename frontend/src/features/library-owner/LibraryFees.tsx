import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { Library, LibraryBooking, LibraryStudent } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import {
  IndianRupee,
  Receipt,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Printer,
  Download,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LibraryFees: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  const [students, setStudents] = useState<LibraryStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Active KPI Filter
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'EXPIRING_3_DAYS'>('ALL');

  // Collect Fee Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('800');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('Monthly desk subscription');
  const [submitting, setSubmitting] = useState(false);

  // Receipt Modal
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

  const loadFeesData = async () => {
    if (!user) return;
    try {
      const libs = await libraryService.getLibrariesByOwner(user.id);
      if (libs && libs.length > 0) {
        const activeLib = libs[0];
        setLibrary(activeLib);
        const [bData, sData] = await Promise.all([
          bookingService.getLibraryBookings(activeLib.id),
          libraryService.getLibraryStudents(activeLib.id)
        ]);
        const safeBookings = bData || [];
        const safeStudents = sData || [];
        setBookings(safeBookings);
        setStudents(safeStudents);

        if (safeStudents.length > 0) {
          setSelectedStudentId(safeStudents[0].id);
          setAmount(String(safeStudents[0].monthlyFee || activeLib.monthlyFee || 800));
        } else if (safeBookings.length > 0) {
          setSelectedStudentId(safeBookings[0].id);
          setAmount(String(safeBookings[0].totalAmount || safeBookings[0].amount || activeLib.monthlyFee || 800));
        }
      } else {
        setLibrary(null);
      }
    } catch (err) {
      console.error('Failed to load fees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeesData();
  }, [user]);

  const handleStudentSelect = (stuId: string) => {
    setSelectedStudentId(stuId);
    const stu = students.find(s => s.id === stuId);
    if (stu) {
      setAmount(String(stu.monthlyFee || 800));
      return;
    }
    const b = bookings.find(x => x.id === stuId);
    if (b) {
      setAmount(String(b.totalAmount || b.amount || 800));
    }
  };

  const handleRecordFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;
    setSubmitting(true);
    try {
      const matchedStudent = students.find(s => s.id === selectedStudentId);
      const matchedBooking = bookings.find(b => b.id === selectedStudentId);
      const studentName = matchedStudent?.name || matchedBooking?.studentName || 'Student';
      const seatNumber = matchedStudent?.seatNumber || matchedBooking?.seatNumber || 'A-01';
      const shift = matchedStudent?.shift || matchedBooking?.shift || 'General Shift';

      const result = await libraryService.recordFeePayment(library.id, selectedStudentId, {
        studentName,
        seatNumber,
        shift,
        amount: Number(amount) || 800,
        paymentMode,
        notes: notes.trim()
      });

      setIsCollectModalOpen(false);
      addToast(`Fee payment of ₹${amount} recorded for ${studentName}!`, 'success');

      // Refresh data
      await loadFeesData();

      // Open receipt
      if (result && result.invoice) {
        setViewingReceipt({
          receiptNo: result.invoice.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
          studentName,
          seatNumber,
          shift,
          amount: Number(amount) || 800,
          paymentMode,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          notes: notes.trim(),
          libraryName: library.name,
          address: library.address,
        });
      }
    } catch (err) {
      addToast('Failed to record fee payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <PageHeader
          title="Fee Collection & Dues Register"
          subtitle="Track seat dues, counter collections, and digital receipts"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Fees' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please register your study library before managing student shift subscription dues and counter receipts.
          </p>
          <div className="mt-6">
            <Link to="/library-owner/create">
              <Button variant="primary">Register Your Library</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Helper to compute expiry info
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getExpiryInfo = (endDateStr?: string, statusHint?: string) => {
    if (!endDateStr) return { isExpiringIn3Days: statusHint === 'EXPIRING_SOON', daysLeft: 30 };
    try {
      const exp = new Date(endDateStr);
      if (isNaN(exp.getTime())) {
        return { isExpiringIn3Days: statusHint === 'EXPIRING_SOON', daysLeft: 30 };
      }
      exp.setHours(0, 0, 0, 0);
      const diffTime = exp.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        isExpiringIn3Days: daysLeft >= 0 && daysLeft <= 3,
        daysLeft
      };
    } catch {
      return { isExpiringIn3Days: false, daysLeft: 30 };
    }
  };

  // Combined ledger rows
  const allFeeRows = [
    ...(bookings || []).map(b => {
      const { isExpiringIn3Days, daysLeft } = getExpiryInfo(b.endDate);
      const parsedAmount = Number(b.creditedAmount ?? b.totalAmount ?? b.amount) || 800;
      return {
        id: b.id || 'N/A',
        studentName: b.studentName || 'Student',
        studentPhone: b.studentPhone || b.studentMobile || '',
        parentName: '',
        parentPhone: '',
        seatNumber: b.seatNumber || 'Seat --',
        shift: b.shift || b.shiftName || 'General Shift',
        date: b.startDate || (b.bookingDate ? b.bookingDate.split('T')[0] : '2026-09-01'),
        expiryDate: b.endDate || '',
        isExpiringIn3Days,
        daysLeft,
        method: b.paymentMethod || 'Online App',
        amount: parsedAmount,
        status: String(b.paymentStatus || 'PAID').toUpperCase(),
      };
    }),
    ...(students || []).map(s => {
      const { isExpiringIn3Days, daysLeft } = getExpiryInfo(s.expiryDate, s.expiryStatus);
      const parsedAmount = Number(s.monthlyFee) || 800;
      return {
        id: s.referenceId || s.id || 'N/A',
        studentName: s.name || 'Walk-in Student',
        studentPhone: s.mobile || s.phone || '',
        parentName: s.parentName || s.guardianName || '',
        parentPhone: s.parentPhone || '',
        seatNumber: s.seatNumber || 'Seat --',
        shift: s.shift || s.shiftName || 'General Shift',
        date: s.joiningDate || '2026-09-01',
        expiryDate: s.expiryDate || '',
        isExpiringIn3Days,
        daysLeft,
        method: 'Counter Cash / UPI',
        amount: parsedAmount,
        status: String(s.feeStatus || 'PAID').toUpperCase(),
      };
    })
  ];

  const totalCollected = allFeeRows
    .filter(r => r.status === 'PAID')
    .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const paidCount = allFeeRows.filter(r => r.status === 'PAID').length;
  const pendingCount = allFeeRows.filter(r => r.status === 'PENDING').length;
  const expiringCount = allFeeRows.filter(r => r.isExpiringIn3Days).length;

  const filteredFeeRows = allFeeRows.filter(r => {
    if (activeFilter === 'PAID') return r.status === 'PAID';
    if (activeFilter === 'PENDING') return r.status === 'PENDING';
    if (activeFilter === 'EXPIRING_3_DAYS') return r.isExpiringIn3Days;
    return true;
  });

  const handleSendWhatsAppFeeReminder = (r: typeof allFeeRows[0]) => {
    const phone = r.studentPhone || r.parentPhone || '';
    if (!phone) {
      addToast(`No contact phone recorded for ${r.studentName}`, 'error');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const libName = library?.name || "ZYZU'S Study Library";
    const upiLink = `upi://pay?pa=${encodeURIComponent(libName.toLowerCase().replace(/[^a-z0-9]/g, ''))}@upi&pn=${encodeURIComponent(libName)}&am=${r.amount}`;

    let msg = `Namaste ${r.studentName},\nReminder from *${libName}*.\n`;
    if (r.status === 'PENDING') {
      msg += `Your monthly desk fee of *₹${r.amount}* for Desk *${r.seatNumber}* (${r.shift}) is currently *Pending*.\n`;
    } else {
      msg += `Your desk reservation for *${r.seatNumber}* (${r.shift}) is expiring on *${r.expiryDate}* (${r.daysLeft} days remaining).\nMonthly fee: *₹${r.amount}*.\n`;
    }
    msg += `Please pay at the library counter or via UPI payment: ${upiLink}\nThank you!`;

    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    addToast(`WhatsApp payment reminder opened for ${r.studentName} (${phone})`, 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Collection & Dues Register"
        subtitle={`Desk subscription collections and receipts for ${library.name}`}
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Fees' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/library-owner/reports">
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                Export Fee Statement (A4)
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsCollectModalOpen(true)}
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* 4 Interactive Filter KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Collections */}
        <div
          onClick={() => setActiveFilter('ALL')}
          className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
            activeFilter === 'ALL'
              ? 'border-royal-blue-600 bg-royal-blue-50/50 shadow-sm ring-2 ring-royal-blue-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collections</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">{allFeeRows.length} Total Records</span>
            {activeFilter === 'ALL' && <span className="font-bold text-royal-blue-600">Active View</span>}
          </div>
        </div>

        {/* Paid Subscriptions */}
        <div
          onClick={() => setActiveFilter('PAID')}
          className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
            activeFilter === 'PAID'
              ? 'border-royal-blue-600 bg-royal-blue-50/50 shadow-sm ring-2 ring-royal-blue-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid Subscriptions</span>
            <div className="w-9 h-9 rounded-lg bg-royal-blue-50 flex items-center justify-center text-royal-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{paidCount}</div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold">{paidCount > 0 ? 'All Cleared' : '0 Cleared'}</span>
            {activeFilter === 'PAID' && <span className="font-bold text-royal-blue-600">Active View</span>}
          </div>
        </div>

        {/* Pending Dues */}
        <div
          onClick={() => setActiveFilter('PENDING')}
          className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
            activeFilter === 'PENDING'
              ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending / Due Payments</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-semibold">{pendingCount > 0 ? 'Action Required' : 'Zero Pending'}</span>
            {activeFilter === 'PENDING' && <span className="font-bold text-amber-700">Active View</span>}
          </div>
        </div>

        {/* Expiring in 3 Days */}
        <div
          onClick={() => setActiveFilter('EXPIRING_3_DAYS')}
          className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
            activeFilter === 'EXPIRING_3_DAYS'
              ? 'border-red-500 bg-red-50/50 shadow-sm ring-2 ring-red-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring in 3 Days</span>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-600">{expiringCount}</div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-red-700 font-semibold">{expiringCount > 0 ? 'Urgent Follow-up' : 'No Expiring Soon'}</span>
            {activeFilter === 'EXPIRING_3_DAYS' && <span className="font-bold text-red-700">Active View</span>}
          </div>
        </div>
      </div>

      {/* High-Contrast Transactions Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Membership Invoices & Fee Ledger</h3>
            <p className="text-xs text-slate-500">Official log of monthly renewals, desk subscriptions, and direct counter receipts</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Showing {filteredFeeRows.length} of {allFeeRows.length} records
            </span>
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setActiveFilter('ALL')}
                className="text-xs font-bold text-royal-blue-600 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {filteredFeeRows.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No records found for current filter</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeFilter === 'ALL'
                ? 'Payments recorded at the counter or via online student bookings will appear here.'
                : `No transactions matched the "${activeFilter.replace(/_/g, ' ')}" condition.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Receipt / Ref</th>
                  <th className="py-3 px-4">Student & Contacts</th>
                  <th className="py-3 px-4">Desk & Shift</th>
                  <th className="py-3 px-4">Date & Validity</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount Credited</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFeeRows.map((r, i) => (
                  <tr key={`${r.id}-${i}`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      {r.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{r.studentName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 space-y-0.5">
                        <div>
                          <span className="font-medium text-slate-600">Student:</span>{' '}
                          <span className="font-mono">{r.studentPhone || 'Not provided'}</span>
                        </div>
                        {(r.parentPhone || r.parentName) && (
                          <div>
                            <span className="font-medium text-slate-600">Parent:</span>{' '}
                            <span>{r.parentName ? `${r.parentName} ` : ''}</span>
                            <span className="font-mono">({r.parentPhone || 'N/A'})</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-mono font-bold text-royal-blue-600 text-sm">{r.seatNumber}</span>
                      <div className="text-slate-500 text-[11px]">{r.shift}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="font-mono">{r.date}</div>
                      {r.expiryDate && (
                        <div className="mt-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Valid till: </span>
                          <span className="font-mono font-semibold text-slate-700">{r.expiryDate}</span>
                          {r.isExpiringIn3Days && (
                            <span className="ml-1 text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                              {r.daysLeft <= 0 ? 'Today' : `${r.daysLeft}d left`}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {r.method}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp reminder button for pending dues or expiring within 3 days */}
                        {(r.status === 'PENDING' || r.isExpiringIn3Days) && (
                          <button
                            onClick={() => handleSendWhatsAppFeeReminder(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                            title="Send WhatsApp payment reminder with UPI link"
                          >
                            <span className="text-[11px]">💬</span> Remind
                          </button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<FileText className="w-3.5 h-3.5" />}
                          onClick={() => setViewingReceipt({
                          receiptNo: r.id,
                          studentName: r.studentName,
                          seatNumber: r.seatNumber,
                          shift: r.shift,
                          amount: r.amount,
                          paymentMode: r.method,
                          date: r.date,
                          libraryName: library.name,
                          address: library.address,
                        })}
                      >
                        Receipt
                      </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Collect Fee Modal */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Record Student Fee Payment"
        size="md"
      >
        <form onSubmit={handleRecordFee} className="space-y-4">
          {students.length === 0 && bookings.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              No active students available. Please register a walk-in student first.
            </div>
          ) : (
            <>
              <Select
                label="Select Enrolled Student *"
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                options={[
                  ...students.map(s => ({
                    value: s.id,
                    label: `${s.name} (Desk ${s.seatNumber} • ₹${s.monthlyFee || 800}/mo)`
                  })),
                  ...bookings.map(b => ({
                    value: b.id,
                    label: `${b.studentName} (Desk ${b.seatNumber} • Online)`
                  }))
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount Collected (₹) *"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                <Select
                  label="Payment Channel *"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  options={[
                    { value: 'Cash', label: 'Cash at Counter' },
                    { value: 'UPI', label: 'Direct Library QR / UPI' },
                    { value: 'Cheque', label: 'Bank Cheque / NEFT' },
                  ]}
                />
              </div>

              <Input
                label="Remarks / Month"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. September 2026 desk fee renewal"
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCollectModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Record Payment & Issue Receipt
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      {viewingReceipt && (
        <Modal
          isOpen={Boolean(viewingReceipt)}
          onClose={() => setViewingReceipt(null)}
          title="Official Library Payment Receipt"
          size="md"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 font-sans text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">ZYZU'S</h3>
                <p className="text-xs text-slate-500 font-medium">Self-Study Library Partner Network</p>
                <p className="text-xs text-slate-700 font-bold mt-1">{viewingReceipt.libraryName}</p>
                <p className="text-[11px] text-slate-500">{viewingReceipt.address}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                  PAID INVOICE
                </span>
                <p className="font-mono text-xs text-slate-600 font-bold mt-1">#{viewingReceipt.receiptNo}</p>
                <p className="text-[11px] text-slate-400">{viewingReceipt.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs py-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900 text-sm">{viewingReceipt.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Allocated Desk</span>
                <span className="font-mono font-bold text-royal-blue-600 text-sm">{viewingReceipt.seatNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Shift Slot</span>
                <span className="font-medium text-slate-700">{viewingReceipt.shift}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Channel</span>
                <span className="font-medium text-slate-700">{viewingReceipt.paymentMode}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase">Total Amount Paid</span>
              <span className="text-base font-black text-emerald-700">₹{viewingReceipt.amount.toLocaleString('en-IN')}</span>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-2">
              This is a computer-generated digital receipt issued via ZYZU'S Library Platform.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>
                Print
              </Button>
              <Button size="sm" variant="primary" onClick={() => setViewingReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
