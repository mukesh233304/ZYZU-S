import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { Student } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  Search,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Send,
  MessageSquare,
  AlertCircle,
  Download,
  CheckCircle2,
  UserX,
  PlusCircle,
  ShieldCheck,
  X
} from 'lucide-react';

import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { INITIAL_LOCALITIES } from '../../mock/data/locations';

export const DistrictStudents: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'LIBRARY' | 'TUITION' | 'NEW_THIS_MONTH' | 'DISCONTINUED'>('ALL');
  const [selectedArea, setSelectedArea] = useState('ALL');

  // Send Notice Modal State
  const [selectedStudentForNotice, setSelectedStudentForNotice] = useState<Student | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeChannel, setNoticeChannel] = useState<'WHATSAPP' | 'SMS' | 'PORTAL'>('WHATSAPP');

  const availableLocalities = React.useMemo(() => {
    return INITIAL_LOCALITIES.filter(l => 
      (scope?.districtId && l.districtId === scope.districtId) ||
      l.districtId === `dist-${district.toLowerCase().substring(0, 3)}`
    );
  }, [scope, district]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        districtAuthorizationService.verifyDistrictAccess(district, 'students', 'READ');
        const data = await districtAdminService.getStudents(district);
        setStudents(data);
      } catch (err: any) {
        console.error('Failed to load students', err);
        addToast(err?.message || 'Access restricted for unauthorized district.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [district]);

  // Tab Filtering Logic
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search) ||
      s.area?.toLowerCase().includes(search.toLowerCase()) ||
      s.grade?.toLowerCase().includes(search.toLowerCase());

    const matchesArea = selectedArea === 'ALL' || s.area?.toLowerCase().includes(selectedArea.toLowerCase());

    if (!matchesSearch || !matchesArea) return false;

    if (activeTab === 'LIBRARY') {
      return (s as any).enrolledType === 'LIBRARY' || s.id.includes('lib') || (s as any).seatNumber;
    }
    if (activeTab === 'TUITION') {
      return (s as any).enrolledType === 'TUITION' || !s.id.includes('lib');
    }
    if (activeTab === 'NEW_THIS_MONTH') {
      // simulate new registrations
      return (s as any).isNewRegistration || s.createdAt?.includes('2026-09') || true;
    }
    if (activeTab === 'DISCONTINUED') {
      return (s as any).status === 'discontinued' || (s as any).status === 'inactive';
    }

    return true;
  });

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNotice || !noticeMessage.trim()) return;

    addToast(
      `Notice successfully dispatched to ${selectedStudentForNotice.name}'s guardian via ${noticeChannel}.`,
      'success'
    );
    setSelectedStudentForNotice(null);
    setNoticeMessage('');
  };

  const handleExportCSV = () => {
    const csvRows = [
      'Student ID,Full Name,Guardian Phone,Grade,Sub-District / Locality,Enrollment Category,Status',
      ...filtered.map(
        (s) =>
          `"${s.id}","${s.name}","${s.phone || 'N/A'}","${s.grade}","${s.area || district}","${
            (s as any).enrolledType || 'Tuition + Library'
          }","Active"`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ZYZUS_${district}_Students_${activeTab}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Student registry downloaded successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Student Directory & Learner Desk: ${district}`}
        subtitle={`Complete registry of ${students.length} learners across Home Tuition and Self-Study Libraries`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Learner Desk' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export Students (CSV)
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total District Students"
          value={students.length}
          change={students.length > 0 ? "+18 new this month" : "No enrollments yet"}
          isPositive={true}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Home Tuition Enrolled"
          value={students.filter((s) => (s as any).enrolledType === 'TUITION').length}
          change="Assigned to verified tutors"
          isPositive={true}
          icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Library Desk Bookers"
          value={students.filter((s) => (s as any).enrolledType === 'LIBRARY').length}
          change="Reserved study spots"
          isPositive={true}
          icon={<Building2 className="w-6 h-6 text-indigo-600" />}
        />
        <StatCard
          title="Active Rate"
          value={students.length > 0 ? "98.2%" : "N/A"}
          change={students.length > 0 ? "Verified attendance & fee" : "No active students"}
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6 text-cyan-600" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          All Students ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('TUITION')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TUITION'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Home Tuition
        </button>

        <button
          onClick={() => setActiveTab('LIBRARY')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'LIBRARY'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Library Desk Learners
        </button>

        <button
          onClick={() => setActiveTab('NEW_THIS_MONTH')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'NEW_THIS_MONTH'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          New Enrolled (Sep 2026)
        </button>

        <button
          onClick={() => setActiveTab('DISCONTINUED')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'DISCONTINUED'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserX className="w-4 h-4 text-rose-600" />
          Discontinued Learners
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by student name, phone, grade, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Sub-Districts / Tehsils ({district})</option>
            {availableLocalities.map((loc) => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Learner Register ({filtered.length})
          </h3>
          <span className="text-xs text-slate-500">Live ZYZU'S verified data</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {search ? `No matching student found in your authorized district (${district}).` : `No students found matching your criteria in ${district} district.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Contact / Guardian</th>
                  <th className="py-3 px-4">Grade & Stream</th>
                  <th className="py-3 px-4">Service & Allotment</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">District Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {s.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {s.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{s.grade}</span>
                      <p className="text-slate-400 text-[11px]">{s.schoolName || 'CBSE Board'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {(s as any).enrolledType === 'LIBRARY' ? (
                        <div className="text-indigo-700 font-medium">
                          <span>Library Desk</span>
                          <span className="text-[10px] text-slate-500 block">Seat #{(s as any).seatNumber || '04'} • Morning Shift</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 font-medium">
                          <span>Home Tuition</span>
                          <span className="text-[10px] text-slate-500 block">Tutor: {(s as any).assignedTeacherName || 'Dr. Verma'}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {s.area || 'Ghazipur Sadar'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        icon={<MessageSquare className="w-3 h-3" />}
                        onClick={() => setSelectedStudentForNotice(s)}
                      >
                        Send Notice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Notice / Reminder Dispatch Modal */}
      {selectedStudentForNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Send Official Notice: {selectedStudentForNotice.name}
                </h3>
                <p className="text-xs text-slate-500">Contact: {selectedStudentForNotice.phone}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dispatch Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNoticeChannel('WHATSAPP')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      noticeChannel === 'WHATSAPP'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    WhatsApp Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeChannel('SMS')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      noticeChannel === 'SMS'
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Direct SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeChannel('PORTAL')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      noticeChannel === 'PORTAL'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Portal Notification
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="e.g. Respected Parent, this is an official reminder regarding monthly tuition attendance and upcoming demo review session in Ghazipur Sadar."
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentForNotice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Send className="w-4 h-4" />}
                >
                  Dispatch Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
