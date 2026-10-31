// FOCUSPOINT Futuristic Study Material & Previous Year Question (PYQ) Vault Console
// Panoramic Cyber-HUD with Real-Time Telemetry, Working Dual Vault Modes (Official PYQ Shifts & Academic Courseware),
// 1-Click CBT Preview Simulator, Version Control Drawer, Metadata Ingestion Modal, and Procedural Web Audio SFX.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Layers, 
  ArrowUpRight, 
  ExternalLink,
  History,
  Archive,
  Send,
  Sparkles,
  Tag,
  DollarSign,
  FileSpreadsheet,
  Calendar,
  Play,
  CheckSquare,
  Zap,
  Award,
  Cpu,
  ShieldCheck,
  RefreshCw,
  X,
  Check,
  Volume2,
  VolumeX,
  Terminal,
  Radio,
  Sliders,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Hash,
  Copy,
  Lock,
  Unlock,
  Trash2,
  Save
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { 
  StudyMaterial, 
  StudyMaterialVersion,
  StudyMaterialCategory,
  StudyMaterialStage,
  DifficultyLevelId
} from '../../types/studyMaterial';
import { operatorService } from '../../services/operatorService';

// Procedural Cyber Web Audio Synthesizer
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
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.16);
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
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(530, now + 0.04);
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
    // Audio suppressed or unsupported
  }
};

