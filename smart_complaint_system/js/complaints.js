/* ============================================
   COMPLAINTS.JS — Complaints CRUD Logic
   Smart Grievance Management System
   ============================================ */

'use strict';

/* ----------------------------------------------------------------
   STATE
   ---------------------------------------------------------------- */
let currentSession   = null;   // citizen or officer session
let currentRole      = null;   // 'citizen' | 'officer'
let allComplaints    = [];     // full complaints array from localStorage
let filteredList     = [];     // after search/filter applied
let currentPage      = 1;
const PAGE_SIZE      = 10;
let currentView      = 'table'; // 'table' | 'card'
let activeRemarksId  = null;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Determine who is logged in
  const officer = getCurrentOfficer();
  const citizen = getCurrentCitizen();

  if (officer) {
    currentSession = officer;
    currentRole    = 'officer';
  } else if (citizen) {
    currentSession = citizen;
    currentRole    = 'citizen';
  } else {
    window.location.href = 'index.html';
    return;
  }

  populateComplaintsUI();
  loadComplaints();
  updateDatetime();
  setInterval(updateDatetime, 1000);
  initTheme();
});

/* ================================================================
   POPULATE UI — sidebar, user chip, role label
   ================================================================ */
function populateComplaintsUI() {
  const isOfficer = currentRole === 'officer';

  // Role label
  setEl('complaintsRoleLabel', isOfficer ? 'Officer Panel' : 'Citizen Panel');

  // Sidebar profile
  const name = isOfficer ? currentSession.name : currentSession.name;
  const sub  = isOfficer ? ('Dept: ' + currentSession.dept) : ('Mobile: ' + currentSession.mobile);
  setEl('complaintsSidebarName', name);
  setEl('complaintsSidebarSub',  sub);
  setEl('complaintsTopbarUser',  name.split(' ')[0]);

  // Page title
  setEl('complaintsPageTitle', isOfficer ? 'All Complaints' : 'My Complaints');
  setEl('complaintsPageSub',   isOfficer ? 'View, filter and manage citizen complaints' : 'Track and manage your submitted complaints');

  // Sidebar nav
  buildSidebarNav();

  // Show/hide raise button
  const raiseBtn = document.getElementById('citizenComplaintActions');
  if (raiseBtn) raiseBtn.style.display = isOfficer ? 'none' : 'flex';

  // Theme toggle
  const btn = document.getElementById('themeToggle4');
  if (btn) btn.addEventListener('click', toggleTheme);
}

