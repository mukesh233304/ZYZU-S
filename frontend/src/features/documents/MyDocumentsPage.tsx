import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  CreditCard,
  Award,
  Sparkles,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  ExternalLink,
  QrCode,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import { teacherService } from '../../services/teacherService';
import { Teacher, Library, LibraryCertificateData } from '../../types';
import { mockStore } from '../../mock/store';
import { libraryDiscoveryService } from '../../services/libraryDiscoveryService';
import { LibraryCertificateModal } from '../../components/common/LibraryCertificateModal';
import {
  UnifiedFocusPointDocument,
  DocumentCategory,
  DocumentFilterOptions,
  DocumentKPISummary
} from '../../types/document';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { UnifiedDocumentViewer } from '../../components/documents/UnifiedDocumentViewer';
import { TeacherVerificationCertificateModal } from '../teacher/components/TeacherVerificationCertificateModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { documentExportUtils } from '../../utils/documentExportUtils';

export const MyDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [documents, setDocuments] = useState<UnifiedFocusPointDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<UnifiedFocusPointDocument | null>(null);
  const [kpiSummary, setKpiSummary] = useState<DocumentKPISummary>({
    totalDocuments: 0,
    newDocumentsCount: 0,
    paymentReceiptsCount: 0,
    identityCredentialsCount: 0,
    salaryPayoutsCount: 0,
    activeDemoPassesCount: 0
  });

  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    reason?: string;
    serviceType?: 'HOME_TUITION' | 'LIBRARY' | 'BOTH';
    activeTuitionDetails?: any;
    activeLibraryDetails?: any;
  } | null>(null);

  // Teacher specific state
  const [teacherProfile, setTeacherProfile] = useState<Teacher | null>(null);
  const [teacherCertEligible, setTeacherCertEligible] = useState<boolean>(false);
  const [teacherCertNumber, setTeacherCertNumber] = useState<string | undefined>();
  const [isTeacherCertModalOpen, setIsTeacherCertModalOpen] = useState<boolean>(false);

  // Library Owner specific state (Sections #2 - #8, #39)
  const [libraryProfile, setLibraryProfile] = useState<Library | null>(null);
  const [isLibraryCertModalOpen, setIsLibraryCertModalOpen] = useState<boolean>(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const userId = user?.id || 'usr-teacher-rajesh';
  const userRole = (user?.role || 'TEACHER').toUpperCase();
  const isTeacher = userRole.includes('TEACHER');
  const isStudent = userRole.includes('STUDENT');
  const isLibraryOwner = userRole.includes('LIBRARY') && userRole.includes('OWNER');
  const isDistrictAdmin = userRole.includes('DISTRICT');

  const handleDirectDownload = async (docToDownload: UnifiedFocusPointDocument) => {
    try {
      setDownloadingDocId(docToDownload.id);
      addToast(`Rendering official ${docToDownload.title}...`, 'info');
      await documentExportUtils.downloadAsImage(docToDownload, false);
      documentService.recordDocumentAction(docToDownload.documentNumber, 'DOWNLOADED', userId, userRole, 'Direct Download');
      addToast(`Downloaded official ${docToDownload.documentNumber} successfully!`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      addToast('Opening document viewer for export...', 'info');
      setSelectedDoc(docToDownload);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const filters: DocumentFilterOptions = {
        category: selectedCategory === 'ALL' ? undefined : (selectedCategory as DocumentCategory),
        status: selectedStatus === 'ALL' ? undefined : (selectedStatus as any),
        paymentStatus: selectedPaymentStatus === 'ALL' ? undefined : (selectedPaymentStatus as any),
        dateRange: selectedDateRange,
        searchQuery: searchQuery.trim() || undefined
      };

      const promises: Promise<any>[] = [
        documentService.getMyDocuments(userId, userRole, filters),
        documentService.getDocumentKPISummary(userId, userRole),
        documentService.checkIdCardEligibility(userId)
      ];

      if (isTeacher) {
        promises.push(teacherService.getProfile(userId));
        promises.push(documentService.checkTeacherCertificateEligibility(userId));
        promises.push(documentService.getOrCreateTeacherCertificate(userId));
      }

      const results = await Promise.all(promises);
      const docs = results[0];
      const kpi = results[1];
      const elig = results[2];

      setDocuments(docs || []);
      setKpiSummary(kpi);
      setEligibility(elig);

      if (isTeacher && results[3]) {
        setTeacherProfile(results[3]);
        if (results[4]) {
          setTeacherCertEligible(results[4].isEligible);
          setTeacherCertNumber(results[4].certificateNumber);
        }
      }

      if (isLibraryOwner) {
        const userLibs = mockStore.getLibraries().filter(l => l.ownerId === userId || l.id === (user as any)?.libraryId);
        const lib = userLibs[0] || mockStore.getLibraries()[0] || null;
        setLibraryProfile(lib);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      addToast('Failed to load authoritative documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [userId, userRole, selectedCategory, selectedStatus, selectedPaymentStatus, selectedDateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleClearFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPaymentStatus('ALL');
    setSelectedDateRange('ALL');
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let list = [...documents];

    // Specialized tab category mapping for teacher
    if (isTeacher && selectedCategory !== 'ALL') {
      if (selectedCategory === 'SALARY') {
        list = list.filter(d => d.category === 'SALARY' || d.documentType === 'TEACHER_SALARY_SLIP' || d.documentType.includes('SALARY'));
      } else if (selectedCategory === 'IDENTITY') {
        list = list.filter(d => d.category === 'IDENTITY' || d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE' || d.documentType === 'TEACHER_ID_CARD');
      } else if (selectedCategory === 'FINANCIAL') {
        list = list.filter(d => d.category === 'FINANCIAL' || d.category === 'SALARY' || d.category === 'PAYMENT' || d.documentType.includes('SALARY') || d.documentType.includes('PAYOUT'));
      } else if (selectedCategory === 'PLATFORM') {
        list = list.filter(d => d.category === 'ADMINISTRATIVE' || d.category === 'IDENTITY' || d.documentType === 'TEACHER_ID_CARD');
      } else if (selectedCategory === 'CERTIFICATE') {
        list = list.filter(d => d.category === 'CERTIFICATE' || d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE');
      }
    } else if (isLibraryOwner && selectedCategory !== 'ALL') {
      if (selectedCategory === 'VERIFICATION') {
        list = list.filter(d => 
          d.category === 'IDENTITY' || 
          d.category === 'CERTIFICATE' || 
          d.documentType.includes('CERTIFICATE') || 
          d.documentType.includes('ID_CARD') ||
          d.documentType.includes('VERIFICATION')
        );
      } else if (selectedCategory === 'BILLING') {
        list = list.filter(d => 
          d.category === 'PAYMENT' || 
          d.category === 'FINANCIAL' || 
          d.documentType.includes('RECEIPT') || 
          d.documentType.includes('INVOICE') ||
          d.documentType.includes('SUBSCRIPTION')
        );
      } else if (selectedCategory === 'BUSINESS') {
        list = list.filter(d => 
          d.category === 'ADMINISTRATIVE' || 
          (d.category as any) === 'PLATFORM' || 
          d.documentType.includes('LISTING') || 
          d.documentType.includes('PARTNERSHIP') ||
          d.documentType.includes('POLICY')
        );
      }
    }

    if (sortOrder === 'NEWEST') {
      return list.sort((a, b) => new Date(b.issueDate || (b as any).createdAt || 0).getTime() - new Date(a.issueDate || (a as any).createdAt || 0).getTime());
    } else {
      return list.sort((a, b) => new Date(a.issueDate || (a as any).createdAt || 0).getTime() - new Date(b.issueDate || (b as any).createdAt || 0).getTime());
    }
  }, [documents, sortOrder, isTeacher, isLibraryOwner, selectedCategory]);

  // Library Owner Verified & Partnered Certificate computations (Sections #2 - #8)
  const isLibApproved = useMemo(() => {
    if (!libraryProfile) return false;
    return libraryProfile.verificationStatus === 'APPROVED' || 
      libraryProfile.verificationStatus === 'approved' || 
      libraryProfile.status === 'active';
  }, [libraryProfile]);

  const libraryCertEligible = useMemo(() => {
    if (!libraryProfile) return false;
    return isLibApproved && libraryDiscoveryService.isLibraryDiscoverable(libraryProfile);
  }, [libraryProfile, isLibApproved]);

  const libraryCertificateData = useMemo<LibraryCertificateData | null>(() => {
    if (!libraryProfile || !isLibApproved) return null;
    return {
      certificateId: `FP-VPL-${(libraryProfile.id || '').replace(/\D/g, '').padStart(4, '0') || '8012'}`,
      certificateNumber: `FP-VPL-${(libraryProfile.id || '').replace(/\D/g, '').padStart(4, '0') || '8012'}`,
      libraryName: libraryProfile.name,
      libraryId: libraryProfile.id.startsWith('FP-LIB-') ? libraryProfile.id : `FP-LIB-${(libraryProfile.id || '').replace(/\D/g, '').padStart(4, '0') || '1084'}`,
      ownerName: libraryProfile.ownerName || user?.name || 'Library Owner',
      ownerId: libraryProfile.ownerId || user?.id || 'usr-owner-01',
      fullAddress: libraryProfile.address || `${libraryProfile.area}, ${libraryProfile.district || 'Ghazipur'}`,
      locality: libraryProfile.area || 'Saidpur',
      localityName: libraryProfile.area || 'Saidpur',
      districtName: libraryProfile.district || 'Ghazipur',
      stateName: libraryProfile.state || 'Uttar Pradesh',
      totalDesks: libraryProfile.totalSeats || 50,
      joiningDate: libraryProfile.createdAt || '15 Jan 2026',
      issueDate: '01 Feb 2026',
      validUntil: '31 Mar 2027',
      isVerified: true,
      isPartnered: true,
      sealsApproved: true,
      verificationHash: 'SHA256-FP-VERIFIED-PARTNER-SEAL-8829'
    };
  }, [libraryProfile, isLibApproved, user]);

  // Find user's latest salary slip if exists (for teachers)
  const latestSalarySlip = useMemo(() => {
    return documents.find(d => d.category === 'SALARY' || d.documentType === 'TEACHER_SALARY_SLIP');
  }, [documents]);

  // Find user's primary ID card if exists
  const myIdCard = useMemo(() => {
    return documents.find(d => d.category === 'IDENTITY' && d.isCurrent);
  }, [documents]);

  const handleOpenMyIdCard = async () => {
    if (myIdCard) {
      setSelectedDoc(myIdCard);
    } else {
      if (isStudent && eligibility && !eligibility.eligible) {
        addToast(eligibility.reason || 'Your Student ID Card becomes available after you activate a qualifying Home Tuition or Library service.', 'warning');
        return;
      }
      try {
        addToast('Generating official ID Card...', 'info');
        const newCard = await documentService.generateIdCard(userId);
        setSelectedDoc(newCard);
        loadDocuments();
      } catch (err: any) {
        addToast(err.message || 'Cannot generate ID Card at this time', 'warning');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-deep-navy-950 via-slate-900 to-royal-blue-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-royal-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-blue-500/20 text-royal-blue-300 text-xs font-bold border border-royal-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ZYZU'S Sovereign Document & Credential Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Documents & Credentials Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Authoritative ledger for official verification certificates, identity credentials, verified salary slips, and receipts.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          {isTeacher && teacherCertEligible && (
            <Button
              variant="primary"
              onClick={() => setIsTeacherCertModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Award className="w-4 h-4 mr-1.5" />
              <span>View Verification Certificate</span>
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleOpenMyIdCard}
            className="bg-royal-blue-600 hover:bg-royal-blue-500 text-white font-bold text-xs shadow-lg shadow-royal-blue-600/30 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            <span>{myIdCard ? 'View Official ID Card' : 'Generate ID Card'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={loadDocuments}
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 text-xs cursor-pointer"
            title="Refresh documents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 1. Featured ZYZU'S Official Teacher Monthly Salary Slip (For Teachers) */}
      {isTeacher && latestSalarySlip && (
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-royal-blue-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-emerald-400/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-royal-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Voucher Telemetry & Heading */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DIRECT NEFT DISBURSED & SETTLED</span>
                </span>
                <span className="font-mono text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                  UTR: {latestSalarySlip.transactionRef || 'SBI-NEFT-99120481'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                  Voucher: {latestSalarySlip.documentNumber}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Official Monthly Compensation Voucher & Tax Ledger</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                  ZYZU'S Official Teacher Monthly Salary Slip
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Academic Cycle 2026-27 • Pay Period: <strong className="text-white">{latestSalarySlip.billingPeriod || 'September 2026'}</strong> • Disbursed to <strong className="text-white">{latestSalarySlip.recipientName || teacherProfile?.name || 'Dr. Rajesh Sharma'}</strong> (ID: {latestSalarySlip.recipientId === 'usr-teacher-rajesh' ? 'FP-TCH-000014' : latestSalarySlip.recipientId})
                </p>
              </div>

              {/* Financial Line Item Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Gross Collection</span>
                  <span className="text-sm font-black font-mono text-white mt-0.5 block">₹16,000.00</span>
                  <span className="text-[10px] text-slate-300 font-medium">4 Active Learners</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Educator Share (85%)</span>
                  <span className="text-sm font-black font-mono text-emerald-300 mt-0.5 block">₹13,600.00</span>
                  <span className="text-[10px] text-emerald-200 font-medium">Standard Payout</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">Punctuality Bonus</span>
                  <span className="text-sm font-black font-mono text-amber-300 mt-0.5 block">+₹1,000.00</span>
                  <span className="text-[10px] text-amber-200 font-medium">100% Attendance</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Deductions</span>
                  <span className="text-sm font-black font-mono text-slate-200 mt-0.5 block">₹0.00</span>
                  <span className="text-[10px] text-slate-300 font-medium">0 TDS / 0 Penalty</span>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                <span>Account: <strong className="text-white font-mono">{latestSalarySlip.bankAccountMasked || 'State Bank of India (SBI) A/c XXXX 3381'}</strong></span>
                <span>•</span>
                <span>Disbursed: <strong className="text-white">15 September 2026</strong></span>
                <span>•</span>
                <span>Sessions: <strong className="text-emerald-300">28 Logged (100% Attendance)</strong></span>
              </div>
            </div>

            {/* Right: Net Take-Home Hero & Direct Actions */}
            <div className="flex flex-col items-start lg:items-end justify-between gap-4 bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl shrink-0 w-full lg:w-auto">
              <div className="lg:text-right w-full">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                  Net Disbursed Take-Home
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-300 block mt-0.5">
                  ₹{Number(latestSalarySlip.amount || 14600).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-300 font-semibold mt-1">
                  Fourteen Thousand Six Hundred Rupees Only
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => setSelectedDoc(latestSalarySlip)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/40 cursor-pointer justify-center"
                >
                  View Official Salary Slip
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => setSelectedDoc(latestSalarySlip)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 text-xs font-bold cursor-pointer justify-center"
                >
                  Print / PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => handleDirectDownload(latestSalarySlip)}
                  disabled={downloadingDocId === latestSalarySlip.id}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 text-xs font-bold cursor-pointer justify-center"
                >
                  {downloadingDocId === latestSalarySlip.id ? 'Rendering...' : 'Download'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Featured Teacher Verification Certificate Card (Requirement 24) */}
      {isTeacher && (
        <div className="bg-gradient-to-br from-white via-royal-blue-50/20 to-amber-50/20 rounded-3xl p-6 sm:p-7 border border-royal-blue-200/80 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Credential Info */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-amber-300">
                <Award className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                    teacherCertEligible
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {teacherCertEligible ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ VERIFIED EDUCATOR</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>UNDER REVIEW</span>
                      </>
                    )}
                  </span>

                  {teacherCertNumber && (
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      Cert No: {teacherCertNumber}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ZYZU'S Teacher Verification Certificate
                </h2>

                <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed font-medium">
                  {teacherCertEligible
                    ? `Officially accredited credential for ${teacherProfile?.name || 'Educator'} (ID: ${teacherProfile?.id ? `FP-TCH-${teacherProfile.id.replace(/\D/g, '').padStart(5, '0')}` : 'FP-TCH-000014'}). Validated across qualification degrees, police clearance, and ZYZU'S Ghazipur District Office accreditation.`
                    : 'Your educator credentials are under review by the District Accreditation Desk. Upon approval, your official A4 verification certificate with scannable QR verification will be unlocked here.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 font-medium">
                  <span>Issued By: <strong className="text-slate-800">ZYZU'S Bureau</strong></span>
                  <span>•</span>
                  <span>District: <strong className="text-slate-800">{teacherProfile?.district || 'Ghazipur'}</strong></span>
                  <span>•</span>
                  <span>Verification Ref: <strong className="font-mono text-slate-800">{teacherCertNumber || 'FP-TV-PENDING'}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap lg:flex-col items-stretch sm:items-end gap-2.5 w-full lg:w-auto shrink-0">
              {teacherCertEligible ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => setIsTeacherCertModalOpen(true)}
                    className="bg-royal-blue-600 hover:bg-royal-blue-700 text-white text-xs font-bold w-full sm:w-auto justify-center cursor-pointer shadow-sm"
                  >
                    View & Print Certificate
                  </Button>

                  <a
                    href={`/verify-certificate/${teacherCertNumber || 'FP-TV-2026-000014'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors w-full sm:w-auto"
                  >
                    <QrCode className="w-3.5 h-3.5 text-royal-blue-600" />
                    <span>Public QR Verify</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </>
              ) : (
                <Link to="/teacher/verification" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 w-full cursor-pointer"
                  >
                    Complete Verification
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2.5 Featured ZYZU'S Verified & Partnered Study Library Certificate Card (Sections #2 - #8, #39) */}
      {isLibraryOwner && (
        <div className="bg-gradient-to-br from-white via-royal-blue-50/20 to-orange-50/20 rounded-3xl p-6 sm:p-7 border border-royal-blue-200/80 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-orange-400/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Credential Info */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-royal-blue-900 to-indigo-950 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-amber-400/60">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                    libraryCertEligible
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {libraryCertEligible ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ VERIFIED & PARTNERED STUDY LIBRARY</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>UNDER REVIEW / VERIFICATION PENDING</span>
                      </>
                    )}
                  </span>

                  {libraryCertificateData && (
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      Cert No: {libraryCertificateData.certificateNumber}
                    </span>
                  )}
                  {libraryProfile && (
                    <span className="font-mono text-xs font-bold text-royal-blue-700 bg-royal-blue-50 px-2 py-0.5 rounded-md border border-royal-blue-200">
                      Library ID: {libraryCertificateData?.libraryId || libraryProfile.id}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ZYZU'S Verified & Partnered Study Library Certificate
                </h2>

                <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed font-medium">
                  {libraryCertEligible
                    ? `Official sovereign ZYZU'S Certificate of Verification and Institutional Partnership for ${libraryProfile?.name || 'Study Library'}. Accredited by District Administration (${libraryProfile?.district || 'Ghazipur'}, U.P.) with scannable cryptographic QR verification code.`
                    : 'This certificate is available when the study library reaches the approved and verified status by District Administration / Super Admin. Verification is currently in progress.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 font-medium">
                  <span>Issued By: <strong className="text-slate-800">ZYZU'S Platform</strong></span>
                  <span>•</span>
                  <span>District: <strong className="text-slate-800">{libraryProfile?.district || 'Ghazipur'}</strong></span>
                  <span>•</span>
                  <span>State/UT: <strong className="text-slate-800">{libraryProfile?.state || 'Uttar Pradesh'}</strong></span>
                  <span>•</span>
                  <span>PIN: <strong className="font-mono text-slate-800">{libraryProfile?.pincode || '233304'}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-56 shrink-0">
              {libraryCertEligible && libraryCertificateData ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Award className="w-4 h-4 text-amber-300" />}
                    onClick={() => setIsLibraryCertModalOpen(true)}
                    className="bg-royal-blue-600 hover:bg-royal-blue-700 text-white font-extrabold text-xs shadow-md shadow-royal-blue-600/20 cursor-pointer justify-center"
                  >
                    View Official Certificate
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Printer className="w-4 h-4 text-slate-600" />}
                    onClick={() => setIsLibraryCertModalOpen(true)}
                    className="bg-white hover:bg-slate-50 text-slate-800 border-slate-300 text-xs font-bold cursor-pointer justify-center"
                  >
                    Print / PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4 text-slate-600" />}
                    onClick={() => setIsLibraryCertModalOpen(true)}
                    className="bg-white hover:bg-slate-50 text-slate-800 border-slate-300 text-xs font-bold cursor-pointer justify-center"
                  >
                    Download Certificate
                  </Button>
                </>
              ) : (
                <Link to="/library-owner/profile" className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 w-full cursor-pointer justify-center"
                  >
                    Check Verification Progress
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student ID Card Eligibility Status Banner */}
      {isStudent && !myIdCard && eligibility && !eligibility.eligible && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <span>Service Prerequisite</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Official Student ID Card Access
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed max-w-2xl">
                Your Student ID Card becomes available after you activate a qualifying Home Tuition or Library service.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <Link to="/find-tutor" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full font-bold text-xs border-amber-300 text-amber-950 bg-white hover:bg-amber-100/60 shadow-xs cursor-pointer"
              >
                Find Home Tutor
              </Button>
            </Link>
            <Link to="/find-library" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                className="w-full font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-xs cursor-pointer"
              >
                Find Libraries
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Total</span>
            <FileText className="w-4 h-4 text-royal-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{kpiSummary.totalDocuments}</p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Registered Files</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">New</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">{kpiSummary.newDocumentsCount}</p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Ready to View</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Receipts</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">{kpiSummary.paymentReceiptsCount}</p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Settled Payments</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Identity</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-700 font-mono">{kpiSummary.identityCredentialsCount}</p>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Cards & Badges</span>
        </div>

        {(isTeacher || isDistrictAdmin) ? (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Salary</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">{kpiSummary.salaryPayoutsCount}</p>
            <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Monthly Slips</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Demo Passes</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-700 font-mono">{kpiSummary.activeDemoPassesCount}</p>
            <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Valid Passes</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Security</span>
            <Award className="w-4 h-4 text-royal-blue-600" />
          </div>
          <p className="text-sm font-black text-slate-900 mt-1">256-BIT</p>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Verified Ledger</span>
        </div>
      </div>

      {/* 27. Document Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {(isTeacher
          ? [
              { id: 'ALL', label: 'All Documents' },
              { id: 'SALARY', label: 'Official Salary Slips' },
              { id: 'IDENTITY', label: 'Identity & ID Card' },
              { id: 'CERTIFICATE', label: 'Accreditation Certificates' },
              { id: 'PLATFORM', label: 'Platform & Credentials' },
            ]
          : isLibraryOwner
          ? [
              { id: 'ALL', label: 'All Documents' },
              { id: 'VERIFICATION', label: 'Verification & Certificates' },
              { id: 'BILLING', label: 'Billing & Receipts' },
              { id: 'BUSINESS', label: 'Business & Partnership' },
            ]
          : [
              { id: 'ALL', label: 'All Documents' },
              { id: 'PAYMENT', label: 'Receipts & Invoices' },
              { id: 'IDENTITY', label: 'ID & Credentials' },
              ...(isDistrictAdmin ? [{ id: 'SALARY', label: 'Salary Slips' }] : []),
              ...(isStudent ? [{ id: 'DEMO', label: 'Demo Passes' }, { id: 'BOOKING', label: 'Seat Bookings' }] : []),
              { id: 'CERTIFICATE', label: 'Certificates' },
              ...(isDistrictAdmin ? [{ id: 'ADMINISTRATIVE', label: 'Appointment & Directives' }, { id: 'FINANCIAL', label: 'Expenses & Statements' }] : []),
            ]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-royal-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doc number (e.g. FP-CERT-2026, FP-SAL-2026), title, payment reference..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-500 font-medium focus:outline-hidden focus:ring-2 focus:ring-royal-blue-500/20 focus:border-royal-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-bold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="VIEWED">Viewed</option>
              <option value="DOWNLOADED">Downloaded</option>
              <option value="PRINTED">Printed</option>
            </select>

            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-bold cursor-pointer"
            >
              <option value="ALL">All Payment Types</option>
              <option value="PAID">Paid Only</option>
              <option value="FREE">Free / Waived</option>
            </select>

            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-bold cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="THIS_YEAR">This Year</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <span>{sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {(searchQuery || selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL' || selectedDateRange !== 'ALL' || selectedCategory !== 'ALL') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 28. Documents Grid / Intelligent Empty State */}
      {loading ? (
        <div className="py-20 text-center text-slate-600">
          <div className="w-8 h-8 border-3 border-royal-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Retrieving authentic documents from sovereign ledger...</p>
        </div>
      ) : filteredAndSortedDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-300 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-royal-blue-50 text-royal-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {selectedCategory === 'FINANCIAL' || selectedCategory === 'SALARY'
              ? 'No salary slips available yet.'
              : selectedCategory === 'PAYMENT'
              ? 'No payment receipts available yet.'
              : selectedCategory === 'CERTIFICATE'
              ? 'No certificates issued yet.'
              : 'No documents match your query.'}
          </h3>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {selectedCategory === 'FINANCIAL' || selectedCategory === 'SALARY'
              ? 'Teacher salary slips are automatically generated and made available here once monthly payroll is finalized and disbursed.'
              : selectedCategory === 'PAYMENT'
              ? 'Payment receipts and tax invoices are automatically created upon successful tuition or registration transactions.'
              : "Your ZYZU'S documents will appear here once they are generated or approved by the District Desk."}
          </p>
          {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Active Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={(d) => {
                if (d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE') {
                  setIsTeacherCertModalOpen(true);
                } else if (d.documentType === 'LIBRARY_PARTNER_CERTIFICATE' || (d.documentType as string) === 'LIBRARY_PARTNERSHIP_CERTIFICATE' || (d as any).documentType === 'VERIFIED_PARTNERED_CERTIFICATE') {
                  setIsLibraryCertModalOpen(true);
                } else {
                  setSelectedDoc(d);
                }
              }}
              onDownload={(d) => {
                if (d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE') {
                  setIsTeacherCertModalOpen(true);
                } else if (d.documentType === 'LIBRARY_PARTNER_CERTIFICATE' || (d.documentType as string) === 'LIBRARY_PARTNERSHIP_CERTIFICATE' || (d as any).documentType === 'VERIFIED_PARTNERED_CERTIFICATE') {
                  setIsLibraryCertModalOpen(true);
                } else {
                  handleDirectDownload(d);
                }
              }}
              onPrint={(d) => {
                if (d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE') {
                  setIsTeacherCertModalOpen(true);
                } else if (d.documentType === 'LIBRARY_PARTNER_CERTIFICATE' || (d.documentType as string) === 'LIBRARY_PARTNERSHIP_CERTIFICATE' || (d as any).documentType === 'VERIFIED_PARTNERED_CERTIFICATE') {
                  setIsLibraryCertModalOpen(true);
                } else {
                  setSelectedDoc(d);
                }
              }}
              onShare={(d) => setSelectedDoc(d)}
            />
          ))}
        </div>
      )}

      {/* Universal Document Viewer Modal */}
      {selectedDoc && (
        <UnifiedDocumentViewer
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          currentUserId={userId}
          currentUserRole={userRole}
        />
      )}

      {/* Teacher Verification Certificate Modal */}
      {isTeacher && (
        <TeacherVerificationCertificateModal
          isOpen={isTeacherCertModalOpen}
          onClose={() => setIsTeacherCertModalOpen(false)}
          teacher={teacherProfile}
          certificateNumber={teacherCertNumber}
        />
      )}

      {/* FocusPoint Verified & Partnered Study Library Certificate Modal */}
      {libraryCertificateData && (
        <LibraryCertificateModal
          isOpen={isLibraryCertModalOpen}
          onClose={() => setIsLibraryCertModalOpen(false)}
          certificate={libraryCertificateData}
        />
      )}
    </div>
  );
};
