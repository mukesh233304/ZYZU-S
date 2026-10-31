import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { BRAND_CONFIG } from '../../config/brand';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, Search, BookOpen, User, Menu, X, 
  ArrowRight, Shield, Bell, LogOut, ChevronDown, BookMarked, Users, MapPin, Phone,
  Sparkles, FileText, CheckCircle2, ChevronRight, Compass, ShieldCheck, Award
} from 'lucide-react';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';
import { ServiceRegistrationGateModal, ServiceGateTarget } from './ServiceRegistrationGateModal';
import { InAppNotificationCenterDrawer } from '../notifications/InAppNotificationCenterDrawer';
import { NotificationPreferencesModal } from '../notifications/NotificationPreferencesModal';
import { inAppNotificationService } from '../../services/inAppNotificationService';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  // Gate Modal State
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [activeGateService, setActiveGateService] = useState<ServiceGateTarget | null>(null);

  // AI In-App Notification & Offers Drawer State
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(inAppNotificationService.getUnreadCount(user?.id || 'guest-visitor'));
    };
    updateCount();
    const unsub = inAppNotificationService.subscribe(updateCount);
    return unsub;
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'TEACHER': return '/teacher/dashboard';
      case 'LIBRARY_OWNER': return '/library-owner/dashboard';
      case 'DISTRICT_ADMIN': return '/district-admin/dashboard';
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      case 'STUDY_MATERIAL_OPERATOR': return '/operator/dashboard';
      default: return '/';
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const focusPointServices: ServiceGateTarget[] = [
    {
      name: 'Find Home Tutor',
      description: 'Find verified home tutors for your class, subject and location.',
      path: '/find-tutor',
      roleHint: 'STUDENT',
      icon: <GraduationCap className="w-5 h-5 text-brand-600" />
    },
    {
      name: 'Find Libraries',
      description: "Discover ZYZU'S study libraries and premium self-study spaces.",
      path: '/find-library',
      roleHint: 'STUDENT',
      icon: <BookMarked className="w-5 h-5 text-amber-600" />
    },
    {
      name: 'Mock Tests',
      description: 'Prepare with exam-specific mock tests, test series and previous-year papers.',
      path: '/student/mock-tests',
      roleHint: 'STUDENT',
      icon: <FileText className="w-5 h-5 text-emerald-600" />
    },
    {
      name: 'Study Materials',
      description: 'Access academic and competitive-exam study materials.',
      path: '/student/study-material',
      roleHint: 'STUDENT',
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />
    },
    {
      name: 'Apply as a Teacher',
      description: "Register as a ZYZU'S teacher and connect with students.",
      path: '/register/teacher',
      roleHint: 'TEACHER',
      icon: <Users className="w-5 h-5 text-sky-600" />
    },
    {
      name: 'List Your Library',
      description: "Register your library and make it discoverable on ZYZU'S.",
      path: '/register/library-owner',
      roleHint: 'LIBRARY_OWNER',
      icon: <Award className="w-5 h-5 text-purple-600" />
    }
  ];

  const handleServiceClick = (service: ServiceGateTarget) => {
    setServicesDropdownOpen(false);
    setMobileMenuOpen(false);

    if (isAuthenticated) {
      navigate(service.path);
    } else {
      // Determine if service requires registration gate
      setActiveGateService(service);
      setGateModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo: ZYZU'S — Tutors & Libraries */}
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo variant="primary" theme="light" size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold transition-colors ${
              location.pathname === '/'
                ? 'text-brand-600 bg-brand-50 border border-brand-200/60'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>

          {/* Services Mega-Dropdown */}
          <div className="relative" ref={servicesDropdownRef}>
            <button
              type="button"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold transition-all cursor-pointer ${
                servicesDropdownOpen || location.pathname.startsWith('/find') || location.pathname.startsWith('/student/mock') || location.pathname.startsWith('/student/study')
                  ? 'text-brand-600 bg-brand-50 border border-brand-200/60'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
              aria-expanded={servicesDropdownOpen}
              aria-haspopup="true"
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-brand-600' : 'text-slate-500'}`} />
            </button>

            {/* Mega Dropdown Menu */}
            {servicesDropdownOpen && (
              <div 
                onMouseLeave={() => setServicesDropdownOpen(false)}
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-[580px] rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      ZYZU'S Core Services
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Pan-India Ecosystem
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {focusPointServices.map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => handleServiceClick(service)}
                      className="flex items-start gap-3 p-3 rounded-2xl text-left hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white group-hover:shadow-sm border border-slate-200/80 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                        {service.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                            {service.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {service.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer Strip */}
                <div className="mt-3 pt-3 border-t border-slate-100 px-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    District Admin Verified Network
                  </span>
                  <div className="flex items-center gap-3">
                    <Link 
                      to="/services"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                    >
                      <span>Explore All Services</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link 
                      to="/how-it-works"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>How it works</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold transition-colors ${
                  isActive
                    ? 'text-brand-600 bg-brand-50 border border-brand-200/60'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Account */}
        <div className="hidden md:flex items-center gap-3">
          {/* AI Notifications & Smart Recommendations Bell */}
          <button
            type="button"
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications and personalized offers"
            title="Notifications & Offers"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-brand-600 uppercase font-bold">{user.role.replace('_', ' ')}</p>
                </div>
                <UserAvatar user={user} size="sm" showBorder />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                    <UserAvatar user={user} size="md" showBorder />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-0.5 inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {user.districtName} District
                      </div>
                    </div>
                  </div>
                  <Link
                    to={
                      user.role === 'LIBRARY_OWNER' || user.role === 'library_owner' ? '/library-owner/profile' :
                      user.role === 'TEACHER' || user.role === 'teacher' ? '/teacher/profile' :
                      user.role === 'STUDENT' || user.role === 'student' ? '/student/profile' :
                      getDashboardPath()
                    }
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-brand-500" />
                    <span>My Dashboard Portal</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-slate-700 hover:text-slate-950">
                  Sign In
                </Button>
              </Link>
              <Link to="/register/student">
                <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="font-bold shadow-md shadow-brand-500/20">
                  Register Free
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile App Bar Header */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setActiveGateService(focusPointServices[0]);
              if (isAuthenticated) navigate('/find-tutor');
              else setGateModalOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-brand-600 active:scale-90 transition-all cursor-pointer"
            aria-label="Quick Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {isAuthenticated && user ? (
            <Link 
              to={getDashboardPath()} 
              className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-xs">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="text-[11px] font-bold truncate max-w-[70px]">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 active:scale-95 transition-all"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 active:scale-95 transition-all cursor-pointer"
            aria-label="View notifications and personalized offers"
            title="Notifications & Offers"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-brand-500 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 active:scale-90 transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-brand-600" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Quick status bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-brand-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Pan-India Verified EdTech Network
            </span>
            <span className="text-slate-600 font-semibold text-[10px] bg-slate-200/80 px-2 py-0.5 rounded">100% KYC Verified</span>
          </div>

          {/* Services Section in Mobile Menu */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
              ZYZU'S Services
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {focusPointServices.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => handleServiceClick(service)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50/50 border border-slate-200/80 text-left transition-all active:scale-98 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {service.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{service.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{service.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === link.path
                    ? 'bg-brand-50 text-brand-700 border border-brand-300 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <UserAvatar user={user} size="md" showBorder />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-brand-600 font-bold uppercase">{user?.role?.replace('_', ' ')} • {user?.districtName}</p>
                  </div>
                </div>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center shadow-md shadow-brand-500/20 font-bold" leftIcon={<Shield className="w-4 h-4" />}>
                    Open Portal Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-center border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/register/student" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center shadow-md shadow-brand-500/20 font-black" leftIcon={<GraduationCap className="w-4 h-4" />}>
                    Register as Student (Free)
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/register/library-owner" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full text-xs justify-center bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 py-2.5 font-bold" leftIcon={<BookMarked className="w-3.5 h-3.5 text-amber-600" />}>
                      List Library
                    </Button>
                  </Link>
                  <Link to="/register/teacher" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full text-xs justify-center bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 py-2.5 font-bold" leftIcon={<Users className="w-3.5 h-3.5 text-brand-600" />}>
                      Teach With Us
                    </Button>
                  </Link>
                </div>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs justify-center text-slate-700 border-slate-300 hover:bg-slate-100 py-2.5 font-bold">
                    Sign In Portal
                  </Button>
                </Link>
              </>
            )}

            {/* Quick helpline pill */}
            <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500 py-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-brand-500" />
              <span>Student Support Helpline: <strong>+91 98765 43210</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Service Registration Gate Modal */}
      <ServiceRegistrationGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        service={activeGateService}
      />

      {/* AI In-App Notification Center Drawer & Consent Preferences Modal */}
      <InAppNotificationCenterDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onOpenPreferences={() => setPreferencesModalOpen(true)}
      />
      <NotificationPreferencesModal
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
      />
    </header>
  );
};
