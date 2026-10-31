import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, Mail, Lock, Phone, ArrowRight, 
  Sparkles, KeyRound, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, switchRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'password' | 'otp' | 'operator'>('password');
  const [identifier, setIdentifier] = useState('student.aryan@focuspoint.internal');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [otpMobile, setOtpMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = searchParams.get('redirect');

  React.useEffect(() => {
    const roleParam = searchParams.get('role') || searchParams.get('portal');
    if (roleParam === 'operator') {
      setActiveTab('operator');
      setIdentifier('OPR-IN-2026-001');
      setPassword('operator123');
    }
  }, [searchParams]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter both email/mobile and password', 'warning');
      return;
    }

    setIsLoading(true);
    const success = await login(identifier, password);
    setIsLoading(false);

    if (success) {
      const storedDestination = sessionStorage.getItem('fp_intended_destination');
      if (storedDestination) {
        sessionStorage.removeItem('fp_intended_destination');
      }
      const targetDestination = redirectPath || storedDestination;

      if (targetDestination) {
        navigate(targetDestination);
      } else {
        const u = await authService.getCurrentUser();
        const role = (u?.role || '').toLowerCase();
        if (role === 'district_admin') navigate('/district-admin');
        else if (role === 'super_admin') navigate('/super-admin');
        else if (role === 'study_material_operator') navigate('/operator/dashboard');
        else if (role === 'teacher') navigate('/teacher');
        else if (role === 'library_owner') navigate('/library-owner');
        else navigate('/student');
      }
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpMobile || otpMobile.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    setOtpSent(true);
    showToast(`Verification code sent to +91 ${otpMobile}. (Demo OTP: 123456)`, 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      showToast('Invalid OTP. Please enter demo code 123456', 'error');
      return;
    }
    setIsLoading(true);
    await login('student.aryan@focuspoint.internal', 'pass');
    setIsLoading(false);

    const storedDestination = sessionStorage.getItem('fp_intended_destination');
    if (storedDestination) {
      sessionStorage.removeItem('fp_intended_destination');
    }
    const targetDestination = redirectPath || storedDestination || '/student/dashboard';
    navigate(targetDestination);
  };

  const handleQuickFill = async (role: UserRole, email: string, defaultPath: string) => {
    setIdentifier(email);
    setPassword('password123');
    await switchRole(role);
    navigate(defaultPath);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo variant="primary" size="lg" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Sign In to Your Portal</h1>
          <p className="text-xs text-slate-600">
            Access student requests, teacher schedules, or district administration.
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-xl">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 pb-2 gap-1">
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === 'password'
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Standard Login
            </button>
            <button
              onClick={() => {
                setActiveTab('operator');
                setIdentifier('OPR-IN-2026-001');
                setPassword('operator123');
              }}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'operator'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/70 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Operator Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('otp')}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === 'otp'
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Quick OTP
            </button>
          </div>

          {activeTab === 'operator' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Appointed Operator Security Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-indigo-950">Appointed Pan-India Exam Operator Access</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5 leading-relaxed">
                    Use your assigned <strong>Operator Login ID</strong> (e.g. <span className="font-mono font-bold text-indigo-900">OPR-IN-2026-001</span>) or registered email and the temporary password issued by your Super Admin.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operator Login ID or Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. OPR-IN-2026-001 or operator@focuspoint.internal"
                    className="w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all pr-10"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3 top-3 text-indigo-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Operator Password *
                  </label>
                  <span className="text-[11px] text-indigo-600 font-medium">Assigned by Super Admin</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Demo Fill Pill */}
              <button
                type="button"
                onClick={() => {
                  setIdentifier('OPR-IN-2026-001');
                  setPassword('operator123');
                }}
                className="w-full p-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-950">Sunita Verma (Lead Paper Setter)</p>
                  <p className="text-[10px] text-indigo-700 font-mono">Login ID: OPR-IN-2026-001 | Pass: operator123</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  Pre-fill Demo
                </span>
              </button>

              <Button 
                type="submit" 
                size="md" 
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold" 
                isLoading={isLoading}
              >
                Sign In to Operator Console
              </Button>
            </form>
          ) : activeTab === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Email, Mobile, or Operator ID"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@focuspoint.internal, OPR-IN-2026-001, or 9876543210"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password *
                  </label>
                  <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
                Sign In to Portal
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Input
                    label="Mobile Number (10 Digits)"
                    type="tel"
                    required
                    value={otpMobile}
                    onChange={(e) => setOtpMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  <Button type="submit" size="md" className="w-full">
                    Send Login Code
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <Input
                    label="Enter 6-Digit OTP"
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 123456"
                    leftIcon={<KeyRound className="w-4 h-4" />}
                    helperText="Demo code: 123456"
                  />
                  <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
                    Verify & Login
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Quick Fill Demo Credential Shortcuts */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('STUDENT', 'student.aryan@focuspoint.internal', '/student/dashboard')}
                className="p-2.5 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-slate-900 text-[11px]">Aryan (Student)</p>
                <p className="text-[10px] text-blue-700 font-medium">Class 11 CBSE</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('TEACHER', 'teacher.rajesh@focuspoint.internal', '/teacher/dashboard')}
                className="p-2.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-slate-900 text-[11px]">Dr. Rajesh (Teacher)</p>
                <p className="text-[10px] text-emerald-700 font-medium">Physics & Maths</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('LIBRARY_OWNER', 'owner.suresh@focuspoint.internal', '/library-owner/dashboard')}
                className="p-2.5 rounded-lg bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-slate-900 text-[11px]">Suresh (Library)</p>
                <p className="text-[10px] text-amber-800 font-medium">Saidpur Study Space</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('DISTRICT_ADMIN', 'admin.ghazipur@focuspoint.internal', '/district-admin/dashboard')}
                className="p-2.5 rounded-lg bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-slate-900 text-[11px]">Ghazipur Admin</p>
                <p className="text-[10px] text-purple-700 font-medium">District Console</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('STUDY_MATERIAL_OPERATOR', 'operator@focuspoint.internal', '/operator/dashboard')}
                className="col-span-2 p-2.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200 text-left transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 text-[11px]">Sunita Verma (Operator Console)</p>
                    <p className="text-[10px] text-indigo-700 font-medium">Pan-India Study Material & Mock Test Operator (operator@focuspoint.internal)</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('SUPER_ADMIN', 'superadmin@focuspoint.internal', '/super-admin/dashboard')}
                className="col-span-2 p-2.5 rounded-lg bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 text-left transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 text-[11px]">Super Admin Command Center</p>
                    <p className="text-[10px] text-rose-700 font-medium">Global System Management</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Registration Links */}
        <div className="text-center text-xs text-slate-600 space-y-1">
          <p>Don't have an account yet?</p>
          <div className="flex justify-center gap-3 font-semibold text-brand-600">
            <Link to="/register/student" className="hover:text-brand-700 hover:underline">Student Sign Up</Link>
            <span>•</span>
            <Link to="/register/teacher" className="hover:text-brand-700 hover:underline">Apply to Teach</Link>
            <span>•</span>
            <Link to="/register/library-owner" className="hover:text-brand-700 hover:underline">List Library</Link>
          </div>
          <div className="pt-2 text-[11px] text-slate-500 flex justify-center gap-2">
            <span>Administration:</span>
            <Link to="/district-admin/login" className="text-emerald-700 hover:underline font-semibold">District Admin Portal</Link>
            <span>•</span>
            <Link to="/super-admin/login" className="text-blue-700 hover:underline font-semibold">Super Admin Terminal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
