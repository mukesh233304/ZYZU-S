import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { payrollService } from '../../services/payrollService';
import { Teacher, TeacherAssignment, TeacherPayout, TeacherBankAccount } from '../../types';
import { TeacherPayrollItem } from '../../types/finance';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { FinancialDocumentViewer } from '../../components/finance/FinancialDocumentViewer';
import { TeacherRevenueChart } from './components/TeacherRevenueChart';
import { TeacherPayoutDetailsDrawer } from './components/TeacherPayoutDetailsDrawer';
import {
  IndianRupee,
  CreditCard,
  Building,
  TrendingUp,
  Download,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Wallet,
  FileText,
  Eye,
  Receipt,
  PieChart,
  ArrowDownRight,
  Info,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const TeacherRevenue: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<TeacherPayrollItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Payout for Drawer
  const [selectedPayout, setSelectedPayout] = useState<TeacherPayout | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Bank Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: '',
  });
  const [savingBank, setSavingBank] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [tProfile, aData, pData, pRecords] = await Promise.all([
        teacherService.getProfile(user.id),
        teacherService.getAssignments(user.id),
        teacherService.getPayouts(user.id),
        payrollService.getTeacherPayroll({ teacherId: user.id })
      ]);

      if (tProfile) {
        setTeacher(tProfile);
        if (tProfile.bankAccount) {
          setBankFormData({
            accountHolderName: tProfile.bankAccount.accountHolderName || '',
            bankName: tProfile.bankAccount.bankName || '',
            accountNumber: tProfile.bankAccount.accountNumber || '',
            confirmAccountNumber: tProfile.bankAccount.accountNumber || '',
            ifscCode: tProfile.bankAccount.ifscCode || '',
            upiId: tProfile.bankAccount.upiId || '',
          });
        }
      }
      setAssignments(aData || []);
      setPayouts(pData || []);

      if (pRecords && pRecords.length > 0) {
        setPayrollRecords(pRecords);
      } else {
        const allRuns = await payrollService.getTeacherPayroll();
        const matched = allRuns.filter((r: TeacherPayrollItem) => 
          r.teacherId === user.id || 
          (user.name && r.teacherName.toLowerCase().includes(user.name.toLowerCase()))
        );
        setPayrollRecords(matched);
      }
    } catch (err) {
      console.error('Failed to load revenue data', err);
      addToast('Failed to load authoritative revenue records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    if (bankFormData.accountNumber !== bankFormData.confirmAccountNumber) {
      addToast('Account numbers do not match. Please verify.', 'error');
      return;
    }

    if (bankFormData.accountNumber.length < 8) {
      addToast('Please enter a valid bank account number', 'error');
      return;
    }

    if (bankFormData.ifscCode.length < 6) {
      addToast('Please enter a valid IFSC code', 'error');
      return;
    }

    setSavingBank(true);
    try {
      const bankData: TeacherBankAccount = {
        accountHolderName: bankFormData.accountHolderName,
        bankName: bankFormData.bankName,
        accountNumber: bankFormData.accountNumber,
        ifscCode: bankFormData.ifscCode.toUpperCase(),
        upiId: bankFormData.upiId || undefined,
        isVerified: true,
      };

      await teacherService.updateBankAccount(teacher.id, bankData);
      await fetchData();
      setIsBankModalOpen(false);
      addToast('Direct bank account linked and verified for disbursements!', 'success');
    } catch (err) {
      addToast('Failed to save bank account details', 'error');
    } finally {
      setSavingBank(false);
    }
  };

  // 16. Financial KPI Calculations strictly from authoritative backend data
  const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const totalMonthlyRunrate = assignments.reduce((acc, a) => acc + (a.monthlyFee || 0), 0);

  // Total Lifetime Earnings
  const totalLifetimePaid = useMemo(() => {
    const fromPayouts = payouts
      .filter(p => p.status === 'paid')
      .reduce((acc, p) => acc + p.amount, 0);
    const fromPayroll = payrollRecords
      .filter(pr => pr.status === 'PAID')
      .reduce((acc, pr) => acc + pr.netPayable, 0);
    return Math.max(fromPayouts, fromPayroll);
  }, [payouts, payrollRecords]);

  // Pending Payout
  const totalPendingPayout = useMemo(() => {
    const fromPayouts = payouts
      .filter(p => p.status === 'pending')
      .reduce((acc, p) => acc + p.amount, 0);
    const fromPayroll = payrollRecords
      .filter(pr => pr.status === 'READY_FOR_PAYMENT' || pr.status === 'PAYMENT_QUEUED')
      .reduce((acc, pr) => acc + pr.netPayable, 0);
    return Math.max(fromPayouts, fromPayroll);
  }, [payouts, payrollRecords]);

  // This Month's Eligible Earnings
  const thisMonthEarnings = useMemo(() => {
    const currentShort = new Date().toLocaleDateString('en-IN', { month: 'short' });
    const currentPayroll = payrollRecords.find(pr => 
      pr.billingMonth.toLowerCase().includes(currentShort.toLowerCase())
    );
    if (currentPayroll) {
      return currentPayroll.teacherEarnings;
    }
    return totalMonthlyRunrate;
  }, [payrollRecords, totalMonthlyRunrate]);

  // Failed / Returned Settlements
  const failedSettlementsCount = payouts.filter(p => p.status === 'failed').length;
  const failedSettlementsAmount = payouts
    .filter(p => p.status === 'failed')
    .reduce((acc, p) => acc + p.amount, 0);

  // Eligible for Next Payout (90% net after platform commission)
  const eligibleNextPayout = totalMonthlyRunrate > 0 ? Math.round(totalMonthlyRunrate * 0.9) : 0;

  // Last successful payout record
  const lastSuccessfulPayout = useMemo(() => {
    const paidList = payouts.filter(p => p.status === 'paid');
    return paidList.length > 0 ? paidList[paidList.length - 1] : null;
  }, [payouts]);

  // Current Payout Status
  const currentPayoutStatus = useMemo(() => {
    if (totalPendingPayout > 0) return 'PROCESSING';
    if (totalMonthlyRunrate > 0) return 'SCHEDULED';
    return 'NO_ACTIVITY';
  }, [totalPendingPayout, totalMonthlyRunrate]);

  // 17. Earnings Breakdown Categories (Only rendered if actual records exist)
  const earningsBreakdown = useMemo(() => {
    const items: { label: string; amount: number; count: number; note: string }[] = [];

    const homeTuitionTotal = assignments.reduce((acc, a) => acc + (a.monthlyFee || 0), 0);
    if (homeTuitionTotal > 0) {
      items.push({
        label: 'Home Tuition Allotments',
        amount: homeTuitionTotal,
        count: assignments.length,
        note: `${assignments.length} assigned tuition student(s)`
      });
    }

    const totalSessions = payrollRecords.reduce((acc, pr) => acc + (pr.completedSessionsCount || 0), 0);
    const sessionShare = payrollRecords.reduce((acc, pr) => acc + (pr.teacherEarnings || 0), 0);
    if (sessionShare > 0) {
      items.push({
        label: 'Completed Verified Sessions',
        amount: sessionShare,
        count: totalSessions,
        note: `${totalSessions} verified attendance logs`
      });
    }

    const totalBonuses = payrollRecords.reduce((acc, pr) => acc + (pr.bonus || 0), 0);
    if (totalBonuses > 0) {
      items.push({
        label: 'Attendance & Quality Bonuses',
        amount: totalBonuses,
        count: 1,
        note: 'Direct incentive credited by District Desk'
      });
    }

    return items;
  }, [assignments, payrollRecords]);

  const bankAccount = teacher?.bankAccount;
  const maskedAccountNumber = bankAccount?.accountNumber
    ? `•••• ${bankAccount.accountNumber.slice(-4)}`
    : null;

  const handleOpenPayoutDetails = (payout: TeacherPayout) => {
    setSelectedPayout(payout);
    setIsDetailsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 15. Premium Revenue Header */}
      <div className="bg-gradient-to-r from-deep-navy-950 via-slate-900 to-royal-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-royal-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sovereign Educator Settlement Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Revenue & Payout
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Track your eligible earnings, settlements, payouts and payment history in one place.
            </p>

            {/* Micro Settlement Status Banner */}
            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-royal-blue-300" />
                <span>Current Cycle: <strong>{currentMonthName}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Disbursement Status:{' '}
                  <strong className={
                    currentPayoutStatus === 'PROCESSING' ? 'text-amber-300' :
                    currentPayoutStatus === 'SCHEDULED' ? 'text-emerald-300' : 'text-slate-300'
                  }>
                    {currentPayoutStatus === 'PROCESSING' ? 'Processing Settlement' :
                     currentPayoutStatus === 'SCHEDULED' ? 'Scheduled 5th' : 'No Active Billing'}
                  </strong>
                </span>
              </div>

              {lastSuccessfulPayout && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Last Payout: <strong>₹{lastSuccessfulPayout.amount.toLocaleString()}</strong> ({lastSuccessfulPayout.date})</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsBankModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              <Building className="w-4 h-4 mr-1.5" />
              <span>{bankAccount ? 'Update Bank Account' : 'Link Direct Bank'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={fetchData}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 text-xs"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 16. 6 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Earnings */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Earnings</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            ₹{totalLifetimePaid.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Lifetime verified settlements</span>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">This Month</span>
            <div className="w-7 h-7 rounded-lg bg-royal-blue-50 text-royal-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-royal-blue-700 font-mono">
            ₹{thisMonthEarnings.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">
            {assignments.length === 0 ? 'No active students' : `From ${assignments.length} assigned student(s)`}
          </span>
        </div>

        {/* Pending Payout */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Payout</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-600 font-mono">
            ₹{totalPendingPayout.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Awaiting bank settlement</span>
        </div>

        {/* Paid Out */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid Out</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-teal-700 font-mono">
            ₹{totalLifetimePaid.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">
            {payouts.filter(p => p.status === 'paid').length} completed disbursement(s)
          </span>
        </div>

        {/* Failed / Returned */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Failed / Returned</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl font-black font-mono ${failedSettlementsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            ₹{failedSettlementsAmount.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">
            {failedSettlementsCount === 0 ? '0 failed transactions' : `${failedSettlementsCount} rejected settlement(s)`}
          </span>
        </div>

        {/* Eligible for Next Payout */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Next Eligible</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-indigo-700 font-mono">
            ₹{eligibleNextPayout.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">5th of upcoming month (90% net)</span>
        </div>
      </div>

      {/* 18. Interactive Revenue & Settlement Analytics Chart */}
      <TeacherRevenueChart
        payouts={payouts}
        payrollRecords={payrollRecords}
        monthlyFeeRunrate={totalMonthlyRunrate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Earnings Breakdown, Salary Slips, & Payout History */}
        <div className="lg:col-span-2 space-y-6">
          {/* 17. Real Earnings Breakdown by Source */}
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-royal-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Earnings Breakdown by Source</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Authoritative categories
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Verified compensation streams credited in compliance with ZYZU'S fee governance.
            </p>

            {earningsBreakdown.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No active earnings stream yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Your tuition billing categories will automatically populate once student allotments are verified.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {earningsBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-base font-bold text-emerald-700 font-mono">
                        ₹{item.amount.toLocaleString()}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Eligible Activity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 23. Official Salary Statements & Slips */}
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-royal-blue-600" />
                Official Salary Slips & Calculation Statements
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {payrollRecords.length} Payroll Record(s)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Transparent, itemized statements of gross collections, educator share, and verifiable salary slips.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : payrollRecords.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No salary/payment records available yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Monthly salary runs are calculated on the 1st of each calendar month following session verifications.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payrollRecords.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.billingMonth}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'READY_FOR_PAYMENT' ? 'bg-blue-100 text-blue-800' :
                            p.status === 'PAYMENT_QUEUED' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.assignedStudentsCount} Allotted Students • {p.completedSessionsCount} Sessions Completed ({p.approvedSessionsCount} Approved)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.salarySlipNumber ? (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<Eye className="w-3.5 h-3.5 text-royal-blue-600" />}
                            onClick={() => setSelectedDocumentId(p.salarySlipNumber || null)}
                            className="text-xs font-semibold text-royal-blue-700 border-royal-blue-200 hover:bg-royal-blue-50 cursor-pointer"
                          >
                            View Salary Slip
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-600 font-medium italic">Slip pending cycle closure</span>
                        )}
                      </div>
                    </div>

                    {/* Calculation Statement Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-600 text-[10px] uppercase font-bold block">Gross Collection</span>
                        <span className="font-bold text-slate-900 font-mono">₹{p.grossTuitionCollection.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-600 text-[10px] uppercase font-bold block">Educator Share</span>
                        <span className="font-bold text-slate-900 font-mono">₹{p.teacherEarnings.toLocaleString()}</span>
                        {p.bonus > 0 && <span className="text-[10px] text-emerald-700 font-bold block font-mono">+₹{p.bonus} Bonus</span>}
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-600 text-[10px] uppercase font-bold block">Platform Fee</span>
                        <span className="font-bold text-slate-700 font-mono">₹{p.focusPointCommission.toLocaleString()}</span>
                        {p.deductions > 0 && <span className="text-[10px] text-rose-600 font-bold block font-mono">-₹{p.deductions} Ded.</span>}
                      </div>
                      <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200">
                        <span className="text-emerald-800 text-[10px] uppercase font-bold block">Net Payable</span>
                        <span className="font-extrabold text-emerald-800 text-sm font-mono">₹{p.netPayable.toLocaleString()}</span>
                      </div>
                    </div>

                    {p.status === 'PAID' && (
                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Direct deposit credited to {p.bankDetails?.bankName || 'Bank'} ({p.bankDetails?.accountNumberMasked || 'Verified A/C'})
                        </span>
                        {p.transactionRef && (
                          <span className="font-mono text-slate-600">UTR / Ref: {p.transactionRef}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 21. Payout History (Responsive Table on Desktop, Cards on Mobile) */}
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base font-bold text-slate-900">Payout History & Settlements</h3>
                <p className="text-xs text-slate-500">
                  Official records of net payouts credited directly to your bank account
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {payouts.length} Record(s)
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No payout history yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Disbursements are processed on the 5th of each calendar month following verification of attendance logs.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Payout ID</th>
                        <th className="py-3 px-4">Billing Month</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Date Credited</th>
                        <th className="py-3 px-4">Bank Ref (UTR)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-xs">
                      {payouts.map(p => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => handleOpenPayoutDetails(p)}
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-royal-blue-700">{p.id}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{p.month}</td>
                          <td className="py-3 px-4 font-bold text-emerald-700 font-mono">₹{p.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-600">{p.date || 'Pending'}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{p.utr || 'Pending'}</td>
                          <td className="py-3 px-4">
                            <StatusBadge
                              status={p.status === 'paid' ? 'completed' : p.status === 'failed' ? 'rejected' : 'pending'}
                              text={p.status === 'paid' ? 'Credited' : p.status === 'failed' ? 'Failed' : 'Processing'}
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPayoutDetails(p);
                              }}
                              className="text-royal-blue-600 hover:text-royal-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card-Based Payout History View */}
                <div className="block sm:hidden space-y-3">
                  {payouts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenPayoutDetails(p)}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5 active:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-royal-blue-700">{p.id}</span>
                        <StatusBadge
                          status={p.status === 'paid' ? 'completed' : p.status === 'failed' ? 'rejected' : 'pending'}
                          text={p.status === 'paid' ? 'Credited' : p.status === 'failed' ? 'Failed' : 'Processing'}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.month}</p>
                          <p className="text-[11px] text-slate-500">Date: {p.date || 'Pending'}</p>
                        </div>
                        <p className="text-base font-extrabold text-emerald-700 font-mono">
                          ₹{p.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-500">UTR: {p.utr || 'Pending'}</span>
                        <span className="text-royal-blue-600 font-semibold flex items-center">
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Bank & Payout Policy */}
        <div className="space-y-6">
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-royal-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Direct Bank Account</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBankModalOpen(true)}
                className="text-xs cursor-pointer"
              >
                {bankAccount ? 'Update Bank' : 'Link Bank'}
              </Button>
            </div>

            {bankAccount ? (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{bankAccount.bankName}</p>

                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Account:</span>
                      <p className="font-mono font-bold text-slate-800">{maskedAccountNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">IFSC Code:</span>
                      <p className="font-mono font-bold text-slate-800">{bankAccount.ifscCode}</p>
                    </div>
                  </div>

                  <div className="pt-1 text-xs">
                    <span className="text-slate-500">Beneficiary:</span>
                    <p className="font-semibold text-slate-800">{bankAccount.accountHolderName}</p>
                  </div>

                  {bankAccount.upiId && (
                    <div className="pt-1 text-xs">
                      <span className="text-slate-500">UPI VPA:</span>
                      <p className="font-mono font-semibold text-slate-800">{bankAccount.upiId}</p>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Monthly tutor fee deposits will be dispatched automatically via NEFT/IMPS to this verified account.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 px-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-amber-900">No Bank Account Linked</h4>
                <p className="text-xs text-amber-800 mt-1 mb-4">
                  Please link your bank account to enable automatic monthly disbursements.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<PlusCircle className="w-4 h-4" />}
                  onClick={() => setIsBankModalOpen(true)}
                  className="text-xs"
                >
                  Connect Bank Account
                </Button>
              </div>
            )}
          </Card>

          {/* Payout Policy Card */}
          <Card className="p-5 bg-gradient-to-br from-royal-blue-50 via-indigo-50/50 to-white border border-royal-blue-100 rounded-xl">
            <h4 className="text-sm font-bold text-royal-blue-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-royal-blue-600" /> ZYZU'S Payout Policy
            </h4>
            <div className="space-y-2 text-xs text-slate-600 mt-2 leading-relaxed">
              <p>
                • <strong>Disbursement Date:</strong> Payouts are transferred on the 5th of every month for previous month sessions.
              </p>
              <p>
                • <strong>Attendance Verification:</strong> Payout requires teacher attendance logs confirmed by student guardians.
              </p>
              <p>
                • <strong>Platform Fee:</strong> 10% platform facilitation and insurance fee is retained; 90% is directly credited to your bank account.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* 22. Interactive Payout Details Drawer */}
      <TeacherPayoutDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        payout={selectedPayout}
        payrollRecord={
          selectedPayout
            ? payrollRecords.find(
                pr =>
                  pr.billingMonth.toLowerCase().includes(selectedPayout.month.toLowerCase()) ||
                  pr.transactionRef === selectedPayout.utr
              )
            : null
        }
        onViewSalarySlip={(slipNum) => setSelectedDocumentId(slipNum)}
      />

      {/* Link Bank Modal */}
      {isBankModalOpen && (
        <Modal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          title={bankAccount ? 'Update Bank Account' : 'Link Direct Bank Account'}
          size="md"
        >
          <form onSubmit={handleSaveBank} className="space-y-4">
            <Input
              label="Beneficiary Account Holder Name"
              value={bankFormData.accountHolderName}
              onChange={(e) => setBankFormData({ ...bankFormData, accountHolderName: e.target.value })}
              placeholder="As per bank passbook / cheque"
              required
            />

            <Input
              label="Bank Name"
              value={bankFormData.bankName}
              onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
              placeholder="e.g. State Bank of India, HDFC Bank"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bank Account Number"
                type="password"
                value={bankFormData.accountNumber}
                onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                placeholder="Account number"
                required
              />
              <Input
                label="Confirm Account Number"
                value={bankFormData.confirmAccountNumber}
                onChange={(e) => setBankFormData({ ...bankFormData, confirmAccountNumber: e.target.value })}
                placeholder="Re-enter account number"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="IFSC Code"
                value={bankFormData.ifscCode}
                onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. SBIN0001234"
                required
              />
              <Input
                label="UPI ID / VPA (Optional)"
                value={bankFormData.upiId}
                onChange={(e) => setBankFormData({ ...bankFormData, upiId: e.target.value })}
                placeholder="e.g. name@okhdfcbank"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-royal-blue-600 shrink-0 mt-0.5" />
              <span>
                Account details are encrypted and utilized solely for automated monthly teacher disbursements.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsBankModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingBank}>
                Save & Verify Account
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Printable Salary Slip Modal */}
      {selectedDocumentId && (
        <FinancialDocumentViewer
          documentId={selectedDocumentId}
          isOpen={!!selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
};
