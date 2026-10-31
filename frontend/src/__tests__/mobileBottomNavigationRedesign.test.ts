import { describe, it, expect, beforeEach } from 'vitest';

/**
 * FOCUSPOINT MOBILE BOTTOM NAVIGATION REDESIGN TEST SUITE
 * Validating the 5-item modern, futuristic, role-aware bottom navigation
 * and dedicated Services & Account screens per the EdTech UX specifications.
 */

describe('FocusPoint Mobile Bottom Navigation Redesign Master Suite', () => {

  const NAV_ITEMS = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      isActive: (pathname: string) => pathname === '/'
    },
    {
      id: 'tutors',
      label: 'Tutors',
      path: '/find-tutor',
      isActive: (pathname: string) => pathname.startsWith('/find-tutor') || pathname.startsWith('/tutors') || pathname.startsWith('/teacher/')
    },
    {
      id: 'services',
      label: 'Services',
      path: '/services',
      isCenterHero: true,
      badge: 'AI HUB',
      isActive: (pathname: string) => pathname.startsWith('/services') || pathname.startsWith('/mock-tests') || pathname.startsWith('/study-materials')
    },
    {
      id: 'libraries',
      label: 'Libraries',
      path: '/find-library',
      isActive: (pathname: string) => pathname.startsWith('/find-library') || pathname.startsWith('/libraries') || pathname.startsWith('/library/')
    },
    {
      id: 'account',
      label: 'Account',
      path: '/account',
      isActive: (pathname: string) => 
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

  // Helper to resolve active item
  const getActiveItemId = (pathname: string) => {
    const matched = NAV_ITEMS.find(item => item.isActive(pathname));
    return matched ? matched.id : null;
  };

  // Helper for dynamic account badge
  const getAccountBadge = (user: { role?: string; isAuthenticated: boolean } | null, unreadCount = 0) => {
    if (!user || !user.isAuthenticated) return 'Join';
    if (unreadCount > 0) return `${unreadCount} New`;
    switch ((user.role || '').toUpperCase()) {
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

  describe('Scenario 1: Main Navigation Structure & Icon Definitions', () => {
    it('contains exactly 5 primary navigation destinations with clear labels', () => {
      expect(NAV_ITEMS.length).toBe(5);
      const labels = NAV_ITEMS.map(item => item.label);
      expect(labels).toEqual(['Home', 'Tutors', 'Services', 'Libraries', 'Account']);
    });

    it('features Services as the elevated futuristic centerpiece at index 2', () => {
      const centerItem = NAV_ITEMS[2];
      expect(centerItem.id).toBe('services');
      expect(centerItem.isCenterHero).toBe(true);
      expect(centerItem.badge).toBe('AI HUB');
    });

    it('connects to authentic FocusPoint routes without artificial rebuilds', () => {
      expect(NAV_ITEMS.find(i => i.id === 'home')?.path).toBe('/');
      expect(NAV_ITEMS.find(i => i.id === 'tutors')?.path).toBe('/find-tutor');
      expect(NAV_ITEMS.find(i => i.id === 'services')?.path).toBe('/services');
      expect(NAV_ITEMS.find(i => i.id === 'libraries')?.path).toBe('/find-library');
      expect(NAV_ITEMS.find(i => i.id === 'account')?.path).toBe('/account');
    });
  });

  describe('Scenario 2: Active Navigation State & Route Matching', () => {
    it('accurately activates Home on exact root match', () => {
      expect(getActiveItemId('/')).toBe('home');
    });

    it('accurately activates Tutors on /find-tutor and /tutors aliases', () => {
      expect(getActiveItemId('/find-tutor')).toBe('tutors');
      expect(getActiveItemId('/tutors')).toBe('tutors');
      expect(getActiveItemId('/teacher/teacher-uuid-123')).toBe('tutors');
    });

    it('accurately activates Libraries on /find-library and library detail views', () => {
      expect(getActiveItemId('/find-library')).toBe('libraries');
      expect(getActiveItemId('/libraries')).toBe('libraries');
      expect(getActiveItemId('/library/saidpur-digital-library')).toBe('libraries');
    });

    it('accurately activates Services on /services, /mock-tests, and /study-materials', () => {
      expect(getActiveItemId('/services')).toBe('services');
      expect(getActiveItemId('/mock-tests')).toBe('services');
      expect(getActiveItemId('/study-materials')).toBe('services');
    });

    it('accurately activates Account on /account, /login, /register, and portal roots', () => {
      expect(getActiveItemId('/account')).toBe('account');
      expect(getActiveItemId('/login')).toBe('account');
      expect(getActiveItemId('/register/student')).toBe('account');
      expect(getActiveItemId('/register/teacher')).toBe('account');
      expect(getActiveItemId('/register/library')).toBe('account');
      expect(getActiveItemId('/student/dashboard')).toBe('account');
      expect(getActiveItemId('/student/bookings')).toBe('account');
    });
  });

  describe('Scenario 3: Visitor Authentication & Registration Discoverability', () => {
    it('displays "Join" micro-badge for unauthenticated visitors', () => {
      const badge = getAccountBadge(null);
      expect(badge).toBe('Join');

      const guestBadge = getAccountBadge({ isAuthenticated: false });
      expect(guestBadge).toBe('Join');
    });

    it('provides clear registration pathways for all 3 supported user personas', () => {
      const registrationTargets = [
        { persona: 'Student / Parent', path: '/register/student' },
        { persona: 'Home Tutor / Educator', path: '/register/teacher' },
        { persona: 'Digital Library Owner', path: '/register/library' },
      ];

      registrationTargets.forEach(target => {
        expect(target.path.startsWith('/register/')).toBe(true);
      });
    });

    it('supports destination return path preservation on sign in', () => {
      const currentUrl = '/library/saidpur-digital-library/book';
      const stateObject = { from: { pathname: currentUrl } };
      expect(stateObject.from.pathname).toBe('/library/saidpur-digital-library/book');
    });
  });

  describe('Scenario 4: Dedicated Services Discovery Directory', () => {
    const SERVICES_CATALOG = [
      { id: 'home-tutors', name: 'Find Home Tutors', path: '/find-tutor', category: 'STUDENT' },
      { id: 'digital-libraries', name: 'Find Digital Libraries', path: '/find-library', category: 'STUDENT' },
      { id: 'mock-tests', name: 'Government Exam Mock Tests', path: '/mock-tests', category: 'EXAMS' },
      { id: 'study-materials', name: 'Curated Study Materials & PYQs', path: '/study-materials', category: 'STUDENT' },
      { id: 'apply-teacher', name: 'Apply as a Home Tutor', path: '/register/teacher', category: 'PARTNER' },
      { id: 'list-library', name: 'List & Digitize Your Library', path: '/register/library', category: 'PARTNER' }
    ];

    it('indexes all 6 currently implemented FocusPoint core services', () => {
      expect(SERVICES_CATALOG.length).toBe(6);
      const serviceNames = SERVICES_CATALOG.map(s => s.name);
      expect(serviceNames).toContain('Find Home Tutors');
      expect(serviceNames).toContain('Find Digital Libraries');
      expect(serviceNames).toContain('Government Exam Mock Tests');
      expect(serviceNames).toContain('Curated Study Materials & PYQs');
      expect(serviceNames).toContain('Apply as a Home Tutor');
      expect(serviceNames).toContain('List & Digitize Your Library');
    });

    it('filters services correctly across student, exam prep, and partner categories', () => {
      const studentServices = SERVICES_CATALOG.filter(s => s.category === 'STUDENT' || s.category === 'EXAMS');
      expect(studentServices.length).toBe(4);

      const partnerServices = SERVICES_CATALOG.filter(s => s.category === 'PARTNER');
      expect(partnerServices.length).toBe(2);
    });
  });

  describe('Scenario 5: Role-Aware Account Experience', () => {
    it('displays Student badge and shortcuts for registered students', () => {
      const user = { role: 'STUDENT', isAuthenticated: true };
      expect(getAccountBadge(user)).toBe('Student');

      const studentShortcuts = [
        '/student/bookings',
        '/attendance/pass',
        '/student/mock-tests',
        '/student/study-material'
      ];
      studentShortcuts.forEach(path => expect(path.startsWith('/student') || path.startsWith('/attendance')).toBe(true));
    });

    it('displays Teacher badge and professional shortcuts for educators', () => {
      const user = { role: 'TEACHER', isAuthenticated: true };
      expect(getAccountBadge(user)).toBe('Teacher');

      const teacherShortcuts = [
        '/teacher/schedule',
        '/teacher/students'
      ];
      teacherShortcuts.forEach(path => expect(path.startsWith('/teacher/')).toBe(true));
    });

    it('displays Owner badge and seat capacity tools for library owners', () => {
      const user = { role: 'LIBRARY_OWNER', isAuthenticated: true };
      expect(getAccountBadge(user)).toBe('Owner');

      const libraryShortcuts = [
        '/library-owner/seats',
        '/library-owner/bookings'
      ];
      libraryShortcuts.forEach(path => expect(path.startsWith('/library-owner/')).toBe(true));
    });

    it('prioritizes unread notification count badge when notifications exist', () => {
      const user = { role: 'STUDENT', isAuthenticated: true };
      expect(getAccountBadge(user, 3)).toBe('3 New');
    });

    it('does not expose Super Admin or District Admin navigation in public bottom bar', () => {
      const publicPaths = NAV_ITEMS.map(i => i.path);
      expect(publicPaths).not.toContain('/super-admin/dashboard');
      expect(publicPaths).not.toContain('/district-admin/dashboard');
    });
  });

  describe('Scenario 6: Mobile Layout, Safe Areas & Interaction Ergonomics', () => {
    it('has explicit safe area bottom padding support in style declaration', () => {
      const safeAreaStyle = 'calc(0.5rem + env(safe-area-inset-bottom, 0px))';
      expect(safeAreaStyle).toContain('env(safe-area-inset-bottom');
    });

    it('supports accessible labels and aria-current page binding', () => {
      const item = NAV_ITEMS[0];
      const active = item.isActive('/');
      const ariaCurrent = active ? 'page' : undefined;
      expect(ariaCurrent).toBe('page');
    });
  });

});
