import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  MapPin, 
  Users, 
  GraduationCap, 
  Building, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  FileText, 
  ShieldCheck, 
  Settings, 
  X, 
  ArrowRight, 
  CornerDownLeft 
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: React.ReactNode;
  keywords: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    { id: 'c-dash', title: 'Open Pan-India Command Console', category: 'Overview', path: '/super-admin/dashboard', icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />, keywords: ['dashboard', 'home', 'overview', 'kpi'] },
    { id: 'c-profile', title: 'Super Admin Personal Profile & Security', category: 'Profile', path: '/super-admin/profile', icon: <ShieldCheck className="w-4 h-4 text-purple-400" />, keywords: ['profile', 'avatar', 'photo', 'password', 'security'] },
    { id: 'c-gmv', title: 'Platform GMV Advanced Analytics & Drill-down', category: 'Analytics', path: '/super-admin/analytics/gmv', icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, keywords: ['gmv', 'revenue', 'growth', 'sales', 'turnover'] },
    { id: 'c-rev', title: 'Revenue Command Center & Payment Statement', category: 'Analytics', path: '/super-admin/analytics/revenue', icon: <DollarSign className="w-4 h-4 text-amber-400" />, keywords: ['revenue', 'commission', 'profit', 'expenses', 'take rate'] },
    { id: 'c-pay', title: 'Live Payment Ledger & Settlement Audit', category: 'Finance', path: '/super-admin/payments', icon: <DollarSign className="w-4 h-4 text-indigo-400" />, keywords: ['payments', 'ledger', 'settlements', 'transactions', 'invoices'] },
    { id: 'c-att', title: 'Overall Attendance Command Center', category: 'Analytics', path: '/super-admin/analytics/attendance', icon: <FileText className="w-4 h-4 text-cyan-400" />, keywords: ['attendance', 'present', 'absent', 'sessions'] },
    { id: 'c-loc', title: 'Location Master (Pan-India Hierarchy)', category: 'Geography', path: '/super-admin/locations', icon: <MapPin className="w-4 h-4 text-rose-400" />, keywords: ['location', 'state', 'district', 'locality', 'village'] },
    { id: 'c-dist', title: 'Districts Registry & Governance', category: 'Geography', path: '/super-admin/districts', icon: <MapPin className="w-4 h-4 text-orange-400" />, keywords: ['districts', 'territory', 'admin'] },
    { id: 'c-admins', title: 'District Administrators & Salary Payouts', category: 'Administration', path: '/super-admin/district-admins', icon: <ShieldCheck className="w-4 h-4 text-blue-400" />, keywords: ['admins', 'district admin', 'salary', 'appoint', 'id card'] },
    { id: 'c-dcmd', title: 'Direct District Control (Override Console)', category: 'Administration', path: '/super-admin/district-command', icon: <ShieldCheck className="w-4 h-4 text-red-400" />, keywords: ['override', 'direct control', 'command', 'step in'] },
    { id: 'c-users', title: 'Master User Account Registry', category: 'Users', path: '/super-admin/users', icon: <Users className="w-4 h-4 text-teal-400" />, keywords: ['users', 'directory', 'accounts', 'correction'] },
    { id: 'c-stud', title: 'Active Tuition Students Registry', category: 'Users', path: '/super-admin/students', icon: <Users className="w-4 h-4 text-sky-400" />, keywords: ['students', 'tuition students', 'learners'] },
    { id: 'c-libstud', title: 'Active Library Students Registry', category: 'Users', path: '/super-admin/library-students', icon: <Building className="w-4 h-4 text-violet-400" />, keywords: ['library students', 'seats', 'counter bookings'] },
    { id: 'c-teach', title: 'Verified Educators Directory', category: 'Users', path: '/super-admin/teachers', icon: <GraduationCap className="w-4 h-4 text-emerald-400" />, keywords: ['teachers', 'tutors', 'educators', 'verification'] },
    { id: 'c-libs', title: 'Self-Study Libraries & Certificates', category: 'Users', path: '/super-admin/libraries', icon: <Building className="w-4 h-4 text-amber-400" />, keywords: ['libraries', 'study spaces', 'certificates', 'desks'] },
    { id: 'c-comm', title: 'Commission & Policy Management', category: 'Policies', path: '/super-admin/policies/commission', icon: <Percent className="w-4 h-4 text-pink-400" />, keywords: ['commission', 'override', 'take rate', 'rules'] },
    { id: 'c-offer', title: 'Offer Management & Concessions', category: 'Policies', path: '/super-admin/policies/offers', icon: <Percent className="w-4 h-4 text-yellow-400" />, keywords: ['offers', 'discounts', 'coupons', 'promotions'] },
    { id: 'c-rep', title: 'State & District Intelligence Reports', category: 'Reports', path: '/super-admin/reports', icon: <FileText className="w-4 h-4 text-blue-400" />, keywords: ['reports', 'downloads', 'excel', 'pdf', 'state report'] },
    { id: 'c-audit', title: 'Immutable Enterprise Audit Trail', category: 'Audit', path: '/super-admin/audit-logs', icon: <ShieldCheck className="w-4 h-4 text-purple-400" />, keywords: ['audit', 'logs', 'compliance', 'trail', 'security'] },
    { id: 'c-sett', title: 'Futuristic Enterprise System Settings', category: 'Settings', path: '/super-admin/settings', icon: <Settings className="w-4 h-4 text-slate-400" />, keywords: ['settings', 'platform', 'security', 'branding'] },
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.some(k => k.includes(q))
    );
  });

  const handleSelect = (cmd: CommandItem) => {
    navigate(cmd.path);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle if already handled outside
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIdx]) {
        e.preventDefault();
        handleSelect(filtered[selectedIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIdx]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            autoFocus
            placeholder="Type a command, district, user, or report (e.g., 'GMV', 'Saidpur', 'Commission')..."
            className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching enterprise command found for "<strong className="text-white">{query}</strong>"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'bg-blue-600/20 text-white border border-blue-500/40' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-white">{cmd.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{cmd.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-slate-400">
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">{cmd.path}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> to close
            </span>
          </div>
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            ZYZU'S Command Center
          </div>
        </div>
      </div>
    </div>
  );
};
