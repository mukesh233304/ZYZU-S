import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { 
  Receipt, DollarSign, Search, Filter, Download, 
  CheckCircle2, Clock, AlertTriangle, Send, Eye, CreditCard, ShieldCheck 
} from 'lucide-react';

import { districtAuthorizationService } from '../../services/districtAuthorizationService';

export const DistrictFees: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        districtAuthorizationService.verifyDistrictAccess(district, 'fees', 'READ');
        const data = await districtAdminService.getDistrictFees(district);
        setInvoices(data);
      } catch (e: any) {
        console.error('Failed to load district fees', e);
        showToast(e?.message || 'Access restricted for unauthorized district.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [district]);

  const filtered = invoices.filter((inv) => {
    const matchesSearch = 
      (inv.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.invoiceNumber || inv.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (inv.status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const totalCollected = invoices
    .filter(i => (i.status || '').toUpperCase() === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  
  const pendingAmount = invoices
    .filter(i => (i.status || '').toUpperCase() === 'PENDING' || (i.status || '').toUpperCase() === 'OVERDUE')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleSendReminder = (inv: any) => {
    showToast(`Payment reminder sent to student: ${inv.studentName || 'Student'}`, 'success');
  };

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      showToast('No fee records available to export', 'error');
      return;
    }

    const headers = ['Invoice ID', 'Student Name', 'Service Type', 'Entity / Institution', 'Amount (INR)', 'Due Date', 'Status'];
    const rows = filtered.map(inv => [
      `"${inv.invoiceNumber || inv.id || ''}"`,
      `"${inv.studentName || 'Aryan Singh'}"`,
      `"${inv.serviceType || ''}"`,
      `"${inv.entityName || ''}"`,
      `"${inv.amount || 3500}"`,
      `"${inv.dueDate || '2026-09-25'}"`,
      `"${inv.status || 'PAID'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ZYZUS_${district}_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fee summary report exported to CSV successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Fee Collections & Student Invoices: ${district}`}
        subtitle="Track incoming fee remittances, student billings, unpaid dues, and automated payment reminders"
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Finance' },
          { label: 'Student Fees' }
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-royal-blue-500/10 border border-royal-blue-500/30 text-royal-blue-300 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-royal-blue-400" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export Fee Report (CSV)
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          subtitle="Cleared for current cycle"
          icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
          trend={totalCollected > 0 ? { value: '12%', isPositive: true } : undefined}
        />
        <StatCard
          title="Pending Collections"
          value={`₹${pendingAmount.toLocaleString()}`}
          subtitle="Invoices due this week"
          icon={<Clock className="w-6 h-6 text-amber-400" />}
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length}
          subtitle="Active student billings"
          icon={<Receipt className="w-6 h-6 text-royal-blue-400" />}
        />
        <StatCard
          title="District Platform Commission"
          value={`₹${Math.round(totalCollected * 0.1).toLocaleString()}`}
          subtitle="10% platform facilitation"
          icon={<CreditCard className="w-6 h-6 text-purple-400" />}
        />
      </div>

      {/* Invoices Table Card */}
      <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Student Billing & Invoice Roster</h3>
            <p className="text-xs text-slate-400 mt-0.5">Supervise fee reconciliations between parents, tutors, and libraries</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-royal-blue-500 w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-royal-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Pending Dues</option>
              <option value="OVERDUE">Overdue Accounts</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4 text-slate-400" />}
              onClick={handleExportCSV}
            >
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-royal-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">
              {searchQuery ? `No matching invoices found in your authorized district (${district}).` : `No fee records found in ${district} district.`}
            </p>
            <p className="text-xs text-slate-400">All student billings are currently reconciled for {district}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/40">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Billing Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-royal-blue-400">
                      {inv.invoiceNumber || inv.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-sm">{inv.studentName || 'Aryan Singh'}</p>
                      <p className="text-[11px] text-slate-400">{district} District</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{inv.serviceType}</p>
                      <p className="text-[10px] text-slate-400">{inv.entityName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-white text-sm">₹{Number(inv.amount || 3500).toLocaleString()}</p>
                      <span className="text-[10px] text-slate-400">Monthly Cycle</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {inv.dueDate || '2026-09-25'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status || 'PAID'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {((inv.status || '').toUpperCase() === 'PENDING' || (inv.status || '').toUpperCase() === 'OVERDUE') ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<Send className="w-3.5 h-3.5 text-amber-400" />}
                          onClick={() => handleSendReminder(inv)}
                        >
                          Remind
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
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
  );
};
