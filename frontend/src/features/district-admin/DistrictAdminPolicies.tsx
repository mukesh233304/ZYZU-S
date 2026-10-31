import React, { useState } from 'react';
import { CommissionOfferPolicyManager } from './CommissionOfferPolicyManager';
import { AdminDemoPricingManager } from '../../components/demo/AdminDemoPricingManager';
import { TeacherRegistrationPricingManager } from '../../components/pricing/TeacherRegistrationPricingManager';
import { LibrarySubscriptionPricingManager } from '../../components/pricing/LibrarySubscriptionPricingManager';
import { useAuth } from '../../context/AuthContext';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { Sliders, Sparkles, Percent, GraduationCap, Building2, ShieldCheck, ShieldAlert } from 'lucide-react';

export const DistrictAdminPolicies: React.FC = () => {
  const { user } = useAuth();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const districtName = scope?.districtName || user?.districtName || user?.district || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(districtName, user);

  const [activeTab, setActiveTab] = useState<'COMMISSIONS_OFFERS' | 'DEMO_PRICING' | 'TEACHER_REGISTRATION_PRICING' | 'LIBRARY_SUBSCRIPTION_PRICING'>('COMMISSIONS_OFFERS');

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-rose-900">403 FORBIDDEN - DISTRICT ACCESS DENIED</h2>
        <p className="text-sm text-rose-700">
          You are authorized exclusively for <strong>{scope?.districtName || 'your assigned district'}</strong>. You cannot view or modify district policy configurations for another district.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authorized District Security Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-royal-blue-600" />
            District Operational & Policy Hub
          </h1>
          <p className="text-xs text-slate-500">Configure commission rates, onboarding fees, and localized offerings</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>🔒 AUTHORIZED DISTRICT: {districtName.toUpperCase()}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-3 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('COMMISSIONS_OFFERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'COMMISSIONS_OFFERS'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          Commission & Offer Policies ({districtName})
        </button>

        <button
          onClick={() => setActiveTab('DEMO_PRICING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'DEMO_PRICING'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Demo Booking & Pricing Hub
        </button>

        <button
          onClick={() => setActiveTab('TEACHER_REGISTRATION_PRICING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'TEACHER_REGISTRATION_PRICING'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Teacher Registration Pricing ({districtName})
        </button>

        <button
          onClick={() => setActiveTab('LIBRARY_SUBSCRIPTION_PRICING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'LIBRARY_SUBSCRIPTION_PRICING'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Library Listing Subscriptions ({districtName})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'COMMISSIONS_OFFERS' && (
        <CommissionOfferPolicyManager 
          initialDistrict={districtName} 
          isSuperAdminView={false} 
        />
      )}

      {activeTab === 'DEMO_PRICING' && (
        <AdminDemoPricingManager forcedDistrict={districtName} />
      )}

      {activeTab === 'TEACHER_REGISTRATION_PRICING' && (
        <TeacherRegistrationPricingManager forcedDistrict={districtName} />
      )}

      {activeTab === 'LIBRARY_SUBSCRIPTION_PRICING' && (
        <LibrarySubscriptionPricingManager forcedDistrict={districtName} />
      )}
    </div>
  );
};

