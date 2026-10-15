/* ============================================
   CITIZEN.JS — Citizen Dashboard Logic
   Smart Grievance Management System
   ============================================ */

'use strict';

let citizenSession = null;
let allMyCcomplaints = [];
let filteredComplaints = [];

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  citizenSession = requireCitizenAuth();
  if (!citizenSession) return;

  populateCitizenUI();
  loadDashboard();
  loadMyComplaints();

  // Set today's date
  const df = document.getElementById('fc_date');
  if (df) df.value = new Date().toISOString().split('T')[0];

  // Char counter for textarea
  const desc = document.getElementById('fc_description');
  if (desc) {
    desc.addEventListener('input', updateCharCounter);
  }
});

/* ================================================================
   POPULATE UI WITH CITIZEN INFO
   ================================================================ */
function populateCitizenUI() {
  const name = citizenSession.name || 'Citizen';
  const mobile = citizenSession.mobile || '——';

  setEl('sidebarUserName',  name);
  setEl('sidebarUserId',    'Mobile: ' + mobile);
  setEl('topbarUserName',   name.split(' ')[0]);
  setEl('welcomeName',      name.split(' ')[0]);
  setEl('profileName',      name);
  setEl('profileMobile',    'Mobile: ' + mobile);
  setEl('profileNameInput', name);
  setEl('profileMobileInput', mobile);
}

/* ================================================================
   DASHBOARD — LOAD STATS
   ================================================================ */
function loadDashboard() {
  const all = getAllComplaints();
  const mine = all.filter(c => c.citizen === citizenSession.mobile);
  allMyCcomplaints = mine;

  const total    = mine.length;
  const pending  = mine.filter(c => c.status === 'Pending').length;
  const progress = mine.filter(c => c.status === 'In Progress').length;
  const resolved = mine.filter(c => c.status === 'Resolved').length;

  animateNum('totalCount',      total);
  animateNum('pendingCount',    pending);
  animateNum('inprogressCount', progress);
  animateNum('resolvedCount',   resolved);

  // Notification badge
  const badge   = document.getElementById('pendingBadge');
  const notifDot = document.getElementById('notifDot');
  if (badge)    badge.textContent = pending;
  if (notifDot) notifDot.style.display = pending > 0 ? 'block' : 'none';

  // Recent complaints (last 5)
  const recent = [...mine].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
  const tbody  = document.getElementById('recentComplaintsTable');
  if (tbody) {
    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-inbox me-2"></i>No complaints yet. Raise your first complaint!</td></tr>';
    } else {
      tbody.innerHTML = recent.map(c => `
        <tr>
          <td><span class="complaint-id-chip">${c.id}</span></td>
          <td>${categoryBadge(c.category)}</td>
          <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.title}</td>
          <td>${formatDate(c.date)}</td>
          <td>${statusBadge(c.status)}</td>
        </tr>`).join('');
    }
  }
}

/* ================================================================
   MY COMPLAINTS — LOAD & FILTER
   ================================================================ */
function loadMyComplaints() {
  const all  = getAllComplaints();
  allMyCcomplaints  = all.filter(c => c.citizen === citizenSession.mobile);
  filteredComplaints = [...allMyCcomplaints].sort((a,b) => new Date(b.date) - new Date(a.date));
  renderComplaintsTable();
}

