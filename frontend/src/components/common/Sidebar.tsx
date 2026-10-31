import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  GraduationCap, LayoutDashboard, UserCheck, BookOpen, Clock, 
  CalendarCheck, Receipt, BookMarked, Bell, HelpCircle, Settings, 
  LogOut, Users, Armchair, Shield, FileText, CheckSquare, DollarSign,
  Building, UserPlus, Sliders, MapPin, Search, ChevronRight, User, CreditCard, Globe, Percent,
  TrendingUp, Activity, Landmark, Sparkles, ShoppingBag, Tag, ShieldCheck,
  FileSpreadsheet, X
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: number;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  let sections: NavSection[] = [];

  const userRole = (user.role || '').toUpperCase();

  switch (userRole) {
    case 'STUDENT':
    case 'LIBRARY_STUDENT':
      sections = [
        {
          title: 'Main Menu',
          items: [
            { label: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Study Material Vault', path: '/student/study-material', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'My Profile', path: '/student/profile', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'My Tutor', path: '/student/tutor', icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'Tutor Requests', path: '/student/tutor-requests', icon: <Clock className="w-4 h-4" /> },
            { label: 'Attendance', path: '/student/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
            { label: 'Fees & Invoices', path: '/student/fees', icon: <Receipt className="w-4 h-4" /> },
            { label: 'My Documents', path: '/student/documents', icon: <FileText className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Academic Intelligence & Mocks',
          items: [
            { label: 'My Growth Intelligence', path: '/student/growth', icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'Govt Exam Mock Tests', path: '/student/mock-tests', icon: <Landmark className="w-4 h-4" /> },
            { label: 'Personal Mistake Book', path: '/student/mistakes', icon: <BookMarked className="w-4 h-4" /> },
            { label: 'Digital Learning Store', path: '/student/store', icon: <ShoppingBag className="w-4 h-4" /> },
            { label: 'My Subscriptions', path: '/student/subscriptions', icon: <Receipt className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Services & Spaces',
          items: [
            { label: 'Find Home Tutor', path: '/find-tutor', icon: <Search className="w-4 h-4" /> },
            { label: 'Find Library', path: '/find-library', icon: <Building className="w-4 h-4" /> },
            { label: 'My Library Bookings', path: '/student/bookings', icon: <Armchair className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Support & Help',
          items: [
            { label: 'Notifications', path: '/student/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
            { label: 'Help Desk', path: '/student/support', icon: <HelpCircle className="w-4 h-4" /> },
            { label: 'Settings', path: '/student/settings', icon: <Settings className="w-4 h-4" /> },
          ]
        }
      ];
      break;

    case 'TEACHER':
      sections = [
        {
          title: 'Teacher Console',
          items: [
            { label: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Teacher Profile', path: '/teacher/profile', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'Verification Status', path: '/teacher/verification', icon: <Shield className="w-4 h-4" /> },
            { label: 'Allotted Students', path: '/teacher/students', icon: <Users className="w-4 h-4" /> },
            { label: 'Student Test Records', path: '/teacher/performance', icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'Weekly Schedule', path: '/teacher/schedule', icon: <Clock className="w-4 h-4" /> },
            { label: 'Log Attendance', path: '/teacher/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
            { label: 'Revenue & Payouts', path: '/teacher/revenue', icon: <DollarSign className="w-4 h-4" /> },
            { label: 'My Documents', path: '/teacher/documents', icon: <FileText className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Support & Settings',
          items: [
            { label: 'Notifications', path: '/teacher/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
            { label: 'Help Desk', path: '/teacher/support', icon: <HelpCircle className="w-4 h-4" /> },
            { label: 'Settings', path: '/teacher/settings', icon: <Settings className="w-4 h-4" /> },
          ]
        }
      ];
      break;

    case 'LIBRARY_OWNER':
      sections = [
        {
          title: 'Library Operations',
          items: [
            { label: 'Dashboard', path: '/library-owner/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Owner Profile', path: '/library-owner/profile', icon: <User className="w-4 h-4" /> },
            { label: 'Library Listing', path: '/library-owner/library', icon: <Building className="w-4 h-4" /> },
            { label: 'Enrolled Students', path: '/library-owner/students', icon: <Users className="w-4 h-4" /> },
            { label: 'Seat Management', path: '/library-owner/seats', icon: <Armchair className="w-4 h-4" /> },
            { label: 'Shift Timings', path: '/library-owner/shifts', icon: <Clock className="w-4 h-4" /> },
            { label: 'Booking Requests', path: '/library-owner/bookings', icon: <BookMarked className="w-4 h-4" /> },
            { label: 'Daily Attendance', path: '/library-owner/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
            { label: 'Fee Management', path: '/library-owner/fees', icon: <Receipt className="w-4 h-4" /> },
            { label: 'Listing Subscription', path: '/library-owner/subscription', icon: <CreditCard className="w-4 h-4" /> },
            { label: 'Revenue & Analytics', path: '/library-owner/revenue', icon: <DollarSign className="w-4 h-4" /> },
            { label: 'Monthly Reports', path: '/library-owner/reports', icon: <FileText className="w-4 h-4" /> },
            { label: 'Documents & Receipts', path: '/library-owner/documents', icon: <FileText className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Support & Settings',
          items: [
            { label: 'Profile & Settings', path: '/library-owner/profile', icon: <Settings className="w-4 h-4" /> },
            { label: 'Notifications', path: '/library-owner/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
            { label: 'Support Tickets', path: '/library-owner/support', icon: <HelpCircle className="w-4 h-4" /> },
          ]
        }
      ];
      break;

    case 'DISTRICT_ADMIN':
      sections = [
        {
          title: 'District Authority',
          items: [
            { label: 'District Overview', path: '/district-admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Admin Profile & Photo', path: '/district-admin/profile', icon: <User className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Student & Learner Desk',
          items: [
            { label: 'Student Directory', path: '/district-admin/students', icon: <Users className="w-4 h-4" /> },
            { label: 'Study Materials & Quotas', path: '/district-admin/study-material', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'Home Tuition Desk', path: '/district-admin/home-tuition', icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'Tutor Requests', path: '/district-admin/tutor-requests', icon: <Clock className="w-4 h-4" /> },
            { label: 'Teacher Allotments', path: '/district-admin/assignments', icon: <Sliders className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Educator & Facility Operations',
          items: [
            { label: 'Teacher Management', path: '/district-admin/teachers', icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'Teacher Approvals', path: '/district-admin/teacher-approvals', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'Library Management', path: '/district-admin/libraries', icon: <Armchair className="w-4 h-4" /> },
            { label: 'Library Approvals', path: '/district-admin/library-approvals', icon: <Building className="w-4 h-4" /> },
            { label: 'Attendance Tracker', path: '/district-admin/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Finance & Payouts',
          items: [
            { label: 'Revenue & Net Profit', path: '/district-admin/revenue', icon: <DollarSign className="w-4 h-4" /> },
            { label: 'Commission & Offers', path: '/district-admin/policies', icon: <Percent className="w-4 h-4" /> },
            { label: 'District Expenses', path: '/district-admin/expenses', icon: <Receipt className="w-4 h-4" /> },
            { label: 'Disbursements & Payouts', path: '/district-admin/payments', icon: <CreditCard className="w-4 h-4" /> },
            { label: 'Fee Monitoring', path: '/district-admin/fees', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Official Documents', path: '/district-admin/documents', icon: <FileText className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Intelligence & Desk',
          items: [
            { label: 'Academic Intelligence', path: '/district-admin/academic-intelligence', icon: <Activity className="w-4 h-4" /> },
            { label: 'District Reports', path: '/district-admin/reports', icon: <FileText className="w-4 h-4" /> },
            { label: 'Circulars & Alerts', path: '/district-admin/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
            { label: 'Super Admin Helpline', path: '/district-admin/super-admin-comm', icon: <Shield className="w-4 h-4" /> },
            { label: 'Support & Complaints', path: '/district-admin/support', icon: <HelpCircle className="w-4 h-4" /> },
          ]
        }
      ];
      break;

    case 'STUDY_MATERIAL_OPERATOR':
      sections = [
        {
          title: 'Operator Console',
          items: [
            { label: 'Command Center', path: '/operator/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'My Operator Profile', path: '/operator/profile', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'Study Material Vault', path: '/operator/study-material', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'PYQ Exam Paper Studio', path: '/operator/pyq-studio', icon: <FileSpreadsheet className="w-4 h-4 text-cyan-500" /> },
            { label: 'Mock Test Wizard', path: '/operator/mock-tests', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Master Question Bank', path: '/operator/question-bank', icon: <FileText className="w-4 h-4" /> },
            { label: 'Exam Catalog & Syllabus', path: '/operator/exams', icon: <Landmark className="w-4 h-4" /> },
          ]
        },
        {
          title: "ZYZU'S AI Copilot",
          items: [
            { label: 'AI Exam Assistant', path: '/operator/ai-assistant', icon: <Sparkles className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Accountability & Reach',
          items: [
            { label: 'Content Analytics (Reach)', path: '/operator/analytics', icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'My Activity Audit Trail', path: '/operator/audit-trail', icon: <Clock className="w-4 h-4" /> },
          ]
        }
      ];
      break;

    case 'SUPER_ADMIN':
      sections = [
        {
          title: 'Command & Profile',
          items: [
            { label: 'Command Console', path: '/super-admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Super Admin Profile', path: '/super-admin/profile', icon: <User className="w-4 h-4" /> },
            { label: 'Direct District Command', path: '/super-admin/district-command', icon: <Shield className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Pan-India Analytics',
          items: [
            { label: 'Finance Command Center', path: '/super-admin/finance', icon: <Landmark className="w-4 h-4" /> },
            { label: 'Global Document OS', path: '/super-admin/documents', icon: <FileText className="w-4 h-4" /> },
            { label: 'Academic Intelligence', path: '/super-admin/academic-intelligence', icon: <Activity className="w-4 h-4" /> },
            { label: 'GMV Analytics', path: '/super-admin/analytics/gmv', icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'Revenue Statement & P&L', path: '/super-admin/analytics/revenue', icon: <DollarSign className="w-4 h-4" /> },
            { label: 'Attendance Integrity', path: '/super-admin/analytics/attendance', icon: <Activity className="w-4 h-4" /> },
            { label: 'Payment Ledger', path: '/super-admin/payments', icon: <Receipt className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Operator & Content Command',
          items: [
            { label: 'Exam & Content Operators', path: '/super-admin/operators', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'Content Approval Queue', path: '/super-admin/content-approvals', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Study Material BI', path: '/super-admin/analytics/study-material', icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'Mock Test BI & Passes', path: '/super-admin/analytics/mock-tests', icon: <Landmark className="w-4 h-4" /> },
            { label: 'Academic Business OS', path: '/super-admin/academic-business', icon: <ShoppingBag className="w-4 h-4" /> },
            { label: 'Priority Pricing Rules', path: '/super-admin/pricing-rules', icon: <Tag className="w-4 h-4" /> },
            { label: 'Exam Eligibility Rules', path: '/super-admin/eligibility-rules', icon: <ShieldCheck className="w-4 h-4" /> },
            { label: 'Operator AI Monitoring', path: '/super-admin/operators/monitoring', icon: <Activity className="w-4 h-4" /> },
          ]
        },
        {
          title: 'Territory & People Governance',
          items: [
            { label: 'Location Master (Pan-India)', path: '/super-admin/locations', icon: <Globe className="w-4 h-4" /> },
            { label: 'District Coordinators', path: '/super-admin/district-admins', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'Master Users Directory', path: '/super-admin/users', icon: <Users className="w-4 h-4" /> },
            { label: 'Home Tuition Students', path: '/super-admin/students', icon: <Users className="w-4 h-4" /> },
            { label: 'Library Students Registry', path: '/super-admin/library-students', icon: <Armchair className="w-4 h-4" /> },
            { label: 'Verified Educators', path: '/super-admin/teachers', icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'Partner Study Libraries', path: '/super-admin/libraries', icon: <Building className="w-4 h-4" /> },
            { label: 'Statewide Bookings Ledger', path: '/super-admin/bookings', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
          ]
        },
        {
          title: 'Policies & Audit Control',
          items: [
            { label: 'Security Center & 3FA', path: '/super-admin/security', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
            { label: 'Question Bank & AI Studio', path: '/super-admin/question-bank', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'Govt Exams & Mock Master', path: '/super-admin/exams', icon: <Landmark className="w-4 h-4" /> },
            { label: 'Study Material & Paid Vault', path: '/super-admin/study-material', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'Commission & Offers', path: '/super-admin/policies', icon: <Percent className="w-4 h-4" /> },
            { label: 'AI Notification & Offer Center', path: '/super-admin/ai-notifications', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
            { label: 'Intelligence Reports', path: '/super-admin/reports', icon: <FileText className="w-4 h-4" /> },
            { label: 'Immutable Audit Trail', path: '/super-admin/audit-logs', icon: <Shield className="w-4 h-4" /> },
            { label: 'Directives & Broadcasts', path: '/super-admin/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
            { label: 'Central Settings', path: '/super-admin/settings', icon: <Settings className="w-4 h-4" /> },
          ]
        }
      ];
      break;
  }

  const isDarkTheme = userRole === 'SUPER_ADMIN';

  return (
    <aside className={`w-64 flex flex-col h-full shrink-0 transition-colors ${
      isDarkTheme 
        ? 'bg-slate-950 border-r border-slate-800 text-slate-200 shadow-2xl' 
        : 'bg-white border-r border-slate-200 shadow-xs'
    }`}>
      {/* Sidebar Header with Brand */}
      <div className={`p-4 border-b flex items-center justify-between ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
        <NavLink to="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
          <BrandLogo variant="primary" theme={isDarkTheme ? 'dark' : 'light'} size="sm" />
        </NavLink>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg md:hidden transition-colors cursor-pointer ${
              isDarkTheme
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
            }`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Role Banner / District Tag */}
      <NavLink
        onClick={onCloseMobile}
        to={
          user.role === 'SUPER_ADMIN' || user.role === 'super_admin' ? '/super-admin/profile' :
          user.role === 'STUDY_MATERIAL_OPERATOR' || user.role === 'study_material_operator' ? '/operator/profile' :
          user.role === 'DISTRICT_ADMIN' || user.role === 'district_admin' ? '/district-admin/profile' :
          user.role === 'STUDENT' || user.role === 'student' ? '/student/profile' :
          user.role === 'LIBRARY_OWNER' || user.role === 'library_owner' ? '/library-owner/profile' :
          user.role === 'TEACHER' || user.role === 'teacher' ? '/teacher/profile' :
          '#'
        }
        className={`p-3.5 mx-3 mt-3 rounded-xl border flex items-center gap-3 transition-colors group ${
          isDarkTheme 
            ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-brand-500/40' 
            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
        }`}
      >
        <UserAvatar user={user} size="md" showBorder />
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black truncate transition-colors ${
            isDarkTheme ? 'text-white group-hover:text-brand-300' : 'text-slate-950 group-hover:text-brand-600'
          }`}>
            {user.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isDarkTheme ? 'text-brand-400' : 'text-brand-700'
            }`}>
              {user.role.replace('_', ' ')}
            </span>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className={`text-[10px] font-medium truncate ${
              isDarkTheme ? 'text-slate-300' : 'text-slate-600'
            }`}>{user.districtName}</span>
          </div>
        </div>
      </NavLink>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className={`px-3 text-[10px] font-black uppercase tracking-wider mb-2 ${
              isDarkTheme ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {section.title}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? isDarkTheme 
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold shadow-xs'
                        : 'bg-brand-50 text-brand-700 border border-brand-200 font-bold shadow-xs'
                      : isDarkTheme
                        ? 'text-slate-200 hover:text-white hover:bg-slate-900/80 font-medium'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isDarkTheme ? 'bg-brand-500 text-white' : 'bg-brand-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Logout & Footer */}
      <div className={`p-3 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            isDarkTheme 
              ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40' 
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
