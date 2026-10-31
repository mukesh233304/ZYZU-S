import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { Shield, Sparkles, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';

export const DevRoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; name: string; path: string; color: string; userId?: string }[] = [
    { role: 'STUDENT', label: 'Student', name: 'Aryan Singh', path: '/student/dashboard', color: 'bg-blue-500', userId: 'usr-student-aryan' },
    { role: 'TEACHER', label: 'Teacher', name: 'Dr. Rajesh Sharma', path: '/teacher/dashboard', color: 'bg-emerald-500', userId: 'usr-teacher-rajesh' },
    { role: 'LIBRARY_OWNER', label: 'Library Owner', name: 'Suresh Chandra Yadav', path: '/library-owner/dashboard', color: 'bg-amber-500', userId: 'usr-lib-suresh' },
    { role: 'DISTRICT_ADMIN', label: 'District Admin', name: 'Manoj Kumar Rai (Ghazipur)', path: '/district-admin/dashboard', color: 'bg-purple-500', userId: 'usr-admin-ghazipur' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', name: 'Platform Admin', path: '/super-admin/dashboard', color: 'bg-rose-500', userId: 'usr-super-admin' },
    { role: 'STUDY_MATERIAL_OPERATOR', label: 'Operator', name: 'Sunita Verma', path: '/operator/dashboard', color: 'bg-teal-500', userId: 'usr-operator-sunita' },
  ];

  const handleSelect = async (r: typeof roles[0]) => {
    setIsOpen(false);
    navigate(r.path, { replace: true });
    await switchRole(r.role, r.userId);
  };

  return (
    <aside aria-label="Developer Preview & Role Switcher Dock" className="fixed bottom-4 left-4 z-50">
      <div className="rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-md overflow-hidden text-xs">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-950 font-medium transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Role Switcher:</span>
          <span className="font-bold text-brand-700">{user?.role || 'Guest'}</span>
          {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronUp className="w-3 h-3 text-slate-500" />}
        </button>

        {isOpen && (
          <div className="p-2 border-t border-slate-200 space-y-1 w-64 max-h-72 overflow-y-auto">
            <p className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Switch Test Account
            </p>
            {roles.map((r) => {
              const currentRole = (user?.role || '').toUpperCase();
              const isCurrent = currentRole === r.role.toUpperCase() || (currentRole === 'LIBRARY_STUDENT' && r.role === 'STUDENT');
              return (
                <button
                  key={`${r.role}-${r.path}`}
                  onClick={() => handleSelect(r)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-50 text-brand-800 border border-brand-200 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.color}`} />
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{r.label}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{r.name}</p>
                    </div>
                  </div>
                  {isCurrent && <UserCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
