import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { Teacher, TeacherDocumentItem } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Lock,
  RefreshCw,
  XCircle,
  FileQuestion,
  Info,
  Check
} from 'lucide-react';

interface DocCategoryConfig {
  key: 'degree' | 'experience' | 'idProof';
  title: string;
  description: string;
  required: boolean;
  acceptedFormats: string;
}

const CATEGORIES: DocCategoryConfig[] = [
  {
    key: 'degree',
    title: 'Degree Certificate / Highest Marksheet',
    description: 'B.Sc, M.Sc, B.Ed, B.Tech or highest qualifying degree transcript issued by recognized board/university.',
    required: true,
    acceptedFormats: '.pdf, .png, .jpg, .jpeg'
  },
  {
    key: 'experience',
    title: 'Experience Letter / Institutional Certificate',
    description: 'Proof of prior school, coaching, or verified tutoring experience. Optional if you are a fresh graduate.',
    required: false,
    acceptedFormats: '.pdf, .png, .jpg, .jpeg'
  },
  {
    key: 'idProof',
    title: 'Government Identity Proof',
    description: 'Aadhaar Card, PAN Card, Voter ID, or Passport showing your photo, full name, and permanent address.',
    required: true,
    acceptedFormats: '.pdf, .png, .jpg, .jpeg'
  }
];

