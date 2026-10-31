import React, { useState, useEffect, useMemo } from 'react';
import { 
  Percent, Tag, History, BarChart3, Plus, Edit2, Trash2, 
  RotateCcw, CheckCircle2, AlertCircle, Building, GraduationCap, 
  Calendar, ShieldCheck, Search, Sliders, ArrowRight, HelpCircle, 
  Sparkles, DollarSign, Check, X, ShieldAlert, FileText, ChevronRight
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../mock/store';
import { policyService } from '../../services/policyService';
import { 
  CommissionPolicy, 
  Offer, 
  PolicyAuditLog, 
  ServiceType, 
  CommissionType, 
  DiscountType, 
  OfferCategory,
  TransactionBreakdown,
  PolicyAnalyticsSummary
} from '../../types/policy';

interface Props {
  initialDistrict?: string;
  isSuperAdminView?: boolean;
}

export const CommissionOfferPolicyManager: React.FC<Props> = ({
  initialDistrict = 'Ghazipur',
  isSuperAdminView = false,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedDistrict, setSelectedDistrict] = useState(
    isSuperAdminView 
      ? initialDistrict 
      : (user?.districtName || user?.district || initialDistrict)
  );

  const [mainTab, setMainTab] = useState<'COMMISSION' | 'OFFERS' | 'AUDIT' | 'ANALYTICS'>('COMMISSION');
  const [serviceFilter, setServiceFilter] = useState<ServiceType>('LIBRARY');

  // State collections
  const [policies, setPolicies] = useState<CommissionPolicy[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [auditLogs, setAuditLogs] = useState<PolicyAuditLog[]>([]);
  const [analytics, setAnalytics] = useState<PolicyAnalyticsSummary | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<'ALL' | 'COMMISSION' | 'OFFER'>('ALL');

  // Modals
  const [commonModalOpen, setCommonModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CommissionPolicy | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Forms
  const [commonForm, setCommonForm] = useState({
    commissionType: 'PERCENTAGE' as CommissionType,
    commissionValue: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    reason: '',
  });

  const [overrideForm, setOverrideForm] = useState({
    targetId: '',
    targetName: '',
    commissionType: 'PERCENTAGE' as CommissionType,
    commissionValue: 8,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    reason: '',
  });

  const [offerForm, setOfferForm] = useState({
    targetType: 'DISTRICT' as 'DISTRICT' | 'LIBRARY' | 'TUITION',
    targetId: '',
    targetName: '',
    title: '',
    description: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 20,
    maxDiscount: 250,
    minimumAmount: 600,
    offerCategory: 'PROMOTIONAL' as OfferCategory,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    usageLimit: 200,
    perUserLimit: 1,
    allowStacking: false,
    termsConditions: '',
  });

  // Calculation Sandbox State
  const [sandboxAmount, setSandboxAmount] = useState<number>(1000);
  const [sandboxTargetId, setSandboxTargetId] = useState<string>('');
  const [sandboxOfferId, setSandboxOfferId] = useState<string>('');

  const adminName = user?.name || (isSuperAdminView ? 'Super Admin HQ' : 'District Regulatory Admin');

  // Reload data from service
  const reloadData = () => {
    const p = policyService.getPolicies(selectedDistrict, serviceFilter);
    const o = policyService.getOffers(selectedDistrict, serviceFilter);
    const a = policyService.getAuditLogs(selectedDistrict);
    const s = policyService.getAnalyticsSummary(selectedDistrict);

    setPolicies(p);
    setOffers(o);
    setAuditLogs(a);
    setAnalytics(s);

    const common = policyService.getCommonPolicy(selectedDistrict, serviceFilter);
    if (common) {
      setCommonForm({
        commissionType: common.commissionType,
        commissionValue: common.commissionValue,
        startDate: common.startDate,
        endDate: common.endDate || '',
        notes: common.notes || '',
        reason: '',
      });
    } else {
      setCommonForm({
        commissionType: 'PERCENTAGE',
        commissionValue: serviceFilter === 'LIBRARY' ? 10 : 15,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
        reason: '',
      });
    }
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = policyService.subscribe(reloadData);
    return () => unsubscribe();
  }, [selectedDistrict, serviceFilter]);

  // District entity lists from mock store
  const districtLibraries = useMemo(() => {
    return mockStore.getLibraries().filter(l => 
      !l.districtName || l.districtName.toLowerCase() === selectedDistrict.toLowerCase() || l.district === selectedDistrict
    );
  }, [selectedDistrict]);

  const districtTeachers = useMemo(() => {
    return mockStore.getTeachers().filter(t => 
      !t.districtName || t.districtName.toLowerCase() === selectedDistrict.toLowerCase() || t.district === selectedDistrict
    );
  }, [selectedDistrict]);

  // Active common policy
  const currentCommonPolicy = useMemo(() => {
    return policyService.getCommonPolicy(selectedDistrict, serviceFilter);
  }, [policies, selectedDistrict, serviceFilter]);

  // Custom overrides list
  const customOverrides = useMemo(() => {
    return policies.filter(p => p.isCustomOverride && (
      !searchQuery || 
      (p.targetName && p.targetName.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
  }, [policies, searchQuery]);

  // Offers list
  const filteredOffers = useMemo(() => {
    return offers.filter(o => (
      !searchQuery ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.targetName && o.targetName.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
  }, [offers, searchQuery]);

  // Audit logs list
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(l => {
      const matchType = auditTypeFilter === 'ALL' || l.type === auditTypeFilter;
      const matchSearch = !searchQuery || 
        l.affectedEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [auditLogs, auditTypeFilter, searchQuery]);

  // Sandbox calculation breakdown
  const sandboxBreakdown: TransactionBreakdown = useMemo(() => {
    return policyService.calculateBreakdown({
      grossAmount: Number(sandboxAmount) || 0,
      districtName: selectedDistrict,
      serviceType: serviceFilter,
      targetId: sandboxTargetId || undefined,
      selectedOfferId: sandboxOfferId || undefined,
    });
  }, [sandboxAmount, selectedDistrict, serviceFilter, sandboxTargetId, sandboxOfferId, policies, offers]);

  // Sandbox eligible offers
  const sandboxEligibleOffers = useMemo(() => {
    return policyService.getEligibleOffers({
      districtName: selectedDistrict,
      serviceType: serviceFilter,
      targetId: sandboxTargetId || undefined,
      amount: Number(sandboxAmount) || 0,
    });
  }, [selectedDistrict, serviceFilter, sandboxTargetId, sandboxAmount, offers]);

  // Handlers
  const handleSaveCommonPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    policyService.setCommonPolicy({
      districtName: selectedDistrict,
      serviceType: serviceFilter,
      commissionType: commonForm.commissionType,
      commissionValue: Number(commonForm.commissionValue),
      startDate: commonForm.startDate,
      endDate: commonForm.endDate || undefined,
      notes: commonForm.notes,
      adminName,
      reason: commonForm.reason || 'District common commission schedule revision',
    });
    setCommonModalOpen(false);
    addToast(`Common ${serviceFilter.toLowerCase()} commission updated to ${commonForm.commissionValue}${commonForm.commissionType === 'PERCENTAGE' ? '%' : '₹'}`, 'success');
  };

  const handleOpenAddOverride = () => {
    setEditingPolicy(null);
    const firstTarget = serviceFilter === 'LIBRARY' 
      ? districtLibraries[0] 
      : districtTeachers[0];

    setOverrideForm({
      targetId: firstTarget ? firstTarget.id : '',
      targetName: firstTarget ? firstTarget.name : '',
      commissionType: 'PERCENTAGE',
      commissionValue: serviceFilter === 'LIBRARY' ? 8 : 12,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      reason: '',
    });
    setOverrideModalOpen(true);
  };

  const handleOpenEditOverride = (p: CommissionPolicy) => {
    setEditingPolicy(p);
    setOverrideForm({
      targetId: p.targetId || '',
      targetName: p.targetName || '',
      commissionType: p.commissionType,
      commissionValue: p.commissionValue,
      startDate: p.startDate,
      endDate: p.endDate || '',
      notes: p.notes || '',
      reason: '',
    });
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideForm.targetId) {
      addToast(`Please select a ${serviceFilter === 'LIBRARY' ? 'library' : 'teacher'}`, 'warning');
      return;
    }

    policyService.addCustomOverride({
      districtName: selectedDistrict,
      serviceType: serviceFilter,
      targetId: overrideForm.targetId,
      targetName: overrideForm.targetName,
      commissionType: overrideForm.commissionType,
      commissionValue: Number(overrideForm.commissionValue),
      startDate: overrideForm.startDate,
      endDate: overrideForm.endDate || undefined,
      notes: overrideForm.notes,
      adminName,
      reason: overrideForm.reason || (editingPolicy ? 'Updated custom override terms' : 'Granted new custom override rate'),
    });

    setOverrideModalOpen(false);
    addToast(`Custom override saved for ${overrideForm.targetName}: ${overrideForm.commissionValue}${overrideForm.commissionType === 'PERCENTAGE' ? '%' : '₹'}`, 'success');
  };

  const handleRemoveOverride = (p: CommissionPolicy) => {
    if (confirm(`Are you sure you want to remove the custom override for "${p.targetName}"? It will automatically revert to the ${selectedDistrict} common policy.`)) {
      policyService.removeCustomOverride(p.id, adminName, 'Admin manually removed override; reverted to common');
      addToast(`Override removed. "${p.targetName}" restored to common district rate.`, 'info');
    }
  };

  const handleTogglePolicyStatus = (p: CommissionPolicy) => {
    policyService.togglePolicyStatus(p.id, adminName);
    addToast(`Policy status changed to ${p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`, 'info');
  };

  // Offer handlers
  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      targetType: 'DISTRICT',
      targetId: '',
      targetName: '',
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscount: 250,
      minimumAmount: 600,
      offerCategory: 'PROMOTIONAL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      usageLimit: 200,
      perUserLimit: 1,
      allowStacking: false,
      termsConditions: '',
    });
    setOfferModalOpen(true);
  };

  const handleOpenEditOffer = (o: Offer) => {
    setEditingOffer(o);
    setOfferForm({
      targetType: o.targetType as any,
      targetId: o.targetId || '',
      targetName: o.targetName || '',
      title: o.title,
      description: o.description || '',
      discountType: o.discountType,
      discountValue: o.discountValue,
      maxDiscount: o.maxDiscount || 0,
      minimumAmount: o.minimumAmount,
      offerCategory: o.offerCategory,
      startDate: o.startDate,
      endDate: o.endDate || '',
      usageLimit: o.usageLimit,
      perUserLimit: o.perUserLimit,
      allowStacking: o.allowStacking,
      termsConditions: o.termsConditions || '',
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) {
      addToast('Offer title is required', 'warning');
      return;
    }

    if (editingOffer) {
      policyService.updateOffer(editingOffer.id, {
        ...offerForm,
        districtName: selectedDistrict,
        serviceType: serviceFilter,
      }, adminName);
      addToast('Offer updated successfully', 'success');
    } else {
      policyService.addOffer({
        ...offerForm,
        districtName: selectedDistrict,
        serviceType: serviceFilter,
        status: 'ACTIVE',
        createdBy: adminName,
      });
      addToast('New promotional offer published', 'success');
    }
    setOfferModalOpen(false);
  };

  const handleToggleOfferStatus = (o: Offer) => {
    policyService.toggleOfferStatus(o.id, adminName);
    addToast(`Offer status changed to ${o.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`, 'info');
  };

  const handleDeleteOffer = (o: Offer) => {
    if (confirm(`Delete offer "${o.title}"?`)) {
      policyService.deleteOffer(o.id, adminName);
      addToast('Offer removed', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-royal-blue-50 text-royal-blue-600 border border-royal-blue-200">
              <Percent className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Commission & Offer Policy Control Center</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedDistrict} Jurisdiction
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure common district benchmarks, entity-level fee overrides, promotional discounts, and calculation priorities.
              </p>
            </div>
          </div>
        </div>

        {/* Super Admin District Switcher or Reset Defaults */}
        <div className="flex items-center gap-3">
          {isSuperAdminView ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-bold text-slate-600">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
              >
                {['Ghazipur', 'Varanasi', 'Mau', 'Ballia', 'Lucknow', 'Patna', 'Bengaluru Urban'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            icon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            onClick={() => {
              if (confirm('Reset policies to factory defaults for demo?')) {
                policyService.resetToDefaults();
                addToast('Policies restored to system defaults', 'info');
              }
            }}
            className="text-xs"
          >
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'COMMISSION', label: 'Commission Policy', icon: <Percent className="w-4 h-4" /> },
          { id: 'OFFERS', label: 'Offer Management', icon: <Tag className="w-4 h-4" /> },
          { id: 'HISTORY', label: 'History / Audit Trail', icon: <History className="w-4 h-4" /> },
          { id: 'ANALYTICS', label: 'Analytics & Revenue', icon: <BarChart3 className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-4 sm:px-5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              mainTab === tab.id
                ? 'border-royal-blue-600 text-royal-blue-700 bg-royal-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Service Scope Pill Toggle (Libraries vs Tuition Services) */}
      {(mainTab === 'COMMISSION' || mainTab === 'OFFERS') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setServiceFilter('LIBRARY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                serviceFilter === 'LIBRARY'
                  ? 'bg-white text-royal-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4 text-royal-blue-600" />
              <span>Study Libraries ({selectedDistrict})</span>
            </button>
            <button
              onClick={() => setServiceFilter('TUITION')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                serviceFilter === 'TUITION'
                  ? 'bg-white text-royal-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Home Tuition Services ({selectedDistrict})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            Managing <strong className="text-slate-900">{serviceFilter === 'LIBRARY' ? 'Seat Booking & Shift' : 'Tuition & Batch'}</strong> fee parameters
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: COMMISSION POLICY SECTION */}
      {/* ========================================================= */}
      {mainTab === 'COMMISSION' && (
        <div className="space-y-6">
          {/* Section 1: Common District Policy Card */}
          <Card className="p-6 border border-slate-200 bg-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-royal-blue-50 text-royal-blue-700 border border-royal-blue-200 uppercase tracking-wider">
                    Tier 2 · District Common Policy
                  </span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active & Auto-Applied
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Common {serviceFilter === 'LIBRARY' ? 'Library' : 'Tuition'} Commission Rate ({selectedDistrict})
                </h3>
                <p className="text-xs text-slate-500">
                  Automatically governs all transactions across {selectedDistrict} unless a specific entity custom override is configured.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applicable Rate</p>
                  <p className="text-3xl font-black text-royal-blue-600 tracking-tight">
                    {currentCommonPolicy ? currentCommonPolicy.commissionValue : (serviceFilter === 'LIBRARY' ? 10 : 15)}
                    <span className="text-lg font-bold text-slate-700">
                      {currentCommonPolicy?.commissionType === 'FIXED' ? ' ₹' : '%'}
                    </span>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => setCommonModalOpen(true)}
                  className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold text-xs"
                >
                  Configure Rate
                </Button>
              </div>
            </div>

            {/* Sub-info banner */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium">Effective Since</span>
                <p className="font-bold text-slate-900">{currentCommonPolicy?.startDate || '01 Jan 2024'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium">Commission Mode</span>
                <p className="font-bold text-slate-900">
                  {currentCommonPolicy?.commissionType === 'FIXED' ? 'Fixed Fee per Transaction (₹)' : 'Percentage of Gross Volume (%)'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium">Active Overrides</span>
                <p className="font-bold text-royal-blue-700">{customOverrides.length} Specific Entities Overridden</p>
              </div>
            </div>
          </Card>

          {/* Section 2: Custom Overrides Manager */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Custom Commission Overrides</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Tier 1 (Highest Priority)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Override common rates for strategic or accredited {serviceFilter === 'LIBRARY' ? 'libraries' : 'tutors'}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${serviceFilter === 'LIBRARY' ? 'library' : 'teacher'}...`}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-royal-blue-500 w-48 sm:w-64"
                  />
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenAddOverride}
                  className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold text-xs"
                >
                  Add Custom Override
                </Button>
              </div>
            </div>

            {/* Overrides Table */}
            {customOverrides.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Custom Overrides Configured</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All {serviceFilter === 'LIBRARY' ? 'libraries' : 'home tutors'} in {selectedDistrict} currently operate under the common district benchmark of {currentCommonPolicy?.commissionValue || 10}{currentCommonPolicy?.commissionType === 'PERCENTAGE' ? '%' : '₹'}.
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={handleOpenAddOverride}>
                    Create First Override
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                        <th className="p-3.5">Entity Name</th>
                        <th className="p-3.5">Common Rate</th>
                        <th className="p-3.5">Custom Override</th>
                        <th className="p-3.5">Commission Mode</th>
                        <th className="p-3.5">Effective Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {customOverrides.map((ovr) => (
                        <tr key={ovr.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {serviceFilter === 'LIBRARY' ? (
                                <Building className="w-4 h-4 text-royal-blue-600 shrink-0" />
                              ) : (
                                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              <div>
                                <strong className="font-bold text-slate-900 block">{ovr.targetName}</strong>
                                <span className="text-[10px] text-slate-400">ID: {ovr.targetId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-500 line-through">
                            {currentCommonPolicy?.commissionValue || 10}%
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-royal-blue-50 text-royal-blue-700 font-extrabold border border-royal-blue-200">
                              {ovr.commissionValue}{ovr.commissionType === 'PERCENTAGE' ? '%' : ' ₹'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[11px] font-semibold text-slate-600">
                              {ovr.commissionType === 'FIXED' ? 'Fixed Fee' : 'Percentage'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {ovr.startDate}
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleTogglePolicyStatus(ovr)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                                ovr.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {ovr.status}
                            </button>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<Edit2 className="w-3 h-3" />}
                              onClick={() => handleOpenEditOverride(ovr)}
                              className="px-2 py-1 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<RotateCcw className="w-3 h-3 text-amber-600" />}
                              onClick={() => handleRemoveOverride(ovr)}
                              className="px-2 py-1 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                              title="Reset entity to common district rate"
                            >
                              Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Interactive Calculation Sandbox / Simulator */}
          <Card className="p-6 border border-slate-200 bg-linear-to-br from-white to-slate-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Live Calculation Sandbox & Policy Verification Simulator
                  </h4>
                  <p className="text-xs text-slate-500">
                    Test how offer discounts, commission priorities, and net settlements are calculated in real time.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-royal-blue-50 text-royal-blue-700 border border-royal-blue-200">
                Formula Engine v1.0
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Controls */}
              <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">1. Input Parameters</h5>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gross Booking Amount (₹)</label>
                  <Input
                    type="number"
                    min="100"
                    step="50"
                    value={sandboxAmount}
                    onChange={(e) => setSandboxAmount(Number(e.target.value))}
                    className="font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Entity Override</label>
                  <select
                    value={sandboxTargetId}
                    onChange={(e) => setSandboxTargetId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">No Override (Common District Policy)</option>
                    {customOverrides.map(ovr => (
                      <option key={ovr.targetId} value={ovr.targetId}>
                        {ovr.targetName} ({ovr.commissionValue}{ovr.commissionType === 'PERCENTAGE' ? '%' : '₹'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Available Offer Discount</label>
                  <select
                    value={sandboxOfferId}
                    onChange={(e) => setSandboxOfferId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">No Offer Applied</option>
                    {sandboxEligibleOffers.map(off => (
                      <option key={off.id} value={off.id}>
                        {off.title} ({off.discountValue}{off.discountType === 'PERCENTAGE' ? '%' : '₹'} OFF)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step-by-Step Flow */}
              <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">2. Calculation Steps</h5>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Gross Price:</span>
                    <strong className="text-slate-900">₹{sandboxBreakdown.grossAmount}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                    <span>Offer Discount:</span>
                    <strong className="font-bold">-₹{sandboxBreakdown.discountAmount}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 bg-slate-50 px-2 rounded-md font-bold">
                    <span className="text-slate-700">Student Payable:</span>
                    <span className="text-slate-950">₹{sandboxBreakdown.payableAmount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-royal-blue-700">
                    <span>Commission ({sandboxBreakdown.commissionRate}{sandboxBreakdown.commissionType === 'PERCENTAGE' ? '%' : '₹'}):</span>
                    <strong className="font-bold">-₹{sandboxBreakdown.commissionAmount}</strong>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 bg-emerald-50 px-2 rounded-md font-black">
                    <span>Provider Net Settlement:</span>
                    <span>₹{sandboxBreakdown.netSettlementAmount}</span>
                  </div>
                </div>
              </div>

              {/* Policy Source Verification */}
              <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">3. Policy Source Breakdown</h5>
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        sandboxBreakdown.policySource === 'CUSTOM_OVERRIDE' 
                          ? 'bg-amber-500' 
                          : sandboxBreakdown.policySource === 'DISTRICT_COMMON' 
                          ? 'bg-royal-blue-600' 
                          : 'bg-slate-400'
                      }`} />
                      <span className="font-extrabold text-xs text-slate-900">
                        {sandboxBreakdown.policySource === 'CUSTOM_OVERRIDE' 
                          ? 'Entity Custom Override' 
                          : sandboxBreakdown.policySource === 'DISTRICT_COMMON' 
                          ? 'District Common Policy' 
                          : 'System Default Standard'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      {sandboxBreakdown.policyDetails}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  * Note: Immutable snapshot will be stamped onto the final transaction voucher for accounting audit history.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: OFFER MANAGEMENT SECTION */}
      {/* ========================================================= */}
      {mainTab === 'OFFERS' && (
        <div className="space-y-6">
          {/* Top Offer Metrics Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Promotions</span>
              <p className="text-2xl font-black text-slate-900">
                {analytics?.activeOffersCount || offers.filter(o => o.status === 'ACTIVE').length}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Live in {selectedDistrict}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Redemptions</span>
              <p className="text-2xl font-black text-royal-blue-600">
                {analytics?.totalRedemptions || 0}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold">Student vouchers redeemed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Student Savings</span>
              <p className="text-2xl font-black text-emerald-600">
                ₹{analytics?.totalDiscountDisbursed?.toLocaleString('en-IN') || '14,500'}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold">Funded via promo grants</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Promotional Offers & Fee Concession Grants ({serviceFilter === 'LIBRARY' ? 'Libraries' : 'Tuition'})
              </h3>
              <p className="text-xs text-slate-500">
                Configure district-wide discounts or specific facility promotional grants.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search offers by title..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-royal-blue-500 w-48 sm:w-64"
                />
              </div>

              <Button
                size="sm"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAddOffer}
                className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold text-xs"
              >
                Create New Offer
              </Button>
            </div>
          </div>

          {/* Offer Cards Grid */}
          {filteredOffers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <Tag className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Offers Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active promotional grants or discounts have been published for {serviceFilter.toLowerCase()} services in {selectedDistrict}.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="primary" onClick={handleOpenAddOffer}>
                  Publish First Offer
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffers.map((off) => (
                <Card key={off.id} className="p-5 border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-royal-blue-50 text-royal-blue-700 border border-royal-blue-200">
                          {off.offerCategory}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          off.targetType === 'DISTRICT' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {off.targetType === 'DISTRICT' ? 'All District' : off.targetName}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 leading-snug">{off.title}</h4>
                      {off.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{off.description}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-emerald-600 block">
                        {off.discountValue}{off.discountType === 'PERCENTAGE' ? '%' : ' ₹'} OFF
                      </span>
                      {off.maxDiscount ? (
                        <span className="text-[10px] text-slate-400 font-semibold">Capped at ₹{off.maxDiscount}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Min Amount:</span>
                      <strong className="text-slate-900 font-bold">₹{off.minimumAmount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Validity:</span>
                      <strong className="text-slate-900 font-bold">{off.startDate} to {off.endDate || 'Ongoing'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Redemptions:</span>
                      <strong className="text-royal-blue-600 font-bold">
                        {off.usageCount} / {off.usageLimit > 0 ? off.usageLimit : '∞'} used
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Stacking:</span>
                      <strong className="text-slate-900 font-bold">{off.allowStacking ? 'Allowed' : 'Single Only'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleOfferStatus(off)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                        off.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {off.status === 'ACTIVE' ? 'Active & Redeemable' : 'Disabled / Paused'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Edit2 className="w-3 h-3" />}
                        onClick={() => handleOpenEditOffer(off)}
                        className="text-xs px-2.5 py-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Trash2 className="w-3 h-3 text-red-500" />}
                        onClick={() => handleDeleteOffer(off)}
                        className="text-xs px-2.5 py-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HISTORY / AUDIT LOG SECTION */}
      {/* ========================================================= */}
      {mainTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Regulatory Policy Audit Trail ({selectedDistrict})
              </h3>
              <p className="text-xs text-slate-500">
                Immutable, timestamped record of all rate revisions, custom overrides, and promotional modifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                {(['ALL', 'COMMISSION', 'OFFER'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAuditTypeFilter(f)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      auditTypeFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs..."
                  className="pl-8 pr-3 py-1 text-xs rounded-xl border border-slate-200 bg-white focus:outline-royal-blue-500 w-40 sm:w-56"
                />
              </div>
            </div>
          </div>

          {filteredAuditLogs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              No audit logs recorded for the selected filter.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Type & Action</th>
                      <th className="p-3.5">Affected Entity</th>
                      <th className="p-3.5">Value Modification</th>
                      <th className="p-3.5">Admin Author</th>
                      <th className="p-3.5">Regulatory Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold mr-1.5 ${
                            log.type === 'COMMISSION'
                              ? 'bg-royal-blue-50 text-royal-blue-700 border border-royal-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-bold text-slate-900">{log.action}</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {log.affectedEntity}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-slate-400 line-through">{log.previousValue}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <strong className="text-slate-900 font-bold">{log.newValue}</strong>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 whitespace-nowrap font-medium">
                          {log.performedBy}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate" title={log.reason}>
                          {log.reason || 'Routine regulatory adjustment'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ANALYTICS SECTION */}
      {/* ========================================================= */}
      {mainTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Commission Run-Rate</span>
              <p className="text-2xl font-black text-royal-blue-600">
                ₹{analytics?.totalCommissionEstThisMonth.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500">Estimated monthly district collection</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Library vs Tuition Split</span>
              <p className="text-2xl font-black text-slate-900">
                37% / 63%
              </p>
              <p className="text-[11px] text-slate-500">₹14.2k Libraries · ₹24.2k Tuition</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Commission</span>
              <p className="text-2xl font-black text-emerald-600">
                {analytics?.averageCommissionRate}%
              </p>
              <p className="text-[11px] text-slate-500">Weighted average across district</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promo Offer Inflow</span>
              <p className="text-2xl font-black text-amber-600">
                {analytics?.totalRedemptions}
              </p>
              <p className="text-[11px] text-slate-500">Total student redemptions recorded</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border border-slate-200 bg-white space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-royal-blue-600" />
                <span>Library Revenue Share Distribution</span>
              </h4>
              <div className="space-y-3 text-xs">
                {districtLibraries.slice(0, 5).map(lib => {
                  const ovr = policies.find(p => p.isCustomOverride && p.targetId === lib.id);
                  const rate = ovr ? ovr.commissionValue : (currentCommonPolicy?.commissionValue || 10);
                  const isOvr = Boolean(ovr);
                  return (
                    <div key={lib.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <strong className="font-bold text-slate-900 block">{lib.name}</strong>
                        <span className="text-[10px] text-slate-500">{lib.area || 'Central Hub'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900">{rate}%</span>
                        <span className={`block text-[10px] font-bold ${isOvr ? 'text-amber-600' : 'text-slate-400'}`}>
                          {isOvr ? 'Custom Override' : 'District Benchmark'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 border border-slate-200 bg-white space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Top Performing Promotional Offers</span>
              </h4>
              <div className="space-y-3 text-xs">
                {offers.map(off => (
                  <div key={off.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <strong className="font-bold text-slate-900 block">{off.title}</strong>
                      <span className="text-[10px] text-slate-500">Category: {off.offerCategory}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-600">{off.usageCount} used</span>
                      <span className="block text-[10px] text-slate-400">
                        {off.discountValue}{off.discountType === 'PERCENTAGE' ? '%' : ' ₹'} OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONFIGURE COMMON DISTRICT POLICY */}
      {/* ========================================================= */}
      <Modal
        isOpen={commonModalOpen}
        onClose={() => setCommonModalOpen(false)}
        title={`Configure Common District ${serviceFilter} Commission`}
      >
        <form onSubmit={handleSaveCommonPolicy} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-royal-blue-50 border border-royal-blue-200 text-royal-blue-900 text-[11px] leading-relaxed">
            This benchmark commission rate will automatically apply to every {serviceFilter.toLowerCase()} in <strong>{selectedDistrict}</strong> that does not have an explicit custom override.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Commission Type
              </label>
              <select
                value={commonForm.commissionType}
                onChange={(e) => setCommonForm({ ...commonForm, commissionType: e.target.value as CommissionType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Commission Value
              </label>
              <Input
                type="number"
                min="0"
                max={commonForm.commissionType === 'PERCENTAGE' ? 50 : 5000}
                value={commonForm.commissionValue}
                onChange={(e) => setCommonForm({ ...commonForm, commissionValue: Number(e.target.value) })}
                required
                className="font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Effective Start Date
              </label>
              <Input
                type="date"
                value={commonForm.startDate}
                onChange={(e) => setCommonForm({ ...commonForm, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Optional End Date
              </label>
              <Input
                type="date"
                value={commonForm.endDate}
                onChange={(e) => setCommonForm({ ...commonForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
              Regulatory Rationale / Reason (For Audit Log)
            </label>
            <Input
              value={commonForm.reason}
              onChange={(e) => setCommonForm({ ...commonForm, reason: e.target.value })}
              placeholder="e.g. Annual district regulatory benchmark alignment"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setCommonModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold">
              Save Common Policy
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT CUSTOM OVERRIDE */}
      {/* ========================================================= */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title={editingPolicy ? `Edit Custom Override: ${editingPolicy.targetName}` : `Add Custom ${serviceFilter} Override`}
      >
        <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
              Select {serviceFilter === 'LIBRARY' ? 'Study Library' : 'Verified Tutor'}
            </label>
            {editingPolicy ? (
              <Input value={overrideForm.targetName} disabled className="bg-slate-100 font-bold text-slate-700 cursor-not-allowed" />
            ) : (
              <select
                value={overrideForm.targetId}
                onChange={(e) => {
                  const id = e.target.value;
                  const target = serviceFilter === 'LIBRARY'
                    ? districtLibraries.find(l => l.id === id)
                    : districtTeachers.find(t => t.id === id);
                  setOverrideForm({
                    ...overrideForm,
                    targetId: id,
                    targetName: target ? target.name : '',
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none cursor-pointer"
                required
              >
                <option value="">-- Choose {serviceFilter === 'LIBRARY' ? 'Library' : 'Teacher'} --</option>
                {serviceFilter === 'LIBRARY' ? (
                  districtLibraries.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.area || 'Ghazipur'})</option>
                  ))
                ) : (
                  districtTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({(t.subjects || []).join(', ')})</option>
                  ))
                )}
              </select>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Current District Benchmark:</span>
            <strong className="text-slate-900 font-bold">
              {currentCommonPolicy?.commissionValue || 10}{currentCommonPolicy?.commissionType === 'PERCENTAGE' ? '%' : '₹'}
            </strong>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Override Commission Type
              </label>
              <select
                value={overrideForm.commissionType}
                onChange={(e) => setOverrideForm({ ...overrideForm, commissionType: e.target.value as CommissionType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Custom Commission Rate
              </label>
              <Input
                type="number"
                min="0"
                max={overrideForm.commissionType === 'PERCENTAGE' ? 50 : 5000}
                value={overrideForm.commissionValue}
                onChange={(e) => setOverrideForm({ ...overrideForm, commissionValue: Number(e.target.value) })}
                required
                className="font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Effective Start Date
              </label>
              <Input
                type="date"
                value={overrideForm.startDate}
                onChange={(e) => setOverrideForm({ ...overrideForm, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Optional End Date
              </label>
              <Input
                type="date"
                value={overrideForm.endDate}
                onChange={(e) => setOverrideForm({ ...overrideForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
              Regulatory Rationale / Justification (Audit Log)
            </label>
            <Input
              value={overrideForm.reason}
              onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
              placeholder="e.g. Model facility performance discount incentive"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold">
              Save Custom Override
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: CREATE / EDIT PROMOTIONAL OFFER */}
      {/* ========================================================= */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={editingOffer ? `Edit Offer: ${editingOffer.title}` : `Create New ${serviceFilter} Promotional Grant`}
      >
        <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
              Target Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOfferForm({ ...offerForm, targetType: 'DISTRICT', targetId: '', targetName: '' })}
                className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                  offerForm.targetType === 'DISTRICT'
                    ? 'border-royal-blue-600 bg-royal-blue-50 text-royal-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All District {serviceFilter === 'LIBRARY' ? 'Libraries' : 'Tutors'}
              </button>
              <button
                type="button"
                onClick={() => setOfferForm({ ...offerForm, targetType: serviceFilter === 'LIBRARY' ? 'LIBRARY' : 'TUITION' })}
                className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                  offerForm.targetType !== 'DISTRICT'
                    ? 'border-royal-blue-600 bg-royal-blue-50 text-royal-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Specific {serviceFilter === 'LIBRARY' ? 'Library' : 'Tutor'} Only
              </button>
            </div>
          </div>

          {offerForm.targetType !== 'DISTRICT' && (
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Choose Specific {serviceFilter === 'LIBRARY' ? 'Library' : 'Tutor'}
              </label>
              <select
                value={offerForm.targetId}
                onChange={(e) => {
                  const id = e.target.value;
                  const target = serviceFilter === 'LIBRARY'
                    ? districtLibraries.find(l => l.id === id)
                    : districtTeachers.find(t => t.id === id);
                  setOfferForm({
                    ...offerForm,
                    targetId: id,
                    targetName: target ? target.name : '',
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none cursor-pointer"
                required
              >
                <option value="">-- Choose Target --</option>
                {serviceFilter === 'LIBRARY' ? (
                  districtLibraries.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.area || 'Ghazipur'})</option>
                  ))
                ) : (
                  districtTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
              Offer Title
            </label>
            <Input
              value={offerForm.title}
              onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
              placeholder="e.g. October Festive Study Pass (20% OFF)"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
              Short Description & Eligibility
            </label>
            <Input
              value={offerForm.description}
              onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              placeholder="e.g. 20% flat discount on 30-day desk bookings"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Discount Type
              </label>
              <select
                value={offerForm.discountType}
                onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value as DiscountType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Discount Value
              </label>
              <Input
                type="number"
                min="1"
                value={offerForm.discountValue}
                onChange={(e) => setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })}
                required
                className="font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Max Cap (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={offerForm.maxDiscount}
                onChange={(e) => setOfferForm({ ...offerForm, maxDiscount: Number(e.target.value) })}
                placeholder="0 = un-capped"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Min Transaction (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={offerForm.minimumAmount}
                onChange={(e) => setOfferForm({ ...offerForm, minimumAmount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Offer Category Tag
              </label>
              <select
                value={offerForm.offerCategory}
                onChange={(e) => setOfferForm({ ...offerForm, offerCategory: e.target.value as OfferCategory })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none"
              >
                <option value="PROMOTIONAL">Promotional</option>
                <option value="FESTIVAL">Festival</option>
                <option value="FIRST_BOOKING">First Booking</option>
                <option value="NEW_STUDENT">New Student</option>
                <option value="RENEWAL">Renewal</option>
                <option value="LIMITED_TIME">Limited Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={offerForm.startDate}
                onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={offerForm.endDate}
                onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Total Redemptions Limit
              </label>
              <Input
                type="number"
                min="0"
                value={offerForm.usageLimit}
                onChange={(e) => setOfferForm({ ...offerForm, usageLimit: Number(e.target.value) })}
                placeholder="0 = unlimited"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Per-User Redemption Cap
              </label>
              <Input
                type="number"
                min="1"
                value={offerForm.perUserLimit}
                onChange={(e) => setOfferForm({ ...offerForm, perUserLimit: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="stacking"
              checked={offerForm.allowStacking}
              onChange={(e) => setOfferForm({ ...offerForm, allowStacking: e.target.checked })}
              className="w-4 h-4 rounded-sm text-royal-blue-600 focus:ring-royal-blue-500 cursor-pointer"
            />
            <label htmlFor="stacking" className="text-slate-700 font-semibold cursor-pointer">
              Allow offer stacking with other promotions
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setOfferModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-royal-blue-600 hover:bg-royal-blue-700 font-bold">
              {editingOffer ? 'Update Offer' : 'Publish Offer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