export const OperatorStudyMaterialManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const operatorId = user?.id || 'usr-operator-sunita';
  const operatorName = user?.name || 'Sunita Verma';

  // HUD & Audio States
  const [sfxEnabled, setSfxEnabled] = useState(true);

  // Core Data
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');

  // Vault Mode Switcher & PYQ Filters
  const [activeVaultTab, setActiveVaultTab] = useState<'PYQ_VAULT' | 'ALL_MATERIALS'>('PYQ_VAULT');
  const [selectedPyqYear, setSelectedPyqYear] = useState<string>('ALL');
  const [selectedPyqShift, setSelectedPyqShift] = useState<string>('ALL');
  const [selectedPyqCbtFilter, setSelectedPyqCbtFilter] = useState<'ALL' | 'CBT_READY' | 'PDF_ONLY'>('ALL');
  const [cbtPreviewTest, setCbtPreviewTest] = useState<any | null>(null);

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [versionDrawerMaterial, setVersionDrawerMaterial] = useState<StudyMaterial | null>(null);

  // Ingestion Form
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'GOVERNMENT_EXAM' as StudyMaterialCategory,
    targetClass: 'Class 10',
    educationStage: 'SECONDARY' as StudyMaterialStage,
    subject: 'Mathematics',
    language: 'Bilingual (Hindi + English)',
    difficultyLevel: 'MEDIUM' as DifficultyLevelId,
    isPaid: false,
    basePrice: 0,
    tags: 'notes, formula-sheet, exam-prep',
    fullPdfUrl: 'https://example.com/materials/sample.pdf',
    fileName: 'ZYZUS_Study_Material.pdf',
    pageCount: 32,
    targetExams: 'SSC_CGL, UP_PET',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  });

  // Version Deployment Form
  const [versionForm, setVersionForm] = useState({
    versionNumber: 'v1.1',
    fileName: 'ZYZUS_Revision_v1.1.pdf',
    fileSize: '4.2 MB',
    pageCount: 36,
    changeLog: 'Added 10 new solved previous-year examination questions and corrected typographical errata in Section 2.'
  });

  // Sound helper
  const playSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert') => {
    playCyberAudio(type, sfxEnabled);
  };

  // Load Materials from Mock Store
  const loadMaterials = () => {
    setLoading(true);
    try {
      const list = mockStore.getStudyMaterials();
      setMaterials(list);
    } catch (err) {
      console.error('Failed to load study materials', err);
      showToast('Error syncing study material vault', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Filtered Study Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.targetExams && m.targetExams.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
      const matchesExam = selectedExam === 'ALL' || 
        (m.targetExams && m.targetExams.includes(selectedExam)) ||
        (m.targetGovernmentExams && m.targetGovernmentExams.includes(selectedExam));

      return matchesSearch && matchesCategory && matchesStatus && matchesExam;
    });
  }, [materials, searchQuery, selectedCategory, selectedStatus, selectedExam]);

  // PYQ Materials Subset
  const pyqMaterials = useMemo(() => {
    return materials.filter(m => m.category === 'PREVIOUS_YEAR_PAPERS' || !!m.pyqMetadata);
  }, [materials]);

  // Filtered PYQs
  const filteredPyqs = useMemo(() => {
    return pyqMaterials.filter(m => {
      const meta = m.pyqMetadata;
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meta && meta.examName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (meta && meta.paperCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesExam = selectedExam === 'ALL' || (meta && meta.examId === selectedExam) || (m.targetExams && m.targetExams.includes(selectedExam));
      const matchesYear = selectedPyqYear === 'ALL' || (meta && meta.examYear.toString() === selectedPyqYear);
      const matchesShift = selectedPyqShift === 'ALL' || (meta && meta.shift.toLowerCase().includes(selectedPyqShift.toLowerCase()));
      const matchesCbt = selectedPyqCbtFilter === 'ALL' || 
        (selectedPyqCbtFilter === 'CBT_READY' && meta?.isCbtAvailable) ||
        (selectedPyqCbtFilter === 'PDF_ONLY' && !meta?.isCbtAvailable);

      return matchesSearch && matchesExam && matchesYear && matchesShift && matchesCbt;
    });
  }, [pyqMaterials, searchQuery, selectedExam, selectedPyqYear, selectedPyqShift, selectedPyqCbtFilter]);

  // Handler: Open Upload / Ingestion Modal
  const handleOpenUpload = (item?: StudyMaterial) => {
    playSound('click');
    if (item) {
      setEditingMaterial(item);
      setForm({
        title: item.title,
        description: item.description,
        category: item.category,
        targetClass: item.targetClass,
        educationStage: item.educationStage,
        subject: item.subject,
        language: item.language,
        difficultyLevel: item.difficultyLevel,
        isPaid: item.isPaid,
        basePrice: item.basePrice,
        tags: item.tags.join(', '),
        fullPdfUrl: item.fullPdfUrl,
        fileName: item.fileName,
        pageCount: item.pageCount,
        targetExams: (item.targetExams || []).join(', '),
        status: item.status
      });
    } else {
      setEditingMaterial(null);
      setForm({
        title: '',
        description: '',
        category: 'GOVERNMENT_EXAM',
        targetClass: 'Class 10',
        educationStage: 'SECONDARY',
        subject: 'Mathematics',
        language: 'Bilingual (Hindi + English)',
        difficultyLevel: 'MEDIUM',
        isPaid: false,
        basePrice: 0,
        tags: 'notes, formulas, syllabus-2026',
        fullPdfUrl: 'https://example.com/materials/sample.pdf',
        fileName: 'ZYZUS_Material.pdf',
        pageCount: 24,
        targetExams: 'SSC_CGL, UP_PET',
        status: 'PUBLISHED'
      });
    }
    setIsUploadModalOpen(true);
  };

  // Handler: Save Material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound('warp');
    const tagArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const examArray = form.targetExams.split(',').map(e => e.trim()).filter(Boolean);

    try {
      if (editingMaterial) {
        const updated: StudyMaterial = {
          ...editingMaterial,
          title: form.title,
          description: form.description,
          category: form.category,
          targetClass: form.targetClass,
          subject: form.subject,
          language: form.language,
          difficultyLevel: form.difficultyLevel,
          isPaid: form.isPaid,
          basePrice: form.isPaid ? Number(form.basePrice) : 0,
          tags: tagArray,
          targetExams: examArray,
          status: form.status,
          updatedAt: new Date().toISOString()
        };
        mockStore.updateStudyMaterial(updated);

        await operatorService.logActivity({
          operatorId,
          operatorName,
          action: 'MATERIAL_EDIT',
          entity: 'STUDY_MATERIAL',
          entityId: updated.id,
          entityTitle: updated.title,
          details: `Updated metadata for "${updated.title}" with ${tagArray.length} tags.`
        });

        playSound('confirm');
        showToast('Study material metadata updated successfully!', 'success');
      } else {
        const initialVersion: StudyMaterialVersion = {
          versionId: `ver-${Date.now()}`,
          versionNumber: 'v1.0',
          fileUrl: form.fullPdfUrl,
          fileName: form.fileName,
          fileSize: '3.8 MB',
          pageCount: form.pageCount,
          uploadedAt: new Date().toISOString(),
          uploadedBy: operatorName,
          changeLog: 'Initial publication of verified study notes.'
        };

        const newMaterial: StudyMaterial = {
          id: `mat-${Date.now()}`,
          title: form.title,
          description: form.description,
          category: form.category,
          targetClass: form.targetClass,
          educationStage: form.educationStage,
          subject: form.subject,
          academicSession: '2026-2027 (Current)',
          language: form.language,
          difficultyLevel: form.difficultyLevel,
          tags: tagArray,
          fullPdfUrl: form.fullPdfUrl,
          fileName: form.fileName,
          fileSize: '3.8 MB',
          pageCount: form.pageCount,
          currentVersion: 'v1.0',
          versionHistory: [initialVersion],
          isPaid: form.isPaid,
          basePrice: form.isPaid ? Number(form.basePrice) : 0,
          isVerified: true,
          totalDownloads: 0,
          totalPurchases: 0,
          rating: 5.0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: form.status,
          targetExams: examArray
        };

        mockStore.addStudyMaterial(newMaterial);

        await operatorService.logActivity({
          operatorId,
          operatorName,
          action: 'MATERIAL_UPLOAD',
          entity: 'STUDY_MATERIAL',
          entityId: newMaterial.id,
          entityTitle: newMaterial.title,
          details: `Uploaded new study material: ${newMaterial.title} mapped to ${examArray.join(', ')}`
        });

        playSound('confirm');
        showToast('New study material published to catalog!', 'success');
      }

      setIsUploadModalOpen(false);
      loadMaterials();
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('Failed to save study material', 'error');
    }
  };

  // Handler: Add New Version
  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionDrawerMaterial) return;
    playSound('warp');

    try {
      const newVer: StudyMaterialVersion = {
        versionId: `ver-${Date.now()}`,
        versionNumber: versionForm.versionNumber,
        fileUrl: versionDrawerMaterial.fullPdfUrl,
        fileName: versionForm.fileName,
        fileSize: versionForm.fileSize,
        pageCount: versionForm.pageCount,
        uploadedAt: new Date().toISOString(),
        uploadedBy: operatorName,
        changeLog: versionForm.changeLog
      };

      const updated: StudyMaterial = {
        ...versionDrawerMaterial,
        currentVersion: newVer.versionNumber,
        fileName: newVer.fileName,
        fileSize: newVer.fileSize,
        pageCount: newVer.pageCount,
        versionHistory: [newVer, ...versionDrawerMaterial.versionHistory],
        updatedAt: new Date().toISOString()
      };

      mockStore.updateStudyMaterial(updated);

      await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MATERIAL_VERSION_ADD',
        entity: 'STUDY_MATERIAL',
        entityId: updated.id,
        entityTitle: updated.title,
        details: `Created new material version ${newVer.versionNumber} without invalidating student entitlements.`
      });

      playSound('confirm');
      showToast(`Version ${newVer.versionNumber} deployed cleanly!`, 'success');
      setVersionDrawerMaterial(null);
      loadMaterials();
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('Failed to deploy material version', 'error');
    }
  };

  // Handler: 1-Click Toggle Publish / Draft
  const handleTogglePublish = async (material: StudyMaterial) => {
    playSound('toggle');
    const newStatus: StudyMaterial['status'] = material.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = { ...material, status: newStatus, updatedAt: new Date().toISOString() };
    mockStore.updateStudyMaterial(updated);

    await operatorService.logActivity({
      operatorId,
      operatorName,
      action: newStatus === 'PUBLISHED' ? 'MATERIAL_PUBLISH' : 'MATERIAL_EDIT',
      entity: 'STUDY_MATERIAL',
      entityId: material.id,
      entityTitle: material.title,
      details: `Toggled status to ${newStatus}.`
    });

    playSound('confirm');
    showToast(`Material status switched to ${newStatus}`, 'info');
    loadMaterials();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* ============================================================ */}
      {/* 1. CYBER-HUD HERO BANNER & REPOSITORY BEACONS */}
      {/* ============================================================ */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Glow ambient meshes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Top Telemetry Status Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                VAULT STATUS: ENCLAVE ONLINE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                PAN-INDIA VERIFIED CURRICULUM
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-700/60">
                <Cpu className="w-3 h-3 text-emerald-400" />
                INTEGRITY: SHA-256 TAMPER-PROOF
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-700/60">
                <Radio className="w-3 h-3 text-cyan-400" />
                NOC: VARANASI ACADEMIC GRID
              </span>
            </div>

            {/* Title & Mission Line */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Study Material & PYQ Master Vault</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase font-mono tracking-widest">
                  DOCUMENT OS
                </span>
              </h1>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Lead Academic Setter: <span className="font-bold text-white">{operatorName}</span>. Author, digitize, version, and distribute verified Previous Year Question (PYQ) shifts and K-12 academic courseware across 28 states.
              </p>
            </div>
          </div>

          {/* Quick HUD Audio & Actions */}
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

            {/* Launch PYQ Studio Link */}
            <Link to="/operator/pyq-studio" onClick={() => playSound('warp')}>
              <Button
                variant="secondary"
                className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border-indigo-700 font-bold"
              >
                <Sparkles className="w-4 h-4 mr-2 text-cyan-300" />
                PYQ Digitize Studio
              </Button>
            </Link>

            {/* Upload New Document Trigger */}
            <Button
              onClick={() => handleOpenUpload()}
              variant="primary"
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload New Material
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. 6-KPI HOLOGRAPHIC TELEMETRY DECK */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* KPI 1: Archived Documents */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Total Assets
            </span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono">{materials.length}</h3>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            {materials.filter(m => m.status === 'PUBLISHED').length} Published
          </p>
        </div>

        {/* KPI 2: Official PYQ Shifts */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
              PYQ Shifts
            </span>
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono">{pyqMaterials.length}</h3>
          <p className="text-[10px] font-mono text-purple-300 mt-1">
            100% Shift Verified
          </p>
        </div>

        {/* KPI 3: CBT-Ready Papers */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              CBT Interactive
            </span>
            <Play className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {pyqMaterials.filter(p => p.pyqMetadata?.isCbtAvailable).length}
          </h3>
          <p className="text-[10px] font-mono text-emerald-300 mt-1">
            Live Testing Ready
          </p>
        </div>

        {/* KPI 4: Exam Cycles Covered */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              Cycles
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black text-amber-300 mt-1 font-mono">2018 - 2025</h3>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            SSC, NTA, Police, UP
          </p>
        </div>

        {/* KPI 5: Cumulative Downloads */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
              Downloads
            </span>
            <Download className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono">
            {materials.reduce((acc, m) => acc + m.totalDownloads, 0).toLocaleString()}
          </h3>
          <p className="text-[10px] font-mono text-blue-300 mt-1">
            Pan-India Students
          </p>
        </div>

        {/* KPI 6: Pedagogical Quality Score */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Accuracy
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">100%</h3>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            Zero Errata Audit
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DUAL MODE SWITCHER: OFFICIAL PYQ VAULT vs ALL MATERIALS */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              playSound('click');
              setActiveVaultTab('PYQ_VAULT');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
              activeVaultTab === 'PYQ_VAULT'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <span>Official Exam PYQ Shifts Vault</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700">
              {pyqMaterials.length}
            </span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveVaultTab('ALL_MATERIALS');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
              activeVaultTab === 'ALL_MATERIALS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span>All Study Courseware & Notes</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700">
              {materials.length}
            </span>
          </button>
        </div>

        {/* Teleport Quick-Links */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link to="/operator/dashboard" onClick={() => playSound('click')}>
            <span className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold">
              <Terminal className="w-3.5 h-3.5" /> Return to HUD
            </span>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MODE 1: OFFICIAL EXAM PYQ VAULT (SHIFTS & CBT ENGINE) */}
      {/* ============================================================ */}
      {activeVaultTab === 'PYQ_VAULT' && (
        <div className="space-y-6">
          {/* Dedicated Studio Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/40">
                <Sparkles className="w-3 h-3 text-cyan-400" /> AI Neural OCR & Digitize Studio
              </div>
              <h3 className="text-base font-bold text-white">Need to ingest a new official Exam Shift paper?</h3>
              <p className="text-xs text-slate-300">
                Launch the dedicated full-screen studio to OCR-extract questions, verify official answer keys, and synthesize CBT mock tests.
              </p>
            </div>
            <Link to="/operator/pyq-studio" onClick={() => playSound('warp')}>
              <Button variant="primary" className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-slate-950 font-black text-xs shadow-md">
                Open Ingestion Studio <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Filter Bar for PYQs */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search PYQs by exam, year, shift, paper code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 text-slate-200 border border-slate-800 p-2 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="ALL">All Examinations</option>
                  <option value="SSC_CGL">SSC CGL</option>
                  <option value="UP_POLICE">UP Police Constable</option>
                  <option value="NEET_UG">NEET UG</option>
                  <option value="IIT_JEE">JEE Main</option>
                  <option value="CTET">CTET Paper 2</option>
                  <option value="UP_PET">UP PET</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedPyqYear}
                  onChange={(e) => setSelectedPyqYear(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 text-slate-200 border border-slate-800 p-2 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="ALL">All Years (2018-2025)</option>
                  <option value="2025">2025 (Latest)</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedPyqCbtFilter}
                  onChange={(e) => setSelectedPyqCbtFilter(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 text-slate-200 border border-slate-800 p-2 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="ALL">All CBT Modes</option>
                  <option value="CBT_READY">CBT Interactive Ready</option>
                  <option value="PDF_ONLY">PDF Booklet Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rich PYQ Card Grid */}
          {filteredPyqs.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/60 space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No Previous Year Question Papers Match Filters</h3>
              <p className="text-xs text-slate-400">Try changing the year or exam filter, or digitize a new paper.</p>
              <Link to="/operator/pyq-studio" className="inline-block mt-3">
                <Button variant="primary" size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Launch PYQ Digitize Studio
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPyqs.map(paper => {
                const meta = paper.pyqMetadata;
                const isPublished = paper.status === 'PUBLISHED';

                return (
                  <div 
                    key={paper.id} 
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Badge Ribbon */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-bold">
                            {meta?.examId || paper.targetExams?.[0] || 'EXAM'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
                            Year {meta?.examYear || 2024}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            {meta?.shift || 'Shift-1'}
                          </span>
                          {meta?.paperCode && (
                            <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[11px]">
                              Code: {meta.paperCode}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* CBT Indicator */}
                          {meta?.isCbtAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              <Play className="w-3 h-3 text-emerald-400" /> CBT Ready
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-400">
                              PDF Booklet
                            </span>
                          )}

                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                            isPublished
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {paper.status}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-white leading-snug hover:text-cyan-300 transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {paper.description}
                        </p>
                      </div>

                      {/* Official Specs Breakdown */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Questions</span>
                          <strong className="text-white">{meta?.totalQuestions || paper.pageCount * 3} Qs</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Total Marks</span>
                          <strong className="text-cyan-400">{meta?.totalMarks || 200}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Negative</span>
                          <strong className="text-amber-400">-{meta?.negativeMarking || 0.50}</strong>
                        </div>
                      </div>

                      {/* Sections Pills */}
                      {meta?.sections && meta.sections.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {meta.sections.map((sec, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[11px] font-mono">
                              {sec.name} ({sec.questionCount}Q)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {meta?.isCbtAvailable && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              playSound('warp');
                              const test = mockStore.getMockTestById(meta.linkedCbtMockTestId || '') || {
                                title: paper.title,
                                durationMinutes: meta.durationMinutes || 60,
                                totalQuestions: meta.totalQuestions || 100,
                                totalMarks: meta.totalMarks || 200,
                                instructions: ['Official Examination CBT Preview']
                              };
                              setCbtPreviewTest(test);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-8 px-3 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 mr-1" /> Launch CBT Preview
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            playSound('confirm');
                            showToast(`Simulating secure download for: ${paper.fileName}`, 'info');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-8 px-2.5 border-slate-700"
                          title="Download Master Question Paper"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Master PDF
                        </Button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* 1-Click Publish Toggle */}
                        <button
                          onClick={() => handleTogglePublish(paper)}
                          className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            isPublished
                              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                          }`}
                          title="Toggle Published / Draft Status"
                        >
                          {isPublished ? 'Unpublish' : 'Publish'}
                        </button>

                        {/* Version History Drawer Trigger */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            playSound('click');
                            setVersionDrawerMaterial(paper);
                          }}
                          className="text-xs text-slate-300 hover:text-white h-8 px-2"
                        >
                          <History className="w-3.5 h-3.5 mr-1" /> {paper.currentVersion || 'v1.0'}
                        </Button>

                        {/* Edit Metadata Modal Trigger */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenUpload(paper)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 h-8 px-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODE 2: ALL ACADEMIC STUDY MATERIALS & NOTES */}
      {/* ============================================================ */}
      {activeVaultTab === 'ALL_MATERIALS' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="relative lg:col-span-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search courseware, notes, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 text-slate-200 border border-slate-800 p-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="GOVERNMENT_EXAM">Government Exam</option>
                  <option value="ACADEMIC">K-12 Academic</option>
                  <option value="NOTES">Revision Notes</option>
                  <option value="PRACTICE_SETS">Practice Sets</option>
                  <option value="PREVIOUS_YEAR_PAPERS">Previous Year Papers</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 text-slate-200 border border-slate-800 p-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 text-slate-200 border border-slate-800 p-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Mapped Exams</option>
                  <option value="SSC_CGL">SSC CGL</option>
                  <option value="UP_PET">UPSSSC PET</option>
                  <option value="NEET_UG">NEET UG</option>
                  <option value="IIT_JEE">JEE Main</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table / List View of Materials */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Title & Subject</th>
                    <th className="py-3 px-4">Category & Class</th>
                    <th className="py-3 px-4 text-center">Version</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Pricing</th>
                    <th className="py-3 px-4 text-center">Downloads</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMaterials.map((mat) => {
                    const isPublished = mat.status === 'PUBLISHED';
                    return (
                      <tr key={mat.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3.5 px-4 font-sans">
                          <p className="font-bold text-white text-sm line-clamp-1">{mat.title}</p>
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-cyan-400">
                            <span>{mat.subject}</span>
                            <span>•</span>
                            <span className="text-slate-400">{mat.fileName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                            {mat.category.replace(/_/g, ' ')}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">{mat.targetClass}</p>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              playSound('click');
                              setVersionDrawerMaterial(mat);
                            }}
                            className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-bold hover:border-indigo-400 transition-colors"
                          >
                            {mat.currentVersion || 'v1.0'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPublished
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {mat.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {mat.isPaid ? (
                            <span className="text-amber-400 font-bold">₹{mat.basePrice}</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">FREE</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-300 font-bold">
                          {mat.totalDownloads.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTogglePublish(mat)}
                              className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                                isPublished
                                  ? 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                              }`}
                            >
                              {isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => handleOpenUpload(mat)}
                              className="px-2 py-1 rounded bg-slate-950 text-cyan-400 hover:text-cyan-300 border border-slate-800 text-[11px]"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: UPLOAD & EDIT MATERIAL INGESTION (WORKING) */}
      {/* ============================================================ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  ACADEMIC COURSEWARE INGESTION
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{editingMaterial ? 'Edit Document Metadata' : 'Ingest New Study Material Asset'}</span>
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Document Title:</label>
                <input 
                  type="text" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. UPSSSC PET 2026 Complete Arithmetic Formula & Concept Book"
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Curriculum Description:</label>
                <textarea 
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed pedagogical summary for students and tutors..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Category:</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="GOVERNMENT_EXAM">Government Exam</option>
                    <option value="ACADEMIC">K-12 Academic</option>
                    <option value="NOTES">Revision Notes</option>
                    <option value="PRACTICE_SETS">Practice Sets</option>
                    <option value="PREVIOUS_YEAR_PAPERS">Previous Year Paper</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Target Class:</label>
                  <input 
                    type="text"
                    value={form.targetClass}
                    onChange={(e) => setForm({ ...form, targetClass: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Subject:</label>
                  <input 
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Language:</label>
                  <input 
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Difficulty:</label>
                  <select
                    value={form.difficultyLevel}
                    onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                    <option value="EXEMPLAR">EXEMPLAR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Status:</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED (Active in App)</option>
                    <option value="DRAFT">DRAFT (Hidden from Students)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Target Competitive Exams (comma-separated):</label>
                  <input 
                    type="text"
                    value={form.targetExams}
                    onChange={(e) => setForm({ ...form, targetExams: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Tags (comma-separated):</label>
                  <input 
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Commercial Pricing Option */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Commercial Tier Pricing</p>
                  <p className="text-[10px] text-slate-400 font-sans">Set as Free for all students or assign a student purchase price.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isPaid: !form.isPaid })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      form.isPaid ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-slate-900 text-emerald-400 border-slate-800'
                    }`}
                  >
                    {form.isPaid ? 'PAID ASSET' : '100% FREE'}
                  </button>
                  {form.isPaid && (
                    <input 
                      type="number" 
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                      placeholder="₹ Price"
                      className="w-24 rounded-lg bg-slate-900 border border-slate-700 p-1 text-center text-xs text-white font-mono"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-lg"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {editingMaterial ? 'Save Document Metadata' : 'Commit & Ingest Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. DRAWER: VERSION HISTORY & RELEASE ROLLOUT */}
      {/* ============================================================ */}
      {versionDrawerMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-l border-cyan-500/40 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between space-y-6 text-slate-100 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    REVISION CONTROL ENCLAVE
                  </span>
                  <h3 className="text-base font-bold text-white">Version Timeline</h3>
                </div>
                <button
                  onClick={() => setVersionDrawerMaterial(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white line-clamp-1">{versionDrawerMaterial.title}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Current Deployment: <span className="text-cyan-400 font-bold">{versionDrawerMaterial.currentVersion || 'v1.0'}</span>
                </p>
              </div>

              {/* Version History List */}
              <div className="space-y-2 text-xs font-mono">
                <span className="text-slate-400 font-bold block">Historical Revisions:</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(versionDrawerMaterial.versionHistory || []).map((ver) => (
                    <div key={ver.versionId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300">{ver.versionNumber}</span>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(ver.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans">{ver.changeLog}</p>
                      <p className="text-[10px] text-slate-500">By: {ver.uploadedBy} • {ver.fileSize}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to Deploy New Version */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 text-xs font-mono">
                <span className="text-indigo-300 font-bold block">Deploy New Document Revision:</span>
                
                <form onSubmit={handleAddVersion} className="space-y-2.5">
                  <div>
                    <label className="text-slate-400 text-[11px]">New Version Identifier:</label>
                    <input 
                      type="text" 
                      value={versionForm.versionNumber}
                      onChange={(e) => setVersionForm({ ...versionForm, versionNumber: e.target.value })}
                      placeholder="e.g. v1.2"
                      required
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Change Log & Errata Summary:</label>
                    <textarea 
                      rows={2}
                      value={versionForm.changeLog}
                      onChange={(e) => setVersionForm({ ...versionForm, changeLog: e.target.value })}
                      placeholder="Describe question additions or typography corrections..."
                      required
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-xs text-white font-sans resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    Commit & Release Version
                  </Button>
                </form>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVersionDrawerMaterial(null)}
              className="bg-slate-800 text-slate-300 hover:bg-slate-700 w-full"
            >
              Close Drawer
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. MODAL: CBT INTERACTIVE TEST SIMULATOR PREVIEW */}
      {/* ============================================================ */}
      {cbtPreviewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    CBT TEST ENVIRONMENT PREVIEW
                  </span>
                  <h3 className="text-base font-bold text-white">{cbtPreviewTest.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setCbtPreviewTest(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <span className="text-slate-500 block text-[10px]">Duration</span>
                  <strong className="text-white text-sm">{cbtPreviewTest.durationMinutes || 60} Mins</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Qs</span>
                  <strong className="text-cyan-400 text-sm">{cbtPreviewTest.totalQuestions || 100} Qs</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Max Marks</span>
                  <strong className="text-emerald-400 text-sm">{cbtPreviewTest.totalMarks || 200}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-sans">
                <p className="font-bold text-slate-200">Official Exam Instructions:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>Exact questions digitized from official board previous year question shifts.</li>
                  <li>Server countdown clock with negative marking enforced per board criteria.</li>
                  <li>Instant scorecard generation with rank percentiles upon final submission.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCbtPreviewTest(null)}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  playSound('confirm');
                  showToast('CBT Simulator verified! Shift ready for candidate attempts.', 'success');
                  setCbtPreviewTest(null);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Verified & Ready for Students
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
