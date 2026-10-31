import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Bell, Shield, MapPin, ExternalLink, Globe, Search, X, Lock } from 'lucide-react';
import { DevRoleSwitcher } from './DevRoleSwitcher';
import { ToastContainer } from './ToastContainer';
import { UserAvatar } from './UserAvatar';
import { ErrorBoundary } from './ErrorBoundary';
import { CommandPalette } from './CommandPalette';
import { InAppNotificationCenterDrawer } from '../notifications/InAppNotificationCenterDrawer';
import { NotificationPreferencesModal } from '../notifications/NotificationPreferencesModal';
import { inAppNotificationService } from '../../services/inAppNotificationService';
import { MobileBottomBar } from './MobileBottomBar';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [aiUnreadCount, setAiUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setAiUnreadCount(inAppNotificationService.getUnreadCount(user?.id || 'guest-visitor'));
    };
    updateCount();
    const unsub = inAppNotificationService.subscribe(updateCount);
    return unsub;
  }, [user]);

  const isSuperAdminRoute = location.pathname.startsWith('/super-admin') || user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin';
  const isDistrictAdmin = user?.role === 'DISTRICT_ADMIN' || user?.role === 'district_admin';
  const districtScope = isDistrictAdmin ? districtAuthorizationService.getAuthorizedScope(user) : null;
  const authorizedDistrictDisplay = districtScope?.districtName || user?.districtName || user?.district || '';

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${isSuperAdminRoute ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
          {/* Top Navbar */}
          <header className={`sticky top-0 z-30 h-16 border-b px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-xs backdrop-blur-md transition-colors ${
            isSuperAdminRoute 
              ? 'bg-slate-900 border-slate-800 text-white shadow-md' 
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}>
            {/* Left Identification / Menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className={`p-2 rounded-lg md:hidden transition-colors cursor-pointer ${
                  isSuperAdminRoute 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* District / Role Identification Banner */}
              {isDistrictAdmin ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-royal-blue-500/10 border border-royal-blue-500/20 text-royal-blue-700">
                    <Shield className="w-4 h-4 text-royal-blue-600 shrink-0" />
                    <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-[200px] md:max-w-none">
                      {authorizedDistrictDisplay} District Command Center
                    </span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>AUTHORIZED: {authorizedDistrictDisplay.toUpperCase()}</span>
                  </div>
                </div>
              ) : user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 shadow-sm shadow-brand-900/20">
                  <Shield className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="text-xs font-bold tracking-wide truncate max-w-[140px] sm:max-w-none">
                    Super Admin Console
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="hidden sm:inline">District: </span>
                  <strong className="text-slate-950 font-bold">{user?.districtName || user?.district || 'Central'}</strong>
                </div>
              )}
            </div>

            {/* Global Search Bar with Zero Icon Overlap (Requirement 31) */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden md:block">
              <div className="relative flex items-center w-full">
                <Search className={`w-4 h-4 absolute left-3.5 pointer-events-none shrink-0 ${isSuperAdminRoute ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Global search (students, teachers, libraries, invoices)..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className={`w-full h-9 pl-10 pr-9 text-xs rounded-xl border focus:outline-none transition-all ${
                    isSuperAdminRoute
                      ? 'border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-400 focus:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                      : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:border-royal-blue-500 focus:ring-2 focus:ring-royal-blue-500/10 placeholder:text-slate-400 text-slate-800'
                  }`}
                />
                {globalSearch && (
                  <button
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className={`p-2 rounded-lg md:hidden transition-colors cursor-pointer ${
                  isSuperAdminRoute 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                to="/"
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs ${
                  isSuperAdminRoute
                    ? 'text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-700 bg-slate-900/60'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>Visit Public Site</span>
              </Link>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => setNotificationDrawerOpen(true)}
                className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                  isSuperAdminRoute 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                aria-label="View notifications and smart recommendations"
                title="Notifications & Personalized Offers"
              >
                <Bell className="w-5 h-5" />
                {(unreadCount > 0 || aiUnreadCount > 0) && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                    {unreadCount + aiUnreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Avatar with Direct Link */}
              <Link
                to={
                  user?.role === 'DISTRICT_ADMIN' || user?.role === 'district_admin' ? '/district-admin/profile' :
                  user?.role === 'TEACHER' || user?.role === 'teacher' ? '/teacher/profile' :
                  user?.role === 'STUDENT' || user?.role === 'student' ? '/student/profile' :
                  user?.role === 'LIBRARY_OWNER' || user?.role === 'library_owner' ? '/library-owner/profile' :
                  user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin' ? '/super-admin/profile' :
                  '#'
                }
                className={`flex items-center gap-2 pl-1.5 sm:pl-2 border-l hover:opacity-90 transition-opacity ${
                  isSuperAdminRoute ? 'border-slate-800' : 'border-slate-200'
                }`}
                title={`${user?.name} Profile & Settings`}
              >
                <UserAvatar user={user} size="sm" showBorder />
              </Link>
            </div>
          </header>

          {/* Mobile Collapsible Search Drawer */}
          {showMobileSearch && (
            <div className={`md:hidden border-b p-3 px-4 shadow-sm animate-in slide-in-from-top duration-150 ${
              isSuperAdminRoute ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white'
            }`}>
              <div className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search students, teachers, libraries..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  autoFocus
                  className={`w-full h-10 pl-9 pr-9 text-xs rounded-xl border focus:outline-none ${
                    isSuperAdminRoute
                      ? 'border-slate-800 bg-slate-900 text-white focus:border-cyan-500'
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-royal-blue-500'
                  }`}
                />
                {globalSearch ? (
                  <button onClick={() => setGlobalSearch('')} className="absolute right-2.5 p-1 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => setShowMobileSearch(false)} className="absolute right-2.5 p-1 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Page Content Viewport */}
          <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${
            isSuperAdminRoute 
              ? 'text-slate-100' 
              : isDistrictAdmin 
              ? 'text-slate-900' 
              : 'text-slate-900 pb-24 md:pb-8'
          }`}>
            <ErrorBoundary>
              {children || <Outlet />}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      {(!isSuperAdminRoute && !isDistrictAdmin) && <MobileBottomBar />}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <InAppNotificationCenterDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onOpenPreferences={() => setPreferencesModalOpen(true)}
      />
      <NotificationPreferencesModal
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
      />
    </div>
  );
};
