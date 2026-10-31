import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { Teacher } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  User,
  BookOpen,
  GraduationCap,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Award,
  Camera,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  Upload,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { LocationHierarchySelection } from '../../types/location';

const ALL_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Computer Science',
  'Social Studies',
  'Commerce / Accounts',
  'Sanskrit'
];

const ALL_CLASSES = [
  'Class 1 - 5 (Primary)',
  'Class 6 - 8 (Middle)',
  'Class 9 - 10 (Secondary / Board)',
  'Class 11 - 12 (Higher Secondary)',
  'Competitive Foundation (NEET/JEE)'
];

const TEACHING_MODES = [
  'In-Person (Home Tutoring)',
  'Live Online (1-on-1)',
  'Small Group (Batch)',
  'Institute / Library Visit'
];

export const TeacherProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    qualification: '',
    university: '',
    experienceYears: 0,
    bio: '',
    monthlyFee: 0,
    hourlyRate: 0,
    countryId: 'loc-country-in',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    district: 'Ghazipur',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    localityId: 'loc-gzp-saidpur',
    localityName: 'Saidpur',
    areaId: 'loc-area-pankaj-talkies',
    areaName: 'Pankaj Talkies Area',
    subjects: [] as string[],
    classes: [] as string[],
    teachingModes: [] as string[],
  });

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await teacherService.getProfile(user.id);
      if (data) {
        setTeacher(data);
        setFormData({
          name: data.name || user.name || '',
          phone: data.phone || user.phone || '',
          qualification: data.qualification || '',
          university: data.university || '',
          experienceYears: data.experienceYears ?? 0,
          bio: data.bio || '',
          monthlyFee: data.monthlyFee ?? 0,
          hourlyRate: data.hourlyRate ?? 0,
          countryId: (data as any).countryId || 'loc-country-in',
          stateId: (data as any).stateId || 'loc-state-up',
          stateName: (data as any).stateName || 'Uttar Pradesh',
          district: data.district || 'Ghazipur',
          districtId: data.districtId || 'dist-gzp',
          districtName: data.districtName || data.district || 'Ghazipur',
          localityId: (data as any).localityId || 'loc-gzp-saidpur',
          localityName: (data as any).localityName || 'Saidpur',
          areaId: (data as any).areaId || 'loc-area-pankaj-talkies',
          areaName: (data as any).areaName || 'Pankaj Talkies Area',
          subjects: data.subjects || [],
          classes: data.classes || [],
          teachingModes: data.teachingModes || ['In-Person (Home Tutoring)'],
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewPhoto(reader.result as string);
      setShowPhotoModal(true);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-picked
    e.target.value = '';
  };

  const handleConfirmPhoto = async () => {
    if (!previewPhoto || !teacher) return;
    setPhotoUploading(true);
    try {
      await teacherService.uploadProfilePhoto(teacher.id, previewPhoto);
      await refreshUser();
      await loadProfile();
      setShowPhotoModal(false);
      setPreviewPhoto(null);
      addToast('Profile photo updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to save profile photo', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!teacher) return;
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setPhotoUploading(true);
    try {
      await teacherService.uploadProfilePhoto(teacher.id, '');
      await refreshUser();
      await loadProfile();
      addToast('Profile photo removed. Showing your initials.', 'info');
    } catch (err) {
      addToast('Failed to remove photo', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const toggleSubject = (subj: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subj)
        ? prev.subjects.filter(s => s !== subj)
        : [...prev.subjects, subj]
    }));
  };

  const toggleClass = (cls: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls]
    }));
  };

  const toggleTeachingMode = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      teachingModes: prev.teachingModes.includes(mode)
        ? prev.teachingModes.filter(m => m !== mode)
        : [...prev.teachingModes, mode]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setSaving(true);
    try {
      const updated = await teacherService.updateProfile(teacher.id, formData);
      setTeacher(updated);
      setIsEditing(false);
      await refreshUser();
      addToast('Teacher profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeAvatarUrl = teacher?.avatarUrl || user?.avatarUrl;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teacher Profile & Verification"
        subtitle="Manage your public educator card, verified contact points, credentials, and teaching preferences"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Profile' }
        ]}
        actions={
          !isEditing ? (
            <Button variant="primary" icon={<Edit2 className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
          ) : (
            <Button variant="outline" icon={<X className="w-4 h-4" />} onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )
        }
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Header Profile Hero Card */}
      <Card className="p-6 bg-gradient-to-r from-deep-navy-900 via-royal-blue-900 to-indigo-950 text-white relative overflow-hidden border-0 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Interactive Action Buttons */}
          <div className="relative group shrink-0">
            <div className="relative p-1 rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl">
              <UserAvatar
                user={{ name: teacher?.name || user?.name, avatarUrl: activeAvatarUrl }}
                size="2xl"
                shape="rounded"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                title="Upload new photo"
                className="absolute bottom-2 right-2 p-2.5 rounded-xl bg-royal-blue-600 text-white hover:bg-royal-blue-500 shadow-lg transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            {activeAvatarUrl && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoUploading}
                  className="text-xs text-rose-300 hover:text-rose-100 flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Profile Overview */}
          <div className="text-center md:text-left space-y-2.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {teacher?.name || user?.name || 'Educator Profile'}
              </h2>
              <div>
                <StatusBadge
                  status={
                    teacher?.verificationStatus === 'APPROVED' ? 'verified' :
                    teacher?.verificationStatus === 'REJECTED' ? 'rejected' : 'pending'
                  }
                  text={
                    teacher?.verificationStatus === 'APPROVED' ? 'District Verified' :
                    teacher?.verificationStatus === 'REJECTED' ? 'Verification Rejected' : 'Verification Under Review'
                  }
                />
              </div>
            </div>

            <p className="text-royal-blue-200 text-sm flex items-center justify-center md:justify-start gap-2">
              <GraduationCap className="w-4 h-4 text-royal-blue-300" />
              <span>
                {teacher?.qualification || 'Qualification Not Specified'}
                {teacher?.university ? ` • ${teacher.university}` : ''}
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-royal-blue-200/90 pt-1">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {[(teacher as any)?.areaName, (teacher as any)?.localityName, teacher?.district, (teacher as any)?.stateName].filter(Boolean).join(', ') || 'Ghazipur, UP'}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                {teacher?.experienceYears ?? 0} Years Experience
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                ₹{teacher?.hourlyRate ?? 0}/hr Demo • ₹{teacher?.monthlyFee ?? 0}/mo
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {teacher?.totalReviews && teacher.totalReviews > 0 ? (
                  <>
                    <RatingStars rating={teacher.rating || 5} max={1} size="sm" />
                    <span>{teacher.rating?.toFixed(1)} ({teacher.totalReviews} reviews)</span>
                  </>
                ) : (
                  <span className="text-amber-200">New Teacher (0 Reviews)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Verified Contact Points Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-royal-blue-50 text-royal-blue-600 flex items-center justify-center shrink-0 border border-royal-blue-100">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
              {teacher?.phone || user?.phone || 'Not provided'}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">Verified for parent calls</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered Email</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
              {teacher?.email || user?.email || 'Not provided'}
            </p>
            <p className="text-[11px] text-indigo-600 font-medium">ZYZU'S System Account</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operating District</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
              {teacher?.district || 'Ghazipur'} District
            </p>
            <p className="text-[11px] text-amber-700 font-medium">{(teacher as any)?.stateName || 'Uttar Pradesh'}</p>
          </div>
        </Card>
      </div>

      {/* Main Profile Form */}
      <Card className="p-6 border border-slate-200">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Personal Info */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-royal-blue-600" /> Personal & Public Information
              </h3>
              {!isEditing && (
                <span className="text-xs text-slate-400">Click "Edit Details" above to change</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Direct Phone / WhatsApp Number"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                required
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Professional Bio / Teacher Introduction
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your teaching style, pedagogy, student success stories, and specialized domains..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-royal-blue-500 focus:border-royal-blue-500 disabled:bg-slate-50 disabled:text-slate-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Credentials */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-royal-blue-600" /> Academic Credentials & Experience
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Highest Degree / Qualification"
                disabled={!isEditing}
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. M.Sc. Mathematics, B.Ed"
                required
              />
              <Input
                label="College / Alma Mater"
                disabled={!isEditing}
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="e.g. Banaras Hindu University"
              />
              <Input
                label="Years of Active Teaching"
                type="number"
                min="0"
                max="50"
                disabled={!isEditing}
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Section 3: Fee Expectations & District */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <IndianRupee className="w-5 h-5 text-royal-blue-600" /> Fee Structure & Regional District
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Expected Monthly Fee per Student (₹)"
                type="number"
                min="0"
                step="100"
                disabled={!isEditing}
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
              />
              <Input
                label="Per Hour / Demo Session Fee (₹)"
                type="number"
                min="0"
                step="50"
                disabled={!isEditing}
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Operational Base & Service Jurisdiction
              </label>
              <CascadingLocationSelector
                value={{
                  countryId: formData.countryId,
                  stateId: formData.stateId,
                  stateName: formData.stateName,
                  districtId: formData.districtId,
                  districtName: formData.districtName,
                  localityId: formData.localityId,
                  localityName: formData.localityName,
                  areaId: formData.areaId,
                  areaName: formData.areaName,
                }}
                onChange={(val) => {
                  setFormData(prev => ({
                    ...prev,
                    countryId: val.countryId || '',
                    stateId: val.stateId || '',
                    stateName: val.stateName || '',
                    districtId: val.districtId || '',
                    districtName: val.districtName || '',
                    district: val.districtName || prev.district,
                    localityId: val.localityId || '',
                    localityName: val.localityName || '',
                    areaId: val.areaId || '',
                    areaName: val.areaName || '',
                  }));
                }}
                disabled={!isEditing}
                required
                showLabels
                layout="stacked"
              />
            </div>
          </div>

          {/* Section 4: Teaching Subjects & Classes */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-royal-blue-600" /> Teaching Specializations & Target Grades
            </h3>

            {/* Subjects Selection */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Teaching Subjects ({formData.subjects.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SUBJECTS.map(subj => {
                  const selected = formData.subjects.includes(subj);
                  return (
                    <button
                      type="button"
                      key={subj}
                      disabled={!isEditing}
                      onClick={() => toggleSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-royal-blue-600 text-white border-royal-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:hover:bg-slate-50'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {subj}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Classes / Grades Selection */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Target Classes / Grades ({formData.classes.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CLASSES.map(cls => {
                  const selected = formData.classes.includes(cls);
                  return (
                    <button
                      type="button"
                      key={cls}
                      disabled={!isEditing}
                      onClick={() => toggleClass(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:hover:bg-slate-50'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teaching Modes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Delivery Modes ({formData.teachingModes.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {TEACHING_MODES.map(mode => {
                  const selected = formData.teachingModes.includes(mode);
                  return (
                    <button
                      type="button"
                      key={mode}
                      disabled={!isEditing}
                      onClick={() => toggleTeachingMode(mode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:hover:bg-slate-50'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Photo Preview Modal */}
      {showPhotoModal && previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl border-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-royal-blue-600" /> Confirm Profile Photo
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This photo will be displayed across your educator profile, parent booking requests, and student dashboard.
            </p>

            <div className="flex justify-center my-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-royal-blue-500/30 shadow-xl bg-slate-100">
                <img
                  src={previewPhoto}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={photoUploading}
                onClick={() => {
                  setShowPhotoModal(false);
                  setPreviewPhoto(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={photoUploading}
                onClick={handleConfirmPhoto}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Apply Photo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
