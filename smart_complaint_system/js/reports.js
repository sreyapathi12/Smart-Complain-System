/* ============================================
   REPORTS.JS — Charts & Reports Logic
   Smart Grievance Management System
   ============================================ */

'use strict';

/* ----------------------------------------------------------------
   STATE
   ---------------------------------------------------------------- */
let reportSession  = null;
let reportRole     = null;
let reportData     = [];     // complaints scoped to this user/officer
let allData        = [];     // full complaints list
let activeTab      = 'overview';

/* Chart instances */
let statusPieChart     = null;
let categoryBarChart   = null;
let trendLineChart     = null;
let resolutionDoughnut = null;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const officer = getCurrentOfficer();
  const citizen = getCurrentCitizen();

  if (officer) {
    reportSession = officer;
    reportRole    = 'officer';
  } else if (citizen) {
    reportSession = citizen;
    reportRole    = 'citizen';
  } else {
    window.location.href = 'index.html';
    return;
  }

  populateReportsUI();
  loadReportData();
  updateDatetime();
  setInterval(updateDatetime, 1000);
  initTheme();
});

/* ================================================================
   POPULATE UI
   ================================================================ */
function populateReportsUI() {
  const isOfficer = reportRole === 'officer';
  const name      = reportSession.name;
  const sub       = isOfficer ? ('Dept: ' + reportSession.dept) : ('Mobile: ' + reportSession.mobile);

  setEl('complaintsRoleLabel',  isOfficer ? 'Officer Panel' : 'Citizen Panel');
  setEl('complaintsSidebarName', name);
  setEl('complaintsSidebarSub',  sub);
  setEl('complaintsTopbarUser',  name.split(' ')[0]);

  buildReportSidebarNav();

  const btn = document.getElementById('themeToggle4');
  if (btn) btn.addEventListener('click', toggleTheme);
}

