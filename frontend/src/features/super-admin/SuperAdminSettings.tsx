import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { 
  centralSettingsService, 
  DEFAULT_CENTRAL_SETTINGS, 
  PRESET_PROFILES, 
  SETTINGS_METADATA 
} from '../../services/centralSettingsService';
import { 
  CentralPlatformSettings, 
  SettingsDiffItem, 
  SettingsTelemetrySummary, 
  SettingsPresetProfile, 
  CentralSettingsCategory,
  DisasterRecoveryLevel,
  AiModelEngine,
  SmtpEncryptionType
} from '../../types';
import { Button } from '../../components/common/Button';
import { 
  Shield, 
  Sliders, 
  Database, 
  RefreshCw, 
  Server, 
  IndianRupee, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Globe, 
  Radio, 
  Zap, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Search, 
  Lock, 
  Check, 
  Copy, 
  X, 
  AlertCircle, 
  FileCode, 
  Layers, 
  Cpu, 
  Eye, 
  Activity, 
  RotateCcw,
  Sparkles,
  Terminal,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

// Web Audio API Synthesizer for Cyber Central Settings Acoustic Feedback
type SfxType = 'hover' | 'click' | 'toggle' | 'save' | 'alert' | 'reset' | 'ping';

class SettingsSoundEngine {
  play(type: SfxType) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(1160, now + 0.03);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'toggle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'save') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.setValueAtTime(190, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'reset') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'ping') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.07);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch {
      // AudioContext unavailable
    }
  }
}

const soundEngine = new SettingsSoundEngine();

type ActiveSettingsTab = 'ALL' | CentralSettingsCategory;

// ============================================================================
// HIGH-CONTRAST DYNAMIC CYBER INPUT COMPONENT (Ensures 100% Text Visibility)
// ============================================================================
interface CyberSettingInputProps {
  label: string;
  description?: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: 'text' | 'number';
  step?: string;
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  category: CentralSettingsCategory;
  rightAction?: React.ReactNode;
  required?: boolean;
}

