import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  Eye,
  Download,
  ShieldCheck,
  CreditCard,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { UnifiedFocusPointDocument } from '../../types/document';
import { documentService } from '../../services/documentService';
import { documentExportUtils } from '../../utils/documentExportUtils';
import { UnifiedDocumentViewer } from './UnifiedDocumentViewer';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface RecentDocumentsWidgetProps {
  userId: string;
  userRole: string;
  allDocumentsPath?: string;
  limit?: number;
}

export const RecentDocumentsWidget: React.FC<RecentDocumentsWidgetProps> = ({
  userId,
  userRole,
  allDocumentsPath,
  limit = 4
}) => {
  const [documents, setDocuments] = useState<UnifiedFocusPointDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<UnifiedFocusPointDocument | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleDirectDownload = async (docToDownload: UnifiedFocusPointDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingDocId(docToDownload.id);
      showToast(`Rendering official ${docToDownload.title}...`, 'info');
      await documentExportUtils.downloadAsImage(docToDownload, false);
      documentService.recordDocumentAction(docToDownload.documentNumber, 'DOWNLOADED', userId, userRole, 'Direct Widget Download');
      showToast(`Downloaded official ${docToDownload.documentNumber} successfully!`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Opening document viewer for export...', 'info');
      setSelectedDoc(docToDownload);
    } finally {
      setDownloadingDocId(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    documentService.getRecentDocuments(userId, userRole, limit).then(docs => {
      if (mounted) {
        setDocuments(docs);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId, userRole, limit]);

  // Determine fallback path based on role
  const resolvedPath = allDocumentsPath || (
    userRole === 'TEACHER' ? '/teacher/documents' :
    userRole === 'LIBRARY_OWNER' ? '/library-owner/documents' :
    userRole === 'DISTRICT_ADMIN' ? '/district-admin/documents' :
    userRole === 'SUPER_ADMIN' ? '/super-admin/documents' :
    '/student/documents'
  );

  const getDocIcon = (category: string) => {
    switch (category) {
      case 'IDENTITY':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'SALARY':
      case 'PAYMENT':
      case 'BOOKING':
      case 'SUBSCRIPTION':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'CERTIFICATE':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'DEMO':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const latestSalarySlip = userRole === 'TEACHER'
    ? documents.find(d => d.category === 'SALARY' || d.documentType === 'TEACHER_SALARY_SLIP')
    : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Documents & Receipts</h3>
            <p className="text-xs text-slate-600 font-medium">Official digital credentials, salary slips and invoices</p>
          </div>
        </div>

        <NavLink
          to={resolvedPath}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>All Documents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      {/* Featured Teacher Salary Slip Banner (For Teachers) */}
      {userRole === 'TEACHER' && latestSalarySlip && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-royal-blue-50/30 to-slate-50 border-2 border-emerald-300 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>DIRECT NEFT DISBURSED</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-royal-blue-900 bg-white px-2 py-0.5 rounded border border-royal-blue-200">
              {latestSalarySlip.documentNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
              Official Monthly Compensation Voucher
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
              ZYZU'S Official Teacher Monthly Salary Slip
            </h4>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-slate-700 font-semibold">
                Cycle: {latestSalarySlip.billingPeriod || 'September 2026'}
              </span>
              <span className="text-base font-black font-mono text-emerald-800">
                {formatCurrency(latestSalarySlip.amount || 14600)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">
              ✓ Credited to SBI A/c XXXX 3381 • UTR: SBI-NEFT-99120481
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedDoc(latestSalarySlip)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>View Official Salary Slip</span>
            </Button>
            <button
              onClick={() => setSelectedDoc(latestSalarySlip)}
              className="p-1.5 rounded-xl bg-white border border-emerald-300 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Print Salary Slip"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleDirectDownload(latestSalarySlip, e)}
              disabled={downloadingDocId === latestSalarySlip.id}
              className="p-1.5 rounded-xl bg-white border border-emerald-300 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Download Official Salary Slip"
            >
              <Download className={`w-3.5 h-3.5 ${downloadingDocId === latestSalarySlip.id ? 'animate-bounce text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Widget Content List */}
      <div>
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-600 font-medium">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading credentials...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600">
            <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-800">No official documents available yet.</p>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Documents will appear automatically upon confirmed transactions or registrations.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/90 hover:border-blue-300 transition-all text-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {getDocIcon(doc.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium mt-0.5">
                      <span className="font-mono font-bold text-slate-800">{doc.documentNumber}</span>
                      <span>·</span>
                      <span>{new Date(doc.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      {doc.amount > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-mono font-bold text-emerald-800">{formatCurrency(doc.amount)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 transition-colors cursor-pointer"
                    title="View Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDirectDownload(doc, e)}
                    disabled={downloadingDocId === doc.id}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 transition-colors cursor-pointer"
                    title="Download Document"
                  >
                    <Download className={`w-3.5 h-3.5 ${downloadingDocId === doc.id ? 'animate-bounce text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {selectedDoc && (
        <UnifiedDocumentViewer
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          currentUserId={userId}
          currentUserRole={userRole}
        />
      )}
    </div>
  );
};
