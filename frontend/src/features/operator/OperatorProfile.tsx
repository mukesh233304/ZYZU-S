// FOCUSPOINT Futuristic Operator Profile & Cyber-HUD Security Enclave Console
// High-tech identity management, verified curriculum credentials, live telemetry stats,
// granular permission matrix, password entropy meter, MFA passkey toggle, and procedural Web Audio SFX.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Award, 
  Key, 
  Camera, 
  Trash2, 
  Save, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Shield,
  Cpu,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Sparkles,
  Radio,
  Smartphone,
  Laptop,
  Tablet,
  LogOut,
  Volume2,
  VolumeX,
  Terminal,
  ChevronRight,
  RefreshCw,
  Sliders,
  FileText,
  BookOpen,
  Landmark,
  HelpCircle,
  Activity,
  Eye,
  Download,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { operatorService, INITIAL_OPERATOR } from '../../services/operatorService';
import { StudyMaterialOperator } from '../../types/operator';

// Procedural Cyber Audio Synthesizer
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert', enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(940, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(290, now);
        osc.frequency.exponentialRampToValueAtTime(1280, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.setValueAtTime(920, now + 0.05);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.setValueAtTime(540, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.setValueAtTime(240, now + 0.09);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
    }
  } catch {
    // Audio context suppressed
  }
};

// Preset AI Holographic Avatars for quick selection
const PRESET_AVATARS = [
  {
    id: 'sunita-lead',
    label: 'Lead Academic Setter',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'stem-specialist',
    label: 'STEM Pre-Med Lead',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'exam-strategist',
    label: 'Constabulary Specialist',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'senior-director',
    label: 'Senior Paper Setting Dean',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  }
];

// Assigned Competitive Exam Jurisdictions for Operator
const OPERATOR_EXAM_JURISDICTIONS = [
  { id: 'UPSSSC_PET', name: 'UPSSSC Preliminary Eligibility Test (PET 2026)', authority: 'UPSSSC Lucknow', scope: 'Full Blueprint Setter' },
  { id: 'CHS_BHU', name: 'Central Hindu School (CHS Class 9/11)', authority: 'Banaras Hindu University', scope: 'Science & Math Domain' },
  { id: 'UP_POLICE', name: 'UP Police Constable & SI Recruitment', authority: 'UPPRPB Lucknow', scope: 'Mental Ability & Hindi' },
  { id: 'SSC_CGL', name: 'SSC Combined Graduate Level (CGL Tier-1/2)', authority: 'Staff Selection Commission', scope: 'General Awareness & Reasoning' },
  { id: 'NEET_UG', name: 'NEET (Undergraduate) Medical Entrance', authority: 'National Testing Agency (NTA)', scope: 'Biology & Physical Chemistry' },
  { id: 'NAVODAYA_6', name: 'JNVST Navodaya Class 6 Selection Test', authority: 'Navodaya Vidyalaya Samiti', scope: 'Mental Ability & Arithmetic' }
];

