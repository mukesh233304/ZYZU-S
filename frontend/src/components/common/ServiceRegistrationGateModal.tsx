import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, GraduationCap, BookMarked, Sparkles, 
  ArrowRight, ShieldCheck, LogIn, Users, BookOpen, CheckCircle2 
} from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface ServiceGateTarget {
  name: string;
  description: string;
  path: string;
  roleHint?: 'STUDENT' | 'TEACHER' | 'LIBRARY_OWNER';
  icon?: React.ReactNode;
}

interface ServiceRegistrationGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: ServiceGateTarget | null;
  serviceTitle?: string;
  serviceDescription?: string;
  intendedDestination?: string;
  roleHint?: 'STUDENT' | 'TEACHER' | 'LIBRARY_OWNER';
}

export const ServiceRegistrationGateModal: React.FC<ServiceRegistrationGateModalProps> = ({
  isOpen,
  onClose,
  service,
  serviceTitle,
  serviceDescription,
  intendedDestination,
  roleHint
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const targetService: ServiceGateTarget | null = service || (serviceTitle || intendedDestination ? {
    name: serviceTitle || "ZYZU'S Service",
    description: serviceDescription || "Access ZYZU'S educational and self-study platform services.",
    path: intendedDestination || '/',
    roleHint: roleHint || 'STUDENT'
  } : null);

  if (!isOpen || !targetService) return null;

  const handleRegister = (role: 'STUDENT' | 'TEACHER' | 'LIBRARY_OWNER') => {
    // Securely preserve intended destination
    sessionStorage.setItem('fp_intended_destination', targetService.path);
    onClose();
    if (role === 'TEACHER') {
      navigate('/register/teacher');
    } else if (role === 'LIBRARY_OWNER') {
      navigate('/register/library-owner');
    } else {
      navigate('/register/student');
    }
  };

  const handleSignIn = () => {
    sessionStorage.setItem('fp_intended_destination', targetService.path);
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(targetService.path)}`);
  };

  const handleQuickLogin = async (identifier: string, label: string) => {
    setIsLoading(true);
    try {
      const success = await login(identifier, 'pass');
      if (success) {
        showToast(`Signed in as ${label}. Continuing to ${targetService.name}...`, 'success');
        onClose();
        navigate(targetService.path);
      }
    } catch {
      showToast('Quick sign-in failed. Please use standard login.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-modal-title"
      >
        {/* Top Decorative Gradient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Gateway Required</span>
            </div>
            <h3 id="gate-modal-title" className="text-2xl font-black text-slate-950 tracking-tight">
              Create your ZYZU'S account to continue
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              You are accessing <strong className="text-slate-900">{targetService.name}</strong>. Create a free account or sign in to save your progress, secure bookings, and continue to your requested service.
            </p>
          </div>

          {/* Intended Target Service Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/30 border border-slate-200/80 flex items-start gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/25">
              {targetService.icon || <GraduationCap className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{targetService.name}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready to Access
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                {targetService.description}
              </p>
            </div>
          </div>

          {/* Core Action Buttons */}
          <div className="space-y-2.5">
            <Button
              onClick={() => handleRegister(targetService.roleHint || 'STUDENT')}
              className="w-full justify-center py-3.5 text-sm font-black shadow-lg shadow-brand-500/25 bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {targetService.roleHint === 'TEACHER' 
                ? 'Register as Teacher' 
                : targetService.roleHint === 'LIBRARY_OWNER' 
                ? 'Register as Library Owner' 
                : 'Create Free Student Account'}
            </Button>

            <Button
              variant="outline"
              onClick={handleSignIn}
              className="w-full justify-center py-3 text-sm font-bold border-slate-300 text-slate-800 hover:bg-slate-100 rounded-xl"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Existing Account
            </Button>
          </div>

          {/* Security & Verification Guarantee */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Secure & District KYC Verified
            </span>
            <span className="font-semibold text-slate-400">Zero spam calls</span>
          </div>

          {/* Quick Demo 1-Click Login (Instant Sandbox Navigation) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Prototyping / Quick Demo Sign-In
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('student.aryan@focuspoint.internal', 'Student Aryan')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 shadow-2xs transition-all cursor-pointer"
              >
                ⚡ Sign in as Student
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('teacher.rahul@focuspoint.internal', 'Teacher Rahul')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 shadow-2xs transition-all cursor-pointer"
              >
                ⚡ Sign in as Teacher
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('owner.vikram@focuspoint.internal', 'Library Owner')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 shadow-2xs transition-all cursor-pointer"
              >
                ⚡ Sign in as Library Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
