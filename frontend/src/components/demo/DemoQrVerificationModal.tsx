import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  Camera, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { demoService } from '../../services/demoService';
import { DemoBooking } from '../../types';

export interface DemoQrVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoQrVerificationModal: React.FC<DemoQrVerificationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tokenInput, setTokenInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    attempted: boolean;
    valid: boolean;
    message: string;
    booking?: DemoBooking;
  }>({
    attempted: false,
    valid: false,
    message: ''
  });

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = tokenInput.trim();
    if (!token) {
      showToast('Please enter or scan a Demo Booking ID or QR payload', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await demoService.verifyDemoQr(token, user?.id);
      setResult({
        attempted: true,
        valid: res.valid,
        message: res.message,
        booking: res.booking
      });

      if (res.valid) {
        showToast('Demo pass verified successfully!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setResult({
        attempted: true,
        valid: false,
        message: 'Network verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPasteDemo = (sampleId: string) => {
    setTokenInput(sampleId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Demo Pass QR Verification Tool
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                FocusPoint Gatekeeper & Attendance Scanner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Scanner Simulation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 text-center space-y-3 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Live Camera / Hardware Scanner Ready</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan the student's FocusPoint Demo ID Card barcode or enter ID manually below
              </p>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Enter Demo Booking ID or QR Data
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. FP-LIB-DEMO-20260918-0001"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Verification Result Card */}
          {result.attempted && (
            <div className="animate-fadeIn">
              {result.valid && result.booking ? (
                /* VERIFIED SUCCESS */
                <div className="p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-base text-white">
                        Access Approved • Valid FocusPoint Demo Pass
                      </h4>
                      <p className="text-xs text-emerald-400 font-medium">
                        Student entry authorized for demo session
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-4 border border-emerald-500/20 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Pass ID:</span>
                      <span className="font-mono font-bold text-cyan-300">{result.booking.demo_booking_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Student Name:</span>
                      <span className="font-bold text-white">{result.booking.student_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Target Venue:</span>
                      <span className="font-medium text-slate-200 text-right">{result.booking.service_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Scheduled Date & Time:</span>
                      <span className="font-medium text-amber-300">{result.booking.demo_date} • {result.booking.demo_time}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="font-bold text-emerald-400">{result.booking.payment_status} (₹{result.booking.price})</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* INVALID / REJECTED */
                <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-500/40 space-y-2 text-rose-300">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-base text-rose-200">
                        Verification Failed
                      </h4>
                      <p className="text-xs font-semibold text-rose-300">
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