function buildReportSidebarNav() {
  const nav = document.getElementById('complaintsSidebarNav');
  if (!nav) return;
  const isOfficer = reportRole === 'officer';

  const citizenLinks = [
    { href: 'citizen-dashboard.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: 'complaints.html',        icon: 'fa-clipboard-list', label: 'My Complaints' },
    { href: 'reports.html',           icon: 'fa-chart-bar',      label: 'Reports', active: true },
  ];
  const officerLinks = [
    { href: 'officer-dashboard.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: 'complaints.html',        icon: 'fa-clipboard-list', label: 'Complaints' },
    { href: 'reports.html',           icon: 'fa-chart-bar',      label: 'Reports', active: true },
  ];

  const links = isOfficer ? officerLinks : citizenLinks;
  nav.innerHTML = links.map(l => `
    <a href="${l.href}" class="nav-item ${l.active ? 'active' : ''}">
      <i class="fas ${l.icon}"></i><span>${l.label}</span>
    </a>`).join('') + `
    <a href="#" class="nav-item" onclick="handleLogout(event)">
      <i class="fas fa-sign-out-alt"></i><span>Logout</span>
    </a>`;
}

/* ================================================================
   LOAD DATA & RENDER EVERYTHING
   ================================================================ */
function loadReportData() {
  allData    = getAllComplaints();
  reportData = reportRole === 'citizen'
    ? allData.filter(c => c.citizen === reportSession.mobile)
    : allData.filter(c => c.category === reportSession.dept);

  renderHeroBanner();
  renderKPICards();
  renderCategoryBreakdown();
  renderStatusPieChart();
  renderCategoryBarChart();
  renderTrendLineChart();
  renderResolutionDoughnut();
  renderCategoryTable();
  renderRecentTable();
}

/* ================================================================
   HERO BANNER
   ================================================================ */
function renderHeroBanner() {
  const banner = document.getElementById('reportHeroBanner');
  if (!banner) return;

  const isOfficer = reportRole === 'officer';
  const title = isOfficer
    ? `Analytics Report — ${reportSession.dept} Department`
    : `My Complaints Report — ${reportSession.name}`;
  const sub = isOfficer
    ? `Comprehensive data for your department · Generated on ${formatDate(new Date().toISOString().split('T')[0])}`
    : `All grievances filed by you · Generated on ${formatDate(new Date().toISOString().split('T')[0])}`;

  banner.innerHTML = `
    <div>
      <p class="report-hero-title"><i class="fas fa-chart-line me-2"></i>${title}</p>
      <p class="report-hero-sub">${sub}</p>
    </div>
    <div class="export-toolbar">
      <button class="btn-export-csv" onclick="exportCSV()">
        <i class="fas fa-file-csv"></i> Export CSV
      </button>
      <button class="btn-print-report" onclick="window.print()">
        <i class="fas fa-print"></i> Print
      </button>
    </div>`;
}

/* ================================================================
   KPI CARDS
   ================================================================ */
function renderKPICards() {
  const container = document.getElementById('reportKPICards');
  if (!container) return;

  const total     = reportData.length;
  const pending   = reportData.filter(c => c.status === 'Pending').length;
  const progress  = reportData.filter(c => c.status === 'In Progress').length;
  const resolved  = reportData.filter(c => c.status === 'Resolved').length;
  const rate      = total ? Math.round((resolved / total) * 100) : 0;

  const cards = [
    { cls: 'blue',   icon: 'fa-clipboard-list', num: total,    label: 'Total Complaints',   change: '' },
    { cls: 'red',    icon: 'fa-exclamation-circle', num: pending,  label: 'Pending',           change: pending > 0 ? `<span class="kpi-change down"><i class="fas fa-arrow-up"></i> Needs attention</span>` : '' },
    { cls: 'yellow', icon: 'fa-spinner',         num: progress, label: 'In Progress',        change: '' },
    { cls: 'green',  icon: 'fa-check-circle',    num: resolved, label: 'Resolved',           change: `<span class="kpi-change up"><i class="fas fa-check"></i> ${rate}% resolution rate</span>` },
    { cls: 'teal',   icon: 'fa-percentage',      num: rate + '%', label: 'Resolution Rate',  change: '' },
  ];

  container.innerHTML = cards.map(c => `
    <div class="col-6 col-md-4 col-xl">
      <div class="kpi-card ${c.cls}">
        <div class="kpi-icon"><i class="fas ${c.icon}"></i></div>
        <div>
          <div class="kpi-num">${c.num}</div>
          <div class="kpi-label">${c.label}</div>
          ${c.change}
        </div>
      </div>
    </div>`).join('');
}

/* ================================================================
   CATEGORY BREAKDOWN GRID
   ================================================================ */
function renderCategoryBreakdown() {
  const grid = document.getElementById('catBreakdownGrid');
  if (!grid) return;

  const cats = getCategoryCounts(reportData);
  const total = reportData.length || 1;
  const catMeta = {
    'Water Supply':  { icon: 'fa-tint',       bg: '#E3F2FD', color: '#1565C0' },
    'Electricity':   { icon: 'fa-bolt',       bg: '#FFF8E1', color: '#F9A825' },
    'Roads':         { icon: 'fa-road',       bg: '#F3E5F5', color: '#7B1FA2' },
    'Drainage':      { icon: 'fa-water',      bg: '#E8F5E9', color: '#2E7D32' },
    'Sanitation':    { icon: 'fa-trash-alt',  bg: '#FBE9E7', color: '#BF360C' },
    'Street Lights': { icon: 'fa-lightbulb',  bg: '#FFFDE7', color: '#F57F17' },
    'Public Health': { icon: 'fa-heartbeat',  bg: '#FCE4EC', color: '#C62828' },
    'Others':        { icon: 'fa-ellipsis-h', bg: '#ECEFF1', color: '#546E7A' },
  };

  if (!cats.length) {
    grid.innerHTML = `<div class="col-12 text-muted text-center py-3">No data available</div>`;
    return;
  }

  grid.innerHTML = cats.map(({ cat, count }) => {
    const m = catMeta[cat] || { icon: 'fa-tag', bg: '#ECEFF1', color: '#546E7A' };
    const pct = Math.round((count / total) * 100);
    return `
    <div class="cat-breakdown-item">
      <div class="cat-breakdown-icon" style="background:${m.bg};color:${m.color}">
        <i class="fas ${m.icon}"></i>
      </div>
      <div class="cat-breakdown-num">${count}</div>
      <div class="cat-breakdown-label">${cat}</div>
      <div class="cat-breakdown-sub">${pct}% of total</div>
    </div>`;
  }).join('');
}

/* ================================================================
   CHART: STATUS PIE
   ================================================================ */
function renderStatusPieChart() {
  const canvas = document.getElementById('statusPieChart');
  if (!canvas) return;

  const pending  = reportData.filter(c => c.status === 'Pending').length;
  const progress = reportData.filter(c => c.status === 'In Progress').length;
  const resolved = reportData.filter(c => c.status === 'Resolved').length;

  if (statusPieChart) { statusPieChart.destroy(); statusPieChart = null; }

  statusPieChart = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [{
        data: [pending, progress, resolved],
        backgroundColor: ['#EF5350', '#FFC107', '#66BB6A'],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.raw;
              const pct = reportData.length ? Math.round((val / reportData.length) * 100) : 0;
              return ` ${ctx.label}: ${val} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/* ================================================================
   CHART: CATEGORY BAR
   ================================================================ */
function renderCategoryBarChart() {
  const canvas = document.getElementById('categoryBarChart');
  if (!canvas) return;

  const cats   = getCategoryCounts(reportData);
  const labels = cats.map(c => c.cat);
  const values = cats.map(c => c.count);

  const colors = [
    '#1565C0','#F9A825','#7B1FA2','#2E7D32',
    '#BF360C','#F57F17','#C62828','#546E7A'
  ];

  if (categoryBarChart) { categoryBarChart.destroy(); categoryBarChart = null; }

  categoryBarChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Complaints',
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length] + 'CC'),
        borderColor:     labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} complaints` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ================================================================
   CHART: MONTHLY TREND LINE
   ================================================================ */
function renderTrendLineChart() {
  const canvas = document.getElementById('trendLineChart');
  if (!canvas) return;

  const months = getLast6Months();
  const counts = months.map(m => reportData.filter(c => c.date && c.date.startsWith(m.key)).length);

  if (trendLineChart) { trendLineChart.destroy(); trendLineChart = null; }

  trendLineChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Complaints Filed',
        data: counts,
        borderColor: '#1565C0',
        backgroundColor: 'rgba(21,101,192,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#1565C0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} filed` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ================================================================
   CHART: RESOLUTION DOUGHNUT
   ================================================================ */
function renderResolutionDoughnut() {
  const canvas = document.getElementById('resolutionDoughnut');
  if (!canvas) return;

  const resolved  = reportData.filter(c => c.status === 'Resolved').length;
  const unresolved = reportData.length - resolved;

  if (resolutionDoughnut) { resolutionDoughnut.destroy(); resolutionDoughnut = null; }

  resolutionDoughnut = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Resolved', 'Unresolved'],
      datasets: [{
        data: [resolved, unresolved],
        backgroundColor: ['#43A047', '#EF5350'],
        borderWidth: 2,
        borderColor: '#fff',
        cutout: '70%',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = reportData.length ? Math.round((ctx.raw / reportData.length) * 100) : 0;
              return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'centerText',
      beforeDraw(chart) {
        const { width, height, ctx } = chart;
        const total = reportData.length;
        const rate  = total ? Math.round((resolved / total) * 100) : 0;
        ctx.save();
        ctx.font = `bold ${Math.min(width, height) * 0.14}px Inter, sans-serif`;
        ctx.fillStyle = '#1565C0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = chart.getDatasetMeta(0).data[0]?.x ?? width / 2;
        const cy = chart.getDatasetMeta(0).data[0]?.y ?? height / 2;
        ctx.fillText(rate + '%', cx, cy - 8);
        ctx.font = `${Math.min(width, height) * 0.07}px Inter, sans-serif`;
        ctx.fillStyle = '#888';
        ctx.fillText('Resolved', cx, cy + 14);
        ctx.restore();
      }
    }]
  });
}

/* ================================================================
   CATEGORY BREAKDOWN TABLE
   ================================================================ */
function renderCategoryTable() {
  const tbody = document.getElementById('categoryTableBody');
  if (!tbody) return;

  const cats  = getCategoryCounts(reportData);
  const total = reportData.length || 1;

  if (!cats.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No data</td></tr>`;
    return;
  }

  tbody.innerHTML = cats.map(({ cat, count }) => {
    const resolved  = reportData.filter(c => c.category === cat && c.status === 'Resolved').length;
    const pending   = reportData.filter(c => c.category === cat && c.status === 'Pending').length;
    const pct       = Math.round((count / total) * 100);
    const resRate   = count ? Math.round((resolved / count) * 100) : 0;
    return `<tr>
      <td><i class="fas ${categoryIcon(cat)} me-2 text-primary"></i>${cat}</td>
      <td class="text-center fw-bold">${count}</td>
      <td class="text-center text-danger">${pending}</td>
      <td class="text-center text-success">${resolved}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="report-bar-cell">
            <div class="report-bar-track">
              <div class="report-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <small class="text-muted">${resRate}%</small>
        </div>
      </td>
    </tr>`;
  }).join('') + `
  <tr class="total-row">
    <td><strong>Total</strong></td>
    <td class="text-center"><strong>${reportData.length}</strong></td>
    <td class="text-center"><strong>${reportData.filter(c=>c.status==='Pending').length}</strong></td>
    <td class="text-center"><strong>${reportData.filter(c=>c.status==='Resolved').length}</strong></td>
    <td><strong>${reportData.length ? Math.round((reportData.filter(c=>c.status==='Resolved').length/reportData.length)*100) : 0}% overall</strong></td>
  </tr>`;
}

/* ================================================================
   RECENT COMPLAINTS TABLE
   ================================================================ */
function renderRecentTable() {
  const tbody = document.getElementById('recentComplaintsBody');
  if (!tbody) return;

  const recent = [...reportData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (!recent.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No recent complaints</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(c => `
    <tr>
      <td><code class="complaint-id">${c.id}</code></td>
      <td><i class="fas ${categoryIcon(c.category)} me-1 text-primary"></i>${c.category}</td>
      <td class="text-truncate" style="max-width:180px" title="${esc(c.title)}">${esc(c.title)}</td>
      <td><small>${esc(c.location)}</small></td>
      <td><small>${formatDate(c.date)}</small></td>
      <td>${statusBadge(c.status)}</td>
    </tr>`).join('');
}

/* ================================================================
   TAB SWITCHING
   ================================================================ */
function switchReportTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.report-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.report-tab-content').forEach(el => {
    el.classList.toggle('active', el.id === 'tab-' + tab);
  });
}

/* ================================================================
   DATE RANGE FILTER
   ================================================================ */
function applyDateFilter() {
  const from = document.getElementById('filterFrom')?.value;
  const to   = document.getElementById('filterTo')?.value;
  const dept = document.getElementById('filterDept')?.value;

  let base = getAllComplaints();
  if (reportRole === 'citizen') base = base.filter(c => c.citizen === reportSession.mobile);
  if (reportRole === 'officer') base = base.filter(c => c.category === reportSession.dept);

  if (from) base = base.filter(c => c.date >= from);
  if (to)   base = base.filter(c => c.date <= to);
  if (dept) base = base.filter(c => c.category === dept);

  reportData = base;
  destroyAllCharts();
  renderKPICards();
  renderCategoryBreakdown();
  renderStatusPieChart();
  renderCategoryBarChart();
  renderTrendLineChart();
  renderResolutionDoughnut();
  renderCategoryTable();
  renderRecentTable();
}

function clearDateFilter() {
  ['filterFrom','filterTo','filterDept'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  loadReportData();
}

function destroyAllCharts() {
  [statusPieChart, categoryBarChart, trendLineChart, resolutionDoughnut].forEach(ch => {
    if (ch) ch.destroy();
  });
  statusPieChart = categoryBarChart = trendLineChart = resolutionDoughnut = null;
}

/* ================================================================
   EXPORT CSV
   ================================================================ */
function exportCSV() {
  const headers = ['ID','Category','Citizen Name','Mobile','Title','Location','Date','Status','Remarks'];
  const rows = reportData.map(c => [
    c.id, c.category, c.name, c.mobile, `"${c.title}"`, c.location, c.date, c.status, `"${c.remarks || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `grievance-report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV exported successfully!', 'success');
}

/* ================================================================
   LOGOUT / THEME / DATETIME
   ================================================================ */
function handleLogout(e) {
  e.preventDefault();
  LS.remove('grievance_citizen_session');
  LS.remove('grievance_officer_session');
  window.location.href = 'index.html';
}

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
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

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
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
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

function getCategoryCounts(data) {
  const counts = {};
  data.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
  return Object.entries(counts)
    .map(([cat, count]) => ({ cat, count }))
    .sort((a, b) => b.count - a.count);
}

function getLast6Months() {
  const result = [];
  const now    = new Date();
  for (let i = 5; i >= 0; i--) {
    const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    result.push({ key, label });
  }
  return result;
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