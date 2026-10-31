import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, LogIn, UserPlus, GraduationCap, BookMarked, ShieldCheck, 
  CheckCircle2, Bell, Settings, LogOut, ArrowRight, Clock, 
  Sparkles, Phone, Mail, MapPin, Building2, CalendarCheck, 
  Award, FileText, LayoutDashboard, ChevronRight, HelpCircle
} from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role?.toUpperCase()) {
      case 'STUDENT':
      case 'LIBRARY_STUDENT':
        return '/student/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'LIBRARY_OWNER':
        return '/library-owner/dashboard';
      case 'DISTRICT_ADMIN':
        return '/district-admin/dashboard';
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      case 'OPERATOR':
      case 'STUDY_MATERIAL_OPERATOR':
        return '/operator/dashboard';
      default:
        return '/';
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out of ZYZU'S?")) {
      setLoggingOut(true);
      try {
        await logout();
        navigate('/');
      } finally {
        setLoggingOut(false);
      }
    }
  };

  // =========================================================================
  // VIEW A: LOGGED IN USER ACCOUNT HUB
  // =========================================================================
  if (isAuthenticated && user) {
    const roleUpper = (user.role || '').toUpperCase();
    const isStudent = roleUpper === 'STUDENT' || roleUpper === 'LIBRARY_STUDENT';
    const isTeacher = roleUpper === 'TEACHER';
    const isLibraryOwner = roleUpper === 'LIBRARY_OWNER';
    const isAdmin = roleUpper === 'SUPER_ADMIN' || roleUpper === 'DISTRICT_ADMIN';

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-4 sm:pt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* User Profile Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-500/10 via-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
              <div className="relative">
                <UserAvatar user={user} size="lg" className="ring-4 ring-brand-100 shadow-md" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active Account">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                    {roleUpper.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-xs text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </span>
                  {(user.mobile || user.phone) && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {user.mobile || user.phone}
                    </span>
                  )}
                  {(user.districtName || user.district) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {user.districtName || user.district}
                    </span>
                  )}
                </div>

                {/* Primary Portal Action */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md hover:shadow-brand-500/20 active:scale-95 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Role-Specific Quick Navigation Hub */}
          <div className="space-y-4 mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 px-1">
              Quick Shortcuts & Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isStudent && (
                <>
                  <Link
                    to="/student/bookings"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <BookMarked className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block group-hover:text-brand-600 transition-colors">My Bookings</strong>
                        <span className="text-[11px] text-slate-500">View active library seats & shifts</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/attendance/pass"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block group-hover:text-emerald-600 transition-colors">Digital Seat Pass</strong>
                        <span className="text-[11px] text-slate-500">QR attendance card & live shifts</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/student/mock-tests"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block group-hover:text-purple-600 transition-colors">Mock Test Center</strong>
                        <span className="text-[11px] text-slate-500">Attempt UPSSSC, SSC, Railway drills</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/student/study-material"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block group-hover:text-amber-600 transition-colors">Study Material Vault</strong>
                        <span className="text-[11px] text-slate-500">Verified notes & solved PYQs</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}

              {isTeacher && (
                <>
                  <Link
                    to="/teacher/schedule"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">Teaching Schedule</strong>
                        <span className="text-[11px] text-slate-500">Manage daily sessions & slots</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/teacher/students"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">My Students</strong>
                        <span className="text-[11px] text-slate-500">Enrolled home tuition pupils</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </>
              )}

              {isLibraryOwner && (
                <>
                  <Link
                    to="/library-owner/seats"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">Seats & Shifts</strong>
                        <span className="text-[11px] text-slate-500">Live hall desk occupancy</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/library-owner/bookings"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BookMarked className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">Student Bookings</strong>
                        <span className="text-[11px] text-slate-500">Active membership records</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to={getDashboardPath()}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group sm:col-span-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">Administrative Console</strong>
                      <span className="text-[11px] text-slate-500">Access authorization & operational tools</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}
            </div>
          </div>

          {/* General Account Settings & Logout */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 px-1 mb-3">
              Account Management
            </h2>

            <div className="space-y-1">
              <Link
                to={isStudent ? '/student/settings' : isTeacher ? '/teacher/settings' : isLibraryOwner ? '/library-owner/settings' : '#'}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">Profile & Password Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to={isStudent ? '/student/notifications' : isTeacher ? '/teacher/notifications' : isLibraryOwner ? '/library-owner/notifications' : '#'}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">Notification Preferences</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/contact"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">Help Center & Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold">{loggingOut ? 'Signing out...' : "Sign Out of ZYZU'S"}</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: VISITOR / UNREGISTERED ACCOUNT SCREEN
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-6 sm:pt-10">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center relative overflow-hidden mb-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <User className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            ZYZU'S Account
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Sign In or Create Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Access verified home tutors, reserve digital library seats, attempt government exam test series, and track your learning progress.
          </p>

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              state={{ from: location }}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Existing Account</span>
            </Link>

            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="w-full py-3 px-6 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-brand-600" />
              <span>Create New Account (Free)</span>
            </button>
          </div>

          {/* Role Choice Drawer / Modal */}
          {showRoleSelector && (
            <div className="mt-5 pt-5 border-t border-slate-100 text-left space-y-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block px-1 mb-2">
                Choose your registration profile:
              </span>

              <Link
                to="/register/student"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-50/60 border border-slate-200 hover:border-brand-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-brand-700">Student or Parent</strong>
                    <span className="text-[10px] text-slate-500">Find tutors, book library seats & practice tests</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/register/teacher"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Home Tutor / Educator</strong>
                    <span className="text-[10px] text-slate-500">Get student leads & earn transparent tuition fees</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/register/library"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700">Digital Library Owner</strong>
                    <span className="text-[10px] text-slate-500">List your reading hall & automate shift bookings</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Value Proposition Highlights */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Why Join ZYZU'S?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Verified Local Tutors</strong>
                <span className="text-[11px] text-slate-600">Background-checked educators with free demo classes.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Instant Desk Booking</strong>
                <span className="text-[11px] text-slate-600">Air-conditioned study halls with live seat status.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Government Exam Drills</strong>
                <span className="text-[11px] text-slate-600">All India Rank percentiles & mistake diagnostics.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Digital QR Passes</strong>
                <span className="text-[11px] text-slate-600">Paperless smart check-ins and verified student IDs.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Administrator Login Links */}
        <div className="text-center text-xs text-slate-600 pb-4">
          <span>Are you a district coordinator or administrator? </span>
          <Link to="/district-admin/login" className="text-brand-600 font-bold hover:underline">
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
