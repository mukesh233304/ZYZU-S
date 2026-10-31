import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  HelpCircle,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

export const DistrictAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('FP-DA-UP-GHA-001');
  const [password, setPassword] = useState('FocusPoint@Ghazipur2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Exact Error State (Section #11, #12, #27)
  const [errorInfo, setErrorInfo] = useState<{
    title: string;
    message: string;
    type: 'WRONG_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_INACTIVE' | 'MISSING_ASSIGNMENT' | 'UNAUTHORIZED_ROLE';
  } | null>(null);

  // First Login Force Password Rotation Modal (Section #9, #10)
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pendingAdminId, setPendingAdminId] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Futuristic Login Success Experience (Section #29)
  const [isVerifyingSuccess, setIsVerifyingSuccess] = useState(false);
  const [successStep, setSuccessStep] = useState(1);
  const [adminContext, setAdminContext] = useState<{ name: string; district: string } | null>(null);

  const executeSuccessTransition = (adminName: string, districtName: string) => {
    setAdminContext({ name: adminName, district: districtName });
    setIsVerifyingSuccess(true);
    setSuccessStep(1);

    setTimeout(() => setSuccessStep(2), 200);
    setTimeout(() => setSuccessStep(3), 400);
    setTimeout(() => {
      showToast(`Welcome back, ${adminName}. Authorized for ${districtName} District.`, 'success');
      navigate('/district-admin');
    }, 700);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const cleanInput = identifier.trim();
    if (!cleanInput || !password) {
      setErrorInfo({
        title: 'Sign-in failed',
        message: 'Please enter your District Admin User ID, Email, or Mobile, along with your password.',
        type: 'WRONG_CREDENTIALS'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Direct call to authService for complete error transparency (Section #3, #12)
      const res = await authService.login(cleanInput, password);

      if (res.success && res.user) {
        const role = (res.user.role || '').toLowerCase();

        // Verify authorized role (Section #21, #31)
        if (role !== 'district_admin') {
          setErrorInfo({
            title: 'Portal Access Restricted',
            message: 'Your account does not have District Admin permissions.',
            type: 'UNAUTHORIZED_ROLE'
          });
          showToast('Portal Access Restricted', 'error');
          setIsLoading(false);
          return;
        }

        // Check if First Login requires forced password rotation (Section #9, #10)
        if (res.requiresPasswordChange) {
          setPendingAdminId(res.user.id || cleanInput);
          setShowForcePasswordModal(true);
          setIsLoading(false);
          return;
        }

        // Update application auth context
        await refreshUser();
        const territory = res.user.authorizedDistrict || res.user.district || 'Ghazipur';
        executeSuccessTransition(res.user.name, territory);
      } else {
        // Map exact error types and messages (Section #11, #12)
        const type = res.errorType || 'WRONG_CREDENTIALS';
        let title = 'Sign-in failed';
        let message = res.error || 'The login credentials could not be verified. Please check your User ID, email/mobile and password.';

        if (type === 'ACCOUNT_SUSPENDED') {
          title = 'Account Suspended';
          message = 'Your District Admin account is currently suspended. Please contact the Super Admin.';
        } else if (type === 'ACCOUNT_INACTIVE') {
          title = 'Account Inactive';
          message = 'Your District Admin access has been deactivated.';
        } else if (type === 'MISSING_ASSIGNMENT') {
          title = 'District Access Not Assigned';
          message = 'Your account is active, but no district has been assigned to you. Please contact the Super Admin.';
        } else if (type === 'UNAUTHORIZED_ROLE') {
          title = 'Portal Access Restricted';
          message = 'Your account does not have District Admin permissions.';
        }

        setErrorInfo({ title, message, type });
        showToast(title, 'error');
      }
    } catch (err: any) {
      setErrorInfo({
        title: 'Authentication Error',
        message: err.message || 'An error occurred during authentication.',
        type: 'WRONG_CREDENTIALS'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForcePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const updateRes = await authService.changeDistrictAdminPassword(pendingAdminId, newPassword);
      if (updateRes.success) {
        setShowForcePasswordModal(false);
        showToast('Password changed successfully! Permanent credentials activated.', 'success');
        await refreshUser();
        const currentUser = await authService.getCurrentUser();
        const territory = currentUser?.authorizedDistrict || currentUser?.district || 'Ghazipur';
        executeSuccessTransition(currentUser?.name || 'Administrator', territory);
      } else {
        setPasswordError(updateRes.error || 'Failed to update permanent password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error rotating credentials');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleQuickFillGhazipur = () => {
    setIdentifier('FP-DA-UP-GHA-001');
    setPassword('FocusPoint@Ghazipur2026');
    setErrorInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row items-stretch relative overflow-hidden font-sans">
      {/* Background accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Visual / Left Showcase Section */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-xl relative z-10">
        <div>
          <div className="mb-8">
            <BrandLogo variant="primary" theme="dark" size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            District Territorial Command
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Territorial Governance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-300">
              District Command Center
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
            Authorized portal for appointed Sole District Administrators. Direct jurisdiction over local certified home tutors, study libraries, school tuitions, and grievance resolution.
          </p>

          {/* WhatsApp Credential Dispatch Highlight (Requirement #1 & #23, #26) */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900/80 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <MessageSquare className="w-4 h-4" />
              <span>Assigned by Super Admin? Check WhatsApp</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              When the Super Admin appoints you to a district, your authorized account is automatically created and activated. Your <strong>User ID</strong> and <strong>temporary password</strong> are dispatched directly to your registered WhatsApp number.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] text-emerald-400/90 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero manual database updates required. Immediate login enabled.</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Strict District Isolation Enforced</span>
          </div>
          <span className="font-mono text-[11px]">District Tier-2 Access</span>
        </div>
      </div>

      {/* Right / Login Form Section */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              District Admin Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Sign in with your assigned User ID, registered Email, or Mobile number.
            </p>
          </div>

          {/* Exact Error Banners (Section #11, #12, #27) */}
          {errorInfo && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-rose-200 text-sm">{errorInfo.title}</p>
                <p className="mt-0.5 text-rose-300/90">{errorInfo.message}</p>
              </div>
            </div>
          )}

          <Card className="bg-slate-900/90 border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  User ID / Email / Mobile
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. FP-DA-UP-GHA-001 or 9415000000"
                    required
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Password / Temporary Credential
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
                    placeholder="Enter password from WhatsApp"
                    required
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
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

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>SECURE SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleQuickFillGhazipur}
                  className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors underline cursor-pointer"
                >
                  Quick Fill Demo Ghazipur Admin Credentials
                </button>
              </div>
            </form>
          </Card>

          {/* District Admin Support & FAQ Help */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Need Assistance?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If your account is suspended or you need credential recovery, please reach out to the State Directorate or Super Admin authority.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <Link to="/contact" className="text-blue-400 hover:underline">Support Desk</Link>
              <Link to="/login" className="text-slate-500 hover:text-slate-300">Teacher/Student Portal →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Force Password Change Modal (Section #9 & #10) */}
      {showForcePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Mandatory Security Protocol</span>
                <h3 className="text-lg font-bold text-white">First Login Required</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              For institutional security, you must replace the temporary credentials dispatched via WhatsApp with a new permanent password before entering the District Command Center.
            </p>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleForcePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">New Permanent Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Confirm New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Password Requirements:</p>
                <p className={newPassword.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ At least 8 characters in length
                </p>
                <p className={newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ Both password fields match
                </p>
              </div>

              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isUpdatingPassword ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Activate Permanent Password & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Futuristic Verification & Success Experience (Section #29) */}
      {isVerifyingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Welcome back</h3>
              <p className="text-emerald-400 font-bold text-sm">{adminContext?.name}</p>
              <p className="text-xs text-slate-400">{adminContext?.district} District Command Center</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-left">
              <div className={`flex items-center gap-2 transition-colors ${successStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Authentication Verified ✓</span>
              </div>
              <div className={`flex items-center gap-2 transition-colors ${successStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>District Authorization Verified ✓</span>
              </div>
              <div className={`flex items-center gap-2 transition-colors ${successStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Secure Session Established ✓</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono animate-pulse">
              Loading District Command Center...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
