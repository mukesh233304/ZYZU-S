import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { superAdminProfileService, DEFAULT_ROOT_PROFILE } from '../../services/superAdminProfileService';
import { 
  SuperAdminProfileData, 
  SuperAdminSessionItem, 
  SuperAdminLoginLog, 
  UniversalIDCardData 
} from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { UniversalIdCardModal } from '../../components/common/UniversalIdCardModal';
import {
  User,
  Shield,
  Key,
  Bell,
  Camera,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  Lock,
  Clock,
  Laptop,
  LogOut,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu,
  Search,
  Filter,
  Eye,
  EyeOff,
  Activity,
  Zap,
  Globe,
  Radio
} from 'lucide-react';

// ============================================================================
// PROFILE SOUND SYNTHESIS ENGINE (Web Audio API)
// ============================================================================
class ProfileSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Sound enabled by default, user can mute with one click
    this.enabled = localStorage.getItem('fp_super_admin_profile_sound_muted') !== 'true';
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    localStorage.setItem('fp_super_admin_profile_sound_muted', val ? 'false' : 'true');
  }

  public play(type: 'click' | 'toggle' | 'success' | 'purge' | 'crypto' | 'copy') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'toggle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.06); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'purge') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'crypto') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'copy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(990, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio autoplay blocked or context unavailable
    }
  }
}

const soundEngine = new ProfileSoundEngine();

// ============================================================================
// CYBER AVATAR PRESETS
// ============================================================================
const CYBER_AVATAR_PRESETS = [
  {
    id: 'preset-1',
    name: 'Genesis Sovereign',
    tag: 'DEFAULT CHANCELLOR',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'preset-2',
    name: 'Quantum Executive',
    tag: 'CYBER VECTOR',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'preset-3',
    name: 'Command Architect',
    tag: 'ROOT OVERWATCH',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'preset-4',
    name: 'Neural Director',
    tag: 'DIRECTOR GENERAL',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  }
];

