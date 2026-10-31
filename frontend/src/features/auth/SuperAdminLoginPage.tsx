import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  GraduationCap, 
  Globe2, 
  Building2, 
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Smartphone,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { superAdminSecurityService } from '../../services/superAdminSecurityService';

export const SuperAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  // 3-Factor Steps: 1: Identity, 2: Master Security Key, 3: MFA / TOTP
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Factor 1: Credentials
  const [identifier, setIdentifier] = useState('superadmin@focuspoint.internal');
  const [password, setPassword] = useState('SuperAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // Factor 2: Master Security Key
  const [masterKey, setMasterKey] = useState('');
  const [showMasterKey, setShowMasterKey] = useState(false);

  // Factor 3: TOTP / Authenticator code
  const [mfaCode, setMfaCode] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Factor 1 Submission
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both administrative identifier and password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(identifier.trim(), password);
      if (success) {
        const currentUser = await authService.getCurrentUser();
        const role = (currentUser?.role || '').toLowerCase();

        if (role !== 'super_admin') {
          setErrorMessage('Unauthorized Role: This terminal is strictly reserved for Pan-India Super Administrators.');
          showToast('Unauthorized portal access for this account', 'error');
          setIsLoading(false);
          return;
        }

        // Factor 1 Passed -> Proceed to Factor 2
        setStep(2);
        showToast('Identity verified. Enter Master Security Key.', 'info');
      } else {
        setErrorMessage('Authentication Failed: Invalid Super Admin identifier or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Factor 2 Submission
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!masterKey.trim()) {
      setErrorMessage('Master Security Key is required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await superAdminSecurityService.verifyMasterKey(masterKey, identifier.trim());
      if (res.success) {
        setAttemptsRemaining(null);
        setIsLocked(false);
        setStep(3);
        showToast('Master Security Key verified. Enter 6-digit MFA code.', 'info');
      } else {
        setErrorMessage(res.error || 'Security Verification Failed: Invalid Master Security Key.');
        if (res.lockedUntil) {
          setIsLocked(true);
        } else if (typeof res.attemptsRemaining === 'number') {
          setAttemptsRemaining(res.attemptsRemaining);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error verifying Master Security Key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Factor 3 Submission
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mfaCode.trim()) {
      setErrorMessage('Please enter your 6-digit multi-factor verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = superAdminSecurityService.verifyFactor3MFA(mfaCode);
      if (res.success) {
        // All 3 factors passed -> create privileged session & navigate
        superAdminSecurityService.createPrivilegedSession(identifier.trim());
        showToast('Security Verification Complete. Pan-India Command Center authorized.', 'success');
        navigate('/super-admin');
      } else {
        setErrorMessage(res.error || 'Multi-Factor Verification Failed. Please verify your token.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error verifying multi-factor code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillCreds = () => {
    setIdentifier('superadmin@focuspoint.internal');
    setPassword('SuperAdmin@2026!');
    setErrorMessage(null);
  };

  const handleQuickFillMasterKey = () => {
    setMasterKey('FP-MASTER-SEC-2026!#9X');
    setErrorMessage(null);
  };

  const handleQuickFillMfa = () => {
    setMfaCode('948216');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row items-stretch relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Visual / Left Showcase Section */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-xl relative z-10">
        <div>
          <div className="mb-8">
            <BrandLogo variant="primary" theme="dark" size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            3-Factor Super Admin Security Architecture
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Pan-India Education <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400">
              Command Center
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
            Centralized orchestration of statewide educational infrastructure, certified tutors, institutional study libraries, and localized District Administrators across India.
          </p>

          {/* 3-Factor Step Progress Indicators */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-blue-400" />
              <span>Multi-Layer Authentication Verification</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-xl border text-center transition-all ${
                step === 1 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold' 
                  : step > 1 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase tracking-wider">Factor 1</div>
                <div className="text-xs font-bold mt-0.5">Identity</div>
              </div>

              <div className={`p-2.5 rounded-xl border text-center transition-all ${
                step === 2 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold' 
                  : step > 2 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase tracking-wider">Factor 2</div>
                <div className="text-xs font-bold mt-0.5">Master Key</div>
              </div>

              <div className={`p-2.5 rounded-xl border text-center transition-all ${
                step === 3 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase tracking-wider">Factor 3</div>
                <div className="text-xs font-bold mt-0.5">MFA Code</div>
              </div>
            </div>
          </div>

          {/* Infrastructure Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
                <Globe2 className="w-4 h-4" />
                <span>Jurisdictions</span>
              </div>
              <p className="text-xl font-black text-white">28 States / 8 UT</p>
              <p className="text-[11px] text-slate-500">Pan-India Master</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                <Building2 className="w-4 h-4" />
                <span>Pilot Network</span>
              </div>
              <p className="text-xl font-black text-white">75 Districts</p>
              <p className="text-[11px] text-slate-500">Uttar Pradesh Hub</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Security</span>
              </div>
              <p className="text-xl font-black text-white">Salted SHA-256</p>
              <p className="text-[11px] text-slate-500">Brute-Force Protected</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>National Infrastructure Engine Active</span>
          </div>
          <span className="font-mono text-[11px]">Security Core v3.0</span>
        </div>
      </div>

      {/* Right / Login Form Section */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-md space-y-6">

          {/* Header depending on current factor */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold font-mono">
              STEP {step} OF 3
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {step === 1 && 'Identity Verification'}
              {step === 2 && 'Master Security Verification'}
              {step === 3 && 'Multi-Factor Verification'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {step === 1 && 'Enter your authorized Super Admin credentials to initiate secure handshake.'}
              {step === 2 && 'Enter your secure administrator Master Security Key to proceed.'}
              {step === 3 && 'Enter the 6-digit multi-factor verification code from your authenticator device.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold">{errorMessage}</p>
                {attemptsRemaining !== null && (
                  <p className="mt-1 text-amber-300 font-semibold">
                    Attempts remaining before 15-minute terminal lockout: {attemptsRemaining}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="bg-slate-900/90 border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
            {/* STEP 1: CREDENTIALS */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Super Admin Email / Registered Mobile
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="superadmin@focuspoint.internal"
                      required
                      className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Master Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-400">Remember this administrative device</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleQuickFillCreds}
                    className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors underline cursor-pointer"
                  >
                    Quick Fill Demo Credentials
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: MASTER SECURITY KEY */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Master Security Key</p>
                    <p className="text-slate-400 mt-0.5">Enter your secure administrator key to continue.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Master Security Key
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showMasterKey ? 'text' : 'password'}
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder="Enter administrator key"
                      required
                      disabled={isLocked}
                      autoFocus
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMasterKey(!showMasterKey)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setStep(1); setErrorMessage(null); }}
                    className="w-1/3 h-12 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    <span>Back</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading || isLocked}
                    className="w-2/3 h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify Security Key</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleQuickFillMasterKey}
                    className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors underline cursor-pointer"
                  >
                    Quick Fill Demo Master Key (FP-MASTER-SEC-2026!#9X)
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: MULTI-FACTOR VERIFICATION */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Multi-Factor Authentication</p>
                    <p className="text-slate-400 mt-0.5">Enter the 6-digit verification code from your authenticator app.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Enter Verification Code
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="948216"
                      required
                      autoFocus
                      className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-lg font-mono tracking-widest text-center focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setStep(2); setErrorMessage(null); }}
                    className="w-1/3 h-12 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    <span>Back</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Security Verification</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleQuickFillMfa}
                    className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors underline cursor-pointer"
                  >
                    Quick Fill Demo TOTP Token (948216)
                  </button>
                </div>
              </form>
            )}
          </Card>

          {/* Setup Redirect Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 text-xs">
            <p className="text-slate-400">First time configuring this ZYZU'S installation?</p>
            <Link
              to="/super-admin/setup"
              className="font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>Initialize Master Super Administrator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