function filterComplaints() {
  const search   = (document.getElementById('searchInput')?.value   || '').toLowerCase();
  const status   = document.getElementById('statusFilter')?.value   || '';
  const category = document.getElementById('categoryFilter')?.value || '';

  filteredComplaints = allMyCcomplaints.filter(c => {
    const matchSearch   = !search   || c.id.toLowerCase().includes(search) || c.title.toLowerCase().includes(search) || c.location.toLowerCase().includes(search) || c.category.toLowerCase().includes(search);
    const matchStatus   = !status   || c.status === status;
    const matchCategory = !category || c.category === category;
    return matchSearch && matchStatus && matchCategory;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  renderComplaintsTable();
}

function clearFilters() {
  setVal('searchInput', '');
  setVal('statusFilter', '');
  setVal('categoryFilter', '');
  filterComplaints();
}

function renderComplaintsTable() {
  const tbody = document.getElementById('myComplaintsBody');
  const count = document.getElementById('complaintCount');
  if (count) count.textContent = filteredComplaints.length + ' complaint' + (filteredComplaints.length !== 1 ? 's' : '');

  if (!tbody) return;
  if (filteredComplaints.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5">
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
        <h5>No complaints found</h5>
        <p>Try changing filters or raise a new complaint</p>
        <button class="btn btn-raise-complaint" onclick="showSection('raise')">
          <i class="fas fa-plus me-2"></i>Raise Complaint
        </button>
      </div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = filteredComplaints.map(c => `
    <tr>
      <td><span class="complaint-id-chip">${c.id}</span></td>
      <td>${categoryBadge(c.category)}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${c.title}">${c.title}</td>
      <td style="max-width:140px;font-size:12px;color:var(--text-muted)" title="${c.location}">${c.location}</td>
      <td>${formatDate(c.date)}</td>
      <td>${statusBadge(c.status)}</td>
      <td style="max-width:120px;font-size:12px;color:var(--text-muted);font-style:italic">${c.remarks || '<span style="opacity:0.4">No remarks</span>'}</td>
      <td>
        <button class="btn-view-detail" onclick="viewComplaintDetail('${c.id}')">
          <i class="fas fa-eye me-1"></i>View
        </button>
      </td>
    </tr>`).join('');
}

/* ================================================================
   VIEW COMPLAINT DETAIL MODAL
   ================================================================ */
function viewComplaintDetail(id) {
  const complaints = getAllComplaints();
  const c = complaints.find(x => x.id === id);
  if (!c) return;

  const body = document.getElementById('complaintDetailBody');
  if (!body) return;

  body.innerHTML = `
    <div class="p-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="complaint-id-chip fs-6">${c.id}</span>
        ${statusBadge(c.status)}
      </div>
      <div class="complaint-detail-grid">
        <div><div class="detail-field-label">Citizen Name</div><div class="detail-field-value">${c.name}</div></div>
        <div><div class="detail-field-label">Mobile</div><div class="detail-field-value">${c.mobile}</div></div>
        <div><div class="detail-field-label">Category</div><div class="detail-field-value">${categoryBadge(c.category)}</div></div>
        <div><div class="detail-field-label">Date Filed</div><div class="detail-field-value">${formatDate(c.date)}</div></div>
        <div class="col-span-2"><div class="detail-field-label">Location</div><div class="detail-field-value">${c.location}</div></div>
        <div class="col-span-2"><div class="detail-field-label">Title</div><div class="detail-field-value">${c.title}</div></div>
      </div>
      <div class="mb-3">
        <div class="detail-field-label mb-2">Description</div>
        <div class="detail-field-desc">${c.description}</div>
      </div>
      ${c.remarks ? `
      <div class="mb-3">
        <div class="detail-field-label mb-2">Officer Remarks</div>
        <div class="detail-field-desc" style="border-color:var(--warning);background:var(--warning-light);">
          <i class="fas fa-comment-dots me-2" style="color:var(--warning)"></i>${c.remarks}
        </div>
      </div>` : ''}
      <div class="mt-3">
        <div class="detail-field-label mb-2">Complaint Progress</div>
        <div class="track-progress" style="margin:0;padding:20px 0">
          ${buildProgressBar(c.status)}
        </div>
      </div>
    </div>`;

  const modal = new bootstrap.Modal(document.getElementById('complaintDetailModal'));
  modal.show();
}

function buildProgressBar(status) {
  const steps = [
    { label: 'Submitted',    icon: 'fa-paper-plane' },
    { label: 'Assigned',     icon: 'fa-user-check' },
    { label: 'In Progress',  icon: 'fa-tools' },
    { label: 'Resolved',     icon: 'fa-check-double' },
  ];
  const activeIdx = status === 'Pending' ? 0 : status === 'In Progress' ? 2 : 3;
  return `<div class="track-progress" style="position:relative;display:flex;justify-content:space-between;padding:16px 20px">
    <div class="track-progress-fill" style="width:${activeIdx * 33}%;position:absolute;top:32px;left:40px;height:3px;background:var(--success);z-index:1;border-radius:3px;"></div>
    <div style="position:absolute;top:29px;left:40px;right:40px;height:3px;background:var(--border);z-index:0;border-radius:3px;"></div>
    ${steps.map((s,i) => `
      <div class="track-step ${i <= activeIdx ? 'done' : ''} ${i === activeIdx && status !== 'Resolved' ? 'active' : ''}" style="display:flex;flex-direction:column;align-items:center;gap:6px;z-index:2">
        <div class="track-step-dot" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;background:${i < activeIdx ? 'var(--success)' : i === activeIdx ? (status==='Resolved'?'var(--success)':'var(--warning)') : 'var(--bg-card)'};border:2px solid ${i <= activeIdx ? (status==='Resolved'||i<activeIdx?'var(--success)':'var(--warning)') : 'var(--border)'};color:${i<=activeIdx?'#fff':'var(--text-muted)'}">
          <i class="fas ${s.icon}"></i>
        </div>
        <div style="font-size:10px;font-weight:600;color:${i<activeIdx?'var(--success)':i===activeIdx?'var(--warning)':'var(--text-muted)'}">${s.label}</div>
      </div>`).join('')}
  </div>`;
}

/* ================================================================
   RAISE COMPLAINT — SUBMIT
   ================================================================ */
function submitComplaint(e) {
  e.preventDefault();

  const name        = document.getElementById('fc_name')?.value.trim();
  const mobile      = document.getElementById('fc_mobile')?.value.trim();
  const category    = document.getElementById('fc_category')?.value;
  const date        = document.getElementById('fc_date')?.value;
  const title       = document.getElementById('fc_title')?.value.trim();
  const location    = document.getElementById('fc_location')?.value.trim();
  const description = document.getElementById('fc_description')?.value.trim();

  // Validation
  let valid = true;
  const fields = [
    { id: 'fc_name',        val: name,        msg: 'Please enter your name.' },
    { id: 'fc_mobile',      val: mobile,      msg: 'Please enter a valid mobile number.' },
    { id: 'fc_category',    val: category,    msg: 'Please select a category.' },
    { id: 'fc_date',        val: date,        msg: 'Please select a date.' },
    { id: 'fc_title',       val: title,       msg: 'Please enter a complaint title.' },
    { id: 'fc_location',    val: location,    msg: 'Please enter the location.' },
    { id: 'fc_description', val: description, msg: 'Please describe the complaint.' },
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!f.val) {
      el?.classList.add('is-invalid');
      valid = false;
    } else {
      el?.classList.remove('is-invalid');
    }
  });

  if (!valid) { showToast('Please fill all required fields.', 'warning'); return; }

  if (!/^[0-9]{10}$/.test(mobile) && mobile.length !== 10) {
    document.getElementById('fc_mobile')?.classList.add('is-invalid');
    showToast('Please enter a valid 10-digit mobile number.', 'danger');
    return;
  }

  const newId = generateComplaintId();
  const newComplaint = {
    id: newId, name, mobile, category, title, location, description, date,
    status: 'Pending', remarks: '',
    citizen: citizenSession.mobile,
    submittedAt: new Date().toISOString(),
  };

  const all = getAllComplaints();
  all.unshift(newComplaint);
  saveAllComplaints(all);

  // Show success
  const successDiv = document.getElementById('formSuccessAlert');
  const idSpan     = document.getElementById('newComplaintId');
  if (successDiv) {
    successDiv.innerHTML = `
      <div class="complaint-success-alert">
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <div>
          <div class="success-title">Complaint Submitted Successfully!</div>
          <div class="success-id">${newId}</div>
          <div class="success-note">Save this ID to track your complaint. You can also view it under "My Complaints".</div>
        </div>
      </div>`;
    successDiv.classList.remove('d-none');
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  resetComplaintForm();
  loadDashboard();
  loadMyComplaints();

  setTimeout(() => {
    successDiv?.classList.add('d-none');
  }, 8000);
}

function resetComplaintForm() {
  const form = document.getElementById('complaintForm');
  if (form) {
    form.reset();
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }
  const df = document.getElementById('fc_date');
  if (df) df.value = new Date().toISOString().split('T')[0];
  setEl('fileUploadName', '');
  setEl('fc_description', '');
  updateCharCounter();
  // Pre-fill name and mobile
  const nameEl   = document.getElementById('fc_name');
  const mobileEl = document.getElementById('fc_mobile');
  if (nameEl   && citizenSession) nameEl.value   = citizenSession.name   || '';
  if (mobileEl && citizenSession) mobileEl.value = citizenSession.mobile || '';
}

function handleFileUpload(input) {
  const el = document.getElementById('fileUploadName');
  if (!el || !input.files.length) return;
  const f = input.files[0];
  el.innerHTML = `<div class="file-preview-box">
    <div class="file-thumb"><i class="fas fa-image"></i></div>
    <div><div class="file-name">${f.name}</div><div class="file-size">${(f.size/1024).toFixed(1)} KB</div></div>
    <button class="btn-file-remove" onclick="clearFileUpload()"><i class="fas fa-times"></i></button>
  </div>`;
}

function clearFileUpload() {
  document.getElementById('fc_image').value = '';
  setEl('fileUploadName', '');
}

function updateCharCounter() {
  const desc  = document.getElementById('fc_description');
  const counter = document.getElementById('charCounter');
  if (!desc) return;
  const len = desc.value.length;
  if (counter) {
    counter.textContent = len + '/500 characters';
    counter.className = 'char-counter' + (len > 450 ? ' warn' : '') + (len > 500 ? ' over' : '');
  }
}

/* ================================================================
   TRACK COMPLAINT (Dashboard)
   ================================================================ */
function trackComplaintById() {
  const input  = document.getElementById('trackIdInput');
  const result = document.getElementById('trackResultArea');
  if (!input || !result) return;

  const id = input.value.trim().toUpperCase();
  if (!id) { result.innerHTML = '<div class="alert alert-warning mt-3">Please enter a Complaint ID.</div>'; return; }

  const complaints = getAllComplaints();
  const c = complaints.find(x => x.id.toUpperCase() === id);

  if (!c) {
    result.innerHTML = `<div class="alert alert-danger mt-3"><i class="fas fa-times-circle me-2"></i>No complaint found with ID <strong>${id}</strong>.</div>`;
    return;
  }

  result.innerHTML = `
    <div class="track-card mt-3">
      <div class="track-card-header">
        <div><div class="track-id">${c.id}</div><div style="font-size:12px;opacity:0.8">${c.category} — ${c.location}</div></div>
        ${statusBadge(c.status)}
      </div>
      <div class="track-card-body">
        ${buildProgressBar(c.status)}
        <div class="complaint-detail-grid mt-2">
          <div><div class="detail-field-label">Filed By</div><div class="detail-field-value">${c.name}</div></div>
          <div><div class="detail-field-label">Date Filed</div><div class="detail-field-value">${formatDate(c.date)}</div></div>
          <div><div class="detail-field-label">Title</div><div class="detail-field-value">${c.title}</div></div>
          <div><div class="detail-field-label">Status</div><div class="detail-field-value">${statusBadge(c.status)}</div></div>
        </div>
        ${c.remarks ? `<div class="detail-field-label mt-2">Officer Remarks</div><div class="detail-field-desc" style="border-color:var(--warning)">${c.remarks}</div>` : ''}
      </div>
    </div>`;
}

/* ================================================================
   SECTION NAVIGATION
   ================================================================ */
function showSection(section) {
  const sections = ['dashboard', 'raise', 'mycomplaints', 'track', 'profile'];
  const labels   = {
    dashboard: 'Dashboard', raise: 'Raise Complaint',
    mycomplaints: 'My Complaints', track: 'Track Complaint', profile: 'My Profile',
  };

  sections.forEach(s => {
    const el = document.getElementById(`sec-${s}`);
    if (el) el.classList.toggle('d-none', s !== section);
  });

  // Update sidebar active
  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('onclick')?.includes(`'${section}'`)) a.classList.add('active');
  });

  // Breadcrumb
  setEl('breadcrumbText', labels[section] || section);

  // Reload data when switching to relevant sections
  if (section === 'dashboard') { loadDashboard(); loadMyComplaints(); }
  if (section === 'mycomplaints') loadMyComplaints();
  if (section === 'raise') {
    resetComplaintForm();
    document.getElementById('formSuccessAlert')?.classList.add('d-none');
  }
  if (section === 'profile') loadProfile();

  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) toggleSidebar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================================================================
   PROFILE
   ================================================================ */
function loadProfile() {
  if (!citizenSession) return;
  const profile = LS.get('citizen_profile_' + citizenSession.mobile) || {};
  setVal('profileNameInput',  citizenSession.name || '');
  setVal('profileMobileInput', citizenSession.mobile || '');
  setVal('profileEmail',  profile.email  || '');
  setVal('profileWard',   profile.ward   || '');
  setVal('profileAddress', profile.address || '');
  setEl('profileName',   citizenSession.name   || '—');
  setEl('profileMobile', 'Mobile: ' + (citizenSession.mobile || '—'));
}

function saveProfile() {
  const email   = document.getElementById('profileEmail')?.value.trim();
  const ward    = document.getElementById('profileWard')?.value.trim();
  const address = document.getElementById('profileAddress')?.value.trim();
  LS.set('citizen_profile_' + citizenSession.mobile, { email, ward, address });
  showToast('Profile saved successfully!', 'success');
}

/* ================================================================
   SMALL HELPERS
   ================================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
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