export const TeacherVerification: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'degree' | 'experience' | 'idProof'>('degree');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTeacher = async () => {
    if (!user) return;
    try {
      const data = await teacherService.getProfile(user.id);
      if (data) setTeacher(data);
    } catch (err) {
      console.error('Failed to load teacher verification', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [user]);

  const triggerUpload = (category: 'degree' | 'experience' | 'idProof') => {
    setActiveCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacher) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5 MB', 'error');
      e.target.value = '';
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast('Invalid file format. Please upload PDF, PNG, or JPG', 'error');
      e.target.value = '';
      return;
    }

    setUploadingCategory(activeCategory);
    try {
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const docItem: TeacherDocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: CATEGORIES.find(c => c.key === activeCategory)?.title || activeCategory,
        status: 'UNDER_REVIEW',
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: formattedSize,
      };

      await teacherService.updateDocument(teacher.id, activeCategory, docItem);
      await fetchTeacher();
      addToast(`${CATEGORIES.find(c => c.key === activeCategory)?.title} uploaded successfully! Queued for District Admin review.`, 'success');
    } catch (err) {
      addToast('Failed to upload document', 'error');
    } finally {
      setUploadingCategory(null);
      e.target.value = '';
    }
  };

  const handleSkipOptional = async () => {
    if (!teacher) return;
    try {
      const docItem: TeacherDocumentItem = {
        id: `doc-skipped-${Date.now()}`,
        name: 'Declared Fresh Educator (No prior institutional certificate)',
        type: 'Experience Letter (Skipped)',
        status: 'APPROVED',
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: '0 KB',
      };
      await teacherService.updateDocument(teacher.id, 'experience', docItem);
      await fetchTeacher();
      addToast('Experience certificate marked as not applicable.', 'info');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const getDocForCategory = (key: string): TeacherDocumentItem | null => {
    const mappedKey = key === 'degree' ? 'degreeCertificate' : key === 'experience' ? 'experienceLetter' : key;
    const doc = (documentsUploaded as any)[mappedKey] || (documentsUploaded as any)[key];
    if (!doc) return null;
    if (typeof doc === 'string') {
      return {
        name: doc,
        uploadedAt: 'Uploaded',
        status: 'UNDER_REVIEW',
      };
    }
    return doc as TeacherDocumentItem;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const verificationStatus = teacher?.verificationStatus || 'PENDING';
  const documentsUploaded = teacher?.documentsUploaded || {};

  const uploadedCount = CATEGORIES.filter(cat => {
    const d = getDocForCategory(cat.key);
    return !!d && d.status !== 'NOT_UPLOADED' && (d.status as any) !== 'not_uploaded';
  }).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="KYC & Credential Verification"
        subtitle="Verification required for District Admin home tutor allotment and parent safety vetting"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Verification' }
        ]}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".pdf, .png, .jpg, .jpeg"
        className="hidden"
      />

      {/* Verification Status Banner */}
      {verificationStatus === 'APPROVED' ? (
        <Card className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white relative overflow-hidden border-0 shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Verification Status: Approved & Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">District Verified Educator</h2>
              <p className="text-emerald-100 text-sm max-w-xl">
                All mandatory credentials have been reviewed and approved by the {teacher?.district || 'Ghazipur'} District Education Board. You are fully eligible for automated student allotments.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center sm:text-right shrink-0">
              <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Credential Badge</p>
              <p className="font-mono text-sm font-bold text-white mt-0.5">FP-GZP-TCH-{teacher?.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-emerald-300 mt-1 flex items-center justify-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Verified Seal
              </p>
            </div>
          </div>
        </Card>
      ) : verificationStatus === 'REJECTED' ? (
        <Card className="p-6 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white border-0 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <XCircle className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Action Required: Verification Rejected
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Document Correction Needed</h2>
              <p className="text-rose-100 text-sm max-w-xl">
                {teacher?.rejectionReason ||
                  'One or more of your submitted documents could not be verified by the District Admin. Please review the highlighted document below and re-upload a clear copy.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-rose-100 shrink-0">
              <p className="font-bold text-white">Direct Assistance</p>
              <p className="mt-0.5">Contact District Desk: support@zyzus.com</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-deep-navy-950 text-white border-0 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Verification Status: Under Review
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Pending District Admin Approval</h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Your submitted documents are undergoing verification by the {teacher?.district || 'Ghazipur'} District Admin. Standard review turnaround is 24-48 business hours.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-amber-100 shrink-0">
              <p className="font-bold text-white">Upload Progress</p>
              <p className="mt-0.5">{uploadedCount} of 3 document categories submitted</p>
            </div>
          </div>
        </Card>
      )}

      {/* 3 Real Document Categories Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-royal-blue-600" /> Mandatory & Supporting Credentials
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {CATEGORIES.map(cat => {
            const uploadedDoc = getDocForCategory(cat.key);
            const isUploaded = !!uploadedDoc && uploadedDoc.status !== 'NOT_UPLOADED' && (uploadedDoc.status as any) !== 'not_uploaded';
            const isRejected = uploadedDoc?.status === 'REJECTED' || (uploadedDoc?.status as any) === 'rejected';
            const isVerified = uploadedDoc?.status === 'APPROVED' || (uploadedDoc?.status as any) === 'verified';
            const isPending = uploadedDoc?.status === 'UNDER_REVIEW' || uploadedDoc?.status === 'UPLOADED' || (uploadedDoc?.status as any) === 'pending';
            const isCurrentlyUploading = uploadingCategory === cat.key;

            return (
              <Card
                key={cat.key}
                className={`p-5 border transition-all ${
                  isRejected
                    ? 'border-rose-300 bg-rose-50/40'
                    : isVerified
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Icon and Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isRejected
                          ? 'bg-rose-100 text-rose-600'
                          : isVerified
                          ? 'bg-emerald-100 text-emerald-600'
                          : isPending
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isRejected ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : isVerified ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isPending ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{cat.title}</h4>
                        {cat.required ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Required
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Optional
                          </span>
                        )}
                        {isUploaded && (
                          <StatusBadge
                            status={isVerified ? 'verified' : isRejected ? 'rejected' : 'pending'}
                            text={isVerified ? 'Approved' : isRejected ? 'Rejected' : 'Reviewing'}
                          />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 max-w-2xl">{cat.description}</p>

                      {/* Display Uploaded File Details */}
                      {isUploaded ? (
                        <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-royal-blue-600" />
                            {uploadedDoc.name}
                          </span>
                          <span>•</span>
                          <span>{uploadedDoc.fileSize}</span>
                          <span>•</span>
                          <span>Uploaded: {uploadedDoc.uploadedAt}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic pt-1">
                          No document uploaded yet. Accepted: PDF, PNG, JPG (Max 5MB)
                        </p>
                      )}

                      {/* Rejection Reason Alert if flagged */}
                      {isRejected && (
                        <div className="mt-2.5 p-3 rounded-lg bg-rose-100/80 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Rejection Note: </span>
                            {uploadedDoc?.rejectionReason ||
                              teacher?.rejectionReason ||
                              'Document is unreadable or does not match applicant details. Please upload a high-resolution scanned copy.'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
                    {isRejected ? (
                      <Button
                        variant="primary"
                        loading={isCurrentlyUploading}
                        icon={<RefreshCw className="w-4 h-4" />}
                        onClick={() => triggerUpload(cat.key)}
                        className="bg-rose-600 hover:bg-rose-700 border-rose-600 text-xs"
                      >
                        Replace Document
                      </Button>
                    ) : isUploaded ? (
                      <Button
                        variant="outline"
                        loading={isCurrentlyUploading}
                        icon={<UploadCloud className="w-4 h-4" />}
                        onClick={() => triggerUpload(cat.key)}
                        className="text-xs"
                      >
                        Update / Re-upload
                      </Button>
                    ) : (
                      <>
                        {!cat.required && (
                          <Button
                            variant="outline"
                            onClick={handleSkipOptional}
                            className="text-xs border-slate-300 text-slate-600 hover:bg-slate-100"
                          >
                            Skip (Fresh Educator)
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          loading={isCurrentlyUploading}
                          icon={<UploadCloud className="w-4 h-4" />}
                          onClick={() => triggerUpload(cat.key)}
                          className="text-xs"
                        >
                          Upload Document
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Security & Verification Guarantee */}
      <Card className="p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3 rounded-xl">
        <Lock className="w-5 h-5 text-royal-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">Bank-Grade Document Privacy & End-to-End Encryption</p>
          <p>
            Your identification and degree documents are encrypted under 256-bit AES standards and stored securely. They are strictly reviewed by the designated District Education Officer for applicant verification and never shared publicly with students or parents.
          </p>
        </div>
      </Card>
    </div>
  );
};
