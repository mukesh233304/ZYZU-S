// FOCUSPOINT Super Admin — Study Material & Paid Vault Orchestration Console
// Futuristic Cognitive HUD for Centralized Study Material Management,
// Paid Vault DRM & Anti-Piracy Shield, Multi-Tier Pricing Hierarchy, Promo Engine, and Interactive Holographic PDF Simulator.

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studyMaterialService } from '../../services/studyMaterialService';
import { 
  STUDY_MATERIAL_CLASSES, 
  STUDY_MATERIAL_CATEGORIES, 
  STUDY_MATERIAL_SUBJECTS, 
  COMPETITIVE_EXAMS,
  GOVERNMENT_EXAMS,
  DIFFICULTY_LEVELS,
  CONTENT_LANGUAGES,
  ACADEMIC_SESSIONS 
} from '../../constants/studyMaterial';
import { 
  StudyMaterial, 
  StudyMaterialVersion, 
  StudyMaterialPricingRule, 
  StudyMaterialOffer, 
  StudyMaterialDownloadPolicy, 
  StudyMaterialPurchase, 
  StudyMaterialDownloadRecord,
  DifficultyLevelId,
  StudyMaterialCategory,
  StudyMaterialStage 
} from '../../types/studyMaterial';
import { 
  BookOpen, Plus, Search, Filter, Download, DollarSign, 
  Tag, ShieldCheck, CheckCircle2, AlertCircle, Clock, 
  Eye, Edit3, Trash2, Layers, RefreshCw, Upload, FileText, 
  Sliders, ArrowRight, ArrowLeft, X, Save, TrendingUp, 
  ShoppingBag, Check, Lock, Unlock, Percent, Users, HelpCircle,
  Volume2, VolumeX, Sparkles, Cpu, CheckSquare, Square, RotateCcw,
  FileCheck, ExternalLink, ShieldAlert, Zap, Award, Copy
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

// Cyber Acoustic Synthesizer for tactile feedback
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'success';

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
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.14);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(840, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'toggle':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.03);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(220, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
    }
  } catch {
    // Audio context may be restricted by browser policy before first user gesture
  }
};

type ActiveVaultTab = 'vault-catalog' | 'drm-vault' | 'pricing-matrix' | 'promo-vault' | 'audit-telemetry';

