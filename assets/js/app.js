/* ============================================
   MULIA OT SYSTEM — Core JS
   Google Sheets Integration + App Logic
   ============================================ */

'use strict';

const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY_HERE',
  APP_NAME: 'Mulia OT System',
  COMPANY: 'Mulia Properties Development Sdn Bhd',
  OT_RATE_WEEKDAY: 1.5,
  OT_RATE_REST_DAY: 2.0,
  OT_RATE_PUBLIC_HOLIDAY: 3.0
};

/* ====== AUTH ====== */
const Auth = {
  SESSION_KEY: 'mulia_ot_session',
  USERS_KEY: 'mulia_ot_users',

  init() {
    const users = this.getUsers();
    if (users.length === 0) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([{
        id: 'USR001', username: 'admin',
        password: btoa('Mulia@2024'),
        name: 'Puan Rashidah', role: 'admin',
        email: 'admin@mulia.com.my',
        createdAt: new Date().toISOString()
      }]));
    }
  },

  getUsers() { return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]'); },

  login(username, password) {
    const user = this.getUsers().find(u => u.username === username && u.password === btoa(password));
    if (user) {
      const session = { userId: user.id, username: user.username, name: user.name, role: user.role, email: user.email, loginAt: new Date().toISOString() };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      AuditLog.add('LOGIN', 'User ' + username + ' logged in');
      return { success: true, user: session };
    }
    return { success: false, message: 'Nama pengguna atau kata laluan salah.' };
  },

  logout() {
    const s = this.getSession();
    if (s) AuditLog.add('LOGOUT', 'User ' + s.username + ' logged out');
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'index.html';
  },

  getSession() { const s = localStorage.getItem(this.SESSION_KEY); return s ? JSON.parse(s) : null; },

  requireAuth() {
    const s = this.getSession();
    if (!s) { window.location.href = 'index.html'; return null; }
    return s;
  }
};

/* ====== AUDIT LOG ====== */
const AuditLog = {
  add(action, description) {
    const logs = JSON.parse(localStorage.getItem('mulia_audit_log') || '[]');
    const s = Auth.getSession();
    logs.unshift({ id: 'LOG-' + Date.now(), action, description, userName: s ? s.name : 'System', timestamp: new Date().toISOString() });
    if (logs.length > 500) logs.splice(500);
    localStorage.setItem('mulia_audit_log', JSON.stringify(logs));
  },
  getAll() { return JSON.parse(localStorage.getItem('mulia_audit_log') || '[]'); }
};