const CyberSettingInput: React.FC<CyberSettingInputProps> = ({
  label,
  description,
  value,
  onChange,
  type = 'text',
  step,
  min,
  max,
  unit,
  placeholder,
  category,
  rightAction,
  required
}) => {
  const getCategoryStyles = () => {
    switch (category) {
      case 'FINANCIAL_ECONOMICS':
        return {
          bg: 'bg-emerald-950/90',
          border: 'border-2 border-emerald-500/70 focus-within:border-emerald-300 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          labelColor: 'text-emerald-100',
          descColor: 'text-emerald-200/90',
          unitBadge: 'bg-emerald-900 border border-emerald-400 text-emerald-200',
          caretColor: '#34d399',
          focusGlow: 'focus:ring-2 focus:ring-emerald-400/40'
        };
      case 'SECURITY_SOVEREIGNTY':
        return {
          bg: 'bg-purple-950/90',
          border: 'border-2 border-purple-500/70 focus-within:border-purple-300 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.35)]',
          labelColor: 'text-purple-100',
          descColor: 'text-purple-200/90',
          unitBadge: 'bg-purple-900 border border-purple-400 text-purple-200',
          caretColor: '#c084fc',
          focusGlow: 'focus:ring-2 focus:ring-purple-400/40'
        };
      case 'COMMUNICATIONS_GATEWAYS':
        return {
          bg: 'bg-blue-950/90',
          border: 'border-2 border-blue-500/70 focus-within:border-blue-300 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.35)]',
          labelColor: 'text-blue-100',
          descColor: 'text-blue-200/90',
          unitBadge: 'bg-blue-900 border border-blue-400 text-blue-200',
          caretColor: '#60a5fa',
          focusGlow: 'focus:ring-2 focus:ring-blue-400/40'
        };
      case 'AI_INTELLIGENCE_CORE':
        return {
          bg: 'bg-cyan-950/90',
          border: 'border-2 border-cyan-500/70 focus-within:border-cyan-300 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.35)]',
          labelColor: 'text-cyan-100',
          descColor: 'text-cyan-200/90',
          unitBadge: 'bg-cyan-900 border border-cyan-400 text-cyan-200',
          caretColor: '#22d3ee',
          focusGlow: 'focus:ring-2 focus:ring-cyan-400/40'
        };
      case 'INFRASTRUCTURE_DATABASE':
        return {
          bg: 'bg-indigo-950/90',
          border: 'border-2 border-indigo-500/70 focus-within:border-indigo-300 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.35)]',
          labelColor: 'text-indigo-100',
          descColor: 'text-indigo-200/90',
          unitBadge: 'bg-indigo-900 border border-indigo-400 text-indigo-200',
          caretColor: '#818cf8',
          focusGlow: 'focus:ring-2 focus:ring-indigo-400/40'
        };
      case 'EMERGENCY_CIRCUIT_BREAKERS':
      default:
        return {
          bg: 'bg-rose-950/90',
          border: 'border-2 border-rose-500/80 focus-within:border-rose-300 focus-within:shadow-[0_0_20px_rgba(244,63,94,0.35)]',
          labelColor: 'text-rose-100',
          descColor: 'text-rose-200/90',
          unitBadge: 'bg-rose-900 border border-rose-400 text-rose-200',
          caretColor: '#fb7185',
          focusGlow: 'focus:ring-2 focus:ring-rose-400/40'
        };
    }
  };

  const styles = getCategoryStyles();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className={`block text-xs font-bold ${styles.labelColor}`}>
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {rightAction}
      </div>

      <div className={`relative flex items-center rounded-xl transition-all ${styles.bg} ${styles.border}`}>
        <input
          type={type}
          step={step}
          min={min}
          max={max}
          value={value ?? ''}
          onChange={(e) => {
            const val = type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
            onChange(val);
          }}
          placeholder={placeholder}
          required={required}
          style={{
            color: '#ffffff',
            caretColor: styles.caretColor,
            WebkitTextFillColor: '#ffffff'
          }}
          className={`w-full px-3.5 py-2.5 bg-transparent rounded-xl text-sm font-black text-white placeholder-slate-400 focus:outline-none transition-all ${styles.focusGlow}`}
        />

        {unit && (
          <div className="pr-3 pl-1 flex items-center pointer-events-none">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${styles.unitBadge}`}>
              {unit}
            </span>
          </div>
        )}
      </div>

      {description && (
        <p className={`text-[11px] leading-relaxed font-medium ${styles.descColor}`}>
          {description}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// HIGH-CONTRAST DYNAMIC CYBER TEXTAREA COMPONENT (100% Visible Multi-Line Text)
// ============================================================================
interface CyberSettingTextareaProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  category: CentralSettingsCategory;
}

const CyberSettingTextarea: React.FC<CyberSettingTextareaProps> = ({
  label,
  description,
  value,
  onChange,
  rows = 3,
  placeholder,
  category
}) => {
  const isEmergency = category === 'EMERGENCY_CIRCUIT_BREAKERS';
  const borderColor = isEmergency ? 'border-2 border-rose-500/80 focus-within:border-rose-300' : 'border-2 border-purple-500/80 focus-within:border-purple-300';
  const bgColor = isEmergency ? 'bg-rose-950/95' : 'bg-slate-950/95';
  const caretColor = isEmergency ? '#fb7185' : '#c084fc';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-white">
          {label}
        </label>
        <span className="text-[10px] font-mono text-rose-300 font-bold">
          {value.length} Characters
        </span>
      </div>

      <div className={`rounded-2xl ${bgColor} ${borderColor} p-1 transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]`}>
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            color: '#ffffff',
            caretColor: caretColor,
            WebkitTextFillColor: '#ffffff'
          }}
          className="w-full p-3 bg-transparent rounded-xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {description && (
        <p className="text-[11px] text-rose-200 font-medium">
          {description}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: SUPER ADMIN CENTRAL SETTINGS
// ============================================================================
export const SuperAdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core State
  const [savedSettings, setSavedSettings] = useState<CentralPlatformSettings>(DEFAULT_CENTRAL_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<CentralPlatformSettings>(DEFAULT_CENTRAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // IP Whitelisting Subnet input state
  const [newIpInput, setNewIpInput] = useState('');

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<ActiveSettingsTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Network Simulation State
  const [pingResult, setPingResult] = useState<{
    target: string;
    status: 'ONLINE' | 'FAILED';
    latencyMs: number;
    details: string;
    timestamp: string;
  } | null>(null);
  const [pingingTarget, setPingingTarget] = useState<string | null>(null);

  const sfx = (type: SfxType) => {
    if (!isAudioMuted) soundEngine.play(type);
  };

  // Load baseline on mount
  useEffect(() => {
    const loaded = centralSettingsService.getSettings();
    setSavedSettings(loaded);
    setDraftSettings(loaded);
  }, []);

  // Compute live differences between saved baseline and current draft
  const pendingDiffs: SettingsDiffItem[] = useMemo(() => {
    return centralSettingsService.computeDiff(savedSettings, draftSettings);
  }, [savedSettings, draftSettings]);

  // Telemetry summary
  const telemetry: SettingsTelemetrySummary = useMemo(() => {
    return centralSettingsService.getTelemetrySummary(draftSettings, pendingDiffs.length);
  }, [draftSettings, pendingDiffs.length]);

  // Helper updater for draft settings
  const updateSetting = <K extends keyof CentralPlatformSettings>(key: K, value: CentralPlatformSettings[K]) => {
    sfx('toggle');
    setDraftSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add / Remove IP from Whitelist
  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIpInput.trim();
    if (!cleanIp) return;

    if (draftSettings.whitelistedIps.includes(cleanIp)) {
      showToast('IP subnet already in whitelist', 'warning');
      return;
    }

    sfx('click');
    const updated = [...draftSettings.whitelistedIps, cleanIp];
    updateSetting('whitelistedIps', updated);
    setNewIpInput('');
    showToast(`Added ${cleanIp} to authorized CIDR whitelist`, 'success');
  };

  const handleRemoveIp = (ipToRemove: string) => {
    sfx('toggle');
    const updated = draftSettings.whitelistedIps.filter(ip => ip !== ipToRemove);
    updateSetting('whitelistedIps', updated);
    showToast(`Removed ${ipToRemove} from whitelist`, 'info');
  };

  // Save changes
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pendingDiffs.length === 0) {
      showToast('All platform policies are already synchronized to baseline', 'info');
      return;
    }

    try {
      sfx('save');
      setSaving(true);
      const { settings, diffs } = await centralSettingsService.saveSettings(draftSettings);
      setSavedSettings(settings);
      setDraftSettings(settings);
      setIsDiffModalOpen(false);
      showToast(`Successfully sealed and persisted ${diffs.length} architecture policies to Merkle audit ledger`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    sfx('reset');
    setDraftSettings(savedSettings);
    setIsDiffModalOpen(false);
    showToast('All pending draft modifications discarded. Restored saved baseline.', 'info');
  };

  // Apply Preset Profile
  const handleApplyPreset = async (presetKey: SettingsPresetProfile) => {
    const preset = PRESET_PROFILES[presetKey];
    if (!window.confirm(`Activate ${preset.title}?\n\n${preset.description}`)) return;

    try {
      sfx('save');
      const { settings } = await centralSettingsService.applyPreset(presetKey);
      setSavedSettings(settings);
      setDraftSettings(settings);
      showToast(`Activated ${preset.title} preset across all system clusters`, 'success');
    } catch {
      showToast('Failed to apply preset profile', 'error');
    }
  };

  // Reset to Factory Genesis Defaults
  const handleResetToDefaults = async () => {
    if (!window.confirm('CRITICAL ACTION: Reset all Central Architecture settings to factory genesis defaults? This will override all custom policies.')) {
      return;
    }

    try {
      sfx('reset');
      const defaults = await centralSettingsService.resetToDefaults();
      setSavedSettings(defaults);
      setDraftSettings(defaults);
      showToast('Central settings successfully restored to factory genesis defaults', 'info');
    } catch {
      showToast('Failed to reset factory defaults', 'error');
    }
  };

  // Export JSON configuration
  const handleExportConfig = () => {
    sfx('click');
    const jsonStr = centralSettingsService.exportSettingsConfig(draftSettings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint-central-settings-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Platform architecture configuration manifest exported successfully', 'success');
  };

  // Import JSON configuration
  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      setImportError('Please paste a valid JSON configuration manifest');
      return;
    }

    const res = centralSettingsService.importSettingsConfig(importJsonText);
    if (!res.success || !res.settings) {
      setImportError(res.error || 'Failed to parse configuration');
      sfx('alert');
      return;
    }

    sfx('save');
    setDraftSettings(res.settings);
    setIsImportModalOpen(false);
    setImportJsonText('');
    setImportError(null);
    showToast('Configuration imported into draft! Click "Save & Seal Policies" to apply permanently.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      setImportError(null);
    };
    reader.readAsText(file);
  };

  // Test Network Ping Simulator
  const handleTestConnection = async (target: 'INSFORGE' | 'WHATSAPP' | 'DLT_SMS' | 'SMTP') => {
    try {
      sfx('ping');
      setPingingTarget(target);
      const res = await centralSettingsService.testConnection(target);
      setPingResult(res);
      sfx('click');
      showToast(`${res.target}: Ping response received in ${res.latencyMs}ms (${res.status})`, 'success');
    } catch {
      showToast('Network test ping failed', 'error');
    } finally {
      setPingingTarget(null);
    }
  };

  // Category matching helper for search query
  const matchesSearch = (key: keyof CentralPlatformSettings): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const meta = SETTINGS_METADATA[key];
    const label = meta?.label?.toLowerCase() || '';
    const keyStr = String(key).toLowerCase();
    return label.includes(q) || keyStr.includes(q);
  };

  const isCategoryVisible = (cat: CentralSettingsCategory): boolean => {
    if (activeTab !== 'ALL' && activeTab !== cat) return false;
    const keysInCat = (Object.keys(SETTINGS_METADATA) as Array<keyof CentralPlatformSettings>)
      .filter(k => SETTINGS_METADATA[k]?.category === cat);
    return keysInCat.some(k => matchesSearch(k));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto cyber-grid-bg min-h-screen">
      {/* Hidden File Input for Config Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".json" 
        className="hidden" 
      />

      {/* =========================================================================
          IMMERSIVE SOVEREIGN COMMAND DECK HEADER (High-Contrast Cyber Glass)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-purple-500/50 p-6 shadow-[0_0_35px_rgba(168,85,247,0.25)] backdrop-blur-2xl">
        {/* Futuristic Ambient Glow Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-purple-500/25 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 text-purple-200 text-xs font-mono font-bold tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>SOVEREIGN ARCHITECTURE COMMAND DECK // CENTRAL SETTINGS v5.2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Central Platform Architecture & System Settings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-mono font-bold">
                PROD-ACTIVE
              </span>
            </h1>
            <p className="text-sm text-slate-200 mt-1 max-w-3xl leading-relaxed">
              Configure sovereign governance rules, tax parameters, communication gateways, security policies, and InsForge database bridges with Merkle audit verification.
            </p>
          </div>

          {/* Top Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Feedback Toggle */}
            <button
              onClick={() => {
                setIsAudioMuted(!isAudioMuted);
                if (isAudioMuted) soundEngine.play('hover');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAudioMuted 
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              }`}
              title={isAudioMuted ? 'Unmute Acoustic Synthesizer' : 'Mute Acoustic Synthesizer'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
              <span className="hidden sm:inline">{isAudioMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {/* Presets Dropdown */}
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-900 border-purple-500/50 hover:bg-purple-950/40 text-purple-200 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                <span>Presets Profile</span>
              </Button>
              <div className="absolute right-0 mt-1 w-64 rounded-2xl bg-slate-950 border-2 border-purple-500/50 p-2 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 space-y-1">
                <div className="text-[10px] font-mono uppercase text-purple-300 px-2 py-1 font-bold">
                  Sovereign Preset Blueprints
                </div>
                {(Object.keys(PRESET_PROFILES) as SettingsPresetProfile[]).map(pKey => {
                  const p = PRESET_PROFILES[pKey];
                  return (
                    <button
                      key={pKey}
                      onClick={() => handleApplyPreset(pKey)}
                      className="w-full text-left p-2 rounded-xl hover:bg-purple-950/70 border border-transparent hover:border-purple-500/40 transition-all text-xs"
                    >
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{p.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">{p.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Import / Export JSON */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportConfig}
              className="bg-slate-900 border-cyan-500/50 hover:bg-cyan-950/40 text-cyan-200 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              <span>Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sfx('click');
                setIsImportModalOpen(true);
              }}
              className="bg-slate-900 border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-200 text-xs font-bold"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Import</span>
            </Button>

            {/* Reset Defaults */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefaults}
              className="bg-slate-900 border-rose-500/50 hover:bg-rose-950/40 text-rose-200 text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </Button>
          </div>
        </div>

        {/* =========================================================================
            HIGH-CONTRAST TELEMETRY HUD PODS (Dynamic Category Adapting Hues)
            ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Pod 1: Security Posture Rating (Purple Theme) */}
          <div className="p-4 rounded-2xl bg-purple-950/80 border-2 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.25)] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-200 font-bold">
                Security Rating
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {telemetry.securityRatingScore}/100
              </div>
              <div className="text-[11px] text-purple-200 font-semibold mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-300" />
                <span>{draftSettings.twoFactorAuthEnforced ? '2FA Enforced' : '2FA Optional'}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-900/80 border border-purple-400 text-purple-200 shadow-inner">
              <Lock className="w-6 h-6 text-purple-300" />
            </div>
          </div>

          {/* Pod 2: Platform Financial Margins (Emerald Theme) */}
          <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-200 font-bold">
                Combined Margin
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {telemetry.baseCommissionMargin}%
              </div>
              <div className="text-[11px] text-emerald-200 font-semibold mt-1 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-300" />
                <span>GST: {draftSettings.gstRatePercent}% • TDS: {draftSettings.tdsWithholdingPercent}%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 shadow-inner">
              <IndianRupee className="w-6 h-6 text-emerald-300" />
            </div>
          </div>

          {/* Pod 3: Communications Gateways (Blue Theme) */}
          <div className="p-4 rounded-2xl bg-blue-950/80 border-2 border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.25)] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-bold">
                Active Gateways
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {telemetry.activeGatewaysCount}/3 Channels
              </div>
              <div className="text-[11px] text-blue-200 font-semibold mt-1 flex items-center gap-1">
                <Radio className="w-3 h-3 text-blue-300" />
                <span>WhatsApp • DLT • SMTP</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-900/80 border border-blue-400 text-blue-200 shadow-inner">
              <MessageSquare className="w-6 h-6 text-blue-300" />
            </div>
          </div>

          {/* Pod 4: Database & Killswitch Status (Rose if active, else Cyan Theme) */}
          <div className={`p-4 rounded-2xl border-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-between ${
            telemetry.killswitchEngaged 
              ? 'bg-rose-950/90 border-rose-500/90 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse' 
              : 'bg-cyan-950/80 border-cyan-500/70 text-cyan-100'
          }`}>
            <div>
              <div className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                telemetry.killswitchEngaged ? 'text-rose-200' : 'text-cyan-200'
              }`}>
                {telemetry.killswitchEngaged ? 'KILLSWITCH ACTIVE' : 'Database Mesh'}
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {telemetry.killswitchEngaged ? 'READ-ONLY' : `${telemetry.databaseLatencyMs}ms Ping`}
              </div>
              <div className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                telemetry.killswitchEngaged ? 'text-rose-200' : 'text-cyan-200'
              }`}>
                <Activity className="w-3 h-3" />
                <span>{telemetry.killswitchEngaged ? 'Financial Outflows Frozen' : 'PostgreSQL 16 Synced'}</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border shadow-inner ${
              telemetry.killswitchEngaged
                ? 'bg-rose-900/90 border-rose-400 text-rose-100'
                : 'bg-cyan-900/80 border-cyan-400 text-cyan-200'
            }`}>
              {telemetry.killswitchEngaged ? (
                <AlertTriangle className="w-6 h-6 text-rose-300" />
              ) : (
                <Database className="w-6 h-6 text-cyan-300" />
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            DYNAMIC UNSAVED MODIFICATIONS ALERT BAR (Visible when diffs exist)
            ========================================================================= */}
        {pendingDiffs.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-950/90 border-2 border-amber-500/80 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-900/90 border border-amber-400 text-amber-200">
                <Zap className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>{pendingDiffs.length} Unsaved Architecture Policies Modified</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900 border border-amber-400 text-amber-200 font-mono">
                    UNSEALED
                  </span>
                </div>
                <div className="text-xs text-amber-200 font-medium">
                  Modifications are active in browser memory. Persist to write an immutable Merkle audit record.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sfx('click');
                  setIsDiffModalOpen(true);
                }}
                className="bg-amber-900/80 border-amber-400 text-amber-100 hover:bg-amber-800 text-xs font-bold"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-amber-300" />
                <span>Review Diff ({pendingDiffs.length})</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                className="bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Discard</span>
              </Button>

              <Button
                size="sm"
                onClick={() => handleSaveAll()}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>{saving ? 'Sealing...' : 'Save & Seal Policies'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLS BAR: CATEGORY TABS & REAL-TIME POLICY SEARCH
          ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/90 border-2 border-purple-500/30 backdrop-blur-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              sfx('click');
              setActiveTab('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-purple-900/90 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            All Modules
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('FINANCIAL_ECONOMICS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'FINANCIAL_ECONOMICS'
                ? 'bg-emerald-950 border-2 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            Financial & Tax
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('SECURITY_SOVEREIGNTY');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'SECURITY_SOVEREIGNTY'
                ? 'bg-purple-950 border-2 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-slate-300 hover:text-purple-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            Security & DLT
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('COMMUNICATIONS_GATEWAYS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'COMMUNICATIONS_GATEWAYS'
                ? 'bg-blue-950 border-2 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-slate-300 hover:text-blue-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            Gateways
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('AI_INTELLIGENCE_CORE');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'AI_INTELLIGENCE_CORE'
                ? 'bg-cyan-950 border-2 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            AI Core
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('INFRASTRUCTURE_DATABASE');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'INFRASTRUCTURE_DATABASE'
                ? 'bg-indigo-950 border-2 border-indigo-500 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'text-slate-300 hover:text-indigo-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            Database Mesh
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('EMERGENCY_CIRCUIT_BREAKERS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'EMERGENCY_CIRCUIT_BREAKERS'
                ? 'bg-rose-950 border-2 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'text-slate-300 hover:text-rose-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            Killswitches
          </button>
        </div>

        {/* Search Input (100% White Visible Text) */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies & keys..."
            style={{
              color: '#ffffff',
              caretColor: '#c084fc',
              WebkitTextFillColor: '#ffffff'
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border-2 border-purple-500/50 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-purple-300 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Network Test Ping Result Toast / Banner if present */}
      {pingResult && (
        <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-cyan-500/70 text-cyan-100 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.25)] animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white">{pingResult.target}</span>: {pingResult.details}
              <span className="ml-2 font-mono text-[11px] text-cyan-300">({pingResult.latencyMs}ms at {pingResult.timestamp})</span>
            </div>
          </div>
          <button
            onClick={() => setPingResult(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN ARCHITECTURE POLICY PANELS (High Contrast & Visible Text Boxes)
          ========================================================================= */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ===================================================================
              SECTION 1: FINANCIAL & TAX ECONOMICS (Emerald Theme)
              =================================================================== */}
          {isCategoryVisible('FINANCIAL_ECONOMICS') && (
            <div className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-emerald-500/70 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.2)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-900 border border-emerald-400 text-emerald-200 shadow-inner">
                    <IndianRupee className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Platform Financial Economics</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 border border-emerald-400 text-emerald-200 font-mono">
                        STATUTORY
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200 font-medium">Commission rates, GST tax rules, and settlement cycles</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CyberSettingInput
                  label="Home Tuition Base Commission"
                  description="Platform fee deducted per completed hourly lesson"
                  type="number"
                  step="0.5"
                  unit="%"
                  category="FINANCIAL_ECONOMICS"
                  value={draftSettings.tuitionCommissionPercent}
                  onChange={(val) => updateSetting('tuitionCommissionPercent', Number(val))}
                  required
                />

                <CyberSettingInput
                  label="Library Base Commission"
                  description="Platform fee applied to study library seat subscriptions"
                  type="number"
                  step="0.5"
                  unit="%"
                  category="FINANCIAL_ECONOMICS"
                  value={draftSettings.libraryCommissionPercent}
                  onChange={(val) => updateSetting('libraryCommissionPercent', Number(val))}
                  required
                />

                <CyberSettingInput
                  label="District Admin Royalty Share"
                  description="Territorial revenue split allocated to verified district admins"
                  type="number"
                  step="0.5"
                  unit="%"
                  category="FINANCIAL_ECONOMICS"
                  value={draftSettings.districtAdminRoyaltySharePercent}
                  onChange={(val) => updateSetting('districtAdminRoyaltySharePercent', Number(val))}
                  required
                />

                <CyberSettingInput
                  label="Applicable GST Rate"
                  description="Standard Government of India Goods & Services Tax"
                  type="number"
                  step="1"
                  unit="%"
                  category="FINANCIAL_ECONOMICS"
                  value={draftSettings.gstRatePercent}
                  onChange={(val) => updateSetting('gstRatePercent', Number(val))}
                  required
                />

                <CyberSettingInput
                  label="TDS Withholding Rate"
                  description="Income Tax Sec 194C/194O deduction on vendor payouts"
                  type="number"
                  step="0.1"
                  unit="%"
                  category="FINANCIAL_ECONOMICS"
                  value={draftSettings.tdsWithholdingPercent}
                  onChange={(val) => updateSetting('tdsWithholdingPercent', Number(val))}
                  required
                />

                <CyberSettingInput
                  label="Min Payout Threshold"
                  description="Minimum wallet balance required to trigger bank transfer"
                  type="number"
                  step="50"
                  unit="₹"
                  category="FINANCIAL_ECONOMICS"
                  value={draftSettings.minimumPayoutThresholdINR}
                  onChange={(val) => updateSetting('minimumPayoutThresholdINR', Number(val))}
                  required
                />
              </div>

              <CyberSettingInput
                label="Automated Bank Payout Settlement Cycle"
                description="Direct NEFT/RTGS batch schedule to partner verified accounts"
                type="text"
                category="FINANCIAL_ECONOMICS"
                value={draftSettings.payoutCycle}
                onChange={(val) => updateSetting('payoutCycle', String(val))}
                placeholder="e.g. 5th of each month"
                required
              />
            </div>
          )}

          {/* ===================================================================
              SECTION 2: SECURITY & SOVEREIGN GOVERNANCE (Purple Theme)
              =================================================================== */}
          {isCategoryVisible('SECURITY_SOVEREIGNTY') && (
            <div className="p-6 rounded-3xl bg-purple-950/80 border-2 border-purple-500/70 text-purple-100 shadow-[0_0_30px_rgba(168,85,247,0.2)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-900 border border-purple-400 text-purple-200 shadow-inner">
                    <Shield className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Security & Sovereign Governance</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 border border-purple-400 text-purple-200 font-mono">
                        ZERO-TRUST
                      </span>
                    </h3>
                    <p className="text-xs text-purple-200 font-medium">Strict single-admin rule, 2FA, biometric turnstiles, and session timeouts</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Strict 1-Admin-Per-District */}
                <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">Strict 1-Admin-Per-District Rule</p>
                    <p className="text-purple-200 text-[11px]">Strict territorial sovereignty rule: never allow dual coordinators for same district</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.singleAdminPerDistrictEnforced}
                    onChange={(e) => updateSetting('singleAdminPerDistrictEnforced', e.target.checked)}
                    className="w-5 h-5 rounded-lg text-purple-500 focus:ring-purple-400 bg-purple-950 border-2 border-purple-400 cursor-pointer"
                  />
                </div>

                {/* Mandatory 2FA */}
                <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">Mandatory Two-Factor Auth (2FA)</p>
                    <p className="text-purple-200 text-[11px]">Require time-based OTP verification for all administrative account logins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.twoFactorAuthEnforced}
                    onChange={(e) => updateSetting('twoFactorAuthEnforced', e.target.checked)}
                    className="w-5 h-5 rounded-lg text-purple-500 focus:ring-purple-400 bg-purple-950 border-2 border-purple-400 cursor-pointer"
                  />
                </div>

                {/* Biometric Turnstiles */}
                <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">Mandatory Biometric Turnstile Synchronization</p>
                    <p className="text-purple-200 text-[11px]">Force real-time facial/fingerprint scan verification for physical library entry</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.requireBiometricForTurnstiles}
                    onChange={(e) => updateSetting('requireBiometricForTurnstiles', e.target.checked)}
                    className="w-5 h-5 rounded-lg text-purple-500 focus:ring-purple-400 bg-purple-950 border-2 border-purple-400 cursor-pointer"
                  />
                </div>

                {/* Corporate IP Whitelisting */}
                <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Corporate IP Subnet Whitelisting</p>
                      <p className="text-purple-200 text-[11px]">Restrict super admin session tokens to recognized office CIDR ranges</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftSettings.corporateIpWhitelisting}
                      onChange={(e) => updateSetting('corporateIpWhitelisting', e.target.checked)}
                      className="w-5 h-5 rounded-lg text-purple-500 focus:ring-purple-400 bg-purple-950 border-2 border-purple-400 cursor-pointer"
                    />
                  </div>

                  {draftSettings.corporateIpWhitelisting && (
                    <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/60 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {draftSettings.whitelistedIps.map((ip) => (
                          <span 
                            key={ip} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-900 border border-purple-400 text-xs font-mono font-bold text-white shadow-xs"
                          >
                            <span>{ip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveIp(ip)}
                              className="text-purple-300 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newIpInput}
                          onChange={(e) => setNewIpInput(e.target.value)}
                          placeholder="Add CIDR (e.g. 103.21.244.0/24)"
                          style={{
                            color: '#ffffff',
                            caretColor: '#c084fc',
                            WebkitTextFillColor: '#ffffff'
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-500/60 text-xs font-mono font-bold text-white placeholder-slate-400 focus:outline-none focus:border-purple-300"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddIp}
                          className="bg-purple-800 hover:bg-purple-700 text-white text-xs px-3 h-8 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          <span>Add CIDR</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <CyberSettingInput
                    label="Inactivity Auto-Lock"
                    description="Session expiration window on idle"
                    type="number"
                    unit="Mins"
                    category="SECURITY_SOVEREIGNTY"
                    value={draftSettings.sessionTimeoutMinutes}
                    onChange={(val) => updateSetting('sessionTimeoutMinutes', Number(val))}
                    required
                  />

                  <CyberSettingInput
                    label="Max Login Attempts"
                    description="Failed attempts before temporary lockout"
                    type="number"
                    unit="Tries"
                    category="SECURITY_SOVEREIGNTY"
                    value={draftSettings.maxLoginAttemptsBeforeLockout}
                    onChange={(val) => updateSetting('maxLoginAttemptsBeforeLockout', Number(val))}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              SECTION 3: COMMUNICATIONS & GATEWAYS (Blue Theme)
              =================================================================== */}
          {isCategoryVisible('COMMUNICATIONS_GATEWAYS') && (
            <div className="p-6 rounded-3xl bg-blue-950/80 border-2 border-blue-500/70 text-blue-100 shadow-[0_0_30px_rgba(59,130,246,0.2)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-900 border border-blue-400 text-blue-200 shadow-inner">
                    <MessageSquare className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Communications & Message Gateways</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900 border border-blue-400 text-blue-200 font-mono">
                        DLT-ACTIVE
                      </span>
                    </h3>
                    <p className="text-xs text-blue-200 font-medium">WhatsApp Business Cloud API, Telecom DLT SMS, and SMTP relayer</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* WhatsApp Cloud API */}
                <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">WhatsApp Business Cloud API Gateway</p>
                      <p className="text-blue-200 text-[11px]">Meta Graph API {draftSettings.whatsappApiVersion} • Webhook Verified</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection('WHATSAPP')}
                        disabled={pingingTarget === 'WHATSAPP'}
                        className="bg-blue-900 border-blue-400 text-blue-100 text-[11px] h-7 px-2.5 font-bold"
                      >
                        {pingingTarget === 'WHATSAPP' ? 'Pinging...' : 'Test Webhook'}
                      </Button>
                      <input
                        type="checkbox"
                        checked={draftSettings.whatsappCloudApiEnabled}
                        onChange={(e) => updateSetting('whatsappCloudApiEnabled', e.target.checked)}
                        className="w-5 h-5 rounded-lg text-blue-500 focus:ring-blue-400 bg-blue-950 border-2 border-blue-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <CyberSettingInput
                    label="WhatsApp Webhook Callback URL"
                    type="text"
                    category="COMMUNICATIONS_GATEWAYS"
                    value={draftSettings.whatsappWebhookUrl}
                    onChange={(val) => updateSetting('whatsappWebhookUrl', String(val))}
                    placeholder="https://api.focuspoint.internal/webhooks/whatsapp"
                    required
                  />
                </div>

                {/* DLT SMS */}
                <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Telecom DLT Transactional SMS Gateway</p>
                      <p className="text-blue-200 text-[11px]">Entity ID: {draftSettings.dltEntityId} • Header: {draftSettings.dltHeaderPrefix}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection('DLT_SMS')}
                        disabled={pingingTarget === 'DLT_SMS'}
                        className="bg-blue-900 border-blue-400 text-blue-100 text-[11px] h-7 px-2.5 font-bold"
                      >
                        {pingingTarget === 'DLT_SMS' ? 'Testing...' : 'Test DLT'}
                      </Button>
                      <input
                        type="checkbox"
                        checked={draftSettings.dltTransactionalSmsEnabled}
                        onChange={(e) => updateSetting('dltTransactionalSmsEnabled', e.target.checked)}
                        className="w-5 h-5 rounded-lg text-blue-500 focus:ring-blue-400 bg-blue-950 border-2 border-blue-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CyberSettingInput
                      label="DLT Principal Entity ID"
                      type="text"
                      category="COMMUNICATIONS_GATEWAYS"
                      value={draftSettings.dltEntityId}
                      onChange={(val) => updateSetting('dltEntityId', String(val))}
                      placeholder="170115928391823"
                      required
                    />

                    <CyberSettingInput
                      label="DLT Header Prefix"
                      type="text"
                      category="COMMUNICATIONS_GATEWAYS"
                      value={draftSettings.dltHeaderPrefix}
                      onChange={(val) => updateSetting('dltHeaderPrefix', String(val))}
                      placeholder="FOCUSP"
                      required
                    />
                  </div>
                </div>

                {/* SMTP Mail Relayer */}
                <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Transactional SMTP Mail Server</p>
                      <p className="text-blue-200 text-[11px]">{draftSettings.smtpHost}:{draftSettings.smtpPort} • {draftSettings.smtpEncryption}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection('SMTP')}
                      disabled={pingingTarget === 'SMTP'}
                      className="bg-blue-900 border-blue-400 text-blue-100 text-[11px] h-7 px-2.5 font-bold"
                    >
                      {pingingTarget === 'SMTP' ? 'Testing...' : 'Test SMTP'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CyberSettingInput
                      label="Official Sender Email"
                      type="text"
                      category="COMMUNICATIONS_GATEWAYS"
                      value={draftSettings.senderEmail}
                      onChange={(val) => updateSetting('senderEmail', String(val))}
                      placeholder="governance@focuspoint.org.in"
                      required
                    />

                    <CyberSettingInput
                      label="Daily Outbound SMS Quota"
                      type="number"
                      unit="SMS"
                      category="COMMUNICATIONS_GATEWAYS"
                      value={draftSettings.dailySmsQuotaLimit}
                      onChange={(val) => updateSetting('dailySmsQuotaLimit', Number(val))}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              SECTION 4: AI & INTELLIGENCE CORE (Cyan Theme)
              =================================================================== */}
          {isCategoryVisible('AI_INTELLIGENCE_CORE') && (
            <div className="p-6 rounded-3xl bg-cyan-950/80 border-2 border-cyan-500/70 text-cyan-100 shadow-[0_0_30px_rgba(6,182,212,0.2)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-900 border border-cyan-400 text-cyan-200 shadow-inner">
                    <Cpu className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Autonomous AI Intelligence Core</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900 border border-cyan-400 text-cyan-200 font-mono">
                        COGNITIVE
                      </span>
                    </h3>
                    <p className="text-xs text-cyan-200 font-medium">Predictive anomaly models, dynamic pricing, and attendance fraud filters</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                    Autonomous Forecasting Model Engine
                  </label>
                  <select
                    value={draftSettings.aiForecastingModel}
                    onChange={(e) => updateSetting('aiForecastingModel', e.target.value as AiModelEngine)}
                    style={{
                      color: '#ffffff',
                      backgroundColor: 'rgba(8, 51, 68, 0.95)'
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cyan-950 border-2 border-cyan-500/70 text-white text-xs font-bold focus:outline-none focus:border-cyan-300 shadow-inner"
                  >
                    <option value="GEMINI_2_FLASH">Gemini 2.0 Flash (Fastest Neural Inference • Default)</option>
                    <option value="GEMINI_1_5_PRO">Gemini 1.5 Pro (Deep Multimodal Reasoning)</option>
                    <option value="CLAUDE_3_5_SONNET">Claude 3.5 Sonnet (High Precision Statistical Synthesis)</option>
                    <option value="DEEPSEEK_R1">DeepSeek R1 (Autonomous Mathematical Reasoning)</option>
                  </select>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Predictive Anomaly & Leakage Detection</p>
                      <p className="text-cyan-200 text-[11px]">Continuously monitors GMV streams for revenue leakages or unusual variances</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftSettings.predictiveAnomalyDetectionEnabled}
                      onChange={(e) => updateSetting('predictiveAnomalyDetectionEnabled', e.target.checked)}
                      className="w-5 h-5 rounded-lg text-cyan-500 focus:ring-cyan-400 bg-cyan-950 border-2 border-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Dynamic Real-Time Smart Pricing Engine</p>
                      <p className="text-cyan-200 text-[11px]">Calculates algorithmic slot discounts during off-peak study hours</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftSettings.smartPricingEngineEnabled}
                      onChange={(e) => updateSetting('smartPricingEngineEnabled', e.target.checked)}
                      className="w-5 h-5 rounded-lg text-cyan-500 focus:ring-cyan-400 bg-cyan-950 border-2 border-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Autonomous Attendance Fraud Detection</p>
                      <p className="text-cyan-200 text-[11px]">Detects duplicate QR scans, GPS spoofing, and simultaneous multi-hall check-ins</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftSettings.autoAttendanceFraudDetection}
                      onChange={(e) => updateSetting('autoAttendanceFraudDetection', e.target.checked)}
                      className="w-5 h-5 rounded-lg text-cyan-500 focus:ring-cyan-400 bg-cyan-950 border-2 border-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <CyberSettingInput
                    label="Decision Confidence Floor"
                    description="Minimum threshold before auto-executing actions"
                    type="number"
                    unit="%"
                    category="AI_INTELLIGENCE_CORE"
                    value={draftSettings.aiConfidenceThresholdPercent}
                    onChange={(val) => updateSetting('aiConfidenceThresholdPercent', Number(val))}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-cyan-100 mb-1.5">
                      Executive Digest Cadence
                    </label>
                    <select
                      value={draftSettings.executiveReportFrequency}
                      onChange={(e) => updateSetting('executiveReportFrequency', e.target.value as any)}
                      style={{
                        color: '#ffffff',
                        backgroundColor: 'rgba(8, 51, 68, 0.95)'
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-cyan-950 border-2 border-cyan-500/70 text-white text-xs font-bold focus:outline-none focus:border-cyan-300 shadow-inner"
                    >
                      <option value="DAILY">Daily at 08:00 AM IST</option>
                      <option value="WEEKLY">Weekly on Mondays</option>
                      <option value="MONTHLY">Monthly 1st Calendar Day</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              SECTION 5: INSFORGE POSTGRESQL & INFRASTRUCTURE (Indigo Theme)
              =================================================================== */}
          {isCategoryVisible('INFRASTRUCTURE_DATABASE') && (
            <div className="p-6 rounded-3xl bg-indigo-950/80 border-2 border-indigo-500/70 text-indigo-100 shadow-[0_0_30px_rgba(99,102,241,0.2)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-900 border border-indigo-400 text-indigo-200 shadow-inner">
                    <Database className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>InsForge PostgreSQL & Distributed Mesh</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900 border border-indigo-400 text-indigo-200 font-mono">
                        POSTGRES-16
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200 font-medium">Remote database bridges, connection pools, and edge sync timers</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <CyberSettingInput
                  label="InsForge Remote Service URL"
                  description="Target endpoint for PostgreSQL database synchronization"
                  type="text"
                  category="INFRASTRUCTURE_DATABASE"
                  value={draftSettings.insforgeRemoteServiceUrl}
                  onChange={(val) => updateSetting('insforgeRemoteServiceUrl', String(val))}
                  placeholder="https://api.insforge.io/v1/focuspoint-prod"
                  rightAction={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection('INSFORGE')}
                      disabled={pingingTarget === 'INSFORGE'}
                      className="bg-indigo-900 border-indigo-400 text-indigo-100 text-[11px] h-6 px-2.5 font-bold"
                    >
                      {pingingTarget === 'INSFORGE' ? 'Pinging...' : 'Ping Cluster'}
                    </Button>
                  }
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CyberSettingInput
                    label="Database Connection Pool Size"
                    description="Maximum concurrent socket pool"
                    type="number"
                    unit="Sockets"
                    category="INFRASTRUCTURE_DATABASE"
                    value={draftSettings.databasePoolMaxConnections}
                    onChange={(val) => updateSetting('databasePoolMaxConnections', Number(val))}
                    required
                  />

                  <CyberSettingInput
                    label="Edge Kiosk Offline Sync Interval"
                    description="Background synchronization cadence"
                    type="number"
                    unit="Sec"
                    category="INFRASTRUCTURE_DATABASE"
                    value={draftSettings.offlineSyncIntervalSeconds}
                    onChange={(val) => updateSetting('offlineSyncIntervalSeconds', Number(val))}
                    required
                  />

                  <CyberSettingInput
                    label="Read-Replica Cloud Region"
                    type="text"
                    category="INFRASTRUCTURE_DATABASE"
                    value={draftSettings.readReplicaRegion}
                    onChange={(val) => updateSetting('readReplicaRegion', String(val))}
                    placeholder="ap-south-1 (Mumbai)"
                    required
                  />

                  <CyberSettingInput
                    label="Statutory Data Retention"
                    description="Audit log preservation mandate"
                    type="number"
                    unit="Months"
                    category="INFRASTRUCTURE_DATABASE"
                    value={draftSettings.dataRetentionMonths}
                    onChange={(val) => updateSetting('dataRetentionMonths', Number(val))}
                    required
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-900/40 border border-indigo-500/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">Automated PostgreSQL VACUUM Optimization</p>
                    <p className="text-indigo-200 text-[11px]">Nightly automated index maintenance and dead row reclamation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.autoVacuumEnabled}
                    onChange={(e) => updateSetting('autoVacuumEnabled', e.target.checked)}
                    className="w-5 h-5 rounded-lg text-indigo-500 focus:ring-indigo-400 bg-indigo-950 border-2 border-indigo-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              SECTION 6: EMERGENCY OPERATIONS & CIRCUIT BREAKERS (Rose Theme)
              =================================================================== */}
          {isCategoryVisible('EMERGENCY_CIRCUIT_BREAKERS') && (
            <div className="p-6 rounded-3xl bg-rose-950/90 border-2 border-rose-500/80 text-rose-100 shadow-[0_0_35px_rgba(244,63,94,0.3)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-900 border border-rose-400 text-rose-200 shadow-inner">
                    <AlertTriangle className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Emergency Operations & Circuit Breakers</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900 border border-rose-400 text-rose-200 font-mono">
                        CRISIS-FAILSAFE
                      </span>
                    </h3>
                    <p className="text-xs text-rose-200 font-medium">Instant failover switches for system maintenance and crisis management</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Platform Maintenance Banner */}
                <div className="p-4 rounded-2xl bg-rose-900/40 border border-rose-500/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Public Maintenance Announcement Banner Mode</p>
                      <p className="text-rose-200 text-[11px]">Displays scheduled upgrade alert banner to all active students and faculty</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftSettings.platformMaintenanceBannerMode}
                      onChange={(e) => updateSetting('platformMaintenanceBannerMode', e.target.checked)}
                      className="w-5 h-5 rounded-lg text-rose-500 focus:ring-rose-400 bg-rose-950 border-2 border-rose-400 cursor-pointer"
                    />
                  </div>

                  {draftSettings.platformMaintenanceBannerMode && (
                    <div className="space-y-2 pt-1 animate-in fade-in">
                      <CyberSettingTextarea
                        label="Broadcast Announcement Message"
                        description="This exact message will be pinned to the top of all user mobile apps and web consoles"
                        value={draftSettings.maintenanceBannerMessage}
                        onChange={(val) => updateSetting('maintenanceBannerMessage', val)}
                        placeholder="System scheduled optimization window in progress..."
                        rows={3}
                        category="EMERGENCY_CIRCUIT_BREAKERS"
                      />

                      {/* Live User-Facing Banner Preview */}
                      <div className="p-3 rounded-xl bg-amber-950/80 border-2 border-amber-500/70 text-amber-100 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase font-mono text-amber-300 font-bold">
                            Live User App Banner Preview
                          </div>
                          <div className="text-xs font-semibold text-white mt-0.5">
                            {draftSettings.maintenanceBannerMessage || 'No message entered'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Read-Only Circuit Breaker */}
                <div className="p-4 rounded-2xl bg-rose-900/60 border-2 border-rose-500/80 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="font-black text-white text-xs flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>Emergency Read-Only Circuit Breaker</span>
                    </p>
                    <p className="text-rose-200 text-[11px]">Instantly halts all new financial payments and seat bookings across all libraries</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.emergencyReadOnlyCircuitBreaker}
                    onChange={(e) => {
                      if (!draftSettings.emergencyReadOnlyCircuitBreaker && !window.confirm('WARNING: Activate Emergency Read-Only Mode? All payments will pause.')) return;
                      updateSetting('emergencyReadOnlyCircuitBreaker', e.target.checked);
                    }}
                    className="w-6 h-6 rounded-lg text-rose-600 focus:ring-rose-400 bg-rose-950 border-2 border-rose-400 cursor-pointer"
                  />
                </div>

                {/* Emergency Payout Freeze */}
                <div className="p-4 rounded-2xl bg-rose-900/60 border-2 border-rose-500/80 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="font-black text-white text-xs flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-rose-400" />
                      <span>Emergency Financial Payout Freeze</span>
                    </p>
                    <p className="text-rose-200 text-[11px]">Suspends all automated NEFT/RTGS batch transfers to faculty and library bank accounts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.emergencyPayoutFreeze}
                    onChange={(e) => {
                      if (!draftSettings.emergencyPayoutFreeze && !window.confirm('WARNING: Freeze all banking payouts?')) return;
                      updateSetting('emergencyPayoutFreeze', e.target.checked);
                    }}
                    className="w-6 h-6 rounded-lg text-rose-600 focus:ring-rose-400 bg-rose-950 border-2 border-rose-400 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-rose-100 mb-1.5">
                      Disaster Recovery Readiness Level
                    </label>
                    <select
                      value={draftSettings.disasterRecoveryProtocolLevel}
                      onChange={(e) => updateSetting('disasterRecoveryProtocolLevel', e.target.value as DisasterRecoveryLevel)}
                      style={{
                        color: '#ffffff',
                        backgroundColor: 'rgba(76, 5, 25, 0.95)'
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950 border-2 border-rose-500/70 text-white text-xs font-bold focus:outline-none focus:border-rose-400 shadow-inner"
                    >
                      <option value="LEVEL_0_NORMAL">LEVEL 0: Normal Standard Production</option>
                      <option value="LEVEL_1_WARNING">LEVEL 1: Warning / Monsoon Contingency</option>
                      <option value="LEVEL_2_ELEVATED">LEVEL 2: Elevated Threat / DDoS Mitigation</option>
                      <option value="LEVEL_3_LOCKDOWN">LEVEL 3: Sovereign Full Lockdown Mode</option>
                    </select>
                  </div>

                  <CyberSettingInput
                    label="24/7 Crisis Helpline Direct Number"
                    type="text"
                    category="EMERGENCY_CIRCUIT_BREAKERS"
                    value={draftSettings.emergencyHelplineDirectNumber}
                    onChange={(val) => updateSetting('emergencyHelplineDirectNumber', String(val))}
                    placeholder="+91 94152 88201"
                    required
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* =========================================================================
            BOTTOM GLOBAL ACTION DOCK
            ========================================================================= */}
        <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-slate-950/95 border-2 border-purple-500/60 shadow-[0_0_35px_rgba(168,85,247,0.3)] backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-xs">
              <span className="font-bold text-white">System Protocol {draftSettings.version}</span>
              <span className="text-slate-300 ml-2">Last Synchronized: {draftSettings.lastUpdated}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {pendingDiffs.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Discard Changes</span>
              </Button>
            )}

            <Button
              type="submit"
              disabled={saving || pendingDiffs.length === 0}
              className={`text-white font-black text-xs px-8 py-2.5 transition-all shadow-xl ${
                pendingDiffs.length > 0
                  ? 'bg-gradient-to-r from-emerald-600 via-purple-600 to-cyan-600 hover:opacity-90 shadow-[0_0_25px_rgba(168,85,247,0.4)] animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              <span>
                {saving 
                  ? 'Sealing Policies...' 
                  : pendingDiffs.length > 0 
                    ? `Save & Seal (${pendingDiffs.length} Modifications)` 
                    : 'All Policies Synchronized'
                }
              </span>
            </Button>
          </div>
        </div>
      </form>

      {/* =========================================================================
          MODAL: REVIEW PENDING CHANGES DIFF
          ========================================================================= */}
      {isDiffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-900/90 border border-amber-400 text-amber-200">
                  <Eye className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Review Unsaved Policy Modifications</h3>
                  <p className="text-xs text-amber-200 font-medium">Verify parameter delta before writing to immutable Merkle ledger</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDiffModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingDiffs.map((diff, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{diff.label}</span>
                    <div className="text-[10px] font-mono text-purple-300 mt-0.5">{String(diff.key)}</div>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 line-through">
                      {String(diff.previousValue)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 font-bold">
                      {String(diff.newValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Discard All
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveAll()}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>Confirm & Seal Modifications</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IMPORT JSON CONFIGURATION MANIFEST
          ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-emerald-500/80 rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(16,185,129,0.35)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-900/90 border border-emerald-400 text-emerald-200">
                  <Upload className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Import Configuration Manifest</h3>
                  <p className="text-xs text-emerald-200 font-medium">Load exported JSON settings into platform draft memory</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Paste JSON Payload or Upload File
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  Upload .json file
                </button>
              </div>
              <textarea
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError(null);
                }}
                placeholder='{"version": "5.2.0-SOVEREIGN", "tuitionCommissionPercent": 10.0, ...}'
                rows={8}
                style={{
                  color: '#ffffff',
                  caretColor: '#34d399',
                  WebkitTextFillColor: '#ffffff'
                }}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              {importError && (
                <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{importError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleImportSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6"
              >
                Validate & Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
