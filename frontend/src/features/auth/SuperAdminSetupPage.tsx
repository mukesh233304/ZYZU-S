import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  ArrowRight,
  Globe2,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

export const SuperAdminSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [masterSecurityKey, setMasterSecurityKey] = useState('');
  const [showSecurityKey, setShowSecurityKey] = useState(false);
  const [fullName, setFullName] = useState('Mukesh Sonkar');
  const [email, setEmail] = useState('mukesh.superadmin@focuspoint.internal');
  const [mobileNumber, setMobileNumber] = useState('9415000001');
  const [whatsappNumber, setWhatsappNumber] = useState('9415000001');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [password, setPassword] = useState('SuperAdmin@2026!');
  const [confirmPassword, setConfirmPassword] = useState('SuperAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  // Handle Photo Upload with compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarPreview(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
  };

  const handleMobileChange = (val: string) => {
    setMobileNumber(val);
    if (sameAsMobile) {
      setWhatsappNumber(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!masterSecurityKey.trim()) {
      showToast('Please enter the Master Platform Security Key', 'warning');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!fullName.trim() || !email.trim() || !mobileNumber.trim()) {
      showToast('Please fill in all required administrator details', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.registerSuperAdmin({
        bootstrapKey: masterSecurityKey,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobileNumber.trim(),
        whatsappNumber: whatsappNumber.trim() || mobileNumber.trim(),
        password,
        avatarUrl: avatarPreview || undefined,
      });

      if (!result.success) {
        showToast(result.error || 'Failed to authorize Super Admin', 'error');
        setIsLoading(false);
        return;
      }

      setSetupComplete(true);
      showToast('Super Admin Master Account Authorized Successfully!', 'success');
      
      // Auto login to context
      await login(email, password);
      
      setTimeout(() => {
        navigate('/super-admin');
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'Error initializing Super Admin account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">
            FOCUS<span className="text-blue-500">POINT</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Tier-1 Security Authorization
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Super Admin Setup
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Authorized executive bootstrap flow. Establishes the Pan-India Directorate Master Authority.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <Card className="bg-slate-900/90 backdrop-blur-xl border-slate-800 shadow-2xl p-6 sm:p-8 rounded-3xl">
          {setupComplete ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white">Authentication Credentials Activated</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your Super Administrator authority has been logged in the national security registry. Redirecting to the Pan-India Command Center...
              </p>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Security Warning Callout */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-300">Authorized Personnel Only</p>
                  <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                    This setup requires the Master Security Key. Do not share credentials. All registration and initialization events are permanently audited.
                  </p>
                </div>
              </div>

              {/* Master Key Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  Master Platform Security Key <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecurityKey ? 'text' : 'password'}
                    value={masterSecurityKey}
                    onChange={(e) => setMasterSecurityKey(e.target.value)}
                    placeholder="Enter Master Security Key"
                    required
                    className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecurityKey(!showSecurityKey)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showSecurityKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Authorized Key for bootstrap testing:</span>
                  <button
                    type="button"
                    onClick={() => setMasterSecurityKey('FocusPoint@SuperAdmin2026!')}
                    className="text-blue-400 hover:underline font-mono cursor-pointer"
                  >
                    Use Demo Key
                  </button>
                </div>
              </div>

              {/* Profile Photo & Basic Info */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-3">
                  Super Administrator Identity & Profile
                </label>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer transition-colors text-[11px]">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Recommended: High resolution JPG/PNG. Will appear on national decrees and audit signatures.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Full Legal Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="e.g. Mukesh Sonkar"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Official Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="superadmin@focuspoint.internal"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Registered Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        required
                        placeholder="10-digit mobile"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      WhatsApp Dispatch Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        disabled={sameAsMobile}
                        placeholder="WhatsApp number"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-blue-500 font-semibold disabled:opacity-60"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsMobile}
                        onChange={(e) => {
                          setSameAsMobile(e.target.checked);
                          if (e.target.checked) setWhatsappNumber(mobileNumber);
                        }}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span className="text-[10px] text-slate-400">Same as registered mobile</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Admin Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Minimum 8 characters"
                        className="w-full h-10 pl-9 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter password"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize & Activate Super Admin Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    to="/super-admin/login"
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Already have Super Admin credentials? Sign in to Command Center →
                  </Link>
                </div>
              </div>
            </form>
          )}
        </Card>

        {/* Security Footer Notice */}
        <div className="text-center mt-6 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Pan-India Directorate of Education Infrastructure • Strict Role Validation Enforced</span>
        </div>
      </div>
    </div>
  );
};
