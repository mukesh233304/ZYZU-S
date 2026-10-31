import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  QrCode, 
  Search, 
  Filter, 
  IndianRupee, 
  Calendar, 
  MapPin, 
  Sparkles,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { demoService } from '../../services/demoService';
import { DemoPricingRule, DemoBooking, DemoServiceType, DemoScopeType } from '../../types';
import { DemoQrVerificationModal } from './DemoQrVerificationModal';
import { DemoIdCardModal } from './DemoIdCardModal';

export interface AdminDemoPricingManagerProps {
  forcedDistrict?: string; // If District Admin, restrict to their district
}

export const AdminDemoPricingManager: React.FC<AdminDemoPricingManagerProps> = ({
  forcedDistrict
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isDistrictAdmin = user?.role === 'DISTRICT_ADMIN' || Boolean(forcedDistrict);
  const userDistrict = forcedDistrict || user?.districtName || user?.district || 'Ghazipur';

  // State
  const [activeTab, setActiveTab] = useState<'PRICING_RULES' | 'BOOKINGS'>('PRICING_RULES');
  const [pricingRules, setPricingRules] = useState<DemoPricingRule[]>([]);
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [selectedBookingForCard, setSelectedBookingForCard] = useState<DemoBooking | null>(null);

  // Filter state for Bookings
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State for New Rule
  const [formServiceType, setFormServiceType] = useState<DemoServiceType>('LIBRARY');
  const [formScopeType, setFormScopeType] = useState<DemoScopeType>(isDistrictAdmin ? 'DISTRICT' : 'PAN_INDIA');
  const [formState, setFormState] = useState<string>('Uttar Pradesh');
  const [formDistrict, setFormDistrict] = useState<string>(userDistrict);
  const [formServiceId, setFormServiceId] = useState<string>('');
  const [formServiceName, setFormServiceName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [formEndDate, setFormEndDate] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [rules, bks] = await Promise.all([
        demoService.getPricingRules(),
        demoService.getAllBookings()
      ]);

      // If District Admin, filter rules to their district or pan-india visible
      if (isDistrictAdmin) {
        setPricingRules(rules.filter(r => 
          r.scope_type === 'PAN_INDIA' || 
          (r.district && r.district.toLowerCase() === userDistrict.toLowerCase())
        ));
        setBookings(bks.filter(b => 
          !b.district || b.district.toLowerCase() === userDistrict.toLowerCase()
        ));
      } else {
        setPricingRules(rules);
        setBookings(bks);
      }
    } catch (err) {
      console.error('Error loading admin demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [forcedDistrict, user?.id]);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check permission
    if (isDistrictAdmin && formScopeType !== 'DISTRICT' && formScopeType !== 'PARTICULAR') {
      showToast('District Admins can only configure District or Particular Entity pricing', 'error');
      return;
    }

    try {
      await demoService.savePricingRule({
        service_type: formServiceType as 'LIBRARY' | 'HOME_TUITION',
        scope_type: formScopeType as 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR',
        state: formState,
        district: formScopeType === 'DISTRICT' || formScopeType === 'PARTICULAR' ? formDistrict : undefined,
        service_id: formScopeType === 'PARTICULAR' ? formServiceId : undefined,
        service_name: formScopeType === 'PARTICULAR' ? formServiceName : undefined,
        price: Number(formPrice),
        is_active: true,
        start_date: formStartDate,
        end_date: formEndDate || undefined,
        created_by: user?.name || (isDistrictAdmin ? 'District Admin' : 'Super Admin')
      });

      showToast('Demo pricing rule created successfully!', 'success');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to save demo pricing rule', 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to remove this pricing rule?')) return;
    try {
      await demoService.deletePricingRule(ruleId);
      showToast('Pricing rule removed', 'info');
      loadData();
    } catch (e) {
      showToast('Error removing rule', 'error');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (serviceFilter !== 'ALL' && b.service_type !== serviceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.demo_booking_id.toLowerCase().includes(q) ||
        b.student_name?.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Hierarchy Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                FocusPoint Demo Booking & Pricing Hub
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tier fee overrides, one-time eligibility enforcement & live verification
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition shadow"
            >
              <QrCode className="w-4 h-4" />
              Verify Demo QR
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" />
              Add Pricing Rule
            </button>
          </div>
        </div>

        {/* 4-Tier Hierarchy Visualizer */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            4-Tier Pricing Hierarchy Resolution Order:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold">
              1. Particular Entity
              <span className="block text-[10px] text-slate-400 font-normal">Library / Tutor Override</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold">
              2. District Rule
              <span className="block text-[10px] text-slate-400 font-normal">District Policy Override</span>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-300 font-bold">
              3. State Rule
              <span className="block text-[10px] text-slate-400 font-normal">State Policy Override</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 font-bold">
              4. Pan India Standard
              <span className="block text-[10px] text-slate-400 font-normal">Nationwide Default</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold">
              5. Default Free (₹0)
              <span className="block text-[10px] text-slate-400 font-normal">Complimentary Demo</span>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pt-2">
          <button
            onClick={() => setActiveTab('PRICING_RULES')}
            className={`pb-3 px-2 text-xs font-bold transition border-b-2 ${
              activeTab === 'PRICING_RULES'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Pricing Rules ({pricingRules.length})
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`pb-3 px-2 text-xs font-bold transition border-b-2 ${
              activeTab === 'BOOKINGS'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Bookings & Attendance ({bookings.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Pricing Rules Table */}
      {activeTab === 'PRICING_RULES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Hierarchy Scope</th>
                  <th className="py-3.5 px-4">Target Region / Entity</th>
                  <th className="py-3.5 px-4">Locked Fee</th>
                  <th className="py-3.5 px-4">Effective Dates</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {pricingRules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No pricing rules found. Default fallback is ₹0 (Free Demo).
                    </td>
                  </tr>
                ) : (
                  pricingRules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          {r.service_type === 'LIBRARY' ? (
                            <BookOpen className="w-4 h-4 text-blue-400" />
                          ) : (
                            <GraduationCap className="w-4 h-4 text-amber-400" />
                          )}
                          {r.service_type === 'LIBRARY' ? 'Digital Library' : 'Home Tuition'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.scope_type === 'PARTICULAR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          r.scope_type === 'DISTRICT' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          r.scope_type === 'STATE' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {r.scope_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {r.scope_type === 'PARTICULAR' ? (r.service_name || r.service_id) :
                         r.scope_type === 'DISTRICT' ? `${r.district}, ${r.state || 'UP'}` :
                         r.scope_type === 'STATE' ? r.state :
                         'All India (Pan India)'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={r.price === 0 ? 'text-emerald-400' : 'text-cyan-300 font-mono text-sm'}>
                          {r.price === 0 ? 'FREE (₹0)' : `₹${r.price}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {r.start_date} {r.end_date ? `to ${r.end_date}` : '(Indefinite)'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {r.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRule(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings & Audit Table */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="ALL">All Services</option>
                <option value="LIBRARY">Digital Library Demos</option>
                <option value="HOME_TUITION">Home Tuition Demos</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, student, venue..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Booking ID</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Target Service / Venue</th>
                    <th className="py-3.5 px-4">Scheduled Slot</th>
                    <th className="py-3.5 px-4">Locked Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Pass Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500">
                        No demo bookings found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                          {b.demo_booking_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{b.student_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {b.student_id}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-200">{b.service_name}</p>
                          <p className="text-[11px] text-slate-400">{b.district || 'Ghazipur'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-white font-medium">{b.demo_date}</p>
                          <p className="text-[10px] text-slate-400">{b.demo_time}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={b.price === 0 ? 'text-emerald-400' : 'text-slate-200'}>
                            {b.price === 0 ? 'FREE (₹0)' : `₹${b.price}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.booking_status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                            b.booking_status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedBookingForCard(b)}
                            className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition font-semibold text-xs"
                          >
                            View Pass Card
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Pricing Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="font-bold text-white text-base">Configure Demo Pricing Rule</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Service Type</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value as DemoServiceType)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="LIBRARY">FocusPoint Digital Library</option>
                    <option value="HOME_TUITION">FocusPoint Home Tuition</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Hierarchy Scope</label>
                  <select
                    value={formScopeType}
                    onChange={(e) => setFormScopeType(e.target.value as DemoScopeType)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                  >
                    {!isDistrictAdmin && <option value="PAN_INDIA">Pan India Standard</option>}
                    {!isDistrictAdmin && <option value="STATE">State Override</option>}
                    <option value="DISTRICT">District Override</option>
                    <option value="PARTICULAR">Particular Entity Override</option>
                  </select>
                </div>
              </div>

              {(formScopeType === 'DISTRICT' || formScopeType === 'PARTICULAR') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">State</label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">District</label>
                    <input
                      type="text"
                      disabled={isDistrictAdmin}
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </div>
              )}

              {formScopeType === 'PARTICULAR' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Entity ID (Library or Tutor ID)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. lib-focus-saidpur"
                      value={formServiceId}
                      onChange={(e) => setFormServiceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Entity Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Saidpur Smart Library"
                      value={formServiceName}
                      onChange={(e) => setFormServiceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Demo Fee Amount (₹) — Set 0 for Complimentary Demo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Effective Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Effective End Date (Optional)</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition mt-2"
              >
                Save Pricing Rule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Verification Modal */}
      {showQrModal && (
        <DemoQrVerificationModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* ID Card Pass Modal */}
      {selectedBookingForCard && (
        <DemoIdCardModal
          isOpen={Boolean(selectedBookingForCard)}
          onClose={() => setSelectedBookingForCard(null)}
          booking={selectedBookingForCard}
        />
      )}
    </div>
  );
};
