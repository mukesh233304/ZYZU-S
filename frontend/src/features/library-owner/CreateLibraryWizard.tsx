import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Stepper } from '../../components/common/Stepper';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { LocationHierarchySelection } from '../../types/location';
import {
  Building2,
  MapPin,
  Sparkles,
  Clock,
  Armchair,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

const STEPS = [
  { id: 'basic', title: 'Basic Details' },
  { id: 'location', title: 'Location' },
  { id: 'facilities', title: 'Facilities' },
  { id: 'shifts', title: 'Shifts & Pricing' },
  { id: 'seats', title: 'Desk Layout' },
  { id: 'photos', title: 'Verification Docs' },
  { id: 'review', title: 'Review & Submit' }
];

export const LIBRARY_AMENITIES_LIST = [
  'Fully Air-Conditioned (AC) Study Hall',
  'High-Speed Optical Fiber Wi-Fi',
  'Reserved Personal Desks with Ergonomic Chairs',
  'Individual Power Sockets & LED Reading Lamps',
  'RO Drinking Water & Cafeteria Pantry',
  'Soundproof & Pin-drop Silence Zone',
  '24x7 CCTV Surveillance & Bio-metric Access',
  'Separate Boys & Girls Washrooms',
  'Daily Newspaper & UPSC / Competitive Magazine Stand',
  'Inverter & DG Power Backup 24 Hours',
];

export const CreateLibraryWizard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagline: 'Quiet Environment for Competitive Aspirants',
    phone: user?.phone || '',
    email: user?.email || '',
    description: '',
    address: '',
    landmark: '',
    facilities: [
      'Fully Air-Conditioned (AC) Study Hall',
      'High-Speed Optical Fiber Wi-Fi',
      'Inverter & DG Power Backup 24 Hours',
      'RO Drinking Water & Cafeteria Pantry',
      '24x7 CCTV Surveillance & Bio-metric Access',
      'Individual Power Sockets & LED Reading Lamps'
    ],
    monthlyFee: 1200,
    hourlyRate: 30,
    totalSeats: 60,
    rows: 6,
    seatsPerRow: 10,
    rules: 'Pin-drop silence required. Mobile phones on silent. Outside food not allowed in reading hall.',
    pincode: '233304',
  });

  const [locationSelection, setLocationSelection] = useState<LocationHierarchySelection>({
    countryId: 'loc-country-in',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: user?.districtId || 'dist-gzp',
    districtName: user?.district || 'Ghazipur',
    localityId: 'loc-gzp-saidpur',
    localityName: 'Saidpur',
    areaId: 'loc-area-pankaj-talkies',
    areaName: 'Pankaj Talkies Area',
    pincode: '233304',
  });

  // Photos & Documents Upload State (Req 6)
  const [photos, setPhotos] = useState<Array<{ id: string; name: string; size: string; url: string }>>([
    { id: 'p-1', name: 'hall_study_view.jpg', size: '1.8 MB', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
    { id: 'p-2', name: 'desks_matrix_ac.jpg', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' }
  ]);
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; size: string; type: string }>>([
    { id: 'd-1', name: 'Commercial_Electricity_Bill_2026.pdf', size: '2.8 MB', type: 'application/pdf' }
  ]);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const [isDraggingDocs, setIsDraggingDocs] = useState(false);

  const toggleFacility = (facility: string) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter(f => f !== facility)
          : [...prev.facilities, facility]
      };
    });
  };

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        addToast(`Skipped ${file.name}: Only JPG, PNG, WEBP images allowed`, 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast(`Skipped ${file.name}: Exceeds 5MB size limit`, 'error');
        continue;
      }
      const newPhoto = {
        id: `p-${Date.now()}-${i}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: URL.createObjectURL(file)
      };
      setPhotos(prev => [...prev, newPhoto]);
      addToast(`Added photo: ${file.name}`, 'success');
    }
  };

  const handleDocumentFiles = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValidType) {
        addToast(`Skipped ${file.name}: Only PDF, JPG, PNG allowed`, 'error');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast(`Skipped ${file.name}: Exceeds 10MB size limit`, 'error');
        continue;
      }
      const newDoc = {
        id: `d-${Date.now()}-${i}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type
      };
      setDocuments(prev => [...prev, newDoc]);
      addToast(`Added document: ${file.name}`, 'success');
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !formData.name) {
      addToast('Please enter library name', 'error');
      return;
    }
    if (currentStep === 1 && (!locationSelection.stateId || !locationSelection.districtId || !locationSelection.localityId || !formData.address)) {
      addToast('Please select State, District, Locality and enter complete street address', 'error');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await libraryService.createLibrary({
        ownerId: user.id,
        name: formData.name,
        countryId: locationSelection.countryId,
        stateId: locationSelection.stateId,
        stateName: locationSelection.stateName,
        districtId: locationSelection.districtId,
        districtName: locationSelection.districtName,
        district: locationSelection.districtName || 'Ghazipur',
        localityId: locationSelection.localityId,
        localityName: locationSelection.localityName,
        areaId: locationSelection.areaId,
        areaName: locationSelection.areaName,
        area: locationSelection.localityName || 'Saidpur',
        city: locationSelection.localityName || 'Saidpur',
        address: `${formData.address}${formData.landmark ? `, near ${formData.landmark}` : ''}`,
        pincode: formData.pincode || locationSelection.pincode || '233304',
        description: formData.description || formData.tagline,
        facilities: formData.facilities,
        totalSeats: formData.totalSeats,
        monthlyFee: formData.monthlyFee,
        hourlyRate: formData.hourlyRate,
        shifts: [
          { name: 'Morning Shift', startTime: '06:00 AM', endTime: '12:00 PM', price: Math.round(formData.monthlyFee * 0.7) },
          { name: 'Evening Shift', startTime: '12:00 PM', endTime: '06:00 PM', price: Math.round(formData.monthlyFee * 0.7) },
          { name: 'Night Shift', startTime: '06:00 PM', endTime: '11:00 PM', price: Math.round(formData.monthlyFee * 0.6) },
          { name: 'Full Day (24h)', startTime: '06:00 AM', endTime: '06:00 AM', price: formData.monthlyFee },
        ],
        verificationStatus: 'PENDING',
      });
      addToast(`Library registered for ${locationSelection.districtName || 'District'} Admin approval!`, 'success');
      navigate('/library-owner');
    } catch (err) {
      addToast('Failed to register library', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="List a New Self-Study Library"
        subtitle="Onboard your study library, configure desk matrix, and submit for District Admin verification"
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Register Library' }
        ]}
      />

      <Stepper steps={STEPS} currentStep={currentStep} />

      <Card className="p-6 md:p-8">
        {/* Step 0: Basic Details */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Building2 className="w-6 h-6 text-royal-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Basic Information</h3>
                <p className="text-xs text-slate-500">Provide official identity and contact info of the study space</p>
              </div>
            </div>

            <Input
              label="Library / Study Space Name"
              placeholder="e.g. ZYZU'S Central Self-Study Library"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Short Tagline"
              placeholder="e.g. Peaceful 24x7 AC Study Space for Competitive Aspirants"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Helpdesk Mobile Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Official Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Library Overview</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Highlight seating comfort, lighting, sound-proofing, newspapers, or test series facilities..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <MapPin className="w-6 h-6 text-royal-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Location & Territory</h3>
                <p className="text-xs text-slate-500">Pan-India hierarchical location selector for centralized routing & territory verification</p>
              </div>
            </div>

            <CascadingLocationSelector
              value={locationSelection}
              onChange={setLocationSelection}
              required
              showLabels
              layout="stacked"
            />

            <Input
              label="Complete Street Address *"
              placeholder="e.g. 2nd Floor, Verma Commercial Complex, Station Road"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nearby Landmark"
                placeholder="e.g. Opposite District Court Gate 2"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />

              <Input
                label="Postal PIN Code *"
                placeholder="e.g. 233304"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, pincode: cleaned });
                  setLocationSelection(prev => ({ ...prev, pincode: cleaned }));
                }}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Facilities */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Sparkles className="w-6 h-6 text-royal-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Amenities & Study Facilities</h3>
                <p className="text-xs text-slate-500">Check all amenities verified on-premises for competitive students</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LIBRARY_AMENITIES_LIST.map((fac: string) => {
                const checked = formData.facilities.includes(fac);
                return (
                  <button
                    type="button"
                    key={fac}
                    onClick={() => toggleFacility(fac)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      checked
                        ? 'border-royal-blue-500 bg-royal-blue-50/70 text-royal-blue-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{fac}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 ml-2 ${checked ? 'bg-royal-blue-600' : 'bg-slate-200'}`}>
                      {checked ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Shifts & Pricing */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Clock className="w-6 h-6 text-royal-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Pricing & Shift Configurations</h3>
                <p className="text-xs text-slate-500">Standardize rates for online bookings and walk-in receipts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full-Day (24 Hours) Monthly Fee (₹)"
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                required
              />
              <Input
                label="Hourly / Day-pass Pass Rate (₹)"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-deep-navy-900 uppercase">Standard Automatic Shifts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-800">Morning Shift</p>
                  <p className="text-slate-500">06:00 AM - 12:00 PM</p>
                  <p className="text-emerald-700 font-bold mt-1">₹{Math.round(formData.monthlyFee * 0.7)}/mo</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-800">Evening Shift</p>
                  <p className="text-slate-500">12:00 PM - 06:00 PM</p>
                  <p className="text-emerald-700 font-bold mt-1">₹{Math.round(formData.monthlyFee * 0.7)}/mo</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-800">Night Shift</p>
                  <p className="text-slate-500">06:00 PM - 11:00 PM</p>
                  <p className="text-emerald-700 font-bold mt-1">₹{Math.round(formData.monthlyFee * 0.6)}/mo</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Seat Capacity & Desk Layout */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Armchair className="w-6 h-6 text-royal-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Seat Capacity & Desk Matrix</h3>
                <p className="text-xs text-slate-500">Generates the visual live desk grid for students and library desk manager</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Total Physical Desks"
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                required
              />
              <Input
                label="Rows Layout"
                type="number"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: Number(e.target.value) })}
              />
              <Input
                label="Desks Per Row"
                type="number"
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: Number(e.target.value) })}
              />
            </div>

            {/* Matrix Preview Preview Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500 mb-3">Live Visual Preview (First 20 Desks)</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-center font-mono text-xs font-bold text-emerald-800"
                  >
                    A-{String(i + 1).padStart(2, '0')}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Visual matrix of {formData.totalSeats} individual study desks will be editable in your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Photos & Documents */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <UploadCloud className="w-6 h-6 text-royal-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Verification Documents & Photos</h3>
                <p className="text-xs text-slate-500">Required by District Admin to grant verified partner green badge</p>
              </div>
            </div>

            {/* Reading Hall Photos Uploader */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-royal-blue-600" />
                    Reading Hall Photos (Multiple Images)
                  </h4>
                  <p className="text-xs text-slate-500">Show desks, AC units, entrance, and study ambiance (JPG, PNG, max 5MB each)</p>
                </div>
                <span className="text-xs font-semibold text-royal-blue-600 bg-royal-blue-50 px-2 py-0.5 rounded">
                  {photos.length} uploaded
                </span>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPhotos(true); }}
                onDragLeave={() => setIsDraggingPhotos(false)}
                onDrop={(e) => { e.preventDefault(); setIsDraggingPhotos(false); handlePhotoFiles(e.dataTransfer.files); }}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                  isDraggingPhotos
                    ? 'border-royal-blue-500 bg-royal-blue-50 scale-[0.99]'
                    : 'border-slate-300 hover:border-royal-blue-400 bg-slate-50/50'
                }`}
                onClick={() => {
                  const input = document.getElementById('photo-upload-input') as HTMLInputElement;
                  if (input) input.click();
                }}
              >
                <input
                  type="file"
                  id="photo-upload-input"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handlePhotoFiles(e.target.files)}
                />
                <UploadCloud className="w-8 h-8 text-royal-blue-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  Drag & drop reading hall photos here, or <span className="text-royal-blue-600 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG up to 5MB each</p>
              </div>

              {/* Photos Grid Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {photos.map((p) => (
                    <div key={p.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                      <img src={p.url} alt={p.name} className="w-full h-24 object-cover" />
                      <div className="p-2 text-[11px]">
                        <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{p.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPhotos(prev => prev.filter(item => item.id !== p.id)); }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commercial Lease / Electricity Bill Uploader */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Commercial Lease / Electricity Bill
                  </h4>
                  <p className="text-xs text-slate-500">Premises ownership, commercial meter electricity bill or rent agreement (PDF, JPG, PNG, max 10MB)</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {documents.length} document
                </span>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingDocs(true); }}
                onDragLeave={() => setIsDraggingDocs(false)}
                onDrop={(e) => { e.preventDefault(); setIsDraggingDocs(false); handleDocumentFiles(e.dataTransfer.files); }}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                  isDraggingDocs
                    ? 'border-emerald-500 bg-emerald-50 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
                }`}
                onClick={() => {
                  const input = document.getElementById('doc-upload-input') as HTMLInputElement;
                  if (input) input.click();
                }}
              >
                <input
                  type="file"
                  id="doc-upload-input"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleDocumentFiles(e.target.files)}
                />
                <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  Drag & drop commercial document here, or <span className="text-emerald-600 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
              </div>

              {/* Documents List Preview */}
              {documents.length > 0 && (
                <div className="space-y-2 pt-1">
                  {documents.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{d.name}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{d.size} • Commercial Verification</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDocuments(prev => prev.filter(item => item.id !== d.id)); }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-lg font-bold text-deep-navy-900">Review & Submit for District Approval</h3>
                <p className="text-xs text-slate-500">Ensure all details match the on-site study space</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Library:</span> <strong className="text-deep-navy-900">{formData.name}</strong></div>
                <div><span className="text-slate-500">Location:</span> <strong className="text-deep-navy-900">{[locationSelection.areaName, locationSelection.localityName, locationSelection.districtName, locationSelection.stateName].filter(Boolean).join(', ')}</strong></div>
                <div><span className="text-slate-500">Capacity:</span> <strong className="text-deep-navy-900">{formData.totalSeats} Desks</strong></div>
                <div><span className="text-slate-500">Base Fee:</span> <strong className="text-emerald-700">₹{formData.monthlyFee}/month</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-royal-blue-50 border border-royal-blue-100 text-xs text-royal-blue-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-royal-blue-700" /> {locationSelection.districtName || 'District'} Admin Desk Workflow
                </p>
                Upon submission, the {locationSelection.districtName || 'District'} Admin desk will review your physical address, verify capacity photos, and activate the public booking page.
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || submitting}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit for Approval
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
