/* ============================================
   MULIA OT SYSTEM — Shared Layout Builder
   Inject sidebar + topbar into every page
   ============================================ */

function buildLayout(pageId, pageTitle) {
  const session = Auth.requireAuth();
  if (!session) return;

  const sidebarHTML = `
  <aside class="sidebar" id="sidebar" aria-label="Menu navigasi">
    <div class="sidebar-logo">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#c8a44a,#e8c46a);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ti ti-building-skyscraper" style="font-size:20px;color:#0e2240;" aria-hidden="true"></i>
      </div>
      <div class="sidebar-logo-text">
        <h1>Mulia Group</h1>
        <span>Sistem OT</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-section-label">Utama</p>
      <a class="nav-item" data-page="dashboard" href="dashboard.html">
        <i class="ti ti-layout-dashboard" aria-hidden="true"></i> Dashboard
      </a>
      <a class="nav-item" data-page="submit" href="submit_ot.html">
        <i class="ti ti-clock-plus" aria-hidden="true"></i> Hantar OT
      </a>
      <a class="nav-item" data-page="records" href="ot_records.html">
        <i class="ti ti-list-details" aria-hidden="true"></i> Rekod OT
      </a>
      <a class="nav-item" data-page="verify" href="verify.html">
        <i class="ti ti-checks" aria-hidden="true"></i> Lulus / Tolak
        <span id="pending-badge" style="margin-left:auto;background:#c8a44a;color:#0e2240;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;display:none;">0</span>
      </a>

      <p class="nav-section-label">Pengurusan</p>
      <a class="nav-item" data-page="workers" href="workers.html">
        <i class="ti ti-users" aria-hidden="true"></i> Pekerja
      </a>
      <a class="nav-item" data-page="report" href="report.html">
        <i class="ti ti-chart-bar" aria-hidden="true"></i> Laporan
      </a>
      <a class="nav-item" data-page="audit" href="audit_log.html">
        <i class="ti ti-clipboard-list" aria-hidden="true"></i> Log Audit
      </a>

      <p class="nav-section-label">Akaun</p>
      <a class="nav-item" data-page="profile" href="profile.html">
        <i class="ti ti-user-circle" aria-hidden="true"></i> Profil Admin
      </a>
    </nav>

    <div class="sidebar-footer">
      <div style="font-weight:600;color:rgba(255,255,255,0.6);font-size:11px;">Mulia Properties Development</div>
      <div style="font-size:10px;margin-top:2px;">Sdn Bhd &bull; v${CONFIG.SYSTEM_VERSION}</div>
    </div>
  </aside>`;

  const topbarHTML = `
  <header class="topbar" role="banner">
    <div class="topbar-left">
      <button class="topbar-btn menu-toggle" id="menu-toggle" aria-label="Buka menu" onclick="toggleSidebar()">
        <i class="ti ti-menu-2" aria-hidden="true"></i>
      </button>
      <div>
        <div class="topbar-title">${pageTitle}</div>
        <div class="breadcrumb">Mulia Group &rsaquo; ${pageTitle}</div>
      </div>
    </div>
    <div class="topbar-right">
      <button class="topbar-btn" id="dark-mode-toggle" title="Mod Gelap" aria-label="Tukar mod gelap/terang">
        <i class="ti ti-moon" aria-hidden="true"></i>
      </button>
      <button class="topbar-btn" title="Notifikasi" aria-label="Notifikasi">
        <i class="ti ti-bell" aria-hidden="true"></i>
      </button>
      <div class="user-avatar" onclick="window.location.href='profile.html'" title="Profil Admin" role="button" tabindex="0" aria-label="Profil Admin">
        HR
      </div>
      <button class="btn btn-outline btn-sm no-print" onclick="Auth.logout()" title="Log Keluar">
        <i class="ti ti-logout" aria-hidden="true"></i>
      </button>
    </div>
  </header>`;

  // Inject into body
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML + topbarHTML);

  // Set active page
  setActivePage(pageId);
  initDarkMode();
  loadPendingCount();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

async function loadPendingCount() {
  try {
    const data = await API.get('getPendingCount');
    const badge = document.getElementById('pending-badge');
    if (badge && data.count > 0) {
      badge.textContent = data.count;
      badge.style.display = 'inline';
    }
  } catch (e) {
    // Senyap — jangan tunjuk error untuk badge
  }
}