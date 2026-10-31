// FOCUSPOINT District Admin Study Material Hub
// District-scoped pricing overrides, student quota customization, local coupons, and download auditing

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Sliders, DollarSign, Tag, Download, Users, 
  CheckCircle2, AlertCircle, Plus, Search, Filter, RefreshCw, 
  Trash2, TrendingUp, ShieldCheck, ShieldAlert, MapPin, Layers, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { studyMaterialService } from '../../services/studyMaterialService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { mockStore } from '../../mock/store';
import { 
  STUDY_MATERIAL_CLASSES, 
  STUDY_MATERIAL_CATEGORIES, 
  STUDY_MATERIAL_SUBJECTS, 
  DEFAULT_MONTHLY_DOWNLOAD_LIMIT 
} from '../../constants/studyMaterial';
import { 
  StudyMaterial, 
  StudyMaterialPricingRule, 
  StudyMaterialDownloadPolicy, 
  StudyMaterialOffer, 
  StudyMaterialPurchase, 
  StudyMaterialDownloadRecord 
} from '../../types/studyMaterial';

export const DistrictAdminStudyMaterial: React.FC = () => {
  const { user } = useAuth();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const districtName = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(districtName, user);

  // Sub-navigation Tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUOTA' | 'PRICING' | 'LOCAL_OFFERS' | 'STUDENT_LOGS'>('OVERVIEW');

  // Core Data
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [districtPricingRules, setDistrictPricingRules] = useState<StudyMaterialPricingRule[]>([]);
  const [districtPolicy, setDistrictPolicy] = useState<StudyMaterialDownloadPolicy | null>(null);
  const [districtOffers, setDistrictOffers] = useState<StudyMaterialOffer[]>([]);
  const [districtPurchases, setDistrictPurchases] = useState<StudyMaterialPurchase[]>([]);
  const [districtDownloads, setDistrictDownloads] = useState<StudyMaterialDownloadRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Forms
  const [newQuotaLimit, setNewQuotaLimit] = useState<number>(5);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [pricingForm, setPricingForm] = useState<{
    materialId: string;
    price: number;
    notes: string;
  }>({
    materialId: '',
    price: 89,
    notes: `Subsidized welfare rate for ${districtName} students`
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDistrictData = () => {
    setLoading(true);
    try {
      const allMaterials = studyMaterialService.getMaterials({ status: 'PUBLISHED' });
      setMaterials(allMaterials);

      // District Pricing Rules
      const rules = studyMaterialService.getPricingRules().filter(
        r => r.level === 'DISTRICT' && r.targetEntityId?.toLowerCase() === districtName.toLowerCase()
      );
      setDistrictPricingRules(rules);

      // District Download Policy
      const policies = studyMaterialService.getDownloadPolicies();
      const currentDstPolicy = policies.find(
        p => p.level === 'DISTRICT' && p.targetId?.toLowerCase() === districtName.toLowerCase()
      );
      setDistrictPolicy(currentDstPolicy || null);
      if (currentDstPolicy) {
        setNewQuotaLimit(currentDstPolicy.monthlyLimit);
      }

      // District Local Offers
      const offers = studyMaterialService.getOffers().filter(
        o => o.applicableDistrictIds?.some(d => d.toLowerCase() === districtName.toLowerCase())
      );
      setDistrictOffers(offers);

      // District Purchases
      const purchases = studyMaterialService.getAllPurchases().filter(
        p => p.districtName?.toLowerCase() === districtName.toLowerCase() ||
             p.districtId?.toLowerCase() === districtName.toLowerCase()
      );
      setDistrictPurchases(purchases);

      // District Downloads (strictly scoped to district students and local purchasers)
      const allDownloads = studyMaterialService.getAllDownloads();
      const studentIdsInDistrict = new Set(mockStore.getStudents(districtName).map(s => s.id));
      const purchaserIdsInDistrict = new Set(purchases.map(p => p.studentId || (p as any).userId));
      const downloads = allDownloads.filter(
        d => (d as any).districtName?.toLowerCase() === districtName.toLowerCase() ||
             (d as any).districtId?.toLowerCase() === districtName.toLowerCase() ||
             studentIdsInDistrict.has(d.studentId) ||
             purchaserIdsInDistrict.has(d.studentId)
      );
      setDistrictDownloads(downloads);
    } catch (e) {
      console.error('Failed to load district study material data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistrictData();
  }, [districtName]);

  // Save Quota Policy
  const handleSaveQuotaPolicy = () => {
    studyMaterialService.saveDownloadPolicy({
      id: districtPolicy?.id,
      level: 'DISTRICT',
      targetId: districtName,
      targetName: `${districtName} District Quota Policy`,
      monthlyLimit: Number(newQuotaLimit),
      allowCarryOver: false,
      allowBonusDownloadsForPaid: true,
      updatedBy: `District Admin (${districtName})`
    });

    loadDistrictData();
    setToastMessage({
      type: 'success',
      text: `Updated monthly free download limit for ${districtName} students to ${newQuotaLimit} downloads/month.`
    });
  };

  // Save Pricing Override
  const handleSavePricingOverride = () => {
    if (!pricingForm.materialId) {
      setToastMessage({ type: 'error', text: 'Please select a study material.' });
      return;
    }

    const selectedMat = materials.find(m => m.id === pricingForm.materialId);

    studyMaterialService.savePricingRule({
      materialId: pricingForm.materialId,
      level: 'DISTRICT',
      targetEntityId: districtName,
      targetEntityName: `${districtName} Special Price (${selectedMat?.title})`,
      price: Number(pricingForm.price),
      notes: pricingForm.notes,
      updatedBy: `District Admin (${districtName})`
    });

    setIsPricingModalOpen(false);
    loadDistrictData();
    setToastMessage({
      type: 'success',
      text: `Set ${districtName} student price for "${selectedMat?.title}" to ₹${pricingForm.price}.`
    });
  };

  // Delete Pricing Rule
  const handleDeletePricingRule = (id: string) => {
    studyMaterialService.deletePricingRule(id);
    loadDistrictData();
    setToastMessage({ type: 'success', text: 'Removed district price override.' });
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-rose-900">403 FORBIDDEN - DISTRICT ACCESS DENIED</h2>
        <p className="text-sm text-rose-700">
          You are authorized exclusively for <strong>{scope?.districtName || 'your assigned district'}</strong>. You cannot access study material administrative tools for another district.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" /> {districtName} District Portal
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>🔒 AUTHORIZED DISTRICT: {districtName.toUpperCase()}</span>
            </div>
            <span className="text-slate-400 text-xs hidden sm:inline">• Local Student Study Quota & Subsidies</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            District Study Material Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize monthly download limits for {districtName} students, subsidize textbook solutions, and track local acquisitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDistrictData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPricingModalOpen(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add District Subsidy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`${districtName} Quota`}
          value={`${districtPolicy?.monthlyLimit || DEFAULT_MONTHLY_DOWNLOAD_LIMIT} Free / mo`}
          subtitle={districtPolicy ? 'Custom district quota active' : 'Pan-India default standard (3/mo)'}
          icon={<Sliders className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Subsidized Materials"
          value={districtPricingRules.length.toString()}
          subtitle="Special local student rates"
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="District Student Purchases"
          value={districtPurchases.length.toString()}
          subtitle={`₹${districtPurchases.reduce((s, p) => s + p.finalAmountPaid, 0).toLocaleString()} GMV`}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Available Vault Items"
          value={materials.length.toString()}
          subtitle="Directorate approved curriculum"
          icon={<BookOpen className="w-6 h-6 text-amber-600" />}
        />
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-sm ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Overview & Catalogue', count: materials.length, icon: BookOpen },
          { id: 'QUOTA', label: 'Monthly Download Quota', count: `${districtPolicy?.monthlyLimit || DEFAULT_MONTHLY_DOWNLOAD_LIMIT}/mo`, icon: Sliders },
          { id: 'PRICING', label: 'District Subsidies & Rates', count: districtPricingRules.length, icon: DollarSign },
          { id: 'LOCAL_OFFERS', label: 'District Offers & Coupons', count: districtOffers.length, icon: Tag },
          { id: 'STUDENT_LOGS', label: 'Student Purchases & Logs', count: districtPurchases.length, icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Approved Study Material Catalogue</h3>
                <p className="text-xs text-slate-500">
                  Curriculum assets available for {districtName} students across primary, middle, and senior secondary stages.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {materials.slice(0, 6).map(mat => {
                const override = districtPricingRules.find(r => r.materialId === mat.id);
                return (
                  <div key={mat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {mat.targetClass} • {mat.subject}
                      </span>
                      {override ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          District Subsidized: ₹{override.price}
                        </span>
                      ) : mat.isPaid ? (
                        <span className="text-xs font-bold text-amber-600">Base: ₹{mat.basePrice}</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">FREE</span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{mat.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{mat.description}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{mat.pageCount} Pages ({mat.fileSize})</span>
                      <span>Version {mat.currentVersion}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTA */}
      {activeTab === 'QUOTA' && (
        <div className="space-y-4 max-w-xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{districtName} Free Download Allowance</h3>
              <p className="text-xs text-slate-500">
                Set how many free study materials registered students in {districtName} can download each calendar month.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" /> Pan-India Baseline: {DEFAULT_MONTHLY_DOWNLOAD_LIMIT} Downloads / Month
              </div>
              <p className="text-[11px] leading-relaxed">
                As District Admin, you can boost this limit to support students in under-served blocks or during board exam preparation months.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 text-xs">
                Monthly Free Downloads for {districtName} Students:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newQuotaLimit}
                  onChange={e => setNewQuotaLimit(Number(e.target.value))}
                  className="w-32 px-3 py-2 text-sm font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-500 font-medium">downloads per calendar month</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveQuotaPolicy}
              className="bg-blue-600 hover:bg-blue-700 text-xs font-bold"
            >
              Update District Download Quota
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING */}
      {activeTab === 'PRICING' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">District Student Subsidies & Rates</h3>
                <p className="text-xs text-slate-500">
                  Override Pan-India base prices specifically for students verified in {districtName}.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsPricingModalOpen(true)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Rate Subsidy
              </Button>
            </div>

            {districtPricingRules.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No custom pricing overrides configured. {districtName} students pay standard Pan-India prices.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
                {districtPricingRules.map(rule => (
                  <div key={rule.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rule.targetEntityName}</h4>
                      <p className="text-slate-400 text-[11px]">{rule.notes}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-emerald-600">₹{rule.price}</span>
                      <button
                        onClick={() => handleDeletePricingRule(rule.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LOCAL OFFERS */}
      {activeTab === 'LOCAL_OFFERS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">{districtName} Promotional Coupons</h3>
            <p className="text-xs text-slate-500">
              Active promo coupons configured by Super Admin or District Admin for local students.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {districtOffers.map(off => (
                <div key={off.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <code className="font-black text-blue-700 text-sm">{off.code}</code>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {off.discountType === 'PERCENTAGE' ? `${off.discountValue}% OFF` : `₹${off.discountValue} FLAT`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{off.title}</h4>
                  <p className="text-slate-500 text-[11px]">{off.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT LOGS */}
      {activeTab === 'STUDENT_LOGS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">{districtName} Purchases & Audit</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Material Title</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Txn Reference</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {districtPurchases.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-slate-800">{p.studentName}</td>
                      <td className="p-3 text-slate-600 line-clamp-1 max-w-xs">{p.materialTitle}</td>
                      <td className="p-3 text-slate-500">{p.targetClass}</td>
                      <td className="p-3 font-bold text-emerald-600">₹{p.finalAmountPaid}</td>
                      <td className="p-3 font-mono text-slate-400">{p.transactionReference}</td>
                      <td className="p-3 text-slate-500">{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRICING OVERRIDE MODAL */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase">District Subsidy</span>
                <h3 className="font-bold text-slate-900 text-sm">Set {districtName} Student Price</h3>
              </div>
              <button onClick={() => setIsPricingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Select Study Material *</label>
                <select
                  value={pricingForm.materialId}
                  onChange={e => setPricingForm({ ...pricingForm, materialId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Material --</option>
                  {materials.filter(m => m.isPaid).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.targetClass} - {m.title} (Base: ₹{m.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Subsidized Price for {districtName} Students (INR) *</label>
                <input
                  type="number"
                  value={pricingForm.price}
                  onChange={e => setPricingForm({ ...pricingForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Policy Notes</label>
                <input
                  type="text"
                  value={pricingForm.notes}
                  onChange={e => setPricingForm({ ...pricingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsPricingModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSavePricingOverride} className="bg-indigo-600 hover:bg-indigo-700">
                Save Rate Override
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