/* ====== DATABASE ====== */
const DB = {
  KEYS: { WORKERS: 'mulia_workers', OT_RECORDS: 'mulia_ot_records', SETTINGS: 'mulia_settings' },
  get(key) { return JSON.parse(localStorage.getItem(key) || '[]'); },
  set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
  genId(prefix) { return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase(); },

  getWorkers() { return this.get(this.KEYS.WORKERS); },
  saveWorkers(d) { this.set(this.KEYS.WORKERS, d); },
  getWorkerById(id) { return this.getWorkers().find(w => w.id === id) || null; },

  addWorker(w) {
    const workers = this.getWorkers();
    w.id = this.genId('W'); w.createdAt = new Date().toISOString(); w.status = 'active';
    workers.push(w); this.saveWorkers(workers);
    AuditLog.add('ADD_WORKER', 'Added worker: ' + w.name);
    return w;
  },

  updateWorker(id, updates) {
    const workers = this.getWorkers();
    const idx = workers.findIndex(w => w.id === id);
    if (idx !== -1) { workers[idx] = { ...workers[idx], ...updates, updatedAt: new Date().toISOString() }; this.saveWorkers(workers); AuditLog.add('UPDATE_WORKER', 'Updated worker: ' + workers[idx].name); return workers[idx]; }
    return null;
  },

  deleteWorker(id) {
    const workers = this.getWorkers();
    const w = workers.find(w => w.id === id);
    this.saveWorkers(workers.filter(w => w.id !== id));
    if (w) AuditLog.add('DELETE_WORKER', 'Deleted worker: ' + w.name);
  },

  getOTRecords() { return this.get(this.KEYS.OT_RECORDS); },
  saveOTRecords(d) { this.set(this.KEYS.OT_RECORDS, d); },

  calcOTAmount(record) {
    const worker = this.getWorkerById(record.workerId);
    if (!worker || !worker.basicSalary) return 0;
    const hourlyRate = (worker.basicSalary / 26) / 8;
    const mult = { weekday: CONFIG.OT_RATE_WEEKDAY, rest_day: CONFIG.OT_RATE_REST_DAY, public_holiday: CONFIG.OT_RATE_PUBLIC_HOLIDAY }[record.dayType] || 1.5;
    return parseFloat((hourlyRate * parseFloat(record.hours) * mult).toFixed(2));
  },

  addOTRecord(r) {
    const records = this.getOTRecords();
    r.id = this.genId('OT'); r.status = 'pending'; r.submittedAt = new Date().toISOString();
    r.hoursAmount = this.calcOTAmount(r);
    records.push(r); this.saveOTRecords(records);
    AuditLog.add('SUBMIT_OT', 'OT submitted: ' + r.workerName + ' on ' + r.otDate + ' (' + r.hours + 'hrs)');
    return r;
  },

  updateOTStatus(id, status, remarks) {
    const records = this.getOTRecords();
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      records[idx].status = status; records[idx].statusRemarks = remarks || '';
      records[idx].processedAt = new Date().toISOString();
      records[idx].processedBy = (Auth.getSession() || {}).name || 'System';
      this.saveOTRecords(records);
      AuditLog.add('UPDATE_OT_STATUS', 'OT ' + id + ' -> ' + status);
      return records[idx];
    }
    return null;
  },

  getDashboardStats() {
    const workers = this.getWorkers();
    const records = this.getOTRecords();
    const now = new Date();
    const thisMonth = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
    const monthRec = records.filter(r => r.otDate && r.otDate.startsWith(thisMonth));
    return {
      totalWorkers: workers.filter(w => w.status === 'active').length,
      pendingOT: records.filter(r => r.status === 'pending').length,
      approvedOT: monthRec.filter(r => r.status === 'approved').length,
      totalOTHours: Math.round(monthRec.reduce((s,r) => s + parseFloat(r.hours||0), 0) * 10) / 10,
      totalAmount: monthRec.filter(r => r.status === 'approved').reduce((s,r) => s + parseFloat(r.hoursAmount||0), 0)
    };
  },

  seedSampleData() {
    if (this.getWorkers().length > 0) return;
    const names = ['Ahmad bin Razali','Siti Nurul Ain binti Hassan','Mohd Fadzli bin Yusof','Nur Hidayah binti Kamal','Roslan bin Ibrahim','Zulaikha binti Mohd','Hafizuddin bin Abdullah','Faridah binti Omar','Shahrul Nizam bin Aziz','Norazura binti Zakaria','Khairul Anuar bin Ismail','Wan Aisyah binti Wan Ahmad'];
    const depts = ['Construction','Engineering','Admin','Operations','Finance'];
    const positions = ['Site Engineer','Project Manager','Admin Officer','Foreman','Quantity Surveyor'];
    const workers = names.map((name, i) => ({
      id: 'W-' + String(i+1).padStart(3,'0'), name,
      employeeId: 'EMP' + (1000+i+1),
      ic: '8' + String(i+1).padStart(11,'0'),
      department: depts[i % depts.length],
      position: positions[i % positions.length],
      phone: '011-' + String(10000000+i*1234567).substring(0,8),
      email: name.split(' ')[0].toLowerCase() + '@mulia.com.my',
      basicSalary: (28 + i * 3) * 100,
      joinDate: '202' + (i%3+1) + '-01-01',
      status: 'active', createdAt: new Date().toISOString()
    }));
    this.saveWorkers(workers);

    const reasons = ['Projek pembinaan urgent','Meeting klien','Kerja-kerja finishing','Site inspection','Dokumentasi tender'];
    const dayTypes = ['weekday','weekday','rest_day','public_holiday'];
    const statuses = ['pending','pending','approved','approved','approved','rejected'];
    const records = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*60));
      const worker = workers[Math.floor(Math.random()*workers.length)];
      const hours = parseFloat((1+Math.random()*5).toFixed(1));
      const dayType = dayTypes[Math.floor(Math.random()*dayTypes.length)];
      const hourlyRate = (worker.basicSalary/26)/8;
      const mult = {weekday:1.5,rest_day:2.0,public_holiday:3.0}[dayType];
      records.push({
        id: 'OT-' + String(i+1).padStart(3,'0'),
        workerId: worker.id, workerName: worker.name, employeeId: worker.employeeId,
        department: worker.department,
        otDate: d.toISOString().split('T')[0],
        hours, dayType,
        reason: reasons[Math.floor(Math.random()*reasons.length)],
        status: statuses[Math.floor(Math.random()*statuses.length)],
        hoursAmount: parseFloat((hourlyRate*hours*mult).toFixed(2)),
        submittedAt: d.toISOString(), processedBy: 'Puan Rashidah', processedAt: d.toISOString()
      });
    }
    this.saveOTRecords(records);
  }
};