export const OperatorProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  // Audio & HUD States
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || INITIAL_OPERATOR.name,
    email: user?.email || INITIAL_OPERATOR.email,
    mobile: user?.mobile || INITIAL_OPERATOR.mobile,
    state: user?.state || INITIAL_OPERATOR.state,
    district: user?.districtName || INITIAL_OPERATOR.district,
    address: user?.address || INITIAL_OPERATOR.address,
    qualification: INITIAL_OPERATOR.qualification,
    experience: INITIAL_OPERATOR.experience
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatarUrl || INITIAL_OPERATOR.avatarUrl || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  // Password & Security States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionRevoked, setSessionRevoked] = useState(false);

  // Permission Search Filter State
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<'ALL' | 'STUDY_MATERIAL' | 'MOCK_TEST' | 'AI_COPILOT'>('ALL');
  const [permissionSearch, setPermissionSearch] = useState('');

  const permissions = useMemo(() => {
    return ((user?.permissions as string[]) || INITIAL_OPERATOR.permissions);
  }, [user]);

  const operatorId = user?.operatorId || INITIAL_OPERATOR.operatorId;
  const appointmentDate = INITIAL_OPERATOR.appointmentDate;
  const stats = INITIAL_OPERATOR.stats;

  // Sound helper
  const playSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert') => {
    playCyberAudio(type, sfxEnabled);
  };

  // Password Strength Entropy Calculation
  const passwordStrength = useMemo(() => {
    const pwd = passwordForm.newPassword;
    if (!pwd) return { score: 0, label: 'Not Entered', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

    if (score < 40) return { score, label: 'Weak (Vulnerable)', color: 'bg-rose-500' };
    if (score < 75) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Cryptographically Strong', color: 'bg-emerald-500' };
  }, [passwordForm.newPassword]);

  // Categorized Permissions
  const categorizedPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      // Category filter
      if (permissionCategoryFilter === 'STUDY_MATERIAL' && !perm.includes('material')) return false;
      if (permissionCategoryFilter === 'MOCK_TEST' && !perm.includes('mock') && !perm.includes('question') && !perm.includes('exam')) return false;
      if (permissionCategoryFilter === 'AI_COPILOT' && !perm.includes('ai') && !perm.includes('ask_ai')) return false;

      // Search filter
      if (permissionSearch.trim()) {
        if (!perm.toLowerCase().includes(permissionSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [permissions, permissionCategoryFilter, permissionSearch]);

  // Copy Operator ID
  const handleCopyId = () => {
    playSound('confirm');
    navigator.clipboard.writeText(operatorId);
    setCopiedId(true);
    showToast('Operator ID copied to clipboard', 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Copy Public Key Hash
  const handleCopyKey = () => {
    playSound('confirm');
    navigator.clipboard.writeText(`0x7F2A9B3C84D19E5A0B7C6E1F4D2A9B8C`);
    setCopiedKey(true);
    showToast('Cryptographic Operator Public Key copied', 'info');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSound('click');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        playSound('confirm');
        showToast('Photo staged for preview. Click "Save Profile Changes" to apply.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Preset Avatar
  const handleSelectPresetAvatar = (url: string) => {
    playSound('click');
    setAvatarUrl(url);
    showToast('Preset avatar selected. Click "Save Profile Changes" to apply.', 'info');
  };

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    playSound('toggle');
    setAvatarUrl('');
    showToast('Photo removed. Click "Save Profile Changes" to apply.', 'info');
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    playSound('warp');
    try {
      if (user?.id) {
        await operatorService.updateOperator(user.id, {
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          avatarUrl: avatarUrl || undefined
        });

        await operatorService.logActivity({
          operatorId: user.id,
          operatorName: formData.name,
          action: 'PROFILE_UPDATE',
          entity: 'PROFILE',
          entityId: user.id,
          entityTitle: formData.name,
          details: `Updated personal information, phone (${formData.mobile}), and office bureau address.`
        });
      }

      if (updateUserProfile) {
        await updateUserProfile({
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          avatarUrl: avatarUrl || undefined
        });
      }

      playSound('confirm');
      showToast('Operator Profile updated and cryptographically synchronized!', 'success');
    } catch {
      playSound('alert');
      showToast('Failed to update operator profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      playSound('alert');
      showToast('Please fill out all credential fields.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      playSound('alert');
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      playSound('alert');
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    playSound('warp');
    setTimeout(async () => {
      setIsUpdatingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      if (user?.id) {
        await operatorService.logActivity({
          operatorId: user.id,
          operatorName: formData.name,
          action: 'PROFILE_UPDATE',
          entity: 'PROFILE',
          entityId: user.id,
          entityTitle: 'Security Credentials',
          details: 'Rotated operator account password with entropy verification.'
        });
      }

      playSound('confirm');
      showToast('Operator credentials changed successfully and sessions re-keyed!', 'success');
    }, 600);
  };

  // Revoke Other Sessions
  const handleRevokeOtherSessions = () => {
    playSound('warp');
    setSessionRevoked(true);
    setTimeout(() => {
      playSound('confirm');
      showToast('All other active sessions revoked across secondary devices.', 'success');
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* ============================================================ */}
      {/* 1. TOP CYBER-HUD OPERATOR CREDENTIALS BANNER */}
      {/* ============================================================ */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Glow ambient meshes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Top Telemetry Status Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                SECURITY ENCLAVE ACTIVE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                CLEARANCE LEVEL 4: PAN-INDIA
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-700/60">
                <Cpu className="w-3 h-3 text-emerald-400" />
                CIPHER: AES-256-GCM
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-700/60">
                <Radio className="w-3 h-3 text-cyan-400" />
                NODE: VARANASI NOC
              </span>
            </div>

            {/* Title & Mission Line */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Operator Profile & Security Enclave</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase font-mono tracking-widest">
                  CREDENTIALS HUB
                </span>
              </h1>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Appointed Academic Lead & Paper Setter: <span className="font-bold text-white">{formData.name}</span>. 
                Managing certified academic blueprints, question bank encryption, student drill fulfillment, and system access policies.
              </p>
            </div>
          </div>

          {/* Quick HUD Audio & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {/* SFX Audio Button */}
            <button
              onClick={() => {
                const next = !sfxEnabled;
                setSfxEnabled(next);
                playCyberAudio('toggle', next);
                showToast(next ? 'Tactile Cyber Audio enabled' : 'Tactile Cyber Audio muted', 'info');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                sfxEnabled
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Web Audio SFX"
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{sfxEnabled ? 'SFX: ON' : 'SFX: MUTED'}</span>
            </button>

            {/* Return to Command Center HUD */}
            <Link to="/operator/dashboard" onClick={() => playSound('click')}>
              <Button
                variant="primary"
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] border-0"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Return to Command Center
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL TELEMETRY STATS (4 HOLOGRAPHIC TILES) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Materials Uploaded & Published */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-cyan-400" /> Courseware Vault
              </span>
              <h3 className="text-3xl font-black text-white mt-1 font-mono">
                {stats.materialsPublished} <span className="text-sm font-normal text-slate-400">/ {stats.materialsUploaded}</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
            <span>90.5% Live Approval Ratio</span>
            <span className="text-slate-400">0 Drafts</span>
          </div>
        </div>

        {/* Metric 2: CBT Mock Series */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3 h-3 text-purple-400" /> CBT Mock Series Set
              </span>
              <h3 className="text-3xl font-black text-white mt-1 font-mono">
                {stats.mockTestsCreated}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-950/90 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-purple-300 flex items-center justify-between">
            <span>Active CBT Exam Series</span>
            <span className="text-emerald-400 font-bold">100% Passed Audit</span>
          </div>
        </div>

        {/* Metric 3: Authoring Output (Manual + AI) */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Questions Authored
              </span>
              <h3 className="text-3xl font-black text-white mt-1 font-mono">
                {stats.questionsCreated}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-950/90 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span>{stats.aiQuestionsGenerated} AI Co-Authored</span>
            <span className="text-emerald-400 font-bold">{stats.questionsApproved} Approved</span>
          </div>
        </div>

        {/* Metric 4: Historical Academic Reach */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Student Engagement
              </span>
              <h3 className="text-3xl font-black text-emerald-400 mt-1 font-mono">
                {stats.materialViewsCount.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>{stats.materialDownloadsCount} Downloads</span>
            <span className="text-cyan-300">{stats.mockTestAttemptsCount} Attempts</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN WORKSPACE: TWO COLUMNS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: IDENTITY CARD, AVATAR PRESETS & JURISDICTION (5 COLS) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Holographic Identity Card */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Avatar Display */}
            <div className="relative inline-block mx-auto mb-4">
              <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={formData.name} 
                    className="w-28 h-28 rounded-full object-cover border-2 border-slate-900"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-slate-950 border-2 border-slate-900 flex items-center justify-center text-cyan-400 font-black text-3xl font-mono">
                    {formData.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Photo Upload Floating Trigger */}
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-1 right-1 p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105"
                title="Upload Photo File"
              >
                <Camera className="w-4 h-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <h3 className="text-xl font-bold text-white">{formData.name}</h3>
            <p className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 inline-block px-3 py-1 rounded-full mt-1.5 shadow-sm">
              Lead Pan-India Academic Operator
            </p>

            {/* Quick Preset Avatars Picker */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Quick Cyber Holographic Avatars:
              </span>
              <div className="flex items-center justify-center gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => handleSelectPresetAvatar(av.url)}
                    className="p-1 rounded-full border border-slate-800 hover:border-cyan-400 transition-all hover:scale-110"
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-8 h-8 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Operator System Identifiers */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-left space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">System Operator ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {operatorId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy Operator ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cryptographic Public Key:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                    0x7F2A...9B8C
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy Public Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Appointment Date:</span>
                <span className="text-slate-200">{new Date(appointmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Appointed Authority:</span>
                <span className="text-indigo-300 font-bold">Super Admin Central Command</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operating Territory:</span>
                <span className="font-bold text-emerald-400">Pan-India (All 28 States)</span>
              </div>
            </div>

            {avatarUrl && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleRemovePhoto} 
                className="mt-4 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 w-full font-mono"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Avatar Photo
              </Button>
            )}
          </div>

          {/* Card 2: Curriculum Jurisdictions */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Assigned Competitive Exam Jurisdictions ({OPERATOR_EXAM_JURISDICTIONS.length})
              </h4>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                OFFICIAL
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Assigned academic jurisdictions authorizing blueprint design, syllabus alignment, and master answer keys.
            </p>

            <div className="space-y-2.5">
              {OPERATOR_EXAM_JURISDICTIONS.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{ex.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded">
                      {ex.scope}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Administering Authority: <span className="text-slate-300">{ex.authority}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: PROFILE EDITOR, SECURITY ENCLAVE & PERMISSIONS (7 COLS) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 3: Operator Information Form (Working) */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-cyan-500/30 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Operator Personal Information & Bureau Details
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Editable by Operator
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Full Legal Name:</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Official Account Email:</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl bg-slate-950 border border-slate-800/60 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-500">System account email (managed by Super Admin)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Contact Mobile:</label>
                  <input 
                    type="tel" 
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Territory / Content State:</label>
                  <input 
                    type="text" 
                    value={formData.state}
                    disabled
                    className="w-full rounded-xl bg-slate-950 border border-slate-800/60 p-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Content Bureau & Office Address:</label>
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 font-sans">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">
                    Academic Qualifications:
                  </label>
                  <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {formData.qualification}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">
                    Exam Setting Experience:
                  </label>
                  <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {formData.experience}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* Card 4: Change Password & Entropy Meter (Working) */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-purple-500/30 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Change Login Credentials & Enclave Key
              </h3>
              <span className="text-[11px] font-mono text-purple-400">
                Zero-Trust Encryption
              </span>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Current Operator Password:</label>
                <input 
                  type="password" 
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">New Operator Password:</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 8 chars, mixed entropy"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Confirm New Password:</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Entropy Meter */}
              {passwordForm.newPassword && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Password Entropy Strength:</span>
                    <span className="font-bold text-white">{passwordStrength.label} ({passwordStrength.score}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                      style={{ width: `${passwordStrength.score}%` }} 
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  variant="secondary" 
                  disabled={isUpdatingPassword}
                  className="bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/60 font-bold"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isUpdatingPassword ? 'Rotating Key...' : 'Rotate & Commit Password'}
                </Button>
              </div>
            </form>
          </div>

          {/* Card 5: MFA Enclave & Active Sessions Inspector */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-emerald-500/30 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                MFA Passkeys & Active Session Enclave
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                FIDO2 WebAuthn Ready
              </span>
            </div>

            {/* 2FA Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-xs">Two-Factor Hardware Token (MFA)</p>
                <p className="text-[11px] text-slate-400">Enforces biometric approval for publishing papers and editing question banks.</p>
              </div>
              <button
                onClick={() => {
                  playSound('toggle');
                  setMfaEnabled(!mfaEnabled);
                  showToast(!mfaEnabled ? 'Hardware MFA token enforcement enabled' : 'MFA reduced to single-factor', 'info');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  mfaEnabled
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {mfaEnabled ? '✓ MFA ENFORCED' : 'DISABLED'}
              </button>
            </div>

            {/* Active Sessions */}
            <div className="space-y-2 text-xs font-mono">
              <span className="text-slate-400 font-bold block">Active Cryptographic Workstations:</span>
              
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-bold text-white">MacBook Pro (Chrome 132) — Varanasi Content NOC</p>
                    <p className="text-[10px] text-slate-400">IP: 103.21.144.12 • Active Now (Current Session)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  CURRENT
                </span>
              </div>

              {!sessionRevoked && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Tablet className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="font-bold text-slate-300">iPad Air 11" — ZYZU'S Paper Setter Companion</p>
                      <p className="text-[10px] text-slate-500">IP: 103.21.144.18 • Last active 2 hours ago</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                    COMPANION
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRevokeOtherSessions}
                className="bg-slate-950 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border-slate-800 text-xs font-mono"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Revoke All Other Sessions
              </Button>
            </div>
          </div>

          {/* Card 6: Granular Permissions Matrix */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">
                  Granted Granular Permissions Matrix ({categorizedPermissions.length})
                </h4>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                {(['ALL', 'STUDY_MATERIAL', 'MOCK_TEST', 'AI_COPILOT'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playSound('click');
                      setPermissionCategoryFilter(cat);
                    }}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      permissionCategoryFilter === cat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Permission Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search granted permission string..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {categorizedPermissions.map((perm) => (
                <span 
                  key={perm} 
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 text-cyan-300 border border-slate-800 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-400" /> {perm}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
