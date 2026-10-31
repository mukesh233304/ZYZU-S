import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { Library } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FocusPointSearchInput } from '../../components/common/FocusPointSearchInput';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Armchair,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Wifi,
  Camera,
  Flame,
  Droplets,
  Search,
  CheckSquare,
  AlertTriangle,
  FileText,
  Sparkles,
  CreditCard,
  Lock,
  Phone,
  Calendar
} from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

export const DistrictLibraryApprovals: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.district || user?.districtName || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal State
  const [selectedLib, setSelectedLib] = useState<Library | null>(null);
  const [processing, setProcessing] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Physical Inspection Checklist State
  const [inspectionChecklist, setInspectionChecklist] = useState({
    fireSafety: true,
    cctvWorking: true,
    powerBackup: true,
    roWater: true,
    wifiSpeed: true,
    ergonomicDesks: true,
  });

  const fetchLibraries = async () => {
    try {
      const data = await districtAdminService.getLibraries(district);
      setLibraries(data);
    } catch (err) {
      console.error('Failed to load libraries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, [district]);

  const pendingCount = libraries.filter(
    l => l.verificationStatus === 'pending' || l.verificationStatus === 'PENDING'
  ).length;
  const approvedCount = libraries.filter(
    l => l.verificationStatus === 'verified' || l.verificationStatus === 'APPROVED'
  ).length;

  const filteredLibraries = libraries.filter(lib => {
    const isPending = lib.verificationStatus === 'pending' || lib.verificationStatus === 'PENDING';
    const isApproved = lib.verificationStatus === 'verified' || lib.verificationStatus === 'APPROVED';

    if (activeTab === 'pending' && !isPending) return false;
    if (activeTab === 'approved' && !isApproved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lib.name.toLowerCase().includes(q);
      const matchId = lib.id.toLowerCase().includes(q);
      const matchOwner = ((lib as any).ownerName || (lib as any).owner || '').toLowerCase().includes(q);
      const matchArea = (lib.area || '').toLowerCase().includes(q);
      const matchAddr = (lib.address || '').toLowerCase().includes(q);
      const matchPin = ((lib as any).pincode || (lib as any).pin || '').toLowerCase().includes(q);
      const matchStatus = (lib.verificationStatus || '').toLowerCase().includes(q);
      return matchName || matchId || matchOwner || matchArea || matchAddr || matchPin || matchStatus;
    }
    return true;
  });

  const openInspection = (lib: Library) => {
    setSelectedLib(lib);
    setRemarks('');
    setInspectionChecklist({
      fireSafety: true,
      cctvWorking: true,
      powerBackup: true,
      roWater: true,
      wifiSpeed: true,
      ergonomicDesks: true,
    });
  };

  const handleApprove = async () => {
    if (!selectedLib) return;
    if (!inspectionChecklist.fireSafety || !inspectionChecklist.powerBackup) {
      addToast('Fire safety and power backup checks are mandatory for library approval', 'error');
      return;
    }

    setProcessing(true);
    try {
      await districtAdminService.approveLibrary(selectedLib.id);
      setLibraries(prev =>
        prev.map(l =>
          l.id === selectedLib.id
            ? { ...l, verificationStatus: 'APPROVED' }
            : l
        )
      );
      setSelectedLib(null);
      addToast(`Library "${selectedLib.name}" approved! Public desk reservation is now active.`, 'success');
    } catch (err) {
      addToast('Failed to approve library space', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reasonOverride?: string) => {
    if (!selectedLib) return;
    const finalRemarks = reasonOverride || remarks || 'Facility amenities do not meet minimum physical compliance guidelines';
    setProcessing(true);
    try {
      await districtAdminService.rejectLibrary(selectedLib.id, finalRemarks);
      setLibraries(prev =>
        prev.map(l =>
          l.id === selectedLib.id
            ? { ...l, verificationStatus: 'REJECTED' }
            : l
        )
      );
      setSelectedLib(null);
      addToast(`Library marked for rectification: "${finalRemarks}"`, 'info');
    } catch (err) {
      addToast('Failed to reject library application', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to view library approvals for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Space Approvals & Facility Audit"
        subtitle={`Verify physical infrastructure, power backups, Wi-Fi, and certify self-study libraries in ${district}`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Library Approvals' }
        ]}
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
          </div>
        }
      />

      {/* Tabs and Search */}
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
            Pending Inspections
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
            Active & Certified ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'all'
                ? 'bg-royal-blue-600 text-white shadow-md shadow-royal-blue-600/20 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Libraries ({libraries.length})
          </button>
        </div>

        <div className="w-full md:w-80">
          <FocusPointSearchInput
            id="district-library-approvals-search"
            placeholder="Search by library name, ID, owner, area, PIN..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Libraries Table Card */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-royal-blue-600 dark:text-royal-blue-400" />
            Registered Self-Study Facilities ({filteredLibraries.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Jurisdiction: <strong className="text-slate-800 dark:text-slate-200">{district}</strong>
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-royal-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLibraries.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No libraries matching this view</p>
            <p className="text-xs text-slate-500 mt-1">Switch tabs or clear search filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Section 23) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[200px]">Library & ID</th>
                    <th className="py-3.5 px-4 min-w-[170px]">Owner</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Location & District</th>
                    <th className="py-3.5 px-4">Facilities</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Verification Status</th>
                    <th className="py-3.5 px-4">Approval Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {filteredLibraries.map(lib => {
                    const isPending = lib.verificationStatus === 'pending' || lib.verificationStatus === 'PENDING';
                    const submittedDate = (lib as any).createdAt
                      ? new Date((lib as any).createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '14 July 2026';

                    return (
                      <tr key={lib.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-royal-blue-50 dark:bg-royal-blue-500/15 border border-royal-blue-200 dark:border-royal-blue-500/30 flex items-center justify-center text-royal-blue-600 dark:text-royal-blue-400 font-bold shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                {lib.name}
                                {(lib.verificationStatus === 'verified' || lib.verificationStatus === 'APPROVED') && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                )}
                              </p>
                              <p className="text-royal-blue-600 dark:text-royal-blue-400 text-[11px] font-mono font-semibold">
                                {lib.id}
                              </p>
                              <span className="text-slate-500 text-[10px]">
                                {lib.totalSeats} Desks • ₹{lib.monthlyFee || 499}/mo
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{lib.ownerName}</p>
                          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lib.ownerPhone}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-royal-blue-600" />
                            {lib.area}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">{lib.address || `${district}, UP`}</p>
                          <span className="text-[10px] text-slate-500">District: {district}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <span title="Wi-Fi" className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-royal-blue-600">
                              <Wifi className="w-3.5 h-3.5" />
                            </span>
                            <span title="Power Backup" className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-amber-600">
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                            <span title="CCTV" className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {submittedDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          }`}>
                            {isPending ? 'Physical Audit Pending' : 'Compliance Verified'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={lib.verificationStatus} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant={isPending ? 'primary' : 'outline'}
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => openInspection(lib)}
                          >
                            {isPending ? 'Audit & Certify' : 'View Audit'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Cards (Section 23) */}
            <div className="lg:hidden space-y-4">
              {filteredLibraries.map(lib => {
                const isPending = lib.verificationStatus === 'pending' || lib.verificationStatus === 'PENDING';
                const submittedDate = (lib as any).createdAt
                  ? new Date((lib as any).createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '14 July 2026';

                return (
                  <div
                    key={lib.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{lib.name}</h4>
                        <span className="font-mono text-[11px] text-royal-blue-600 dark:text-royal-blue-400 font-semibold">
                          ID: {lib.id}
                        </span>
                      </div>
                      <StatusBadge status={lib.verificationStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Owner & Contact</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{lib.ownerName}</p>
                        <p className="text-slate-500 text-[11px] font-mono">{lib.ownerPhone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Location & District</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{lib.area}</p>
                        <p className="text-slate-500 text-[11px]">{district}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Submitted Date</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{submittedDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Capacity & Rate</p>
                        <p className="font-semibold text-royal-blue-600 dark:text-royal-blue-400 mt-0.5">
                          {lib.totalSeats} Desks • ₹{lib.monthlyFee || 499}/mo
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Wifi className="w-3.5 h-3.5 text-royal-blue-600" />
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <Button
                        size="sm"
                        variant={isPending ? 'primary' : 'outline'}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => openInspection(lib)}
                      >
                        {isPending ? 'Audit & Certify' : 'View Audit'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Facility Inspection & Certification Modal */}
      <Modal
        isOpen={!!selectedLib}
        onClose={() => setSelectedLib(null)}
        title={`Facility Compliance Audit: ${selectedLib?.name || ''}`}
        size="lg"
      >
        {selectedLib && (
          <div className="space-y-5 text-sm">
            {/* Facility Owner & Applicant Identity */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
              <UserAvatar 
                user={{
                  name: selectedLib.ownerName,
                  avatarUrl: selectedLib.ownerAvatar,
                  role: 'LIBRARY_OWNER'
                }}
                size="lg"
                shape="rounded"
                showBorder
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{selectedLib.ownerName}</h4>
                  <span className="text-[10px] font-bold text-royal-blue-400 bg-royal-blue-500/10 px-2 py-0.5 rounded border border-royal-blue-500/20">
                    Applicant & Center Director
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct Phone: +91 {selectedLib.ownerPhone} • Center: {selectedLib.name}
                </p>
              </div>
            </div>

            {/* Overview Banner */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Locality & District</p>
                <p className="font-bold text-white mt-0.5">{selectedLib.area}, {district}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Physical Desks</p>
                <p className="font-mono font-bold text-royal-blue-400 mt-0.5">{selectedLib.totalSeats} Seats</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Starting Monthly Fee</p>
                <p className="font-bold text-emerald-400 mt-0.5">₹{selectedLib.monthlyFee || 499} / mo</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Current Status</p>
                <div className="mt-0.5"><StatusBadge status={selectedLib.verificationStatus} /></div>
              </div>
            </div>

            {/* Subscription & Fee Audit Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Listing Subscription & Payment Audit
                </h5>
                <span className="font-mono text-[10px] text-slate-400">
                  Tier: {selectedLib.subscription?.pricingScope || 'DISTRICT'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-300">
                <div>
                  <span className="text-slate-400 text-[11px]">Enrolled Plan</span>
                  <p className="font-bold text-white mt-0.5">{selectedLib.subscription?.planName || 'Pro Monthly Listing Plan'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Subscription State</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedLib.subscription?.status || 'ACTIVE'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Paid Amount</span>
                  <p className="font-bold text-white mt-0.5">
                    {selectedLib.subscription?.isFree ? 'FREE (₹0)' : `₹${selectedLib.subscription?.finalPaidAmount || 300}`}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Auto Renewal</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {selectedLib.subscription?.autoRenew !== false ? 'Enabled (Active)' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shifts & Timings */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-royal-blue-400" /> Operational Shifts & Pricing
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-300">Morning Shift</p>
                  <p className="text-xs font-mono text-royal-blue-400 mt-0.5">06:00 AM - 02:00 PM</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">₹499 / month</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-300">Evening Shift</p>
                  <p className="text-xs font-mono text-royal-blue-400 mt-0.5">02:00 PM - 10:00 PM</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">₹499 / month</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-300">Full Day (Reserved)</p>
                  <p className="text-xs font-mono text-royal-blue-400 mt-0.5">06:00 AM - 10:00 PM</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">₹899 / month</p>
                </div>
              </div>
            </div>

            {/* Declared Amenities */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Declared Student Facilities
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedLib.facilities.map(f => (
                  <span key={f} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-medium">
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Physical Inspection Checklist */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> District Admin Physical Compliance Audit
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={inspectionChecklist.fireSafety}
                    onChange={e => setInspectionChecklist(prev => ({ ...prev, fireSafety: e.target.checked }))}
                    className="rounded border-slate-700 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Fire Extinguisher Installed & Certified
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={inspectionChecklist.powerBackup}
                    onChange={e => setInspectionChecklist(prev => ({ ...prev, powerBackup: e.target.checked }))}
                    className="rounded border-slate-700 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Dual Power Backup (Inverter + DG)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={inspectionChecklist.cctvWorking}
                    onChange={e => setInspectionChecklist(prev => ({ ...prev, cctvWorking: e.target.checked }))}
                    className="rounded border-slate-700 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-royal-blue-400" /> 24/7 CCTV Camera Coverage Active
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={inspectionChecklist.wifiSpeed}
                    onChange={e => setInspectionChecklist(prev => ({ ...prev, wifiSpeed: e.target.checked }))}
                    className="rounded border-slate-700 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-royal-blue-400" /> High-Speed Fiber Wi-Fi (&gt; 50 Mbps)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={inspectionChecklist.roWater}
                    onChange={e => setInspectionChecklist(prev => ({ ...prev, roWater: e.target.checked }))}
                    className="rounded border-slate-700 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Drinking RO Water & Clean Washroom
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={inspectionChecklist.ergonomicDesks}
                    onChange={e => setInspectionChecklist(prev => ({ ...prev, ergonomicDesks: e.target.checked }))}
                    className="rounded border-slate-700 text-royal-blue-600 focus:ring-royal-blue-500"
                  />
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-emerald-400" /> Ergonomic Desks + Power Sockets
                  </span>
                </label>
              </div>
            </div>

            {/* Inspector Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                District Inspector Audit Notes
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Physical premises checked at Saidpur center. Complies with ventilation, sound isolation and safety..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3.5 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                onClick={() => handleReject('Requires additional fire extinguisher and inverter capacity')}
                loading={processing}
                icon={<XCircle className="w-4 h-4" />}
              >
                Request Rectification
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedLib(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  loading={processing}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Certify Space & Activate Bookings
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
