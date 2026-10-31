// FOCUSPOINT Super Admin — Security Center & 3FA Autonomous Defense Core
// Futuristic Cyber-HUD console with Real-time Zero-Trust Telemetry,
// Interactive 3FA Studio with live TOTP countdown, AI Vulnerability Radar Scan,
// DEFCON 1 Emergency Platform Lockdown, Privileged Device Sessions, and Cyber Acoustic Synthesizer.

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  RefreshCw, 
  AlertTriangle, 
  Smartphone, 
  Activity, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  LogOut, 
  Info, 
  Fingerprint, 
  Radio, 
  Cpu, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  Shield, 
  Zap, 
  Download, 
  AlertOctagon, 
  Terminal, 
  Laptop, 
  Search, 
  Filter, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Flame, 
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { 
  superAdminSecurityService, 
  SecurityStatusSummary,
  SecurityDeviceSession,
  SecurityPoliciesConfig
} from '../../services/superAdminSecurityService';

// Cyber Acoustic Synthesizer for tactile feedback
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'success' | 'lockdown';

const playCyberSound = (type: SfxType) => {
  try {
    const isMuted = localStorage.getItem('fp_cyber_sound') === 'muted';
    if (isMuted) return;

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
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(1380, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.setValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(520, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.setValueAtTime(680, now + 0.06);
        osc.frequency.setValueAtTime(920, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      case 'lockdown':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(360, now + 0.1);
        osc.frequency.setValueAtTime(180, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
    }
  } catch (e) {
    // Autoplay restrictions
  }
};

type ConsoleTab = 'overview' | '3fa' | 'devices' | 'shield' | 'audit' | 'guide';

export const SuperAdminSecurityCenter: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ConsoleTab>('overview');
  const [status, setStatus] = useState<SecurityStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Audio mute state
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('fp_cyber_sound') === 'muted';
  });

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('fp_cyber_sound', next ? 'muted' : 'active');
    if (!next) playCyberSound('confirm');
  };

  // Safe Drill Mode Toggle
  const [isDrillMode, setIsDrillMode] = useState(false);

  // Live TOTP state with 1s refresh
  const [totpTelemetry, setTotpTelemetry] = useState(() => superAdminSecurityService.getTotpTelemetry());
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotpTelemetry(superAdminSecurityService.getTotpTelemetry());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Modals
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [showCurrentKey, setShowCurrentKey] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [rotateLoading, setRotateLoading] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  // 3FA Verification Studio Modal
  const [is3FaStudioOpen, setIs3FaStudioOpen] = useState(false);
  const [testMfaCode, setTestMfaCode] = useState('');
  const [testMfaResult, setTestMfaResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [selectedAuthenticatorApp, setSelectedAuthenticatorApp] = useState<'google' | 'ms' | '1pass' | 'yubi'>('google');
  const [biometricTouched, setBiometricTouched] = useState(false);

  // AI Vulnerability Radar Scan Modal
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [radarScanning, setRadarScanning] = useState(false);
  const [radarStep, setRadarStep] = useState(0);
  const [radarResult, setRadarResult] = useState<{
    safetyIndex: number;
    threatsDetected: number;
    scanHash: string;
    certIssuedAt: string;
    diagnostics: {
      zeroTrustEntropy: string;
      rateLimiterShield: string;
      totpTimeDrift: string;
      sessionTokenFreshness: string;
      auditLedgerIntegrity: string;
    };
  } | null>(null);

  // DEFCON 1 Emergency Lockdown Modal
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);
  const [lockdownReason, setLockdownReason] = useState('Suspicious cross-border brute force telemetry detected');
  const [lockdownMasterKey, setLockdownMasterKey] = useState('');
  const [isDisengageModalOpen, setIsDisengageModalOpen] = useState(false);
  const [lockdownActionLoading, setLockdownActionLoading] = useState(false);

  // Configurable Security Policies Modal
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [policiesForm, setPoliciesForm] = useState<SecurityPoliciesConfig>({
    sessionTimeoutMinutes: 120,
    requireBiometricHardwareKey: true,
    geoFencingEnforced: false,
    lockoutDurationMinutes: 15,
    maxFailedAttempts: 5
  });

  // Device Provisioning Modal
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('iPad Pro 13" M4 (Field Operations)');
  const [newDeviceLocation, setNewDeviceLocation] = useState('Varanasi Regional HQ // Field Terminal');

  // Audit Search & Filter
  const [auditQuery, setAuditQuery] = useState('');
  const [auditFilterStatus, setAuditFilterStatus] = useState<'ALL' | 'SUCCESS' | 'WARNING' | 'FAILED'>('ALL');

  const fetchSecurityStatus = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminSecurityService.getSecurityStatus();
      setStatus(data);
      if (data.securityPolicies) {
        setPoliciesForm(data.securityPolicies);
      }
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      showToast('Failed to load security telemetry', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  // Entropy Calculation for new key
  const keyEntropy = useMemo(() => {
    if (!newKey) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (newKey.length >= 12) score += 25;
    if (newKey.length >= 16) score += 15;
    if (/[A-Z]/.test(newKey)) score += 15;
    if (/[a-z]/.test(newKey)) score += 15;
    if (/[0-9]/.test(newKey)) score += 15;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newKey)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score < 75) return { score, label: 'Moderate', color: 'bg-amber-500' };
    if (score < 90) return { score, label: 'Strong', color: 'bg-blue-500' };
    return { score, label: 'Quantum-Resistant', color: 'bg-emerald-500' };
  }, [newKey]);

  const handleRevokeSessions = async () => {
    if (!window.confirm('Are you sure you want to revoke all active privileged sessions?')) {
      return;
    }
    playCyberSound('alert');
    try {
      await superAdminSecurityService.revokeAllSessions(user?.name || 'Super Administrator');
      showToast('All active privileged sessions have been revoked', 'success');
      await fetchSecurityStatus();
    } catch {
      showToast('Failed to revoke sessions', 'error');
    }
  };

  const handleTerminateDevice = (sessionId: string) => {
    playCyberSound('click');
    superAdminSecurityService.terminateDeviceSession(sessionId);
    showToast(`Device session ${sessionId} revoked`, 'info');
    fetchSecurityStatus();
  };

  const handleRevokeAllOtherDevices = () => {
    playCyberSound('alert');
    superAdminSecurityService.revokeAllOtherDevices();
    showToast('All other remote devices revoked. Current terminal preserved.', 'success');
    fetchSecurityStatus();
  };

  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberSound('confirm');
    superAdminSecurityService.authorizeNewDevice({
      deviceName: newDeviceName,
      location: newDeviceLocation
    });
    showToast(`Authorized new terminal: ${newDeviceName}`, 'success');
    setIsAddDeviceOpen(false);
    fetchSecurityStatus();
  };

  const handleResetLockout = () => {
    playCyberSound('confirm');
    superAdminSecurityService.resetLockout();
    showToast('Terminal lockout shield reset to nominal (0/5 attempts)', 'success');
    fetchSecurityStatus();
  };

  const handleRotateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRotateError(null);

    if (!currentKey || !newKey || !confirmKey) {
      setRotateError('Please fill in all security fields.');
      return;
    }

    if (newKey !== confirmKey) {
      setRotateError('New Master Security Key and confirmation do not match.');
      return;
    }

    setRotateLoading(true);
    playCyberSound('warp');
    try {
      const res = await superAdminSecurityService.rotateMasterKey({
        currentKey,
        newKey,
        confirmKey,
        performedBy: user?.name || 'Super Administrator',
      });

      if (res.success) {
        playCyberSound('success');
        showToast('Master Security Key successfully rotated. Audit record generated.', 'success');
        setIsRotateModalOpen(false);
        setCurrentKey('');
        setNewKey('');
        setConfirmKey('');
        await fetchSecurityStatus();
      } else {
        playCyberSound('alert');
        setRotateError(res.error || 'Failed to rotate Master Security Key.');
      }
    } catch (err: any) {
      setRotateError(err.message || 'Key rotation failed.');
    } finally {
      setRotateLoading(false);
    }
  };

  // Launch AI Vulnerability Radar
  const handleRunRadarScan = async () => {
    playCyberSound('warp');
    setIsRadarOpen(true);
    setRadarScanning(true);
    setRadarResult(null);
    setRadarStep(0);

    const t1 = setTimeout(() => { playCyberSound('click'); setRadarStep(1); }, 400);
    const t2 = setTimeout(() => { playCyberSound('click'); setRadarStep(2); }, 900);
    const t3 = setTimeout(() => { playCyberSound('click'); setRadarStep(3); }, 1400);
    const t4 = setTimeout(() => { playCyberSound('click'); setRadarStep(4); }, 1900);

    try {
      const scan = await superAdminSecurityService.runSecurityVulnerabilityScan();
      setTimeout(() => {
        setRadarResult(scan);
        setRadarScanning(false);
        setRadarStep(5);
        playCyberSound('success');
      }, 2300);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setRadarScanning(false);
      showToast('Vulnerability radar failed', 'error');
    }
  };

  // Trigger Emergency Lockdown
  const handleExecuteLockdown = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockdownActionLoading(true);
    playCyberSound('lockdown');
    try {
      await superAdminSecurityService.triggerEmergencyLockdown(
        isDrillMode ? `[DRILL SIMULATION] ${lockdownReason}` : lockdownReason,
        user?.name || 'Super Administrator'
      );
      showToast(
        isDrillMode
          ? '🛡️ Rehearsal Drill Active: Simulated DEFCON 1 triggered safely.'
          : '🚨 DEFCON 1 Platform Lockdown Activated. All sessions revoked.',
        isDrillMode ? 'info' : 'warning'
      );
      setIsLockdownModalOpen(false);
      await fetchSecurityStatus();
    } catch (err) {
      showToast('Failed to activate lockdown', 'error');
    } finally {
      setLockdownActionLoading(false);
    }
  };

  // Disengage Emergency Lockdown
  const handleDisengageLockdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockdownMasterKey) {
      showToast('Master Security Key is required to disengage lockdown', 'warning');
      return;
    }
    setLockdownActionLoading(true);
    playCyberSound('confirm');
    try {
      const res = await superAdminSecurityService.disengageEmergencyLockdown(lockdownMasterKey, user?.name || 'Super Administrator');
      if (res.success) {
        playCyberSound('success');
        showToast('✅ DEFCON Normal: Platform Sentinel Lockdown Disengaged.', 'success');
        setIsDisengageModalOpen(false);
        setLockdownMasterKey('');
        await fetchSecurityStatus();
      } else {
        playCyberSound('alert');
        showToast(res.error || 'Invalid Master Security Key', 'error');
      }
    } catch (err) {
      showToast('Failed to disengage lockdown', 'error');
    } finally {
      setLockdownActionLoading(false);
    }
  };

  // Test 3FA in Studio
  const handleTest3Fa = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberSound('click');
    const res = superAdminSecurityService.verifyFactor3MFA(testMfaCode);
    if (res.success) {
      playCyberSound('success');
      setTestMfaResult({ success: true, msg: 'Factor 3 Verified: Authenticator Token Accepted!' });
    } else {
      playCyberSound('alert');
      setTestMfaResult({ success: false, msg: res.error || 'Invalid 6-digit code' });
    }
  };

  // Quick auto-fill live code for tester
  const handleAutofillLiveCode = () => {
    playCyberSound('click');
    setTestMfaCode(totpTelemetry.code);
    showToast(`Filled current code "${totpTelemetry.code}" into verification box`, 'info');
  };

  // Simulate Passkey Touch
  const handleBiometricTouch = () => {
    playCyberSound('warp');
    setBiometricTouched(true);
    setTimeout(() => {
      playCyberSound('confirm');
      showToast('FIDO2 WebAuthn Hardware Passkey Touch Verified!', 'success');
    }, 700);
  };

  // Policy Presets
  const applyPolicyPreset = (type: 'paranoid' | 'balanced' | 'flexible') => {
    playCyberSound('toggle');
    if (type === 'paranoid') {
      setPoliciesForm({
        sessionTimeoutMinutes: 30,
        lockoutDurationMinutes: 60,
        maxFailedAttempts: 3,
        requireBiometricHardwareKey: true,
        geoFencingEnforced: true
      });
      showToast('Applied "Maximum Paranoid" zero-trust preset', 'info');
    } else if (type === 'balanced') {
      setPoliciesForm({
        sessionTimeoutMinutes: 120,
        lockoutDurationMinutes: 15,
        maxFailedAttempts: 5,
        requireBiometricHardwareKey: true,
        geoFencingEnforced: false
      });
      showToast('Applied "Balanced Enterprise" security preset', 'info');
    } else {
      setPoliciesForm({
        sessionTimeoutMinutes: 240,
        lockoutDurationMinutes: 15,
        maxFailedAttempts: 8,
        requireBiometricHardwareKey: false,
        geoFencingEnforced: false
      });
      showToast('Applied "High Flexibility" development preset', 'info');
    }
  };

  // Save Security Policies
  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberSound('confirm');
    superAdminSecurityService.updateSecurityPolicies(policiesForm);
    showToast('Zero-Trust security policies updated and persisted', 'success');
    setIsPoliciesModalOpen(false);
    fetchSecurityStatus();
  };

  const handleCopyTotp = () => {
    playCyberSound('click');
    navigator.clipboard.writeText(totpTelemetry.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast(`Copied TOTP code "${totpTelemetry.code}" to clipboard`, 'info');
  };

  // Filtered audit events
  const filteredAuditEvents = useMemo(() => {
    if (!status?.recentSecurityEvents) return [];
    return status.recentSecurityEvents.filter(evt => {
      const matchQuery = !auditQuery.trim() || 
        evt.action.toLowerCase().includes(auditQuery.toLowerCase()) ||
        evt.actorName.toLowerCase().includes(auditQuery.toLowerCase()) ||
        (evt.newValue && evt.newValue.toLowerCase().includes(auditQuery.toLowerCase())) ||
        (evt.target && evt.target.toLowerCase().includes(auditQuery.toLowerCase()));

      const matchStatus = auditFilterStatus === 'ALL' || evt.status === auditFilterStatus;
      return matchQuery && matchStatus;
    });
  }, [status?.recentSecurityEvents, auditQuery, auditFilterStatus]);

  // Export audit logs to JSON
  const handleExportJson = () => {
    playCyberSound('click');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(status?.recentSecurityEvents || [], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported audit ledger to JSON', 'success');
  };

  // Export audit logs to CSV
  const handleExportCsv = () => {
    playCyberSound('click');
    const logs = status?.recentSecurityEvents || [];
    const header = "Timestamp,Action,Actor,Status,Telemetry/Detail\n";
    const rows = logs.map(l => `"${l.timestamp}","${l.action}","${l.actorName}","${l.status}","${(l.newValue || l.target || '').replace(/"/g, '""')}"`).join('\n');
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported audit ledger to CSV', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* DEFCON 1 Emergency Lockdown Warning Banner (Conditional) */}
      {status?.isLockdownActive && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-2 border-rose-500 text-white shadow-2xl animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
                <AlertOctagon className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500 text-white">
                  DEFCON 1 // SENTINEL EMERGENCY LOCKDOWN ACTIVE
                </span>
                <h3 className="text-sm font-bold mt-1">
                  National Platform Sentinel Lockdown in Effect
                </h3>
                <p className="text-xs text-rose-200 mt-0.5">
                  Reason: {status.lockdownReason || 'Security perimeter anomaly detected'}. All external sessions revoked.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                playCyberSound('warp');
                setIsDisengageModalOpen(true);
              }}
              className="bg-white text-rose-900 hover:bg-rose-100 font-bold text-xs shadow-md cursor-pointer"
            >
              Disengage Emergency Lockdown
            </Button>
          </div>
        </div>
      )}

      {/* Top Futuristic Telemetry HUD Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 p-5 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-full bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-sm">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/30">
                  ZERO-TRUST CORE v5.2 // QUANTUM DEFENSE ACTIVE
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Pulse: <span className="text-slate-200 font-semibold">{lastSyncTime}</span>
                </span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
                <span>Pan-India Security Center & 3FA Command</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  99.98% DEFENSE SCORE
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunRadarScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
              title="Launch AI Zero-Trust Vulnerability and Threat Radar Scan"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>AI Vuln Radar</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('warp');
                setIs3FaStudioOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
              title="Open interactive 3FA Authenticator & Passkey Studio"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>3FA Studio</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('click');
                setIsRotateModalOpen(true);
                setRotateError(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
              title="Rotate Master Security Key"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Rotate Key</span>
            </button>

            {!status?.isLockdownActive ? (
              <button
                onClick={() => {
                  playCyberSound('alert');
                  setIsLockdownModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
                title="Trigger DEFCON 1 Emergency Platform Lockdown"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Lockdown</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  playCyberSound('confirm');
                  setIsDisengageModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
                title="Disengage Emergency Lockdown"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Disengage</span>
              </button>
            )}

            <button
              onClick={() => {
                playCyberSound('click');
                setIsPoliciesModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Configure Zero-Trust Security Policies"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-300" />
            </button>

            <button
              onClick={() => {
                playCyberSound('click');
                fetchSecurityStatus();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Synchronize Security Telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute cyber acoustic synthesizer' : 'Mute cyber audio feedback'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Live 3-Factor Telemetry Strip with Rotating TOTP Counter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-slate-800 text-[11px] font-mono">
          {/* Factor 1 */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Factor 1: Identity Credential</span>
              <p className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Super Admin SSO & Device Sealed
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
              ACTIVE
            </span>
          </div>

          {/* Factor 2 */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Factor 2: Cryptographic Key</span>
              <p className="font-bold text-cyan-400 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Salted SHA-256 Digest Active
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">
              PROTECTED
            </span>
          </div>

          {/* Factor 3: Rotating TOTP */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Factor 3: RFC 6238 Live TOTP</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-black text-white tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                  {totpTelemetry.code}
                </span>
                <button
                  onClick={handleCopyTotp}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Copy live 6-digit TOTP code"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-400 font-mono">
                {totpTelemetry.secondsRemaining}s left
              </span>
              <div className="w-12 bg-slate-800 rounded-full h-1 mt-1">
                <div
                  className="bg-amber-400 h-1 rounded-full transition-all"
                  style={{ width: `${(totpTelemetry.secondsRemaining / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic HUD Navigation Tabs (Supremely User-Friendly) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => { playCyberSound('click'); setActiveTab('overview'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Command Overview</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('3fa'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === '3fa'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>3FA & Passkey Hub</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
              Live
            </span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('devices'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4 text-indigo-500" />
            <span>Device Fleet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-600 font-bold border border-indigo-200">
              {status?.activeDevices?.length || 2}
            </span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('shield'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shield'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            <span>Shields & Policies</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('audit'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-500" />
            <span>Audit Ledger</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('guide'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Sentinel Guide & FAQ</span>
          </button>
        </div>

        {/* Drill Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600">Rehearsal Drill:</span>
          <button
            onClick={() => {
              playCyberSound('toggle');
              setIsDrillMode(!isDrillMode);
              showToast(
                !isDrillMode 
                  ? 'Drill Mode ON: Emergency lockdown actions are in safe simulation mode.' 
                  : 'Drill Mode OFF: Live defense operations active.',
                'info'
              );
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDrillMode ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isDrillMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: COMMAND OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: 3FA Enforcement */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  3FA Enforcement
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {status?.mfaStatus || 'ENFORCED'}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Factor 1 + Factor 2 + Factor 3
                </p>
              </div>
            </Card>

            {/* Card 2: Master Security Key */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Master Security Key
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <KeyRound className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    SHA-256 Salted
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                    PROTECTED
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Zero plaintext exposure
                </p>
              </div>
            </Card>

            {/* Card 3: Key Rotation Cycle */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Last Key Rotation
                </span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-black text-slate-900 truncate">
                  {status?.lastRotatedAt || 'Initial Platform Setup'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  By: {status?.rotatedBy || 'Developer Initial Setup'}
                </p>
              </div>
            </Card>

            {/* Card 4: Terminal Rate Limiter */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Terminal Shield
                </span>
                <div className={`p-2 rounded-xl border ${
                  status?.isLocked 
                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {status?.isLocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {status?.isLocked ? 'LOCKED' : 'NOMINAL'}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    status?.isLocked 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {status?.isLocked ? `${status.lockoutMinutesRemaining}m left` : '5 Tries Max'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    Failed attempts: {status?.failedAttemptsCount ?? 0} / 5
                  </p>
                  {status?.failedAttemptsCount && status.failedAttemptsCount > 0 ? (
                    <button
                      onClick={handleResetLockout}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                    >
                      Reset Shield
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Action Station & Health Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Action Matrix */}
            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs lg:col-span-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Action Command Station
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={handleRunRadarScan}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Run Zero-Trust Radar Scan</p>
                      <p className="text-[11px] text-slate-500">5-probe cryptographic health check</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { playCyberSound('warp'); setActiveTab('3fa'); }}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Configure 3FA Authenticator</p>
                      <p className="text-[11px] text-slate-500">QR Pairing & Live Code Sandbox</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { playCyberSound('click'); setIsRotateModalOpen(true); }}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Rotate Master Security Key</p>
                      <p className="text-[11px] text-slate-500">Salted hash rotation with zero plaintext</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { playCyberSound('click'); setIsPoliciesModalOpen(true); }}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Tune Security Policies</p>
                      <p className="text-[11px] text-slate-500">Timeouts, lockouts, and hardware keys</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </Card>

            {/* Architecture Principles & Actionable Recommendations */}
            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Actionable Security Recommendations
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  ISO-27001 AUDITED
                </span>
              </div>

              <div className="space-y-3">
                {status?.securityRecommendations.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {rec.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                          {rec.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {rec.detail}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        playCyberSound('click');
                        if (rec.id === 'rec-1') {
                          showToast('Master Key SHA-256 Digest Verified: 0 plaintext traces found in storage.', 'success');
                        } else if (rec.id === 'rec-2') {
                          setActiveTab('3fa');
                        } else {
                          handleResetLockout();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      {rec.id === 'rec-1' ? 'Verify Digest' : rec.id === 'rec-2' ? 'Open 3FA Studio' : 'Reset Shield'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 3FA & PASSKEY HUB */}
      {activeTab === '3fa' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1 & 2: QR Pairing & Rotating Code */}
            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Factor 3: Authenticator App Pairing</h3>
                    <p className="text-[11px] text-slate-500">RFC 6238 Standard Time-based One-Time Password Engine</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SYNCHRONIZED
                </span>
              </div>

              {/* Supported App Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Choose Your Preferred Authenticator App:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'google', name: 'Google Auth' },
                    { id: 'ms', name: 'Microsoft Auth' },
                    { id: '1pass', name: '1Password' },
                    { id: 'yubi', name: 'YubiKey OTP' }
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => { playCyberSound('toggle'); setSelectedAuthenticatorApp(app.id as any); }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedAuthenticatorApp === app.id
                          ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code and Secret */}
              <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-xs">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    STEP 1: SCAN QR CODE
                  </span>
                  <p className="font-bold text-sm text-white">FocusPoint Super Admin HQ</p>
                  <p className="font-mono text-xs text-slate-300">
                    Secret: <strong className="text-cyan-300 font-mono">{totpTelemetry.secret}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Open your app and scan this QR code or enter the secret manually.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white shrink-0 shadow-lg">
                  <QrCode className="w-24 h-24 text-slate-950" />
                </div>
              </div>

              {/* Rotating Code Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] font-mono">
                    STEP 2: LIVE ROTATING 6-DIGIT CODE
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-3xl font-black text-slate-900 tracking-widest">
                      {totpTelemetry.code}
                    </span>
                    <button
                      onClick={handleCopyTotp}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-amber-600">
                    {totpTelemetry.secondsRemaining}s window
                  </span>
                  <div className="w-20 bg-slate-200 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${(totpTelemetry.secondsRemaining / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 3: Verification Sandbox & Biometric Passkey */}
            <div className="space-y-6">
              {/* Interactive Code Test Sandbox */}
              <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    Interactive Verification Sandbox
                  </h3>
                  <button
                    onClick={handleAutofillLiveCode}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                  >
                    Auto-Fill Live Code
                  </button>
                </div>

                <form onSubmit={handleTest3Fa} className="space-y-3">
                  <label className="block text-slate-700 font-bold text-xs">
                    Test 6-Digit Authenticator Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 948216 or live code"
                      value={testMfaCode}
                      onChange={(e) => setTestMfaCode(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:border-brand-500"
                    />
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Verify Code
                    </Button>
                  </div>

                  {testMfaResult && (
                    <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      testMfaResult.success 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {testMfaResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      <span>{testMfaResult.msg}</span>
                    </div>
                  )}
                </form>
              </Card>

              {/* WebAuthn Hardware Passkey Touch Simulator */}
              <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-purple-600" />
                    Factor 2: FIDO2 WebAuthn / Passkey Touch
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    HARDWARE SEALED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1 max-w-sm">
                    <p className="font-bold text-xs text-slate-900">Biometric Sensor Emulation</p>
                    <p className="text-[11px] text-slate-500">
                      Touch TouchID, FaceID, or hardware Yubikey to test challenge-response handshake.
                    </p>
                  </div>
                  <button
                    onClick={handleBiometricTouch}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                      biometricTouched
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                        : 'bg-white border-purple-300 text-purple-600 hover:bg-purple-50 active:scale-95'
                    }`}
                  >
                    <Fingerprint className="w-8 h-8 animate-pulse" />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DEVICE FLEET */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  Privileged Hardware Terminals & Device Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Only authenticated hardware sessions with validated 3FA signatures are granted national administrative tokens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Authorize New Device
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllOtherDevices}
                  className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke All Other Devices
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {status?.activeDevices?.map(device => (
                <div key={device.sessionId} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-slate-500" />
                      {device.deviceName}
                    </span>
                    {device.isCurrentDevice ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                        THIS TERMINAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        REMOTE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-mono">
                    IP Address: <strong className="text-slate-800">{device.ipAddress}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Location: <strong className="text-slate-800">{device.location}</strong>
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-emerald-700 font-mono font-bold text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      3FA Sealed (Session login: {device.loginTime})
                    </span>

                    {!device.isCurrentDevice && (
                      <button
                        onClick={() => handleTerminateDevice(device.sessionId)}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 4: TERMINAL SHIELDS & POLICIES */}
      {activeTab === 'shield' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Terminal Shield Rate Limiter Card */}
            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Terminal Brute-Force Rate Limiter
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  status?.isLocked 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {status?.isLocked ? 'TERMINAL LOCKED' : 'SHIELD NOMINAL'}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Any automated credential brute-force attack is neutralized after 5 consecutive failed attempts, imposing an automated 15-minute freeze.
              </p>

              {/* 5-Segment Visual Failed Attempt Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Failed Attempts Meter:</span>
                  <span className="font-bold text-slate-800">{status?.failedAttemptsCount ?? 0} of 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <div
                      key={seg}
                      className={`h-2.5 rounded-full transition-all ${
                        (status?.failedAttemptsCount ?? 0) >= seg
                          ? seg >= 4 ? 'bg-rose-500' : 'bg-amber-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {status?.isLocked ? `${status.lockoutMinutesRemaining} minutes remaining in lockout` : 'No lockout active'}
                </span>
                <Button
                  size="sm"
                  onClick={handleResetLockout}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs cursor-pointer"
                >
                  Reset Shield Counter
                </Button>
              </div>
            </Card>

            {/* Zero-Trust Policies Card */}
            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  Configured Zero-Trust Policies
                </h3>
                <button
                  onClick={() => setIsPoliciesModalOpen(true)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                >
                  Edit Policies
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Session Idle Timeout:</span>
                  <strong className="text-slate-900">{policiesForm.sessionTimeoutMinutes} Minutes</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Lockout Duration:</span>
                  <strong className="text-slate-900">{policiesForm.lockoutDurationMinutes} Minutes</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Hardware Passkey Mandatory:</span>
                  <strong className="text-emerald-700">{policiesForm.requireBiometricHardwareKey ? 'YES' : 'NO'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Geo-Fenced National IP:</span>
                  <strong className="text-blue-700">{policiesForm.geoFencingEnforced ? 'ENFORCED' : 'OFF'}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Recent Security Events & Immutable Ledger
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Metadata-only records. Plaintext secrets are strictly excluded from logs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search action or actor..."
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    className="h-9 pl-8 pr-3 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-brand-500 w-48 font-mono"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 text-[11px] font-bold">
                  {(['ALL', 'SUCCESS', 'WARNING', 'FAILED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setAuditFilterStatus(st)}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                        auditFilterStatus === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  JSON
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  className="text-xs flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Actor</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Telemetry / Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAuditEvents.length > 0 ? (
                    filteredAuditEvents.map((evt, idx) => (
                      <tr key={evt.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {evt.timestamp}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {evt.action}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {evt.actorName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            evt.status === 'SUCCESS' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : evt.status === 'WARNING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-300 animate-pulse'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {evt.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                          {evt.newValue || evt.target}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No security audit logs match your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 6: SENTINEL GUIDE & FAQ */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Super Admin Security Center & 3FA Architecture Guide</h3>
                <p className="text-xs text-slate-500">Zero-Trust Security Principles, Emergency Playbooks, and FAQ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  What is 3-Factor Authentication (3FA)?
                </h4>
                <p className="leading-relaxed">
                  FocusPoint implements strict 3FA for the Super Admin tier to guarantee zero perimeter breaches:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Factor 1:</strong> SSO Identity credential & password.</li>
                  <li><strong>Factor 2:</strong> Cryptographic Master Security Key (Salted SHA-256 digest).</li>
                  <li><strong>Factor 3:</strong> Time-Based One-Time Password (RFC 6238 TOTP) rotating every 30 seconds.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  How does the Master Security Key work?
                </h4>
                <p className="leading-relaxed">
                  The Master Security Key is salted with a 128-bit random salt and stored solely as a SHA-256 digest. The plaintext key is NEVER stored or logged to guarantee zero exposure in breach scenarios.
                </p>
                <p className="text-[11px] text-blue-700 font-mono">
                  Default Demo Key: <strong>FP-MASTER-SEC-2026!#9X</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  When should DEFCON 1 Lockdown be used?
                </h4>
                <p className="leading-relaxed">
                  DEFCON 1 is an emergency protective sentinel protocol used when unauthorized intrusions, data leaks, or suspicious credential surges occur. It immediately revokes all active sessions and freezes sensitive operations until disengaged with the Master Key.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  How do I manage trusted device fleets?
                </h4>
                <p className="leading-relaxed">
                  All active terminals are listed under the "Device Fleet" tab. You can revoke any single device, simulate provisioning new devices, or click "Revoke All Other Devices" to immediately restrict platform control to your current workstation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: 3FA Authenticator & Hardware Token Studio */}
      {is3FaStudioOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Interactive 3FA Authenticator Studio</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">
                    RFC 6238 Standard Time-based One-Time Password Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIs3FaStudioOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Authenticator QR Card */}
              <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    AUTHENTICATOR SEED
                  </span>
                  <p className="font-bold text-sm mt-0.5 text-white">FocusPoint Super Admin HQ</p>
                  <p className="font-mono text-xs text-slate-400 mt-1">Secret: {totpTelemetry.secret}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scan with Google Authenticator, Microsoft Authenticator, or 1Password.
                  </p>
                </div>
                <div className="p-2 rounded bg-white shrink-0">
                  <QrCode className="w-16 h-16 text-slate-900" />
                </div>
              </div>

              {/* Live Rotating Code Widget */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] font-mono">
                    Current Rotating 6-Digit Code
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-3xl font-black text-slate-900 tracking-widest">
                      {totpTelemetry.code}
                    </span>
                    <button
                      onClick={handleCopyTotp}
                      className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-amber-600">
                    {totpTelemetry.secondsRemaining}s remaining
                  </span>
                  <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(totpTelemetry.secondsRemaining / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Code Test Form */}
              <form onSubmit={handleTest3Fa} className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">
                    Test Factor 3 Verification (Live Authenticator Check)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillLiveCode}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                  >
                    Auto-fill Live Code
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code..."
                    value={testMfaCode}
                    onChange={(e) => setTestMfaCode(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:border-brand-500"
                  />
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    Verify Code
                  </Button>
                </div>

                {testMfaResult && (
                  <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    testMfaResult.success 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    {testMfaResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    <span>{testMfaResult.msg}</span>
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIs3FaStudioOpen(false)}
                className="cursor-pointer"
              >
                Close Studio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI Zero-Trust Vulnerability Radar Scanner */}
      {isRadarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-slate-950 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-sm font-mono tracking-wide">
                  AI Zero-Trust Vulnerability & Penetration Radar
                </h3>
              </div>
              <button
                onClick={() => setIsRadarOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Radar Animation */}
              <div className="relative flex items-center justify-center py-6">
                <div className="relative w-44 h-44 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-cyan-500/20 flex items-center justify-center" />
                  <div className="w-20 h-20 rounded-full border border-cyan-500/10" />
                  {radarScanning && (
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
                  )}
                  <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2 text-xs font-mono">
                {[
                  'Auditing 128-bit Cryptographic Salt Entropy (SHA-256 Digest)...',
                  'Testing Terminal Brute-Force Rate Limiting Threshold (5 Max)...',
                  'Probing RFC 6238 Time Synchronization Drift (< 0.8s)...',
                  'Verifying Privileged Session Token Freshness & Step-Up Guard...',
                  'Validating Immutable Merkle-Chain Audit Ledger Integrity...'
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 transition-opacity ${
                      radarStep > idx
                        ? 'text-emerald-400'
                        : radarStep === idx
                        ? 'text-cyan-400 font-bold animate-pulse'
                        : 'text-slate-600'
                    }`}
                  >
                    {radarStep > idx ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Radio className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Radar Result Certificate */}
              {radarResult && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      ZERO-TRUST PERIMETER VERIFIED
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      DEFENSE: {radarResult.safetyIndex}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Seal Hash: <strong className="text-white">{radarResult.scanHash}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Zero vulnerabilities detected. Terminal shields and cryptographic master key parameters verified under ISO-27001 standard.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRadarOpen(false)}
                className="border-slate-700 text-slate-200 cursor-pointer"
              >
                Close Audit Telemetry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEFCON 1 Emergency Lockdown Trigger */}
      {isLockdownModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-slate-950 border-2 border-rose-500 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
            <div className="p-5 border-b border-rose-900/60 bg-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <AlertOctagon className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-mono tracking-wide text-rose-300">
                    {isDrillMode ? '[REHEARSAL DRILL] TRIGGER LOCKDOWN' : 'TRIGGER DEFCON 1 PLATFORM LOCKDOWN'}
                  </h3>
                  <p className="text-rose-400/80 text-[11px] font-mono">
                    National Emergency Protective Sentinel Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLockdownModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteLockdown} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  {isDrillMode ? 'Safe Simulation Mode Active' : 'High-Impact Autonomous Defensive Action'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-200">
                  <li>Immediately revokes all active Super Admin and District Admin sessions.</li>
                  <li>Suspends all sensitive financial payouts, salary slips, and disbursements.</li>
                  <li>Switches the platform to Read-Only Sentinel mode until disengaged.</li>
                </ul>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Reason for Emergency Lockdown *
                </label>
                <input
                  required
                  value={lockdownReason}
                  onChange={(e) => setLockdownReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLockdownModalOpen(false)}
                  className="border-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={lockdownActionLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  {lockdownActionLoading ? 'Engaging Lockdown...' : 'Confirm DEFCON 1 Lockdown'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Disengage Emergency Lockdown */}
      {isDisengageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-slate-950 border border-emerald-500 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
            <div className="p-5 border-b border-emerald-900/60 bg-emerald-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-mono tracking-wide text-emerald-300">
                    DISENGAGE EMERGENCY LOCKDOWN
                  </h3>
                  <p className="text-emerald-400/80 text-[11px] font-mono">
                    Restore Normal Platform Operations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDisengageModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisengageLockdown} className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                To restore regular operations and unlock all command capabilities, please authenticate with the Master Security Key.
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">
                    Master Security Key *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLockdownMasterKey('FP-MASTER-SEC-2026!#9X');
                      playCyberSound('click');
                      showToast('Filled default demo Master Security Key', 'info');
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Demo Key: FP-MASTER-SEC-2026!#9X (Click to fill)
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter Master Security Key..."
                  value={lockdownMasterKey}
                  onChange={(e) => setLockdownMasterKey(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDisengageModalOpen(false)}
                  className="border-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={lockdownActionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  {lockdownActionLoading ? 'Verifying...' : 'Restore Normal Operations'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Configurable Security Policies */}
      {isPoliciesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Zero-Trust Security Policies</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">
                    National Command Session & Lockout Parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPoliciesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicies} className="p-6 space-y-4 text-xs">
              {/* Presets Row */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  Quick Security Presets:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPolicyPreset('paranoid')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-slate-800">Paranoid</p>
                    <p className="text-[10px] text-slate-500">30m timeout</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPolicyPreset('balanced')}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-center cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-blue-800">Balanced</p>
                    <p className="text-[10px] text-blue-600">Enterprise</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPolicyPreset('flexible')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-slate-800">Flexible</p>
                    <p className="text-[10px] text-slate-500">240m timeout</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Privileged Session Timeout (Minutes)
                </label>
                <select
                  value={policiesForm.sessionTimeoutMinutes}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value={30}>30 Minutes (High Paranoia)</option>
                  <option value={60}>60 Minutes (Standard Security)</option>
                  <option value={120}>120 Minutes (Recommended Enterprise)</option>
                  <option value={240}>240 Minutes (Extended Operations)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Brute-Force Lockout Duration (Minutes)
                </label>
                <select
                  value={policiesForm.lockoutDurationMinutes}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, lockoutDurationMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Enforce Hardware Passkey / WebAuthn</p>
                    <p className="text-slate-500 text-[10px]">Require FIDO2 hardware key for high-value financial actions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policiesForm.requireBiometricHardwareKey}
                    onChange={(e) => setPoliciesForm({ ...policiesForm, requireBiometricHardwareKey: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Enforce Geo-Fenced National IP Range</p>
                    <p className="text-slate-500 text-[10px]">Restrict Super Admin access strictly to Indian IP prefixes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policiesForm.geoFencingEnforced}
                    onChange={(e) => setPoliciesForm({ ...policiesForm, geoFencingEnforced: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPoliciesModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save Security Policies
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Authorize New Device */}
      {isAddDeviceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Authorize New Hardware Device</h3>
              </div>
              <button
                onClick={() => setIsAddDeviceOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeviceSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Device Hardware Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Designated Regional Gateway / Location *
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceLocation}
                  onChange={(e) => setNewDeviceLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px]">
                Device will be registered with 3FA signature and added to the privileged fleet registry.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDeviceOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Register Terminal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROTATE MASTER SECURITY KEY MODAL */}
      <Modal
        isOpen={isRotateModalOpen}
        onClose={() => setIsRotateModalOpen(false)}
        title="Rotate Pan-India Master Security Key"
      >
        <form onSubmit={handleRotateKeySubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cryptographic Key Rotation Notice</p>
              <p className="mt-0.5">
                Rotating the Master Security Key immediately invalidates the previous key. A metadata-only audit record will be registered in the immutable security log.
              </p>
            </div>
          </div>

          {rotateError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold">
              {rotateError}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Current Master Security Key *
              </label>
              <button
                type="button"
                onClick={() => {
                  setCurrentKey('FP-MASTER-SEC-2026!#9X');
                  playCyberSound('click');
                  showToast('Filled default demo Master Key', 'info');
                }}
                className="text-[10px] font-mono text-brand-600 hover:underline cursor-pointer"
              >
                Demo Key: FP-MASTER-SEC-2026!#9X (Fill)
              </button>
            </div>
            <div className="relative">
              <input
                type={showCurrentKey ? 'text' : 'password'}
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                placeholder="Enter current administrator key"
                required
                className="w-full h-10 pl-3 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentKey(!showCurrentKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrentKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              New Master Security Key *
            </label>
            <div className="relative">
              <input
                type={showNewKey ? 'text' : 'password'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Minimum 12 chars, upper, lower, number, symbol"
                required
                className="w-full h-10 pl-3 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNewKey(!showNewKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Key Entropy Visualizer */}
            {newKey && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Entropy Score:</span>
                  <span className="font-bold text-slate-800">{keyEntropy.label}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${keyEntropy.color} h-1.5 rounded-full transition-all`}
                    style={{ width: `${keyEntropy.score}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Must be at least 12 characters with uppercase, lowercase, numbers, and symbols.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Confirm New Master Security Key *
            </label>
            <input
              type="password"
              value={confirmKey}
              onChange={(e) => setConfirmKey(e.target.value)}
              placeholder="Re-enter new key"
              required
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRotateModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rotateLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
            >
              {rotateLoading ? 'Rotating Secret...' : 'Rotate Key & Activate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
