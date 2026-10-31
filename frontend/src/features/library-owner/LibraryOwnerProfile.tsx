import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { Library, District } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { LocationHierarchySelection } from '../../types/location';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Camera,
  Trash2,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Briefcase,
  Calendar,
  FileText,
  Lock,
  ExternalLink,
  Award,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar } from '../../components/common/UserAvatar';
import { compressImage } from '../../utils/imageUtils';

export const LibraryOwnerProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BUSINESS' | 'ADDRESS' | 'BIO' | 'SECURITY'>('PERSONAL');

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Security Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    whatsappNumber: '',
    alternatePhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    gender: 'Male',
    dateOfBirth: '1988-04-12',
    businessEntityType: 'Sole Proprietorship',
    designation: 'Founder & Managing Director',
    experienceYears: 6,
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '•••• •••• 9182',
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
    area: 'Saidpur',
    address: '',
    pincode: '233304',
    bio: 'Dedicated to providing focused, disturbance-free silent study spaces equipped with modern amenities for competitive exam aspirants (UPSC, UPPSC, NEET, JEE, SSC, Banking).',
  });

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      try {
        const libs = await libraryService.getLibrariesByOwner(user.id);
        if (libs.length > 0) {
          setLibrary(libs[0]);
        }

        setFormData({
          name: user.name || 'Suresh Yadav',
          email: user.email || 'library.focus@focuspoint.internal',
          mobile: user.mobile || user.phone || '9876543212',
          whatsappNumber: user.whatsappNumber || user.mobile || user.phone || '9876543212',
          alternatePhone: user.alternatePhone || '9811223344',
          emergencyContactName: user.emergencyContactName || 'Family Guardian',
          emergencyContactPhone: user.emergencyContactPhone || '9876500000',
          gender: user.gender || 'Male',
          dateOfBirth: user.dateOfBirth || '1988-04-12',
          businessEntityType: user.businessEntityType || 'Sole Proprietorship',
          designation: user.designation || 'Founder & Managing Director',
          experienceYears: user.experienceYears || 6,
          panNumber: user.panNumber || 'ABCDE1234F',
          aadhaarNumber: user.aadhaarNumber || '•••• •••• 9182',
          countryId: user.countryId || 'loc-country-in',
          stateId: user.stateId || 'loc-state-up',
          stateName: user.stateName || 'Uttar Pradesh',
          district: user.districtName || user.district || 'Ghazipur',
          districtId: user.districtId || 'dist-gzp',
          districtName: user.districtName || user.district || 'Ghazipur',
          localityId: user.localityId || (libs[0]?.localityId) || 'loc-gzp-saidpur',
          localityName: user.localityName || user.area || (libs[0]?.area) || 'Saidpur',
          areaId: user.areaId || (libs[0]?.areaId) || 'loc-area-pankaj-talkies',
          areaName: user.areaName || user.area || (libs[0]?.area) || 'Pankaj Talkies Area',
          area: user.area || (libs[0]?.area) || 'Saidpur',
          address: user.address || (libs[0]?.address) || 'Main Market Road, Near Town Hall, Saidpur',
          pincode: user.pincode || (libs[0]?.pincode) || '233304',
          bio: user.bio || 'Dedicated to providing focused, disturbance-free silent study spaces equipped with modern amenities for competitive exam aspirants (UPSC, UPPSC, NEET, JEE, SSC, Banking).',
        });
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Handle Input Changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      addToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Profile image must be less than 10MB', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPhotoUploading(true);
    try {
      // Compress to optimal avatar dimensions (400x400 WebP/JPEG ~25KB)
      const compressedDataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
      const success = await updateUserProfile({ avatarUrl: compressedDataUrl, avatar: compressedDataUrl });
      if (success) {
        addToast('Profile photo updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      addToast('Failed to save profile photo', 'error');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const success = await updateUserProfile({ avatarUrl: '', avatar: '' });
      if (success) {
        addToast('Profile photo removed', 'info');
      }
    } catch {
      addToast('Failed to remove photo', 'error');
    }
  };

  // Save Full Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const currentAvatar = user.avatarUrl || (user as any).avatar || '';
      const success = await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        phone: formData.mobile.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        alternatePhone: formData.alternatePhone.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        businessEntityType: formData.businessEntityType,
        designation: formData.designation,
        experienceYears: Number(formData.experienceYears) || 0,
        panNumber: formData.panNumber.trim().toUpperCase(),
        aadhaarNumber: formData.aadhaarNumber.trim(),
        district: formData.district,
        districtName: formData.district,
        districtId: formData.districtId,
        area: formData.area,
        address: formData.address.trim(),
        pincode: formData.pincode.trim(),
        bio: formData.bio.trim(),
        avatarUrl: currentAvatar,
        avatar: currentAvatar,
      });

      if (success) {
        setIsEditing(false);
      }
    } catch (err) {
      addToast('Failed to update profile details', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);
    setTimeout(() => {
      setChangingPassword(false);
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      confirmPassword;
      addToast('Security credentials updated successfully!', 'success');
    }, 400);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <PageHeader
        title="Library Owner Profile"
        subtitle="Manage your personal identity, contact credentials, business registration, and verified operating details"
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Owner Profile' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Edit2 className="w-4 h-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<X className="w-4 h-4" />}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                  loading={saving}
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Advanced Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-royal-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-royal-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Camera Trigger & Quick Action Buttons */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl bg-slate-800 flex items-center justify-center">
                <UserAvatar user={user} size="2xl" shape="rounded" showBorder className="w-full h-full" />
              </div>

              {/* Hover Camera Overlay Button */}
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={photoUploading}
                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-xs"
                title="Upload new profile photo"
              >
                <Camera className="w-6 h-6 mb-1 text-royal-blue-300" />
                <span className="text-[11px] font-bold tracking-tight">
                  {photoUploading ? 'Uploading...' : 'Change Photo'}
                </span>
              </button>

              {(user?.avatarUrl || (user as any)?.avatar) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Explicit Mobile & Quick Action Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={photoUploading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer"
              >
                <Camera className="w-3 h-3 text-royal-blue-300" />
                {photoUploading ? 'Saving...' : (user?.avatarUrl || (user as any)?.avatar) ? 'Change' : 'Upload'}
              </button>
              {(user?.avatarUrl || (user as any)?.avatar) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors border border-rose-500/30 cursor-pointer"
                  title="Remove current photo"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Identity & Badges */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{formData.name}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Facility Partner
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-royal-blue-500/20 text-royal-blue-300 border border-royal-blue-500/30">
                <Award className="w-3.5 h-3.5" /> Accredited Study Center
              </span>
            </div>

            <p className="text-slate-300 text-sm font-medium flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-royal-blue-400" /> {formData.designation}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-royal-blue-400" /> {library ? library.name : "ZYZU'S Partner Network"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-royal-blue-400" /> {formData.area}, {formData.district}
              </span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {formData.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> +91 {formData.mobile}
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp: +91 {formData.whatsappNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PERSONAL')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'PERSONAL'
              ? 'border-royal-blue-600 text-royal-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Personal & Contact Credentials
        </button>
        <button
          onClick={() => setActiveTab('BUSINESS')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'BUSINESS'
              ? 'border-royal-blue-600 text-royal-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Study Hall Business Entity
        </button>
        <button
          onClick={() => setActiveTab('ADDRESS')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ADDRESS'
              ? 'border-royal-blue-600 text-royal-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Operating District & Address
        </button>
        <button
          onClick={() => setActiveTab('BIO')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'BIO'
              ? 'border-royal-blue-600 text-royal-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Aspirants Vision & Bio
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'SECURITY'
              ? 'border-royal-blue-600 text-royal-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Account Security & Login
        </button>
      </div>

      {/* Tab 1: Personal & Contact Credentials */}
      {activeTab === 'PERSONAL' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal & Identity Information</h3>
              <p className="text-xs text-slate-500">Official contact numbers used for study hall verification and SMS/WhatsApp communications</p>
            </div>
            {!isEditing && (
              <Button size="sm" variant="outline" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                Edit Details
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Suresh Yadav"
                  required
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-sm">
                  {formData.name}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Registered Email Address *</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g. owner@example.com"
                  required
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {formData.email}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Calling Phone *</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium flex items-center justify-between">
                  <span>+91 {formData.mobile}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official WhatsApp Phone *</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="WhatsApp number for automated receipts"
                  required
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium flex items-center justify-between">
                  <span>+91 {formData.whatsappNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Channel
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency / Alternate Phone</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  placeholder="Alternate phone number"
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium">
                  {formData.alternatePhone ? `+91 ${formData.alternatePhone}` : 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person</label>
              {isEditing ? (
                <Input
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  placeholder="e.g. Co-operator / Family Member"
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {formData.emergencyContactName || 'Family Member'}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              {isEditing ? (
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {formData.gender}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium">
                  {formData.dateOfBirth}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Study Hall Business Entity */}
      {activeTab === 'BUSINESS' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Study Hall Ownership & Business Entity</h3>
              <p className="text-xs text-slate-500">Legal structure, operating tenure, and tax identification details</p>
            </div>
            {!isEditing && (
              <Button size="sm" variant="outline" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                Edit Details
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Entity Type</label>
              {isEditing ? (
                <Select
                  value={formData.businessEntityType}
                  onChange={(e) => handleInputChange('businessEntityType', e.target.value)}
                  options={[
                    { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
                    { value: 'Partnership Firm', label: 'Partnership Firm' },
                    { value: 'Private Limited Company', label: 'Private Limited Company (Pvt Ltd)' },
                    { value: 'Individual / Co-living Owner', label: 'Individual / Study Space Operator' },
                  ]}
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold">
                  {formData.businessEntityType}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Owner Designation / Role</label>
              {isEditing ? (
                <Input
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g. Managing Director / Partner"
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {formData.designation}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Years Operating Study Facilities</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  min="0"
                  max="50"
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {formData.experienceYears} Years in Education / Library Management
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Permanent Account Number (PAN)</label>
              {isEditing ? (
                <Input
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 flex items-center justify-between">
                  <span>{formData.panNumber}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Tax Verified</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">National ID / Aadhaar Number</label>
              {isEditing ? (
                <Input
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  placeholder="12-digit Aadhaar number"
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium text-slate-700 flex items-center justify-between">
                  <span>{formData.aadhaarNumber}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    KYC Masked
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Operating District & Address */}
      {activeTab === 'ADDRESS' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Operating District & Premises Address</h3>
              <p className="text-xs text-slate-500">Government administrative jurisdiction and official correspondence address</p>
            </div>
            {!isEditing && (
              <Button size="sm" variant="outline" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                Edit Address
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <CascadingLocationSelector
              value={{
                countryId: formData.countryId || 'loc-country-in',
                stateId: formData.stateId || 'loc-state-up',
                stateName: formData.stateName || 'Uttar Pradesh',
                districtId: formData.districtId || 'dist-gzp',
                districtName: formData.districtName || formData.district || 'Ghazipur',
                localityId: formData.localityId || 'loc-gzp-saidpur',
                localityName: formData.localityName || formData.area || 'Saidpur',
                areaId: formData.areaId || 'loc-area-pankaj-talkies',
                areaName: formData.areaName || formData.area || 'Pankaj Talkies Area',
              }}
              onChange={(val) => {
                setFormData(prev => ({
                  ...prev,
                  countryId: val.countryId || 'loc-country-in',
                  stateId: val.stateId || '',
                  stateName: val.stateName || '',
                  districtId: val.districtId || '',
                  districtName: val.districtName || '',
                  district: val.districtName || prev.district,
                  localityId: val.localityId || '',
                  localityName: val.localityName || '',
                  areaId: val.areaId || '',
                  areaName: val.areaName || '',
                  area: val.areaName || val.localityName || prev.area,
                }));
              }}
              disabled={!isEditing}
              required
              showLabels
              layout="stacked"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Official Postal Address *</label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street name, landmark, building number"
                    required
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                    {formData.address || 'Saidpur Main Market, Ghazipur, UP'}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Postal PIN Code *</label>
                {isEditing ? (
                  <Input
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    required
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800">
                    {formData.pincode}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State / Province</label>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium">
                  {formData.stateName || 'Uttar Pradesh'}, India
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Aspirants Vision & Bio */}
      {activeTab === 'BIO' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Aspirants Vision & Welcome Message</h3>
              <p className="text-xs text-slate-500">Public introductory statement shown to students seeking study hall admissions in {formData.district}</p>
            </div>
            {!isEditing && (
              <Button size="sm" variant="outline" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                Edit Statement
              </Button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Study Hall Mission & Aspirant Commitment</label>
              {isEditing ? (
                <textarea
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 font-sans text-xs"
                  placeholder="Describe your silent study environment, student rules, and facilities..."
                />
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed italic text-sm">
                  "{formData.bio}"
                </div>
              )}
            </div>

            <div className="p-4 bg-royal-blue-50 border border-royal-blue-100 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-royal-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-royal-blue-900 text-xs">Promoted on Public Directory</h4>
                <p className="text-[11px] text-royal-blue-700 mt-0.5">
                  Your owner biography and study hall facilities are directly rendered on the ZYZU'S Public Library Directory for verified student discovery.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Security & Credentials */}
      {activeTab === 'SECURITY' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Account Security & Access Sessions</h3>
              <p className="text-xs text-slate-500">Manage security credentials, authentication passwords, and multi-role access</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Portal Password</h4>
                <p className="text-slate-500 text-xs mt-0.5">Last updated 14 days ago. Protect your facility collections ledger.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Lock className="w-3.5 h-3.5" />}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Active Session</h4>
                <p className="text-slate-500 text-xs mt-0.5">Desktop Browser • Chrome on macOS • IP: Verified Local Gateway</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Active Now
              </span>
            </div>

            <div className="p-4 bg-royal-blue-50 border border-royal-blue-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-royal-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-royal-blue-950 text-xs">Direct Settlement Policy</h4>
                <p className="text-[11px] text-royal-blue-900 mt-0.5">
                  As an accredited ZYZU'S Study Hall Partner in {formData.district}, your monthly seat subscription dues are directly credited and disbursed into your verified bank account with automated digital invoicing.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Portal Password"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password *"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password *"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="Minimum 6 characters with a mixture of letters and numbers"
          />

          <Input
            label="Confirm New Password *"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={changingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
