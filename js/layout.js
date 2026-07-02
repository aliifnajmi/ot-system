/* ============================================
   MULIA OT SYSTEM — Shared Layout Templates
   ============================================ */

const LAYOUT = {
  sidebar() {
    return `
    <div id="sidebar-overlay" class="sidebar-overlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">M</div>
        <div class="brand-text">
          <div class="brand-name">Mulia Properties</div>
          <div class="brand-sub">OT Management</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Utama</div>
        <a class="nav-item" href="dashboard.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>

        <div class="nav-section-label">Pengurusan</div>
        <a class="nav-item" href="workers.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Pekerja
        </a>
        <a class="nav-item" href="submit_ot.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Hantar OT
        </a>
        <a class="nav-item" href="ot_records.html" id="nav-ot-records">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Rekod OT
          <span class="nav-badge" id="pending-badge" style="display:none">0</span>
        </a>
        <a class="nav-item" href="verify.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Semak & Lulus OT
        </a>

        <div class="nav-section-label">Laporan</div>
        <a class="nav-item" href="report.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Laporan & Export
        </a>
        <a class="nav-item" href="audit_log.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Log Audit
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar" data-user-initials>AU</div>
          <div class="user-details">
            <div class="user-name" data-user-name>Admin</div>
            <div class="user-role" data-user-role>Admin / HR</div>
          </div>
          <button class="btn-logout" onclick="Auth.logout()" title="Log Keluar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>`;
  },

  topbar(title, breadcrumb) {
    return `
    <header class="topbar">
      <button class="btn-icon topbar-menu-btn" id="menu-btn" aria-label="Menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div class="page-title-area">
        <div class="page-title">${title}</div>
        ${breadcrumb ? `<div class="page-breadcrumb">${breadcrumb}</div>` : ''}
      </div>
      <div class="topbar-actions">
        <button class="btn-icon" id="dark-mode-btn" title="Tukar Tema">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="btn-icon" onclick="window.location.href='report.html'" title="Export">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <div style="width:1px;height:20px;background:var(--border)"></div>
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="window.location.href='profile.html'">
          <div class="user-avatar" style="width:32px;height:32px;font-size:12px;background:var(--primary)" data-user-initials>AU</div>
          <span style="font-size:13px;font-weight:600;color:var(--text-primary)" data-user-name>Admin</span>
        </div>
      </div>
    </header>`;
  },

  confirmModal() {
    return `
    <div class="modal-overlay" id="confirm-modal">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <div class="modal-title">Pengesahan</div>
          <button class="btn-icon btn-sm" onclick="UI.closeModal('confirm-modal')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p id="confirm-message" style="color:var(--text-secondary);font-size:14px">Adakah anda pasti?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="confirm-cancel" onclick="UI.closeModal('confirm-modal')">Batal</button>
          <button class="btn btn-danger" id="confirm-ok">Teruskan</button>
        </div>
      </div>
    </div>`;
  },

  inject(title, breadcrumb) {
    // Inject sidebar + topbar into page
    const appLayout = document.getElementById('app-layout');
    if (!appLayout) return;

    const mainContent = appLayout.querySelector('.main-content');
    const sidebarHTML = this.sidebar();
    const topbarHTML = this.topbar(title, breadcrumb);
    const confirmHTML = this.confirmModal();

    appLayout.insertAdjacentHTML('afterbegin', sidebarHTML);
    if (mainContent) mainContent.insertAdjacentHTML('afterbegin', topbarHTML);
    document.body.insertAdjacentHTML('beforeend', confirmHTML);

    // Update pending badge
    setTimeout(() => {
      const stats = DB.getDashboardStats();
      const badge = document.getElementById('pending-badge');
      if (badge && stats.pendingOT > 0) {
        badge.textContent = stats.pendingOT;
        badge.style.display = 'flex';
      }
    }, 100);
  }
};