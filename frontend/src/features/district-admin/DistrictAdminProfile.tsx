import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { MOCK_DISTRICTS } from '../../mock/data/districts';
import { INITIAL_LOCALITIES } from '../../mock/data/locations';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { UserAvatar } from '../../components/common/UserAvatar';
import { compressImage } from '../../utils/imageUtils';
import {
  ShieldCheck,
  Camera,
  Trash2,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Bell,
  History,
  Lock,
  ExternalLink,
  ShieldAlert,
  Percent,
  FileText
} from 'lucide-react';
import { CommissionOfferPolicyManager } from './CommissionOfferPolicyManager';

export const DistrictAdminProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'JURISDICTION' | 'COMMISSION' | 'NOTIFICATIONS' | 'AUDIT'>('PROFILE');

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    alternatePhone: '',
    district: district,
    designation: 'Chief District Regulatory Administrator',
    officeAddress: `Room 104, Nodal Education & Study Infrastructure Desk, Collectorate Compound, ${district}, UP`,
    emergencyContactName: 'District Collectorate Reception Desk',
    emergencyContactPhone: '0548-222014',
    bio: `Sole authorized regulatory administrator overseeing certified self-study libraries, tutor background verifications, and quality assurance under ZYZU'S ${district} jurisdiction.`,
  });

  // Commission Settings State
  const [commissionConfig, setCommissionConfig] = useState({
    defaultLibraryCommissionRate: 10,
    defaultTuitionCommissionRate: 15,
  });

  // Notification Preferences State
  const [notifSettings, setNotifSettings] = useState({
    paymentReminderAdvanceDays: 1,
    smsAlertsEnabled: true,
    whatsappAlertsEnabled: true,
    urgentCircularPush: true,
    auditTrailLogging: true,
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const assignedDist = scope?.districtName || user.districtName || user.district || 'Mirzapur';
      setFormData({
        name: user.name || `District Admin (${assignedDist})`,
        email: user.email || `district.admin.${assignedDist.toLowerCase()}@focuspoint.internal`,
        mobile: user.mobile || user.phone || '9876543210',
        alternatePhone: (user as any).alternatePhone || '9876543219',
        district: assignedDist,
        designation: (user as any).designation || 'Chief District Regulatory Administrator',
        officeAddress: (user as any).officeAddress || `Room 104, Nodal Education & Study Infrastructure Desk, Collectorate Compound, ${assignedDist}, UP`,
        emergencyContactName: (user as any).emergencyContactName || 'District Collectorate Reception Desk',
        emergencyContactPhone: (user as any).emergencyContactPhone || '0548-222014',
        bio: (user as any).bio || `Sole authorized regulatory administrator overseeing certified self-study libraries, tutor background verifications, and quality assurance under ZYZU'S ${assignedDist} jurisdiction.`,
      });

      const conf = mockStore.getCommissionConfig(assignedDist);
      if (conf) {
        setCommissionConfig({
          defaultLibraryCommissionRate: conf.defaultLibraryCommissionRate || 10,
          defaultTuitionCommissionRate: conf.defaultTuitionCommissionRate || 15,
        });
      }

      setAuditLogs(mockStore.getAuditLogs(assignedDist).slice(0, 20));
    }
  }, [user, scope]);

  // Dynamic jurisdictional hubs for the authorized district
  const jurisdictionalHubs = useMemo(() => {
    const dObj = MOCK_DISTRICTS.find(
      (d) => d.name.toLowerCase() === district.toLowerCase() || d.id === scope?.districtId
    );
    const locs = dObj ? INITIAL_LOCALITIES.filter((l: any) => l.districtId === dObj.id) : [];

    const teachers = mockStore.getTeachers(district);
    const libraries = mockStore.getLibraries(district);
    const students = mockStore.getStudents(district);

    if (locs.length === 0) {
      return [
        {
          name: `${district} Sadar Tehsil`,
          libraries: libraries.length,
          teachers: teachers.length,
          students: students.length,
          status: 'Active Zone',
        },
      ];
    }

    return locs.map((loc: any, idx: number) => {
      const hubTeachers = teachers.filter(
        (t) => t.localityId === loc.id || ((t as any).locality && (t as any).locality.toLowerCase().includes(loc.name.toLowerCase()))
      );
      const hubLibraries = libraries.filter(
        (l) => l.localityId === loc.id || ((l as any).locality && (l as any).locality.toLowerCase().includes(loc.name.toLowerCase()))
      );
      const hubStudents = students.filter(
        (s) => s.localityId === loc.id || ((s as any).locality && (s as any).locality.toLowerCase().includes(loc.name.toLowerCase()))
      );

      let status = 'Standard Coverage';
      if (idx === 0) status = 'Primary Zone';
      else if (hubLibraries.length > 0) status = 'Active Study Hub';
      else if (hubTeachers.length > 0) status = 'Tuition Focused';

      return {
        name: loc.name,
        libraries: hubLibraries.length,
        teachers: hubTeachers.length,
        students: hubStudents.length,
        status,
      };
    });
  }, [district, scope]);

  // Profile Photo Upload Handlers
  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file (JPEG, PNG, WebP)', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size must be less than 10MB', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPhotoUploading(true);
    try {
      // Compress to quota-safe 400x400 WebP/JPEG data URL (~25KB)
      const compressedDataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
      const success = await updateUserProfile({
        avatarUrl: compressedDataUrl,
        avatar: compressedDataUrl,
      });

      if (success) {
        // Redundantly cache to dedicated District Admin key
        try {
          localStorage.setItem('fp_district_admin_avatar', compressedDataUrl);
          if (user?.id) localStorage.setItem(`fp_user_avatar_${user.id}`, compressedDataUrl);
        } catch {}

        mockStore.logAudit({
          id: `aud-${Date.now()}`,
          action: 'UPDATE_DISTRICT_ADMIN_PHOTO',
          details: `Updated official profile photo for District Admin ${formData.name}`,
          district: formData.district,
          timestamp: new Date().toISOString(),
          adminRole: 'DISTRICT_ADMIN',
        });

        addToast('District Admin profile photo updated & universally synchronized!', 'success');
      } else {
        addToast('Failed to update profile photo', 'error');
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      addToast('Failed to compress and save photo', 'error');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    try {
      await updateUserProfile({ avatarUrl: '', avatar: '' });
      try {
        localStorage.removeItem('fp_district_admin_avatar');
        if (user?.id) localStorage.removeItem(`fp_user_avatar_${user.id}`);
      } catch {}
      addToast('Profile photo removed', 'info');
    } catch (err) {
      addToast('Failed to remove photo', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await updateUserProfile({
        ...formData,
        name: formData.name,
        mobile: formData.mobile,
        phone: formData.mobile,
        designation: formData.designation,
        address: formData.officeAddress,
      } as any);

      if (success) {
        // Update commission config in store
        mockStore.updateCommissionConfig(formData.district, {
          defaultLibraryCommissionRate: Number(commissionConfig.defaultLibraryCommissionRate),
          defaultTuitionCommissionRate: Number(commissionConfig.defaultTuitionCommissionRate),
        });

        mockStore.logAudit({
          id: `aud-${Date.now()}`,
          action: 'UPDATE_DISTRICT_ADMIN_PROFILE',
          details: `Updated administrative profile credentials, office address, and commission policies for ${formData.district}`,
          district: formData.district,
          timestamp: new Date().toISOString(),
          adminRole: 'DISTRICT_ADMIN',
        });

        setAuditLogs(mockStore.getAuditLogs(formData.district).slice(0, 20));
        addToast('District Admin Profile & Settings successfully saved!', 'success');
      } else {
        addToast('Failed to save profile changes', 'error');
      }
    } catch (err) {
      addToast('Error saving profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8 max-w-5xl mx-auto">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to view the administrative profile for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="District Administrator Profile"
        subtitle="Manage official identity credentials, jurisdiction authority, commission rules, and audit logs"
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Profile & Settings' }
        ]}
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
          </div>
        }
      />

      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Hero Authority Banner with Profile Photo Upload */}
      <div className="bg-gradient-to-r from-royal-blue-950 via-deep-navy-900 to-royal-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Interactive Camera Trigger */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white/20 p-1 bg-white/10 backdrop-blur-md overflow-hidden flex items-center justify-center">
              <UserAvatar user={user} size="2xl" showBorder={false} />
            </div>

            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={photoUploading}
              className="absolute inset-0 rounded-full bg-slate-950/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer backdrop-blur-xs"
              title="Click to change photo"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Change</span>
            </button>

            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={photoUploading}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-royal-blue-600 text-white shadow-lg hover:bg-royal-blue-500 transition-colors border-2 border-slate-900 cursor-pointer"
              title="Upload new photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Identity Credentials */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sole Authorized District Regulatory Officer
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-royal-blue-200 border border-white/15">
                {formData.district} District Jurisdiction
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{formData.name}</h2>
            <p className="text-sm text-royal-blue-200 flex items-center justify-center sm:justify-start gap-2">
              <Briefcase className="w-4 h-4" />
              {formData.designation}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhotoClick}
                disabled={photoUploading}
                icon={<Camera className="w-3.5 h-3.5" />}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
              >
                {photoUploading ? 'Optimizing...' : 'Update Photo'}
              </Button>
              {user?.avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={photoUploading}
                  icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                  className="text-rose-200 hover:text-rose-100 hover:bg-rose-500/20 text-xs"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'PROFILE'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Administrative Profile
        </button>
        <button
          onClick={() => setActiveTab('JURISDICTION')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'JURISDICTION'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Jurisdiction & Blocks
        </button>
        <button
          onClick={() => setActiveTab('COMMISSION')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'COMMISSION'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          Commission & Offers
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alert Reminders
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'AUDIT'
              ? 'border-royal-blue-600 text-royal-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Activity Audit Trail
        </button>
      </div>

      {/* Tab 1: Profile Details Form */}
      {activeTab === 'PROFILE' && (
        <Card className="p-6 sm:p-8 space-y-6 border border-slate-200">
          {/* Official Administrative Identity Ledger (Section #26) */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black tracking-wide uppercase text-slate-200">
                  Official Administrative Credentials & Scope
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {user?.accountStatus || 'ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanent User ID</span>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {user?.userId || user?.id || 'FP-DA-UP-GHA-001'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">District Admin ID</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {user?.id || 'da-ghazipur-01'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorized Role</span>
                <span className="font-bold text-white">DISTRICT_ADMIN</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Status</span>
                <span className="font-bold text-emerald-400">{user?.accountStatus || 'ACTIVE'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned State</span>
                <span className="font-bold text-slate-200">{user?.stateName || user?.state || 'Uttar Pradesh'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned District</span>
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  {user?.districtName || user?.district || 'Ghazipur'} (Locked)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assignment Date</span>
                <span className="text-slate-300">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '15 Jan 2026'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Active Session</span>
                <span className="text-slate-300">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Manoj Rai"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Official Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="district.admin@focuspoint.internal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Official Mobile (WhatsApp)
                </label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Alternate Phone / Landline
                </label>
                <Input
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  placeholder="e.g. 0548-222014"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Assigned District
                </label>
                <Input
                  value={formData.district}
                  disabled
                  className="bg-slate-100 font-bold text-slate-600 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Assigned by Super Admin under 1-Admin-Per-District Policy.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Official Designation
                </label>
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Chief District Regulatory Administrator"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Official Nodal Office Address
              </label>
              <textarea
                rows={2}
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
                placeholder="Enter complete office address..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Emergency Contact Authority
                </label>
                <Input
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g. District Collectorate Office"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Emergency Helpline Phone
                </label>
                <Input
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="e.g. 0548-222014"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Administrative Statement & Public Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
                placeholder="Official mandate statement..."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                icon={<Save className="w-4 h-4" />}
                className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold"
              >
                {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Jurisdiction & Localities */}
      {activeTab === 'JURISDICTION' && (
        <Card className="p-6 sm:p-8 space-y-6 border border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">District Jurisdictional Tehsils & Hubs</h3>
            <p className="text-xs text-slate-500">
              Administrative coverage zones under the {formData.district} District Regulatory Authority
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {jurisdictionalHubs.map((hub: any) => (
              <div key={hub.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{hub.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-royal-blue-50 text-royal-blue-700 border border-royal-blue-200">
                    {hub.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                  <p>Study Libraries: <strong className="text-slate-900 font-semibold">{hub.libraries}</strong></p>
                  <p>Approved Tutors: <strong className="text-slate-900 font-semibold">{hub.teachers}</strong></p>
                  <p>Enrolled Students: <strong className="text-slate-900 font-semibold">{hub.students}</strong></p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              District Admin has full inspection rights to conduct surprise audits on library seat occupancy, safety clearances, and in-person home tuition logs across all tehsils in {formData.district}.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 3: Commission & Offer Policy Manager */}
      {activeTab === 'COMMISSION' && (
        <div className="space-y-6">
          <CommissionOfferPolicyManager
            initialDistrict={formData.district || district}
            isSuperAdminView={false}
          />
        </div>
      )}

      {/* Tab 4: Alert Reminders & Notification Settings */}
      {activeTab === 'NOTIFICATIONS' && (
        <Card className="p-6 sm:p-8 space-y-6 border border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Automated Reminders & Push Triggers</h3>
            <p className="text-xs text-slate-500">
              Manage automated notice scheduling for pending fees, teacher payouts, and emergency broadcasts
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">1-Day Advance Scheduled Payment Reminders</p>
                <p className="text-[11px] text-slate-500">Send automatic SMS/WhatsApp notice 24 hours prior to 30th-of-month teacher payouts</p>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.paymentReminderAdvanceDays === 1}
                onChange={(e) => setNotifSettings({ ...notifSettings, paymentReminderAdvanceDays: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 rounded text-royal-blue-600 focus:ring-royal-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Urgent Weather & Circular Sound Alerts</p>
                <p className="text-[11px] text-slate-500">Trigger high-priority audio chime and sticky banner on Super Admin urgent alerts</p>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.urgentCircularPush}
                onChange={(e) => setNotifSettings({ ...notifSettings, urgentCircularPush: e.target.checked })}
                className="w-5 h-5 rounded text-royal-blue-600 focus:ring-royal-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Audit Trail Immutable Recording</p>
                <p className="text-[11px] text-slate-500">Enforce continuous event logging for all manual approvals, seat bookings, and fee modifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.auditTrailLogging}
                disabled
                className="w-5 h-5 rounded text-emerald-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button
              variant="primary"
              onClick={() => addToast('Notification reminder preferences updated', 'success')}
              className="font-bold"
            >
              Save Notification Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 5: Activity Audit Trail */}
      {activeTab === 'AUDIT' && (
        <Card className="p-6 sm:p-8 space-y-6 border border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Administrative Audit Log</h3>
            <p className="text-xs text-slate-500">
              Chronological log of administrative actions, fee edits, inspections, and status overrides in {formData.district}
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent audit log records found.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <p className="text-slate-600">{log.details}</p>
                    <span className="text-[10px] text-slate-400">
                      Operator: {log.adminName || user?.name || `District Admin (${formData.district})`} • {log.district || formData.district} Desk
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
