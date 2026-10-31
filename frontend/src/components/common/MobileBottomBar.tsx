import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, GraduationCap, BookMarked, User, 
  Compass, Sparkles, Zap, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { inAppNotificationService } from '../../services/inAppNotificationService';

interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeVariant?: 'brand' | 'emerald' | 'amber' | 'purple' | 'cyan';
  isCenterHero?: boolean;
  isActive: (pathname: string) => boolean;
}

export const MobileBottomBar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      setUnreadNotifications(inAppNotificationService.getUnreadCount(user?.id || 'guest-visitor'));
    };
    updateCount();
    const unsub = inAppNotificationService.subscribe(updateCount);
    return unsub;
  }, [user]);

  // Determine user role badge text if logged in
  const getAccountBadge = () => {
    if (!isAuthenticated || !user) return 'Join';
    if (unreadNotifications > 0) return `${unreadNotifications} New`;
    switch (user.role?.toUpperCase()) {
      case 'STUDENT':
      case 'LIBRARY_STUDENT':
        return 'Student';
      case 'TEACHER':
        return 'Teacher';
      case 'LIBRARY_OWNER':
        return 'Owner';
      case 'SUPER_ADMIN':
      case 'DISTRICT_ADMIN':
        return 'Admin';
      default:
        return 'Portal';
    }
  };

  // 5 Symmetrical items with Services as the elevated futuristic centerpiece (Slot 3)
  const navItems: NavItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: Home,
      badge: null,
      isActive: (pathname) => pathname === '/'
    },
    {
      id: 'tutors',
      label: 'Tutors',
      path: '/find-tutor',
      icon: GraduationCap,
      badge: 'Verified',
      badgeVariant: 'brand',
      isActive: (pathname) => pathname.startsWith('/find-tutor') || pathname.startsWith('/tutors') || pathname.startsWith('/teacher/')
    },
    {
      id: 'services',
      label: 'Services',
      path: '/services',
      icon: Compass,
      badge: 'AI HUB',
      badgeVariant: 'cyan',
      isCenterHero: true,
      isActive: (pathname) => pathname.startsWith('/services') || pathname.startsWith('/mock-tests') || pathname.startsWith('/study-materials')
    },
    {
      id: 'libraries',
      label: 'Libraries',
      path: '/find-library',
      icon: BookMarked,
      badge: 'Seats',
      badgeVariant: 'emerald',
      isActive: (pathname) => pathname.startsWith('/find-library') || pathname.startsWith('/libraries') || pathname.startsWith('/library/')
    },
    {
      id: 'account',
      label: 'Account',
      path: '/account',
      icon: User,
      badge: getAccountBadge(),
      badgeVariant: unreadNotifications > 0 ? 'amber' : 'brand',
      isActive: (pathname) => 
        pathname.startsWith('/account') || 
        pathname.startsWith('/student') || 
        pathname.startsWith('/teacher/') || 
        pathname.startsWith('/library-owner') || 
        pathname.startsWith('/super-admin') || 
        pathname.startsWith('/district-admin') || 
        pathname.startsWith('/login') || 
        pathname.startsWith('/register')
    }
  ];

  return (
    <aside 
      aria-label="Mobile Navigation Bar" 
      className="block md:hidden fixed left-2 right-2 sm:left-4 sm:right-4 max-w-lg mx-auto z-50 transition-all duration-300 overflow-visible"
      style={{ bottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18),0_0_1px_1px_rgba(15,23,42,0.06)] px-1.5 py-1 ring-1 ring-slate-900/5 overflow-visible">
        <div className="flex items-center justify-between gap-1 overflow-visible">
          {navItems.map((item) => {
            const active = item.isActive(location.pathname);
            const Icon = item.icon;

            // =========================================================================
            // ELEVATED FUTURISTIC CENTERPIECE: SERVICES (AI HUB)
            // =========================================================================
            if (item.isCenterHero) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-label="Explore All Services - ZYZU'S AI Hub"
                  aria-current={active ? 'page' : undefined}
                  className="relative -top-4 sm:-top-5 flex-1 flex flex-col items-center justify-center group cursor-pointer select-none touch-manipulation z-20"
                >
                  {/* Outer Ambient Holographic Glow Aura */}
                  <div 
                    className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 via-orange-500 to-amber-400 blur-md transition-opacity duration-300 pointer-events-none ${
                      active ? 'opacity-85 animate-pulse' : 'opacity-40 group-hover:opacity-75'
                    }`} 
                  />

                  {/* High-Tech Glowing Centerpiece Orb */}
                  <div className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform active:scale-90 ${
                    active 
                      ? 'bg-gradient-to-b from-slate-900 via-brand-950 to-slate-950 border-2 border-orange-400 shadow-[0_8px_25px_rgba(234,88,12,0.6),0_0_15px_rgba(37,99,235,0.4)] scale-105' 
                      : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-brand-500/60 shadow-[0_6px_20px_rgba(15,23,42,0.35)] group-hover:border-brand-400'
                  }`}>
                    {/* Top Edge Holographic Light Glass Reflection */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 via-white/10 to-transparent rounded-t-xl pointer-events-none" />

                    {/* Futuristic Orbital Ring Indicator */}
                    <div className={`absolute -inset-1.5 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
                      active 
                        ? 'border-amber-400/80 animate-spin' 
                        : 'border-brand-400/30 group-hover:border-brand-400/60'
                    }`} style={{ animationDuration: '7s' }} />

                    {/* Dual-Tone Core Emblem */}
                    <div className="relative z-10 flex items-center justify-center">
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                        active 
                          ? 'text-amber-300 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                          : 'text-white group-hover:text-amber-200'
                      }`} />
                      
                      {/* Ambient Energy Particle */}
                      <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>

                    {/* Micro Futuristic Chip Badge */}
                    <span className="absolute -top-1.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-mono text-[7px] font-black uppercase tracking-widest shadow-xs border border-orange-200/60">
                      {item.badge}
                    </span>
                  </div>

                  {/* Futuristic Under-Label */}
                  <span className={`text-[9.5px] mt-1 tracking-tight font-black transition-colors duration-200 ${
                    active 
                      ? 'text-slate-900 drop-shadow-xs font-black' 
                      : 'text-slate-600 group-hover:text-slate-900 font-extrabold'
                  }`}>
                    {item.label}
                  </span>

                  {/* Futuristic Active Neon Laser Bar */}
                  {active && (
                    <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_6px_rgba(234,88,12,0.9)] mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
                  )}
                </Link>
              );
            }

            // =========================================================================
            // STANDARD LATERAL NAVIGATION ITEMS (HOME, TUTORS, LIBRARIES, ACCOUNT)
            // =========================================================================
            return (
              <Link
                key={item.id}
                to={item.path}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`relative flex-1 py-1 px-1 min-h-[52px] flex flex-col items-center justify-center rounded-xl transition-all duration-200 active:scale-90 cursor-pointer select-none ${
                  active 
                    ? 'text-brand-600 font-black' 
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                {/* Micro Badge Notification */}
                {item.badge && !active && (
                  <span className={`absolute -top-1.5 right-1 text-[7.5px] font-black px-1.5 py-0.5 rounded-full tracking-tight scale-90 shadow-2xs border ${
                    item.badgeVariant === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.badgeVariant === 'amber'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : 'bg-brand-50 text-brand-700 border-brand-200'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Animated Icon Pill Container */}
                <div className={`relative px-2.5 py-1 rounded-xl transition-all duration-300 flex items-center justify-center ${
                  active 
                    ? 'bg-gradient-to-r from-brand-50 to-orange-50 text-brand-600 border border-brand-200/70 shadow-xs scale-105' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  
                  {/* Subtle live seat pulse for libraries */}
                  {item.id === 'libraries' && !active && (
                    <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  )}
                </div>

                {/* Text Label */}
                <span className={`text-[9.5px] sm:text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                  active 
                    ? 'text-slate-900 font-black scale-105' 
                    : 'text-slate-500 font-semibold'
                }`}>
                  {item.label}
                </span>

                {/* Futuristic Active Indicator Dot */}
                {active && (
                  <span className="w-3 h-0.5 rounded-full bg-brand-500 mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
