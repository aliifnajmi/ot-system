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

/**
 * Configuration & Authentication Script
 * Sistem Pengurusan OT — Mulia Group
 */

// 1. Kekalkan struktur pembolehubah CONFIG sedia ada
const CONFIG = {
  SESSION_KEY: 'mulia_ot_session',
  SESSION_TIMEOUT_MS: 2 * 60 * 60 * 1000, // Sesi aktif selama 2 jam (7200000 ms)
  ADMIN_PIN: '1234'                      // PIN Lalai untuk Log Masuk Admin
};

// 2. Objek Auth dengan fungsi login sedia ada
const Auth = {
  /**
   * Mengesahkan PIN yang dimasukkan oleh pengguna
   * @param {string} inputPin 
   * @returns {boolean}
   */
  login: function(inputPin) {
    if (inputPin === CONFIG.ADMIN_PIN) {
      const sessionData = {
        loggedIn: true,
        role: 'admin',
        expires: Date.now() + CONFIG.SESSION_TIMEOUT_MS
      };
      
      // Simpan session data ke localStorage sepadan dengan kawalan window.onload index.html
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
      return true;
    }
    return false;
  },

  /**
   * Membuang sesi aktif apabila log keluar
   */
  logout: function() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    window.location.href = 'index.html';
  }
};

// 3. Objek Utils dengan mengekalkan fungsi .toast() sedia ada
const Utils = {
  /**
   * Menghasilkan popup toast dinamik ke dalam #toast-container
   * @param {string} message - Mesej teks
   * @param {string} type - Jenis mod ('success', 'warning', 'danger')
   */
  toast: function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    // Kekalkan pemakaian class mengikut framework css sedia ada anda (cth: alert alert-success)
    toast.className = `alert alert-${type === 'danger' ? 'danger' : type} toast-item`;
    
    // Gaya minimum untuk pastikan toast terapung dengan kemas
    toast.style.cssText = `
      padding: 12px 20px;
      margin-top: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: toastFadeIn 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: ${type === 'success' ? '#def7ec' : type === 'warning' ? '#fde8e8' : '#f3f4f6'};
      color: ${type === 'success' ? '#03543f' : type === 'warning' ? '#9b1c1c' : '#1f2937'};
    `;

    // Letakkan icon ringkas mengikut jenis toast
    let icon = 'ti-info-circle';
    if (type === 'success') icon = 'ti-circle-check';
    if (type === 'warning' || type === 'danger') icon = 'ti-alert-circle';
    
    toast.innerHTML = `<i class="ti ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    // Padam secara automatik selepas 3 saat
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Tambahkan CSS Keyframe untuk animasi toast secara dinamik jika belum ada dalam style.css
if (!document.getElementById('toast-animate-style')) {
  const style = document.createElement('style');
  style.id = 'toast-animate-style';
  style.innerHTML = `
    #toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px; }
    @keyframes toastFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
}

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