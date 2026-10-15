/* ============================================
   OFFICER.JS — Officer Dashboard Logic
   Smart Grievance Management System
   ============================================ */

'use strict';

let officerSession   = null;
let deptComplaints   = [];
let filteredDept     = [];
let allSysComplaints = [];
let filteredAll      = [];
let activeComplaintId = null;

/* Chart instances */
let statusChartInst = null;
let doughnutChartInst = null;
let categoryChartInst = null;
let statusDistInst    = null;
let trendChartInst    = null;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  officerSession = requireOfficerAuth();
  if (!officerSession) return;

  populateOfficerUI();
  loadOfficerDashboard();
});

/* ================================================================
   POPULATE UI
   ================================================================ */
function populateOfficerUI() {
  const { name, dept, id } = officerSession;

  setEl('officerSidebarName',   name);
  setEl('officerSidebarDept',   dept);
  setEl('officerSidebarId',     'ID: ' + id);
  setEl('officerTopbarName',    name.split(' ')[0]);
  setEl('officerDeptLabel',     dept);
  setEl('officerWelcomeName',   name.split(' ')[0]);
  setEl('officerDeptTagText',   dept);
  setEl('officerDeptTagText2',  dept);
  setEl('officerDeptChip',      '');

  // Profile
  setEl('officerProfileName',   name);
  setEl('officerProfileDept',   'Department: ' + dept);
  setEl('officerProfileId',     'Officer ID: ' + id);
  setVal('officerNameInput',    name);
  setVal('officerDeptInput',    dept);
  setVal('officerIdInput',      id);

  // Dept tag elements
  const tag  = document.getElementById('officerDeptTag');
  const tag2 = document.getElementById('officerDeptTag2');
  const chip = document.getElementById('officerDeptChip');
  const icon = getDeptIcon(dept);
  const html = `<i class="fas ${icon} me-1"></i>${dept}`;
  if (tag)  tag.innerHTML  = html;
  if (tag2) tag2.innerHTML = html;
  if (chip) chip.innerHTML = `<i class="fas ${icon} me-1"></i><span id="officerDeptLabel">${dept}</span>`;
}

function getDeptIcon(dept) {
  const map = {
    'Water Supply': 'fa-tint', 'Electricity': 'fa-bolt', 'Roads': 'fa-road',
    'Sanitation': 'fa-trash-alt', 'Public Health': 'fa-heartbeat',
    'Drainage': 'fa-water', 'Street Lights': 'fa-lightbulb', 'Others': 'fa-building'
  };
  return map[dept] || 'fa-building';
}

/* ================================================================
   DASHBOARD LOAD
   ================================================================ */
function loadOfficerDashboard() {
  const all = getAllComplaints();
  allSysComplaints = all;

  // Filter by department
  deptComplaints = all.filter(c => {
    if (officerSession.dept === 'Others') return c.category === 'Others';
    return c.category === officerSession.dept;
  });
  filteredDept = [...deptComplaints];

  const total    = deptComplaints.length;
  const pending  = deptComplaints.filter(c => c.status === 'Pending').length;
  const progress = deptComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;

  animateNum('officerTotalCount',      total);
  animateNum('officerPendingCount',    pending);
  animateNum('officerInProgressCount', progress);
  animateNum('officerResolvedCount',   resolved);

  // Badge
  const badge = document.getElementById('newComplaintsBadge');
  if (badge) badge.textContent = pending;

  // Resolution rate
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  setEl('resolutionRateLabel', rate + '%');

  // Charts
  setTimeout(() => {
    renderStatusChart(pending, progress, resolved);
    renderDoughnutChart(pending, progress, resolved);
  }, 300);

  // Recent table (latest 7)
  renderOfficerRecentTable([...deptComplaints].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,7));
}

/* ================================================================
   CHARTS
   ================================================================ */
function renderStatusChart(pending, progress, resolved) {
  const ctx = document.getElementById('officerStatusChart');
  if (!ctx) return;
  if (statusChartInst) statusChartInst.destroy();

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#A0AEC0' : '#4A5568';

  statusChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [{
        label: 'Complaints',
        data: [pending, progress, resolved],
        backgroundColor: ['rgba(198,40,40,0.8)', 'rgba(245,127,23,0.8)', 'rgba(46,125,50,0.8)'],
        borderRadius: 6, borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
        x: { ticks: { color: textColor }, grid: { display: false } }
      }
    }
  });
}

function renderDoughnutChart(pending, progress, resolved) {
  const ctx = document.getElementById('officerDoughnutChart');
  if (!ctx) return;
  if (doughnutChartInst) doughnutChartInst.destroy();

  doughnutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [{
        data: [pending || 1, progress, resolved],
        backgroundColor: ['#C62828', '#F57F17', '#2E7D32'],
        borderWidth: 3,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#162032' : '#fff',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } }
    }
  });
}