export const SuperAdminStudyMaterial: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Navigation Tabs & Audio
  const [activeTab, setActiveTab] = useState<ActiveVaultTab>('vault-catalog');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    return localStorage.getItem('fp_cyber_sound') === 'muted';
  });

  // Core Data States
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [pricingRules, setPricingRules] = useState<StudyMaterialPricingRule[]>([]);
  const [offers, setOffers] = useState<StudyMaterialOffer[]>([]);
  const [policies, setPolicies] = useState<StudyMaterialDownloadPolicy[]>([]);
  const [purchases, setPurchases] = useState<StudyMaterialPurchase[]>([]);
  const [downloads, setDownloads] = useState<StudyMaterialDownloadRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters — Material Vault
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAccessType, setFilterAccessType] = useState<'ALL' | 'PAID' | 'FREE' | 'TUTOR_LOCKED'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');

  // Batch Operations State
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);

  // 10-Step Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  // Holographic PDF Viewer Sandbox State
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [viewerCurrentPage, setViewerCurrentPage] = useState<number>(1);
  const [isWatermarkSimActive, setIsWatermarkSimActive] = useState<boolean>(true);

  // Quick Commercial Override Modal
  const [isPriceOverrideModalOpen, setIsPriceOverrideModalOpen] = useState<boolean>(false);
  const [priceOverrideMaterial, setPriceOverrideMaterial] = useState<StudyMaterial | null>(null);
  const [overrideIsPaid, setOverrideIsPaid] = useState<boolean>(false);
  const [overrideBasePrice, setOverrideBasePrice] = useState<number>(99);
  const [overrideOfferPercent, setOverrideOfferPercent] = useState<number>(0);

  // Upload New Version Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [versionModalMaterial, setVersionModalMaterial] = useState<StudyMaterial | null>(null);
  const [newVersionNumber, setNewVersionNumber] = useState<string>('v1.1');
  const [newVersionFileName, setNewVersionFileName] = useState<string>('updated_revision.pdf');
  const [newVersionChangeLog, setNewVersionChangeLog] = useState<string>('Added 2026 exam pattern solved examples');

  // Promo Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('TOPPER30');
  const [couponTitle, setCouponTitle] = useState<string>('Academic Topper 30% Concession');
  const [couponDiscountType, setCouponDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [couponDiscountValue, setCouponDiscountValue] = useState<number>(30);
  const [couponMinOrder, setCouponMinOrder] = useState<number>(99);

  // Pricing Rule Modal
  const [isPricingRuleModalOpen, setIsPricingRuleModalOpen] = useState<boolean>(false);
  const [pricingRuleLevel, setPricingRuleLevel] = useState<'DISTRICT' | 'STUDENT'>('DISTRICT');
  const [pricingRuleEntityName, setPricingRuleEntityName] = useState<string>('Ghazipur Subsidized Cell');
  const [pricingRulePrice, setPricingRulePrice] = useState<number>(49);

  // Wizard Form State
  const initialWizardForm = {
    title: '',
    description: '',
    targetClass: 'Class 10',
    educationStage: 'SECONDARY' as StudyMaterialStage,
    category: 'ACADEMIC' as StudyMaterialCategory,
    subject: 'Mathematics',
    stream: 'General' as 'Science' | 'Commerce' | 'Arts' | 'General',
    academicSession: '2026-2027 (Current)',
    language: 'Bilingual (English + Hindi)',
    difficultyLevel: 'MEDIUM' as DifficultyLevelId,
    tags: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
    previewPdfUrl: '/sample-preview.pdf',
    previewPageCount: 3,
    fullPdfUrl: '/documents/material.pdf',
    fileName: 'Material_2026.pdf',
    fileSize: '4.5 MB',
    pageCount: 30,
    currentVersion: 'v1.0',
    versionChangeLog: 'Initial release',
    isPaid: false,
    basePrice: 99,
    specialOfferPercentage: 0,
    specialOfferLabel: '',
    requiresSubjectTutorUnlock: false,
    isFeatured: false,
    isVerified: true,
    verifiedBy: 'FocusPoint Central Academic Cell',
    targetExams: [] as string[],
    targetGovernmentExams: [] as string[]
  };
  const [wizardForm, setWizardForm] = useState(initialWizardForm);

  // Initial Load
  const loadAllData = () => {
    setLoading(true);
    try {
      setMaterials(studyMaterialService.getMaterials({ status: 'ALL' }));
      setPricingRules(studyMaterialService.getPricingRules());
      setOffers(studyMaterialService.getOffers());
      setPolicies(studyMaterialService.getDownloadPolicies());
      setPurchases(studyMaterialService.getAllPurchases());
      setDownloads(studyMaterialService.getAllDownloads());
    } catch (e) {
      console.error('Failed to load study material vault data', e);
      addToast('Failed to load study material records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    localStorage.setItem('fp_cyber_sound', next ? 'muted' : 'active');
    if (!next) playCyberSound('confirm');
  };

  // Telemetry Aggregates
  const stats = useMemo(() => {
    const totalMaterials = materials.length;
    const paidMaterials = materials.filter(m => m.isPaid).length;
    const freeMaterials = totalMaterials - paidMaterials;
    const tutorLockedMaterials = materials.filter(m => m.requiresSubjectTutorUnlock).length;
    const totalPurchasesCount = purchases.length;
    const totalRevenueGMV = purchases.reduce((acc, p) => acc + (p.finalAmountPaid || 0), 0);
    const totalDownloadsCount = downloads.length;

    return {
      totalMaterials,
      paidMaterials,
      freeMaterials,
      tutorLockedMaterials,
      totalPurchasesCount,
      totalRevenueGMV,
      totalDownloadsCount,
      totalPricingRules: pricingRules.length,
      totalOffers: offers.length
    };
  }, [materials, purchases, downloads, pricingRules, offers]);

  // Filtered Materials Catalog
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      if (filterAccessType === 'PAID' && !m.isPaid) return false;
      if (filterAccessType === 'FREE' && m.isPaid) return false;
      if (filterAccessType === 'TUTOR_LOCKED' && !m.requiresSubjectTutorUnlock) return false;
      if (filterCategory !== 'ALL' && m.category !== filterCategory) return false;
      if (filterClass !== 'ALL' && m.targetClass.toLowerCase() !== filterClass.toLowerCase()) return false;
      if (filterSubject !== 'ALL' && m.subject.toLowerCase() !== filterSubject.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSubject = m.subject.toLowerCase().includes(q);
        const matchesClass = m.targetClass.toLowerCase().includes(q);
        const matchesTags = (m.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubject && !matchesClass && !matchesTags) return false;
      }
      return true;
    });
  }, [materials, filterAccessType, filterCategory, filterClass, filterSubject, searchQuery]);

  // 1-Click Tutor Lock Toggle
  const handleToggleTutorLock = (mat: StudyMaterial) => {
    playCyberSound('toggle');
    const newStatus = !mat.requiresSubjectTutorUnlock;
    studyMaterialService.saveMaterial({
      ...mat,
      requiresSubjectTutorUnlock: newStatus
    });
    loadAllData();
    addToast(
      newStatus
        ? `🔒 Subject Home Tutor Lock ACTIVATED for "${mat.title}" (${mat.subject}). Students must have an active tutor.`
        : `🔓 Tutor Lock REMOVED for "${mat.title}". Material is open to enrolled class members.`,
      'success'
    );
  };

  // Launch Holographic PDF Simulator
  const handleLaunchPdfViewer = (mat: StudyMaterial) => {
    playCyberSound('warp');
    setPreviewMaterial(mat);
    setViewerCurrentPage(1);
    setIsWatermarkSimActive(true);
    setIsPdfViewerOpen(true);
  };

  // Open Commercial Override Modal
  const handleOpenPriceOverride = (mat: StudyMaterial) => {
    playCyberSound('click');
    setPriceOverrideMaterial(mat);
    setOverrideIsPaid(mat.isPaid);
    setOverrideBasePrice(mat.basePrice || 99);
    setOverrideOfferPercent(mat.specialOfferPercentage || 0);
    setIsPriceOverrideModalOpen(true);
  };

  // Save Commercial Override
  const handleSavePriceOverride = () => {
    if (!priceOverrideMaterial) return;
    playCyberSound('confirm');
    studyMaterialService.saveMaterial({
      ...priceOverrideMaterial,
      isPaid: overrideIsPaid,
      basePrice: overrideIsPaid ? Number(overrideBasePrice) : 0,
      specialOfferPercentage: Number(overrideOfferPercent)
    });
    loadAllData();
    setIsPriceOverrideModalOpen(false);
    addToast(`Commercial parameters updated for "${priceOverrideMaterial.title}"`, 'success');
  };

  // Open Version Upload Modal
  const handleOpenVersionModal = (mat: StudyMaterial) => {
    playCyberSound('click');
    setVersionModalMaterial(mat);
    const currNum = parseFloat((mat.currentVersion || 'v1.0').replace('v', '')) || 1.0;
    setNewVersionNumber(`v${(currNum + 0.1).toFixed(1)}`);
    setNewVersionFileName(`${mat.fileName || 'material'}_${(currNum + 0.1).toFixed(1)}.pdf`);
    setNewVersionChangeLog('Updated solved questions, syllabus alignment, and pedagogical notes.');
    setIsVersionModalOpen(true);
  };

  // Save New Version
  const handleSaveNewVersion = () => {
    if (!versionModalMaterial) return;
    playCyberSound('success');
    studyMaterialService.uploadNewVersion(versionModalMaterial.id, {
      fileUrl: versionModalMaterial.fullPdfUrl || '/documents/updated.pdf',
      fileName: newVersionFileName,
      fileSize: '4.8 MB',
      pageCount: versionModalMaterial.pageCount + 2,
      versionNumber: newVersionNumber,
      changeLog: newVersionChangeLog,
      uploadedBy: user?.name || 'Super Admin'
    });
    loadAllData();
    setIsVersionModalOpen(false);
    addToast(`Version ${newVersionNumber} published for "${versionModalMaterial.title}"!`, 'success');
  };

  // Delete Material
  const handleDeleteMaterial = (mat: StudyMaterial) => {
    if (!window.confirm(`Are you sure you want to decommission "${mat.title}"?`)) return;
    playCyberSound('alert');
    studyMaterialService.deleteMaterial(mat.id);
    loadAllData();
    addToast(`Material "${mat.title}" archived`, 'info');
  };

  // Batch Selection
  const handleSelectAll = () => {
    playCyberSound('click');
    if (selectedMaterialIds.length === filteredMaterials.length) {
      setSelectedMaterialIds([]);
    } else {
      setSelectedMaterialIds(filteredMaterials.map(m => m.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    playCyberSound('click');
    setSelectedMaterialIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Operations
  const handleBulkSetPaid = () => {
    if (selectedMaterialIds.length === 0) return;
    const priceStr = window.prompt('Enter base price in ₹ for selected materials:', '149');
    if (!priceStr) return;
    const priceNum = Number(priceStr);
    if (isNaN(priceNum) || priceNum <= 0) return;

    playCyberSound('confirm');
    studyMaterialService.bulkUpdateMaterials(selectedMaterialIds, {
      isPaid: true,
      basePrice: priceNum
    });
    loadAllData();
    addToast(`Updated ${selectedMaterialIds.length} materials to PAID (₹${priceNum})`, 'success');
    setSelectedMaterialIds([]);
  };

  const handleBulkSetFree = () => {
    if (selectedMaterialIds.length === 0) return;
    playCyberSound('toggle');
    studyMaterialService.bulkUpdateMaterials(selectedMaterialIds, {
      isPaid: false,
      basePrice: 0
    });
    loadAllData();
    addToast(`Converted ${selectedMaterialIds.length} materials to FREE PUBLIC ACCESS`, 'success');
    setSelectedMaterialIds([]);
  };

  const handleBulkToggleTutorLock = (enable: boolean) => {
    if (selectedMaterialIds.length === 0) return;
    playCyberSound('toggle');
    studyMaterialService.bulkUpdateMaterials(selectedMaterialIds, {
      requiresSubjectTutorUnlock: enable
    });
    loadAllData();
    addToast(
      enable
        ? `🔒 Activated Tutor Lock for ${selectedMaterialIds.length} selected modules`
        : `🔓 Removed Tutor Lock from ${selectedMaterialIds.length} selected modules`,
      'success'
    );
    setSelectedMaterialIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedMaterialIds.length === 0) return;
    if (!window.confirm(`Permanently archive ${selectedMaterialIds.length} selected materials?`)) return;
    playCyberSound('alert');
    studyMaterialService.bulkDeleteMaterials(selectedMaterialIds);
    loadAllData();
    addToast(`Archived ${selectedMaterialIds.length} materials`, 'info');
    setSelectedMaterialIds([]);
  };

  // Export CSV / JSON
  const handleExportMaterials = (format: 'json' | 'csv') => {
    playCyberSound('click');
    const matsToExport = selectedMaterialIds.length > 0
      ? materials.filter(m => selectedMaterialIds.includes(m.id))
      : filteredMaterials;

    const data = studyMaterialService.exportMaterials(format, matsToExport);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint_study_material_vault_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Exported ${matsToExport.length} materials as ${format.toUpperCase()}`, 'success');
  };

  // Open 10-Step Wizard for new material
  const handleOpenNewWizard = () => {
    playCyberSound('warp');
    setEditingMaterialId(null);
    setWizardForm(initialWizardForm);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Open Wizard for editing
  const handleEditMaterial = (mat: StudyMaterial) => {
    playCyberSound('click');
    setEditingMaterialId(mat.id);
    setWizardForm({
      title: mat.title,
      description: mat.description,
      targetClass: mat.targetClass,
      educationStage: mat.educationStage,
      category: mat.category,
      subject: mat.subject,
      stream: mat.stream || 'General',
      academicSession: mat.academicSession,
      language: mat.language,
      difficultyLevel: mat.difficultyLevel,
      tags: (mat.tags || []).join(', '),
      thumbnailUrl: mat.thumbnailUrl || initialWizardForm.thumbnailUrl,
      previewPdfUrl: mat.previewPdfUrl || '/sample-preview.pdf',
      previewPageCount: mat.previewPageCount || 3,
      fullPdfUrl: mat.fullPdfUrl || '/documents/material.pdf',
      fileName: mat.fileName || 'Material.pdf',
      fileSize: mat.fileSize || '3.5 MB',
      pageCount: mat.pageCount || 24,
      currentVersion: mat.currentVersion || 'v1.0',
      versionChangeLog: 'Revision notes updated',
      isPaid: mat.isPaid,
      basePrice: mat.basePrice || 99,
      specialOfferPercentage: mat.specialOfferPercentage || 0,
      specialOfferLabel: mat.specialOfferLabel || '',
      requiresSubjectTutorUnlock: mat.requiresSubjectTutorUnlock || false,
      isFeatured: mat.isFeatured || false,
      isVerified: mat.isVerified !== undefined ? mat.isVerified : true,
      verifiedBy: mat.verifiedBy || 'FocusPoint Central Academic Cell',
      targetExams: mat.targetExams || [],
      targetGovernmentExams: mat.targetGovernmentExams || []
    });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Save Wizard Material
  const handleSaveWizardMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardForm.title.trim() || !wizardForm.subject.trim()) {
      playCyberSound('alert');
      addToast('Please provide a title and subject', 'error');
      return;
    }

    playCyberSound('success');
    const parsedTags = wizardForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const saved = studyMaterialService.saveMaterial({
      id: editingMaterialId || undefined,
      title: wizardForm.title.trim(),
      description: wizardForm.description.trim(),
      targetClass: wizardForm.targetClass,
      educationStage: wizardForm.educationStage,
      category: wizardForm.category,
      subject: wizardForm.subject,
      stream: wizardForm.stream,
      academicSession: wizardForm.academicSession,
      language: wizardForm.language,
      difficultyLevel: wizardForm.difficultyLevel,
      tags: parsedTags,
      thumbnailUrl: wizardForm.thumbnailUrl,
      previewPdfUrl: wizardForm.previewPdfUrl,
      previewPageCount: Number(wizardForm.previewPageCount),
      fullPdfUrl: wizardForm.fullPdfUrl,
      fileName: wizardForm.fileName,
      fileSize: wizardForm.fileSize,
      pageCount: Number(wizardForm.pageCount),
      currentVersion: wizardForm.currentVersion,
      isPaid: wizardForm.isPaid,
      basePrice: wizardForm.isPaid ? Number(wizardForm.basePrice) : 0,
      specialOfferPercentage: Number(wizardForm.specialOfferPercentage),
      specialOfferLabel: wizardForm.specialOfferLabel,
      requiresSubjectTutorUnlock: wizardForm.requiresSubjectTutorUnlock,
      isFeatured: wizardForm.isFeatured,
      isVerified: wizardForm.isVerified,
      verifiedBy: wizardForm.verifiedBy,
      targetExams: wizardForm.targetExams,
      targetGovernmentExams: wizardForm.targetGovernmentExams,
      status: 'PUBLISHED'
    });

    loadAllData();
    setIsWizardOpen(false);
    addToast(`Successfully published "${saved.title}" to Vault!`, 'success');
  };

  // Save Promo Coupon
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    playCyberSound('success');
    studyMaterialService.saveOffer({
      title: couponTitle.trim(),
      code: couponCode.trim().toUpperCase(),
      discountType: couponDiscountType,
      discountValue: Number(couponDiscountValue),
      minOrderValue: Number(couponMinOrder),
      isActive: true,
      stackable: false,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString()
    });
    loadAllData();
    setIsCouponModalOpen(false);
    addToast(`Coupon code "${couponCode.toUpperCase()}" generated!`, 'success');
  };

  // Save Pricing Rule
  const handleSavePricingRule = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberSound('success');
    studyMaterialService.savePricingRule({
      level: pricingRuleLevel,
      targetEntityId: pricingRuleEntityName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      targetEntityName: pricingRuleEntityName,
      price: Number(pricingRulePrice),
      currency: 'INR',
      notes: `${pricingRuleEntityName} Subsidized Pass`,
      isActive: true
    });
    loadAllData();
    setIsPricingRuleModalOpen(false);
    addToast(`Custom pricing tier created for ${pricingRuleEntityName}`, 'success');
  };

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-100">
      {/* =========================================================================
          TOP COMMAND HUD: Telemetry Ribbon & Header Controls
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-brand-500/30 p-6 shadow-2xl backdrop-blur-xl">
        {/* Futuristic Ambient Glow Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-brand-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/40 text-brand-300 text-xs font-mono font-bold tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              FOCUSPOINT CENTRAL STUDY MATERIAL & PAID VAULT DRM
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-brand-400" />
              Study Material & Paid Vault
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized Curated Material Inventory, Anti-Piracy Watermark Shield, Multi-Tier Pricing Hierarchy, and DRM Concessions.
            </p>
          </div>

          {/* Quick HUD Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                isAudioMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  : 'bg-brand-950/70 border-brand-500/50 text-brand-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
              }`}
              title={isAudioMuted ? 'Unmute cyber acoustic feedback' : 'Mute cyber acoustic feedback'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioMuted ? 'MUTED' : 'HUD AUDIO'}</span>
            </button>

            <button
              onClick={() => setIsPricingRuleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/60 text-slate-200 rounded-xl text-xs font-bold font-mono tracking-wider transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              PRICING TIER
            </button>

            <button
              onClick={handleOpenNewWizard}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-black font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Plus className="w-4 h-4" />
              INGEST VAULT ASSET
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Counters Ribbon */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-brand-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>VAULT ASSETS</span>
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalMaterials}
            </div>
            <div className="text-[11px] text-brand-400 font-mono mt-0.5">
              {stats.paidMaterials} Paid • {stats.freeMaterials} Free
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>VAULT GMV</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              ₹{stats.totalRevenueGMV.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              {stats.totalPurchasesCount} Paid Sales Logged
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>DOWNLOADS</span>
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              {stats.totalDownloadsCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
              Metered Quotas
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>TUTOR LOCK</span>
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300 mt-1">
              {stats.tutorLockedMaterials}
            </div>
            <div className="text-[11px] text-purple-400 font-mono mt-0.5">
              Gated to Active Tutors
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>PROMO CODES</span>
              <Tag className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {stats.totalOffers}
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
              Active Campaigns
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>DRM INTEGRITY</span>
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300 mt-1">
              100%
            </div>
            <div className="text-[11px] text-rose-400 font-mono mt-0.5">
              Identity Stamped
            </div>
          </div>
        </div>

        {/* HUD Navigation Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-800">
          {[
            { id: 'vault-catalog', label: 'PAID VAULT & STUDY INVENTORY', icon: BookOpen, count: filteredMaterials.length },
            { id: 'drm-vault', label: 'ANTI-PIRACY DRM & SECURITY', icon: ShieldCheck, count: undefined },
            { id: 'pricing-matrix', label: 'COMMERCIAL PRICING MATRIX', icon: DollarSign, count: pricingRules.length },
            { id: 'promo-vault', label: 'PROMO COUPONS & CONCESSIONS', icon: Tag, count: offers.length },
            { id: 'audit-telemetry', label: 'TRANSACTION & DOWNLOAD AUDIT', icon: FileText, count: purchases.length + downloads.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playCyberSound('click');
                  setActiveTab(tab.id as ActiveVaultTab);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-brand-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PAID VAULT & STUDY INVENTORY
          ========================================================================= */}
      {activeTab === 'vault-catalog' && (
        <div className="space-y-6">
          {/* Multi-facet Filters & Search */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">ACCESS:</span>
                {(['ALL', 'PAID', 'FREE', 'TUTOR_LOCKED'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      playCyberSound('click');
                      setFilterAccessType(type);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      filterAccessType === type
                        ? 'bg-brand-500/20 border border-brand-500 text-brand-300 shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type === 'TUTOR_LOCKED' ? '🔒 TUTOR LOCKED' : type}
                  </button>
                ))}

                <select
                  value={filterCategory}
                  onChange={e => {
                    playCyberSound('click');
                    setFilterCategory(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {STUDY_MATERIAL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>

                <select
                  value={filterClass}
                  onChange={e => {
                    playCyberSound('click');
                    setFilterClass(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Classes</option>
                  {STUDY_MATERIAL_CLASSES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, subject, tags..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  onClick={() => handleExportMaterials('csv')}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-1.5"
                  title="Export Materials CSV"
                >
                  <Download className="w-3.5 h-3.5 text-brand-400" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Batch Controls Floating Ribbon */}
            {selectedMaterialIds.length > 0 && (
              <div className="p-3 rounded-xl bg-brand-950/80 border border-brand-500/50 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-mono text-brand-300 font-bold">
                  <CheckSquare className="w-4 h-4 text-brand-400" />
                  <span>{selectedMaterialIds.length} VAULT MATERIALS SELECTED FOR BATCH OPERATIONS</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkSetPaid}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>SET PAID</span>
                  </button>

                  <button
                    onClick={handleBulkSetFree}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <span>SET FREE</span>
                  </button>

                  <button
                    onClick={() => handleBulkToggleTutorLock(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>TUTOR LOCK</span>
                  </button>

                  <button
                    onClick={() => handleBulkToggleTutorLock(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>UNLOCK</span>
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ARCHIVE</span>
                  </button>

                  <button
                    onClick={() => setSelectedMaterialIds([])}
                    className="p-1.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Materials Cards List */}
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-200">No vault materials match this criteria</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try adjusting your search terms or use the 10-Step Ingestion Wizard to upload a new asset.
              </p>
              <button
                onClick={handleOpenNewWizard}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                Ingest Vault Asset
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 hover:text-brand-300"
                >
                  {selectedMaterialIds.length === filteredMaterials.length ? (
                    <CheckSquare className="w-4 h-4 text-brand-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Select All ({filteredMaterials.length})</span>
                </button>
                <span>Showing {filteredMaterials.length} of {materials.length} vault assets</span>
              </div>

              {filteredMaterials.map(mat => {
                const isSelected = selectedMaterialIds.includes(mat.id);

                return (
                  <div
                    key={mat.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-brand-500/80 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Thumbnail/Checkbox + Title + Badges */}
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleSelect(mat.id)}
                          className="mt-1 text-slate-400 hover:text-brand-400"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>

                        <div className="w-14 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {mat.thumbnailUrl ? (
                            <img src={mat.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-6 h-6 text-brand-400" />
                          )}
                          <span className="absolute bottom-0 right-0 bg-slate-950/90 text-[9px] font-mono text-slate-300 px-1 rounded-tl">
                            {mat.pageCount}p
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300 text-[10px] font-mono font-bold">
                              {mat.targetClass}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono">
                              {mat.subject}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono">
                              {mat.category}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono">
                              {mat.currentVersion || 'v1.0'}
                            </span>

                            {/* Commercial Badge */}
                            {mat.isPaid ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>₹{mat.basePrice}</span>
                                {mat.specialOfferPercentage ? (
                                  <span className="text-amber-400">({mat.specialOfferPercentage}% OFF)</span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                                FREE ASSET
                              </span>
                            )}

                            {/* Tutor Lock Badge */}
                            {mat.requiresSubjectTutorUnlock && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>TUTOR LOCKED</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-white mt-1.5 hover:text-brand-300 transition-colors">
                            {mat.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                            <span>📄 {mat.fileName || 'document.pdf'}</span>
                            <span>•</span>
                            <span>💾 {mat.fileSize || '3.5 MB'}</span>
                            <span>•</span>
                            <span className="text-cyan-400">📥 {mat.totalDownloads || 0} Downloads</span>
                            <span>•</span>
                            <span className="text-emerald-400">💰 {mat.totalPurchases || 0} Paid Sales</span>
                            <span>•</span>
                            <span className="text-slate-500">🛡️ {mat.verifiedBy}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions Suite */}
                      <div className="flex items-center gap-2 self-end lg:self-center">
                        <button
                          onClick={() => handleLaunchPdfViewer(mat)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-mono font-black tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                          title="Open Holographic PDF Reader Sandbox"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>PDF PREVIEW</span>
                        </button>

                        <button
                          onClick={() => handleOpenPriceOverride(mat)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300"
                          title="Quick Commercial Pricing Override"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleTutorLock(mat)}
                          className={`p-2 rounded-xl border text-xs font-mono transition-all ${
                            mat.requiresSubjectTutorUnlock
                              ? 'bg-purple-950 border-purple-500/50 text-purple-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title={mat.requiresSubjectTutorUnlock ? 'Unlock from Tutor Requirement' : 'Lock to Subject Home Tutor'}
                        >
                          {mat.requiresSubjectTutorUnlock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenVersionModal(mat)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-brand-300"
                          title="Upload New Version (v1.1, v2.0)"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleEditMaterial(mat)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-brand-300"
                          title="Edit Ingestion Parameters"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteMaterial(mat)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                          title="Decommission Material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ANTI-PIRACY DRM & SECURITY SHIELD
          ========================================================================= */}
      {activeTab === 'drm-vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: DRM Telemetry & Policy Matrix */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-950 border border-rose-500/30 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  Paid Vault Anti-Piracy DRM & Identity Watermarking
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Protects premium pedagogical assets against unauthorized digital distribution and physical printing leaks.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                ACTIVE DRM PROTOCOL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  DYNAMIC WATERMARK MATRIX
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every page of a downloaded PDF is stamped with the student's unique FocusPoint ID, authorized district code, download timestamp, and IP hash.
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-400">
                  Status: <strong className="text-emerald-400">100% Enforced on All Paid & Free Downloads</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  METERED DOWNLOAD QUOTAS
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monthly quotas govern unpurchased free assets (default 5 downloads/month). Enrolled tuition or library students receive enhanced allowances.
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-400">
                  Paid Purchases: <strong className="text-cyan-400">Unlimited Lifetime Re-downloads</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  HOME TUTOR GATEWAY (TUTOR LOCK)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High-yield modules and board guess papers can be gated so only students with an active assigned subject tutor can unlock them.
                </p>
                <div className="pt-2 text-[11px] font-mono text-purple-400 font-bold">
                  {stats.tutorLockedMaterials} Modules Gated
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <Award className="w-4 h-4" />
                  ANTI-SCREENSHOT PROTECTION
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Web viewer applies high-frequency visual hash layering to thwart optical OCR scanners and automated scraping bots.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-400 font-bold">
                  Canvas DRM Active
                </div>
              </div>
            </div>

            {/* Quota Policies Table */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">MONTHLY DOWNLOAD POLICIES & QUOTAS</h4>
              <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden font-mono text-xs">
                {policies.map(p => (
                  <div key={p.id} className="p-3.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-bold text-white">{p.level} Policy: {p.targetName || 'Default Tier'}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">Scope: {p.targetId || 'Pan-India'} • {p.allowCarryOver ? 'Carry Over Enabled' : 'No Carry Over'}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">{p.monthlyLimit} Downloads / Mo</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.allowBonusDownloadsForPaid ? 'Paid Bonus Allowed' : 'Hard Cap'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: DRM Live Watermark Simulator */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-6">
            <h4 className="text-sm font-black font-mono text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              Live Anti-Piracy Watermark Simulator
            </h4>

            {/* Simulated Watermarked Sheet */}
            <div className="relative rounded-2xl bg-white p-6 shadow-inner text-slate-900 border border-slate-200 min-h-[360px] flex flex-col justify-between overflow-hidden">
              {/* Dynamic Watermark Overlay (Repeated Diagonal Pattern) */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-around opacity-15 rotate-[-25deg] select-none">
                <div className="text-center font-mono font-black text-xs text-rose-800 tracking-widest">
                  FOCUSPOINT DRM • STU-2026-9812 • GHAZIPUR • 103.21.58.4
                </div>
                <div className="text-center font-mono font-black text-xs text-rose-800 tracking-widest">
                  CONFIDENTIAL • AUTHORIZED FOR ROHIT SINGH ONLY • DO NOT DISTRIBUTE
                </div>
                <div className="text-center font-mono font-black text-xs text-rose-800 tracking-widest">
                  FOCUSPOINT DRM • STU-2026-9812 • 2026-10-12 13:45 IST
                </div>
              </div>

              {/* Sample Document Content */}
              <div className="space-y-3 z-10">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-brand-900">CBSE Class 10 Mathematics Blueprint</span>
                  <span className="text-[10px] font-mono text-slate-500">PAGE 01 / 24</span>
                </div>
                <h5 className="font-bold text-sm text-slate-800">Chapter 4: Quadratic Equations & Formula Derivations</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standard form of a quadratic equation: <strong>ax² + bx + c = 0</strong>, where a ≠ 0. The roots of the equation are given by the discriminant method: <em>x = [-b ± √(b² - 4ac)] / 2a</em>.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border">
                  Discriminant D = b² - 4ac<br />
                  Case 1: D &gt; 0 ➔ Two distinct real roots<br />
                  Case 2: D = 0 ➔ Two equal real roots
                </div>
              </div>

              {/* Stamped Document Footer */}
              <div className="pt-3 border-t text-[9px] font-mono text-slate-500 flex justify-between z-10">
                <span>STAMPED TO: Rohit Singh (STU-2026-9812)</span>
                <span>SECURE HASH: 9a7b...4e1c</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-slate-300">
              <span className="font-bold text-rose-300 font-mono block mb-1">PIRACY DETERRENT STANDARD:</span>
              Any illicit distribution or photo leak of watermarked material directly implicates the recipient's student account, triggering automatic suspension and parent notification.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: COMMERCIAL PRICING MATRIX & TIERING
          ========================================================================= */}
      {activeTab === 'pricing-matrix' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Multi-Tier Pricing Hierarchy</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Override pan-India base prices with district-level subsidies or individual student concessions.
              </p>
            </div>

            <button
              onClick={() => {
                playCyberSound('click');
                setIsPricingRuleModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>ADD PRICING OVERRIDE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pricingRules.map(rule => (
              <div
                key={rule.id}
                className="rounded-2xl p-5 bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                      {rule.level} TIER
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                      ₹{rule.price}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {rule.targetEntityName || `${rule.level} Tier Override`}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Target Entity: <strong className="text-cyan-400">{rule.targetEntityName || rule.targetEntityId}</strong>
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold ${rule.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    ● {rule.isActive ? 'ACTIVE RULE' : 'DISABLED'}
                  </span>

                  <button
                    onClick={() => {
                      playCyberSound('alert');
                      studyMaterialService.deletePricingRule(rule.id);
                      loadAllData();
                      addToast(`Removed pricing rule "${rule.targetEntityName || rule.level}"`, 'info');
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                    title="Delete Pricing Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PROMO COUPONS & CONCESSIONS
          ========================================================================= */}
      {activeTab === 'promo-vault' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Promotional Coupons & Concession Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Issue discount codes for exam toppers, district launch festivals, and economic concessions.
              </p>
            </div>

            <button
              onClick={() => {
                playCyberSound('click');
                setIsCouponModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE PROMO COUPON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map(offer => (
              <div
                key={offer.id}
                className="rounded-2xl p-5 bg-slate-950 border border-slate-800 hover:border-amber-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-amber-950 border border-amber-500/50 text-amber-300 text-xs font-mono font-black tracking-wider">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                        playCyberSound('click');
                        addToast(`Copied coupon code ${offer.code}!`, 'success');
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-300 rounded"
                      title="Copy Coupon Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {offer.title}
                  </h4>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Discount Value:</span>
                      <strong className="text-emerald-400">
                        {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Min Order:</span>
                      <span>₹{offer.minOrderValue || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold ${offer.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    ● {offer.isActive ? 'ACTIVE' : 'EXPIRED'}
                  </span>

                  <button
                    onClick={() => {
                      playCyberSound('alert');
                      studyMaterialService.deleteOffer(offer.id);
                      loadAllData();
                      addToast(`Removed coupon code "${offer.code}"`, 'info');
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: TRANSACTION & DOWNLOAD AUDIT
          ========================================================================= */}
      {activeTab === 'audit-telemetry' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Vault Transaction & Download Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of all student purchases, payments, and watermarked downloads.
              </p>
            </div>

            <button
              onClick={() => {
                playCyberSound('click');
                const data = studyMaterialService.exportPurchases('csv', purchases);
                const blob = new Blob([data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `focuspoint_purchases_audit_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                addToast('Exported purchases audit ledger as CSV', 'success');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-mono font-bold shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT PURCHASES CSV</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
            {purchases.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No purchase records recorded yet.</div>
            ) : (
              purchases.map(p => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.studentName}</span>
                      <span className="text-[10px] text-slate-500">({p.districtName || 'Ghazipur'})</span>
                      <span className="px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">
                        PAID ₹{p.finalAmountPaid}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      {p.materialTitle} • {p.targetClass}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    <div>Ref: <strong className="text-cyan-400">{p.transactionReference}</strong></div>
                    <div>{new Date(p.purchaseDate).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: 10-STEP VAULT INGESTION WIZARD
          ========================================================================= */}
      {isWizardOpen && (
        <Modal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          title={editingMaterialId ? `Edit Vault Asset (Step ${wizardStep} of 10)` : `Ingest Study Material to Vault (Step ${wizardStep} of 10)`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Step Progress Ribbon */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full transition-all duration-300"
                style={{ width: `${(wizardStep / 10) * 100}%` }}
              />
            </div>

            <form onSubmit={wizardStep === 10 ? handleSaveWizardMaterial : (e) => { e.preventDefault(); setWizardStep(s => Math.min(10, s + 1)); }}>
              {/* Step 1: Basic Identification */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 1: Document Identity</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Class 10 Mathematics Complete Chapter-wise Solved Blueprint"
                      value={wizardForm.title}
                      onChange={e => setWizardForm({ ...wizardForm, title: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Description</label>
                    <textarea
                      rows={3}
                      placeholder="Comprehensive overview of topics covered, derivations, and solved board questions..."
                      value={wizardForm.description}
                      onChange={e => setWizardForm({ ...wizardForm, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Target Audience & Class */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 2: Class & Subject Mapping</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class *</label>
                      <select
                        value={wizardForm.targetClass}
                        onChange={e => setWizardForm({ ...wizardForm, targetClass: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                      >
                        {STUDY_MATERIAL_CLASSES.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject *</label>
                      <input
                        type="text"
                        placeholder="Mathematics, Physics, Chemistry..."
                        value={wizardForm.subject}
                        onChange={e => setWizardForm({ ...wizardForm, subject: e.target.value })}
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pedagogical Category *</label>
                    <select
                      value={wizardForm.category}
                      onChange={e => setWizardForm({ ...wizardForm, category: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      {STUDY_MATERIAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Exam Target Alignment */}
              {wizardStep === 3 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 3: Exam Alignment (Optional)</h4>
                  <p className="text-xs text-slate-500">Select any national competitive or government examinations this material directly supports.</p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl bg-slate-50">
                    {GOVERNMENT_EXAMS.map(ex => (
                      <label key={ex.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={wizardForm.targetGovernmentExams.includes(ex.id)}
                          onChange={() => {
                            setWizardForm({
                              ...wizardForm,
                              targetGovernmentExams: wizardForm.targetGovernmentExams.includes(ex.id)
                                ? wizardForm.targetGovernmentExams.filter(x => x !== ex.id)
                                : [...wizardForm.targetGovernmentExams, ex.id]
                            });
                          }}
                        />
                        <span>{ex.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Academic Session & Language */}
              {wizardStep === 4 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 4: Session & Language</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Session</label>
                      <select
                        value={wizardForm.academicSession}
                        onChange={e => setWizardForm({ ...wizardForm, academicSession: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      >
                        {ACADEMIC_SESSIONS.map((sess, i) => (
                          <option key={i} value={sess}>{sess}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language</label>
                      <select
                        value={wizardForm.language}
                        onChange={e => setWizardForm({ ...wizardForm, language: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      >
                        {CONTENT_LANGUAGES.map((lang, i) => (
                          <option key={i} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Difficulty & Tags */}
              {wizardStep === 5 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 5: Cognitive Difficulty & Tags</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cognitive Difficulty Level</label>
                    <select
                      value={wizardForm.difficultyLevel}
                      onChange={e => setWizardForm({ ...wizardForm, difficultyLevel: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      {DIFFICULTY_LEVELS.map(lvl => (
                        <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="Board Exam, Formula Sheet, Previous Solved..."
                      value={wizardForm.tags}
                      onChange={e => setWizardForm({ ...wizardForm, tags: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Asset Upload & PDF Links */}
              {wizardStep === 6 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 6: PDF Asset Specifications</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">File Name</label>
                      <input
                        type="text"
                        value={wizardForm.fileName}
                        onChange={e => setWizardForm({ ...wizardForm, fileName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">File Size</label>
                      <input
                        type="text"
                        value={wizardForm.fileSize}
                        onChange={e => setWizardForm({ ...wizardForm, fileSize: e.target.value })}
                        className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Page Count</label>
                      <input
                        type="number"
                        value={wizardForm.pageCount}
                        onChange={e => setWizardForm({ ...wizardForm, pageCount: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Versioning & Changelog */}
              {wizardStep === 7 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 7: Versioning</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Version Number</label>
                      <input
                        type="text"
                        value={wizardForm.currentVersion}
                        onChange={e => setWizardForm({ ...wizardForm, currentVersion: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Changelog Notes</label>
                      <input
                        type="text"
                        value={wizardForm.versionChangeLog}
                        onChange={e => setWizardForm({ ...wizardForm, versionChangeLog: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Commercial Valuation & Paid Vault */}
              {wizardStep === 8 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 8: Commercial Pricing Valuation</h4>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                    <input
                      type="checkbox"
                      id="isPaidCheck"
                      checked={wizardForm.isPaid}
                      onChange={e => setWizardForm({ ...wizardForm, isPaid: e.target.checked })}
                      className="w-4 h-4 text-brand-600"
                    />
                    <label htmlFor="isPaidCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Publish as a PAID VAULT ASSET (Requires student purchase / entitlement)
                    </label>
                  </div>

                  {wizardForm.isPaid && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Base Price (₹) *</label>
                        <input
                          type="number"
                          value={wizardForm.basePrice}
                          onChange={e => setWizardForm({ ...wizardForm, basePrice: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Special Discount (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={wizardForm.specialOfferPercentage}
                          onChange={e => setWizardForm({ ...wizardForm, specialOfferPercentage: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-amber-700"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <input
                      type="checkbox"
                      id="tutorLockCheck"
                      checked={wizardForm.requiresSubjectTutorUnlock}
                      onChange={e => setWizardForm({ ...wizardForm, requiresSubjectTutorUnlock: e.target.checked })}
                      className="w-4 h-4 text-purple-600"
                    />
                    <label htmlFor="tutorLockCheck" className="text-xs font-bold text-purple-900 cursor-pointer">
                      🔒 Require Active Subject Home Tutor to unlock this material
                    </label>
                  </div>
                </div>
              )}

              {/* Step 9: DRM & Preview Configuration */}
              {wizardStep === 9 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-600 uppercase">Step 9: DRM Preview Settings</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Free Preview Page Allowance</label>
                    <input
                      type="number"
                      min="1"
                      max={wizardForm.pageCount}
                      value={wizardForm.previewPageCount}
                      onChange={e => setWizardForm({ ...wizardForm, previewPageCount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Students can inspect these pages in high definition prior to purchase.</p>
                  </div>
                </div>
              )}

              {/* Step 10: Final Verification & Publish */}
              {wizardStep === 10 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase">Step 10: Verification & Launch</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Verification Authority</label>
                    <input
                      type="text"
                      value={wizardForm.verifiedBy}
                      onChange={e => setWizardForm({ ...wizardForm, verifiedBy: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold">Ready to Deploy:</div>
                    <div>"{wizardForm.title}" ({wizardForm.targetClass} • {wizardForm.subject})</div>
                    <div>Status: {wizardForm.isPaid ? `Paid Vault (₹${wizardForm.basePrice})` : 'Free Public Asset'}</div>
                  </div>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(s => Math.max(1, s - 1))}
                  disabled={wizardStep === 1}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 disabled:opacity-40"
                >
                  ← Back
                </button>

                {wizardStep < 10 ? (
                  <Button type="submit" variant="primary">
                    Next Step →
                  </Button>
                ) : (
                  <Button type="submit" variant="primary">
                    <Check className="w-4 h-4 mr-1" />
                    Deploy to Vault
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: HOLOGRAPHIC PDF VIEWER & DRM SANDBOX
          ========================================================================= */}
      {isPdfViewerOpen && previewMaterial && (
        <Modal
          isOpen={isPdfViewerOpen}
          onClose={() => setIsPdfViewerOpen(false)}
          title={`Holographic Document Viewer: ${previewMaterial.title}`}
          size="xl"
        >
          <div className="space-y-4">
            {/* Viewer Navigation & Watermark Toggle Header */}
            <div className="p-3 rounded-xl bg-slate-950 border border-brand-500/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{previewMaterial.subject} • PAGE {viewerCurrentPage} OF {previewMaterial.pageCount}</span>
                <span className="text-slate-500">•</span>
                <span className="text-brand-300">{previewMaterial.isPaid ? `₹${previewMaterial.basePrice} PAID ASSET` : 'FREE ASSET'}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    playCyberSound('toggle');
                    setIsWatermarkSimActive(!isWatermarkSimActive);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    isWatermarkSimActive
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isWatermarkSimActive ? 'DRM WATERMARK: ACTIVE' : 'WATERMARK: OFF'}
                </button>
              </div>
            </div>

            {/* Document Page Canvas */}
            <div className="relative rounded-2xl bg-white p-8 shadow-inner border border-slate-200 min-h-[460px] text-slate-900 overflow-hidden flex flex-col justify-between select-none">
              {/* Dynamic Simulated Watermark */}
              {isWatermarkSimActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-around opacity-15 rotate-[-25deg]">
                  <div className="text-center font-mono font-black text-xs text-rose-800 tracking-widest">
                    FOCUSPOINT ANTI-PIRACY DRM • STU-2026-9812 • GHAZIPUR DISTRICT
                  </div>
                  <div className="text-center font-mono font-black text-xs text-rose-800 tracking-widest">
                    LICENSED FOR PERSONAL REVISION ONLY • DO NOT REPRODUCE OR FORWARD
                  </div>
                  <div className="text-center font-mono font-black text-xs text-rose-800 tracking-widest">
                    TIMESTAMP: 2026-10-12 13:50 IST • IP: 103.21.58.4
                  </div>
                </div>
              )}

              {/* Document Text Body */}
              <div className="space-y-4 z-10">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{previewMaterial.title}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{previewMaterial.targetClass} • {previewMaterial.subject} • Version {previewMaterial.currentVersion}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs">
                    PAGE {viewerCurrentPage}
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                  <p>
                    <strong>Section {viewerCurrentPage}.1 — High-Yield Examination Principles:</strong><br />
                    When solving problems related to {previewMaterial.subject}, ensure that all dimensional units and coordinate axes are aligned prior to applying the quadratic and transcendental functions.
                  </p>
                  <div className="p-4 bg-slate-50 rounded-xl border text-slate-800 font-mono text-xs">
                    Key Exam Derivation #{viewerCurrentPage}:<br />
                    ΔE = m · c² · [1 - (v²/c²)]^(-1/2)<br />
                    Standard deviation bounds = μ ± 2.58σ (99% Confidence Interval)
                  </div>
                  <p>
                    <strong>Pedagogical Tips & Common Aspirant Pitfalls:</strong><br />
                    Over 42% of candidates drop marks on sign inversions in Tier-1 examinations. Always recheck parity signs during intermediate cancellation steps.
                  </p>
                </div>
              </div>

              {/* Bottom Document Page Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 z-10">
                <span>Verified by {previewMaterial.verifiedBy}</span>
                <span>Protected by FocusPoint Central DRM</span>
              </div>
            </div>

            {/* Page Flipper Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setViewerCurrentPage(p => Math.max(1, p - 1))}
                disabled={viewerCurrentPage === 1}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 font-mono"
              >
                ← Previous Page
              </button>

              <span className="text-xs font-mono text-slate-500">
                Showing Page {viewerCurrentPage} of {previewMaterial.pageCount}
              </span>

              <button
                onClick={() => setViewerCurrentPage(p => Math.min(previewMaterial.pageCount, p + 1))}
                disabled={viewerCurrentPage === previewMaterial.pageCount}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 font-mono"
              >
                Next Page →
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: QUICK COMMERCIAL PRICING OVERRIDE
          ========================================================================= */}
      {isPriceOverrideModalOpen && priceOverrideMaterial && (
        <Modal
          isOpen={isPriceOverrideModalOpen}
          onClose={() => setIsPriceOverrideModalOpen(false)}
          title={`Commercial Pricing Override: ${priceOverrideMaterial.title}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
              <input
                type="checkbox"
                id="overridePaid"
                checked={overrideIsPaid}
                onChange={e => setOverrideIsPaid(e.target.checked)}
                className="w-4 h-4 text-emerald-600"
              />
              <label htmlFor="overridePaid" className="text-xs font-bold text-slate-800 cursor-pointer">
                Classify as PAID VAULT ASSET
              </label>
            </div>

            {overrideIsPaid && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={overrideBasePrice}
                    onChange={e => setOverrideBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overrideOfferPercent}
                    onChange={e => setOverrideOfferPercent(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-amber-700"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="secondary" onClick={() => setIsPriceOverrideModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSavePriceOverride}>
                Save Pricing
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 4: UPLOAD NEW VERSION MODAL
          ========================================================================= */}
      {isVersionModalOpen && versionModalMaterial && (
        <Modal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          title={`Upload New Version for "${versionModalMaterial.title}"`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Version Number</label>
              <input
                type="text"
                value={newVersionNumber}
                onChange={e => setNewVersionNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Updated File Name</label>
              <input
                type="text"
                value={newVersionFileName}
                onChange={e => setNewVersionFileName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Version Changelog / Notes</label>
              <textarea
                rows={2}
                value={newVersionChangeLog}
                onChange={e => setNewVersionChangeLog(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="secondary" onClick={() => setIsVersionModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveNewVersion}>
                Deploy Version
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 5: CREATE PROMO COUPON
          ========================================================================= */}
      {isCouponModalOpen && (
        <Modal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          title="Create Promotional Coupon Code"
          size="md"
        >
          <form onSubmit={handleSaveCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. TOPPER30"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                required
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campaign Title *</label>
              <input
                type="text"
                placeholder="e.g. Academic Topper Concession"
                value={couponTitle}
                onChange={e => setCouponTitle(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Type</label>
                <select
                  value={couponDiscountType}
                  onChange={e => setCouponDiscountType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 font-semibold"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Value</label>
                <input
                  type="number"
                  min="1"
                  value={couponDiscountValue}
                  onChange={e => setCouponDiscountValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                min="0"
                value={couponMinOrder}
                onChange={e => setCouponMinOrder(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="secondary" onClick={() => setIsCouponModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Issue Coupon
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 6: CREATE PRICING RULE
          ========================================================================= */}
      {isPricingRuleModalOpen && (
        <Modal
          isOpen={isPricingRuleModalOpen}
          onClose={() => setIsPricingRuleModalOpen(false)}
          title="Create Multi-Tier Pricing Rule"
          size="md"
        >
          <form onSubmit={handleSavePricingRule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pricing Hierarchy Level</label>
              <select
                value={pricingRuleLevel}
                onChange={e => setPricingRuleLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 font-semibold"
              >
                <option value="DISTRICT">District-Level Subsidized Rate</option>
                <option value="STUDENT">Individual Student Concession</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {pricingRuleLevel === 'DISTRICT' ? 'District Name *' : 'Student Name / ID *'}
              </label>
              <input
                type="text"
                placeholder={pricingRuleLevel === 'DISTRICT' ? 'e.g. Ghazipur, Varanasi, Lucknow' : 'e.g. STU-2026-9812'}
                value={pricingRuleEntityName}
                onChange={e => setPricingRuleEntityName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subsidized Vault Price (₹) *</label>
              <input
                type="number"
                min="0"
                value={pricingRulePrice}
                onChange={e => setPricingRulePrice(Number(e.target.value))}
                required
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-emerald-700"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="secondary" onClick={() => setIsPricingRuleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Activate Pricing Tier
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