export const SuperAdminProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  // Primary State
  const [profile, setProfile] = useState<SuperAdminProfileData>(DEFAULT_ROOT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'alerts'>('profile');
  const [soundEnabled, setSoundEnabled] = useState(soundEngine.enabled);

  // Avatar & Photo Studio States
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [hasPhotoChanged, setHasPhotoChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security & Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [threeFactorEnabled, setThreeFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  // Master Recovery Key States
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(false);

  // Sessions & Login History States
  const [activeSessions, setActiveSessions] = useState<SuperAdminSessionItem[]>([]);
  const [loginHistory, setLoginHistory] = useState<SuperAdminLoginLog[]>([]);
  const [logFilter, setLogFilter] = useState<'ALL' | 'SUCCESS' | 'BLOCKED'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Multi-Wing Alert Channel Matrix
  const [alertChannels, setAlertChannels] = useState({
    security: { whatsapp: true, email: true, inApp: true },
    finance: { whatsapp: true, email: true, inApp: true },
    district: { whatsapp: true, email: true, inApp: true },
    operator: { whatsapp: false, email: true, inApp: true },
    content: { whatsapp: false, email: false, inApp: true },
    system: { whatsapp: true, email: true, inApp: true },
  });

  // Universal Sovereign ID Card Modal
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [idCardData, setIdCardData] = useState<UniversalIDCardData | null>(null);

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    soundEngine.setEnabled(nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) soundEngine.play('click');
  };

  // Load Profile and Initial Telemetry
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        const [prof, sessions, logs] = await Promise.all([
          superAdminProfileService.getProfile(),
          superAdminProfileService.getActiveSessions(),
          superAdminProfileService.getLoginHistory()
        ]);

        if (!isMounted) return;

        setProfile(prof);
        setActiveSessions(sessions);
        setLoginHistory(logs);

        if (prof.securitySettings) {
          setMfaEnabled(prof.securitySettings.twoFactorEnabled ?? true);
          setThreeFactorEnabled(prof.securitySettings.threeFactorEnabled ?? prof.threeFactorEnabled ?? true);
          setSessionTimeout(String(prof.securitySettings.sessionTimeoutMinutes || 60));
        }

        // Avatar check
        const isDeleted = localStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
        if (isDeleted) {
          setPhotoPreview('');
        } else {
          const cached =
            localStorage.getItem('fp_super_admin_avatar') ||
            localStorage.getItem('fp_superadmin_avatar') ||
            prof.avatarUrl ||
            '';
          setPhotoPreview(cached);
        }
      } catch (err) {
        console.error('Failed to load super admin profile', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Password Strength
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'UNSET', color: 'bg-slate-700' };
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (newPassword.length >= 12) score += 15;
    if (/[A-Z]/.test(newPassword)) score += 20;
    if (/[0-9]/.test(newPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 20;

    if (score < 40) return { score, label: 'VULNERABLE', color: 'bg-rose-500' };
    if (score < 70) return { score, label: 'MODERATE', color: 'bg-amber-500' };
    if (score < 90) return { score, label: 'STRONG', color: 'bg-blue-500' };
    return { score: 100, label: 'SOVEREIGN GRADE', color: 'bg-emerald-500' };
  }, [newPassword]);

  // Handle Photo Upload via Local File Input
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size must be under 4MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
        setHasPhotoChanged(true);
        soundEngine.play('click');
        showToast('New portrait preview loaded! Click "Save Sovereign Profile" to broadcast.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Select a Cyber Avatar Preset
  const handleSelectPresetAvatar = (url: string) => {
    setPhotoPreview(url);
    setHasPhotoChanged(true);
    soundEngine.play('toggle');
    showToast('Cyber portrait preset selected. Save changes to finalize.', 'info');
  };

  // Remove Photo Action
  const handleRemovePhoto = async () => {
    setPhotoPreview('');
    setHasPhotoChanged(false);
    soundEngine.play('purge');

    try {
      await superAdminProfileService.updateProfile({ avatarUrl: '' });
      await updateUserProfile({
        avatarUrl: '',
        avatar: '',
      });
      window.dispatchEvent(new CustomEvent('focuspoint_avatar_updated', { detail: { avatarUrl: '' } }));
      showToast('Super Admin profile portrait removed across the ecosystem.', 'info');
    } catch {
      showToast('Failed to remove portrait', 'error');
    }
  };

  // Save Sovereign Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    soundEngine.play('click');

    try {
      const updatedProfile = await superAdminProfileService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        designation: profile.designation,
        department: profile.department,
        sovereignTitle: profile.sovereignTitle,
        sovereignClearanceLevel: profile.sovereignClearanceLevel,
        bio: profile.bio,
        avatarUrl: photoPreview || profile.avatarUrl,
      });

      setProfile(updatedProfile);
      setHasPhotoChanged(false);

      await updateUserProfile({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        avatarUrl: photoPreview,
        avatar: photoPreview,
      });

      window.dispatchEvent(new CustomEvent('focuspoint_avatar_updated', { detail: { avatarUrl: photoPreview } }));
      soundEngine.play('success');
      showToast('Sovereign Root Profile updated and synchronized to pan-India ledger!', 'success');
    } catch {
      showToast('Failed to save sovereign profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Security Settings & Master Password
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match!', 'error');
        return;
      }
      if (newPassword.length < 8) {
        showToast('Master password must be at least 8 characters long!', 'error');
        return;
      }
    }

    setSaving(true);
    soundEngine.play('crypto');

    try {
      if (newPassword) {
        await superAdminProfileService.updateMasterPassword(newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      const updatedProfile = await superAdminProfileService.updateProfile({
        threeFactorEnabled,
        securitySettings: {
          ...profile.securitySettings!,
          twoFactorEnabled: mfaEnabled,
          threeFactorEnabled,
          sessionTimeoutMinutes: Number(sessionTimeout),
        }
      });

      setProfile(updatedProfile);
      soundEngine.play('success');
      showToast('Zero-Trust security parameters and cryptographic rules updated!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update security credentials';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Rotate Master Recovery Key
  const handleRotateRecoveryKey = async () => {
    if (!window.confirm('CRITICAL ACTION: Rotating the Master Recovery Seed Key will invalidate any previously issued emergency recovery codes. Are you sure you wish to proceed?')) {
      return;
    }

    setRotatingKey(true);
    soundEngine.play('crypto');

    try {
      const newKey = await superAdminProfileService.rotateMasterRecoveryKey();
      setProfile(prev => ({
        ...prev,
        masterRecoveryKey: newKey,
        securitySettings: prev.securitySettings ? { ...prev.securitySettings, masterRecoveryKey: newKey } : undefined
      }));
      setShowRecoveryKey(true);
      soundEngine.play('success');
      showToast('Master Recovery Key rotated! Store this securely in an offline air-gapped vault.', 'success');
    } catch {
      showToast('Failed to rotate Master Recovery Key', 'error');
    } finally {
      setRotatingKey(false);
    }
  };

  // Copy Recovery Key to Clipboard
  const handleCopyRecoveryKey = () => {
    const key = profile.masterRecoveryKey || 'FP-SOV-ALPHA-8821-QUANTUM-ROOT-9921-KEY';
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    soundEngine.play('copy');
    showToast('Master Recovery Key copied to secure clipboard!', 'info');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Revoke Individual Remote Session
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    soundEngine.play('purge');
    try {
      const updated = await superAdminProfileService.revokeSession(sessionId);
      setActiveSessions(updated);
      showToast('Remote node disconnected and session token revoked.', 'info');
    } catch {
      showToast('Failed to revoke session', 'error');
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Purge All Other Sessions (Emergency Kill Switch)
  const handlePurgeAllOtherSessions = async () => {
    if (!window.confirm('EMERGENCY PURGE: This will terminate all active remote login nodes across India, retaining only this current console session. Proceed?')) {
      return;
    }

    soundEngine.play('purge');
    try {
      const updated = await superAdminProfileService.revokeAllOtherSessions();
      setActiveSessions(updated);
      showToast('Emergency purge executed: All remote hardware nodes terminated!', 'success');
    } catch {
      showToast('Failed to purge remote sessions', 'error');
    }
  };

  // Open Sovereign ID Card
  const handleOpenIdCard = () => {
    soundEngine.play('click');
    const card: UniversalIDCardData = {
      id: profile.id || 'usr-super-admin',
      uniqueIdNumber: 'FP-SOV-ROOT-001',
      fullName: profile.name || 'Mukesh Sonkar',
      role: 'SUPER_ADMIN',
      designation: profile.designation || 'Chief Platform Architect & Root Chancellor',
      stateName: 'Pan-India Sovereign Territory',
      districtName: 'National Command Center — Ghazipur HQ',
      joiningDate: profile.joinedDate || '2024-01-01',
      validUntil: '2030-12-31',
      avatarUrl: photoPreview || profile.avatarUrl || undefined,
      authorizedSignatureBy: 'FOCUSPOINT Sovereign Governing Council & Cryptographic Root'
    };
    setIdCardData(card);
    setIsIdCardOpen(true);
  };

  // Export Executive Dossier
  const handleExportDossier = () => {
    soundEngine.play('click');
    const text = superAdminProfileService.exportExecutiveDossier(profile);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOCUSPOINT-Executive-Dossier-${profile.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Executive Sovereign Dossier exported successfully.', 'success');
  };

  // Filtered Access Logs
  const filteredLogs = useMemo(() => {
    return loginHistory.filter(log => {
      const matchesFilter = logFilter === 'ALL' || log.status === logFilter;
      const matchesQuery = 
        log.ip.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.device.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        (log.location && log.location.toLowerCase().includes(logSearchQuery.toLowerCase()));
      return matchesFilter && matchesQuery;
    });
  }, [loginHistory, logFilter, logSearchQuery]);

  // Alert Channel Matrix Toggle
  const toggleChannel = (category: keyof typeof alertChannels, channel: 'whatsapp' | 'email' | 'inApp') => {
    soundEngine.play('toggle');
    setAlertChannels(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      }
    }));
  };

  // Bulk Channel Presets
  const setAllChannels = (status: boolean) => {
    soundEngine.play('toggle');
    setAlertChannels({
      security: { whatsapp: status, email: status, inApp: true },
      finance: { whatsapp: status, email: status, inApp: true },
      district: { whatsapp: status, email: status, inApp: true },
      operator: { whatsapp: status, email: status, inApp: true },
      content: { whatsapp: status, email: status, inApp: true },
      system: { whatsapp: status, email: status, inApp: true },
    });
    showToast(status ? 'All dispatch channels enabled across operational wings' : 'Non-critical alert dispatch channels muted', 'info');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          <Cpu className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-xs uppercase font-mono tracking-widest text-purple-300">
          Decrypting Sovereign Root Clearance & Hardware Enclave...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-2 sm:px-4">
      {/* ========================================================================= */}
      {/* HEADER WITH AUDIO CONTROLS & ACTION BUTTONS                               */}
      {/* ========================================================================= */}
      <PageHeader
        title="Super Admin Profile & Sovereign Command Deck"
        subtitle="Sovereign Executive Identity, Zero-Trust 3FA Cryptography, Hardware Node Management & Pan-India Alert Dispatch"
        breadcrumbs={[
          { label: 'Super Administration', href: '/super-admin/dashboard' },
          { label: 'Sovereign Executive Profile' }
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={soundEnabled ? 'Acoustic Cyber Audio Enabled' : 'Mute Cyber Audio'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 hover:text-white hover:bg-purple-900/90 shadow-lg shadow-purple-950/40'
                  : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Export Dossier */}
            <button
              type="button"
              onClick={handleExportDossier}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Dossier</span>
            </button>

            {/* Official Sovereign ID Card */}
            <button
              type="button"
              onClick={handleOpenIdCard}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer border border-purple-400/40"
            >
              <CreditCard className="w-4 h-4 text-purple-200 animate-pulse" />
              <span>Sovereign ID Card</span>
            </button>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 4 HIGH-CONTRAST LIVE TELEMETRY PODS (FUTURISTIC HUD)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pod 1: Root Sovereign Authority (Purple) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1e0a38]/95 via-[#16062a]/95 to-[#0e021a]/95 border-2 border-purple-500/60 shadow-xl shadow-purple-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              Root Authority
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-200 border border-purple-400/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              LEVEL 5 OMEGA
            </span>
          </div>
          <div className="text-lg font-black text-white tracking-tight truncate">
            {profile.name}
          </div>
          <p className="text-[11px] text-purple-300/80 font-mono mt-0.5 truncate">
            {profile.sovereignTitle || 'Chief Platform Architect'}
          </p>
          <div className="mt-3 pt-2 border-t border-purple-800/40 flex items-center justify-between text-[10px] text-purple-300">
            <span>Merkle Seal:</span>
            <span className="font-mono text-white font-semibold">SHA256:VERIFIED</span>
          </div>
        </div>

        {/* Pod 2: Zero-Trust Security Posture (Rose) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2d0a18]/95 via-[#200611]/95 to-[#14020a]/95 border-2 border-rose-500/60 shadow-xl shadow-rose-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
              Zero-Trust Gate
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-200 border border-rose-400/50">
              3FA STEP-UP
            </span>
          </div>
          <div className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Post-Quantum Ready</span>
          </div>
          <p className="text-[11px] text-rose-300/80 font-mono mt-0.5">
            FIDO2 Hardware + TOTP Enforced
          </p>
          <div className="mt-3 pt-2 border-t border-rose-800/40 flex items-center justify-between text-[10px] text-rose-300">
            <span>Timeout Guard:</span>
            <span className="font-mono text-white font-semibold">{sessionTimeout} Minutes</span>
          </div>
        </div>

        {/* Pod 3: Active Device Nodes (Cyan/Blue) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0a1e38]/95 via-[#06152a]/95 to-[#020d1c]/95 border-2 border-cyan-500/60 shadow-xl shadow-cyan-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              Hardware Enclave
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-200 border border-cyan-400/50">
              LIVE NODES
            </span>
          </div>
          <div className="text-lg font-black text-white tracking-tight flex items-center justify-between">
            <span>{activeSessions.length} Authorized</span>
            <button
              type="button"
              onClick={handlePurgeAllOtherSessions}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
            >
              1-Click Purge
            </button>
          </div>
          <p className="text-[11px] text-cyan-300/80 font-mono mt-0.5">
            Current: MacBook Pro M3 Max
          </p>
          <div className="mt-3 pt-2 border-t border-cyan-800/40 flex items-center justify-between text-[10px] text-cyan-300">
            <span>Relay Location:</span>
            <span className="font-mono text-white font-semibold">Ghazipur Node (UP)</span>
          </div>
        </div>

        {/* Pod 4: Multi-Wing Alert Dispatch (Emerald) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#062417]/95 via-[#031910]/95 to-[#010e09]/95 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Carrier Dispatch
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>
          <div className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>WhatsApp & DLT SMS</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 font-mono mt-0.5 truncate">
            {profile.phone}
          </p>
          <div className="mt-3 pt-2 border-t border-emerald-800/40 flex items-center justify-between text-[10px] text-emerald-300">
            <span>Active Wings:</span>
            <span className="font-mono text-white font-semibold">6 / 6 Operational</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 HIGH-CONTRAST SEGMENTED NAVIGATION TABS                                 */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-2 text-xs font-bold shadow-xl">
        {/* Tab 1: Purple Identity */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            soundEngine.play('click');
          }}
          className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-700/30 border border-purple-400/40'
              : 'text-purple-200 hover:text-white hover:bg-purple-950/50 bg-transparent'
          }`}
        >
          <User className="w-4 h-4 text-purple-300" />
          <span className="tracking-wide">1. Sovereign Identity & Studio</span>
        </button>

        {/* Tab 2: Rose Security */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('security');
            soundEngine.play('click');
          }}
          className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-rose-700 to-pink-700 text-white shadow-lg shadow-rose-700/30 border border-rose-400/40'
              : 'text-rose-200 hover:text-white hover:bg-rose-950/50 bg-transparent'
          }`}
        >
          <Shield className="w-4 h-4 text-rose-300" />
          <span className="tracking-wide">2. Zero-Trust Security & 3FA</span>
        </button>

        {/* Tab 3: Cyan Sessions */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('sessions');
            soundEngine.play('click');
          }}
          className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-gradient-to-r from-cyan-700 to-blue-700 text-white shadow-lg shadow-cyan-700/30 border border-cyan-400/40'
              : 'text-cyan-200 hover:text-white hover:bg-blue-950/50 bg-transparent'
          }`}
        >
          <Laptop className="w-4 h-4 text-cyan-300" />
          <span className="tracking-wide">3. Device Nodes & Audit Logs</span>
        </button>

        {/* Tab 4: Emerald Alerts */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('alerts');
            soundEngine.play('click');
          }}
          className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-700/30 border border-emerald-400/40'
              : 'text-emerald-200 hover:text-white hover:bg-emerald-950/50 bg-transparent'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-300" />
          <span className="tracking-wide">4. Alert Dispatch Matrix</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SOVEREIGN IDENTITY & AVATAR STUDIO (PURPLE THEME)                  */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Avatar Studio */}
            <Card className="p-6 bg-[#16062a]/95 border-2 border-purple-500/50 shadow-2xl shadow-purple-950/50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Sovereign Portrait Studio
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-200 border border-purple-400/40">
                    PAN-INDIA SYNC
                  </span>
                </div>

                {/* Avatar Display Frame with Glow Ring */}
                <div className="relative mx-auto w-40 h-40 rounded-3xl overflow-hidden border-4 border-purple-400/80 shadow-2xl group bg-slate-950 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-800 via-indigo-700 to-purple-950 flex flex-col items-center justify-center text-white p-4">
                      <span className="text-4xl font-black tracking-wider">
                        {profile.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-90 mt-1">
                        Sovereign Root
                      </span>
                    </div>
                  )}

                  {/* Hover Upload Mask */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-purple-950/85 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer p-2"
                  >
                    <Camera className="w-7 h-7 mb-1 text-purple-300 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {photoPreview ? 'Replace Photo' : 'Upload Photo'}
                    </span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <p className="text-[11px] text-purple-200/80 leading-relaxed text-center px-1">
                  Synchronizes directly across top navbar badges, executive audit logs, and digital credential passes.
                </p>

                {/* Cyber Presets Selector */}
                <div className="space-y-2 pt-2 border-t border-purple-800/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block text-left">
                    Select High-Tech Preset:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {CYBER_AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(preset.url)}
                        title={preset.name}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                          photoPreview === preset.url
                            ? 'border-purple-300 scale-105 ring-2 ring-purple-400/50'
                            : 'border-purple-800/60 hover:border-purple-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-purple-950/40 group-hover:bg-transparent" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Avatar */}
              <div className="space-y-2 pt-3 border-t border-purple-800/40">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-purple-500/60 shadow-md"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-300" />
                  <span>Upload Local File</span>
                </button>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="w-full py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-500/40"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove Profile Photo</span>
                  </button>
                )}
              </div>
            </Card>

            {/* Right Column: Sovereign Credentials Form with Pure White Text & Purple Background */}
            <Card className="lg:col-span-2 p-6 bg-[#120422]/95 border-2 border-purple-500/50 shadow-2xl shadow-purple-950/50 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Executive Sovereign Mandate & Credentials
                  </h3>
                  <p className="text-xs text-purple-300/80">
                    Supreme Root Administrator Profile — Immutable Pan-India Governance Authority
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-200 border border-purple-400/50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" /> GENESIS ROOT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Legal Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all font-semibold outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* Official Email (Immutable) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300 flex items-center justify-between">
                    <span>Official Email (Immutable Enclave)</span>
                    <Lock className="w-3 h-3 text-purple-400" />
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full h-11 px-3.5 rounded-xl bg-[#0f031b]/90 border border-purple-900/60 font-mono text-purple-300/60 cursor-not-allowed outline-none select-none"
                    style={{
                      color: '#c084fc',
                      WebkitTextFillColor: '#c084fc',
                    }}
                  />
                </div>

                {/* Emergency Phone / SMS */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300">
                    Verified Emergency Phone & WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all font-semibold outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300">
                    Official Executive Designation *
                  </label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all font-semibold outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* Sovereign Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300">
                    Sovereign Protocol Title
                  </label>
                  <input
                    type="text"
                    value={profile.sovereignTitle || 'Sovereign Platform Architect & Chief Executive'}
                    onChange={(e) => setProfile({ ...profile, sovereignTitle: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all font-semibold outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* Clearance Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300">
                    Clearance Tier Mandate
                  </label>
                  <input
                    type="text"
                    value={profile.sovereignClearanceLevel || 'LEVEL 5 — SUPREME ROOT AUTHORITY'}
                    onChange={(e) => setProfile({ ...profile, sovereignClearanceLevel: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all font-semibold outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* Department / Executive Command Wing */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-purple-300">
                    Supreme Department / Directorate Wing
                  </label>
                  <input
                    type="text"
                    value={profile.department || 'Central Executive Directorate & Supreme Command'}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all font-semibold outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* Bio & Mandate */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-purple-300">
                    Executive Mandate & Constitutional Scope
                  </label>
                  <textarea
                    rows={4}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Describe command scope, regional expansion, tuition ecosystem directorship..."
                    className="w-full p-3.5 rounded-xl bg-[#1d0b33]/90 border border-purple-500/50 hover:border-purple-400 focus:border-purple-300 focus:bg-[#280e46] transition-all text-xs outline-none shadow-inner resize-none leading-relaxed"
                    style={{
                      color: '#ffffff',
                      caretColor: '#c084fc',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-purple-800/40">
                <span className="text-[11px] text-purple-300/80 font-mono">
                  Employee Ref: {profile.employeeId || 'FP-ROOT-001'} • Active Since: {profile.joinedDate || '2024-01-01'}
                </span>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 border border-purple-400/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Synchronizing...' : 'Save Sovereign Profile'}</span>
                </button>
              </div>
            </Card>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ZERO-TRUST SECURITY, 3FA & MASTER KEY (ROSE THEME)                */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Master Password & Step-Up 3FA */}
            <Card className="lg:col-span-2 p-6 bg-[#200612]/95 border-2 border-rose-500/50 shadow-2xl shadow-rose-950/50 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-rose-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-500/40">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Master Authentication & Cryptographic Gate
                    </h3>
                    <p className="text-xs text-rose-300/80">
                      Enforce Zero-Trust protocols, update master passphrase, and seal multi-factor tiers
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswords ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-rose-300">
                    Current Master Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#2d0b1a]/90 border border-rose-500/50 hover:border-rose-400 focus:border-rose-300 focus:bg-[#3d0f24] transition-all font-mono outline-none shadow-inner"
                    style={{
                      color: '#ffffff',
                      caretColor: '#fb7185',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-rose-300">
                      New Master Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#2d0b1a]/90 border border-rose-500/50 hover:border-rose-400 focus:border-rose-300 focus:bg-[#3d0f24] transition-all font-mono outline-none shadow-inner"
                      style={{
                        color: '#ffffff',
                        caretColor: '#fb7185',
                        WebkitTextFillColor: '#ffffff',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-rose-300">
                      Confirm New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new passphrase"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#2d0b1a]/90 border border-rose-500/50 hover:border-rose-400 focus:border-rose-300 focus:bg-[#3d0f24] transition-all font-mono outline-none shadow-inner"
                      style={{
                        color: '#ffffff',
                        caretColor: '#fb7185',
                        WebkitTextFillColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="p-3 rounded-xl bg-[#16040c]/90 border border-rose-800/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-300">Entropy Strength:</span>
                      <span className="font-black text-white">{passwordStrength.label} ({passwordStrength.score}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Multi-Factor Authentication (MFA & 3FA) Controls */}
                <div className="pt-4 border-t border-rose-800/40 space-y-3">
                  <h4 className="text-xs font-black text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    Multi-Tier Authentication Guards (MFA / 3FA)
                  </h4>

                  {/* 2FA TOTP Toggle */}
                  <div className="p-4 rounded-xl bg-[#2d0b1a]/80 border border-rose-500/40 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-white text-xs">Two-Factor Authentication (TOTP App)</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-black bg-rose-500/20 text-rose-200 border border-rose-500/40">
                          {mfaEnabled ? 'ENFORCED' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-300/80">
                        Demands a 6-digit cryptographic TOTP code from Google Authenticator on every root login.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={mfaEnabled}
                        onChange={(e) => {
                          setMfaEnabled(e.target.checked);
                          soundEngine.play('toggle');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {/* 3FA WhatsApp / SMS Biometric Step-Up Toggle */}
                  <div className="p-4 rounded-xl bg-[#2d0b1a]/80 border border-rose-500/40 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-pink-400" />
                        <span className="font-bold text-white text-xs">Three-Factor Step-Up Security (3FA / WhatsApp OTP)</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-black bg-pink-500/20 text-pink-200 border border-pink-500/40">
                          {threeFactorEnabled ? '3FA ACTIVE' : 'BYPASSABLE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-300/80">
                        Dispatches instant biometric challenge to verified WhatsApp before allowing financial batch payouts or master key changes.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={threeFactorEnabled}
                        onChange={(e) => {
                          setThreeFactorEnabled(e.target.checked);
                          soundEngine.play('toggle');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  {/* Automated Timeout */}
                  <div className="p-4 rounded-xl bg-[#2d0b1a]/80 border border-rose-500/40 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-white text-xs">Automated Console Idle Lockout</span>
                      <p className="text-[11px] text-rose-300/80">Lock command deck screen when terminal sits idle</p>
                    </div>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => {
                        setSessionTimeout(e.target.value);
                        soundEngine.play('toggle');
                      }}
                      className="h-10 px-3 rounded-xl bg-[#19040e] border border-rose-500/50 text-white font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">60 Minutes (Standard)</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-rose-800/40">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 border border-rose-400/40"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Updating...' : 'Update Security Parameters'}</span>
                  </button>
                </div>
              </form>
            </Card>

            {/* Right Col: Master Recovery Seed Key Vault */}
            <Card className="p-6 bg-[#200612]/95 border-2 border-rose-500/50 shadow-2xl shadow-rose-950/50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Master Recovery Seed
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-200 border border-rose-400/40">
                    AIR-GAPPED
                  </span>
                </div>

                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  The Sovereign Master Recovery Key is the final cryptographic seed used to regain root ownership in the event of hardware enclave failure.
                </p>

                {/* Key Container Box with Pure White Text & Rose Glow */}
                <div className="p-4 rounded-xl bg-[#14020a]/95 border-2 border-rose-500/60 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-300">
                    <span>Cryptographic Seed:</span>
                    <button
                      type="button"
                      onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                      className="text-rose-400 hover:text-white font-bold cursor-pointer"
                    >
                      {showRecoveryKey ? 'Mask Key' : 'Reveal Key'}
                    </button>
                  </div>

                  <div className="font-mono text-xs break-all font-black py-1 tracking-wider" style={{ color: '#ffffff' }}>
                    {showRecoveryKey
                      ? (profile.masterRecoveryKey || 'FP-SOV-ALPHA-8821-QUANTUM-ROOT-9921-KEY')
                      : '••••-••••-••••-••••-••••-••••-••••'}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-rose-900/60 text-[10px] text-rose-300/70">
                    <span>Rounds: 12-AES-GCM</span>
                    <span>Status: VALIDATED</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyRecoveryKey}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-rose-500/50 shadow-md"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-rose-300" />}
                    <span>{copiedKey ? 'Copied to Clipboard!' : 'Copy Master Key'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRotateRecoveryKey}
                    disabled={rotatingKey}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50 border border-rose-400/40"
                  >
                    <RefreshCw className={`w-4 h-4 ${rotatingKey ? 'animate-spin' : ''}`} />
                    <span>{rotatingKey ? 'Rotating Key...' : 'Rotate Master Key'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#2d0b1a]/50 border border-rose-800/40 text-[10px] text-rose-300/80 leading-relaxed">
                Warning: Rotating this seed renders older backup keys obsolete. You must update your hardware vault immediately.
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVE DEVICE NODES & AUDIT LOGS (CYAN THEME)                      */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1 Col: Active Authorized Hardware Devices */}
            <Card className="p-6 bg-[#08182b]/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-800/40">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    Authorized Nodes
                  </h4>
                  <p className="text-[10px] text-cyan-300/80">Hardware authenticated sessions</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  {activeSessions.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {activeSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-xl bg-[#030e1c]/90 border border-cyan-500/40 space-y-2 hover:border-cyan-400/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-xs flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate">{sess.device}</span>
                      </span>
                      {sess.isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          THIS DEVICE
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          disabled={revokingSessionId === sess.id}
                          className="text-[10px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>{revokingSessionId === sess.id ? 'Revoking...' : 'Revoke'}</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-cyan-300/80 font-mono">
                      IP: {sess.ip} • {sess.location || 'Pan-India'}
                    </p>
                    <p className="text-[10px] text-slate-400">{sess.lastActive}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handlePurgeAllOtherSessions}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 hover:text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-500/50 shadow-md"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Emergency Purge All Other Sessions</span>
              </button>
            </Card>

            {/* Right 2 Cols: Immutable Access History Trail with Search & Filter */}
            <Card className="lg:col-span-2 p-6 bg-[#08182b]/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-800/40 flex-wrap gap-2">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Immutable Access History & Node Audit Trail
                  </h4>
                  <p className="text-xs text-cyan-300/80">
                    Chronological cryptographic telemetry of root console authentication attempts
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-[#030e1c] p-1 rounded-xl border border-cyan-800/50">
                  {(['ALL', 'SUCCESS', 'BLOCKED'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setLogFilter(filter);
                        soundEngine.play('click');
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        logFilter === filter
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'text-cyan-300/70 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar with Pure White Text & Cyan Background */}
              <div className="relative">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Filter access records by IP, hardware device, or location..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#030e1c]/90 border border-cyan-500/40 hover:border-cyan-400 focus:border-cyan-300 transition-all text-xs outline-none"
                  style={{
                    color: '#ffffff',
                    caretColor: '#38bdf8',
                    WebkitTextFillColor: '#ffffff',
                  }}
                />
              </div>

              {/* Logs Table / List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[#030e1c]/60 border border-cyan-900/40 text-cyan-300/60 text-xs">
                    No access trail records matching filter query.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#030e1c]/90 border border-cyan-500/30 flex items-center justify-between gap-3 hover:border-cyan-400/60 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-xs">{log.timestamp}</span>
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold">{log.ip}</span>
                        </div>
                        <p className="text-[11px] text-cyan-200/80 font-mono">
                          {log.device} • {log.location || 'Unknown Node'}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ALERT DISPATCH MATRIX (EMERALD THEME)                              */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <Card className="p-6 bg-[#041a10]/95 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/50 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Executive Notification & Dispatch Governance
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Select instant delivery channels across WhatsApp, Email, and In-App Console for each operational wing
                </p>
              </div>
            </div>

            {/* Quick Bulk Presets */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllChannels(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold border border-emerald-500/40 cursor-pointer"
              >
                Enable All
              </button>
              <button
                type="button"
                onClick={() => setAllChannels(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700 cursor-pointer"
              >
                Mute Non-Critical
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-emerald-800/60 text-[11px] font-black text-emerald-300 uppercase bg-[#02100a]">
                <tr>
                  <th className="py-3.5 px-4">Event Category & Operational Scope</th>
                  <th className="py-3.5 px-4 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                      <Smartphone className="w-3.5 h-3.5" /> WhatsApp
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-blue-400 font-bold">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
                      <Bell className="w-3.5 h-3.5" /> In-App
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 bg-[#03150d]/80">
                {[
                  {
                    key: 'security' as const,
                    title: 'Security & Root Access Alerts',
                    desc: 'Unauthorized login attempts, credential changes, cross-district violations'
                  },
                  {
                    key: 'finance' as const,
                    title: 'Financial & High-Value Transactions',
                    desc: 'Batches executed, payouts over ₹25,000, refund spikes, daily GMV closure'
                  },
                  {
                    key: 'district' as const,
                    title: 'District Coordinator Operations',
                    desc: 'New appointments, tenure revocations, unallocated tuition requests'
                  },
                  {
                    key: 'operator' as const,
                    title: 'Content & Exam Operator Actions',
                    desc: 'New test paper approvals pending, bulk questions ingested'
                  },
                  {
                    key: 'content' as const,
                    title: 'Study Material Sales & Entitlements',
                    desc: 'Surge in PDF downloads, copyright alerts, curriculum updates'
                  },
                  {
                    key: 'system' as const,
                    title: 'System Health & InsForge Telemetry',
                    desc: 'Service uptime drops, database sync delays, backup logs'
                  },
                ].map((item) => (
                  <tr key={item.key} className="hover:bg-emerald-950/40 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-xs">{item.title}</p>
                      <p className="text-[11px] text-emerald-300/80 mt-0.5">{item.desc}</p>
                    </td>

                    {/* WhatsApp Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertChannels[item.key].whatsapp}
                          onChange={() => toggleChannel(item.key, 'whatsapp')}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-[#02100a] border-emerald-700 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Email Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertChannels[item.key].email}
                          onChange={() => toggleChannel(item.key, 'email')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-[#02100a] border-emerald-700 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* In-App Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertChannels[item.key].inApp}
                          onChange={() => toggleChannel(item.key, 'inApp')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#02100a] border-emerald-700 cursor-pointer"
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-emerald-800/40 flex-wrap gap-2">
            <span className="text-[11px] text-emerald-300/80">
              WhatsApp alerts are dispatched to verified root number: <strong className="text-white">{profile.phone}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.play('success');
                showToast('All alert channel preferences saved successfully!', 'success');
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400/40"
            >
              <Save className="w-4 h-4" />
              <span>Save Alert Preferences</span>
            </button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* UNIVERSAL SOVEREIGN ID CARD MODAL                                         */}
      {/* ========================================================================= */}
      <UniversalIdCardModal
        cardData={idCardData}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />
    </div>
  );
};
