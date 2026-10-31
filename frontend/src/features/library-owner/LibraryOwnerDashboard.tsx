import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { Library, LibraryBooking, LibraryExpense } from '../../types';
import { librarySubscriptionService } from '../../services/librarySubscriptionService';
import { LibrarySubscription } from '../../types/librarySubscriptionPricing';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import {
  Armchair,
  Users,
  IndianRupee,
  Clock,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  LogIn,
  LogOut,
  Sparkles,
  User,
  ShieldCheck,
  Edit2,
  Contact,
  Camera,
  Award,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentIdCardModal, StudentIdCardData } from './components/StudentIdCardModal';
import { UserAvatar } from '../../components/common/UserAvatar';
import { mockStore } from '../../mock/store';
import { compressImage } from '../../utils/imageUtils';
import { RecentDocumentsWidget } from '../../components/documents/RecentDocumentsWidget';
import { LibraryCertificateModal } from '../../components/common/LibraryCertificateModal';
import { libraryDiscoveryService } from '../../services/libraryDiscoveryService';
import { LibraryCertificateData } from '../../types';

export const LibraryOwnerDashboard: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  const dashboardPhotoInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [library, setLibrary] = useState<Library | null>(null);
  const [subscription, setSubscription] = useState<LibrarySubscription | null>(null);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  // ID Card Modal
  const [activeIdCard, setActiveIdCard] = useState<StudentIdCardData | null>(null);
  // Official Library Certificate Modal
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<LibraryExpense[]>([]);

  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    onlineCollections: 0,
    counterCollections: 0,
    netPayout: 0,
    totalBookingsCount: 0,
    activeStudentsCount: 0,
    totalExpenses: 0,
    netProfit: 0,
    platformFee: 0
  });
  const [attendanceMetrics, setAttendanceMetrics] = useState({
    checkedInToday: 0,
    currentlyInHall: 0,
    checkedOutToday: 0,
  });
  const [loading, setLoading] = useState(true);

  // Manual Walk-in Student Modal
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [shift, setShift] = useState('Morning Shift');
  const [amount, setAmount] = useState('800');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [submittingWalkin, setSubmittingWalkin] = useState(false);

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<'RENT' | 'ELECTRICITY' | 'WIFI' | 'CLEANING' | 'STAFF_SALARY' | 'MAINTENANCE' | 'OTHER'>('ELECTRICITY');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDescription, setExpDescription] = useState('');
  const [expPaymentMode, setExpPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('UPI');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const libs = await libraryService.getLibrariesByOwner(user.id);
      if (libs.length > 0) {
        const activeLib = libs[0];
        setLibrary(activeLib);

        // Fetch all dependent data concurrently in parallel
        const [sub, bData, rev, expList, attRecords] = await Promise.all([
          librarySubscriptionService.getSubscriptionByLibraryId(activeLib.id),
          bookingService.getLibraryBookings(activeLib.id),
          libraryService.getLibraryRevenue(activeLib.id),
          libraryService.getLibraryExpenses(activeLib.id),
          libraryService.getAttendanceRecords(activeLib.id)
        ]);

        if (sub) setSubscription(sub);
        setBookings(bData || []);
        if (rev) setRevenueData(rev);
        setExpenses(expList || []);

        // Calculate attendance live metrics
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecords = (attRecords || []).filter(r => r.date === todayStr);
        const checkedIn = todayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const checkedOut = todayRecords.filter(r => Boolean(r.checkOutTime)).length;
        setAttendanceMetrics({
          checkedInToday: checkedIn,
          currentlyInHall: Math.max(0, checkedIn - checkedOut),
          checkedOutToday: checkedOut
        });

        // Pre-fill modal shift & fee
        if (activeLib.shifts && activeLib.shifts.length > 0) {
          const initialShift = activeLib.shifts[0].name;
          setShift(initialShift);
          setAmount(String(activeLib.shifts[0].price || activeLib.shifts[0].monthlyPrice || activeLib.monthlyFee || 800));
        }
      } else {
        setLibrary(null);
        setBookings([]);
        setExpenses([]);
        setRevenueData({
          totalRevenue: 0,
          onlineCollections: 0,
          counterCollections: 0,
          netPayout: 0,
          totalBookingsCount: 0,
          activeStudentsCount: 0,
          totalExpenses: 0,
          netProfit: 0,
          platformFee: 0
        });
      }
    } catch (err) {
      console.error('Failed to load library dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Compute vacant seats strictly for the currently selected shift
  const vacantSeatsForShift = useMemo(() => {
    if (!library) return [];
    const total = library.totalSeats || 0;
    const sShift = (shift || '').toLowerCase();
    const occupiedSeatNumbers = new Set<string>();

    // Check confirmed bookings matching this shift
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

    // Check library seats shiftOccupancy
    (library.seats || []).forEach(s => {
      if (s.status === 'OCCUPIED') {
        occupiedSeatNumbers.add(s.seatNumber);
      }
      if (s.shiftOccupancy) {
        const occ = s.shiftOccupancy;
        if (occ.isFullDay) {
          occupiedSeatNumbers.add(s.seatNumber);
        } else if (sShift.includes('morning') && occ.morning?.isBooked) {
          occupiedSeatNumbers.add(s.seatNumber);
        } else if (sShift.includes('afternoon') && occ.afternoon?.isBooked) {
          occupiedSeatNumbers.add(s.seatNumber);
        } else if (sShift.includes('evening') && occ.evening?.isBooked) {
          occupiedSeatNumbers.add(s.seatNumber);
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

  // Sync seatNumber when vacant seats change
  useEffect(() => {
    if (vacantSeatsForShift.length > 0) {
      if (!seatNumber || !vacantSeatsForShift.includes(seatNumber)) {
        setSeatNumber(vacantSeatsForShift[0]);
      }
    } else {
      setSeatNumber('');
    }
  }, [vacantSeatsForShift]);

  const handleShiftChange = (selectedShiftName: string) => {
    setShift(selectedShiftName);
    if (library && library.shifts) {
      const matchedShift = library.shifts.find(s => s.name === selectedShiftName);
      if (matchedShift) {
        setAmount(String(matchedShift.price || matchedShift.monthlyPrice || library.monthlyFee || 800));
      }
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;
    if (!studentName.trim() || !studentPhone.trim() || !seatNumber.trim()) {
      addToast('Please fill all mandatory fields (Name, Phone, Seat #)', 'error');
      return;
    }

    setSubmittingWalkin(true);
    try {
      // 1. Create walk-in student
      const newStudent = await libraryService.addManualStudent({
        libraryId: library.id,
        name: studentName.trim(),
        mobile: studentPhone.trim(),
        phone: studentPhone.trim(),
        guardianName: guardianName.trim() || undefined,
        seatNumber: seatNumber.trim().toUpperCase(),
        shift,
        joiningDate: new Date().toISOString().split('T')[0],
        monthlyFee: Number(amount) || 800,
        feeStatus: 'paid',
      });

      // 2. Occupy the seat
      await libraryService.updateSeatStatus(
        library.id,
        seatNumber.trim().toUpperCase(),
        'OCCUPIED',
        studentName.trim(),
        shift,
        studentPhone.trim()
      );

      // 3. Record payment invoice
      await libraryService.recordFeePayment(library.id, newStudent.id, {
        studentName: studentName.trim(),
        seatNumber: seatNumber.trim().toUpperCase(),
        shift,
        amount: Number(amount) || 800,
        paymentMode,
        notes: `Walk-in registration - ${shift}`
      });

      // 4. Create booking entry for log
      const newBooking = await bookingService.createBooking({
        libraryId: library.id,
        libraryName: library.name,
        userId: newStudent.id,
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

      setBookings(prev => [newBooking, ...prev]);
      setIsWalkinModalOpen(false);
      setStudentName('');
      setStudentPhone('');
      setGuardianName('');
      
      addToast(`Walk-in registered! Desk ${seatNumber.toUpperCase()} allocated to ${studentName}. Receipt #${newStudent.referenceId} issued.`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to register walk-in student', 'error');
    } finally {
      setSubmittingWalkin(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;
    if (!expAmount || Number(expAmount) <= 0) {
      addToast('Please enter a valid expense amount', 'error');
      return;
    }

    setSubmittingExpense(true);
    try {
      const newExp = await libraryService.addLibraryExpense({
        libraryId: library.id,
        title: expDescription.trim() || `${expCategory} expense`,
        category: expCategory.toLowerCase(),
        amount: Number(expAmount),
        date: expDate || new Date().toISOString().split('T')[0],
        paymentMethod: expPaymentMode === 'UPI' ? 'UPI' : expPaymentMode === 'CASH' ? 'Cash' : 'Bank Transfer',
        description: expDescription.trim(),
        notes: expDescription.trim()
      });

      setExpenses(prev => [newExp, ...prev]);
      setIsExpenseModalOpen(false);
      setExpAmount('');
      setExpDescription('');
      addToast('Operating expense recorded successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to record expense', 'error');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await libraryService.deleteLibraryExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      addToast('Expense record deleted', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to delete expense', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pure Zero Metrics if no library registered yet
  if (!library) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <PageHeader
          title="Library Partner Dashboard"
          subtitle="Welcome to ZYZU'S Library Management System"
          breadcrumbs={[{ label: 'Library Management' }]}
        />

        {/* Onboarding Empty State Card */}
        <Card className="p-8 border-2 border-dashed border-royal-blue-200 bg-gradient-to-br from-white via-royal-blue-50/20 to-slate-50 text-center">
          <div className="w-16 h-16 rounded-2xl bg-royal-blue-100 text-royal-blue-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            List Your First Self-Study Library
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
            You currently have no study library listed on ZYZU'S. Onboard your study hall to configure air-conditioned shifts, setup your visual desk matrix, automate student check-ins, and receive instant seat bookings from competitive aspirants.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8 text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-royal-blue-50 text-royal-blue-600 flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Register Premises</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter study space address, total desk capacity, Wi-Fi & AC amenities.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">District Verification</h4>
              <p className="text-xs text-slate-500 mt-1">
                Upload electricity bill / trade license for District Admin accreditation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Receive Bookings</h4>
              <p className="text-xs text-slate-500 mt-1">
                Manage desk shifts, issue official receipts, and track student attendance.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/library-owner/create">
              <Button variant="primary" size="lg" icon={<PlusCircle className="w-5 h-5" />}>
                List Your Study Library Now
              </Button>
            </Link>
          </div>
        </Card>

        {/* Baseline Zero KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60">
          <StatCard
            title="Total Desks Capacity"
            value="0"
            change="Not configured"
            isPositive={false}
            icon={<Armchair className="w-6 h-6 text-slate-400" />}
          />
          <StatCard
            title="Active Occupied Desks"
            value="0"
            change="0% Occupancy"
            isPositive={false}
            icon={<Users className="w-6 h-6 text-slate-400" />}
          />
          <StatCard
            title="Available Desks"
            value="0"
            change="No desks listed"
            isPositive={false}
            icon={<CheckCircle2 className="w-6 h-6 text-slate-400" />}
          />
          <StatCard
            title="Monthly Collections"
            value="₹0"
            change="Zero fees recorded"
            isPositive={false}
            icon={<IndianRupee className="w-6 h-6 text-slate-400" />}
          />
        </div>
      </div>
    );
  }

  // Active Library Dashboard with Real Calculations
  const totalSeats = library.totalSeats || 0;
  const occupiedSeats = revenueData.activeStudentsCount || bookings.filter(b => b.status === 'confirmed').length;
  const availableSeats = Math.max(0, totalSeats - occupiedSeats);
  const totalRevenue = revenueData.totalRevenue;
  const isApproved = (library.verificationStatus || '').toUpperCase() === 'APPROVED';

  const handleDashboardPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      if (dashboardPhotoInputRef.current) dashboardPhotoInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Profile image must be less than 10MB', 'error');
      if (dashboardPhotoInputRef.current) dashboardPhotoInputRef.current.value = '';
      return;
    }

    setPhotoUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
      const success = await updateUserProfile({ avatarUrl: compressedDataUrl, avatar: compressedDataUrl });
      if (success) {
        addToast('Owner profile photo updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Dashboard photo upload failed:', err);
      addToast('Failed to update profile photo', 'error');
    } finally {
      setPhotoUploading(false);
      if (dashboardPhotoInputRef.current) dashboardPhotoInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Direct Dashboard Avatar Upload */}
      <input
        type="file"
        ref={dashboardPhotoInputRef}
        onChange={handleDashboardPhotoChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <PageHeader
        title={library.name}
        subtitle={`Location: ${library.area}, ${library.district || 'Ghazipur'} • ${isApproved ? 'Accredited Partner' : 'Verification Pending'}`}
        breadcrumbs={[{ label: 'Library Management' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/library-owner/seats">
              <Button variant="outline" icon={<Armchair className="w-4 h-4" />}>
                Live Desk Grid
              </Button>
            </Link>
            <Button
              variant="outline"
              icon={<Receipt className="w-4 h-4 text-rose-600" />}
              onClick={() => setIsExpenseModalOpen(true)}
            >
              Add Expense
            </Button>
            <Button
              variant="primary"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsWalkinModalOpen(true)}
            >
              Add Walk-in Student
            </Button>
          </div>
        }
      />

      {/* Listing Subscription Status Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white">
                {subscription?.planName || 'Self-Study Listing Subscription'}
              </h4>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                subscription?.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : subscription?.status === 'GRACE_PERIOD'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}>
                {subscription?.status === 'GRACE_PERIOD' ? 'Grace Period (Action Needed)' : (subscription?.status || 'Active')}
              </span>
              {subscription?.isFree && (
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Free Tier
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              {subscription?.expiryDate ? (
                <span>Valid till {new Date(subscription.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              ) : (
                <span>Includes listing accreditation, search visibility & student desk allocation</span>
              )}
              <span>•</span>
              <span>Billing Cycle: {subscription?.billingCycle || 'MONTHLY'}</span>
              <span>•</span>
              <span>Auto-Renew: {subscription?.autoRenew ? 'Enabled' : 'Disabled'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Link to="/library-owner/subscription">
            <Button
              variant={subscription?.status === 'GRACE_PERIOD' ? 'primary' : 'outline'}
              size="sm"
              className={subscription?.status === 'GRACE_PERIOD' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'border-indigo-400/40 text-white hover:bg-white/10'}
            >
              {subscription?.status === 'GRACE_PERIOD' ? 'Renew Immediately' : 'Manage Subscription & Invoices'}
            </Button>
          </Link>
        </div>
      </div>
      {/* SECTION #40 & #41: PROMINENT LIBRARY VERIFICATION & PUBLIC DISCOVERY STATUS */}
      {(() => {
        const isDiscoverable = library ? libraryDiscoveryService.isLibraryDiscoverable(library) : false;
        const certData: LibraryCertificateData | null = library && isApproved ? {
          certificateId: `FP-VPL-${(library.id || '').replace(/\D/g, '').padStart(4, '0') || '8012'}`,
          certificateNumber: `FP-VPL-${(library.id || '').replace(/\D/g, '').padStart(4, '0') || '8012'}`,
          libraryName: library.name,
          libraryId: library.id.startsWith('FP-LIB-') ? library.id : `FP-LIB-${(library.id || '').replace(/\D/g, '').padStart(4, '0') || '1084'}`,
          ownerName: library.ownerName || user?.name || 'Library Owner',
          ownerId: library.ownerId || user?.id || 'usr-owner-01',
          fullAddress: library.address || `${library.area}, ${library.district || 'Ghazipur'}`,
          locality: library.area || 'Saidpur',
          localityName: library.area || 'Saidpur',
          districtName: library.district || 'Ghazipur',
          stateName: library.state || 'Uttar Pradesh',
          totalDesks: library.totalSeats || 50,
          joiningDate: library.createdAt || '15 Jan 2026',
          issueDate: '01 Feb 2026',
          validUntil: '31 Mar 2027',
          isVerified: true,
          isPartnered: true,
          sealsApproved: true,
          verificationHash: 'SHA256-FP-VERIFIED-PARTNER-SEAL-8829'
        } : null;

        return (
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                  isApproved 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      Library Verification & Discovery Status
                    </h3>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                      isApproved 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isApproved ? '✓ VERIFIED & PARTNERED' : 'UNDER REVIEW'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ZYZU'S Sovereign Accreditation, Public Discovery & PIN Search Indexing
                  </p>
                </div>
              </div>

              {isApproved && certData && (
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Award className="w-4 h-4 text-amber-300" />}
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="bg-royal-blue-600 hover:bg-royal-blue-700 text-white font-bold text-xs shadow-md shadow-royal-blue-600/20"
                  >
                    View Official Certificate
                  </Button>
                  <Link to="/documents">
                    <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4 text-slate-600" />}>
                      Documents & Receipts
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* 4-Pillar Status Grid per Section #41 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Library Status</span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-1">
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Under Review</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Public Discovery</span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-1">
                  {isDiscoverable ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Restricted</span>
                    </span>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">PIN Search</span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-1">
                  {isDiscoverable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Indexed ({library?.pincode || '233304'})</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pending Index</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Location Master</span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified ({library?.district || 'Ghazipur'})</span>
                </span>
              </div>
            </div>

            {!isDiscoverable && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-3 text-amber-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Public Discovery: Restricted</strong> — Required verification / location information is being accredited.
                  </span>
                </div>
                <Link to="/library-owner/profile">
                  <Button variant="outline" size="sm" className="bg-white border-amber-300 text-amber-900 text-xs font-bold">
                    Fix Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {!isApproved && (
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-900">
              Listing Verification Pending (District Administration)
            </p>
            <p className="mt-0.5 text-amber-700">
              Your library registration has been submitted and is currently being verified by the District Admin. You can configure desk layouts, shifts, and register walk-in students now; public student discovery will unlock once accredited.
            </p>
          </div>
        </div>
      )}

      {/* Owner Profile & Facility Identity Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0" title="Click to upload/change photo">
            <UserAvatar user={user} size="xl" shape="rounded" showBorder />
            <button
              type="button"
              onClick={() => dashboardPhotoInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-xs"
              title="Upload new profile photo"
            >
              <Camera className="w-4 h-4 text-white mb-0.5" />
              <span className="text-[10px] font-bold">{photoUploading ? '...' : 'Change'}</span>
            </button>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-900">{user?.name || library.ownerName || 'Study Hall Owner'}</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Facility Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>{user?.designation || 'Founder & Operating Head'}</span>
              <span>•</span>
              <span>Primary: +91 {user?.mobile || library.ownerPhone || '9876543212'}</span>
              <span>•</span>
              <span>WhatsApp: +91 {user?.whatsappNumber || user?.mobile || '9876543212'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            icon={<Camera className="w-3.5 h-3.5 text-royal-blue-600" />}
            onClick={() => dashboardPhotoInputRef.current?.click()}
            disabled={photoUploading}
          >
            {photoUploading ? 'Uploading...' : 'Update Photo'}
          </Button>
          <Link to="/library-owner/profile">
            <Button variant="outline" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />}>
              Manage Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Real KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Desks Capacity"
          value={totalSeats}
          change={library.facilities.includes('Air Conditioned (AC)') || library.facilities.includes('Fully Air Conditioned') ? 'Air Conditioned' : 'Standard'}
          isPositive={true}
          icon={<Armchair className="w-6 h-6 text-royal-blue-600" />}
        />
        <StatCard
          title="Active Occupied Seats"
          value={occupiedSeats}
          change={totalSeats > 0 ? `${Math.round((occupiedSeats / totalSeats) * 100)}% Occupancy` : '0%'}
          isPositive={occupiedSeats > 0}
          icon={<Users className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Monthly Collections"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          change="Direct Collections Credited"
          isPositive={totalRevenue > 0}
          icon={<IndianRupee className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Monthly Operating Expenses"
          value={`₹${(revenueData.totalExpenses || 0).toLocaleString('en-IN')}`}
          change={`Net Profit: ₹${Math.max(0, totalRevenue - (revenueData.totalExpenses || 0)).toLocaleString('en-IN')}`}
          isPositive={totalRevenue > (revenueData.totalExpenses || 0)}
          icon={<Receipt className="w-6 h-6 text-rose-600" />}
        />
      </div>

      {/* Hall Attendance Live Monitor & Shift Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance in Study Hall */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="text-base font-bold text-slate-900">Live Study Hall Attendance</h3>
            </div>
            <Link to="/library-owner/attendance" className="text-xs font-semibold text-royal-blue-600 hover:underline">
              Full Register
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-royal-blue-50 to-indigo-50 border border-royal-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-royal-blue-700 uppercase tracking-wider">Currently In Study Hall</p>
                <h4 className="text-2xl font-black text-royal-blue-900 mt-1">
                  {attendanceMetrics.currentlyInHall} <span className="text-xs font-normal text-royal-blue-700">students</span>
                </h4>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-royal-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Checked In Today</span>
                </div>
                <p className="text-base font-bold text-slate-900">{attendanceMetrics.checkedInToday}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                  <LogOut className="w-3.5 h-3.5 text-slate-600" />
                  <span>Checked Out</span>
                </div>
                <p className="text-base font-bold text-slate-900">{attendanceMetrics.checkedOutToday}</p>
              </div>
            </div>

            <Link to="/library-owner/attendance">
              <Button variant="outline" className="w-full text-xs justify-center gap-1 mt-2">
                Open Daily Attendance Register <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Active Shift Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Current Shift Status</h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Shift
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configured Shift</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {library.shifts && library.shifts.length > 0 ? library.shifts[0].name : 'Full Day Study'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {library.shifts && library.shifts.length > 0
                  ? `${library.shifts[0].startTime} - ${library.shifts[0].endTime}`
                  : library.timings || '06:00 AM – 11:00 PM'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Capacity Utilization</span>
                <span className="text-royal-blue-600">
                  {totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-royal-blue-600 rounded-full transition-all"
                  style={{ width: `${totalSeats > 0 ? Math.min(100, (occupiedSeats / totalSeats) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/library-owner/seats">
                <Button variant="outline" className="w-full text-xs justify-center gap-1">
                  View Visual Desk Matrix <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Operating Financial Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Net Profit</h3>
              <p className="text-xs text-slate-500">Direct Collections • Operating Expenses • Net Operating Yield</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Total Collections Credited:</span>
              <span className="font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Operating Expenses:</span>
              <span className="font-bold text-rose-600">-₹{(revenueData.totalExpenses || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl">
              <div>
                <span className="text-emerald-950 font-bold block">Net Operating Profit:</span>
                <span className="text-[11px] font-medium text-emerald-700">
                  {totalRevenue > 0 ? `${Math.round(((Math.max(0, totalRevenue - (revenueData.totalExpenses || 0))) / totalRevenue) * 100)}% Net Margin` : 'Zero Dues'}
                </span>
              </div>
              <span className="font-black text-lg text-emerald-800">
                ₹{Math.max(0, totalRevenue - (revenueData.totalExpenses || 0)).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2">
              <Link to="/library-owner/revenue">
                <Button variant="outline" className="w-full text-xs justify-center gap-1">
                  View Full Revenue Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Official Library Documents & Receipts Widget */}
      <RecentDocumentsWidget
        userId={user?.id || 'usr-lib-suresh'}
        userRole="LIBRARY_OWNER"
        allDocumentsPath="/library-owner/documents"
      />

      {/* Tables: Recent Registrations and Operating Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Member Registrations & Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Desk Bookings</h3>
              <p className="text-xs text-slate-500">Live feed from ZYZU'S online bookings & walk-ins</p>
            </div>
            <Link to="/library-owner/bookings" className="text-xs font-semibold text-royal-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
              <Armchair className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No active bookings recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Walk-in registrations and online reservations will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                  <tr>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Desk</th>
                    <th className="py-3 px-3">Shift</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{b.studentName}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{b.studentPhone}</p>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-royal-blue-600">
                        {b.seatNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">
                        {b.shift}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        ₹{Number(b.creditedAmount || b.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
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
                              studentPhone: b.studentPhone || '',
                              seatNumber: b.seatNumber,
                              shift: b.shift || 'General Shift',
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Operating Expenses Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Operating Expenses Log</h3>
              <p className="text-xs text-slate-500">Rent, electricity, Wi-Fi, cleaning, and maintenance</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Receipt className="w-3.5 h-3.5 text-rose-600" />}
              onClick={() => setIsExpenseModalOpen(true)}
            >
              Add Expense
            </Button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
              <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No expenses recorded this month</p>
              <p className="text-xs text-slate-400 mt-1">Record electricity bills, rent, Wi-Fi charges to track net profit.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsExpenseModalOpen(true)}
              >
                Record First Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {expenses.slice(0, 5).map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {exp.date}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 truncate max-w-[140px]">
                        {exp.description || exp.title || exp.notes}
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-600">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Manual Walk-in Modal with VACANT-ONLY desk selector */}
      <Modal
        isOpen={isWalkinModalOpen}
        onClose={() => setIsWalkinModalOpen(false)}
        title="Register Manual Walk-in Student"
        size="md"
      >
        <form onSubmit={handleCreateWalkin} className="space-y-4">
          <Input
            label="Student Full Name *"
            placeholder="e.g. Ramesh Chandra"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />

          <Input
            label="Mobile Number * (for WhatsApp receipt)"
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
              onChange={(e) => handleShiftChange(e.target.value)}
              options={
                library.shifts && library.shifts.length > 0
                  ? library.shifts.map(s => ({
                      value: s.name,
                      label: `${s.name} (${s.startTime} - ${s.endTime})`
                    }))
                  : [
                      { value: 'Morning Shift', label: 'Morning Shift (6 AM - 12 PM)' },
                      { value: 'Afternoon Shift', label: 'Afternoon Shift (12 PM - 6 PM)' },
                      { value: 'Evening Shift', label: 'Evening Shift (6 PM - 11 PM)' },
                      { value: 'Full Day', label: 'Full Day (24 Hours)' },
                    ]
              }
            />

            <Select
              label="Assigned Desk (Vacant Seats Only) *"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              options={
                vacantSeatsForShift.length > 0
                  ? vacantSeatsForShift.map(seat => ({
                      value: seat,
                      label: `${seat} (Available)`
                    }))
                  : [{ value: '', label: 'No vacant desks in this shift' }]
              }
              required
            />
          </div>

          {vacantSeatsForShift.length === 0 && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              ⚠️ All desks in <strong>{shift}</strong> are currently occupied. Please choose another shift or vacate a desk from the Seat Grid.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Fee Amount (₹) *"
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
                { value: 'Cash', label: 'Cash at Desk' },
                { value: 'UPI', label: 'Direct Library QR / UPI' },
                { value: 'Cheque', label: 'Bank Cheque / NEFT' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsWalkinModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submittingWalkin}
              disabled={vacantSeatsForShift.length === 0}
            >
              Confirm Allocation & Generate Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Operating Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Operating Expense"
        size="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Expense Category *"
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value as any)}
              options={[
                { value: 'RENT', label: 'Premises Rent' },
                { value: 'ELECTRICITY', label: 'Electricity / AC Bill' },
                { value: 'WIFI', label: 'High-Speed Wi-Fi & Internet' },
                { value: 'CLEANING', label: 'Cleaning & Housekeeping' },
                { value: 'STAFF_SALARY', label: 'Staff / Caretaker Salary' },
                { value: 'MAINTENANCE', label: 'Furniture / Inverter Repair' },
                { value: 'OTHER', label: 'Miscellaneous / Water Supply' },
              ]}
            />

            <Input
              label="Amount (₹) *"
              type="number"
              placeholder="e.g. 3500"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expense Date *"
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              required
            />

            <Select
              label="Payment Mode *"
              value={expPaymentMode}
              onChange={(e) => setExpPaymentMode(e.target.value as any)}
              options={[
                { value: 'UPI', label: 'UPI / Direct QR' },
                { value: 'CASH', label: 'Cash Payment' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer / NEFT' },
              ]}
            />
          </div>

          <Input
            label="Description / Vendor Note *"
            placeholder="e.g. Electricity bill for AC reading hall (June 2026)"
            value={expDescription}
            onChange={(e) => setExpDescription(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingExpense}>
              Save Expense Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Student Study Pass & ID Card Modal */}
      <StudentIdCardModal
        isOpen={!!activeIdCard}
        onClose={() => setActiveIdCard(null)}
        cardData={activeIdCard}
        onUpdatePhoto={(newPhoto) => {
          if (activeIdCard?.bookingRef) {
            setBookings(prev => prev.map(b => b.id === activeIdCard.bookingRef ? { ...b, studentAvatar: newPhoto } : b));
          }
        }}
      />

      {/* Official Verified & Partnered Study Library Certificate Modal (Sections #2 - #8) */}
      {library && (
        <LibraryCertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificate={{
            certificateId: `FP-VPL-${(library.id || '').replace(/\D/g, '').padStart(4, '0') || '8012'}`,
            certificateNumber: `FP-VPL-${(library.id || '').replace(/\D/g, '').padStart(4, '0') || '8012'}`,
            libraryName: library.name,
            libraryId: library.id.startsWith('FP-LIB-') ? library.id : `FP-LIB-${(library.id || '').replace(/\D/g, '').padStart(4, '0') || '1084'}`,
            ownerName: library.ownerName || user?.name || 'Library Owner',
            ownerId: library.ownerId || user?.id || 'usr-owner-01',
            fullAddress: library.address || `${library.area}, ${library.district || 'Ghazipur'}`,
            locality: library.area || 'Saidpur',
            localityName: library.area || 'Saidpur',
            districtName: library.district || 'Ghazipur',
            stateName: library.state || 'Uttar Pradesh',
            totalDesks: library.totalSeats || 50,
            joiningDate: library.createdAt || '15 Jan 2026',
            issueDate: '01 Feb 2026',
            validUntil: '31 Mar 2027',
            isVerified: true,
            isPartnered: true,
            sealsApproved: true,
            verificationHash: 'SHA256-FP-VERIFIED-PARTNER-SEAL-8829'
          }}
        />
      )}
    </div>
  );
};
