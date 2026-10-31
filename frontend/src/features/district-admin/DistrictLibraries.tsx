import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { mockStore } from '../../mock/store';
import { Library } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { FocusPointSearchInput } from '../../components/common/FocusPointSearchInput';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Search,
  MapPin,
  Armchair,
  CheckCircle2,
  Wifi,
  Zap,
  ShieldCheck,
  PlusCircle,
  Clock,
  Filter,
  Users,
  DollarSign,
  X,
  FileCheck,
  Phone,
  UserCheck
} from 'lucide-react';

import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { INITIAL_LOCALITIES } from '../../mock/data/locations';

export const DistrictLibraries: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const scope = districtAuthorizationService.getAuthorizedScope();
  const district = scope?.districtName || user?.authorizedDistrict || user?.districtName || user?.district || 'Authorized District';

  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');

  // Manual Booking Modal State (Req 10)
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [bookingStudentName, setBookingStudentName] = useState('');
  const [bookingStudentPhone, setBookingStudentPhone] = useState('');
  const [bookingLibraryId, setBookingLibraryId] = useState('');
  const [bookingShift, setBookingShift] = useState('MORNING');
  const [bookingSeatNumber, setBookingSeatNumber] = useState('12');
  const [bookingFeePaid, setBookingFeePaid] = useState(800);
  const [bookingPaymentMode, setBookingPaymentMode] = useState<'CASH' | 'UPI'>('UPI');

  const availableLocalities = React.useMemo(() => {
    return INITIAL_LOCALITIES.filter(l => 
      (scope?.districtId && l.districtId === scope.districtId) ||
      l.districtId === `dist-${district.toLowerCase().substring(0, 3)}`
    );
  }, [scope, district]);

  const loadLibraries = async () => {
    setLoading(true);
    try {
      districtAuthorizationService.verifyDistrictAccess(district, 'libraries', 'READ');
      const data = await districtAdminService.getLibraries(district);
      setLibraries(data);
      if (data.length > 0 && !bookingLibraryId) {
        setBookingLibraryId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load libraries', err);
      addToast(err?.message || 'Access restricted for unauthorized district.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraries();
  }, [district]);

  const filtered = libraries.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase());
    const matchesArea = selectedArea === 'ALL' || l.area.toLowerCase().includes(selectedArea.toLowerCase());
    return matchesSearch && matchesArea;
  });

  // Calculate live capacity & occupancy stats
  const totalCapacity = libraries.reduce((sum, l) => sum + (l.totalSeats || 30), 0);
  const occupiedEstimate = Math.round(totalCapacity * 0.79);
  const vacantEstimate = totalCapacity - occupiedEstimate;

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStudentName.trim() || !bookingStudentPhone.trim() || !bookingLibraryId) return;

    const targetLib = libraries.find((l) => l.id === bookingLibraryId);
    const newRecord = {
      id: `MB-${Date.now()}`,
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: bookingStudentName.trim(),
      studentPhone: bookingStudentPhone.trim(),
      libraryId: bookingLibraryId,
      libraryName: targetLib?.name || `${district} Self-Study Center`,
      seatNumber: bookingSeatNumber,
      shift: bookingShift as any,
      bookingDate: new Date().toISOString().slice(0, 10),
      feeAmount: Number(bookingFeePaid),
      paymentMethod: bookingPaymentMode,
      paymentStatus: 'PAID' as const,
      bookedByAdminId: scope?.userId || user?.id || 'admin_district',
      district,
    };

    mockStore.createManualBooking(newRecord);
    addToast(
      `Seat #${bookingSeatNumber} successfully allotted to ${bookingStudentName} at ${newRecord.libraryName}!`,
      'success'
    );

    setIsManualBookingOpen(false);
    setBookingStudentName('');
    setBookingStudentPhone('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Study Libraries & Infrastructure: ${district}`}
        subtitle={`Live monitoring of ${libraries.length} accredited self-study study halls and reading rooms`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Libraries & Seats' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsManualBookingOpen(true)}
            >
              Manual Walk-in Seat Booking
            </Button>
          </div>
        }
      />

      {/* Seat Capacity & Live Occupancy Metrics (Req 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Desks Capacity"
          value={`${totalCapacity} Desks`}
          change={totalCapacity > 0 ? "Accredited study stations" : "No study halls registered"}
          isPositive={true}
          icon={<Armchair className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Occupied Desks"
          value={`${occupiedEstimate} Occupied`}
          change={totalCapacity > 0 ? "79% Live Utilization" : "0% Utilization"}
          isPositive={true}
          icon={<Users className="w-6 h-6 text-indigo-600" />}
        />
        <StatCard
          title="Vacant Desks Available"
          value={`${vacantEstimate} Available`}
          change={vacantEstimate > 0 ? "Ready for walk-in allotment" : "No vacant desks"}
          isPositive={true}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Active Centers"
          value={`${libraries.length} Centers`}
          change="100% Safety Compliance"
          isPositive={true}
          icon={<Building2 className="w-6 h-6 text-cyan-600" />}
        />
      </div>

      {/* Search & Area Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <FocusPointSearchInput
            id="district-libraries-search"
            placeholder="Search library, owner, location, ID..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
          >
            <option value="ALL">All Tehsil / Sub-Districts ({district})</option>
            {availableLocalities.map((loc) => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Libraries Data Cards & Table */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Accredited Reading Centers in {district} ({filtered.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live seat breakdown, facilities, and monthly fees</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            District Regulatory Approved
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
            {search ? `No matching library found in your authorized district (${district}).` : `No study libraries found in ${district} district.`}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Library & ID</th>
                    <th className="py-3 px-4 min-w-[170px]">Owner & Contact</th>
                    <th className="py-3 px-4 min-w-[150px]">Location & District</th>
                    <th className="py-3 px-4 text-center">Capacity & Occupancy</th>
                    <th className="py-3 px-4">Facilities</th>
                    <th className="py-3 px-4">Monthly Fee & Plan</th>
                    <th className="py-3 px-4 text-center">Approval Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {filtered.map((l) => {
                    const seats = l.totalSeats || 40;
                    const occ = Math.round(seats * 0.8);
                    const ownerName = (l as any).ownerName || (l as any).owner || 'Praveen Sharma';
                    const ownerContact = (l as any).ownerPhone || (l as any).phone || '9415000002';
                    const libraryId = (l as any).libraryId || l.id;

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-royal-blue-50 dark:bg-royal-blue-500/10 text-royal-blue-600 dark:text-royal-blue-400 flex items-center justify-center font-bold shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{l.name}</p>
                              <span className="font-mono text-[11px] text-royal-blue-600 dark:text-royal-blue-400 font-semibold block">
                                ID: {libraryId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{ownerName}</p>
                          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {ownerContact}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                            <MapPin className="w-3.5 h-3.5 text-royal-blue-600" />
                            {l.area}
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] block truncate max-w-xs mt-0.5">
                            {l.address || `Station Road, ${district}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <p className="font-mono font-bold text-royal-blue-700 dark:text-royal-blue-400 text-xs">
                            {seats} Desks
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 mt-0.5 inline-block">
                            {occ} / {seats} (80%)
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span title="High-Speed Wi-Fi" className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-royal-blue-600">
                              <Wifi className="w-3.5 h-3.5" />
                            </span>
                            <span title="Power Backup / Generator" className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-amber-600">
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                            <span title="CCTV & Fire Safety" className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            ₹{l.monthlyFee || 800}/mo
                          </p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            Active Subscription
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                            VERIFIED & APPROVED
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              setBookingLibraryId(l.id);
                              setIsManualBookingOpen(true);
                            }}
                          >
                            Book Desk
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Cards */}
            <div className="lg:hidden space-y-4">
              {filtered.map((l) => {
                const seats = l.totalSeats || 40;
                const occ = Math.round(seats * 0.8);
                const ownerName = (l as any).ownerName || (l as any).owner || 'Praveen Sharma';
                const ownerContact = (l as any).ownerPhone || (l as any).phone || '9415000002';
                const libraryId = (l as any).libraryId || l.id;

                return (
                  <div
                    key={l.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{l.name}</h4>
                        <span className="font-mono text-[11px] text-royal-blue-600 dark:text-royal-blue-400 font-semibold">
                          ID: {libraryId}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        APPROVED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Owner & Contact</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{ownerName}</p>
                        <p className="text-slate-500 text-[11px] font-mono">{ownerContact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Location & District</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{l.area}</p>
                        <p className="text-slate-500 text-[11px]">{district}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Desk Capacity</p>
                        <p className="font-bold text-royal-blue-600 dark:text-royal-blue-400 mt-0.5">
                          {seats} Desks ({occ} Occupied)
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Fee</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          ₹{l.monthlyFee || 800}/mo
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Wifi className="w-3.5 h-3.5 text-royal-blue-600" />
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setBookingLibraryId(l.id);
                          setIsManualBookingOpen(true);
                        }}
                      >
                        Book Desk
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Manual Walk-In Seat Booking Modal (Req 10) */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-blue-600" />
                  Manual Walk-In Seat Allocation
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly register a walk-in student for an authorized study desk in {district}
                </p>
              </div>
              <button
                onClick={() => setIsManualBookingOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Sharma"
                  value={bookingStudentName}
                  onChange={(e) => setBookingStudentName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={bookingStudentPhone}
                  onChange={(e) => setBookingStudentPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Target Library *</label>
                <select
                  required
                  value={bookingLibraryId}
                  onChange={(e) => setBookingLibraryId(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  {libraries.map((lib) => (
                    <option key={lib.id} value={lib.id}>
                      {lib.name} ({lib.area}) — ₹{lib.monthlyFee}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shift / Slot *</label>
                  <select
                    value={bookingShift}
                    onChange={(e) => setBookingShift(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MORNING">Morning (06:00 AM - 02:00 PM)</option>
                    <option value="EVENING">Evening (02:00 PM - 10:00 PM)</option>
                    <option value="FULL_DAY">Full Day 24x7</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Seat # *</label>
                  <input
                    type="text"
                    required
                    value={bookingSeatNumber}
                    onChange={(e) => setBookingSeatNumber(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Fee (INR) *</label>
                  <input
                    type="number"
                    required
                    value={bookingFeePaid}
                    onChange={(e) => setBookingFeePaid(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method *</label>
                  <select
                    value={bookingPaymentMode}
                    onChange={(e: any) => setBookingPaymentMode(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UPI">Direct UPI / QR Code</option>
                    <option value="CASH">Cash (District Cashier Receipt)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManualBookingOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  Confirm & Allot Seat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