/* ====== UI HELPERS ====== */
const UI = {
  initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const btn = document.getElementById('menu-btn');
    if (btn) btn.addEventListener('click', () => { sidebar && sidebar.classList.toggle('open'); overlay && overlay.classList.toggle('open'); });
    if (overlay) overlay.addEventListener('click', () => { sidebar && sidebar.classList.remove('open'); overlay.classList.remove('open'); });
  },

  initDarkMode() {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('mulia_theme') || 'light');
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.addEventListener('click', () => {
      const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('mulia_theme', t);
    });
  },

  toast(message, type = 'info', duration = 3500) {
    const icons = {
      success:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>',
      error:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      warning:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>'
    };
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<span style="color:var(--' + (type==='error'?'danger':type) + ')">' + (icons[type]||icons.info) + '</span><span style="color:var(--text-primary);flex:1">' + message + '</span>';
    c.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, duration);
  },

  openModal(id) { const m = document.getElementById(id); if(m){m.classList.add('open');document.body.style.overflow='hidden';} },
  closeModal(id) { const m = document.getElementById(id); if(m){m.classList.remove('open');document.body.style.overflow='';} },

  renderUserInfo() {
    const s = Auth.getSession(); if (!s) return;
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = s.name);
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = 'Admin / HR');
    document.querySelectorAll('[data-user-initials]').forEach(el => { const p=s.name.split(' '); el.textContent = p.length>=2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : s.name.substring(0,2).toUpperCase(); });
  },

  setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[href]').forEach(l => { if(l.getAttribute('href')===page) l.classList.add('active'); });
  },

  formatCurrency(v) { return 'RM ' + Number(v).toLocaleString('ms-MY',{minimumFractionDigits:2,maximumFractionDigits:2}); },
  formatDate(d) { if(!d) return '—'; return new Date(d).toLocaleDateString('ms-MY',{day:'2-digit',month:'short',year:'numeric'}); },
  formatDateTime(d) { if(!d) return '—'; return new Date(d).toLocaleString('ms-MY',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); },
  formatDayType(t) { return {weekday:'Hari Biasa',rest_day:'Hari Rehat',public_holiday:'Cuti Umum'}[t]||t; },

  statusBadge(s) {
    const labels = {pending:'Menunggu',approved:'Diluluskan',rejected:'Ditolak',active:'Aktif',inactive:'Tidak Aktif'};
    return '<span class="badge badge-'+s+'">'+(labels[s]||s)+'</span>';
  },

  avatarColor(name) {
    const colors = ['#1a3c5e','#2d7a4f','#a86a0a','#1a5f8c','#6b3fa0','#b53030','#5c4a1e'];
    let h=0; for(let c of (name||'')) h=c.charCodeAt(0)+((h<<5)-h);
    return colors[Math.abs(h)%colors.length];
  },

  initials(name) {
    if(!name) return '?';
    const p=name.split(' ').filter(Boolean);
    return (p.length>=2 ? p[0][0]+p[p.length-1][0] : name.substring(0,2)).toUpperCase();
  }
};

/* ====== EXPORT ====== */
const ExportHelper = {
  toCSV(headers, rows, filename) {
    const content = [headers.join(','), ...rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+content], {type:'text/csv;charset=utf-8;'}));
    a.download = filename || 'export.csv'; a.click();
  },

  printTable(elementId, title) {
    const el = document.getElementById(elementId); if(!el) return;
    const w = window.open('','_blank');
    w.document.write('<html><head><title>'+title+'</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px;}table{width:100%;border-collapse:collapse;}th{background:#1a3c5e;color:#fff;padding:8px;text-align:left;}td{padding:7px 8px;border-bottom:1px solid #eee;}h3{color:#1a3c5e;}.badge{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold;}</style></head><body>');
    w.document.write('<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;border-bottom:2px solid #1a3c5e;padding-bottom:10px;">');
    w.document.write('<div style="width:36px;height:36px;background:#1a3c5e;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#c8a84b;font-weight:bold;font-size:18px;">M</div>');
    w.document.write('<div><div style="font-weight:bold;font-size:14px">Mulia Properties Development Sdn Bhd</div><div style="color:#666;font-size:11px">'+title+'</div></div>');
    w.document.write('<div style="margin-left:auto;color:#666;font-size:11px">Dicetak: '+new Date().toLocaleString('ms-MY')+'</div></div>');
    w.document.write(el.innerHTML+'</body></html>');
    w.document.close(); setTimeout(()=>w.print(),500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  UI.initDarkMode();
  UI.initSidebar();
  UI.renderUserInfo();
  UI.setActiveNav();
  DB.seedSampleData();
});