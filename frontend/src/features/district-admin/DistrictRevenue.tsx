import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { districtAdminService } from '../../services/districtAdminService';
import { mockStore } from '../../mock/store';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  GraduationCap,
  Download,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Receipt,
  MinusCircle,
  PlusCircle,
  Equal,
  Calendar,
  Filter,
  ExternalLink,
  PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { districtAuthorizationService } from '../../services/districtAuthorizationService';

export const DistrictRevenue: React.FC = () => {
  const { user } = useAuth();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';

  const [revData, setRevData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PROFIT_SHEET' | 'LOCALITIES'>('ANALYTICS');
  const [loading, setLoading] = useState(true);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      districtAuthorizationService.verifyDistrictAccess(district, 'revenue', 'READ');
      const data = await districtAdminService.getDistrictRevenue(district);
      setRevData(data);
    } catch (e) {
      console.error('Failed to load revenue data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [district]);

  // Derived financial values from formula: Profit = Revenue - Commission - Expenses - Disbursements
  const gross = revData?.currentMonthGross ?? 0;
  const commission = revData?.platformFeeShare ?? 0;
  const expenses = revData?.totalExpenses ?? 0;
  const disbursements = revData?.totalDisbursements ?? (Number(revData?.teacherDisbursements || 0) + Number(revData?.libraryDisbursements || 0));
  const netProfit = revData?.netProfit ?? (gross - commission - expenses - disbursements);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Amount (INR),Notes\n' +
      `Gross Collections,${gross},All verified student fees and bookings\n` +
      `Platform Commission,${commission},ZYZU'S central operational fee\n` +
      `District Expenses,${expenses},Field operations and office vouchers\n` +
      `Teacher Disbursements,${revData?.teacherDisbursements || 0},Monthly tuition payouts\n` +
      `Library Disbursements,${revData?.libraryDisbursements || 0},Desk revenue settlements\n` +
      `Net District Profit,${netProfit},Retained local balance\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ZYZUS_${district}_Revenue_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Revenue & Financial Management"
        subtitle={`Live collections, commission accounting, expense adjustments, and net profit ledger for ${district}`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Revenue & Financial Analytics' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Link to="/district-admin/expenses">
              <Button size="sm" variant="outline" icon={<Receipt className="w-4 h-4 text-rose-600" />}>
                Manage Expenses
              </Button>
            </Link>
            <Link to="/district-admin/payments">
              <Button size="sm" variant="outline" icon={<CreditCard className="w-4 h-4 text-amber-600" />}>
                Payouts Desk
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export CSV Ledger
            </Button>
          </div>
        }
      />

      {/* High-Level Financial Equation Card (Req 13 & 14) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Standard Formula: Net District Profit = Gross Inflow − Commission − Expenses − Disbursements
          </div>
          <span className="text-xs bg-white/15 px-3 py-1 rounded-full text-blue-200">
            Cycle: September 2026 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          {/* Gross */}
          <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-blue-200 uppercase font-semibold">1. Total Gross Revenue</span>
            <p className="text-xl font-black text-white mt-0.5">₹{gross.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-300">+ Tuition & Desks</span>
          </div>

          {/* Commission */}
          <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-amber-200 uppercase font-semibold">2. Platform Comm (10%)</span>
            <p className="text-xl font-black text-amber-300 mt-0.5">− ₹{commission.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-amber-200">Central Platform Fee</span>
          </div>

          {/* Expenses */}
          <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-rose-200 uppercase font-semibold">3. District Expenses</span>
            <p className="text-xl font-black text-rose-300 mt-0.5">− ₹{expenses.toLocaleString('en-IN')}</p>
            <Link to="/district-admin/expenses" className="text-[10px] text-rose-200 hover:underline">
              {mockStore.getDistrictExpenses(district).length} vouchers recorded
            </Link>
          </div>

          {/* Disbursements */}
          <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-cyan-200 uppercase font-semibold">4. Disbursements</span>
            <p className="text-xl font-black text-cyan-300 mt-0.5">− ₹{disbursements.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-cyan-200">Teachers & Libraries</span>
          </div>

          {/* Net Profit */}
          <div className="p-3.5 bg-emerald-500/20 rounded-xl border border-emerald-400/40">
            <span className="text-[11px] text-emerald-200 uppercase font-bold">5. Net District Profit</span>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">₹{netProfit.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-200">Retained Margin</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-3">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ANALYTICS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Revenue Analytics & Trends
        </button>

        <button
          onClick={() => setActiveTab('PROFIT_SHEET')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PROFIT_SHEET'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Itemized Financial Audit Sheet
        </button>

        <button
          onClick={() => setActiveTab('LOCALITIES')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LOCALITIES'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Locality Inflow Analysis
        </button>
      </div>

      {/* Tab 1: Revenue Analytics */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Gross Monthly Collection"
              value={`₹${gross.toLocaleString('en-IN')}`}
              change="+14.2% from August 2026"
              isPositive={true}
              icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
            />
            <StatCard
              title="Tuition Share (65%)"
              value={`₹${Math.round(gross * 0.65).toLocaleString('en-IN')}`}
              change="Verified home educator fees"
              isPositive={true}
              icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
            />
            <StatCard
              title="Library Share (35%)"
              value={`₹${Math.round(gross * 0.35).toLocaleString('en-IN')}`}
              change="Self-study desk reservations"
              isPositive={true}
              icon={<Building className="w-6 h-6 text-indigo-600" />}
            />
            <StatCard
              title="Net Retained Profit"
              value={`₹${netProfit.toLocaleString('en-IN')}`}
              change={`${Math.round((netProfit / gross) * 100)}% profit margin`}
              isPositive={true}
              icon={<TrendingUp className="w-6 h-6 text-cyan-600" />}
            />
          </div>

          {/* Historical Progression */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              5-Month {district} Revenue & Profit Progression
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { month: 'May 2026', gross: 195000, profit: 32000 },
                { month: 'Jun 2026', gross: 230000, profit: 38500 },
                { month: 'Jul 2026', gross: 275000, profit: 45000 },
                { month: 'Aug 2026', gross: 310000, profit: 49800 },
                { month: 'Sep 2026 (Est)', gross: gross, profit: netProfit },
              ].map((m) => (
                <div key={m.month} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-xs font-bold text-slate-500">{m.month}</span>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Gross Inflow</span>
                    <p className="text-lg font-bold text-slate-900">₹{m.gross.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-emerald-600 uppercase block font-semibold">Net Profit</span>
                    <p className="text-sm font-bold text-emerald-700">₹{m.profit.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Itemized Financial Audit Sheet */}
      {activeTab === 'PROFIT_SHEET' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Itemized Profit & Loss Ledger</h3>
              <p className="text-xs text-slate-500">Official monthly calculation sheet adhering to District Regulatory SOP</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              Audit Status: Verified & Balanced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Line Item Category</th>
                  <th className="py-3 px-4">Reference Source</th>
                  <th className="py-3 px-4 text-center">Operation</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Gross Student Fee Collections</td>
                  <td className="py-3 px-4 text-xs text-slate-500">Tuition fees + 370 Library desk subscriptions</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      [+] INFLOW
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{gross.toLocaleString('en-IN')}</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">ZYZU'S Central Platform Fee</td>
                  <td className="py-3 px-4 text-xs text-slate-500">Configured 10% platform share</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                      [-] DEDUCTION
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-700">₹{commission.toLocaleString('en-IN')}</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">District Operational Expenses</td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    Office rent, travel, inspection vouchers (
                    <Link to="/district-admin/expenses" className="text-blue-600 underline">
                      View Vouchers
                    </Link>
                    )
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                      [-] DEDUCTION
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-700">₹{expenses.toLocaleString('en-IN')}</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Educator & Library Disbursements</td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    Teacher 30th-cycle payouts + Library 48-hr settlements
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-100 text-cyan-800">
                      [-] DISBURSEMENT
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-cyan-700">₹{disbursements.toLocaleString('en-IN')}</td>
                </tr>

                <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-300">
                  <td className="py-4 px-4 text-base text-emerald-950">Net District Administrator Profit</td>
                  <td className="py-4 px-4 text-xs text-emerald-800">Retained local operational surplus</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">
                      [=] NET MARGIN
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-lg text-emerald-900 font-black">
                    ₹{netProfit.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Locality Collections */}
      {activeTab === 'LOCALITIES' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Locality Revenue Distribution</h3>
              <p className="text-xs text-slate-500">Gross inflows and collection efficiency across {district} tehsils</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportCSV} icon={<Download className="w-3.5 h-3.5" />}>
              Export Breakdown
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(!revData?.breakdownByArea || revData.breakdownByArea.length === 0) ? (
              <div className="col-span-2 text-center py-12 text-slate-400 text-sm">
                No locality revenue records found for {district} district yet.
              </div>
            ) : (
              revData.breakdownByArea.map((loc: any) => (
                <div
                  key={loc.area}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900 text-sm">{loc.area}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">₹{loc.gross.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                    <div>Active Students: <strong className="text-slate-800">{loc.activeStudents}</strong></div>
                    <div>Verified Tutors: <strong className="text-slate-800">{loc.teachersCount}</strong></div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((loc.gross / 150000) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
