/* ============================================
   MULIA OT SYSTEM — Config & Google Sheets API
   Tetapkan nilai-nilai ini sebelum deploy
   ============================================ */

const CONFIG = {
  // ── GOOGLE SHEETS ──────────────────────────
  // 1. Buka Google Sheets anda
  // 2. Extensions > Apps Script > Deploy > Web App
  // 3. Salin URL deployment ke sini
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwm068KOgx8wt-VrjKtnhHEeWvk7Hq2F25L5LtgoSPQ6ztcmleMqdWVRhH8OhwGtFWs/exec',

  // ID Spreadsheet Google Sheets (dari URL)
  SHEET_ID: 'AKfycbwm068KOgx8wt-VrjKtnhHEeWvk7Hq2F25L5LtgoSPQ6ztcmleMqdWVRhH8OhwGtFWs',

  // ── SYARIKAT ──────────────────────────────
  COMPANY_NAME: 'Mulia Properties Development Sdn Bhd',
  COMPANY_SHORT: 'Mulia Group',
  COMPANY_REG: 'Reg. No: 123456-X',
  SYSTEM_VERSION: '1.0.0',

  // ── OT SETTINGS ───────────────────────────
  OT_RATES: {
    weekday:  1.5,   // 1.5x gaji biasa
    weekend:  2.0,   // 2.0x
    holiday:  3.0,   // 3.0x
  },
  MAX_OT_HOURS_PER_DAY: 4,
  MAX_OT_HOURS_PER_MONTH: 104,

  // ── AUTH ───────────────────────────────────
  // Tukar PIN ini sebelum guna di production
  ADMIN_PIN: '1234',
  SESSION_KEY: 'mulia_ot_session',
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 jam

  // ── SHEETS NAMES ──────────────────────────
  SHEETS: {
    WORKERS: 'Workers',
    OT_RECORDS: 'OT_Records',
    APPROVALS: 'Approvals',
    AUDIT_LOG: 'Audit_Log',
    CONFIG: 'Config',
  },

  // ── JABATAN ──────────────────────────────
  DEPARTMENTS: [
    'Pengurusan',
    'Jualan & Pemasaran',
    'Kewangan & Akaun',
    'Operasi & Penyelenggaraan',
    'Projek & Pembangunan',
    'Sumber Manusia',
    'IT & Sistem',
    'Undang-undang & Pematuhan',
  ],

  // ── JENIS OT ─────────────────────────────
  OT_TYPES: [
    { value: 'weekday', label: 'Hari Bekerja (1.5x)' },
    { value: 'weekend', label: 'Hujung Minggu (2.0x)' },
    { value: 'holiday', label: 'Cuti Umum (3.0x)' },
  ],

  // ── CUTI UMUM MALAYSIA 2025 ────────────────
  PUBLIC_HOLIDAYS_2025: [
    '2025-01-01', '2025-01-29', '2025-01-30',
    '2025-02-01', '2025-03-30', '2025-03-31',
    '2025-04-13', '2025-05-01', '2025-05-12',
    '2025-06-02', '2025-07-07', '2025-08-31',
    '2025-09-16', '2025-10-20', '2025-12-25',
  ],
};

/* ── API HELPER ──────────────────────────────── */
const API = {
  // GET data dari Google Sheets
  async get(action, params = {}) {
    const url = new URL(CONFIG.SCRIPT_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Ralat tidak diketahui');
      return data;
    } catch (e) {
      console.error('[API GET]', e);
      throw e;
    }
  },

  // POST data ke Google Sheets
  async post(action, payload = {}) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Ralat tidak diketahui');
      return data;
    } catch (e) {
      console.error('[API POST]', e);
      throw e;
    }
  },
};

/* ── AUTH ─────────────────────────────────────── */
const Auth = {
  login(pin) {
    if (pin !== CONFIG.ADMIN_PIN) return false;
    const session = {
      loggedIn: true,
      loginTime: Date.now(),
      expires: Date.now() + CONFIG.SESSION_DURATION,
      user: 'Admin HR',
      role: 'admin',
    };
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
    return true;
  },

  logout() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    window.location.href = 'index.html';
  },

  check() {
    try {
      const s = JSON.parse(localStorage.getItem(CONFIG.SESSION_KEY) || '{}');
      if (!s.loggedIn || Date.now() > s.expires) {
        this.logout();
        return null;
      }
      return s;
    } catch { this.logout(); return null; }
  },

  requireAuth() {
    const s = this.check();
    if (!s) { window.location.href = 'index.html'; }
    return s;
  },
};

/* ── UTILITIES ────────────────────────────────── */
const Utils = {
  formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ms-MY', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ms-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  formatCurrency(amount) {
    return 'RM ' + Number(amount || 0).toLocaleString('ms-MY', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  },

  formatHours(h) {
    return Number(h || 0).toFixed(1) + ' jam';
  },

  calcOTAmount(hourlyRate, hours, type) {
    const multiplier = CONFIG.OT_RATES[type] || 1.5;
    return hourlyRate * hours * multiplier;
  },

  getDayType(dateStr) {
    const d = new Date(dateStr);
    if (CONFIG.PUBLIC_HOLIDAYS_2025.includes(dateStr)) return 'holiday';
    const day = d.getDay();
    if (day === 0 || day === 6) return 'weekend';
    return 'weekday';
  },

  generateId() {
    return 'OT-' + Date.now().toString(36).toUpperCase();
  },

  isValidIC(ic) {
    return /^\d{12}$/.test(ic.replace(/-/g, ''));
  },

  toast(msg, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'ti-circle-check', error: 'ti-circle-x', info: 'ti-info-circle', warning: 'ti-alert-triangle' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="ti ${icons[type] || icons.info}" aria-hidden="true"></i><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, duration);
  },

  showLoading() {
    let el = document.getElementById('loading-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'loading-overlay';
      el.className = 'loading-overlay';
      el.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
  },

  hideLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) el.style.display = 'none';
  },

  getMonthName(month, year) {
    return new Date(year, month - 1).toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
  },

  exportCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = [headers.join(','), ...data.map(r => headers.map(h => `"${r[h] || ''}"`).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },

  badgeHTML(status) {
    const map = {
      pending:  ['badge-pending',    'ti-clock',        'Menunggu'],
      approved: ['badge-approved',   'ti-circle-check', 'Diluluskan'],
      rejected: ['badge-rejected',   'ti-circle-x',     'Ditolak'],
      processing:['badge-processing','ti-loader',       'Diproses'],
    };
    const [cls, icon, label] = map[status] || map.pending;
    return `<span class="badge ${cls}"><i class="ti ${icon}" aria-hidden="true"></i>${label}</span>`;
  },

  debounce(fn, delay = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  },
};

/* ── SIDEBAR ACTIVE LINK ──────────────────────── */
function setActivePage(pageId) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
}

/* ── DARK MODE TOGGLE ─────────────────────────── */
function initDarkMode() {
  const saved = localStorage.getItem('mulia_dark_mode');
  if (saved === 'true') document.body.classList.add('dark');

  const btn = document.getElementById('dark-mode-toggle');
  if (btn) {
    updateDarkBtn(btn);
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('mulia_dark_mode', document.body.classList.contains('dark'));
      updateDarkBtn(btn);
    });
  }
}
function updateDarkBtn(btn) {
  const isDark = document.body.classList.contains('dark');
  btn.querySelector('i').className = isDark ? 'ti ti-sun' : 'ti ti-moon';
  btn.title = isDark ? 'Mod Terang' : 'Mod Gelap';
}