function buildSidebarNav() {
  const nav = document.getElementById('complaintsSidebarNav');
  if (!nav) return;
  const isOfficer = currentRole === 'officer';

  const citizenLinks = [
    { href: 'citizen-dashboard.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: 'complaints.html',        icon: 'fa-clipboard-list', label: 'My Complaints', active: true },
    { href: 'reports.html',           icon: 'fa-chart-bar',      label: 'Reports' },
  ];
  const officerLinks = [
    { href: 'officer-dashboard.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: 'complaints.html',        icon: 'fa-clipboard-list', label: 'Complaints', active: true },
    { href: 'reports.html',           icon: 'fa-chart-bar',      label: 'Reports' },
  ];

  const links = isOfficer ? officerLinks : citizenLinks;
  nav.innerHTML = links.map(l => `
    <a href="${l.href}" class="nav-item ${l.active ? 'active' : ''}">
      <i class="fas ${l.icon}"></i><span>${l.label}</span>
    </a>
  `).join('') + `
    <a href="#" class="nav-item" onclick="handleLogout(event)">
      <i class="fas fa-sign-out-alt"></i><span>Logout</span>
    </a>`;
}

/* ================================================================
   LOAD & RENDER
   ================================================================ */
function loadComplaints() {
  allComplaints = getAllComplaints();

  if (currentRole === 'citizen') {
    allComplaints = allComplaints.filter(c => c.citizen === currentSession.mobile);
  } else if (currentRole === 'officer') {
    // Officers see complaints for their department
    allComplaints = allComplaints.filter(c => c.category === currentSession.dept);
  }

  applyAdvancedFilters();
}

function renderComplaintsTable(list) {
  const tbody = document.getElementById('fullComplaintsBody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-5">
      <i class="fas fa-clipboard fa-3x text-muted mb-3 d-block"></i>
      <span class="text-muted">No complaints found</span>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const badge = statusBadge(c.status);
    const catIcon = categoryIcon(c.category);
    const isOfficer = currentRole === 'officer';
    const actionBtns = isOfficer
      ? `<button class="btn btn-sm btn-outline-primary me-1" onclick="openComplaintDetail('${c.id}')" title="View Details">
           <i class="fas fa-eye"></i>
         </button>
         <button class="btn btn-sm btn-outline-success" onclick="openRemarksModal('${c.id}')" title="Add Remarks">
           <i class="fas fa-comment-dots"></i>
         </button>`
      : `<button class="btn btn-sm btn-outline-primary" onclick="openComplaintDetail('${c.id}')" title="View Details">
           <i class="fas fa-eye"></i>
         </button>`;

    return `<tr>
      <td><code class="complaint-id">${c.id}</code></td>
      <td><span class="cat-tag"><i class="fas ${catIcon} me-1"></i>${c.category}</span></td>
      <td>${esc(c.name)}</td>
      <td class="complaint-title-cell" title="${esc(c.title)}">${esc(c.title)}</td>
      <td><small><i class="fas fa-map-marker-alt text-muted me-1"></i>${esc(c.location)}</small></td>
      <td><small>${formatDate(c.date)}</small></td>
      <td>${badge}</td>
      <td><small class="text-muted">${c.remarks ? esc(c.remarks).substring(0, 40) + (c.remarks.length > 40 ? '…' : '') : '—'}</small></td>
      <td>${actionBtns}</td>
    </tr>`;
  }).join('');
}

function renderComplaintCards(list) {
  const grid = document.getElementById('complaintCardsGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div class="col-12 text-center py-5">
      <i class="fas fa-clipboard fa-3x text-muted mb-3 d-block"></i>
      <span class="text-muted">No complaints found</span>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(c => {
    const badge = statusBadge(c.status);
    const catIcon = categoryIcon(c.category);
    const isOfficer = currentRole === 'officer';
    return `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="complaint-card" onclick="openComplaintDetail('${c.id}')">
        <div class="cc-header">
          <div class="cc-cat"><i class="fas ${catIcon} me-1"></i>${esc(c.category)}</div>
          ${badge}
        </div>
        <div class="cc-id"><code>${c.id}</code></div>
        <div class="cc-title">${esc(c.title)}</div>
        <div class="cc-meta">
          <span><i class="fas fa-user me-1"></i>${esc(c.name)}</span>
          <span><i class="fas fa-map-marker-alt me-1"></i>${esc(c.location)}</span>
          <span><i class="fas fa-calendar me-1"></i>${formatDate(c.date)}</span>
        </div>
        ${c.remarks ? `<div class="cc-remarks"><i class="fas fa-comment me-1"></i>${esc(c.remarks).substring(0, 60)}${c.remarks.length > 60 ? '…' : ''}</div>` : ''}
        <div class="cc-footer">
          <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); openComplaintDetail('${c.id}')">
            <i class="fas fa-eye me-1"></i>View
          </button>
          ${isOfficer ? `<button class="btn btn-sm btn-outline-success ms-2" onclick="event.stopPropagation(); openRemarksModal('${c.id}')">
            <i class="fas fa-comment-dots me-1"></i>Remarks
          </button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ================================================================
   FILTERS & SEARCH
   ================================================================ */
function applyAdvancedFilters() {
  const search   = (document.getElementById('advSearchInput')?.value  || '').toLowerCase();
  const status   =  document.getElementById('advStatusFilter')?.value  || '';
  const category =  document.getElementById('advCategoryFilter')?.value || '';
  const sort     =  document.getElementById('advSortFilter')?.value    || 'date-desc';

  filteredList = allComplaints.filter(c => {
    const matchSearch = !search ||
      c.id.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) ||
      c.location.toLowerCase().includes(search) ||
      c.title.toLowerCase().includes(search);
    const matchStatus   = !status   || c.status   === status;
    const matchCategory = !category || c.category === category;
    return matchSearch && matchStatus && matchCategory;
  });

  // Sort
  filteredList.sort((a, b) => {
    if (sort === 'date-asc')  return new Date(a.date) - new Date(b.date);
    if (sort === 'status')    return a.status.localeCompare(b.status);
    if (sort === 'category')  return a.category.localeCompare(b.category);
    return new Date(b.date) - new Date(a.date); // date-desc default
  });

  currentPage = 1;
  updateMiniStats();
  updateCountDisplay();
  renderPage();
}

function clearAdvancedFilters() {
  const ids = ['advSearchInput','advStatusFilter','advCategoryFilter'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const sortEl = document.getElementById('advSortFilter');
  if (sortEl) sortEl.value = 'date-desc';
  applyAdvancedFilters();
}

/* ================================================================
   PAGINATION
   ================================================================ */
function renderPage() {
  const start  = (currentPage - 1) * PAGE_SIZE;
  const end    = start + PAGE_SIZE;
  const pageItems = filteredList.slice(start, end);

  if (currentView === 'table') {
    renderComplaintsTable(pageItems);
  } else {
    renderComplaintCards(pageItems);
  }
  renderPagination();
}

function renderPagination() {
  const total     = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  setEl('pageInfo', `Page ${currentPage} of ${totalPages}`);

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;

  const nums = document.getElementById('pageNumbers');
  if (!nums) return;

  let pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  nums.innerHTML = pages.map(p =>
    p === '...'
      ? `<span class="page-ellipsis">…</span>`
      : `<button class="page-num-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`
  ).join('');
}

function changePage(dir) {
  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  currentPage = Math.max(1, Math.min(totalPages, currentPage + dir));
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPage(p) {
  currentPage = p;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================================================================
   VIEW TOGGLE
   ================================================================ */
function switchView(view) {
  currentView = view;
  const tableView  = document.getElementById('tableView');
  const cardView   = document.getElementById('cardView');
  const tableBtn   = document.getElementById('tableViewBtn');
  const cardBtn    = document.getElementById('cardViewBtn');

  if (view === 'table') {
    tableView?.classList.remove('d-none');
    cardView?.classList.add('d-none');
    tableBtn?.classList.add('active');
    cardBtn?.classList.remove('active');
  } else {
    tableView?.classList.add('d-none');
    cardView?.classList.remove('d-none');
    cardBtn?.classList.add('active');
    tableBtn?.classList.remove('active');
  }
  renderPage();
}

/* ================================================================
   MINI STATS
   ================================================================ */
function updateMiniStats() {
  const base = currentRole === 'citizen'
    ? getAllComplaints().filter(c => c.citizen === currentSession.mobile)
    : getAllComplaints().filter(c => c.category === currentSession.dept);

  setEl('cs_total',    base.length);
  setEl('cs_pending',  base.filter(c => c.status === 'Pending').length);
  setEl('cs_progress', base.filter(c => c.status === 'In Progress').length);
  setEl('cs_resolved', base.filter(c => c.status === 'Resolved').length);
}

function updateCountDisplay() {
  setEl('showingCount',       Math.min(filteredList.length, PAGE_SIZE));
  setEl('totalComplaintsCount', filteredList.length);
}

/* ================================================================
   COMPLAINT DETAIL MODAL
   ================================================================ */
function openComplaintDetail(id) {
  const c = getAllComplaints().find(x => x.id === id);
  if (!c) return;

  setEl('detailModalId', c.id);

  const isOfficer = currentRole === 'officer';
  const statusClass = c.status === 'Resolved' ? 'success' : c.status === 'In Progress' ? 'warning' : 'danger';
  const catIcon = categoryIcon(c.category);

  document.getElementById('complaintDetailBody').innerHTML = `
    <div class="complaint-detail-grid">
      <!-- Status Banner -->
      <div class="detail-status-banner detail-status-${statusClass}">
        <i class="fas fa-${statusClass === 'success' ? 'check-circle' : statusClass === 'warning' ? 'clock' : 'exclamation-circle'} me-2"></i>
        Status: <strong>${c.status}</strong>
      </div>

      <!-- Info Row -->
      <div class="detail-info-row mt-3">
        <div class="detail-info-block">
          <label>Complaint ID</label>
          <code>${c.id}</code>
        </div>
        <div class="detail-info-block">
          <label>Date Submitted</label>
          <span>${formatDate(c.date)}</span>
        </div>
        <div class="detail-info-block">
          <label>Category</label>
          <span><i class="fas ${catIcon} me-1"></i>${c.category}</span>
        </div>
      </div>

      <!-- Citizen Info -->
      <div class="detail-section mt-3">
        <h6 class="detail-section-title"><i class="fas fa-user me-2"></i>Citizen Details</h6>
        <div class="detail-info-row">
          <div class="detail-info-block">
            <label>Full Name</label>
            <span>${esc(c.name)}</span>
          </div>
          <div class="detail-info-block">
            <label>Mobile</label>
            <span>${c.mobile}</span>
          </div>
          <div class="detail-info-block">
            <label>Location</label>
            <span>${esc(c.location)}</span>
          </div>
        </div>
      </div>

      <!-- Complaint Info -->
      <div class="detail-section mt-3">
        <h6 class="detail-section-title"><i class="fas fa-file-alt me-2"></i>Complaint Details</h6>
        <div class="mb-2"><label class="detail-label">Title</label>
          <p class="detail-value">${esc(c.title)}</p>
        </div>
        <div><label class="detail-label">Description</label>
          <p class="detail-value detail-description">${esc(c.description)}</p>
        </div>
      </div>

      <!-- Remarks -->
      <div class="detail-section mt-3">
        <h6 class="detail-section-title"><i class="fas fa-comment-dots me-2"></i>Officer Remarks</h6>
        <p class="detail-value ${!c.remarks ? 'text-muted' : ''}">
          ${c.remarks ? esc(c.remarks) : 'No remarks added yet.'}
        </p>
      </div>
    </div>`;

  // Footer actions
  const footer = document.getElementById('complaintDetailFooter');
  if (footer) {
    footer.innerHTML = isOfficer
      ? `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
         <button class="btn btn-primary" onclick="openRemarksModal('${c.id}'); bootstrap.Modal.getInstance(document.getElementById('complaintDetailModal')).hide()">
           <i class="fas fa-comment-dots me-1"></i>Add Remarks
         </button>`
      : `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`;
  }

  const modal = new bootstrap.Modal(document.getElementById('complaintDetailModal'));
  modal.show();
}

/* ================================================================
   REMARKS MODAL (Officer only)
   ================================================================ */
function openRemarksModal(id) {
  const c = getAllComplaints().find(x => x.id === id);
  if (!c || currentRole !== 'officer') return;
  activeRemarksId = id;

  setEl('remarksComplaintId', id);
  const sel = document.getElementById('remarksStatusSelect');
  if (sel) sel.value = c.status;
  const ta = document.getElementById('remarksTextarea');
  if (ta) ta.value = c.remarks || '';

  const modal = new bootstrap.Modal(document.getElementById('remarksModal'));
  modal.show();
}

function saveRemarks() {
  if (!activeRemarksId) return;
  const newStatus  = document.getElementById('remarksStatusSelect')?.value || 'Pending';
  const newRemarks = document.getElementById('remarksTextarea')?.value.trim() || '';

  const all = getAllComplaints();
  const idx = all.findIndex(c => c.id === activeRemarksId);
  if (idx === -1) return;

  all[idx].status  = newStatus;
  all[idx].remarks = newRemarks;
  saveAllComplaints(all);

  bootstrap.Modal.getInstance(document.getElementById('remarksModal'))?.hide();
  showToast('Remarks saved successfully!', 'success');
  loadComplaints();
}

/* ================================================================
   RAISE COMPLAINT (Citizen)
   ================================================================ */
function navigateToRaise() {
  window.location.href = 'citizen-dashboard.html?action=raise';
}

/* ================================================================
   LOGOUT
   ================================================================ */
function handleLogout(e) {
  e.preventDefault();
  LS.remove('grievance_citizen_session');
  LS.remove('grievance_officer_session');
  window.location.href = 'index.html';
}

/* ================================================================
   THEME
   ================================================================ */
function initTheme() {
  const saved = localStorage.getItem('grievance_theme') || 'light';
  document.body.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('grievance_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon4');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ================================================================
   DATETIME
   ================================================================ */
function updateDatetime() {
  const el = document.getElementById('complaintsDatetime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
    + ' ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}

/* ================================================================
   HELPERS
   ================================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function statusBadge(status) {
  const map = {
    'Pending':     'badge-status pending',
    'In Progress': 'badge-status in-progress',
    'Resolved':    'badge-status resolved',
  };
  return `<span class="${map[status] || 'badge bg-secondary'}">${status}</span>`;
}

function categoryIcon(cat) {
  const icons = {
    'Water Supply':  'fa-tint',
    'Electricity':   'fa-bolt',
    'Roads':         'fa-road',
    'Drainage':      'fa-water',
    'Sanitation':    'fa-trash-alt',
    'Street Lights': 'fa-lightbulb',
    'Public Health': 'fa-heartbeat',
    'Others':        'fa-ellipsis-h',
  };
  return icons[cat] || 'fa-tag';
}

function showToast(msg, type = 'info') {
  const existing = document.getElementById('grievanceToast');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'grievanceToast';
  div.className = `toast-notification toast-${type}`;
  div.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>${msg}`;
  document.body.appendChild(div);
  setTimeout(() => div.classList.add('show'), 10);
  setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 400); }, 3000);
}
