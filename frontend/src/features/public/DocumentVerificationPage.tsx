import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  MapPin,
  Lock,
  ArrowLeft,
  Search,
  ExternalLink
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { DocumentVerificationResult } from '../../types/document';
import { Button } from '../../components/common/Button';
import { BrandLogo } from '../../components/common/BrandLogo';

export const DocumentVerificationPage: React.FC = () => {
  const { documentId, certificateId } = useParams<{ documentId?: string; certificateId?: string }>();
  const effectiveId = documentId || certificateId || '';
  const [queryInput, setQueryInput] = useState<string>(effectiveId);
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const performVerification = (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    documentService.verifyDocument(idToVerify.trim()).then((res) => {
      setResult(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (effectiveId) {
      setQueryInput(effectiveId);
      performVerification(effectiveId);
    } else {
      setLoading(false);
    }
  }, [effectiveId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(queryInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      {/* Top Header */}
      <div className="w-full max-w-xl text-center space-y-3 mb-8">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to ZYZU'S Platform</span>
        </NavLink>

        <div className="flex items-center justify-center mb-1">
          <BrandLogo variant="primary" theme="dark" size="md" />
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Sovereign Cryptographic Verification Portal
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          result?.isValid ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
        }`} />

        {/* Search / Scan Manual Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter Document ID (e.g. FP-SAL-2026-09-000145)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-xs font-bold shrink-0"
          >
            Verify
          </Button>
        </form>

        {/* Result Area */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">
              Querying sovereign cryptographic ledger...
            </p>
          </div>
        ) : result ? (
          result.isValid ? (
            /* VALID VERIFIED DOCUMENT */
            <div className="space-y-5 animate-fadeIn">
              {/* Authenticity Badge */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 block">
                    Cryptographic Ledger Verification
                  </span>
                  <h3 className="text-base font-black text-emerald-100">
                    AUTHENTIC OFFICIAL DOCUMENT
                  </h3>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    Digitally signed and cryptographically validated on the national directory.
                  </p>
                </div>
              </div>

              {/* Document Overview */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Document Title:</span>
                  <span className="font-bold text-white text-right max-w-[260px]">{result.title}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Document Number:</span>
                  <span className="font-mono font-bold text-amber-400">{result.documentNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recipient / Holder:</span>
                  <span className="font-bold text-white">{result.recipientName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Registered Role:</span>
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold uppercase">
                    {result.recipientRole.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Territory Jurisdiction:</span>
                  <span className="font-medium text-slate-200">{result.district}, {result.state}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Issue Date:</span>
                  <span className="font-medium text-slate-200">{result.issueDate}</span>
                </div>

                {result.validUntil && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Validity Period:</span>
                    <span className="font-medium text-slate-200">{result.validUntil}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Issuing Authority:</span>
                  <span className="font-semibold text-white">{result.authorizedBy}</span>
                </div>
              </div>

              {/* Hash & Security Note */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>Ledger Hash: {result.verificationHash}</span>
                </div>
                <p className="text-[9px] text-slate-500 font-sans">
                  Private financial records and bank account numbers are protected in compliance with digital privacy standards.
                </p>
              </div>
            </div>
          ) : (
            /* INVALID OR REVOKED */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-rose-400 block">
                    Verification Warning
                  </span>
                  <h3 className="text-base font-black text-rose-100">
                    CREDENTIAL NOT VALIDATED
                  </h3>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">
                    {result.publicNotes}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed text-center">
                If you believe this record is genuine, please double check the document number or contact the ZYZU'S Directorate Helpline.
              </p>
            </div>
          )
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            <FileText className="w-8 h-8 mx-auto text-slate-700 mb-2" />
            <span>Enter a document ID above or scan an official ZYZU'S QR code to verify.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[10px] text-slate-500">
        ZYZU'S Sovereign Educational & Financial Operating System · All Rights Reserved
      </div>
    </div>
  );
};
