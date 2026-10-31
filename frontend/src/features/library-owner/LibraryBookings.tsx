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
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  BookOpen,
  Search,
  CheckCircle,
  FileText,
  Printer,
  Calendar,
  IndianRupee,
  Phone,
  Building,
  Armchair,
  Contact
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentIdCardModal, StudentIdCardData } from './components/StudentIdCardModal';
import { mockStore } from '../../mock/store';

export const LibraryBookings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');

  // Admission Slip / Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<LibraryBooking | null>(null);
  // Student ID Card Modal
  const [activeIdCard, setActiveIdCard] = useState<StudentIdCardData | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const libs = await libraryService.getLibrariesByOwner(user.id);
      if (libs.length > 0) {
        setLibrary(libs[0]);
        const bData = await bookingService.getLibraryBookings(libs[0].id);
        setBookings(bData);
      } else {
        setLibrary(null);
      }
    } catch (err) {
      console.error('Failed to load library bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleApproveBooking = async (b: LibraryBooking) => {
    try {
      await bookingService.updateBookingStatus(b.id, 'CONFIRMED');
      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'CONFIRMED' } : x));
      addToast(`Booking ${b.id} for ${b.studentName} approved and confirmed!`, 'success');
    } catch (err) {
      addToast('Failed to approve booking', 'error');
    }
  };

  const handleRejectBooking = async (b: LibraryBooking) => {
    if (!confirm(`Are you sure you want to reject/cancel reservation for ${b.studentName}?`)) return;
    try {
      await bookingService.updateBookingStatus(b.id, 'CANCELLED');
      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'CANCELLED' } : x));
      addToast(`Booking ${b.id} for ${b.studentName} has been cancelled`, 'info');
    } catch (err) {
      addToast('Failed to cancel booking', 'error');
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
          title="Desk Bookings & Reservations"
          subtitle="Online reservations and manual counter bookings"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Bookings' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please register your study library before managing student seat bookings and reservations.
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

  const confirmedCount = bookings.filter(b => (b.status || '').toUpperCase() === 'CONFIRMED').length;
  const pendingCount = bookings.filter(b => (b.status || '').toUpperCase() === 'PENDING').length;
  const cancelledCount = bookings.filter(b => ['CANCELLED', 'REJECTED'].includes((b.status || '').toUpperCase())).length;

  const filtered = bookings.filter(b => {
    const statusUpper = (b.status || '').toUpperCase();
    if (statusFilter === 'CONFIRMED' && statusUpper !== 'CONFIRMED') return false;
    if (statusFilter === 'PENDING' && statusUpper !== 'PENDING') return false;
    if (statusFilter === 'CANCELLED' && !['CANCELLED', 'REJECTED'].includes(statusUpper)) return false;

    const matchesSearch =
      (b.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.seatNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.studentPhone || b.studentMobile || '').includes(search) ||
      (b.id || '').toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Desk Bookings & Reservations"
        subtitle={`Full log of online reservations, student admissions, and counter allocations for ${library.name}`}
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Bookings' }
        ]}
      />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-royal-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'CONFIRMED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pending Requests ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'CANCELLED'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        <div className="w-full sm:w-80">
          <Input
            placeholder="Search booking ID, desk #, or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            <Armchair className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No bookings match the filter</p>
            <p className="text-xs text-slate-400 mt-1">Confirmed desk allocations and pending requests will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Student & Contact</th>
                  <th className="py-3 px-4">Desk</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Amount Credited</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(b => {
                  const statusUpper = (b.status || '').toUpperCase();
                  const isPending = statusUpper === 'PENDING';
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                        {b.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.studentName}</div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                          {b.studentPhone || b.studentMobile || 'No contact'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-royal-blue-600 text-sm">
                        {b.seatNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {b.shift || b.shiftName || 'General Shift'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {b.startDate} to {b.endDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{Number(b.creditedAmount || b.totalAmount || b.amount || 800).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveBooking(b)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                                title="Approve booking request"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectBooking(b)}
                                className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
                                title="Reject booking request"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Contact className="w-3.5 h-3.5 text-royal-blue-600" />}
                            onClick={() => {
                              const stuUser = mockStore.getUsers().find(u => 
                                u.id === (b.studentId || b.userId) || 
                                (u.name && u.name.toLowerCase() === b.studentName.toLowerCase()) || 
                                (u.phone && (u.phone === b.studentPhone || u.mobile === b.studentPhone))
                              );
                              const resolvedAvatar = b.studentAvatar || stuUser?.avatarUrl || (stuUser as any)?.avatar;
                              setActiveIdCard({
                                studentName: b.studentName,
                                rollNumber: b.rollNumber || `FP-GZP-${b.id.replace(/[^0-9]/g, '') || '5001'}`,
                                studentPhone: b.studentPhone || b.studentMobile || '',
                                guardianName: b.guardianName,
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
                            variant="ghost"
                            size="sm"
                            icon={<FileText className="w-4 h-4 text-slate-500 hover:text-royal-blue-600" />}
                            onClick={() => setActiveReceipt(b)}
                          >
                            Pass / Slip
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

      {/* Official Admission Slip / Receipt Modal */}
      <Modal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        title="Official Study Hall Admission Slip"
        size="md"
      >
        {activeReceipt && (
          <div className="space-y-5 text-slate-700 font-sans">
            {/* Library Branding Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-royal-blue-600 text-white font-black text-lg mb-1">
                FP
              </div>
              <h3 className="text-base font-black text-slate-900">{library?.name}</h3>
              <p className="text-xs text-slate-500">{library?.address}, {library?.district || 'Ghazipur'}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  (activeReceipt.status || '').toUpperCase() === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeReceipt.status || 'CONFIRMED'} ADMISSION
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  PASS #{activeReceipt.id}
                </span>
              </div>
            </div>

            {/* Admission Details Grid */}
            <div className="space-y-2.5 text-xs divide-y divide-slate-100 border border-slate-100 rounded-lg p-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{activeReceipt.studentName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono text-slate-800">{activeReceipt.studentPhone || activeReceipt.studentMobile || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Allocated Desk Number:</span>
                <span className="font-mono font-black text-royal-blue-600 text-sm">{activeReceipt.seatNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Shift Time Slot:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.shift || activeReceipt.shiftName || 'General Shift'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Validity Period:</span>
                <span className="font-mono font-medium text-slate-800">{activeReceipt.startDate} to {activeReceipt.endDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-medium text-slate-800">{activeReceipt.paymentMethod || 'Online / Counter'}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold border-t border-slate-200">
                <span>Monthly Subscription:</span>
                <span className="text-emerald-700">₹{Number(activeReceipt.totalAmount || activeReceipt.amount || 800).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Study Hall Rules */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">Study Hall Conduct:</div>
              <div>1. Pin-drop silence must be observed at all times in the reading hall.</div>
              <div>2. Keep your allocated desk clean; food & drinks (except water) are prohibited.</div>
              <div>3. Personal belongings remain student's responsibility. Desk expires on {activeReceipt.endDate}.</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveReceipt(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrintReceipt}>
                Print Admission Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Official Student Study Pass & ID Card Modal */}
      <StudentIdCardModal
        isOpen={!!activeIdCard}
        onClose={() => setActiveIdCard(null)}
        cardData={activeIdCard}
        onUpdatePhoto={(newPhoto) => {
          if (activeIdCard) {
            setBookings(prev => prev.map(item => item.id === activeIdCard.bookingRef ? { ...item, studentAvatar: newPhoto } : item));
          }
        }}
      />
    </div>
  );
};