/* ================================================================
   RECENT TABLE
   ================================================================ */
function renderOfficerRecentTable(data) {
  const tbody = document.getElementById('officerRecentTable');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted"><i class="fas fa-inbox me-2"></i>No complaints yet</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td><span class="complaint-id-chip">${c.id}</span></td>
      <td>${c.name}</td>
      <td style="font-size:12px;color:var(--text-muted)">${c.location}</td>
      <td>${formatDate(c.date)}</td>
      <td>${statusBadge(c.status)}</td>
      <td>
        <div class="officer-actions">
          <button class="btn-action-sm btn-action-view" onclick="openActionModal('${c.id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
      </td>
    </tr>`).join('');
}

/* ================================================================
   COMPLAINTS TABLE (dept filtered)
   ================================================================ */
function filterOfficerComplaints() {
  const search = (document.getElementById('officerSearchInput')?.value || '').toLowerCase();
  const status = document.getElementById('officerStatusFilter')?.value || '';

  filteredDept = deptComplaints.filter(c => {
    const matchSearch = !search || c.id.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) || c.location.toLowerCase().includes(search) ||
      c.title.toLowerCase().includes(search);
    const matchStatus = !status || c.status === status;
    return matchSearch && matchStatus;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  renderOfficerComplaintsTable();
}

function clearOfficerFilters() {
  setVal('officerSearchInput', '');
  setVal('officerStatusFilter', '');
  filteredDept = [...deptComplaints];
  renderOfficerComplaintsTable();
}

function renderOfficerComplaintsTable() {
  const tbody = document.getElementById('officerComplaintsBody');
  const count = document.getElementById('officerComplaintCount');
  if (count) count.textContent = filteredDept.length + ' item' + (filteredDept.length !== 1 ? 's' : '');

  if (!tbody) return;
  if (filteredDept.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">
      <i class="fas fa-inbox fa-2x mb-2 d-block"></i>No complaints found
    </td></tr>`;
    return;
  }
  tbody.innerHTML = filteredDept.map(c => `
    <tr>
      <td><span class="complaint-id-chip">${c.id}</span></td>
      <td>${c.name}</td>
      <td style="font-size:12px;max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.location}</td>
      <td style="font-size:12px;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-muted)">${c.description.slice(0,60)}…</td>
      <td>${formatDate(c.date)}</td>
      <td>${statusBadge(c.status)}</td>
      <td>
        <div class="officer-actions">
          <button class="btn-action-sm btn-action-view"     onclick="openActionModal('${c.id}')"><i class="fas fa-eye"></i> View</button>
          <button class="btn-action-sm btn-action-progress" onclick="quickUpdate('${c.id}','In Progress')"><i class="fas fa-spinner"></i></button>
          <button class="btn-action-sm btn-action-resolve"  onclick="quickUpdate('${c.id}','Resolved')"><i class="fas fa-check"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

/* ================================================================
   ALL COMPLAINTS (system-wide read-only)
   ================================================================ */
function filterAllComplaints() {
  const search   = (document.getElementById('allSearchInput')?.value   || '').toLowerCase();
  const status   = document.getElementById('allStatusFilter')?.value   || '';
  const category = document.getElementById('allCategoryFilter')?.value || '';

  filteredAll = allSysComplaints.filter(c => {
    const ms = !search   || c.id.toLowerCase().includes(search) || c.name.toLowerCase().includes(search) || c.location.toLowerCase().includes(search);
    const mst = !status   || c.status   === status;
    const mc  = !category || c.category === category;
    return ms && mst && mc;
  }).sort((a,b) => new Date(b.date)-new Date(a.date));

  renderAllTable();
}
function clearAllFilters() {
  setVal('allSearchInput', '');
  setVal('allStatusFilter', '');
  setVal('allCategoryFilter', '');
  filteredAll = [...allSysComplaints];
  renderAllTable();
}
function renderAllTable() {
  const tbody = document.getElementById('allComplaintsBody');
  const count = document.getElementById('allComplaintCount');
  if (count) count.textContent = filteredAll.length + ' complaints';
  if (!tbody) return;

  if (!filteredAll.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No complaints</td></tr>';
    return;
  }
  tbody.innerHTML = filteredAll.map(c => `
    <tr>
      <td><span class="complaint-id-chip">${c.id}</span></td>
      <td>${c.name}</td>
      <td>${categoryBadge(c.category)}</td>
      <td style="font-size:12px;max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.location}</td>
      <td>${formatDate(c.date)}</td>
      <td>${statusBadge(c.status)}</td>
      <td><button class="btn-action-sm btn-action-view" onclick="openActionModal('${c.id}','view')"><i class="fas fa-eye"></i> View</button></td>
    </tr>`).join('');
}

/* ================================================================
   ACTION MODAL
   ================================================================ */
function openActionModal(id, mode) {
  const all = getAllComplaints();
  const c = all.find(x => x.id === id);
  if (!c) return;
  activeComplaintId = id;

  const body = document.getElementById('actionModalBody');
  if (!body) return;

  body.innerHTML = `
    <div class="complaint-info-block">
      <div class="cib-row">
        <div class="cib-field"><div class="cib-label">Complaint ID</div><div class="cib-value">${c.id}</div></div>
        <div class="cib-field"><div class="cib-label">Status</div><div class="cib-value">${statusBadge(c.status)}</div></div>
        <div class="cib-field"><div class="cib-label">Category</div><div class="cib-value">${categoryBadge(c.category)}</div></div>
        <div class="cib-field"><div class="cib-label">Date</div><div class="cib-value">${formatDate(c.date)}</div></div>
      </div>
      <div class="cib-row">
        <div class="cib-field"><div class="cib-label">Citizen Name</div><div class="cib-value">${c.name}</div></div>
        <div class="cib-field"><div class="cib-label">Mobile</div><div class="cib-value">${c.mobile}</div></div>
        <div class="cib-field" style="flex:2"><div class="cib-label">Location</div><div class="cib-value">${c.location}</div></div>
      </div>
      <div><div class="cib-label mb-1">Title</div><div class="cib-value">${c.title}</div></div>
      <div class="mt-2"><div class="cib-label mb-1">Description</div>
        <div class="complaint-description-box">${c.description}</div>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label fw-bold">Add / Update Remarks</label>
      <textarea class="form-control remarks-input" id="officerRemarksInput" rows="3" placeholder="Enter your remarks or update notes...">${c.remarks || ''}</textarea>
    </div>`;

  const modal = new bootstrap.Modal(document.getElementById('actionModal'));
  modal.show();
}

function markInProgress() {
  updateComplaintStatus(activeComplaintId, 'In Progress');
}
function markResolved() {
  updateComplaintStatus(activeComplaintId, 'Resolved');
}
function quickUpdate(id, status) {
  activeComplaintId = id;
  updateComplaintStatus(id, status);
}

function updateComplaintStatus(id, newStatus) {
  if (!id) return;
  const remarks = document.getElementById('officerRemarksInput')?.value.trim() || '';
  const all = getAllComplaints();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) { showToast('Complaint not found.', 'danger'); return; }

  all[idx].status  = newStatus;
  all[idx].remarks = remarks || all[idx].remarks;
  all[idx].updatedAt = new Date().toISOString();
  saveAllComplaints(all);

  // Close modal if open
  try {
    const modal = bootstrap.Modal.getInstance(document.getElementById('actionModal'));
    if (modal) modal.hide();
  } catch(e) {}

  showToast(`Complaint ${id} marked as "${newStatus}"!`, newStatus === 'Resolved' ? 'success' : 'info');

  // Reload
  loadOfficerDashboard();
  renderOfficerComplaintsTable();
  filterAllComplaints();
}

/* ================================================================
   REPORTS
   ================================================================ */
function loadOfficerReports() {
  const all = getAllComplaints();
  const dept = officerSession.dept;
  const deptData = all.filter(c => c.category === dept);

  const pending  = deptData.filter(c => c.status === 'Pending').length;
  const progress = deptData.filter(c => c.status === 'In Progress').length;
  const resolved = deptData.filter(c => c.status === 'Resolved').length;
  const total    = deptData.length;

  setTimeout(() => {
    // Category Chart (all categories for system overview)
    const cats = ['Water Supply','Electricity','Roads','Drainage','Sanitation','Street Lights','Public Health','Others'];
    const catCounts = cats.map(cat => all.filter(c => c.category === cat).length);
    const ctxCat = document.getElementById('categoryChart');
    if (ctxCat) {
      if (categoryChartInst) categoryChartInst.destroy();
      categoryChartInst = new Chart(ctxCat, {
        type: 'bar',
        data: {
          labels: cats.map(c => c.replace(' ', '\n')),
          datasets: [{
            label: 'Complaints',
            data: catCounts,
            backgroundColor: ['#1976D2','#F57C00','#388E3C','#6A1B9A','#00838F','#E65100','#C62828','#37474F'],
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { ticks: { font: { size: 10 } } } }
        }
      });
    }

    // Status Distribution Pie
    const ctxDist = document.getElementById('statusDistChart');
    if (ctxDist) {
      if (statusDistInst) statusDistInst.destroy();
      statusDistInst = new Chart(ctxDist, {
        type: 'pie',
        data: {
          labels: ['Pending','In Progress','Resolved'],
          datasets: [{ data: [pending||0.1, progress, resolved], backgroundColor: ['#C62828','#F57F17','#2E7D32'], borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    // Monthly Trend
    const months = ['Jul','Aug','Sep','Oct','Nov','Dec'];
    const seed = [total*0.5, total*0.6, total*0.65, total*0.8, total*0.9, total].map(Math.round);
    const ctxTrend = document.getElementById('trendChart');
    if (ctxTrend) {
      if (trendChartInst) trendChartInst.destroy();
      trendChartInst = new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            { label: 'Total Received',  data: seed, borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,0.1)', tension: 0.4, fill: true, borderWidth: 2 },
            { label: 'Resolved',        data: seed.map(v => Math.round(v * 0.7)), borderColor: '#2E7D32', backgroundColor: 'rgba(46,125,50,0.08)', tension: 0.4, fill: true, borderWidth: 2 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { font: { size: 11 }, padding: 12 } } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Summary Table
    const cats2 = ['Water Supply','Electricity','Roads','Drainage','Sanitation','Street Lights','Public Health','Others'];
    const summaryBody = document.getElementById('reportSummaryTable');
    if (summaryBody) {
      let rows = cats2.map(cat => {
        const items = all.filter(c => c.category === cat);
        const t = items.length;
        const p = items.filter(c=>c.status==='Pending').length;
        const i = items.filter(c=>c.status==='In Progress').length;
        const r = items.filter(c=>c.status==='Resolved').length;
        const rate = t > 0 ? Math.round((r/t)*100) : 0;
        return `<tr>
          <td>${categoryBadge(cat)}</td>
          <td><strong>${t}</strong></td>
          <td><span class="status-badge status-pending">${p}</span></td>
          <td><span class="status-badge status-inprogress">${i}</span></td>
          <td><span class="status-badge status-resolved">${r}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="perf-bar-track" style="flex:1;height:6px;background:var(--border);border-radius:3px">
                <div class="perf-bar-fill ${rate>=70?'green':rate>=40?'yellow':'red'}" style="width:${rate}%;height:100%;border-radius:3px"></div>
              </div>
              <span style="font-size:12px;font-weight:700;min-width:30px">${rate}%</span>
            </div>
          </td>
        </tr>`;
      }).join('');
      const totals = cats2.reduce((acc,cat) => {
        const items = all.filter(c=>c.category===cat);
        acc.t += items.length;
        acc.p += items.filter(c=>c.status==='Pending').length;
        acc.i += items.filter(c=>c.status==='In Progress').length;
        acc.r += items.filter(c=>c.status==='Resolved').length;
        return acc;
      }, {t:0,p:0,i:0,r:0});
      rows += `<tr style="background:var(--primary-pale);font-weight:700">
        <td><strong>TOTAL</strong></td>
        <td><strong>${totals.t}</strong></td>
        <td><strong>${totals.p}</strong></td>
        <td><strong>${totals.i}</strong></td>
        <td><strong>${totals.r}</strong></td>
        <td><strong>${totals.t>0?Math.round((totals.r/totals.t)*100):0}% overall</strong></td>
      </tr>`;

      summaryBody.innerHTML = `
        <div class="table-responsive">
          <table class="table dash-table report-summary-table">
            <thead><tr>
              <th>Category</th><th>Total</th><th>Pending</th><th>In Progress</th><th>Resolved</th><th>Resolution Rate</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }
  }, 200);
}

