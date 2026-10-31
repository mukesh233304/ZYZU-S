// FOCUSPOINT Pan-India Mock Test & Study Material Operator Access Banner for Homepage

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  BookOpen, 
  Award,
  KeyRound,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Button } from '../common/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface OperatorAccessBannerProps {
  onOpenLoginModal: () => void;
}

export const OperatorAccessBanner: React.FC<OperatorAccessBannerProps> = ({ onOpenLoginModal }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleQuickDemoLogin = async () => {
    try {
      const res = await authService.login('OPR-IN-2026-001', 'operator123');
      if (res.success) {
        showToast('Logged in as Sunita Verma (Operator Console)', 'success');
        navigate('/operator/dashboard');
      } else {
        onOpenLoginModal();
      }
    } catch {
      onOpenLoginModal();
    }
  };

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 sm:p-10 border border-indigo-500/30 shadow-2xl relative overflow-hidden text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>ZYZU'S Examination Bureau • Operator Access</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Pan-India Mock Test & Study Material Operator Console
              </h2>

              <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                Appointed by the Super Admin? Log in with your <strong className="text-white">Operator Login ID</strong> (e.g. <span className="font-mono text-indigo-300">OPR-IN-2026-001</span>) and password to set mock papers, curate verified question banks, and publish syllabus-aligned study materials.
              </p>

              {/* Supported Exams Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                <span className="font-bold text-indigo-300">Coverage:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">SSC CGL</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">UPSSSC PET</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">RRB NTPC</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">BHU CHS Class 9</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">JNVST Navodaya</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">JEE & NEET UG</span>
              </div>
            </div>

            {/* Right CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer border border-indigo-400/40"
              >
                <KeyRound className="w-5 h-5 text-amber-300 shrink-0" />
                <span>Mock Test Operator Login</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-indigo-200 border border-white/20 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>1-Click Demo (Sunita Verma)</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Role Protected • Super Admin Governed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
