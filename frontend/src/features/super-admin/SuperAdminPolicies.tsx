import React, { useState, useEffect, useMemo } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { locationService } from '../../services/locationService';
import { auditService } from '../../services/auditService';
import { 
  CustomCommissionOverride, 
  SuperAdminOfferDefinition, 
  CommissionScope, 
  CommissionService,
  SuperAdminAuditEvent
} from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { 
  Percent, 
  Tag, 
  Plus, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Power, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Ticket, 
  Building2, 
  GraduationCap, 
  Eye, 
  X,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Calculator,
  ShieldAlert,
  FileText,
  Clock,
  ArrowUpRight,
  Activity,
  Award,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

import { AdminDemoPricingManager } from '../../components/demo/AdminDemoPricingManager';
import { TeacherRegistrationPricingManager } from '../../components/pricing/TeacherRegistrationPricingManager';
import { LibrarySubscriptionPricingManager } from '../../components/pricing/LibrarySubscriptionPricingManager';

// Web Audio API Synthesizer for Cyber Cognitive Feedback
const playCyberSound = (type: 'hover' | 'click' | 'success' | 'alert') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // AudioContext blocked or not supported
  }
};

export const SuperAdminPolicies: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'COMMISSIONS' | 'OFFERS' | 'SIMULATOR' | 'AUDIT_TELEMETRY' | 'DEMO_PRICING' | 'TEACHER_REGISTRATION_PRICING' | 'LIBRARY_SUBSCRIPTION_PRICING'
  >('COMMISSIONS');
  const [loading, setLoading] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Core Data
  const [overrides, setOverrides] = useState<CustomCommissionOverride[]>([]);
  const [offers, setOffers] = useState<SuperAdminOfferDefinition[]>([]);
  const [auditLogs, setAuditLogs] = useState<SuperAdminAuditEvent[]>([]);

  // Filtering & Search
  const [commSearch, setCommSearch] = useState('');
  const [commServiceFilter, setCommServiceFilter] = useState<'ALL' | CommissionService>('ALL');
  const [commScopeFilter, setCommScopeFilter] = useState<'ALL' | CommissionScope>('ALL');
  const [commStatusFilter, setCommStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');

  const [offerSearch, setOfferSearch] = useState('');
  const [offerServiceFilter, setOfferServiceFilter] = useState<'ALL' | CommissionService>('ALL');
  const [offerScopeFilter, setOfferScopeFilter] = useState<'ALL' | CommissionScope>('ALL');
  const [offerStatusFilter, setOfferStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [auditFilter, setAuditFilter] = useState<'ALL' | 'COMMISSION_ENGINE' | 'OFFER_SYSTEM'>('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // Bulk Selection
  const [selectedOverrideIds, setSelectedOverrideIds] = useState<string[]>([]);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);

  // Interactive Quick Rate Override Modal
  const [isQuickRateModalOpen, setIsQuickRateModalOpen] = useState(false);
  const [quickRateItem, setQuickRateItem] = useState<CustomCommissionOverride | null>(null);
  const [quickNewRate, setQuickNewRate] = useState<number>(10);
  const [quickRateReason, setQuickRateReason] = useState<string>('');

  // Interactive Quick Offer Extend / Edit Modal
  const [isQuickOfferModalOpen, setIsQuickOfferModalOpen] = useState(false);
  const [quickOfferItem, setQuickOfferItem] = useState<SuperAdminOfferDefinition | null>(null);
  const [quickOfferEndDate, setQuickOfferEndDate] = useState<string>('');
  const [quickOfferUsageLimit, setQuickOfferUsageLimit] = useState<number>(500);

  // Copy Clipboard State
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Commission Wizard State
  const [isCommissionWizardOpen, setIsCommissionWizardOpen] = useState(false);
  const [commStep, setCommStep] = useState(1);
  const [commForm, setCommForm] = useState({
    service: 'HOME_TUITION' as CommissionService,
    scope: 'DISTRICT' as CommissionScope,
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: '',
    targetEntityName: '',
    targetEntityId: '',
    defaultCommissionRate: 10,
    customCommissionRate: 8,
    effectiveDate: new Date().toISOString().substring(0, 10),
    expiryDate: '',
    reason: '',
  });

  // Offer Wizard State
  const [isOfferWizardOpen, setIsOfferWizardOpen] = useState(false);
  const [offerStep, setOfferStep] = useState(1);
  const [offerForm, setOfferForm] = useState({
    name: '',
    couponCode: '',
    service: 'HOME_TUITION' as CommissionService,
    scope: 'PAN_INDIA' as CommissionScope,
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: '',
    targetEntityId: '',
    targetEntityName: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 20,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '2026-12-31',
    usageLimit: 500,
    terms: 'Valid on all verified bookings during the promotion period.',
  });

  // Live Commission & Revenue Yield Simulator State
  const [simService, setSimService] = useState<CommissionService>('HOME_TUITION');
  const [simState, setSimState] = useState<string>('Uttar Pradesh');
  const [simDistrict, setSimDistrict] = useState<string>('Ghazipur');
  const [simLocality, setSimLocality] = useState<string>('Saidpur');
  const [simPartnerName, setSimPartnerName] = useState<string>('');
  const [simAmount, setSimAmount] = useState<number>(2500);
  const [simCouponCode, setSimCouponCode] = useState<string>('SAIDPUR30');
  const [simResult, setSimResult] = useState<{
    grossAmount: number;
    discountAmount: number;
    netBaseAmount: number;
    commissionRate: number;
    platformCommissionAmount: number;
    partnerPayoutAmount: number;
    hierarchyLevel: string;
    couponApplied: SuperAdminOfferDefinition | null;
    couponMessage: string;
    breakdownSummary: string;
  } | null>(null);

  // Curated Partner Entities for Targeted Offers & Commission
  const sampleTutors = [
    { id: 'tch-001', name: 'Dr. Ramesh Chandra', subject: 'Advanced Physics (IIT-JEE / NEET)', district: 'Ghazipur' },
    { id: 'tch-002', name: 'Pooja Verma', subject: 'Class 9-10 CBSE Mathematics', district: 'Ghazipur' },
    { id: 'tch-003', name: 'Rahul Kumar', subject: 'Class 10 Science & Math', district: 'Ghazipur' },
    { id: 'tch-004', name: 'Anjali Srivastava', subject: 'Senior English Literature', district: 'Varanasi' },
    { id: 'tch-005', name: 'Devendra Nath Trivedi', subject: 'Senior Chemistry Specialist', district: 'Lucknow' },
  ];

  const sampleLibraries = [
    { id: 'lib-001', name: 'Apex Premier Study Library', location: 'Lanka Gate, Ghazipur (65 Desks)' },
    { id: 'lib-002', name: 'FocusPoint Digital Study Hub', location: 'Saidpur Main Market, Ghazipur (50 Desks)' },
    { id: 'lib-003', name: 'Chanakya Reading Room', location: 'Kankarbagh, Patna (45 Desks)' },
    { id: 'lib-004', name: 'Saraswati Study Point', location: 'Aliganj Sector C, Lucknow (70 Desks)' },
    { id: 'lib-005', name: 'Central Reading Library', location: 'Civil Lines, Varanasi (80 Desks)' },
  ];

  // Load All Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [oList, offList, logs] = await Promise.all([
        superAdminService.getCommissionOverrides(),
        superAdminService.getSuperAdminOffers(),
        auditService.getAuditLogs()
      ]);
      setOverrides(oList);
      setOffers(offList);
      setAuditLogs(logs.filter(l => l.module === 'COMMISSION_ENGINE' || l.module === 'OFFER_SYSTEM' || l.action.includes('COMMISSION') || l.action.includes('OFFER')));
    } catch (err) {
      console.error(err);
      showToast('Failed to load commission & offer policies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-Time Simulator Computation
  useEffect(() => {
    const runSimulation = async () => {
      try {
        const res = await superAdminService.simulateCommissionRevenue({
          service: simService,
          amount: Number(simAmount) || 0,
          stateName: simState,
          districtName: simDistrict,
          localityName: simLocality,
          entityName: simPartnerName,
          couponCode: simCouponCode
        });
        setSimResult(res);
      } catch (err) {
        console.error('Simulation error:', err);
      }
    };
    runSimulation();
  }, [simService, simState, simDistrict, simLocality, simPartnerName, simAmount, simCouponCode, overrides, offers]);

  // Audio helper
  const playSfx = (type: 'hover' | 'click' | 'success' | 'alert') => {
    if (!isAudioMuted) playCyberSound(type);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const activeOverrides = overrides.filter(o => o.status === 'ACTIVE');
    const pausedOverrides = overrides.filter(o => o.status === 'PAUSED');
    const avgTakeRate = overrides.length > 0 
      ? (overrides.reduce((sum, o) => sum + o.customCommissionRate, 0) / overrides.length).toFixed(1)
      : '10.0';

    const activeOffers = offers.filter(o => o.status === 'ACTIVE');
    const totalRedemptions = offers.reduce((sum, o) => sum + (o.timesUsed || 0), 0);
    const estimatedDiscountValue = offers.reduce((sum, o) => {
      const perUse = o.discountType === 'FIXED' ? o.discountValue : 300;
      return sum + (o.timesUsed || 0) * perUse;
    }, 0);

    return {
      activeOverridesCount: activeOverrides.length,
      pausedOverridesCount: pausedOverrides.length,
      avgTakeRate,
      activeOffersCount: activeOffers.length,
      totalRedemptions,
      estimatedDiscountValue
    };
  }, [overrides, offers]);

  // Filtered Overrides
  const filteredOverrides = useMemo(() => {
    return overrides.filter(o => {
      if (commServiceFilter !== 'ALL' && o.service !== commServiceFilter) return false;
      if (commScopeFilter !== 'ALL' && o.scope !== commScopeFilter) return false;
      if (commStatusFilter !== 'ALL' && o.status !== commStatusFilter) return false;
      if (commSearch.trim()) {
        const q = commSearch.toLowerCase();
        const str = `${o.id} ${o.service} ${o.scope} ${o.targetEntityName || ''} ${o.localityName || ''} ${o.districtName || ''} ${o.reason || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [overrides, commSearch, commServiceFilter, commScopeFilter, commStatusFilter]);

  // Filtered Offers
  const filteredOffers = useMemo(() => {
    return offers.filter(off => {
      if (offerServiceFilter !== 'ALL' && off.service !== offerServiceFilter) return false;
      if (offerScopeFilter !== 'ALL' && off.scope !== offerScopeFilter) return false;
      if (offerStatusFilter !== 'ALL' && off.status !== offerStatusFilter) return false;
      if (offerSearch.trim()) {
        const q = offerSearch.toLowerCase();
        const str = `${off.id} ${off.name} ${off.couponCode} ${off.service} ${off.scope} ${off.targetEntityName || ''} ${off.districtName || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [offers, offerSearch, offerServiceFilter, offerScopeFilter, offerStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditFilter !== 'ALL' && log.module !== auditFilter) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const str = `${log.id} ${log.action} ${log.target} ${log.actorName} ${log.district || ''} ${log.newValue || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [auditLogs, auditFilter, auditSearch]);

  // Handlers for Commission Overrides
  const handleToggleOverride = async (id: string) => {
    playSfx('click');
    const updated = await superAdminService.toggleCommissionOverrideStatus(id);
    if (updated) {
      setOverrides(prev => prev.map(o => o.id === id ? updated : o));
      showToast(`Commission override set to ${updated.status}`, 'info');
      loadData();
    }
  };

  const handleDeleteOverride = async (id: string) => {
    playSfx('alert');
    if (!window.confirm('Are you sure you want to remove this commission override? Default platform rates will restore.')) return;
    await superAdminService.deleteCommissionOverride(id);
    setOverrides(prev => prev.filter(o => o.id !== id));
    showToast('Commission override removed', 'success');
    loadData();
  };

  const handleQuickRateSave = async () => {
    if (!quickRateItem) return;
    playSfx('success');
    const diff = Number(quickNewRate) - quickRateItem.defaultCommissionRate;
    await superAdminService.saveCommissionOverride({
      ...quickRateItem,
      customCommissionRate: Number(quickNewRate),
      differenceRate: diff,
      reason: quickRateReason.trim() || `Adjusted rate to ${quickNewRate}% by Super Admin`,
    });
    showToast(`Rate updated to ${quickNewRate}% for ${quickRateItem.targetEntityName || quickRateItem.scope}`, 'success');
    setIsQuickRateModalOpen(false);
    setQuickRateItem(null);
    loadData();
  };

  const handleSaveCommissionWizard = async () => {
    if (!commForm.reason.trim()) {
      playSfx('alert');
      showToast('Audit note/reason is required', 'warning');
      return;
    }
    try {
      playSfx('success');
      const diff = commForm.customCommissionRate - commForm.defaultCommissionRate;
      const created = await superAdminService.saveCommissionOverride({
        service: commForm.service,
        scope: commForm.scope,
        stateName: commForm.stateName,
        districtName: commForm.districtName,
        localityName: commForm.localityName,
        targetEntityId: commForm.targetEntityId,
        targetEntityName: commForm.targetEntityName,
        defaultCommissionRate: Number(commForm.defaultCommissionRate),
        customCommissionRate: Number(commForm.customCommissionRate),
        differenceRate: diff,
        effectiveDate: commForm.effectiveDate,
        expiryDate: commForm.expiryDate || undefined,
        reason: commForm.reason,
        status: 'ACTIVE',
      });
      setOverrides(prev => [created, ...prev]);
      showToast(`Custom commission override active for ${commForm.scope}`, 'success');
      setIsCommissionWizardOpen(false);
      setCommStep(1);
      loadData();
    } catch (err) {
      showToast('Failed to save commission override', 'error');
    }
  };

  // Handlers for Offers
  const handleToggleOffer = async (id: string) => {
    playSfx('click');
    const updated = await superAdminService.toggleOfferStatus(id);
    if (updated) {
      setOffers(prev => prev.map(o => o.id === id ? updated : o));
      showToast(`Offer status set to ${updated.status}`, 'info');
      loadData();
    }
  };

  const handleDeleteOffer = async (id: string) => {
    playSfx('alert');
    if (!window.confirm('Are you sure you want to delete this promotional coupon?')) return;
    await superAdminService.deleteOffer(id);
    setOffers(prev => prev.filter(o => o.id !== id));
    showToast('Offer deleted permanently', 'success');
    loadData();
  };

  const handleDuplicateOffer = (offer: SuperAdminOfferDefinition) => {
    playSfx('click');
    setOfferForm({
      name: `${offer.name} (Copy)`,
      couponCode: `${offer.couponCode}_NEW`,
      service: offer.service,
      scope: offer.scope,
      stateName: offer.stateName || 'Uttar Pradesh',
      districtName: offer.districtName || 'Ghazipur',
      localityName: offer.localityName || '',
      targetEntityId: offer.targetEntityId || '',
      targetEntityName: offer.targetEntityName || '',
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '2026-12-31',
      usageLimit: offer.usageLimit || 500,
      terms: offer.termsAndConditions?.join('; ') || 'Standard promotional terms apply.',
    });
    setOfferStep(1);
    setIsOfferWizardOpen(true);
  };

  const handleSaveOfferWizard = async () => {
    if (!offerForm.name.trim() || !offerForm.couponCode.trim()) {
      playSfx('alert');
      showToast('Offer title and coupon code are required', 'warning');
      return;
    }
    try {
      playSfx('success');
      const created = await superAdminService.createSuperAdminOffer({
        name: offerForm.name,
        couponCode: offerForm.couponCode.toUpperCase().replace(/\s+/g, ''),
        service: offerForm.service,
        scope: offerForm.scope,
        stateName: offerForm.stateName,
        districtName: offerForm.districtName,
        localityName: offerForm.localityName,
        targetEntityId: offerForm.targetEntityId,
        targetEntityName: offerForm.targetEntityName,
        discountType: offerForm.discountType,
        discountValue: Number(offerForm.discountValue),
        startDate: offerForm.startDate,
        endDate: offerForm.endDate,
        usageLimit: Number(offerForm.usageLimit),
        termsAndConditions: [offerForm.terms],
        status: 'ACTIVE',
      });
      setOffers(prev => [created, ...prev]);
      showToast(`Promotional code ${created.couponCode} published successfully!`, 'success');
      setIsOfferWizardOpen(false);
      setOfferStep(1);
      loadData();
    } catch (err) {
      showToast('Failed to create offer', 'error');
    }
  };

  // Copy to clipboard with acoustic feedback
  const handleCopyCoupon = (code: string) => {
    playSfx('click');
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    showToast(`Coupon "${code}" copied to clipboard!`, 'info');
    setTimeout(() => setCopiedCouponCode(null), 2500);
  };

  // Export handlers
  const handleExportCommissions = async (format: 'csv' | 'json') => {
    playSfx('click');
    const content = await superAdminService.exportCommissionOverrides(format, filteredOverrides);
    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FocusPoint_Commission_Overrides_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Commission overrides exported to ${format.toUpperCase()}`, 'success');
  };

  const handleExportOffers = async (format: 'csv' | 'json') => {
    playSfx('click');
    const content = await superAdminService.exportOffers(format, filteredOffers);
    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FocusPoint_Promotional_Offers_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Promotional offers exported to ${format.toUpperCase()}`, 'success');
  };

  // Bulk Operations
  const handleBulkToggleOverrides = async (status: 'ACTIVE' | 'PAUSED') => {
    if (selectedOverrideIds.length === 0) return;
    playSfx('click');
    const count = await superAdminService.bulkUpdateCommissionOverrides(selectedOverrideIds, { status });
    showToast(`${count} commission rules set to ${status}`, 'success');
    setSelectedOverrideIds([]);
    loadData();
  };

  const handleBulkDeleteOverrides = async () => {
    if (selectedOverrideIds.length === 0) return;
    playSfx('alert');
    if (!window.confirm(`Delete ${selectedOverrideIds.length} selected commission overrides permanently?`)) return;
    const count = await superAdminService.bulkDeleteCommissionOverrides(selectedOverrideIds);
    showToast(`${count} commission rules deleted`, 'success');
    setSelectedOverrideIds([]);
    loadData();
  };

  const handleBulkToggleOffers = async (status: 'ACTIVE' | 'INACTIVE') => {
    if (selectedOfferIds.length === 0) return;
    playSfx('click');
    const count = await superAdminService.bulkToggleOffers(selectedOfferIds, status);
    showToast(`${count} campaigns set to ${status}`, 'success');
    setSelectedOfferIds([]);
    loadData();
  };

  const handleBulkDeleteOffers = async () => {
    if (selectedOfferIds.length === 0) return;
    playSfx('alert');
    if (!window.confirm(`Delete ${selectedOfferIds.length} selected campaigns permanently?`)) return;
    const count = await superAdminService.bulkDeleteOffers(selectedOfferIds);
    showToast(`${count} campaigns deleted`, 'success');
    setSelectedOfferIds([]);
    loadData();
  };

  const activeDistricts = locationService.getActiveDistricts();

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-100">
      {/* =========================================================================
          TOP COMMAND HUD: Telemetry Ribbon & Header Controls
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-brand-500/30 p-6 shadow-2xl backdrop-blur-xl">
        {/* Futuristic Ambient Glow Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-brand-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/40 text-brand-300 text-xs font-mono font-bold tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SOVEREIGN REVENUE MATRIX // COMMISSION & OFFERS v4.2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Commission Overrides & Sovereign Offers</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                LIVE ENGINE
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Deterministic 5-tier inheritance fee hierarchy (Pan-India ➔ Individual Educator) and multi-channel promotional coupon disbursement engine with live yield stress-testing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setIsAudioMuted(!isAudioMuted);
                if (isAudioMuted) playCyberSound('success');
              }}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                isAudioMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
              }`}
              title={isAudioMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span className="hidden sm:inline">{isAudioMuted ? 'AUDIO OFF' : 'AUDIO HUD'}</span>
            </button>

            {/* Quick Simulator Jump */}
            <button
              onClick={() => {
                playSfx('click');
                setActiveTab('SIMULATOR');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-300 hover:bg-purple-950/50 hover:border-purple-400 text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4 text-purple-400" />
              <span>YIELD SIMULATOR</span>
            </button>

            {/* Create Override */}
            <button
              onClick={() => {
                playSfx('click');
                setCommStep(1);
                setIsCommissionWizardOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NEW COMMISSION OVERRIDE</span>
            </button>

            {/* Create Offer */}
            <button
              onClick={() => {
                playSfx('click');
                setOfferStep(1);
                setIsOfferWizardOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>LAUNCH PROMO COUPON</span>
            </button>
          </div>
        </div>

        {/* Real-Time KPI Ribbon Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="uppercase">ACTIVE OVERRIDES</span>
              <Percent className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {stats.activeOverridesCount}
              <span className="text-xs font-normal text-slate-400 ml-2">/ {overrides.length} Total</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats.pausedOverridesCount} Paused Rules</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="uppercase">PROMO CAMPAIGNS</span>
              <Ticket className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {stats.activeOffersCount}
              <span className="text-xs font-normal text-slate-400 ml-2">Live</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stats.totalRedemptions} Total Redemptions</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="uppercase">BLENDED TAKE-RATE</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {stats.avgTakeRate}%
              <span className="text-xs font-normal text-slate-400 ml-2">Effective Avg</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-400">
              <span>Standard Base: 10% Tuition / 8% Lib</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="uppercase">SUBSIDY CONCESSION</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              ₹{stats.estimatedDiscountValue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Promotional Platform Burn</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HUD TAB NAVIGATION
          ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar font-mono text-xs">
        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('COMMISSIONS');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'COMMISSIONS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Percent className="w-4 h-4 text-purple-400" />
          <span>COMMISSION OVERRIDES & HIERARCHY</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {overrides.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('OFFERS');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'OFFERS'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tag className="w-4 h-4 text-emerald-400" />
          <span>PROMOTIONAL OFFERS & COUPONS</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {offers.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('SIMULATOR');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'SIMULATOR'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>YIELD & BOOKING SIMULATOR</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            LIVE SANDBOX
          </span>
        </button>

        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('AUDIT_TELEMETRY');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'AUDIT_TELEMETRY'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>POLICY AUDIT TELEMETRY</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('DEMO_PRICING');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'DEMO_PRICING'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>DEMO PRICING HUB</span>
        </button>

        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('TEACHER_REGISTRATION_PRICING');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'TEACHER_REGISTRATION_PRICING'
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-lg shadow-brand-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>TEACHER REG. PRICING</span>
        </button>

        <button
          onClick={() => {
            playSfx('hover');
            setActiveTab('LIBRARY_SUBSCRIPTION_PRICING');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'LIBRARY_SUBSCRIPTION_PRICING'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>LIBRARY SUBSCRIPTIONS</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: COMMISSION OVERRIDES & HIERARCHY
          ========================================================================= */}
      {activeTab === 'COMMISSIONS' && (
        <div className="space-y-6">
          {/* Visual Precedence Tree Alert with Interactive Nodes */}
          <div className="rounded-3xl bg-slate-950 border border-purple-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
                    Pan-India Deterministic Inheritance Hierarchy
                  </h4>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  FocusPoint uses strict hierarchical precedence: at transaction checkout, the most specific rule always takes priority over broader defaults.
                </p>
              </div>

              {/* Resolution Ladder with Step Pills */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full shadow-inner">
                <span className="text-slate-400 px-2 py-0.5 rounded bg-slate-800">1. Pan-India Base (10%/8%)</span>
                <span className="text-purple-400">➔</span>
                <span className="text-blue-400 px-2 py-0.5 rounded bg-blue-950/60">2. State Level</span>
                <span className="text-purple-400">➔</span>
                <span className="text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60">3. District</span>
                <span className="text-purple-400">➔</span>
                <span className="text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60">4. Locality</span>
                <span className="text-purple-400">➔</span>
                <span className="text-amber-300 px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 font-bold">
                  5. Individual Partner (Highest)
                </span>
              </div>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search overrides by partner, district, locality, ID..."
                  value={commSearch}
                  onChange={e => setCommSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <select
                value={commServiceFilter}
                onChange={e => setCommServiceFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              >
                <option value="ALL">All Services</option>
                <option value="HOME_TUITION">Home Tuition</option>
                <option value="SELF_STUDY_LIBRARY">Self-Study Library</option>
              </select>

              <select
                value={commScopeFilter}
                onChange={e => setCommScopeFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              >
                <option value="ALL">All Scopes</option>
                <option value="PAN_INDIA">Pan-India</option>
                <option value="STATE">State</option>
                <option value="DISTRICT">District</option>
                <option value="LOCALITY">Locality</option>
                <option value="INDIVIDUAL">Individual Partner</option>
              </select>

              <select
                value={commStatusFilter}
                onChange={e => setCommStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCommissions('csv')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5"
                title="Export Filtered CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportCommissions('json')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5"
                title="Export Filtered JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Floating Batch Operations Bar */}
          {selectedOverrideIds.length > 0 && (
            <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-2xl flex items-center justify-between text-xs font-mono shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white px-2 py-0.5 rounded bg-purple-500/30">
                  {selectedOverrideIds.length} RULES SELECTED
                </span>
                <span className="text-slate-300 hidden sm:inline">Apply batch action across selected overrides</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkToggleOverrides('ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Bulk Activate
                </button>
                <button
                  onClick={() => handleBulkToggleOverrides('PAUSED')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Bulk Pause
                </button>
                <button
                  onClick={handleBulkDeleteOverrides}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Bulk Delete
                </button>
                <button
                  onClick={() => setSelectedOverrideIds([])}
                  className="p-1.5 text-slate-400 hover:text-white"
                  title="Clear Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Overrides Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOverrideIds.length === filteredOverrides.length && filteredOverrides.length > 0}
                  onChange={e => {
                    if (e.target.checked) setSelectedOverrideIds(filteredOverrides.map(o => o.id));
                    else setSelectedOverrideIds([]);
                  }}
                  className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0 mr-1"
                />
                <Percent className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  ACTIVE COMMISSION OVERRIDE RULES ({filteredOverrides.length})
                </h4>
              </div>
              <p className="text-slate-500 text-xs font-mono">Hierarchy Level Resolution Active</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/70 font-mono">
                  <tr>
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Scope & Geography</th>
                    <th className="py-3 px-4">Default vs Custom Rate</th>
                    <th className="py-3 px-4">Effective Dates</th>
                    <th className="py-3 px-4">Audit Justification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredOverrides.map(ov => {
                    const diff = ov.customCommissionRate - ov.defaultCommissionRate;
                    const isSelected = selectedOverrideIds.includes(ov.id);
                    return (
                      <tr 
                        key={ov.id} 
                        className={`transition-colors ${
                          isSelected ? 'bg-purple-950/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedOverrideIds(prev => 
                                isSelected ? prev.filter(x => x !== ov.id) : [...prev, ov.id]
                              );
                            }}
                            className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                            ov.service === 'HOME_TUITION' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ov.service === 'HOME_TUITION' ? <GraduationCap className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                            {ov.service === 'HOME_TUITION' ? 'Home Tuition' : 'Self-Study Library'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white font-mono">{ov.scope}</p>
                          <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {ov.targetEntityName || ov.localityName || ov.districtName || 'Pan-India'}
                            {ov.stateName && ov.scope !== 'PAN_INDIA' && ` (${ov.stateName})`}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="line-through text-slate-500 font-mono">{ov.defaultCommissionRate}%</span>
                            <span className="font-black text-cyan-400 text-sm font-mono">{ov.customCommissionRate}%</span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              diff < 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {diff > 0 ? `+${diff}% Premium` : `${diff}% Concession`}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          {ov.effectiveDate}
                          {ov.expiryDate ? ` ➔ ${ov.expiryDate}` : ' (Perpetual)'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate text-[11px]" title={ov.reason}>
                          {ov.reason}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            ov.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            ● {ov.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast Edit Rate */}
                            <button
                              onClick={() => {
                                playSfx('click');
                                setQuickRateItem(ov);
                                setQuickNewRate(ov.customCommissionRate);
                                setQuickRateReason(ov.reason || '');
                                setIsQuickRateModalOpen(true);
                              }}
                              className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                              title="Quick Edit Rate"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            {/* Power Toggle */}
                            <button
                              onClick={() => handleToggleOverride(ov.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                ov.status === 'ACTIVE'
                                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                              }`}
                              title={ov.status === 'ACTIVE' ? 'Pause Override' : 'Activate Override'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteOverride(ov.id)}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all"
                              title="Delete Override"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOverrides.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                        No commission override rules matching active filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROMOTIONAL OFFERS & COUPON ENGINE
          ========================================================================= */}
      {activeTab === 'OFFERS' && (
        <div className="space-y-6">
          {/* Filtering & Search Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search offers by coupon code, title, partner, terms..."
                  value={offerSearch}
                  onChange={e => setOfferSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <select
                value={offerServiceFilter}
                onChange={e => setOfferServiceFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              >
                <option value="ALL">All Services</option>
                <option value="HOME_TUITION">Home Tuition</option>
                <option value="SELF_STUDY_LIBRARY">Self-Study Library</option>
              </select>

              <select
                value={offerScopeFilter}
                onChange={e => setOfferScopeFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              >
                <option value="ALL">All Scopes</option>
                <option value="PAN_INDIA">Pan-India</option>
                <option value="DISTRICT">District</option>
                <option value="LOCALITY">Locality</option>
                <option value="INDIVIDUAL">Individual Partner</option>
              </select>

              <select
                value={offerStatusFilter}
                onChange={e => setOfferStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportOffers('csv')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5"
                title="Export Filtered CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportOffers('json')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5"
                title="Export Filtered JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Floating Batch Operations Bar */}
          {selectedOfferIds.length > 0 && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs font-mono shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-500/30">
                  {selectedOfferIds.length} CAMPAIGNS SELECTED
                </span>
                <span className="text-slate-300 hidden sm:inline">Apply batch action across selected campaigns</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkToggleOffers('ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Bulk Activate
                </button>
                <button
                  onClick={() => handleBulkToggleOffers('INACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Bulk Pause
                </button>
                <button
                  onClick={handleBulkDeleteOffers}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Bulk Delete
                </button>
                <button
                  onClick={() => setSelectedOfferIds([])}
                  className="p-1.5 text-slate-400 hover:text-white"
                  title="Clear Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Offers Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOfferIds.length === filteredOffers.length && filteredOffers.length > 0}
                  onChange={e => {
                    if (e.target.checked) setSelectedOfferIds(filteredOffers.map(o => o.id));
                    else setSelectedOfferIds([]);
                  }}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 mr-1"
                />
                <Ticket className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  ACTIVE PROMOTIONAL COUPON CAMPAIGNS ({filteredOffers.length})
                </h4>
              </div>
              <p className="text-slate-500 text-xs font-mono">1-Click Coupon Clipboard Copy Supported</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/70 font-mono">
                  <tr>
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">Coupon Code & Title</th>
                    <th className="py-3 px-4">Service & Scope</th>
                    <th className="py-3 px-4">Discount Value</th>
                    <th className="py-3 px-4">Redemption Meter</th>
                    <th className="py-3 px-4">Valid Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredOffers.map(off => {
                    const isSelected = selectedOfferIds.includes(off.id);
                    const usagePercent = Math.min(100, Math.round(((off.timesUsed || 0) / (off.usageLimit || 1)) * 100));
                    return (
                      <tr 
                        key={off.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-950/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedOfferIds(prev => 
                                isSelected ? prev.filter(x => x !== off.id) : [...prev, off.id]
                              );
                            }}
                            className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
                              {off.couponCode}
                            </span>
                            <button
                              onClick={() => handleCopyCoupon(off.couponCode)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title="Copy Coupon Code"
                            >
                              {copiedCouponCode === off.couponCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="font-bold text-white text-xs mt-1.5">{off.name}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-200 capitalize font-mono">
                            {off.service.replace('_', ' ').toLowerCase()}
                          </p>
                          {off.targetEntityName ? (
                            <span className="text-amber-400 font-bold block text-[11px] mt-0.5">
                              🎯 {off.targetEntityName}
                            </span>
                          ) : (
                            <p className="text-slate-400 text-[11px]">
                              {off.scope}: {off.localityName || off.districtName || 'Pan-India'}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-400 text-sm font-mono">
                            {off.discountType === 'PERCENTAGE' ? `${off.discountValue}% OFF` : `₹${off.discountValue} FLAT OFF`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                            <span>{off.timesUsed || 0} / {off.usageLimit || 0}</span>
                            <span className="text-slate-500">{usagePercent}%</span>
                          </div>
                          <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                usagePercent > 80 ? 'bg-amber-400' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${usagePercent}%` }} 
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          {off.startDate} ➔ {off.endDate}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            off.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            ● {off.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Duplicate Offer */}
                            <button
                              onClick={() => handleDuplicateOffer(off)}
                              className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                              title="Duplicate / Renew Campaign"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Power Toggle */}
                            <button
                              onClick={() => handleToggleOffer(off.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                off.status === 'ACTIVE'
                                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                              }`}
                              title={off.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteOffer(off.id)}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOffers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                        No promotional coupon campaigns matching active filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: INTERACTIVE COMMISSION & YIELD SIMULATOR
          ========================================================================= */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulator Inputs Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-slate-950 border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base font-mono uppercase tracking-wider">
                  Transaction & Yield Simulator
                </h3>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Test how commission hierarchy overrides and promotional coupons interact at booking checkout in real time.
              </p>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Target Service Vertical</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSimService('HOME_TUITION')}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                        simService === 'HOME_TUITION'
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span>Home Tuition</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimService('SELF_STUDY_LIBRARY')}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                        simService === 'SELF_STUDY_LIBRARY'
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Self-Study Library</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1">State</label>
                    <input
                      type="text"
                      value={simState}
                      onChange={e => setSimState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1">District</label>
                    <select
                      value={simDistrict}
                      onChange={e => setSimDistrict(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      {activeDistricts.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1">Locality / Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Saidpur"
                      value={simLocality}
                      onChange={e => setSimLocality(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1">Partner Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ramesh Verma"
                      value={simPartnerName}
                      onChange={e => setSimPartnerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-300 font-bold uppercase">Gross Booking Amount (₹)</label>
                    <span className="text-cyan-400 font-bold">₹{simAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="15000"
                    step="100"
                    value={simAmount}
                    onChange={e => setSimAmount(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>₹300</span>
                    <span>₹7,500</span>
                    <span>₹15,000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Promo Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SAIDPUR30 or FOCUSFEST"
                      value={simCouponCode}
                      onChange={e => setSimCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setSimCouponCode('')}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                      title="Clear Coupon"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulator Visual Output Column */}
          <div className="lg:col-span-7 space-y-6">
            {simResult && (
              <div className="rounded-3xl bg-slate-950 border border-brand-500/30 p-6 shadow-2xl relative overflow-hidden font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
                      SIMULATION AUDIT RESULT
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      Sovereign Payout & Take-Rate Breakdown
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                    Tier: {simResult.hierarchyLevel}
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Gross Amount</span>
                    <span className="text-xl font-bold text-white mt-1 block">
                      ₹{simResult.grossAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 uppercase block">Partner Payout</span>
                    <span className="text-xl font-black text-emerald-300 mt-1 block">
                      ₹{simResult.partnerPayoutAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                    <span className="text-[10px] text-purple-400 uppercase block">Platform Take</span>
                    <span className="text-xl font-black text-purple-300 mt-1 block">
                      ₹{simResult.platformCommissionAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Ledger Breakdown Details */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 text-xs mb-6">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>1. Gross Booking Value:</span>
                    <span className="font-bold text-white">₹{simResult.grossAmount}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/60 pt-2">
                    <span>2. Promo Discount Applied:</span>
                    <span className={`font-bold ${simResult.discountAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {simResult.discountAmount > 0 ? `- ₹${simResult.discountAmount}` : '₹0'}
                    </span>
                  </div>

                  {simResult.couponApplied && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{simResult.couponMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/60 pt-2">
                    <span>3. Net Transaction Base:</span>
                    <span className="font-bold text-cyan-400 text-sm">₹{simResult.netBaseAmount}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/60 pt-2">
                    <span>4. Resolved Commission Rate:</span>
                    <span className="font-bold text-purple-400 text-sm">
                      {simResult.commissionRate}% ({simResult.hierarchyLevel} Override Match)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/60 pt-2 font-bold text-white">
                    <span>5. Net Partner Disbursal:</span>
                    <span className="text-emerald-400 text-sm font-black">₹{simResult.partnerPayoutAmount}</span>
                  </div>
                </div>

                {/* Hierarchy Logic Trace */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px] space-y-1.5">
                  <span className="text-white font-bold block mb-1">Hierarchy Resolution Trace:</span>
                  <p>• Service: <strong className="text-white">{simService}</strong></p>
                  <p>• Territorial Target: <strong className="text-white">{simLocality || simDistrict || 'Pan-India'}</strong></p>
                  <p>• Matched Level: <strong className="text-cyan-400">{simResult.hierarchyLevel}</strong></p>
                  <p className="text-slate-500 text-[10px] mt-2 italic">
                    All partner disbursements are recorded in audit logs with automatic TDS deduction accounting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: POLICY AUDIT TELEMETRY STREAM
          ========================================================================= */}
      {activeTab === 'AUDIT_TELEMETRY' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit trail by actor, action, target..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={auditFilter}
                onChange={e => setAuditFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="ALL">All Modules</option>
                <option value="COMMISSION_ENGINE">Commission Engine</option>
                <option value="OFFER_SYSTEM">Offer System</option>
              </select>
            </div>

            <div className="text-slate-400 text-xs">
              Showing <strong className="text-white">{filteredAuditLogs.length}</strong> immutable policy events
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  CHRONOLOGICAL POLICY AUDIT TRAIL ({filteredAuditLogs.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                🔒 Cryptographically Sealed
              </span>
            </div>

            <div className="divide-y divide-slate-800 text-xs font-mono">
              {filteredAuditLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {log.action}
                      </span>
                      <span className="text-white font-bold">{log.target}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Performed by <strong className="text-slate-300">{log.actorName}</strong> • {log.district || 'Pan-India'} • IP: {log.ipAddress}
                    </p>
                    <div className="text-slate-500 text-[11px] pt-1">
                      <span>Changed: </span>
                      <span className="line-through text-slate-500 mr-2">{log.previousValue}</span>
                      <span className="text-cyan-400 font-bold">{log.newValue}</span>
                    </div>
                  </div>

                  <div className="text-right text-slate-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </div>
                </div>
              ))}
              {filteredAuditLogs.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  No policy audit logs recorded under current search filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: DEMO BOOKING & PRICING MANAGER
          ========================================================================= */}
      {activeTab === 'DEMO_PRICING' && (
        <AdminDemoPricingManager />
      )}

      {/* =========================================================================
          TAB 6: TEACHER REGISTRATION PRICING & HIERARCHY MANAGER
          ========================================================================= */}
      {activeTab === 'TEACHER_REGISTRATION_PRICING' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <TeacherRegistrationPricingManager />
        </div>
      )}

      {/* =========================================================================
          TAB 7: LIBRARY LISTING SUBSCRIPTION & HIERARCHY PRICING
          ========================================================================= */}
      {activeTab === 'LIBRARY_SUBSCRIPTION_PRICING' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <LibrarySubscriptionPricingManager />
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK RATE OVERRIDE MODAL
          ========================================================================= */}
      {isQuickRateModalOpen && quickRateItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Quick Rate Adjustment</h3>
              </div>
              <button
                onClick={() => setIsQuickRateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Target Entity / Scope</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {quickRateItem.targetEntityName || quickRateItem.localityName || quickRateItem.districtName || quickRateItem.scope}
                </p>
                <span className="text-[11px] text-slate-400 block mt-0.5">{quickRateItem.service}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Base Standard Rate</span>
                  <span className="text-base font-bold text-slate-400 mt-1 block">{quickRateItem.defaultCommissionRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase block">New Override Rate</span>
                  <span className="text-base font-black text-cyan-300 mt-1 block">{quickNewRate}%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Override Take-Rate (%):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={quickNewRate}
                  onChange={e => setQuickNewRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Audit Justification Note *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved incentive rate concession for active regional block"
                  value={quickRateReason}
                  onChange={e => setQuickRateReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button
                onClick={() => setIsQuickRateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickRateSave}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: 5-STEP CUSTOM COMMISSION OVERRIDE WIZARD
          ========================================================================= */}
      {isCommissionWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-sm">Custom Commission Override Wizard</h3>
                <p className="text-slate-400 text-xs">Step {commStep} of 5: Override Fee Structure</p>
              </div>
              <button
                onClick={() => setIsCommissionWizardOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center gap-1 px-6 pt-4">
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    commStep >= step ? 'bg-purple-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1: Select Service */}
              {commStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 1: Choose Platform Service</h4>
                  <p className="text-slate-400">Select which revenue vertical this commission override applies to.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setCommForm(prev => ({ ...prev, service: 'HOME_TUITION', defaultCommissionRate: 10 }))}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        commForm.service === 'HOME_TUITION'
                          ? 'bg-blue-500/10 border-blue-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <GraduationCap className="w-6 h-6 text-blue-400 mb-2" />
                      <p className="font-bold text-sm">Home Tuition</p>
                      <p className="text-[11px] text-slate-400 mt-1">Default platform take-rate: 10.0%</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommForm(prev => ({ ...prev, service: 'SELF_STUDY_LIBRARY', defaultCommissionRate: 8 }))}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        commForm.service === 'SELF_STUDY_LIBRARY'
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-amber-400 mb-2" />
                      <p className="font-bold text-sm">Self-Study Library</p>
                      <p className="text-[11px] text-slate-400 mt-1">Default platform take-rate: 8.0%</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Scope */}
              {commStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 2: Choose Resolution Scope</h4>
                  <p className="text-slate-400">Determine how broad or targeted this override is in the hierarchy.</p>

                  <div className="space-y-2">
                    {[
                      { id: 'PAN_INDIA', label: 'Pan-India', desc: 'Applies across all states and districts nationwide' },
                      { id: 'STATE', label: 'State Level', desc: 'Applies across an entire state (e.g. Uttar Pradesh)' },
                      { id: 'DISTRICT', label: 'District Level', desc: 'Targeted to a single operational district (e.g. Ghazipur)' },
                      { id: 'LOCALITY', label: 'Locality / Sub-district Block', desc: 'Targeted to a specific block (e.g. Saidpur)' },
                      { id: 'INDIVIDUAL', label: 'Individual Educator / Partner Facility', desc: 'Highest priority override for a specific partner entity' },
                    ].map(item => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          commForm.scope === item.id
                            ? 'bg-purple-500/10 border-purple-500'
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="scope"
                          value={item.id}
                          checked={commForm.scope === item.id}
                          onChange={(e) => setCommForm(prev => ({ ...prev, scope: e.target.value as any }))}
                          className="mt-1 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className="font-bold text-white">{item.label}</p>
                          <p className="text-slate-400 text-[11px]">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Geographic / Entity Selector */}
              {commStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 3: Select Geographic Target / Entity</h4>
                  
                  {commForm.scope !== 'PAN_INDIA' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                      <select
                        value={commForm.stateName}
                        onChange={(e) => setCommForm(prev => ({ ...prev, stateName: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Delhi">Delhi NCR</option>
                      </select>
                    </div>
                  )}

                  {(commForm.scope === 'DISTRICT' || commForm.scope === 'LOCALITY' || commForm.scope === 'INDIVIDUAL') && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                      <select
                        value={commForm.districtName}
                        onChange={(e) => setCommForm(prev => ({ ...prev, districtName: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        {activeDistricts.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {commForm.scope === 'LOCALITY' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Locality / Block Name *</label>
                      <Input
                        placeholder="e.g. Saidpur"
                        value={commForm.localityName}
                        onChange={(e) => setCommForm(prev => ({ ...prev, localityName: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  )}

                  {commForm.scope === 'INDIVIDUAL' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Partner Entity Name *</label>
                        <Input
                          placeholder="e.g. Dr. Ramesh Verma or Saidpur Digital Library"
                          value={commForm.targetEntityName}
                          onChange={(e) => setCommForm(prev => ({ ...prev, targetEntityName: e.target.value }))}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Partner Entity ID</label>
                        <Input
                          placeholder="e.g. usr-teacher-102"
                          value={commForm.targetEntityId}
                          onChange={(e) => setCommForm(prev => ({ ...prev, targetEntityId: e.target.value }))}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Override Rates */}
              {commStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 4: Configure Commission Rates & Validity</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Default Base Rate</p>
                      <p className="text-xl font-bold text-slate-300 mt-1">{commForm.defaultCommissionRate}%</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                      <p className="text-purple-300 text-[10px] uppercase font-bold">New Custom Override Rate (%) *</p>
                      <Input
                        type="number"
                        step="0.5"
                        value={commForm.customCommissionRate}
                        onChange={(e) => setCommForm(prev => ({ ...prev, customCommissionRate: Number(e.target.value) }))}
                        className="bg-slate-900 border-purple-500/40 text-white text-lg font-bold mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Effective Date</label>
                      <Input
                        type="date"
                        value={commForm.effectiveDate}
                        onChange={(e) => setCommForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date (Optional)</label>
                      <Input
                        type="date"
                        value={commForm.expiryDate}
                        onChange={(e) => setCommForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Audit Reason */}
              {commStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 5: Review & Mandatory Audit Justification</h4>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Service:</span>
                      <span className="font-bold text-white">{commForm.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resolution Scope:</span>
                      <span className="font-bold text-purple-400">{commForm.scope}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Geographic Entity:</span>
                      <span className="font-bold text-white">
                        {commForm.targetEntityName || commForm.localityName || commForm.districtName || 'Pan-India'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Override Commission Rate:</span>
                      <span className="font-bold text-cyan-400 text-sm font-mono">
                        {commForm.customCommissionRate}% (was {commForm.defaultCommissionRate}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-300 mb-1">
                      Mandatory Super Admin Reason Note *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Special promotional launch concession for Saidpur branch verified partner."
                      value={commForm.reason}
                      onChange={(e) => setCommForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full bg-slate-950 border border-purple-500/30 rounded-xl p-2.5 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              {commStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setCommStep(prev => prev - 1)}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {commStep < 5 ? (
                <Button
                  onClick={() => setCommStep(prev => prev + 1)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveCommissionWizard}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Activate Commission Override
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: 6-STEP PROMOTIONAL OFFER CREATION WIZARD
          ========================================================================= */}
      {isOfferWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">Promotional Offer Campaign Wizard</h3>
                <p className="text-slate-400 text-xs">Step {offerStep} of 6: Campaign Configuration</p>
              </div>
              <button
                onClick={() => setIsOfferWizardOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center gap-1 px-6 pt-4">
              {[1, 2, 3, 4, 5, 6].map(step => (
                <div
                  key={step}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    offerStep >= step ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1: Offer Identity */}
              {offerStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 1: Offer Identity & Coupon Code</h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title *</label>
                    <Input
                      placeholder="e.g. Diwali Fest 25% OFF"
                      value={offerForm.name}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">Coupon Code (Uppercase) *</label>
                      <button
                        type="button"
                        onClick={() => {
                          const randomCode = `FP${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
                          setOfferForm(prev => ({ ...prev, couponCode: randomCode }));
                          playSfx('click');
                        }}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        ⚡ Generate Random
                      </button>
                    </div>
                    <Input
                      placeholder="e.g. DIWALI25"
                      value={offerForm.couponCode}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                      className="bg-slate-800 border-slate-700 text-white font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Service Target */}
              {offerStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 2: Service Application</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setOfferForm(prev => ({ ...prev, service: 'HOME_TUITION' }))}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        offerForm.service === 'HOME_TUITION'
                          ? 'bg-blue-500/10 border-blue-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-6 h-6 text-blue-400 mb-2" />
                      <p className="font-bold text-sm">Home Tuition Bookings</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferForm(prev => ({ ...prev, service: 'SELF_STUDY_LIBRARY' }))}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        offerForm.service === 'SELF_STUDY_LIBRARY'
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-amber-400 mb-2" />
                      <p className="font-bold text-sm">Self-Study Library Subscriptions</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Geographic & Particular Partner Scope */}
              {offerStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 3: Geographic & Partner Scope</h4>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Application Scope</label>
                    <select
                      value={offerForm.scope}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, scope: e.target.value as any }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                    >
                      <option value="PAN_INDIA">Pan-India (All Operational Districts)</option>
                      <option value="STATE">Statewide (All Centers in State)</option>
                      <option value="DISTRICT">Specific District</option>
                      <option value="LOCALITY">Specific Locality / Block</option>
                      <option value="INDIVIDUAL">
                        {offerForm.service === 'HOME_TUITION' 
                          ? 'Particular Verified Tutor / Educator' 
                          : 'Particular Partnered Library'}
                      </option>
                    </select>
                  </div>

                  {offerForm.scope === 'DISTRICT' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Target District</label>
                      <select
                        value={offerForm.districtName}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, districtName: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                      >
                        {activeDistricts.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Particular Tutor Selector */}
                  {offerForm.scope === 'INDIVIDUAL' && offerForm.service === 'HOME_TUITION' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-blue-500/30">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                        <GraduationCap className="w-4 h-4" />
                        <span>Target Particular Verified Educator</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Select Verified Tutor *</label>
                        <select
                          value={offerForm.targetEntityId}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const found = sampleTutors.find(t => t.id === selId);
                            setOfferForm(prev => ({
                              ...prev,
                              targetEntityId: selId,
                              targetEntityName: found ? `${found.name} (${found.subject})` : ''
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                        >
                          <option value="">-- Choose Verified Tutor --</option>
                          {sampleTutors.map(t => (
                            <option key={t.id} value={t.id}>{t.name} — {t.subject} ({t.district})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Particular Library Selector */}
                  {offerForm.scope === 'INDIVIDUAL' && offerForm.service === 'SELF_STUDY_LIBRARY' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                        <span>Target Particular Partnered Library Facility</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Select Partner Library *</label>
                        <select
                          value={offerForm.targetEntityId}
                          onChange={(e) => {
                            const selId = e.target.value;
                            const found = sampleLibraries.find(l => l.id === selId);
                            setOfferForm(prev => ({
                              ...prev,
                              targetEntityId: selId,
                              targetEntityName: found ? found.name : ''
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                        >
                          <option value="">-- Choose Partner Library --</option>
                          {sampleLibraries.map(l => (
                            <option key={l.id} value={l.id}>{l.name} — {l.location}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Discount Model */}
              {offerStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 4: Discount Value & Model</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Model</label>
                      <select
                        value={offerForm.discountType}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, discountType: e.target.value as any }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Flat Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Discount Value ({offerForm.discountType === 'PERCENTAGE' ? '%' : '₹'}) *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={offerForm.discountValue}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                        className="bg-slate-800 border-slate-700 text-white font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Validity & Caps */}
              {offerStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 5: Schedule & Usage Quotas</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={offerForm.startDate}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                      <Input
                        type="date"
                        value={offerForm.endDate}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Max Redemptions Cap</label>
                    <Input
                      type="number"
                      value={offerForm.usageLimit}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Review & Publish */}
              {offerStep === 6 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Step 6: Review Campaign Summary</h4>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coupon Code:</span>
                      <span className="font-bold text-purple-400 text-sm font-mono">{offerForm.couponCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Campaign Name:</span>
                      <span className="font-bold text-white">{offerForm.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service:</span>
                      <span className="font-bold text-white">{offerForm.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discount Concession:</span>
                      <span className="font-black text-emerald-400 font-mono">
                        {offerForm.discountType === 'PERCENTAGE' ? `${offerForm.discountValue}% OFF` : `₹${offerForm.discountValue} FLAT OFF`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-mono text-slate-300">{offerForm.startDate} to {offerForm.endDate}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Terms & Conditions</label>
                    <textarea
                      rows={2}
                      value={offerForm.terms}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, terms: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              {offerStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setOfferStep(prev => prev - 1)}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {offerStep < 6 ? (
                <Button
                  onClick={() => setOfferStep(prev => prev + 1)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveOfferWizard}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Launch Offer Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
