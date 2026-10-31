import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { mockStore } from '../../mock/store';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import {
  CalendarCheck,
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Armchair,
  GraduationCap,
  PlusCircle,
  X,
  FileCheck,
  Percent,
  Calendar,
  ShieldCheck
} from 'lucide-react';

import { districtAuthorizationService } from '../../services/districtAuthorizationService';

export const DistrictAttendance: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Home Tuition' | 'Study Library'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Manual Attendance Entry Modal State (Req 12)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualServiceType, setManualServiceType] = useState<'Home Tuition' | 'Study Library'>('Home Tuition');
  const [manualEntityName, setManualEntityName] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualTime, setManualTime] = useState('04:00 PM - 05:30 PM');
  const [manualStatus, setManualStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [manualRemarks, setManualRemarks] = useState('Manual verification by District Admin');

  const loadAttendance = async () => {
    setLoading(true);
    try {
      districtAuthorizationService.verifyDistrictAccess(district, 'attendance', 'READ');
      const data = await districtAdminService.getDistrictAttendance(district);
      setRecords(data);
    } catch (e: any) {
      console.error('Failed to load district attendance', e);
      addToast(e?.message || 'Access restricted for unauthorized district.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [district]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      (r.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.entityName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.sourceType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || (r.status || '').toUpperCase() === statusFilter.toUpperCase();
    const matchesDate = !dateFilter || r.date === dateFilter;
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const presentCount = records.filter((r) => (r.status || '').toUpperCase() === 'PRESENT').length;
  const presentRate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 94;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentName.trim() || !manualEntityName.trim()) return;

    const newAttendance = {
      id: `ATT-MANUAL-${Date.now()}`,
      studentName: manualStudentName.trim(),
      sourceType: manualServiceType,
      entityName: manualEntityName.trim(),
      date: manualDate,
      time: manualTime,
      status: manualStatus,
      source: 'MANUAL',
      district,
      verifiedBy: user?.name || 'District Admin (Ghazipur)',
      remarks: manualRemarks,
    };

    mockStore.addManualAttendance(newAttendance);
    setRecords((prev) => [newAttendance, ...prev]);
    addToast(`Manual attendance logged successfully with source [MANUAL] tag.`, 'success');

    setIsManualModalOpen(false);
    setManualStudentName('');
    setManualEntityName('');
  };

  const handleExportCSV = () => {
    const csvRows = [
      'Record ID,Date,Time,Student Name,Service Type,Educator/Library,Status,Source,Verified By',
      ...filtered.map(
        (r) =>
          `"${r.id}","${r.date || '2026-09-14'}","${r.time || 'N/A'}","${r.studentName || 'Student'}","${
            r.sourceType
          }","${r.entityName || 'N/A'}","${r.status || 'PRESENT'}","${r.source || 'SYSTEM'}","${
            r.verifiedBy || "ZYZU'S QR"
          }"`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ZYZUS_${district}_Attendance_${dateFilter || 'All'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Attendance log exported successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Attendance Monitoring Desk: ${district}`}
        subtitle={`Real-time verification of daily learning sessions and study desk shifts across ${district}`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Attendance Monitoring' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsManualModalOpen(true)}
            >
              Manual Attendance Entry
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export Register (CSV)
            </Button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Logged Sessions"
          value={records.length}
          change={records.length > 0 ? "September 2026 active cycle" : "No sessions logged yet"}
          isPositive={true}
          icon={<CalendarCheck className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="District Attendance Rate"
          value={records.length > 0 ? `${presentRate}%` : "N/A"}
          change={records.length > 0 ? "Target threshold: > 90%" : "No data"}
          isPositive={true}
          icon={<Percent className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Home Tuition Classes"
          value={records.filter((r) => r.sourceType === 'Home Tuition').length}
          change="Direct 1-on-1 sessions"
          isPositive={true}
          icon={<GraduationCap className="w-6 h-6 text-indigo-600" />}
        />
        <StatCard
          title="Study Library Check-ins"
          value={records.filter((r) => r.sourceType === 'Study Library').length}
          change="Shift study check-ins"
          isPositive={true}
          icon={<Armchair className="w-6 h-6 text-cyan-600" />}
        />
      </div>

      {/* Search, Date & Type Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, teacher, or library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Service Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Services</option>
            <option value="Home Tuition">Home Tuition Only</option>
            <option value="Study Library">Study Library Desks</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
          </select>

          {/* Date Picker Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl p-1.5 bg-slate-50"
            title="Filter by specific date"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Main Attendance Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Verified Attendance Records ({filtered.length})
            </h3>
            <p className="text-xs text-slate-500">Live check-in stream across {district} jurisdiction</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {presentRate}% District Compliance
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {searchQuery ? `No matching attendance records found in your authorized district (${district}).` : `No attendance records logged in ${district} district.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Service Domain</th>
                  <th className="py-3 px-4">Assigned Tutor / Study Center</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Verification Method</th>
                  <th className="py-3 px-4 text-right">Audit State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isManual = item.source === 'MANUAL';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{item.date || '2026-09-14'}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{item.time || '04:00 PM - 05:30 PM'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.studentName || 'Aryan Singh'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.sourceType === 'Home Tuition'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {item.sourceType === 'Home Tuition' ? (
                            <GraduationCap className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Armchair className="w-3 h-3 text-indigo-600" />
                          )}
                          {item.sourceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        <div>{item.entityName || 'Dr. Rajesh Sharma'}</div>
                        <span className="text-[10px] text-slate-400">Locality: Ghazipur</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={item.status || 'PRESENT'} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isManual ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            MANUAL (DA Signed)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            QR / Geofence Scan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manual Attendance Entry Modal (Req 12) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Manual Attendance Override Entry
                </h3>
                <p className="text-xs text-slate-500">
                  Authorized District Admin logging with explicit [MANUAL] audit attribution
                </p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Rai"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Type *</label>
                  <select
                    value={manualServiceType}
                    onChange={(e: any) => setManualServiceType(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Home Tuition">Home Tuition Class</option>
                    <option value="Study Library">Study Library Desk</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {manualServiceType === 'Home Tuition' ? 'Educator Name *' : 'Library Center Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={manualServiceType === 'Home Tuition' ? 'e.g. Dr. Verma' : 'e.g. Sadar Study Hall'}
                    value={manualEntityName}
                    onChange={(e) => setManualEntityName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Session Timing *</label>
                  <input
                    type="text"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="e.g. 05:00 PM - 06:30 PM"
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status *</label>
                  <select
                    value={manualStatus}
                    onChange={(e: any) => setManualStatus(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PRESENT">Present (Attended)</option>
                    <option value="ABSENT">Absent (Unexcused)</option>
                    <option value="LATE">Late Attendance</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Audit Source Tag</label>
                  <div className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 rounded-xl p-2.5">
                    MANUAL_OVERRIDE
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason / Justification</label>
                <textarea
                  rows={2}
                  value={manualRemarks}
                  onChange={(e) => setManualRemarks(e.target.value)}
                  placeholder="e.g. Student app connectivity outage. Verified directly with educator via phone."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManualModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  Confirm Manual Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
