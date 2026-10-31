import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Award,
  MapPin,
  Lock,
  Building2
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Teacher } from '../../../types';

interface TeacherVerificationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onOpenCertificateModal?: () => void;
  onOpenCertificate?: () => void;
}

export const TeacherVerificationStatusModal: React.FC<TeacherVerificationStatusModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onOpenCertificateModal,
  onOpenCertificate
}) => {
  const handleOpenCertificate = onOpenCertificateModal || onOpenCertificate || (() => {});
  const status = (teacher?.verificationStatus || 'PENDING').toUpperCase();
  const isVerified = status === 'APPROVED' || status === 'VERIFIED';
  const isRejected = status === 'REJECTED';
  const isDocsRequired = status === 'DOCUMENTS_REQUIRED' || status === 'INCOMPLETE';

  const documents = teacher?.documentsUploaded || {};
  const hasIdProof = !!documents.idProof;
  const hasDegree = !!documents.degreeCertificate || !!(documents as any).degree;
  const hasExperience = !!documents.experienceLetter || !!(documents as any).experience;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ZYZU'S Educator Verification & Accreditation Status"
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Hero Card */}
        <div
          className={`p-6 rounded-2xl border text-center space-y-3 ${
            isVerified
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : isRejected
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : isDocsRequired
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-blue-50/70 border-blue-200 text-blue-950'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
              isVerified
                ? 'bg-emerald-600 text-white'
                : isRejected
                ? 'bg-rose-600 text-white'
                : isDocsRequired
                ? 'bg-amber-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-9 h-9" />
            ) : isRejected ? (
              <ShieldAlert className="w-9 h-9" />
            ) : (
              <Clock className="w-9 h-9" />
            )}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 ${
                isVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : isRejected
                  ? 'bg-rose-100 text-rose-800'
                  : isDocsRequired
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isVerified
                ? '✓ VERIFIED EDUCATOR'
                : isRejected
                ? 'VERIFICATION REJECTED'
                : isDocsRequired
                ? 'DOCUMENTS REQUIRED'
                : 'VERIFICATION UNDER REVIEW'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isVerified
                ? "Your teacher profile is officially verified by ZYZU'S"
                : isRejected
                ? 'Credentials Require Amendment'
                : isDocsRequired
                ? 'Pending Mandatory Documents Upload'
                : 'Credentials Under Review by District Education Desk'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
              {isVerified
                ? `Officially accredited and approved by ${teacher?.districtName || teacher?.district || 'Ghazipur'} District Desk for verified student tuition requests and public teacher listings.`
                : isRejected
                ? teacher?.rejectionReason || 'Please review feedback from the District Admin and re-upload supporting credentials.'
                : 'District administrators review educational transcripts, identity documents, and background checks within 24–48 working hours.'}
            </p>
          </div>
        </div>

        {/* Verification Checklist Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Accreditation Checklist & Document Verifications
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Checklist Item 1: Identity */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  hasIdProof
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {hasIdProof ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
              </span>
              <div>
                <p className="font-bold text-slate-900">Government Identity Proof</p>
                <p className="text-slate-600 text-[11px] font-medium">
                  {hasIdProof ? 'Aadhaar / Voter ID Verified' : 'Pending document upload'}
                </p>
              </div>
            </div>

            {/* Checklist Item 2: Degree */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  hasDegree
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {hasDegree ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
              </span>
              <div>
                <p className="font-bold text-slate-900">Highest Degree / Marksheet</p>
                <p className="text-slate-600 text-[11px] font-medium">
                  {teacher?.degree || teacher?.highestQualification || (hasDegree ? 'Academic Degree Uploaded' : 'Pending upload')}
                </p>
              </div>
            </div>

            {/* Checklist Item 3: Experience */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  hasExperience || (teacher?.experienceYears && teacher.experienceYears > 0)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-slate-900">Teaching Experience Vetting</p>
                <p className="text-slate-600 text-[11px] font-medium">
                  {teacher?.experienceYears
                    ? `${teacher.experienceYears} Years Verified Experience`
                    : 'Declared Fresh Educator'}
                </p>
              </div>
            </div>

            {/* Checklist Item 4: District Desk */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
              </span>
              <div>
                <p className="font-bold text-slate-900">District Bureau Allotment Clearance</p>
                <p className="text-slate-600 text-[11px] font-medium">
                  {isVerified ? `${teacher?.districtName || teacher?.district || 'Ghazipur'} Desk Approved` : 'Awaiting final sign-off'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Certificate Fast Link if Verified */}
        {isVerified && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900">
                  Official Teacher Verification Certificate
                </h5>
                <p className="text-xs text-slate-600">
                  Verifiable A4 digital credential with cryptographic QR verification.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                handleOpenCertificate();
              }}
              className="bg-white text-slate-900 font-bold border-amber-300 hover:bg-amber-50 shrink-0 text-xs cursor-pointer shadow-xs"
            >
              View Certificate
            </Button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Link to="/teacher/verification" onClick={onClose} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs font-semibold text-royal-blue-700 border-royal-blue-200 hover:bg-royal-blue-50"
              icon={<FileText className="w-4 h-4" />}
            >
              Manage KYC Documents
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
