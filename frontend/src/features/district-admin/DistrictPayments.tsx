import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { policyService } from '../../services/policyService';
import { TeacherDisbursementRecord, LibrarySettlement } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  Send,
  Receipt,
  DollarSign,
  Percent,
  RefreshCw,
  Bell,
  Lock
} from 'lucide-react';

export const DistrictPayments: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [activeTab, setActiveTab] = useState<'TEACHERS' | 'LIBRARIES' | 'COMMISSION'>('TEACHERS');
  const [teacherDisbursements, setTeacherDisbursements] = useState<TeacherDisbursementRecord[]>([]);
  const [librarySettlements, setLibrarySettlements] = useState<LibrarySettlement[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [selectedArea, setSelectedArea] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic localities derived from district records
  const availableLocalities = useMemo<string[]>(() => {
    const areas = teacherDisbursements.map(d => d.area).filter((a): a is string => Boolean(a));
    return ['All', ...Array.from(new Set(areas))];
  }, [teacherDisbursements]);

  // Payout Execution Modal State
  const [selectedDisbursement, setSelectedDisbursement] = useState<TeacherDisbursementRecord | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadData = () => {
    try {
      const tDisb = mockStore.getTeacherDisbursements(district, selectedMonth === 'All' ? undefined : selectedMonth);
      setTeacherDisbursements(tDisb);
      const districtLibraries = mockStore.getLibraries(district);
      const lSettles = districtLibraries.flatMap(lib => mockStore.getLibrarySettlements(lib.id));
      setLibrarySettlements(lSettles);
    } catch (e) {
      console.error('Failed to load disbursements:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [district, selectedMonth]);

  // Filtered Teacher Disbursements
  const filteredTeacherDisbursements = teacherDisbursements.filter(d => {
    const matchesSearch = 
      d.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.teacherPhone || '').includes(searchQuery) ||
      (d.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'All' || d.area.toLowerCase() === selectedArea.toLowerCase();
    return matchesSearch && matchesArea;
  });

  // KPI Calculations
  const totalTeacherGross = filteredTeacherDisbursements.reduce((sum, d) => sum + d.grossEarnings, 0);
  const totalTeacherCommission = filteredTeacherDisbursements.reduce((sum, d) => sum + d.commissionDeducted, 0);
  const totalTeacherNet = filteredTeacherDisbursements.reduce((sum, d) => sum + d.netPayable, 0);
  const totalPaidTeacher = filteredTeacherDisbursements.filter(d => d.status === 'PAID').reduce((sum, d) => sum + d.netPayable, 0);
  const totalPendingTeacher = filteredTeacherDisbursements.filter(d => d.status !== 'PAID').reduce((sum, d) => sum + d.netPayable, 0);

  // Process Teacher Payout Execution
  const handleOpenPayModal = (d: TeacherDisbursementRecord) => {
    setSelectedDisbursement(d);
    setTransactionRef(`SBI-NEFT-${Date.now().toString().slice(-8)}`);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayout = () => {
    if (!selectedDisbursement) return;
    setProcessing(true);
    setTimeout(() => {
      mockStore.processTeacherDisbursement(selectedDisbursement.id, transactionRef);
      addToast(`Payment of ₹${selectedDisbursement.netPayable.toLocaleString()} processed for ${selectedDisbursement.teacherName}`, 'success');
      setIsPayModalOpen(false);
      setProcessing(false);
      loadData();
    }, 400);
  };

  // Send 1-Day Advance Reminder
  const handleSendReminder = (d: TeacherDisbursementRecord) => {
    mockStore.addNotification({
      id: `notif-remind-${Date.now()}`,
      userId: d.teacherId,
      title: 'Upcoming Scheduled Payout Reminder (30th of Month)',
      message: `Dear ${d.teacherName}, your estimated net payout of ₹${d.netPayable.toLocaleString()} for ${d.month} is scheduled for disbursement on ${d.scheduledDate}. ZYZU'S District Desk.`,
      category: 'PAYMENT',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    addToast(`Automated 1-day advance reminder dispatched to ${d.teacherName} (${d.teacherPhone || 'SMS/WhatsApp'})`, 'info');
  };

  // Process Library Settlement
  const handleDisburseLibrarySettlement = (settlementId: string, netAmount: number) => {
    mockStore.processLibrarySettlement(settlementId);
    addToast(`48-hour library settlement of ₹${netAmount.toLocaleString()} disbursed to study hall account`, 'success');
    loadData();
  };

  // Export Disbursements to CSV
  const handleExportDisbursementsCSV = () => {
    if (activeTab === 'TEACHERS') {
      const headers = ['Disbursement ID', 'Educator Name', 'Phone', 'Month', 'Gross (INR)', 'Commission Rate (%)', 'Net Payable (INR)', 'Scheduled Date', 'Status'];
      const rows = teacherDisbursements.map(d => [
        `"${d.id}"`,
        `"${d.teacherName}"`,
        `"${d.teacherPhone || ''}"`,
        `"${d.month}"`,
        `"${d.grossEarnings}"`,
        `"${d.commissionRate}"`,
        `"${d.netPayable}"`,
        `"${d.scheduledDate}"`,
        `"${d.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ZYZUS_${district}_Teacher_Disbursements_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Teacher disbursement register exported to CSV', 'success');
    } else {
      const headers = ['Settlement ID', 'Month', 'Gross Amount (INR)', 'Commission Retained (INR)', 'Net Payout (INR)', 'Bank Account', 'Status'];
      const rows = librarySettlements.map(s => [
        `"${s.id}"`,
        `"${s.month}"`,
        `"${s.grossAmount}"`,
        `"${s.commissionAmount}"`,
        `"${s.netAmount}"`,
        `"${s.bankAccountMasked || ''}"`,
        `"${s.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ZYZUS_${district}_Library_Settlements_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Library settlement register exported to CSV', 'success');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to access payments & disbursements for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Educator & Library Disbursements: ${district}`}
        subtitle="Manage 30th-of-month teacher settlements, 48-hour library owner payouts, commission deductions, and ledger tracking"
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Finance' },
          { label: 'Disbursements' }
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportDisbursementsCSV}
            >
              Export Ledger (CSV)
            </Button>
            <Link
              to="/district-admin/policies"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Commission & Offer Policies</span>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Scheduled Gross Earnings"
          value={`₹${totalTeacherGross.toLocaleString()}`}
          change="Before commission deduction"
          isPositive={true}
          icon={<DollarSign className="w-6 h-6 text-royal-blue-600" />}
        />
        <StatCard
          title="Platform Commission Retained"
          value={`₹${totalTeacherCommission.toLocaleString()}`}
          change="District operations share"
          isPositive={true}
          icon={<Percent className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Net Disbursed to Tutors"
          value={`₹${totalPaidTeacher.toLocaleString()}`}
          change="Credited via NEFT/IMPS"
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6 text-indigo-600" />}
        />
        <StatCard
          title="Pending Payout Balance"
          value={`₹${totalPendingTeacher.toLocaleString()}`}
          change="Awaiting 30th-run settlement"
          isPositive={false}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('TEACHERS')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'TEACHERS'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Teacher Monthly Payouts (30th Cycle)
        </button>
        <button
          onClick={() => setActiveTab('LIBRARIES')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'LIBRARIES'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Library Owner Settlements (48-Hr Cycle)
        </button>
        <button
          onClick={() => setActiveTab('COMMISSION')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'COMMISSION'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          District Commission Overview
        </button>
      </div>

      {/* Tab 1: Teacher Disbursements */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-4 border border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search educator, phone, invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="text-xs font-bold rounded-xl border border-slate-300 p-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
                >
                  {availableLocalities.map((area: string) => (
                    <option key={area} value={area}>{area === 'All' ? 'All Localities' : area}</option>
                  ))}
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-bold rounded-xl border border-slate-300 p-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
                >
                  <option value="All">All Months (2026)</option>
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="July 2026">July 2026</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Teacher Disbursements Table */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Teacher Disbursement Queue ({filteredTeacherDisbursements.length})</h3>
                <p className="text-xs text-slate-500">Scheduled payouts normally processed around the 30th of each calendar month</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                Net Payable: ₹{totalTeacherNet.toLocaleString()}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTeacherDisbursements.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No teacher disbursement records found for {selectedMonth}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="py-3 px-4">Educator Details</th>
                      <th className="py-3 px-4">Locality</th>
                      <th className="py-3 px-4">Month & Date</th>
                      <th className="py-3 px-4 text-right">Gross Amount</th>
                      <th className="py-3 px-4 text-right">Commission</th>
                      <th className="py-3 px-4 text-right">Net Payable</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeacherDisbursements.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{d.teacherName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{d.teacherPhone || 'Contact verified'}</p>
                          <p className="text-[10px] text-royal-blue-600">{d.invoiceNumber}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {d.area}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-700">{d.month}</p>
                          <p className="text-[10px] text-slate-400">Scheduled: {d.scheduledDate}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                          ₹{d.grossEarnings.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right text-rose-600 font-semibold whitespace-nowrap">
                          <div>-₹{d.commissionDeducted.toLocaleString()} ({d.commissionRate}%)</div>
                          {(() => {
                            const res = policyService.resolveCommission({ districtName: district, serviceType: 'TUITION', targetId: d.teacherId });
                            return (
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 border ${
                                res.policySource === 'CUSTOM_OVERRIDE'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {res.policySource === 'CUSTOM_OVERRIDE' ? 'Custom Override' : 'District Common'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                          ₹{d.netPayable.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            d.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : d.status === 'DUE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {d.status === 'PAID' ? 'Disbursed (Paid)' : d.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                          {d.status !== 'PAID' ? (
                            <>
                              <button
                                onClick={() => handleSendReminder(d)}
                                className="p-1.5 text-slate-500 hover:text-royal-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Send 1-Day Advance Reminder"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleOpenPayModal(d)}
                                className="bg-royal-blue-600 hover:bg-royal-blue-700 text-xs font-bold"
                              >
                                Process Payout
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400">
                              Ref: {d.transactionRef || 'Settled'}
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
      )}

      {/* Tab 2: Library Owner Settlements */}
      {activeTab === 'LIBRARIES' && (
        <Card className="p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Library Owner 48-Hour Escrow Settlements</h3>
              <p className="text-xs text-slate-500">Disbursed within 48 hours according to platform study hall settlement policy</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              Policy: Automated 48-Hour SLA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Settlement ID</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Gross Bookings</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {librarySettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-royal-blue-700">
                      {s.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {s.month}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      ₹{s.grossAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-600 font-semibold">
                      <div>-₹{s.commissionAmount.toLocaleString()}</div>
                      {(() => {
                        const res = policyService.resolveCommission({ districtName: district, serviceType: 'LIBRARY', targetId: s.libraryId });
                        return (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 border ${
                            res.policySource === 'CUSTOM_OVERRIDE'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {res.policySource === 'CUSTOM_OVERRIDE' ? 'Custom Override' : 'District Common'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      ₹{s.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {s.bankAccountMasked}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'settled'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.status !== 'settled' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleDisburseLibrarySettlement(s.id, s.netAmount)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                        >
                          Disburse 48h
                        </Button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">
                          UTR: {s.utr || 'HDFC9821'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Commission Breakdown */}
      {activeTab === 'COMMISSION' && (
        <Card className="p-6 border border-slate-200 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">District Platform Commission Breakdown</h3>
            <p className="text-xs text-slate-500">Revenue split and platform operational fee retained from tuition & library revenues</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-royal-blue-50 border border-royal-blue-200 space-y-2">
              <span className="text-xs font-bold text-royal-blue-700 uppercase">Home Tuition Commission</span>
              <p className="text-2xl font-black text-royal-blue-950">₹38,400</p>
              <p className="text-[11px] text-royal-blue-700">15% on matched 1-on-1 home tuitions in {district}</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase">Library Desk Commission</span>
              <p className="text-2xl font-black text-emerald-950">₹14,500</p>
              <p className="text-[11px] text-emerald-700">10% on confirmed shift desk bookings across {mockStore.getLibraries(district).length} libraries</p>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase">Total Retained Platform Share</span>
              <p className="text-2xl font-black text-purple-950">₹52,900</p>
              <p className="text-[11px] text-purple-700">Reinvested into district tutor training & quality audits</p>
            </div>
          </div>
        </Card>
      )}

      {/* Process Payout Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Execute Educator Net Settlement (30th Cycle)"
      >
        {selectedDisbursement && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Educator:</span>
                <span className="font-bold text-slate-900">{selectedDisbursement.teacherName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Period / Month:</span>
                <span className="font-semibold text-slate-900">{selectedDisbursement.month}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Gross Tuition Fee:</span>
                <span className="font-semibold text-slate-900">₹{selectedDisbursement.grossEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span className="font-bold">Platform Commission ({selectedDisbursement.commissionRate}%):</span>
                <span className="font-bold">-₹{selectedDisbursement.commissionDeducted.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Net Payable Amount:</span>
                <span className="font-black text-emerald-700 text-base">₹{selectedDisbursement.netPayable.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank UTR / NEFT Reference No
              </label>
              <Input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. SBI-NEFT-9821048102"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Confirming this action will update the payout status to <strong>PAID</strong>, store an immutable audit trail entry, and dispatch an automated SMS/WhatsApp voucher confirmation to {selectedDisbursement.teacherName}.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setIsPayModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmPayout}
                disabled={processing}
                className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold"
              >
                {processing ? 'Processing Transfer...' : 'Confirm & Disburse Payment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
