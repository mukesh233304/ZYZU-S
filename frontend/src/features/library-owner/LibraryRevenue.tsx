import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { Library, LibraryBooking, LibraryBankAccount, LibrarySettlement } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  IndianRupee,
  TrendingUp,
  Building,
  PieChart,
  ShieldCheck,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Receipt,
  Eye,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { settlementService } from '../../services/settlementService';
import { LibrarySettlementRecord } from '../../types/finance';
import { FinancialDocumentViewer } from '../../components/finance/FinancialDocumentViewer';

export const LibraryRevenue: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [library, setLibrary] = useState<Library | null>(null);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    onlineCollections: 0,
    counterCollections: 0,
    totalExpenses: 0,
    netProfit: 0,
    netPayout: 0,
    platformFee: 0,
    totalBookingsCount: 0,
    activeStudentsCount: 0
  });
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>([]);
  const [shiftBreakdown, setShiftBreakdown] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<LibrarySettlement[]>([]);
  const [officialSettlements, setOfficialSettlements] = useState<LibrarySettlementRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDonutMonth, setSelectedDonutMonth] = useState<string>('September 2026');
  const [loading, setLoading] = useState(true);

  // Bank Connection Modal
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  const loadRevenueData = async () => {
    if (!user) return;
    try {
      const libs = await libraryService.getLibrariesByOwner(user.id);
      if (libs.length > 0) {
        const activeLib = libs[0];
        setLibrary(activeLib);

        const [bData, rev, hist, sBreakdown, setts, offSetts] = await Promise.all([
          bookingService.getLibraryBookings(activeLib.id),
          libraryService.getLibraryRevenue(activeLib.id),
          libraryService.getMonthlyRevenueHistory(activeLib.id),
          libraryService.getShiftRevenueBreakdown(activeLib.id),
          libraryService.getLibrarySettlements(activeLib.id),
          settlementService.getLibrarySettlements({ libraryId: activeLib.id })
        ]);

        setBookings(bData);
        setRevenueStats(rev as any);
        setMonthlyHistory(hist);
        setShiftBreakdown(sBreakdown);
        setSettlements(setts);

        if (offSetts && offSetts.length > 0) {
          setOfficialSettlements(offSetts);
        } else {
          // Fallback check for demo/seed data matching
          const allOff = await settlementService.getLibrarySettlements();
          const matched = allOff.filter((s: LibrarySettlementRecord) => 
            s.libraryId === activeLib.id || 
            s.ownerId === user.id || 
            s.libraryName.toLowerCase().includes(activeLib.name.toLowerCase())
          );
          setOfficialSettlements(matched);
        }

        if (hist.length > 0) {
          setSelectedDonutMonth(hist[hist.length - 1].month);
        }

        if (activeLib.bankAccount) {
          setAccountHolderName(activeLib.bankAccount.accountHolderName || '');
          setBankName(activeLib.bankAccount.bankName || '');
          setIfscCode(activeLib.bankAccount.ifscCode || '');
          setUpiId(activeLib.bankAccount.upiId || '');
        }
      } else {
        setLibrary(null);
      }
    } catch (err) {
      console.error('Failed to load revenue data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [user]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;

    if (!accountHolderName.trim() || !bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      addToast('Please fill all mandatory bank account fields', 'error');
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      addToast('Account numbers do not match. Please re-enter carefully.', 'error');
      return;
    }

    if (ifscCode.length < 11) {
      addToast('Please enter a valid 11-character IFSC code', 'error');
      return;
    }

    setSavingBank(true);
    try {
      const bankData: LibraryBankAccount = {
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        upiId: upiId.trim() || undefined,
        isConnected: true,
        isVerified: true,
        connectedAt: new Date().toISOString()
      };

      await libraryService.updateBankDetails(library.id, bankData);
      setLibrary(prev => prev ? { ...prev, bankAccount: bankData } : null);
      setIsBankModalOpen(false);
      setAccountNumber('');
      setConfirmAccountNumber('');
      addToast('Settlement bank account securely connected and verified!', 'success');
    } catch (err) {
      addToast('Failed to save bank account', 'error');
    } finally {
      setSavingBank(false);
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
          title="Revenue & Financial Analytics"
          subtitle="Platform settlements, shift-wise yields, and collection ledger"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Revenue' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You must register your library before you can view revenue analytics, collect shift dues, and receive bi-weekly platform disbursements.
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

  const bank = library.bankAccount;
  const totalCalculated = revenueStats.totalRevenue;

  // Selected month for Donut Chart
  const currentDonutData = monthlyHistory.find(m => m.month === selectedDonutMonth) || {
    month: selectedDonutMonth,
    totalRevenue: totalCalculated,
    totalExpenses: revenueStats.totalExpenses || 0,
    platformFee: 0,
    netProfit: Math.max(0, totalCalculated - (revenueStats.totalExpenses || 0)),
  };

  const donutRev = currentDonutData.totalRevenue || 0;
  const donutExp = currentDonutData.totalExpenses || 0;
  const donutProfit = Math.max(0, donutRev - donutExp);

  const profitPct = donutRev > 0 ? Math.round((donutProfit / donutRev) * 100) : 0;
  const expPct = donutRev > 0 ? Math.min(100, 100 - profitPct) : 0;

  // SVG Donut calculation (circumference for radius 70 = 2 * PI * 70 ≈ 440)
  const C = 440;
  const profitDash = (profitPct / 100) * C;
  const expDash = (expPct / 100) * C;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & Financial Analytics"
        subtitle={`Real-time collections, 6-month historical trends, and bank settlements for ${library.name}`}
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Revenue' }
        ]}
        actions={
          <Link to="/library-owner/reports">
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
              Official Financial Statement (A4)
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collections Credited"
          value={`₹${totalCalculated.toLocaleString('en-IN')}`}
          change={totalCalculated > 0 ? `${revenueStats.activeStudentsCount || bookings.length} active memberships` : 'Zero collections'}
          isPositive={totalCalculated > 0}
          icon={<IndianRupee className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Operating Expenses"
          value={`₹${(revenueStats.totalExpenses || 0).toLocaleString('en-IN')}`}
          change="Facility rent, electricity, Wi-Fi"
          isPositive={false}
          icon={<Receipt className="w-6 h-6 text-rose-600" />}
        />
        <StatCard
          title="Net Operating Profit"
          value={`₹${(revenueStats.netProfit || 0).toLocaleString('en-IN')}`}
          change="Collections minus operating expenses"
          isPositive={(revenueStats.netProfit || 0) > 0}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Net Operating Margin"
          value={totalCalculated > 0 ? `${Math.round(((revenueStats.netProfit || 0) / totalCalculated) * 100)}%` : '0%'}
          change="Profit yield across active shifts"
          isPositive={(revenueStats.netProfit || 0) > 0}
          icon={<ShieldCheck className="w-6 h-6 text-royal-blue-600" />}
        />
      </div>

      {/* 6-Month Historical Revenue Trend Comparison */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-royal-blue-600" />
              6-Month Historical Revenue & Profit Comparison
            </h3>
            <p className="text-xs text-slate-500">Gross collections vs Operating expenses vs Net profit across recent months</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {monthlyHistory.length} Recorded Cycles
          </span>
        </div>

        {monthlyHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No historical months recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyHistory.map((m, idx) => {
              const maxRev = Math.max(...monthlyHistory.map(x => x.totalRevenue || 1));
              const barHeightPct = Math.round((m.totalRevenue / maxRev) * 100);

              return (
                <div
                  key={m.month || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    m.month === selectedDonutMonth
                      ? 'border-royal-blue-500 bg-royal-blue-50/20 shadow-xs ring-1 ring-royal-blue-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">{m.month}</span>
                    <span className="text-[11px] font-bold text-royal-blue-600 bg-royal-blue-50 px-2 py-0.5 rounded-full">
                      {m.occupancyRate || 0}% Occupancy
                    </span>
                  </div>

                  {/* Visual Bar Indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Monthly Yield Ratio</span>
                      <span className="font-mono font-semibold">{barHeightPct}% of Peak</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-l-full"
                        style={{ width: `${Math.round(((m.netProfit || 0) / (m.totalRevenue || 1)) * 100)}%` }}
                        title="Net Profit"
                      ></div>
                      <div
                        className="bg-amber-500 h-full rounded-r-full"
                        style={{ width: `${Math.round(((m.totalExpenses || 0) / (m.totalRevenue || 1)) * 100)}%` }}
                        title="Expenses"
                      ></div>
                    </div>
                  </div>

                  {/* Numbers Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Collections Credited</span>
                      <span className="font-bold text-slate-900 text-sm">₹{(m.totalRevenue || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/60 rounded-lg">
                      <span className="text-emerald-700 text-[10px] uppercase font-bold block">Net Profit</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{(m.netProfit || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Expenses</span>
                      <span className="font-bold text-amber-600">₹{(m.totalExpenses || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-royal-blue-50/40 rounded-lg border border-royal-blue-100">
                      <span className="text-royal-blue-800 text-[10px] uppercase font-bold block">Operating Margin</span>
                      <span className="font-bold text-royal-blue-700">
                        {m.totalRevenue > 0 ? Math.round(((m.netProfit || 0) / m.totalRevenue) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* SVG Donut P&L Breakdown & Shift Revenue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Donut Chart for Selected Month */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-royal-blue-600" />
              P&L Cost Breakdown
            </h3>
            {monthlyHistory.length > 1 && (
              <select
                value={selectedDonutMonth}
                onChange={(e) => setSelectedDonutMonth(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-md px-2 py-1 bg-white"
              >
                {monthlyHistory.map(m => (
                  <option key={m.month} value={m.month}>{m.month}</option>
                ))}
              </select>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Distribution for <span className="font-bold text-slate-700">{selectedDonutMonth}</span>
          </p>

          {/* SVG Donut Chart */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="24"
                />
                {/* Profit segment (Emerald) */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeDasharray={`${profitDash} ${C - profitDash}`}
                  strokeDashoffset="0"
                />
                {/* Expenses segment (Amber) */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeDasharray={`${expDash} ${C - expDash}`}
                  strokeDashoffset={`${-profitDash}`}
                />
              </svg>

              {/* Donut Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
                <span className="text-base font-black text-slate-900">₹{donutRev.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-emerald-600 font-bold">{profitPct}% Margin</span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="w-full space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-semibold text-slate-800">Net Owner Profit</span>
                </div>
                <span className="font-bold text-emerald-700">₹{donutProfit.toLocaleString('en-IN')} ({profitPct}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="font-semibold text-slate-800">Operating Expenses</span>
                </div>
                <span className="font-bold text-amber-700">₹{donutExp.toLocaleString('en-IN')} ({expPct}%)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shift Revenue Breakdown Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revenue by Study Shift Slot</h3>
                <p className="text-xs text-slate-500">Yield performance, active desk occupancy, and revenue per shift</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {shiftBreakdown.length} Configured Shifts
              </span>
            </div>

            {shiftBreakdown.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-100 rounded-xl">
                No shift breakdown data available. Configure library shifts to track shift yield.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-600 uppercase bg-slate-50">
                    <tr>
                      <th className="py-2.5 px-3">Shift Slot</th>
                      <th className="py-2.5 px-3">Monthly Fee</th>
                      <th className="py-2.5 px-3">Enrolled</th>
                      <th className="py-2.5 px-3">Occupancy</th>
                      <th className="py-2.5 px-3">Total Revenue</th>
                      <th className="py-2.5 px-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shiftBreakdown.map((s, i) => (
                      <tr key={s.id || i} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.shiftName}</div>
                          <div className="text-[11px] text-slate-500">{s.startTime} – {s.endTime}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          ₹{s.monthlyPrice}/mo
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900">{s.occupiedDesks}</span>
                          <span className="text-slate-400"> / {s.totalSeats} desks</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{s.occupancyRate}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.occupancyRate >= 70 ? 'bg-emerald-500' : s.occupancyRate >= 40 ? 'bg-royal-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${s.occupancyRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600 text-sm">
                          ₹{(s.totalRevenue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          {s.isHighestPerforming ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ⭐ Star Yield Slot
                            </span>
                          ) : s.isLowestPerforming ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              💡 Growth Potential
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              Steady
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bank & Platform Automated Settlement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Details Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-royal-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Settlement Bank Account</h3>
            </div>
            {bank?.isConnected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBankModalOpen(true)}
              >
                Edit
              </Button>
            )}
          </div>

          {bank && bank.isConnected ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Direct Payout Verified
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">NEFT / IMPS</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Bank Name</span>
                  <span className="font-bold text-slate-900">{bank.bankName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Account Holder</span>
                  <span className="font-bold text-slate-900">{bank.accountHolderName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Account Number</span>
                  <span className="font-mono font-bold text-slate-900">•••• {bank.accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-900">{bank.ifscCode}</span>
                </div>
                {bank.upiId && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Settlement UPI</span>
                    <span className="font-mono font-bold text-royal-blue-600">{bank.upiId}</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-800">
                Next automated payout: <span className="font-bold">16th September 2026</span> (Bi-weekly cycle).
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Bank Account Connected</h4>
              <p className="text-xs text-slate-500">
                Connect your study library's bank account to receive direct deposits from online student bookings.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsBankModalOpen(true)}>
                  Connect Bank Account
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Historical Platform Settlements Ledger */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Seat Settlement Statements & Platform Disbursements
                </h3>
                <p className="text-xs text-slate-500">Official log of automated seat fee disbursements after platform commission reconciliation</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {officialSettlements.length > 0 ? officialSettlements.length : settlements.length} Settlements
              </span>
            </div>

            {officialSettlements.length > 0 ? (
              <div className="space-y-4">
                {officialSettlements.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{s.settlementPeriod}</span>
                          <span className="font-mono text-xs text-slate-500">({s.id})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                            s.status === 'READY_FOR_SETTLEMENT' ? 'bg-blue-100 text-blue-800' :
                            s.status === 'QUEUED' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {s.totalBookingsCount} Online Desk Reservation(s) Verified
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {s.receiptNumber ? (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<Eye className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => setSelectedDocId(s.receiptNumber || null)}
                            className="text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            View Settlement Receipt
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Receipt generated upon payment</span>
                        )}
                      </div>
                    </div>

                    {/* Calculation Statement Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Gross Collections</span>
                        <span className="font-bold text-slate-900">₹{s.grossBookingAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Discounts</span>
                        <span className="font-bold text-slate-600">₹{s.totalDiscounts.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Platform Fee</span>
                        <span className="font-bold text-amber-700">-₹{s.platformCommission.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 text-[10px] uppercase font-bold block">Net Disbursed</span>
                        <span className="font-extrabold text-emerald-800 text-sm">₹{s.netPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {s.status === 'PAID' && (
                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed to {s.bankDetails?.bankName || 'Bank'} ({s.bankDetails?.accountNumberMasked || 'Verified A/C'})
                        </span>
                        {(s.utr || s.transactionRef) && (
                          <span className="font-mono text-slate-600">UTR / Ref: {s.utr || s.transactionRef}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : settlements.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No payment records available.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Disbursements are generated bi-weekly on the 1st and 16th following automated reconciliation of student desk check-ins.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-600 uppercase bg-slate-50">
                    <tr>
                      <th className="py-2.5 px-3">Settlement ID</th>
                      <th className="py-2.5 px-3">Cycle Month</th>
                      <th className="py-2.5 px-3">Amount Credited</th>
                      <th className="py-2.5 px-3">Net Disbursed</th>
                      <th className="py-2.5 px-3">UTR / Ref</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {settlements.map((s, i) => (
                      <tr key={s.id || i} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-500">{s.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{s.month}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">₹{s.grossAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 font-bold text-emerald-600 text-sm">₹{s.grossAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{s.utr || 'Pending Cycle'}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={s.status.toUpperCase()} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Collection Transactions */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-600" /> Recent Collection Transactions
        </h3>

        {bookings.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No fee collection records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-600 uppercase bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Desk & Shift</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{b.startDate}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{b.studentName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{b.seatNumber} • {b.shift}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">
                      ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{b.paymentMethod || 'Cash'}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={b.paymentStatus === 'paid' ? 'PAID' : 'PENDING'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bank Account Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title={bank?.isConnected ? "Update Settlement Bank Account" : "Connect Settlement Bank Account"}
        size="md"
      >
        <form onSubmit={handleSaveBank} className="space-y-4">
          <Input
            label="Account Holder Name *"
            placeholder="e.g. Saraswati Study Center / Suresh Yadav"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            required
          />

          <Input
            label="Bank Name *"
            placeholder="e.g. State Bank of India, HDFC Bank, PNB"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Number *"
              type="password"
              placeholder="Enter full account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
            <Input
              label="Confirm Account Number *"
              type="text"
              placeholder="Re-enter account number"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="IFSC Code *"
              placeholder="e.g. SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              required
            />
            <Input
              label="Business UPI ID (Optional)"
              placeholder="e.g. libraryname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Your account details are 256-bit encrypted. ZYZU'S disburses student booking revenues directly via automated NEFT / IMPS settlements.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsBankModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingBank}>
              Save & Verify Bank Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Settlement Receipt Modal */}
      {selectedDocId && (
        <FinancialDocumentViewer
          documentId={selectedDocId}
          isOpen={!!selectedDocId}
          onClose={() => setSelectedDocId(null)}
        />
      )}
    </div>
  );
};
