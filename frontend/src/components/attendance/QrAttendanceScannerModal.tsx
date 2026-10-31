import React, { useState, useEffect } from 'react';
import { 
  QrCode, Scan, CheckCircle2, AlertTriangle, X, 
  RefreshCw, Sparkles, Building, BookOpen, ShieldCheck, 
  ArrowRight, Camera, Smartphone, ChevronRight
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { attendanceService } from '../../services/attendanceService';
import { QrValidationResult, StudentActiveAttendanceService } from '../../types';

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess: (result: QrValidationResult, selectedService?: StudentActiveAttendanceService) => void;
}

export const QrAttendanceScannerModal: React.FC<QrAttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  studentId,
  onSuccess,
}) => {
  const [scanningStep, setScanningStep] = useState<'IDLE' | 'SCANNING' | 'VALIDATING' | 'RESULT'>('IDLE');
  const [scanResult, setScanResult] = useState<QrValidationResult | null>(null);
  const [customQrInput, setCustomQrInput] = useState('');
  const [selectedService, setSelectedService] = useState<StudentActiveAttendanceService | undefined>();

  useEffect(() => {
    if (isOpen) {
      setScanningStep('SCANNING');
      setScanResult(null);
      setSelectedService(undefined);
      setCustomQrInput('');
    }
  }, [isOpen]);

  const handleProcessQr = async (payload: string) => {
    setScanningStep('VALIDATING');
    try {
      const result = await attendanceService.validateQrCode(payload, studentId);
      setScanResult(result);
      if (result.valid && result.matchingServices && result.matchingServices.length === 1) {
        setSelectedService(result.matchingServices[0]);
      } else if (result.valid && result.matchingServices && result.matchingServices.length > 1) {
        setSelectedService(result.matchingServices[0]);
      }
      setScanningStep('RESULT');
    } catch {
      setScanResult({
        valid: false,
        error: 'Network or scanner error. Please try again.',
        errorCode: 'INVALID_QR',
      });
      setScanningStep('RESULT');
    }
  };

  const handleProceed = () => {
    if (scanResult && scanResult.valid) {
      onSuccess(scanResult, selectedService);
      onClose();
    }
  };

  const handleReset = () => {
    setScanningStep('SCANNING');
    setScanResult(null);
    setSelectedService(undefined);
    setCustomQrInput('');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="relative -mt-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>FocusPoint QR Scanner</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  AI Presense v2.0
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Unified Presence Intelligence for Home Tuition & Library
              </p>
            </div>
          </div>
        </div>

        {/* Scanner Viewport or Result Screen */}
        {scanningStep !== 'RESULT' ? (
          <div className="space-y-5">
            {/* Viewport Box */}
            <div className="relative aspect-[4/3] w-full max-w-md mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-center text-white">
              {/* Subtle background tech grid */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Viewfinder Target Reticle */}
              <div className="relative w-56 h-56 border-2 border-dashed border-white/30 rounded-2xl flex items-center justify-center p-3">
                {/* 4 Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br-lg" />

                {/* Animated Horizontal Laser Scan Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />

                {/* Center Icon */}
                <div className="text-center space-y-2 pointer-events-none">
                  <QrCode className="w-16 h-16 mx-auto text-white/40" />
                  <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Align QR in Frame
                  </p>
                </div>
              </div>

              {/* Status Bar */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl py-2 px-3 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {scanningStep === 'VALIDATING' ? 'Verifying Facility Credentials...' : 'Optical Sensor Active'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">256-BIT ENCRYPTED</span>
              </div>
            </div>

            {/* Quick Presets for Demo & Real Testing */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Test Facility QR Signatures
                </span>
                <span className="text-[11px] text-slate-600 font-medium">Click to simulate real scan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleProcessQr('fp-att://library/lib-focus-saidpur')}
                  className="flex items-center gap-2.5 p-3 text-left rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-xs font-semibold text-slate-800 group"
                >
                  <Building className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-slate-900">Digital Library QR</div>
                    <div className="text-[10px] text-slate-600 font-normal">Saidpur Facility (lib-focus-saidpur)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessQr('fp-att://tuition/usr-teacher-rajesh')}
                  className="flex items-center gap-2.5 p-3 text-left rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-xs font-semibold text-slate-800 group"
                >
                  <BookOpen className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-slate-900">Home Tuition QR</div>
                    <div className="text-[10px] text-slate-600 font-normal">Dr. Rajesh Sharma (usr-teacher-rajesh)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessQr('fp-att://universal/focuspoint')}
                  className="flex items-center gap-2.5 p-3 text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-800 group"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-slate-900">Universal FocusPoint QR</div>
                    <div className="text-[10px] text-slate-600 font-normal">Intelligent Dual-Service Detector</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessQr('fp-att://library/lib-unauthorized-09')}
                  className="flex items-center gap-2.5 p-3 text-left rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all text-xs font-semibold text-rose-800 group"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-bold text-rose-900">Unenrolled Facility QR</div>
                    <div className="text-[10px] text-rose-700 font-normal">Simulate Service Mismatch Error</div>
                  </div>
                </button>
              </div>

              {/* Manual Input Fallback */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Or enter custom QR URI / code (e.g. fp-att://library/...)"
                  value={customQrInput}
                  onChange={(e) => setCustomQrInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customQrInput.trim()) {
                      handleProcessQr(customQrInput.trim());
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (customQrInput.trim()) handleProcessQr(customQrInput.trim());
                  }}
                  disabled={!customQrInput.trim()}
                >
                  Validate
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Result View */
          <div className="space-y-6 py-2">
            {scanResult?.valid ? (
              <div className="space-y-5">
                {/* Success Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      QR Authenticated & Facility Verified
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {scanResult.facilityName || 'Authorized FocusPoint Attendance Point'}
                    </p>
                  </div>
                </div>

                {/* Service Selection (Multi-Service Universal QR) */}
                {scanResult.matchingServices && scanResult.matchingServices.length > 1 ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Select Attendance Service
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scanResult.matchingServices.map((svc) => {
                        const isSelected = selectedService?.serviceType === svc.serviceType;
                        return (
                          <div
                            key={svc.serviceType}
                            onClick={() => setSelectedService(svc)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                                {svc.serviceType === 'HOME_TUITION' ? '🏠 Home Tuition' : '📚 Digital Library'}
                              </span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <h5 className="text-sm font-bold text-slate-900">{svc.title}</h5>
                            <p className="text-xs text-slate-500 mt-1">{svc.subtitle}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Single Matching Service Detected */
                  scanResult.matchingServices && scanResult.matchingServices[0] && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Eligible Service Identified
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                          {scanResult.matchingServices[0].serviceType === 'HOME_TUITION' ? '🏠' : '📚'}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">
                            {scanResult.matchingServices[0].title}
                          </h5>
                          <p className="text-xs text-slate-600">
                            {scanResult.matchingServices[0].subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Primary Proceed Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    Scan Again
                  </Button>
                  <Button onClick={handleProceed} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold">
                    <span>Open Attendance Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Error State */
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="max-w-sm mx-auto space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    {scanResult?.errorCode === 'SERVICE_MISMATCH'
                      ? 'Service Access Not Available'
                      : 'QR Code Not Recognized'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {scanResult?.error || 'This QR code is invalid or no longer active.'}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-center gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleReset} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