/* ================================================================
   SECTION NAVIGATION
   ================================================================ */
function showOfficerSection(section) {
  const sections = ['dashboard', 'complaints', 'all-complaints', 'reports', 'profile'];
  const labels   = {
    'dashboard': 'Officer Dashboard', 'complaints': 'Department Complaints',
    'all-complaints': 'All Complaints', 'reports': 'Reports & Analytics', 'profile': 'My Profile',
  };

  sections.forEach(s => {
    const el = document.getElementById(`sec-${s}`);
    if (el) el.classList.toggle('d-none', s !== section);
  });

  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('onclick')?.includes(`'${section}'`)) a.classList.add('active');
  });

  setEl('officerBreadcrumb', labels[section] || section);

  if (section === 'dashboard')      { loadOfficerDashboard(); }
  if (section === 'complaints')     { filteredDept = [...deptComplaints]; renderOfficerComplaintsTable(); }
  if (section === 'all-complaints') { filteredAll  = [...allSysComplaints]; renderAllTable(); }
  if (section === 'reports')        { loadOfficerReports(); }

  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================================================================
   PROFILE SAVE
   ================================================================ */
function saveOfficerProfile() {
  const contact = document.getElementById('officerContactInput')?.value.trim();
  const email   = document.getElementById('officerEmailInput')?.value.trim();
  LS.set('officer_profile_' + officerSession.id, { contact, email });
  showToast('Profile saved successfully!', 'success');
}

/* ================================================================
   HELPERS
   ================================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}
function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let count = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const timer = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count;
    if (count >= target) clearInterval(timer);
  }, 30);
}