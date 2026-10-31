// FOCUSPOINT Futuristic Mock Test & Study Material Operator Quick Login Modal

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Cpu,
  Terminal,
  Lock,
  Zap
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface OperatorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorLoginModal: React.FC<OperatorLoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('OPR-IN-2026-001');
  const [password, setPassword] = useState('operator123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Operator Login ID and Password are required for authentication.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(identifier, password);
      if (res.success && res.user) {
        showToast(`Welcome ${res.user.name}! Operator Command Center authenticated.`, 'success');
        onClose();
        navigate('/operator/dashboard');
      } else {
        setError(res.error || 'Access Denied: Invalid Operator ID or Password. Verify with Super Admin.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('OPR-IN-2026-001');
    setPassword('operator123');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Operator Terminal Access Gateway"
      description="Super Admin authorized portal for mock test authoring, question banks, and curriculum curation."
    >
      <div className="space-y-4 pt-1 font-sans">
        {/* Futuristic Cyber Protocol HUD Strip */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-extrabold tracking-widest text-cyan-300 uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
                  PROTOCOL::TLS-1.3
                </span>
                <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GATEWAY ACTIVE
                </span>
              </div>
              <p className="text-xs font-black text-slate-100 mt-1">Super Admin Authorized Authentication</p>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                Enter your designated <strong>Operator Login ID</strong> (<span className="font-mono text-cyan-300 font-bold">OPR-IN-2026-001</span>) and assigned password.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono text-[11px]">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Operator ID Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Operator Login ID *
              </label>
              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                FORMAT: OPR-XX-YYYY-ZZZ
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. OPR-IN-2026-001"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 font-mono text-xs text-slate-900 dark:text-cyan-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
              />
              <Terminal className="w-4 h-4 absolute right-3.5 top-3 text-slate-400 dark:text-cyan-500" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Operator Password *
              </label>
              <span className="text-[11px] text-slate-500">Encrypted Passkey</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-cyan-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Futuristic 1-Click Keycard Shortcut */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 text-left transition-all flex items-center justify-between cursor-pointer group shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    Sunita Verma Keycard
                    <span className="text-[10px] text-cyan-300 font-normal">[Verified]</span>
                  </span>
                  <span className="block font-mono text-[10px] text-cyan-400/90">
                    ID: <strong>OPR-IN-2026-001</strong> | Pass: <strong>operator123</strong>
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-2.5 py-1 rounded-md border border-cyan-600/60 uppercase tracking-wider group-hover:bg-cyan-900 transition-colors">
                Auto-Fill
              </span>
            </button>
          </div>

          {/* Futuristic Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 active:scale-98 transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/40 cursor-pointer mt-2"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Launch Console'}</span>
            <ArrowRight className="w-4 h-4 text-cyan-200" />
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">Need credential reset?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/login?role=operator');
            }}
            className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
          >
            Full Portal Route →
          </button>
        </div>
      </div>
    </Modal>
  );
};
