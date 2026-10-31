/**
 * FOCUSPOINT Phase 2 - Common Dashboard Helper Library
 */

const DashCommon = {
  // Get current auth session from localStorage
  getSession() {
    const token = localStorage.getItem('fp_token');
    const userJson = localStorage.getItem('fp_user');
    if (!token || !userJson) return null;
    try {
      return { token, user: JSON.parse(userJson) };
    } catch (e) {
      return null;
    }
  },

  // Asynchronously restore session from persistent server cookie if localStorage was cleared
  async getOrRestoreSession() {
    let session = this.getSession();
    if (session && session.token) return session;

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const token = data.token || 'auth-cookie-token';
          localStorage.setItem('fp_token', token);
          localStorage.setItem('fp_user', JSON.stringify(data.user));
          return { token, user: data.user };
        }
      }
    } catch (e) {
      console.warn('[DashCommon] Session restore attempt:', e.message);
    }
    return null;
  },

  // Require a specific role, redirect to login or right dashboard if mismatched
  requireAuth(allowedRoles = []) {
    let session = this.getSession();
    if (!session || !session.token) {
      this.getOrRestoreSession().then(restored => {
        if (!restored) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        } else if (allowedRoles.length > 0 && !allowedRoles.includes(restored.user.role)) {
          window.location.href = '/login';
        } else {
          window.location.reload();
        }
      });
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      // Wrong role, redirect to own dashboard
      const roleDashboards = {
        STUDENT: '/dashboard/student',
        TEACHER: '/dashboard/teacher',
        LIBRARY_OWNER: '/dashboard/library-owner',
        DISTRICT_ADMIN: '/dashboard/district-admin',
        SUPER_ADMIN: '/dashboard/super-admin'
      };
      window.location.href = roleDashboards[session.user.role] || '/login';
      return null;
    }

    return session;
  },

  // Make authenticated API call
  async api(endpoint, options = {}) {
    const session = this.getSession();
    const token = session ? session.token : '';

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers
      });

      if (res.status === 401) {
        localStorage.removeItem('fp_token');
        localStorage.removeItem('fp_user');
        window.location.href = '/login';
        return { success: false, message: 'Session expired' };
      }

      const data = await res.json();
      return { status: res.status, ...data };
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, message: 'Network or server error' };
    }
  },

  // Toast Notification
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Initialize UI navigation and user snippets
  initUI(user, currentRoleTitle) {
    // Populate user snippets
    const userNameEls = document.querySelectorAll('.user-snippet-name, .topbar-user-name');
    const userEmailEls = document.querySelectorAll('.user-snippet-email');
    const userAvatarEls = document.querySelectorAll('.user-snippet-avatar, .role-avatar-chip');
    const districtEls = document.querySelectorAll('.user-district-display');

    const displayName = user.fullName || user.email.split('@')[0];
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FP';

    userNameEls.forEach(el => el.textContent = displayName);
    userEmailEls.forEach(el => el.textContent = user.email);
    userAvatarEls.forEach(el => el.textContent = initials);
    districtEls.forEach(el => el.textContent = user.district || 'All Districts');

    // Sidebar Tab Navigation
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Mobile Drawer Toggle
    const toggleBtn = document.querySelector('.topbar-toggle-btn');
    const sidebar = document.querySelector('.dash-sidebar');
    const backdrop = document.querySelector('.drawer-backdrop');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('drawer-open');
        if (backdrop) backdrop.classList.toggle('drawer-open');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('drawer-open');
        backdrop.classList.remove('drawer-open');
      });
    }

    // Logout
    const logoutBtns = document.querySelectorAll('.btn-logout, .btn-icon-logout');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('fp_token');
        localStorage.removeItem('fp_user');
        window.location.href = '/login';
      });
    });
  },

  switchTab(tabId) {
    // Nav links
    document.querySelectorAll('.sidebar-nav-item[data-tab]').forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Close mobile drawer on item click
    const sidebar = document.querySelector('.dash-sidebar');
    const backdrop = document.querySelector('.drawer-backdrop');
    if (sidebar) sidebar.classList.remove('drawer-open');
    if (backdrop) backdrop.classList.remove('drawer-open');
  },

  // Modal helpers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }
};
