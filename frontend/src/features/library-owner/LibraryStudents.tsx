import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { Library, LibraryBooking } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Armchair,
  Calendar,
  RotateCw,
  FileText,
  Filter,
  Building,
  Contact
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentIdCardModal, StudentIdCardData } from './components/StudentIdCardModal';
import { mockStore } from '../../mock/store';

export const LibraryStudents: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  // Add Walkin Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [shift, setShift] = useState('Morning Shift');
  const [amount, setAmount] = useState('800');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Renew Modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<LibraryBooking | null>(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewing, setRenewing] = useState(false);

  // Student ID Card Modal
  const [activeIdCard, setActiveIdCard] = useState<StudentIdCardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const libs = await libraryService.getLibrariesByOwner(user.id);
        if (libs.length > 0) {
          const activeLib = libs[0];
          setLibrary(activeLib);
          const bData = await bookingService.getLibraryBookings(activeLib.id);
          setBookings(bData);

          if (activeLib.shifts && activeLib.shifts.length > 0) {
            setShift(activeLib.shifts[0].name);
            setAmount(String(activeLib.shifts[0].price || activeLib.shifts[0].monthlyPrice || 800));
          }
        } else {
          setLibrary(null);
          setBookings([]);
        }
      } catch (err) {
        console.error('Failed to load library students', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Vacant seats selector for walk-in modal
  const vacantSeatsForShift = React.useMemo(() => {
    if (!library) return [];
    const total = library.totalSeats || 0;
    const sShift = (shift || '').toLowerCase();
    const occupiedSeatNumbers = new Set<string>();

    bookings.forEach(b => {
      if (b.status === 'confirmed' || b.status === 'CONFIRMED') {
        const bShift = (b.shift || '').toLowerCase();
        if (
          bShift.includes('full') ||
          sShift.includes('full') ||
          bShift.includes(sShift) ||
          sShift.includes(bShift) ||
          (sShift.includes('morning') && bShift.includes('morning')) ||
          (sShift.includes('afternoon') && bShift.includes('afternoon')) ||
          (sShift.includes('evening') && bShift.includes('evening'))
        ) {
          occupiedSeatNumbers.add(b.seatNumber);
        }
      }
    });

    const vacantList: string[] = [];
    for (let i = 1; i <= total; i++) {
      const seatNum = `Seat ${String(i).padStart(2, '0')}`;
      const altSeatNum = `A-${String(i).padStart(2, '0')}`;
      if (!occupiedSeatNumbers.has(seatNum) && !occupiedSeatNumbers.has(altSeatNum)) {
        vacantList.push(seatNum);
      }
    }
    return vacantList;
  }, [library, bookings, shift]);

  useEffect(() => {
    if (vacantSeatsForShift.length > 0) {
      if (!seatNumber || !vacantSeatsForShift.includes(seatNumber)) {
        setSeatNumber(vacantSeatsForShift[0]);
      }
    } else {
      setSeatNumber('');
    }
  }, [vacantSeatsForShift]);

  const getExpiryDetails = (endDateStr?: string) => {
    if (!endDateStr) return { days: 30, text: 'Active (30d left)', status: 'active', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { days, text: `Expired ${Math.abs(days)}d ago`, status: 'expired', statusClass: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else if (days <= 3) {
      return { days, text: `Expiring in ${days}d`, status: 'expiring', statusClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold animate-pulse' };
    } else {
      return { days, text: `Active (${days}d left)`, status: 'active', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  const handleSendWhatsAppReminder = (b: LibraryBooking) => {
    const name = b.studentName;
    const phone = b.studentPhone || '';
    const desk = b.seatNumber;
    const shiftName = b.shift;
    const feeAmount = b.totalAmount || 800;
    const validTill = b.endDate;
    const libName = library?.name || "ZYZU'S Study Library";

    const message = `Namaste ${name}, reminder from ${libName}. Your study desk reservation for ${desk} (${shiftName}) is expiring on ${validTill}. Please renew your monthly fee of ₹${feeAmount} to keep your reserved seat. UPI ID: ${libName.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi. Thank you!`;

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
    addToast(`WhatsApp reminder launched for ${name} (${phone})`, 'success');
  };

  const handleVacateStudentSeat = async (b: LibraryBooking) => {
    if (!library) return;
    try {
      await libraryService.vacateSeat(library.id, b.seatNumber, b.shift);
      setBookings(prev => prev.filter(x => x.id !== b.id));
      addToast(`Seat ${b.seatNumber} vacated and marked Available for ${b.shift || 'Shift'}!`, 'success');
    } catch (err) {
      addToast('Failed to vacate student seat', 'error');
    }
  };

  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;
    if (!studentName.trim() || !studentPhone.trim() || !seatNumber.trim()) {
      addToast('Please fill all mandatory fields', 'error');
      return;
    }
    setSubmittingAdd(true);
    try {
      const newB = await bookingService.createBooking({
        libraryId: library.id,
        libraryName: library.name,
        userId: `walkin-${Date.now()}`,
        studentName: studentName.trim(),
        studentPhone: studentPhone.trim(),
        seatNumber: seatNumber.trim().toUpperCase(),
        shift,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: Number(amount),
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: paymentMode as any,
      });

      await libraryService.updateSeatStatus(
        library.id,
        seatNumber.trim().toUpperCase(),
        'OCCUPIED',
        studentName.trim(),
        shift,
        studentPhone.trim()
      );

      setBookings(prev => [newB, ...prev]);
      setIsAddModalOpen(false);
      setStudentName('');
      setStudentPhone('');
      setGuardianName('');
      addToast(`Student ${studentName} registered for ${seatNumber}`, 'success');

      // Auto-preview generated Student ID Card for walk-in
      setActiveIdCard({
        studentName: newB.studentName,
        rollNumber: newB.rollNumber || `FP-GZP-${newB.id.replace(/[^0-9]/g, '') || '5001'}`,
        studentPhone: newB.studentPhone || '',
        guardianName: guardianName.trim() || undefined,
        seatNumber: newB.seatNumber,
        shift: newB.shift || 'General Shift',
        startDate: newB.startDate,
        endDate: newB.endDate,
        libraryName: library.name,
        libraryAddress: library.address,
        libraryDistrict: library.district,
        libraryOwnerName: library.ownerName || user?.name,
        bookingRef: newB.id
      });
    } catch (err) {
      addToast('Failed to add student', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleRenew = async () => {
    if (!selectedStudent) return;
    setRenewing(true);
    try {
      await bookingService.updateBookingStatus(selectedStudent.id, 'confirmed');
      setBookings(prev => prev.map(b => b.id === selectedStudent.id ? {
        ...b,
        endDate: new Date(Date.now() + renewMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentStatus: 'paid'
      } : b));
      setIsRenewModalOpen(false);
      addToast(`Membership renewed for ${selectedStudent.studentName}!`, 'success');
    } catch (err) {
      addToast('Failed to renew membership', 'error');
    } finally {
      setRenewing(false);
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
          title="Enrolled Library Students"
          subtitle="Manage active study desk memberships, walk-in records, renewals, and fees"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Students' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200 bg-white shadow-sm">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please register your study library before managing enrolled student desk memberships and walk-in records.
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

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = (b.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.seatNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.studentPhone || '').includes(searchQuery) ||
      ((b as any).guardianName || (b as any).parentName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = shiftFilter === 'all' || (b.shift || b.shiftName || '').toLowerCase().includes(shiftFilter.toLowerCase());
    
    const expiry = getExpiryDetails(b.endDate);
    if (statusFilter === 'active' && expiry.status !== 'active') return false;
    if (statusFilter === 'expiring' && expiry.status !== 'expiring') return false;
    if (statusFilter === 'expired' && expiry.status !== 'expired') return false;

    return matchesSearch && matchesShift;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrolled Library Students"
        subtitle={`Manage active study desk memberships, walk-in records, renewals, and fees for ${library.name}`}
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Students' }
        ]}
        actions={
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            Add Walk-in Student
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search student, desk #, phone, guardian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-royal-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Students ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active Members
            </button>
            <button
              onClick={() => setStatusFilter('expiring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'expiring' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Expiring This Week
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'expired' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Expired / Overdue
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" /> Shift:
            </div>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-slate-700 px-3 py-1.5 text-xs focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
            >
              <option value="all">All Shifts</option>
              {library.shifts && library.shifts.length > 0 ? (
                library.shifts.map(s => <option key={s.name} value={s.name}>{s.name}</option>)
              ) : (
                <>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="full day">Full Day</option>
                </>
              )}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-sm overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700 text-base">No Enrolled Students Found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No student records match your active search or filter selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                <tr>
                  <th className="py-3.5 px-4">Student & Guardian</th>
                  <th className="py-3.5 px-4">Desk #</th>
                  <th className="py-3.5 px-4">Shift</th>
                  <th className="py-3.5 px-4">Validity & Expiry</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBookings.map(b => {
                  const expiry = getExpiryDetails(b.endDate);
                  const guardian = (b as any).guardianName || (b as any).parentName;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{b.studentName}</p>
                        <p className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {b.studentPhone || 'Walk-in'}
                        </p>
                        {guardian && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Guardian: <strong className="text-slate-600">{guardian}</strong>
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-royal-blue-600 text-sm">
                        {b.seatNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {b.shift}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 text-[11px]">
                          Till: <span className="font-semibold text-slate-900">{b.endDate}</span>
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${expiry.statusClass}`}>
                          {expiry.text}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-emerald-600 text-sm">₹{b.totalAmount}</p>
                        <StatusBadge status={b.paymentStatus || 'paid'} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(b)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                            title="Send WhatsApp Expiry Reminder"
                          >
                            💬 WhatsApp
                          </button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Contact className="w-3 h-3 text-royal-blue-600" />}
                            onClick={() => {
                              const stuUser = mockStore.getUsers().find(u => 
                                u.id === (b as any).userId || 
                                (u.name && u.name.toLowerCase() === b.studentName.toLowerCase()) || 
                                (u.phone && (u.phone === (b.studentPhone || b.studentMobile) || u.mobile === (b.studentPhone || b.studentMobile)))
                              );
                              const resolvedAvatar = b.studentAvatar || (b as any).avatarUrl || (b as any).avatar || stuUser?.avatarUrl || (stuUser as any)?.avatar;
                              setActiveIdCard({
                                studentName: b.studentName,
                                rollNumber: b.rollNumber || `FP-GZP-${b.id.replace(/[^0-9]/g, '') || '5001'}`,
                                studentPhone: b.studentPhone || b.studentMobile || '',
                                guardianName: (b as any).guardianName || (b as any).parentName,
                                seatNumber: b.seatNumber,
                                shift: b.shift || b.shiftName || 'General Shift',
                                startDate: b.startDate,
                                endDate: b.endDate,
                                libraryName: library.name,
                                libraryAddress: library.address,
                                libraryDistrict: library.district,
                                libraryOwnerName: library.ownerName || user?.name,
                                studentAvatar: resolvedAvatar,
                                bookingRef: b.id
                              });
                            }}
                          >
                            ID Card
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<RotateCw className="w-3 h-3" />}
                            onClick={() => {
                              setSelectedStudent(b);
                              setIsRenewModalOpen(true);
                            }}
                          >
                            Renew
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVacateStudentSeat(b)}
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                          >
                            Vacate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Walk-in Modal with VACANT-ONLY desk selector */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Walk-in Student"
        size="md"
      >
        <form onSubmit={handleAddWalkin} className="space-y-4">
          <Input
            label="Student Full Name *"
            placeholder="e.g. Anand Kumar"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
          <Input
            label="Phone Number *"
            placeholder="e.g. 9876543210"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            required
          />
          <Input
            label="Guardian / Parent Name (Optional)"
            placeholder="e.g. Shyam Sundar"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Chosen Shift *"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              options={
                library.shifts && library.shifts.length > 0
                  ? library.shifts.map(s => ({ value: s.name, label: s.name }))
                  : [
                      { value: 'Morning Shift', label: 'Morning Shift' },
                      { value: 'Evening Shift', label: 'Evening Shift' },
                      { value: 'Full Day', label: 'Full Day' },
                    ]
              }
            />

            <Select
              label="Assigned Desk (Vacant Only) *"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              options={
                vacantSeatsForShift.length > 0
                  ? vacantSeatsForShift.map(seat => ({
                      value: seat,
                      label: `${seat} (Available)`
                    }))
                  : [{ value: '', label: 'No vacant desks' }]
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fee Amount (₹) *"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Select
              label="Payment Mode *"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              options={[
                { value: 'Cash', label: 'Cash (Counter)' },
                { value: 'UPI', label: 'UPI / Direct QR' },
                { value: 'Bank Transfer', label: 'Direct Bank Transfer' }
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submittingAdd}
              disabled={vacantSeatsForShift.length === 0}
            >
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Renew Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title={`Renew Membership: ${selectedStudent?.studentName || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Current Desk: <strong className="text-slate-800">{selectedStudent?.seatNumber}</strong> ({selectedStudent?.shift})
          </p>
          <Select
            label="Renewal Duration"
            value={String(renewMonths)}
            onChange={(e) => setRenewMonths(Number(e.target.value))}
            options={[
              { value: '1', label: '1 Month (+30 Days)' },
              { value: '3', label: '3 Months (+90 Days)' },
              { value: '6', label: '6 Months (+180 Days)' },
            ]}
          />
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
            Fee Collection: <strong className="text-emerald-700">₹{(selectedStudent?.totalAmount || 1200) * renewMonths}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={renewing} onClick={handleRenew}>
              Confirm & Extend
            </Button>
          </div>
        </div>
      </Modal>

      {/* Official Student Study Pass & ID Card Modal */}
      <StudentIdCardModal
        isOpen={!!activeIdCard}
        onClose={() => setActiveIdCard(null)}
        cardData={activeIdCard}
        onUpdatePhoto={(newPhoto) => {
          if (activeIdCard) {
            setBookings(prev => prev.map(item => item.id === activeIdCard.bookingRef || item.studentName === activeIdCard.studentName ? { ...item, studentAvatar: newPhoto } : item));
          }
        }}
      />
    </div>
  );
};
