import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { mockStore } from '../../mock/store';
import { Teacher, LeftTeacherRecord } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import {
  GraduationCap,
  Search,
  Phone,
  Eye,
  ShieldCheck,
  UserX,
  UserCheck,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  FileCheck,
  X,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { districtAuthorizationService } from '../../services/districtAuthorizationService';

export const DistrictTeachers: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [leftTeachers, setLeftTeachers] = useState<LeftTeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING' | 'LEFT'>('ACTIVE');

  // Mark Teacher Left Modal
  const [isMarkLeftOpen, setIsMarkLeftOpen] = useState(false);
  const [selectedTeacherForExit, setSelectedTeacherForExit] = useState<Teacher | null>(null);
  const [exitReason, setExitReason] = useState('Relocation to another district / city');
  const [exitPendingDues, setExitPendingDues] = useState(0);
  const [exitRemarks, setExitRemarks] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      districtAuthorizationService.verifyDistrictAccess(district, 'teachers', 'READ');
      const data = await districtAdminService.getTeachers(district);
      setTeachers(data);
      const leftData = mockStore.getLeftTeachers(district);
      setLeftTeachers(leftData);
    } catch (err: any) {
      console.error('Failed to load teachers', err);
      addToast(err?.message || 'Access restricted for unauthorized district.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [district]);

  const activeTeachers = teachers.filter((t) => t.verificationStatus === 'verified' || (t.verificationStatus as any) === 'approved');
  const pendingTeachers = teachers.filter((t) => t.verificationStatus === 'pending');

  const filteredTeachers = (activeTab === 'ACTIVE' ? activeTeachers : pendingTeachers).filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      t.phone?.includes(search)
  );

  const filteredLeftTeachers = leftTeachers.filter(
    (lt) =>
      lt.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      lt.phone?.includes(search) ||
      (lt.exitReason || lt.reason || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForExit) return;

    const newLeftRecord: LeftTeacherRecord = {
      id: `LT-${Date.now()}`,
      teacherId: selectedTeacherForExit.id,
      teacherName: selectedTeacherForExit.name,
      phone: selectedTeacherForExit.phone,
      email: selectedTeacherForExit.email,
      district,
      exitDate: new Date().toISOString().slice(0, 10),
      exitReason,
      pendingDues: Number(exitPendingDues),
      clearanceStatus: Number(exitPendingDues) > 0 ? 'PENDING' : 'CLEARED',
      recordedByAdminId: scope?.userId || user?.id || 'admin_district',
      remarks: exitRemarks.trim() || 'Voluntary discontinuation filed at District Admin Desk.',
    };

    mockStore.addLeftTeacher(newLeftRecord);
    setLeftTeachers(mockStore.getLeftTeachers(district));
    addToast(
      `Discontinuation recorded for ${selectedTeacherForExit.name}. Placed in Left Teachers archive.`,
      'info'
    );

    setIsMarkLeftOpen(false);
    setSelectedTeacherForExit(null);
    setExitRemarks('');
    setExitPendingDues(0);
  };

  const handleSettleClearance = (recordId: string, teacherName: string) => {
    mockStore.updateLeftTeacherSettlement(recordId, 'CLEARED');
    setLeftTeachers(mockStore.getLeftTeachers(district));
    addToast(`Full financial clearance certificate issued for ${teacherName}. Dues settled.`, 'success');
  };

  const handleExportCSV = () => {
    const csvRows = [
      'Teacher ID,Name,Phone,Qualification,Experience,Verification Status,Subjects',
      ...teachers.map(
        (t) =>
          `"${t.id}","${t.name}","${t.phone || 'N/A'}","${t.qualification}","${t.experienceYears} Years","${
            t.verificationStatus
          }","${t.subjects.join('; ')}"`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ZYZUS_${district}_Teachers.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Teacher roster exported successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Educator Roster & Faculty Desk: ${district}`}
        subtitle={`Verification governance, live allotments, and exit clearance records for ${district}`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Teachers' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Link to="/district-admin/teacher-approvals">
              <Button variant="outline" size="sm" icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}>
                KYC Approvals ({pendingTeachers.length})
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export Roster (CSV)
            </Button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Verified Active Tutors"
          value={activeTeachers.length}
          change="100% Police & Degree Checked"
          isPositive={true}
          icon={<GraduationCap className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Pending KYC Applications"
          value={pendingTeachers.length}
          change="Awaiting your verification"
          isPositive={false}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
        />
        <StatCard
          title="Discontinued / Left Teachers"
          value={leftTeachers.length}
          change="Audited exit clearances"
          isPositive={true}
          icon={<UserX className="w-6 h-6 text-rose-600" />}
        />
        <StatCard
          title="Average Faculty Rating"
          value={activeTeachers.length > 0 ? "4.9 / 5.0" : "N/A"}
          change={activeTeachers.length > 0 ? "Based on parent reviews" : "No active reviews"}
          isPositive={true}
          icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ACTIVE'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Active Verified Educators ({activeTeachers.length})
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PENDING'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          Awaiting KYC Sign-Off ({pendingTeachers.length})
        </button>

        <button
          onClick={() => setActiveTab('LEFT')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'LEFT'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserX className="w-4 h-4 text-rose-600" />
          Left / Discontinued Teachers Archive ({leftTeachers.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search educator name, subject, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Tab 1 & 2: Active & Pending Teachers */}
      {activeTab !== 'LEFT' && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            {activeTab === 'ACTIVE' ? 'Active Faculty Roster' : 'Pending Verification Queue'} ({filteredTeachers.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              {search ? `No matching teacher found in your authorized district (${district}).` : `No educators found in ${district} district.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase bg-slate-50">
                  <tr>
                    <th className="py-3 px-4">Educator Name</th>
                    <th className="py-3 px-4">Qualification</th>
                    <th className="py-3 px-4">Specialization Subjects</th>
                    <th className="py-3 px-4 text-center">Experience</th>
                    <th className="py-3 px-4 text-center">Rating</th>
                    <th className="py-3 px-4 text-center">Police / KYC Status</th>
                    <th className="py-3 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{t.name}</div>
                        <span className="text-slate-400 font-mono text-[11px] block">{t.phone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{t.qualification}</p>
                        <p className="text-slate-400 text-[11px]">{t.university || 'Varanasi University'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.subjects.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-semibold rounded text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {t.experienceYears} Years
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-slate-800">
                          <RatingStars rating={t.rating || 4.9} max={1} size="sm" />
                          <span>{t.rating || 4.9}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={t.verificationStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {activeTab === 'ACTIVE' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                            onClick={() => {
                              setSelectedTeacherForExit(t);
                              setIsMarkLeftOpen(true);
                            }}
                          >
                            Mark as Left
                          </Button>
                        ) : (
                          <Link to="/district-admin/teacher-approvals">
                            <Button size="sm" variant="primary" className="text-xs">
                              Inspect KYC
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Left / Discontinued Teachers Archive (Req 8) */}
      {activeTab === 'LEFT' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Left & Discontinued Teachers Archive</h3>
              <p className="text-xs text-slate-500">Official log of exit dates, reasons, pending dues, and clearance certification</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Audit Retained Permanently
            </span>
          </div>

          {filteredLeftTeachers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              {search ? `No matching discontinued teacher records found in your authorized district (${district}).` : `No discontinued teachers archived in ${district} district.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Discontinued Educator</th>
                  <th className="py-3 px-4">Exit Date</th>
                  <th className="py-3 px-4">Official Reason for Discontinuation</th>
                  <th className="py-3 px-4 text-center">Pending Dues</th>
                  <th className="py-3 px-4 text-center">Clearance Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLeftTeachers.map((lt) => (
                  <tr key={lt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{lt.teacherName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{lt.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {lt.exitDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <p className="font-semibold">{lt.exitReason}</p>
                      <span className="text-[11px] text-slate-400 block truncate max-w-xs">{lt.remarks}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {(lt.pendingDues || 0) > 0 ? (
                        <span className="text-rose-600">₹{(lt.pendingDues || 0).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600">₹0 (Cleared)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lt.clearanceStatus === 'CLEARED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {lt.clearanceStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {lt.clearanceStatus === 'PENDING' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs"
                          onClick={() => handleSettleClearance(lt.id, lt.teacherName)}
                        >
                          Settle & Clear Dues
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
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
      )}

      {/* Mark as Left Modal */}
      {isMarkLeftOpen && selectedTeacherForExit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Discontinuation: {selectedTeacherForExit.name}
                </h3>
                <p className="text-xs text-slate-500">
                  District Admin exit interview & regulatory clearance filing
                </p>
              </div>
              <button
                onClick={() => setIsMarkLeftOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmExit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Leaving *</label>
                <select
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Relocation to another district / city">Relocation to another district / city</option>
                  <option value="Selected for Government Teaching / Civil Services">Selected for Government Teaching / Civil Services</option>
                  <option value="Higher studies or research commencement">Higher studies or research commencement</option>
                  <option value="Medical or family emergency">Medical or family emergency</option>
                  <option value="Voluntary personal discontinuation">Voluntary personal discontinuation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pending Payout / Dues (INR)
                </label>
                <input
                  type="number"
                  value={exitPendingDues}
                  onChange={(e) => setExitPendingDues(Number(e.target.value))}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  If ₹0, immediate clearance certificate is issued.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Remarks</label>
                <textarea
                  rows={3}
                  value={exitRemarks}
                  onChange={(e) => setExitRemarks(e.target.value)}
                  placeholder="e.g. Conducted exit review. Reallocated 3 active home tuition students to Dr. Verma."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMarkLeftOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  Confirm Discontinuation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
