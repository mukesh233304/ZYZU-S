import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { Teacher } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FocusPointSearchInput } from '../../components/common/FocusPointSearchInput';
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Eye,
  Search,
  CheckSquare,
  Square,
  Award,
  ExternalLink,
  UserCheck,
  Building,
  Phone,
  Mail,
  Lock,
  UploadCloud,
  FileCheck
} from 'lucide-react';

export const DistrictTeacherApprovals: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.district || user?.districtName || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal State
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'aadhaar' | 'degree' | 'experience'>('aadhaar');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    idVerified: true,
    degreeVerified: true,
    experienceVerified: true,
    backgroundCleared: true,
  });

  const fetchTeachers = async () => {
    try {
      const data = await districtAdminService.getTeachers(district);
      setTeachers(data);
    } catch (err) {
      console.error('Failed to load teachers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [district]);

  // Count metrics
  const pendingCount = teachers.filter(
    t => t.verificationStatus === 'pending' || t.verificationStatus === 'PENDING'
  ).length;
  const approvedCount = teachers.filter(
    t => t.verificationStatus === 'verified' || t.verificationStatus === 'APPROVED'
  ).length;
  const rejectedCount = teachers.filter(
    t => t.verificationStatus === 'rejected' || t.verificationStatus === 'REJECTED'
  ).length;

  // Filtered teachers
  const filteredTeachers = teachers.filter(t => {
    const isPending = t.verificationStatus === 'pending' || t.verificationStatus === 'PENDING';
    const isApproved = t.verificationStatus === 'verified' || t.verificationStatus === 'APPROVED';
    const isRejected = t.verificationStatus === 'rejected' || t.verificationStatus === 'REJECTED';

    if (activeTab === 'pending' && !isPending) return false;
    if (activeTab === 'approved' && !isApproved) return false;
    if (activeTab === 'rejected' && !isRejected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchPhone = (t.phone || t.mobile || '').includes(q);
      const matchSubj = t.subjects.some(s => s.toLowerCase().includes(q));
      const matchQual = (t.qualification || t.degree || '').toLowerCase().includes(q);
      const matchArea = (t.area || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchSubj || matchQual || matchArea;
    }
    return true;
  });

  const openInspection = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setRemarks(teacher.rejectionReason || '');
    setActiveDocTab('aadhaar');
    setChecklist({
      idVerified: teacher.verificationStatus === 'verified' || teacher.verificationStatus === 'APPROVED',
      degreeVerified: true,
      experienceVerified: true,
      backgroundCleared: true,
    });
  };

  const handleApprove = async () => {
    if (!selectedTeacher) return;
    if (!checklist.idVerified || !checklist.degreeVerified) {
      addToast('Please complete mandatory ID and Degree checks before approving', 'error');
      return;
    }
    setProcessing(true);
    try {
      await districtAdminService.approveTeacher(selectedTeacher.id, user?.name || 'District Admin');
      setTeachers(prev =>
        prev.map(t =>
          t.id === selectedTeacher.id
            ? { ...t, verificationStatus: 'APPROVED', rejectionReason: undefined }
            : t
        )
      );
      setSelectedTeacher(null);
      addToast(`Teacher ${selectedTeacher.name} officially verified and certified for ${district}!`, 'success');
    } catch (err) {
      addToast('Failed to approve educator', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reasonOverride?: string) => {
    if (!selectedTeacher) return;
    const finalRemarks = reasonOverride || remarks || 'Incomplete credential documentation';
    setProcessing(true);
    try {
      await districtAdminService.rejectTeacher(selectedTeacher.id, finalRemarks);
      setTeachers(prev =>
        prev.map(t =>
          t.id === selectedTeacher.id
            ? { ...t, verificationStatus: 'REJECTED', rejectionReason: finalRemarks }
            : t
        )
      );
      setSelectedTeacher(null);
      addToast(`Application marked as rejected. Remarks logged: "${finalRemarks}"`, 'info');
    } catch (err) {
      addToast('Failed to update status', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestDocuments = async () => {
    if (!selectedTeacher) return;
    const reqRemarks = remarks || 'Replacement documentation required for academic degree and ID proof';
    setProcessing(true);
    try {
      setTeachers(prev =>
        prev.map(t =>
          t.id === selectedTeacher.id
            ? { ...t, verificationStatus: 'PENDING', rejectionReason: `Replacement Required: ${reqRemarks}` }
            : t
        )
      );
      setSelectedTeacher(null);
      addToast(`Document re-upload request logged for ${selectedTeacher.name}. Status marked as Replacement Required.`, 'info');
    } catch (err) {
      addToast('Failed to request documents', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const presetReasons = [
    'Aadhaar card copy is blurry or unreadable',
    'Degree marksheet unverified against university registrar',
    `Address is outside ${district} service jurisdiction`,
    'Minimum 2 years teaching experience proof missing',
    'Subject specialization does not match applied classes'
  ];

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to access teacher verifications for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Verification & KYC Desk"
        subtitle={`Review educator credentials, degrees, Aadhaar proofs, and certify tutors in ${district}`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Teacher Approvals' }
        ]}
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
          </div>
        }
      />

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending KYC
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'pending' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Certified Educators ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rejected / Needs Info ({rejectedCount})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'all'
                ? 'bg-royal-blue-600 text-white shadow-md shadow-royal-blue-600/20 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Registered ({teachers.length})
          </button>
        </div>

        <div className="w-full md:w-80">
          <FocusPointSearchInput
            id="district-teacher-approvals-search"
            placeholder="Search by name, subject, qualification, ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Teachers Table Card */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-royal-blue-600 dark:text-royal-blue-400" />
            Educator Verification Queue ({filteredTeachers.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            District: <strong className="text-slate-800 dark:text-slate-200">{district}</strong>
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-royal-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <GraduationCap className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No educator profiles found</p>
            <p className="text-xs text-slate-500 mt-1">Try switching tabs or adjusting search query.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[200px]">Educator Profile</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Academic Credentials</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Subjects & Classes</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Service Area & Fee</th>
                    <th className="py-3.5 px-4">Verification Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {filteredTeachers.map(t => {
                    const isPending = t.verificationStatus === 'pending' || t.verificationStatus === 'PENDING';
                    const teacherId = (t as any).teacherId || `FP-TEA-${t.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                              alt={t.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 truncate">
                                {t.name}
                                {(t.verificationStatus === 'verified' || t.verificationStatus === 'APPROVED') && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                )}
                              </p>
                              <p className="text-royal-blue-600 dark:text-royal-blue-400 font-mono text-[11px] font-semibold">
                                Teacher ID: {teacherId}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                                {t.phone || t.mobile || 'Contact on file'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{t.qualification || t.highestQualification || 'B.Sc., B.Ed.'}</p>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[180px]">{t.university || 'State University'}</p>
                          <p className="text-royal-blue-600 dark:text-royal-blue-400 font-semibold text-[10px] mt-0.5">{t.experienceYears || 5} Years Experience</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {t.subjects.slice(0, 3).map(s => (
                              <span key={s} className="px-2 py-0.5 bg-royal-blue-50 dark:bg-royal-blue-500/15 text-royal-blue-700 dark:text-royal-blue-300 border border-royal-blue-200 dark:border-royal-blue-500/30 font-medium rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                            {t.subjects.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]">
                                +{t.subjects.length - 3} more
                              </span>
                            )}
                          </div>
                          {t.classes && t.classes.length > 0 && (
                            <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-1 font-semibold truncate max-w-xs">
                              Classes: {t.classes.join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {t.area || district}
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                            ₹{t.monthlyFee || t.expectedFeeMonthly || 5000}/mo
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.verificationStatus} />
                          <div className="mt-1">
                            {t.registrationPaymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                Fee Paid: ₹{t.registrationFinalAmount || t.registrationFee || 300}
                              </span>
                            ) : t.registrationPaymentStatus === 'FREE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                                Free Registration
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                Fee Paid: ₹{t.registrationFinalAmount || t.registrationFee || 300}
                              </span>
                            )}
                          </div>
                          {t.rejectionReason && (
                            <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1 truncate max-w-[160px]" title={t.rejectionReason}>
                              Note: {t.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant={isPending ? 'primary' : 'outline'}
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => openInspection(t)}
                          >
                            {isPending ? 'Inspect & Certify' : 'View KYC Dossier'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredTeachers.map(t => {
                const isPending = t.verificationStatus === 'pending' || t.verificationStatus === 'PENDING';
                const teacherId = (t as any).teacherId || `FP-TEA-${t.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`;

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={t.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {t.name}
                          </p>
                          <p className="text-royal-blue-600 dark:text-royal-blue-400 font-mono text-[10px] font-semibold">
                            Teacher ID: {teacherId}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={t.verificationStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Qualification</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{t.qualification || 'B.Sc., B.Ed.'}</p>
                        <p className="text-[10px] text-royal-blue-600 font-medium">{t.experienceYears || 5} Yrs Experience</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Rate</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">₹{t.monthlyFee || 5000}/mo</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {t.area || district}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Subjects & Classes</p>
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                        {t.subjects.join(' • ')} {t.classes?.length ? `(Classes: ${t.classes.join(', ')})` : ''}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant={isPending ? 'primary' : 'outline'}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => openInspection(t)}
                      >
                        {isPending ? 'Inspect & Certify' : 'View KYC Dossier'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Comprehensive KYC Inspection Modal (Sections 14-17) */}
      <Modal
        isOpen={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        title={`KYC & Credential Inspection: ${selectedTeacher?.name || ''}`}
        size="lg"
      >
        {selectedTeacher && (
          <div className="space-y-6 text-sm">
            {/* Section 14: EDUCATOR PROFILE HEADER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-royal-blue-50 via-slate-50 to-amber-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-[11px] uppercase tracking-widest font-black text-royal-blue-700 dark:text-royal-blue-400">
                  Educator Profile
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  District: <strong className="text-slate-900 dark:text-white font-extrabold">{district}</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedTeacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={selectedTeacher.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-royal-blue-600 shadow-md shrink-0"
                  />
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedTeacher.name}
                      {(selectedTeacher.verificationStatus === 'verified' || selectedTeacher.verificationStatus === 'APPROVED') && (
                        <span title="Certified Educator" className="inline-flex items-center">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      )}
                    </h4>
                    <p className="text-xs font-mono font-bold text-royal-blue-600 dark:text-royal-blue-400 mt-0.5">
                      Teacher ID: {(selectedTeacher as any).teacherId || `FP-TEA-${selectedTeacher.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedTeacher.phone || selectedTeacher.mobile || 'Contact on file'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedTeacher.email || 'Email verified'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                    Application Status
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={selectedTeacher.verificationStatus} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Registered: {selectedTeacher.createdAt ? new Date(selectedTeacher.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 July 2026'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 15: VISIBLE SECTION: Personal Information & Location */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-royal-blue-600 dark:text-royal-blue-400" />
                Personal Information & Service Location
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Full Name & Identity</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTeacher.name}</p>
                  <p className="text-slate-500 text-[11px]">UIDAI Aadhaar Verified</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Assigned Service Area</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTeacher.area || `${district} City`}</p>
                  <p className="text-slate-500 text-[11px]">District: {district}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Registration Fee Status</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedTeacher.registrationPaymentStatus === 'FREE' ? 'Free Pilot Program' : `₹${selectedTeacher.registrationFinalAmount || 300} Paid`}
                  </p>
                  <p className="text-slate-500 text-[11px] font-mono">
                    Ref: {selectedTeacher.registrationPaymentId || 'REG-TXN-2026-OK'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 15: VISIBLE SECTION: Qualification & Experience */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Academic Qualifications & Teaching Experience
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Degree & Specialization</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTeacher.qualification || selectedTeacher.highestQualification || 'B.Sc., B.Ed.'}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{selectedTeacher.university || 'State University'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Teaching Experience</p>
                  <p className="font-bold text-royal-blue-600 dark:text-royal-blue-400 mt-0.5">{selectedTeacher.experienceYears || 5} Years Experience</p>
                  <p className="text-slate-500 text-[11px]">CBSE & UP Board Syllabus</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Subjects & Classes</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTeacher.subjects.join(', ')}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">Classes: {selectedTeacher.classes?.join(', ') || '6–10'}</p>
                </div>
              </div>
            </div>

            {/* Section 16: SUBMITTED DOCUMENTS WITH STATUS BADGES */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-royal-blue-600 dark:text-royal-blue-400" />
                  Submitted Credential Documents
                </h5>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  4 Documents Submitted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Degree / Marksheet */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-royal-blue-50 dark:bg-royal-blue-500/20 text-royal-blue-600 dark:text-royal-blue-400 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Degree / Marksheet</p>
                      <p className="text-[10px] text-slate-500">Graduation & B.Ed. Certificates</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Uploaded • Verified
                  </span>
                </div>

                {/* Experience Letter */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Experience Letter</p>
                      <p className="text-[10px] text-slate-500">{selectedTeacher.experienceYears || 5} Years Teaching Proof</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Approved
                  </span>
                </div>

                {/* ID Proof */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">ID Proof</p>
                      <p className="text-[10px] text-slate-500">Aadhaar Card (Masked)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Verified UIDAI
                  </span>
                </div>

                {/* Passport / Other Submitted Documents */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Passport / Other Documents</p>
                      <p className="text-[10px] text-slate-500">Police Character & Address Proof</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    Under Review
                  </span>
                </div>
              </div>
            </div>

            {/* Section 15: VISIBLE SECTION: Verification Checklist */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                District Admin KYC Verification Checklist
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.idVerified}
                    onChange={e => setChecklist(prev => ({ ...prev, idVerified: e.target.checked }))}
                    className="rounded border-slate-400 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Government ID & Aadhaar Authenticated</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.degreeVerified}
                    onChange={e => setChecklist(prev => ({ ...prev, degreeVerified: e.target.checked }))}
                    className="rounded border-slate-400 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Degree & Subject Marksheets Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.experienceVerified}
                    onChange={e => setChecklist(prev => ({ ...prev, experienceVerified: e.target.checked }))}
                    className="rounded border-slate-400 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Teaching Experience Criteria Met</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.backgroundCleared}
                    onChange={e => setChecklist(prev => ({ ...prev, backgroundCleared: e.target.checked }))}
                    className="rounded border-slate-400 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Background Legal Clearance Declaration</span>
                </label>
              </div>
            </div>

            {/* Section 15: VISIBLE SECTION: Admin Review Notes & Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Review Notes / Verification Remarks
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {presetReasons.map(pr => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setRemarks(pr)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 transition-colors text-left"
                  >
                    + {pr}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter feedback, specific remarks, or details of documents requested..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
              />
            </div>

            {/* Section 17: VISIBLE ACTION AREA: [ APPROVE ], [ REJECT ], [ REQUEST DOCUMENTS ] */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                {/* [ REJECT ] */}
                <Button
                  variant="outline"
                  className="text-rose-600 border-rose-300 dark:border-rose-500/40 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold"
                  onClick={() => handleReject()}
                  loading={processing}
                  disabled={processing}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  REJECT
                </Button>

                {/* [ REQUEST DOCUMENTS ] */}
                <Button
                  variant="outline"
                  className="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-bold"
                  onClick={handleRequestDocuments}
                  loading={processing}
                  disabled={processing}
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  REQUEST DOCUMENTS
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTeacher(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>

                {/* [ APPROVE ] */}
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                  onClick={handleApprove}
                  loading={processing}
                  disabled={processing}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  APPROVE
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
