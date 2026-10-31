import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Search, 
  Filter, 
  IndianRupee, 
  Calendar, 
  MapPin, 
  Sparkles,
  GraduationCap,
  Clock,
  History,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  TrendingUp,
  Tag,
  ShieldCheck,
  UserCheck,
  Building2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { locationService } from '../../services/locationService';
import { teacherRegistrationPricingService } from '../../services/teacherRegistrationPricingService';
import { 
  TeacherRegistrationPricingRule, 
  TeacherRegistrationPricingHistory,
  TeacherRegistrationPaymentRecord, 
  TeacherRegistrationPriceCalculation,
  TeacherRegistrationAnalytics,
  TeacherRegistrationScopeType,
  TeacherRegistrationRuleStatus
} from '../../types/teacherRegistrationPricing';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

export interface TeacherRegistrationPricingManagerProps {
  forcedDistrict?: string;
}

export const TeacherRegistrationPricingManager: React.FC<TeacherRegistrationPricingManagerProps> = ({
  forcedDistrict
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isDistrictAdmin = user?.role === 'DISTRICT_ADMIN' || user?.role === 'district_admin' || Boolean(forcedDistrict);
  const userDistrict = forcedDistrict || user?.districtName || user?.district || 'Ghazipur';
  const defaultState = 'Uttar Pradesh';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'RULES' | 'HIERARCHY_TESTER' | 'PAYMENTS_LEDGER' | 'ANALYTICS'>('RULES');

  // Core Data State
  const [rules, setRules] = useState<TeacherRegistrationPricingRule[]>([]);
  const [payments, setPayments] = useState<TeacherRegistrationPaymentRecord[]>([]);
  const [analytics, setAnalytics] = useState<TeacherRegistrationAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hierarchy Tester State
  const [testState, setTestState] = useState<string>(defaultState);
  const [testDistrict, setTestDistrict] = useState<string>(userDistrict);
  const [testTeacherEmail, setTestTeacherEmail] = useState<string>('pratiksha.sonkar@focuspoint.internal');
  const [testCalculation, setTestCalculation] = useState<TeacherRegistrationPriceCalculation | null>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);

  // 8-Step Pricing Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const initialForm = {
    service: 'TEACHER_REGISTRATION' as const,
    scope: (isDistrictAdmin ? 'DISTRICT' : 'PAN_INDIA') as TeacherRegistrationScopeType,
    state: defaultState,
    district: userDistrict,
    teacherName: '',
    teacherEmail: '',
    teacherMobile: '',
    teacherId: '',
    price: 300,
    isFree: false,
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveUntil: '',
    status: 'ACTIVE' as TeacherRegistrationRuleStatus,
    reason: '',
  };
  const [wizardForm, setWizardForm] = useState(initialForm);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedRuleHistory, setSelectedRuleHistory] = useState<TeacherRegistrationPricingHistory[]>([]);
  const [historyTargetTitle, setHistoryTargetTitle] = useState<string>('');

  // Payments Ledger Search & Filters
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Location Master Data
  const allStates = useMemo(() => locationService.getStates(), []);
  const availableDistricts = useMemo(() => {
    const st = allStates.find(s => s.name.toLowerCase() === (wizardForm.state || defaultState).toLowerCase());
    return st ? locationService.getDistricts(st.id) : [];
  }, [wizardForm.state, allStates]);

  const testerDistricts = useMemo(() => {
    const st = allStates.find(s => s.name.toLowerCase() === testState.toLowerCase());
    return st ? locationService.getDistricts(st.id) : [];
  }, [testState, allStates]);

  // Load Main Data
  const loadData = async () => {
    setLoading(true);
    try {
      const districtFilter = isDistrictAdmin ? userDistrict : undefined;
      const [fetchedRules, fetchedPayments, fetchedAnalytics] = await Promise.all([
        teacherRegistrationPricingService.getPricingRules(districtFilter),
        teacherRegistrationPricingService.getRegistrationPayments(districtFilter),
        teacherRegistrationPricingService.getRegistrationAnalytics(districtFilter)
      ]);
      setRules(fetchedRules);
      setPayments(fetchedPayments);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Failed to load teacher registration pricing data', err);
      showToast('Failed to load pricing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [forcedDistrict, userDistrict]);

  // Execute Hierarchy Live Test
  const runHierarchyTest = async () => {
    setTestLoading(true);
    try {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: testState,
        district: testDistrict,
        email: testTeacherEmail.trim() || undefined,
      });
      setTestCalculation(res);
    } catch (err) {
      console.error('Error running test calculation', err);
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    runHierarchyTest();
  }, [testState, testDistrict, testTeacherEmail]);

  // Open Wizard for Create
  const handleOpenNewWizard = () => {
    setEditingRuleId(null);
    setWizardForm({
      ...initialForm,
      scope: isDistrictAdmin ? 'DISTRICT' : 'PAN_INDIA',
      district: userDistrict,
    });
    setWizardStep(1);
    setConflictWarning(null);
    setIsWizardOpen(true);
  };

  // Open Wizard for Edit
  const handleOpenEditWizard = (rule: TeacherRegistrationPricingRule) => {
    if (isDistrictAdmin && rule.scope !== 'DISTRICT' && rule.scope !== 'PARTICULAR') {
      showToast('Access Denied: District Admin cannot edit State or Pan-India rules.', 'error');
      return;
    }
    if (isDistrictAdmin && rule.district && rule.district.toLowerCase() !== userDistrict.toLowerCase()) {
      showToast(`Access Denied: You cannot modify pricing outside ${userDistrict}.`, 'error');
      return;
    }

    setEditingRuleId(rule.id);
    setWizardForm({
      service: 'TEACHER_REGISTRATION',
      scope: rule.scope,
      state: rule.state || defaultState,
      district: rule.district || userDistrict,
      teacherName: rule.teacherName || '',
      teacherEmail: rule.teacherEmail || '',
      teacherMobile: rule.teacherMobile || '',
      teacherId: rule.teacherId || '',
      price: rule.price,
      isFree: rule.isFree,
      effectiveFrom: rule.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveUntil: rule.effectiveUntil || '',
      status: rule.status,
      reason: rule.reason || '',
    });
    setWizardStep(1);
    setConflictWarning(null);
    setIsWizardOpen(true);
  };

  // Check for conflicts on entering step 7
  const checkConflictOnStep7 = () => {
    const existing = rules.find(r => {
      if (editingRuleId && r.id === editingRuleId) return false;
      if (r.status !== 'ACTIVE') return false;
      if (r.scope !== wizardForm.scope) return false;

      if (r.scope === 'PAN_INDIA') return true;
      if (r.scope === 'STATE' && r.state?.toLowerCase() === wizardForm.state?.toLowerCase()) return true;
      if (r.scope === 'DISTRICT' && 
          r.state?.toLowerCase() === wizardForm.state?.toLowerCase() && 
          r.district?.toLowerCase() === wizardForm.district?.toLowerCase()) return true;
      if (r.scope === 'PARTICULAR') {
        if (wizardForm.teacherEmail && r.teacherEmail?.toLowerCase() === wizardForm.teacherEmail.toLowerCase()) return true;
        if (wizardForm.teacherMobile && r.teacherMobile === wizardForm.teacherMobile) return true;
      }
      return false;
    });

    if (existing) {
      setConflictWarning(
        `Notice: An active ${existing.scope} rule (₹${existing.price}, ID: ${existing.id}) currently exists. Saving this rule will supersede the existing rule upon confirmation.`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleNextStep = () => {
    // Validations per step
    if (wizardStep === 2) {
      if (isDistrictAdmin && (wizardForm.scope === 'PAN_INDIA' || wizardForm.scope === 'STATE')) {
        showToast('District Admin is restricted to District or Particular Teacher scope.', 'error');
        return;
      }
    }

    if (wizardStep === 3) {
      if (wizardForm.scope === 'STATE' && !wizardForm.state) {
        showToast('Please select a State.', 'error');
        return;
      }
      if (wizardForm.scope === 'DISTRICT' && (!wizardForm.state || !wizardForm.district)) {
        showToast('Please select both State and District.', 'error');
        return;
      }
      if (wizardForm.scope === 'PARTICULAR' && !wizardForm.teacherName.trim()) {
        showToast('Please enter the Teacher Name.', 'error');
        return;
      }
      if (wizardForm.scope === 'PARTICULAR' && !wizardForm.teacherEmail.trim() && !wizardForm.teacherMobile.trim()) {
        showToast('Please provide at least an Email or Mobile number for individual override.', 'error');
        return;
      }
    }

    if (wizardStep === 4) {
      if (wizardForm.isFree) {
        setWizardForm(prev => ({ ...prev, price: 0 }));
      } else if (isNaN(wizardForm.price) || wizardForm.price < 0) {
        showToast('Registration fee cannot be negative.', 'error');
        return;
      }
    }

    if (wizardStep === 5) {
      if (wizardForm.effectiveUntil && wizardForm.effectiveUntil < wizardForm.effectiveFrom) {
        showToast('Effective Until date cannot be earlier than Effective From date.', 'error');
        return;
      }
    }

    if (wizardStep === 6) {
      checkConflictOnStep7();
    }

    setWizardStep(prev => prev + 1);
  };

  const handleSavePolicy = async () => {
    try {
      const res = await teacherRegistrationPricingService.savePricingRule(
        {
          id: editingRuleId || undefined,
          service: 'TEACHER_REGISTRATION',
          scope: wizardForm.scope,
          state: wizardForm.scope === 'PAN_INDIA' ? undefined : wizardForm.state,
          district: wizardForm.scope === 'PAN_INDIA' || wizardForm.scope === 'STATE' ? undefined : wizardForm.district,
          teacherName: wizardForm.scope === 'PARTICULAR' ? wizardForm.teacherName : undefined,
          teacherEmail: wizardForm.scope === 'PARTICULAR' ? wizardForm.teacherEmail : undefined,
          teacherMobile: wizardForm.scope === 'PARTICULAR' ? wizardForm.teacherMobile : undefined,
          teacherId: wizardForm.scope === 'PARTICULAR' ? wizardForm.teacherId : undefined,
          price: wizardForm.isFree ? 0 : Number(wizardForm.price),
          isFree: wizardForm.isFree || Number(wizardForm.price) === 0,
          effectiveFrom: wizardForm.effectiveFrom,
          effectiveUntil: wizardForm.effectiveUntil || undefined,
          status: wizardForm.status,
          reason: wizardForm.reason || (editingRuleId ? 'Policy updated by admin.' : 'New policy created via wizard.')
        },
        {
          id: user?.id || 'usr-admin',
          name: user?.name || 'Administrator',
          role: user?.role || (isDistrictAdmin ? 'DISTRICT_ADMIN' : 'SUPER_ADMIN'),
          district: userDistrict
        }
      );

      if (!res.success) {
        showToast(res.error || 'Failed to save policy.', 'error');
        return;
      }

      showToast(`Registration pricing policy successfully ${editingRuleId ? 'updated' : 'saved'}!`, 'success');
      setIsWizardOpen(false);
      await loadData();
      await runHierarchyTest();
    } catch (err) {
      console.error('Error saving policy', err);
      showToast('Unexpected error saving policy.', 'error');
    }
  };

  // Toggle Rule Status (Active / Paused / Disabled)
  const handleToggleStatus = async (rule: TeacherRegistrationPricingRule) => {
    if (isDistrictAdmin && (rule.scope === 'PAN_INDIA' || rule.scope === 'STATE')) {
      showToast('Access Denied: District Admin cannot modify higher-level rules.', 'error');
      return;
    }

    const newStatus: TeacherRegistrationRuleStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const ok = await teacherRegistrationPricingService.updateRuleStatus(
        rule.id,
        newStatus,
        {
          id: user?.id || 'usr-admin',
          name: user?.name || 'Administrator',
          role: user?.role || (isDistrictAdmin ? 'DISTRICT_ADMIN' : 'SUPER_ADMIN')
        },
        `Admin toggled status to ${newStatus}`
      );
      if (ok) {
        showToast(`Rule is now ${newStatus}.`, 'success');
        await loadData();
        await runHierarchyTest();
      }
    } catch (err) {
      showToast('Failed to update rule status.', 'error');
    }
  };

  // View Rule History
  const handleOpenHistory = async (rule: TeacherRegistrationPricingRule) => {
    try {
      const hist = await teacherRegistrationPricingService.getPricingHistory(rule.id);
      setSelectedRuleHistory(hist);
      setHistoryTargetTitle(`${rule.scope} — ${rule.teacherName || rule.district || rule.state || 'Pan-India'} (Current: ₹${rule.price})`);
      setIsHistoryOpen(true);
    } catch (err) {
      showToast('Failed to load rule history.', 'error');
    }
  };

  // Delete Rule
  const handleDeleteRule = async (rule: TeacherRegistrationPricingRule) => {
    if (isDistrictAdmin && (rule.scope === 'PAN_INDIA' || rule.scope === 'STATE')) {
      showToast('Access Denied: District Admin cannot delete State or Pan-India rules.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete this ${rule.scope} rule (₹${rule.price})?`)) {
      return;
    }

    try {
      const ok = await teacherRegistrationPricingService.deletePricingRule(
        rule.id,
        {
          id: user?.id || 'usr-admin',
          name: user?.name || 'Administrator',
          role: user?.role || (isDistrictAdmin ? 'DISTRICT_ADMIN' : 'SUPER_ADMIN')
        }
      );
      if (ok) {
        showToast('Pricing rule deleted.', 'success');
        await loadData();
        await runHierarchyTest();
      }
    } catch (err) {
      showToast('Failed to delete pricing rule.', 'error');
    }
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (statusFilter !== 'ALL' && p.paymentStatus !== statusFilter) return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase();
        const matchName = p.teacherName.toLowerCase().includes(q);
        const matchEmail = p.teacherEmail.toLowerCase().includes(q);
        const matchPhone = p.teacherMobile.includes(q);
        const matchId = (p.paymentId || p.id || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchId) return false;
      }
      return true;
    });
  }, [payments, statusFilter, ledgerSearch]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {isDistrictAdmin ? `${userDistrict} District Command` : 'Super Admin Pan-India'}
            </span>
            <span className="text-xs text-slate-500 font-medium">4-Tier Hierarchy Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            Teacher Registration Pricing & Governance
          </h2>
          <p className="text-xs text-slate-600">
            Configure dynamic fee tiers (Particular Teacher → District → State → Pan-India) and oversee payment-gated onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={handleOpenNewWizard}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Registration Policy
          </Button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registrations</p>
            <p className="text-2xl font-black text-slate-950 mt-1">{analytics.totalRegistrations}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">All Applications</p>
          </Card>

          <Card className="p-4 bg-emerald-50/50 border-emerald-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Paid Verified</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{analytics.paidRegistrations}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Fee Received</p>
          </Card>

          <Card className="p-4 bg-blue-50/50 border-blue-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Free Onboarded</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{analytics.freeRegistrations}</p>
            <p className="text-[10px] text-blue-700 mt-0.5">₹0 / Incentive</p>
          </Card>

          <Card className="p-4 bg-amber-50/50 border-amber-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Payment Pending</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{analytics.pendingPayments}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Unpaid Drafts</p>
          </Card>

          <Card className="p-4 bg-white border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Revenue</p>
            <p className="text-2xl font-black text-slate-950 mt-1">₹{analytics.grossRegistrationRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Before Concessions</p>
          </Card>

          <Card className="p-4 bg-purple-50/50 border-purple-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Net Revenue</p>
            <p className="text-2xl font-black text-purple-900 mt-1">₹{analytics.netRegistrationRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-purple-700 mt-0.5">After Offers & Coupons</p>
          </Card>
        </div>
      )}

      {/* Navigation Pills */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('RULES')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'RULES'
              ? 'border-brand-600 text-brand-600 bg-brand-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Active Pricing Policies ({rules.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HIERARCHY_TESTER')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'HIERARCHY_TESTER'
              ? 'border-brand-600 text-brand-600 bg-brand-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Hierarchy Resolution Simulator
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PAYMENTS_LEDGER')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PAYMENTS_LEDGER'
              ? 'border-brand-600 text-brand-600 bg-brand-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Registration Payments Ledger ({payments.length})
        </button>
      </div>

      {/* TAB 1: PRICING RULES TABLE */}
      {activeTab === 'RULES' && (
        <div className="space-y-4">
          <Card className="overflow-hidden bg-white border-slate-200 shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-950">Active Registration Fee Rules</h3>
                <p className="text-xs text-slate-500">
                  Priority Resolution: Particular Teacher &gt; District &gt; State &gt; Pan-India
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active
                </span>
                <span className="flex items-center gap-1 text-slate-600 ml-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Paused
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <th className="p-3">Scope</th>
                    <th className="p-3">Location / Targeted Teacher</th>
                    <th className="p-3 text-right">Registration Fee</th>
                    <th className="p-3">Effective From</th>
                    <th className="p-3">Effective Until</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Updated By</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No registration pricing policies configured yet. Click "New Registration Policy" to establish standard fees.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => {
                      const isRuleDistrictAdminRestricted = 
                        isDistrictAdmin && (rule.scope === 'PAN_INDIA' || rule.scope === 'STATE');

                      return (
                        <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              rule.scope === 'PARTICULAR' ? 'bg-purple-100 text-purple-800' :
                              rule.scope === 'DISTRICT' ? 'bg-blue-100 text-blue-800' :
                              rule.scope === 'STATE' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-200 text-slate-800'
                            }`}>
                              {rule.scope.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-3 font-medium text-slate-900">
                            {rule.scope === 'PAN_INDIA' && (
                              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                                🇮🇳 All India (Default Base)
                              </span>
                            )}
                            {rule.scope === 'STATE' && (
                              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                {rule.state}
                              </span>
                            )}
                            {rule.scope === 'DISTRICT' && (
                              <div className="space-y-0.5">
                                <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                  {rule.district} District
                                </span>
                                <p className="text-[10px] text-slate-500">{rule.state}</p>
                              </div>
                            )}
                            {rule.scope === 'PARTICULAR' && (
                              <div className="space-y-0.5">
                                <span className="flex items-center gap-1.5 text-purple-900 font-bold">
                                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                                  {rule.teacherName || 'Individual Teacher'}
                                </span>
                                <p className="text-[10px] text-slate-500">
                                  {rule.teacherEmail || rule.teacherMobile || rule.teacherId}
                                </p>
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-right font-black text-slate-950">
                            {rule.isFree || rule.price === 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-black">
                                FREE (₹0)
                              </span>
                            ) : (
                              <span className="text-sm font-black text-brand-700">
                                ₹{rule.price}
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-slate-600">{rule.effectiveFrom}</td>
                          <td className="p-3 text-slate-600">{rule.effectiveUntil || '— (Permanent)'}</td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => !isRuleDistrictAdminRestricted && handleToggleStatus(rule)}
                              disabled={isRuleDistrictAdminRestricted}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                rule.status === 'ACTIVE' 
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              } ${isRuleDistrictAdminRestricted ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {rule.status}
                            </button>
                          </td>

                          <td className="p-3 text-slate-600">
                            <p className="font-semibold text-slate-900">{rule.createdByName || rule.updatedByName || 'Admin'}</p>
                            <p className="text-[10px] text-slate-400">{rule.createdByRole}</p>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenHistory(rule)}
                                title="View Revision Audit History"
                              >
                                <History className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditWizard(rule)}
                                disabled={isRuleDistrictAdminRestricted}
                                title={isRuleDistrictAdminRestricted ? 'Restricted to Super Admin' : 'Edit Policy'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRule(rule)}
                                disabled={isRuleDistrictAdminRestricted}
                                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: HIERARCHY RESOLUTION SIMULATOR */}
      {activeTab === 'HIERARCHY_TESTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-6 bg-white border-slate-200 space-y-4 shadow-sm">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Live Hierarchy Price Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate exact teacher registration pricing resolution across all 4 priority tiers.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">State / UT</label>
                <select
                  value={testState}
                  onChange={(e) => setTestState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {allStates.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">District</label>
                <select
                  value={testDistrict}
                  onChange={(e) => setTestDistrict(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {testerDistricts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Teacher Identity (Optional Email / Mobile / Name)
                </label>
                <Input
                  value={testTeacherEmail}
                  onChange={(e) => setTestTeacherEmail(e.target.value)}
                  placeholder="e.g. pratiksha.sonkar@focuspoint.internal"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Try typing <strong>pratiksha.sonkar@focuspoint.internal</strong> to test highest priority teacher override.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  size="sm" 
                  onClick={runHierarchyTest}
                  isLoading={testLoading}
                  className="w-full"
                >
                  Recalculate Resolution
                </Button>
              </div>
            </div>
          </Card>

          {/* Tester Results Display */}
          <div className="lg:col-span-7 space-y-4">
            {testCalculation ? (
              <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Resolved Effective Fee
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-brand-700">
                        {testCalculation.isFree ? 'FREE (₹0)' : `₹${testCalculation.finalPayableFee}`}
                      </span>
                      {testCalculation.offerDiscount || testCalculation.couponDiscount ? (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{testCalculation.applicableFee}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      testCalculation.pricingScope === 'PARTICULAR' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                      testCalculation.pricingScope === 'DISTRICT' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      testCalculation.pricingScope === 'STATE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-slate-100 text-slate-900 border border-slate-300'
                    }`}>
                      Winning Rule: {testCalculation.pricingScope.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">{testCalculation.ruleName}</p>
                  </div>
                </div>

                {/* Exact Hierarchy Breakdown Tree */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                    Hierarchy Audit Breakdown (Highest Priority Wins)
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* 1. Particular Teacher */}
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${
                      testCalculation.pricingScope === 'PARTICULAR' 
                        ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 text-[10px] flex items-center justify-center font-black">
                          1
                        </span>
                        <span>Particular Teacher Override:</span>
                        <span className="font-medium text-slate-700">
                          {testCalculation.hierarchyBreakdown.particularTeacher 
                            ? testCalculation.hierarchyBreakdown.particularTeacher.teacherName || 'Targeted Teacher' 
                            : 'No Individual Override'}
                        </span>
                      </div>
                      <span className="font-black">
                        {testCalculation.hierarchyBreakdown.particularTeacher 
                          ? `₹${testCalculation.hierarchyBreakdown.particularTeacher.fee}` 
                          : '—'}
                      </span>
                    </div>

                    {/* 2. District Default */}
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${
                      testCalculation.pricingScope === 'DISTRICT' 
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-[10px] flex items-center justify-center font-black">
                          2
                        </span>
                        <span>District Default Override:</span>
                        <span className="font-medium text-slate-700">{testDistrict}</span>
                      </div>
                      <span className="font-black">
                        {testCalculation.hierarchyBreakdown.districtDefault 
                          ? `₹${testCalculation.hierarchyBreakdown.districtDefault.fee}` 
                          : '—'}
                      </span>
                    </div>

                    {/* 3. State Default */}
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${
                      testCalculation.pricingScope === 'STATE' 
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] flex items-center justify-center font-black">
                          3
                        </span>
                        <span>State Default Override:</span>
                        <span className="font-medium text-slate-700">{testState}</span>
                      </div>
                      <span className="font-black">
                        {testCalculation.hierarchyBreakdown.stateDefault 
                          ? `₹${testCalculation.hierarchyBreakdown.stateDefault.fee}` 
                          : '—'}
                      </span>
                    </div>

                    {/* 4. Pan-India Base */}
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${
                      testCalculation.pricingScope === 'PAN_INDIA' 
                        ? 'bg-slate-100 border-slate-400 text-slate-950 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-black">
                          4
                        </span>
                        <span>Pan-India Base Default:</span>
                        <span className="font-medium text-slate-700">All India</span>
                      </div>
                      <span className="font-black">
                        {testCalculation.hierarchyBreakdown.panIndiaDefault 
                          ? `₹${testCalculation.hierarchyBreakdown.panIndiaDefault.fee}` 
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Payment Workflow Directive:</p>
                  <p>
                    {testCalculation.paymentRequired 
                      ? '⚠️ Payment Required: Teacher will be directed through the Fee Review & Payment Gateway before submission.'
                      : '✅ Free Registration: Teacher will directly submit their application without seeing any payment gateway screen.'}
                  </p>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTRATION PAYMENTS LEDGER */}
      {activeTab === 'PAYMENTS_LEDGER' && (
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search by teacher, email, mobile, or Txn ID..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">Paid</option>
                <option value="FREE">Free</option>
                <option value="PAYMENT_PENDING">Pending</option>
                <option value="PAYMENT_FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <p className="text-xs text-slate-500">
              Showing {filteredPayments.length} of {payments.length} registration transactions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Registration Ref</th>
                  <th className="p-3">District</th>
                  <th className="p-3 text-right">Base Fee</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right">Paid Amount</th>
                  <th className="p-3 text-center">Payment Status</th>
                  <th className="p-3 text-center">Approval Status</th>
                  <th className="p-3">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      No matching teacher registration payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{pay.teacherName}</p>
                        <p className="text-[10px] text-slate-500">{pay.teacherEmail} • {pay.teacherMobile}</p>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-700">
                        {pay.registrationId}
                        {pay.paymentId && (
                          <span className="block text-[10px] text-slate-400">{pay.paymentId}</span>
                        )}
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="font-medium">{pay.district}</span>
                        <span className="block text-[10px] text-slate-400">{pay.state}</span>
                      </td>

                      <td className="p-3 text-right font-medium text-slate-600">
                        ₹{pay.originalFee}
                      </td>

                      <td className="p-3 text-right text-emerald-600 font-semibold">
                        {(pay.offerDiscount || 0) + (pay.couponDiscount || 0) > 0 
                          ? `-₹${(pay.offerDiscount || 0) + (pay.couponDiscount || 0)}` 
                          : '—'}
                      </td>

                      <td className="p-3 text-right font-black text-slate-950">
                        ₹{pay.finalAmount}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pay.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          pay.paymentStatus === 'FREE' ? 'bg-blue-100 text-blue-800' :
                          pay.paymentStatus === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-800' :
                          pay.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {pay.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pay.registrationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          pay.registrationStatus === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {pay.registrationStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3 text-slate-600">
                        {pay.confirmedAt ? pay.confirmedAt.substring(0, 10) : pay.createdAt.substring(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 8-STEP PRICING WIZARD MODAL */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={editingRuleId ? 'Edit Teacher Registration Policy' : 'New Teacher Registration Policy Wizard'}
        size="lg"
      >
        <div className="space-y-6">
          {/* Progress Tracker (8 Steps) */}
          <div className="border-b border-slate-200 pb-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Step {wizardStep} of 8:</span>
              <span className="text-brand-600">
                {wizardStep === 1 && 'Select Service'}
                {wizardStep === 2 && 'Choose Policy Scope'}
                {wizardStep === 3 && 'Location / Teacher Target'}
                {wizardStep === 4 && 'Registration Fee Amount'}
                {wizardStep === 5 && 'Validity Period'}
                {wizardStep === 6 && 'Rule Status'}
                {wizardStep === 7 && 'Review & Conflict Check'}
                {wizardStep === 8 && 'Save & Commit Policy'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-600 h-full transition-all duration-300" 
                style={{ width: `${(wizardStep / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: SERVICE */}
          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 1 — Service Selection</h4>
              <p className="text-slate-600">
                Configure onboarding registration charges specifically for ZYZU'S verified educators.
              </p>
              <div className="p-4 rounded-xl border-2 border-brand-500 bg-brand-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 text-sm">Teacher Registration</p>
                    <p className="text-slate-500 text-[11px]">Credential verification, document inspection & background audit charge.</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
              </div>
            </div>
          )}

          {/* STEP 2: SCOPE */}
          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 2 — Policy Scope</h4>
              <p className="text-slate-600">
                Choose the hierarchical tier for this registration pricing rule.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pan-India (Super Admin only) */}
                <button
                  type="button"
                  disabled={isDistrictAdmin}
                  onClick={() => setWizardForm(prev => ({ ...prev, scope: 'PAN_INDIA' }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    wizardForm.scope === 'PAN_INDIA' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  } ${isDistrictAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <p className="font-bold text-sm">Pan-India</p>
                  <p className="text-[11px] text-slate-500 mt-1">Applies nationwide across India unless overridden.</p>
                </button>

                {/* State (Super Admin only) */}
                <button
                  type="button"
                  disabled={isDistrictAdmin}
                  onClick={() => setWizardForm(prev => ({ ...prev, scope: 'STATE' }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    wizardForm.scope === 'STATE' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  } ${isDistrictAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <p className="font-bold text-sm">State</p>
                  <p className="text-[11px] text-slate-500 mt-1">Applies to all districts within a specified State.</p>
                </button>

                {/* District */}
                <button
                  type="button"
                  onClick={() => setWizardForm(prev => ({ ...prev, scope: 'DISTRICT' }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    wizardForm.scope === 'DISTRICT' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-sm">District</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Applies to all teachers in a specific District (e.g. {userDistrict}).
                  </p>
                </button>

                {/* Particular Teacher */}
                <button
                  type="button"
                  onClick={() => setWizardForm(prev => ({ ...prev, scope: 'PARTICULAR' }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    wizardForm.scope === 'PARTICULAR' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-sm">Particular Teacher</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Highest priority override targeted to an individual teacher.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION / TEACHER */}
          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 3 — Target Entity Specification</h4>

              {wizardForm.scope === 'PAN_INDIA' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">National Scope (India)</p>
                  <p className="text-slate-600 mt-1">This fee will apply to all teachers registering across India.</p>
                </div>
              )}

              {wizardForm.scope === 'STATE' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select State *</label>
                  <select
                    value={wizardForm.state}
                    onChange={(e) => setWizardForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {allStates.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {wizardForm.scope === 'DISTRICT' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">State *</label>
                    <select
                      value={wizardForm.state}
                      disabled={isDistrictAdmin}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {allStates.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">District *</label>
                    <select
                      value={wizardForm.district}
                      disabled={isDistrictAdmin}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {availableDistricts.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {wizardForm.scope === 'PARTICULAR' && (
                <div className="space-y-3">
                  <Input
                    label="Teacher Full Name *"
                    value={wizardForm.teacherName}
                    onChange={(e) => setWizardForm(prev => ({ ...prev, teacherName: e.target.value }))}
                    placeholder="e.g. Pratiksha Sonkar"
                  />

                  <Input
                    label="Teacher Email Address"
                    type="email"
                    value={wizardForm.teacherEmail}
                    onChange={(e) => setWizardForm(prev => ({ ...prev, teacherEmail: e.target.value }))}
                    placeholder="pratiksha.sonkar@focuspoint.internal"
                  />

                  <Input
                    label="Teacher Mobile Number"
                    type="tel"
                    value={wizardForm.teacherMobile}
                    onChange={(e) => setWizardForm(prev => ({ ...prev, teacherMobile: e.target.value }))}
                    placeholder="10-digit mobile number"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REGISTRATION FEE */}
          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 4 — Registration Fee Amount</h4>
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                  <input
                    type="checkbox"
                    checked={wizardForm.isFree}
                    onChange={(e) => setWizardForm(prev => ({ 
                      ...prev, 
                      isFree: e.target.checked,
                      price: e.target.checked ? 0 : prev.price || 300 
                    }))}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Mark as FREE Registration (₹0)</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  If marked Free, teachers will not be shown any payment gateway and their application will submit directly for verification.
                </p>
              </div>

              {!wizardForm.isFree && (
                <div className="space-y-2">
                  <label className="block text-slate-700 font-semibold">Applicable Registration Fee (₹ INR) *</label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={wizardForm.price}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="300"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: VALIDITY */}
          {wizardStep === 5 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 5 — Validity Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Effective From Date *"
                  type="date"
                  value={wizardForm.effectiveFrom}
                  onChange={(e) => setWizardForm(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
                <Input
                  label="Effective Until Date (Optional)"
                  type="date"
                  value={wizardForm.effectiveUntil}
                  onChange={(e) => setWizardForm(prev => ({ ...prev, effectiveUntil: e.target.value }))}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Leave "Effective Until" empty for permanent indefinite policy.
              </p>
            </div>
          )}

          {/* STEP 6: STATUS */}
          {wizardStep === 6 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 6 — Rule Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['ACTIVE', 'SCHEDULED', 'PAUSED', 'DISABLED'] as TeacherRegistrationRuleStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setWizardForm(prev => ({ ...prev, status: st }))}
                    className={`p-3 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      wizardForm.status === st 
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-xs' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-slate-700 font-semibold mb-1">Administrative Reason / Justification</label>
                <textarea
                  rows={2}
                  value={wizardForm.reason}
                  onChange={(e) => setWizardForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Ghazipur rural incentive expansion or festival offer..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & CONFLICT CHECK */}
          {wizardStep === 7 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Step 7 — Review & Impact Assessment</h4>

              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p>{conflictWarning}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p><strong className="text-slate-950">Service:</strong> Teacher Registration</p>
                <p><strong className="text-slate-950">Scope:</strong> {wizardForm.scope}</p>
                <p>
                  <strong className="text-slate-950">Target:</strong>{' '}
                  {wizardForm.scope === 'PAN_INDIA' && 'All India'}
                  {wizardForm.scope === 'STATE' && wizardForm.state}
                  {wizardForm.scope === 'DISTRICT' && `${wizardForm.district}, ${wizardForm.state}`}
                  {wizardForm.scope === 'PARTICULAR' && `${wizardForm.teacherName} (${wizardForm.teacherEmail || wizardForm.teacherMobile})`}
                </p>
                <p>
                  <strong className="text-slate-950">Registration Fee:</strong>{' '}
                  {wizardForm.isFree || wizardForm.price === 0 ? 'FREE (₹0)' : `₹${wizardForm.price}`}
                </p>
                <p><strong className="text-slate-950">Validity:</strong> {wizardForm.effectiveFrom} to {wizardForm.effectiveUntil || 'Permanent'}</p>
                <p><strong className="text-slate-950">Status:</strong> {wizardForm.status}</p>
              </div>
            </div>
          )}

          {/* STEP 8: SAVE */}
          {wizardStep === 8 && (
            <div className="space-y-4 text-center py-4 text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-950 text-base">Step 8 — Commit Registration Policy</h4>
              <p className="text-slate-600 max-w-sm mx-auto">
                Click below to save and enforce this policy in the live pricing resolution hierarchy.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between border-t border-slate-200 pt-4">
            {wizardStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWizardStep(prev => prev - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous Step
              </Button>
            ) : <div />}

            {wizardStep < 8 ? (
              <Button
                size="sm"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Step {wizardStep + 1}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSavePolicy}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Save & Activate Policy
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* RULE HISTORY MODAL */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Policy Revision & Audit History"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="font-semibold text-slate-700">{historyTargetTitle}</p>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {selectedRuleHistory.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No revision history found for this rule.</p>
            ) : (
              selectedRuleHistory.map(h => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>₹{h.previousFee} → ₹{h.newFee}</span>
                    <span className="text-[10px] text-slate-500">{h.timestamp}</span>
                  </div>
                  <p className="text-slate-600"><strong className="text-slate-900">Changed By:</strong> {h.changedBy} ({h.changedByRole})</p>
                  <p className="text-slate-600"><strong className="text-slate-900">Reason:</strong> {h.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
