import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  UserPlus, 
  AlertCircle,
  FileCheck,
  Send,
  X
} from 'lucide-react';
import { 
  locationDemandService, 
  LibraryDemandRecord, 
  TeacherDemandRecord, 
  LibraryDemandStatus, 
  TeacherDemandStatus 
} from '../../services/locationDemandService';
import { useToast } from '../../context/ToastContext';

interface UnservedDemandManagerProps {
  districtName: string;
}

export const UnservedDemandManager: React.FC<UnservedDemandManagerProps> = ({ districtName }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'LIBRARIES' | 'TEACHERS'>('LIBRARIES');
  const [libraryDemands, setLibraryDemands] = useState<LibraryDemandRecord[]>([]);
  const [teacherDemands, setTeacherDemands] = useState<TeacherDemandRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected detail modal
  const [selectedLibRecord, setSelectedLibRecord] = useState<LibraryDemandRecord | null>(null);
  const [selectedTchRecord, setSelectedTchRecord] = useState<TeacherDemandRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showContacts, setShowContacts] = useState(false);

  const loadData = () => {
    const libs = locationDemandService.getLibraryDemands(districtName);
    const tchs = locationDemandService.getTeacherDemands(districtName);
    setLibraryDemands(libs);
    setTeacherDemands(tchs);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = locationDemandService.subscribe(loadData);
    return () => unsubscribe();
  }, [districtName]);

  const handleUpdateLibStatus = (status: LibraryDemandStatus) => {
    if (!selectedLibRecord) return;
    const success = locationDemandService.updateLibraryDemandStatus(selectedLibRecord.id, status, adminNotes || selectedLibRecord.adminNotes);
    if (success) {
      addToast(`Library demand status updated to ${status}`, 'success');
      loadData();
      setSelectedLibRecord(prev => prev ? { ...prev, status, adminNotes: adminNotes || prev.adminNotes } : null);
    }
  };

  const handleUpdateTchStatus = (status: TeacherDemandStatus) => {
    if (!selectedTchRecord) return;
    const success = locationDemandService.updateTeacherDemandStatus(selectedTchRecord.id, status, adminNotes || selectedTchRecord.adminNotes);
    if (success) {
      addToast(`Teacher demand status updated to ${status}`, 'success');
      loadData();
      setSelectedTchRecord(prev => prev ? { ...prev, status, adminNotes: adminNotes || prev.adminNotes } : null);
    }
  };

  const filteredLibs = libraryDemands.filter(d => 
    d.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTchs = teacherDemands.filter(d => 
    d.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLibStatusBadge = (status: LibraryDemandStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">NEW REQUEST</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">UNDER REVIEW</span>;
      case 'CONTACTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">CONTACTED</span>;
      case 'LIBRARY_IDENTIFIED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">HUB IDENTIFIED</span>;
      case 'ONBOARDING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">ONBOARDING</span>;
      case 'LISTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LISTED & LIVE</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">CLOSED</span>;
    }
  };

  const getTchStatusBadge = (status: TeacherDemandStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">NEW DEMAND</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">UNDER REVIEW</span>;
      case 'TEACHER_SEARCH':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">SEARCHING TUTOR</span>;
      case 'TEACHER_CONTACTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">TUTOR CONTACTED</span>;
      case 'ONBOARDING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">KYC ONBOARDING</span>;
      case 'FULFILLED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">FULFILLED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">CLOSED</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-brand-500/10 text-brand-600">
              <MapPin className="w-5 h-5" />
            </span>
            <h3 className="text-base font-black text-slate-900">
              Unserved Location Demand & Expansion Opportunities
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time student search signals for unlisted localities in <span className="font-semibold text-slate-700">{districtName}</span>
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('LIBRARIES'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'LIBRARIES'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Library Demand ({libraryDemands.length})
            </button>
            <button
              onClick={() => { setActiveTab('TEACHERS'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'TEACHERS'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Teacher Demand ({teacherDemands.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTab === 'LIBRARIES' ? 'localities or facilities' : 'classes, subjects or areas'}...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          Aggregated by privacy-preserving telemetry
        </div>
      </div>

      {/* Main Content Area */}
      <div className="overflow-x-auto">
        {activeTab === 'LIBRARIES' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Locality / Area</th>
                <th className="py-3 px-4 text-center">Search Vol</th>
                <th className="py-3 px-4 text-center">Unique Learners</th>
                <th className="py-3 px-4">Requested Facilities</th>
                <th className="py-3 px-4">First / Last Request</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLibs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No unserved library demand logged for this filter in {districtName}.
                  </td>
                </tr>
              ) : (
                filteredLibs.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      {rec.locality}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {rec.searchCount} searches
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">
                      {rec.uniqueUsers} users
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {rec.requestedFacilities.map((fac, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>First: {rec.firstRequestedDate}</div>
                      <div className="font-medium text-slate-700">Latest: {rec.lastRequestedDate}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getLibStatusBadge(rec.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedLibRecord(rec);
                          setAdminNotes(rec.adminNotes || '');
                          setShowContacts(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100 transition-colors"
                      >
                        Opportunity Desk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Locality / Area</th>
                <th className="py-3 px-4">Grade & Subject</th>
                <th className="py-3 px-4 text-center">Demand Vol</th>
                <th className="py-3 px-4 text-center">Unique Leads</th>
                <th className="py-3 px-4">First / Last Request</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTchs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No unserved teacher demand logged for this filter in {districtName}.
                  </td>
                </tr>
              ) : (
                filteredTchs.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      {rec.locality}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rec.classGrade}</div>
                      <div className="text-[11px] text-brand-600 font-medium">{rec.subject}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {rec.searchCount} reqs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">
                      {rec.uniqueDemand} learners
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>First: {rec.firstRequestedDate}</div>
                      <div className="font-medium text-slate-700">Latest: {rec.lastRequestedDate}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getTchStatusBadge(rec.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTchRecord(rec);
                          setAdminNotes(rec.adminNotes || '');
                          setShowContacts(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100 transition-colors"
                      >
                        Opportunity Desk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: LIBRARY OPPORTUNITY DESK (Req 13)                         */}
      {/* ============================================================== */}
      {selectedLibRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Library Location Opportunity</h4>
                  <p className="text-xs text-slate-500">{selectedLibRecord.locality}, {selectedLibRecord.district}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLibRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opportunity Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Student Demand</span>
                <p className="text-base font-black text-slate-900">{selectedLibRecord.searchCount} Searches</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Unique Learners</span>
                <p className="text-base font-black text-brand-600">{selectedLibRecord.uniqueUsers} Users</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <div className="mt-0.5">{getLibStatusBadge(selectedLibRecord.status)}</div>
              </div>
            </div>

            {/* Requested Facilities */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Required Facilities Demanded by Students:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLibRecord.requestedFacilities.map((fac, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                    ✓ {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                District Operational Notes & Onboarding Log
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log physical site inspection, owner contact details, power backup verification..."
                rows={3}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Privacy-Preserved Contact Section (Req 21) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Registered Learner Contact Inquiries ({selectedLibRecord.contacts?.length || 0})
                </div>
                <button
                  type="button"
                  onClick={() => setShowContacts(!showContacts)}
                  className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                >
                  {showContacts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showContacts ? 'Hide Details' : 'Unlock Contacts (Audited)'}
                </button>
              </div>
              {showContacts && (
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  {selectedLibRecord.contacts && selectedLibRecord.contacts.length > 0 ? (
                    selectedLibRecord.contacts.map((c, i) => (
                      <div key={i} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{c.name || 'Anonymous Student'}</span>
                          <span className="text-[10px] text-slate-400 block">{c.createdAt?.split('T')[0]}</span>
                        </div>
                        <div className="text-right text-[11px] font-mono">
                          {c.phone && <div>📞 {c.phone}</div>}
                          {c.email && <div>✉️ {c.email}</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-2">
                      No explicit phone/email saved; demand generated via anonymous location search hits.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Workflow Action Buttons (Req 13) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">District Admin Actions:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleUpdateLibStatus('CONTACTED')}
                  className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 text-center"
                >
                  Contact Library
                </button>
                <button
                  onClick={() => handleUpdateLibStatus('LIBRARY_IDENTIFIED')}
                  className="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 text-center"
                >
                  Hub Identified
                </button>
                <button
                  onClick={() => handleUpdateLibStatus('ONBOARDING')}
                  className="p-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-xs border border-cyan-200 text-center"
                >
                  Mark Onboarding
                </button>
                <button
                  onClick={() => handleUpdateLibStatus('LISTED')}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 text-center"
                >
                  Mark Listed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TEACHER DEMAND OPPORTUNITY DESK (Req 20)                 */}
      {/* ============================================================== */}
      {selectedTchRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Teacher Demand Opportunity</h4>
                  <p className="text-xs text-slate-500">{selectedTchRecord.locality}, {selectedTchRecord.district}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTchRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opportunity Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Class & Subject</span>
                <p className="text-sm font-black text-slate-900">{selectedTchRecord.classGrade}</p>
                <span className="text-xs text-brand-600 font-bold">{selectedTchRecord.subject}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Requests Logged</span>
                <p className="text-base font-black text-brand-600">{selectedTchRecord.searchCount} Hits</p>
                <span className="text-[11px] text-slate-500 font-medium">{selectedTchRecord.uniqueDemand} unique leads</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <div className="mt-0.5">{getTchStatusBadge(selectedTchRecord.status)}</div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                District Admin Notes & Candidate Match History
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log candidate outreach, qualification matching, verification status..."
                rows={3}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Privacy-Preserved Contact Section (Req 21) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Parent/Student Inquiry Leads ({selectedTchRecord.contacts?.length || 0})
                </div>
                <button
                  type="button"
                  onClick={() => setShowContacts(!showContacts)}
                  className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                >
                  {showContacts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showContacts ? 'Hide Details' : 'Unlock Leads (Audited)'}
                </button>
              </div>
              {showContacts && (
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  {selectedTchRecord.contacts && selectedTchRecord.contacts.length > 0 ? (
                    selectedTchRecord.contacts.map((c, i) => (
                      <div key={i} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{c.name || 'Anonymous Parent/Learner'}</span>
                          <span className="text-[10px] text-slate-400 block">{c.createdAt?.split('T')[0]}</span>
                        </div>
                        <div className="text-right text-[11px] font-mono">
                          {c.phone && <div>📞 {c.phone}</div>}
                          {c.email && <div>✉️ {c.email}</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-2">
                      No explicit phone/email registered; demand captured from live search attempts.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Workflow Action Buttons (Req 20) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">District Admin Actions:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleUpdateTchStatus('TEACHER_SEARCH')}
                  className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 text-center"
                >
                  Search Tutor
                </button>
                <button
                  onClick={() => handleUpdateTchStatus('TEACHER_CONTACTED')}
                  className="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 text-center"
                >
                  Contact Tutor
                </button>
                <button
                  onClick={() => handleUpdateTchStatus('ONBOARDING')}
                  className="p-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-xs border border-cyan-200 text-center"
                >
                  Mark Onboarding
                </button>
                <button
                  onClick={() => handleUpdateTchStatus('FULFILLED')}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 text-center"
                >
                  Mark Fulfilled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
