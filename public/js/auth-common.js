// FocusPoint Auth Common Utilities

// Initialize Toast Container
function initToasts() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info', duration = 4000) {
  initToasts();
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-check-circle',
    danger: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fas ${iconMap[type] || 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Password toggle helper
function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

// Password Strength Checker
function evaluatePasswordStrength(password) {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0 to 5
}

function setupPasswordMeter(inputId, meterId) {
  const input = document.getElementById(inputId);
  const meter = document.getElementById(meterId);
  if (!input || !meter) return;

  input.addEventListener('input', () => {
    const val = input.value;
    const score = evaluatePasswordStrength(val);
    meter.className = 'meter-bar';
    if (val.length === 0) {
      meter.style.width = '0%';
    } else if (score <= 2) {
      meter.classList.add('weak');
    } else if (score <= 4) {
      meter.classList.add('medium');
    } else {
      meter.classList.add('strong');
    }
  });
}

// Populate District dropdown
async function loadDistricts(selectId, defaultDistrictId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetch('/api/public/districts');
    const data = await res.json();
    if (data.success && data.districts) {
      select.innerHTML = '<option value="">-- Select Your District --</option>';
      data.districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.name} (${d.code})`;
        if (defaultDistrictId && d.id === parseInt(defaultDistrictId, 10)) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to load districts:', err);
    select.innerHTML = '<option value="">Error loading districts</option>';
  }
}

// Check logged in user session
async function checkAuthSession() {
  try {
    const token = localStorage.getItem('fp_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/auth/me', { headers });
    const data = await res.json();
    return data.success ? data.user : null;
  } catch (err) {
    return null;
  }
}

// Global logout action
async function performLogout() {
  try {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  } catch (err) {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    window.location.href = '/login';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
});
