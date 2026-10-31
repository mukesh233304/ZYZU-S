import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Library, TeacherDocumentItem } from '../../types';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { LocationHierarchySelection } from '../../types/location';
import { 
  Building, MapPin, Clock, Armchair, Sparkles, 
  ShieldCheck, AlertCircle, Edit, Plus, Wifi, Wind, Shield, CheckCircle2, 
  Image as ImageIcon, FileText, Upload, AlertTriangle, RefreshCw, Trash2, Camera
} from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

export const LibraryListing: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const ownerId = user?.id || '';

  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDistrict, setEditDistrict] = useState('Ghazipur');
  const [editArea, setEditArea] = useState('Saidpur');
  const [editLocation, setEditLocation] = useState<LocationHierarchySelection>({
    countryId: 'loc-country-in',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    localityId: 'loc-gzp-saidpur',
    localityName: 'Saidpur',
    areaId: 'loc-area-pankaj-talkies',
    areaName: 'Pankaj Talkies Area',
  });
  const [editAddress, setEditAddress] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editTimings, setEditTimings] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // KYC Upload State
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  const loadLibraries = async () => {
    if (!ownerId) return;
    try {
      const data = await libraryService.getLibrariesByOwner(ownerId);
      setLibraries(data);
      if (data.length > 0) {
        const lib = data[0];
        setEditName(lib.name);
        setEditDistrict(lib.districtName || lib.district || 'Ghazipur');
        setEditArea(lib.localityName || lib.area || 'Saidpur');
        setEditLocation({
          countryId: lib.countryId || 'loc-country-in',
          stateId: lib.stateId || 'loc-state-up',
          stateName: lib.stateName || 'Uttar Pradesh',
          districtId: lib.districtId || 'dist-gzp',
          districtName: lib.districtName || lib.district || 'Ghazipur',
          localityId: lib.localityId || 'loc-gzp-saidpur',
          localityName: lib.localityName || lib.city || lib.area || 'Saidpur',
          areaId: lib.areaId || 'loc-area-pankaj-talkies',
          areaName: lib.areaName || lib.area || 'Pankaj Talkies Area',
        });
        setEditAddress(lib.address);
        setEditPincode(lib.pincode || '');
        setEditTimings(lib.timings || '06:00 AM – 11:00 PM');
      }
    } catch (e) {
      console.error('Failed to load library listing', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraries();
  }, [ownerId]);

  const library = libraries[0] || null;

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;
    setSavingEdit(true);
    try {
      await libraryService.updateLibraryListing(library.id, {
        name: editName.trim(),
        countryId: editLocation.countryId,
        stateId: editLocation.stateId,
        stateName: editLocation.stateName,
        districtId: editLocation.districtId,
        districtName: editLocation.districtName,
        district: editLocation.districtName || editDistrict,
        localityId: editLocation.localityId,
        localityName: editLocation.localityName,
        areaId: editLocation.areaId,
        areaName: editLocation.areaName,
        area: editLocation.localityName || editArea.trim(),
        address: editAddress.trim(),
        pincode: editPincode.trim(),
        timings: editTimings.trim(),
      });
      setLibraries(prev => prev.map(l => l.id === library.id ? {
        ...l,
        name: editName.trim(),
        countryId: editLocation.countryId,
        stateId: editLocation.stateId,
        stateName: editLocation.stateName,
        districtId: editLocation.districtId,
        districtName: editLocation.districtName,
        district: editLocation.districtName || editDistrict,
        localityId: editLocation.localityId,
        localityName: editLocation.localityName,
        areaId: editLocation.areaId,
        areaName: editLocation.areaName,
        area: editLocation.localityName || editArea.trim(),
        address: editAddress.trim(),
        pincode: editPincode.trim(),
        timings: editTimings.trim(),
      } : l));
      setIsEditModalOpen(false);
      addToast('Library premises profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update library details', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFileUpload = async (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !library) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('File size exceeds 10MB limit. Please upload a smaller document.', 'error');
      return;
    }

    setUploadingCategory(category);
    try {
      const docItem: TeacherDocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: category,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'UNDER_REVIEW',
      };

      await libraryService.uploadPremisesKyc(library.id, category, docItem);
      
      setLibraries(prev => prev.map(l => {
        if (l.id === library.id) {
          return {
            ...l,
            premisesKyc: {
              ...(l.premisesKyc || {}),
              [category]: docItem
            }
          };
        }
        return l;
      }));

      addToast(`Uploaded ${file.name} for verification! District Admin will review shortly.`, 'success');
    } catch (err) {
      addToast('Failed to upload premises document', 'error');
    } finally {
      setUploadingCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <PageHeader
          title="Library Listing & Verification"
          subtitle="Premises configuration and accreditation status"
          breadcrumbs={[{ label: 'Library Owner', href: '/library-owner' }, { label: 'Listing' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You currently have no listed library. Complete the registration wizard to configure your desk capacity, shifts, and submit premises documents for District Admin accreditation.
          </p>
          <div className="mt-6">
            <Link to="/library-owner/create">
              <Button variant="primary">List Your Library Now</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isApproved = (library.verificationStatus || '').toUpperCase() === 'APPROVED';
  const kycDocs = library.premisesKyc || {};

  const kycCategories = [
    {
      key: 'electricityBill',
      title: 'Commercial Electricity Bill / Property Tax Receipt',
      description: 'Recent 3-month power bill or municipal receipt confirming commercial study hall location.',
      required: true,
    },
    {
      key: 'tradeLicense',
      title: 'Trade License / Shop Act / Udyam MSME Registration',
      description: 'Business proof or municipal certificate validating commercial operation of study facilities.',
      required: true,
    },
    {
      key: 'fireSafetyNoc',
      title: 'Fire Safety NOC / Safety Self-Declaration',
      description: 'Fire extinguisher placement compliance and emergency exit accessibility certification.',
      required: false,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Library Listing & Verification Status"
        subtitle="Manage your public study space profile, view district accreditation status, and upload premises KYC"
        breadcrumbs={[
          { label: 'Library Owner', href: '/library-owner' },
          { label: 'Library Listing' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Premises Info
            </Button>
            <Link to={`/library/${library.id}`} target="_blank">
              <Button size="sm" icon={<Building className="w-4 h-4" />}>
                View Public Page
              </Button>
            </Link>
          </div>
        }
      />

      {/* Approval Status Banner */}
      <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        isApproved
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isApproved ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Listing Status: {isApproved ? 'APPROVED & ACCREDITED' : 'UNDER DISTRICT REVIEW'}
              </span>
              <StatusBadge status={isApproved ? 'APPROVED' : 'PENDING'} />
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {isApproved 
                ? "Your study library is live on the ZYZU'S public marketplace. Students across your district can find and book seats."
                : 'Your registration and premises documents are currently being inspected by the Ghazipur District Administrator.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/library-owner/seats">
            <Button size="sm" variant="outline" icon={<Armchair className="w-4 h-4" />}>
              Visual Desk Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Verified Facility Administrator & Owner Identity */}
      <div className="rounded-2xl p-4 bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/library-owner/profile" className="shrink-0 group" title="View & Edit Owner Profile">
            <UserAvatar user={user} size="lg" shape="rounded" showBorder />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900">{user?.name || library.ownerName || 'Verified Facility Owner'}</h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Operating Head
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Center Contact: +91 {user?.mobile || library.ownerPhone || '9876543212'} • District Partner: {user?.districtName || library.district}
            </p>
          </div>
        </div>
        <Link to="/library-owner/profile">
          <Button variant="outline" size="sm" icon={<Camera className="w-3.5 h-3.5 text-royal-blue-600" />}>
            Manage Owner Photo
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Configured Desks"
          value={library.totalSeats || 0}
          change="Physical seating capacity"
          isPositive={true}
          icon={<Armchair className="w-6 h-6 text-royal-blue-600" />}
        />
        <StatCard
          title="Available Seats"
          value={library.availableSeats || 0}
          change="Open for immediate booking"
          isPositive={(library.availableSeats || 0) > 0}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Daily Shifts"
          value={library.shifts?.length || 0}
          change="Configured time slots"
          isPositive={true}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
        />
        <StatCard
          title="Base Monthly Fee"
          value={`₹${library.monthlyStartingPrice || library.monthlyFee || 800}`}
          change="Starting desk plan"
          isPositive={true}
          icon={<Sparkles className="w-6 h-6 text-purple-600" />}
        />
      </div>

      {/* Premises Details & Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-royal-blue-600" /> Study Space Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Library Commercial Name</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{library.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Jurisdiction / Location</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {[library.areaName || library.area, library.localityName || library.city, library.districtName || library.district, library.stateName].filter(Boolean).join(', ') || 'Uttar Pradesh'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Premises Address</span>
                <p className="font-medium text-slate-800 text-sm mt-0.5">{library.address}, {library.area} (PIN: {library.pincode || '233304'})</p>
              </div>
              <div>
                <span className="text-slate-500">Operating Timings</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{library.timings || '06:00 AM – 11:00 PM'}</p>
              </div>
              <div>
                <span className="text-slate-500">Registered Owner</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{library.ownerName || user?.name}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Amenities Provided</span>
              <div className="flex flex-wrap gap-2">
                {library.facilities.map((fac, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {fac}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Premises KYC Verification System */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Premises KYC & Safety Compliance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded documents are verified by District Administration before issuing public accreditation.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                PDF, JPG, PNG (Max 5MB)
              </span>
            </div>

            <div className="space-y-4">
              {kycCategories.map(cat => {
                const doc = kycDocs[cat.key];
                const isUploading = uploadingCategory === cat.key;
                const status = (doc?.status || 'NOT_UPLOADED').toUpperCase();

                return (
                  <div key={cat.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{cat.title}</h4>
                          {cat.required && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <StatusBadge status={status} />
                        
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => handleFileUpload(cat.key, e)}
                            disabled={isUploading}
                          />
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                            {isUploading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-royal-blue-600" /> Uploading...
                              </>
                            ) : doc ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Replace
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-royal-blue-600" /> Upload
                              </>
                            )}
                          </span>
                        </label>
                      </div>
                    </div>

                    {doc && (
                      <div className="text-xs flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-600">
                        <span className="font-mono truncate max-w-xs">{doc.name} ({doc.fileSize})</span>
                        <span className="text-slate-400">Uploaded {doc.uploadedAt}</span>
                      </div>
                    )}

                    {status === 'REJECTED' && doc?.rejectionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">District Admin Remark: </span>
                          <span>{doc.rejectionReason}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Shift Structure */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Shift Configuration</h3>
              <Link to="/library-owner/shifts" className="text-xs font-semibold text-royal-blue-600 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {(library.shifts || []).map(s => (
                <div key={s.id || s.name} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.name}</span>
                    <span className="text-xs font-bold text-emerald-600">₹{s.price || s.monthlyPrice || 800}/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {s.startTime} – {s.endTime}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Listing Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Library Premises Information"
        size="md"
      >
        <form onSubmit={handleSaveListing} className="space-y-4">
          <Input
            label="Library Name *"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <CascadingLocationSelector
            value={editLocation}
            onChange={(val) => {
              setEditLocation(val);
              setEditDistrict(val.districtName || '');
              setEditArea(val.localityName || val.areaName || '');
            }}
            required
            showLabels
            layout="stacked"
          />

          <Input
            label="Full Physical Address *"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PIN Code *"
              value={editPincode}
              onChange={(e) => setEditPincode(e.target.value)}
              required
            />
            <Input
              label="Operating Timings *"
              value={editTimings}
              placeholder="e.g. 06:00 AM – 11:00 PM"
              onChange={(e) => setEditTimings(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingEdit}>
              Save Premises Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
