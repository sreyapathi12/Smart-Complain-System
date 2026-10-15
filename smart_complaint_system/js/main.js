/* ============================================
   MAIN.JS — Global Logic & Sample Data
   Smart Grievance Management System
   ============================================ */

'use strict';

/* ================================================================
   1. SAMPLE DATA — 30+ complaints seeded into localStorage
   ================================================================ */
const SAMPLE_COMPLAINTS = [
  { id:'GRV-2024-0001', name:'Rajesh Kumar',    mobile:'9876543210', category:'Water Supply',  title:'No water supply for 3 days',             location:'Ward 2, Nehru Colony',    description:'Taps have been dry for the past 3 days. No water is coming from the municipal pipeline. Residents are suffering greatly.',  date:'2024-12-01', status:'Resolved',    remarks:'Pipeline repaired. Water supply restored on Dec 5.',   citizen:'9876543210' },
  { id:'GRV-2024-0002', name:'Priya Lakshmi',   mobile:'9876543210', category:'Electricity',   title:'Transformer sparking at night',           location:'Ward 5, MG Road',         description:'The transformer near the main road has been sparking after 8 PM daily. It poses a serious safety threat to the community.', date:'2024-12-03', status:'In Progress', remarks:'APEPDCL team assigned. Inspection done on Dec 10.',      citizen:'9876543210' },
  { id:'GRV-2024-0003', name:'Suresh Babu',     mobile:'9876543210', category:'Roads',         title:'Large pothole on main road causing accidents', location:'Ward 1, Main Road',   description:'A large pothole has developed on the main road near the market. Two bikes have already been damaged. Urgent repair needed.', date:'2024-12-05', status:'Pending',     remarks:'',                                                         citizen:'9876543210' },
  { id:'GRV-2024-0004', name:'Anitha Devi',     mobile:'9876543210', category:'Sanitation',    title:'Garbage not collected for a week',         location:'Ward 3, Gandhi Nagar',    description:'The sanitation vehicle has not visited our area for the past week. Garbage is piling up and causing a foul smell.',          date:'2024-12-07', status:'Resolved',    remarks:'Immediate collection done. Schedule normalized.',          citizen:'9876543210' },
  { id:'GRV-2024-0005', name:'Venkata Rao',     mobile:'9876543210', category:'Street Lights', title:'Street lights not working for 2 weeks',    location:'Ward 4, Colony Road',     description:'Almost all street lights in Colony Road are non-functional. The area is very dark at night making it unsafe.',             date:'2024-12-08', status:'In Progress', remarks:'Electrician inspected. Spare parts ordered.',              citizen:'9876543210' },
  { id:'GRV-2024-0006', name:'Kavitha Rani',    mobile:'9876543210', category:'Drainage',      title:'Blocked drain causing flooding',           location:'Ward 6, Subhash Nagar',   description:'The main drain on Subhash Nagar road is blocked. Heavy rain causes flooding and water enters homes. Needs immediate clearing.', date:'2024-12-09', status:'Resolved', remarks:'Drain cleaned and desilted on Dec 12.',                   citizen:'9876543210' },
  { id:'GRV-2024-0007', name:'Mohan Reddy',     mobile:'9876543210', category:'Public Health', title:'Mosquito breeding in stagnant water',      location:'Ward 7, Laxmi Colony',    description:'Stagnant water accumulated near the water tank for over a month. Mosquitoes are breeding heavily. Dengue risk is high.',    date:'2024-12-10', status:'Pending',     remarks:'',                                                         citizen:'9876543210' },
  { id:'GRV-2024-0008', name:'Padmavathi',      mobile:'9876543210', category:'Water Supply',  title:'Contaminated water with foul smell',       location:'Ward 2, Srinagar Colony', description:'The tap water has been yellowish and smells bad for the past 5 days. Many residents fell sick after consuming it.',          date:'2024-12-11', status:'In Progress', remarks:'Water sample sent for testing. Chlorination initiated.',   citizen:'9876543210' },
  { id:'GRV-2024-0009', name:'Nagaraju',        mobile:'9876543210', category:'Electricity',   title:'Power cuts every evening',                location:'Ward 5, Tagore Nagar',    description:'Scheduled load shedding or technical fault causing 4-hour power cuts every evening from 6 PM to 10 PM for the past week.',  date:'2024-12-12', status:'Pending',     remarks:'',                                                         citizen:'9876543210' },
  { id:'GRV-2024-0010', name:'Srilatha',        mobile:'9876543210', category:'Roads',         title:'Road digging not restored after pipeline',  location:'Ward 1, Nehru Street',   description:'The road was dug for pipeline work 3 weeks ago but has not been restored. No barricades placed. Accidents are happening.',   date:'2024-12-13', status:'Resolved',    remarks:'Road restored and tarred on Dec 20.',                       citizen:'9876543210' },
  { id:'GRV-2024-0011', name:'Ramesh Chandra',  mobile:'9848011111', category:'Water Supply',  title:'Water meter not working for billing',      location:'Ward 3, Ambedkar Nagar',  description:'My water meter stopped working 2 months ago. I am getting estimated bills which are very high. Please replace the meter.',  date:'2024-11-15', status:'Resolved',    remarks:'Meter replaced on Nov 22. Billing corrected.',             citizen:'9848011111' },
  { id:'GRV-2024-0012', name:'Latha Krishnan',  mobile:'9848022222', category:'Sanitation',    title:'Open defecation near school',             location:'Ward 8, Sai Nagar',       description:'People are defecating openly near the primary school due to lack of public toilets. This is a health hazard for children.',  date:'2024-11-18', status:'In Progress', remarks:'Notice issued. Toilet construction sanctioned.',           citizen:'9848022222' },
  { id:'GRV-2024-0013', name:'Prasad Varma',    mobile:'9848033333', category:'Electricity',   title:'New electricity connection delay',         location:'Ward 9, New Colony',      description:'Applied for new electricity connection 3 months ago with all documents. Still no connection. Contractor asking for bribe.', date:'2024-11-20', status:'Pending',     remarks:'',                                                         citizen:'9848033333' },
  { id:'GRV-2024-0014', name:'Usha Devi',       mobile:'9848044444', category:'Drainage',      title:'Sewage overflow on road',                 location:'Ward 6, Koti Road',       description:'Sewage water is overflowing on the road near the pump house. Foul smell is unbearable. Residents cannot step out.',          date:'2024-11-22', status:'Resolved',    remarks:'Pump repaired. Overflow stopped on Nov 28.',               citizen:'9848044444' },
  { id:'GRV-2024-0015', name:'Krishna Murthy',  mobile:'9848055555', category:'Public Health', title:'Illegal slaughterhouse in residential area', location:'Ward 10, Ramoji Colony', description:'An illegal slaughterhouse is operating in a residential area causing health hazards and foul smell. Please take action.',    date:'2024-11-25', status:'In Progress', remarks:'Health inspector visited. Closure notice issued.',         citizen:'9848055555' },
  { id:'GRV-2024-0016', name:'Vasantha',        mobile:'9848066666', category:'Street Lights', title:'New street lights needed in dark lane',    location:'Ward 4, Bypass Road',     description:'The bypass road lane near the crematorium is completely dark. Theft and anti-social activities are increasing.',             date:'2024-11-27', status:'Resolved',    remarks:'4 new LED lights installed on Dec 1.',                     citizen:'9848066666' },
  { id:'GRV-2024-0017', name:'Gopala Rao',      mobile:'9848077777', category:'Roads',         title:'Speed breaker needed near school',         location:'Ward 2, St. Marys Road',  description:'Vehicles speed on the road adjacent to St. Mary school. Two children were nearly hit. A speed breaker is urgently needed.',  date:'2024-11-28', status:'Pending',     remarks:'',                                                         citizen:'9848077777' },
  { id:'GRV-2024-0018', name:'Savitri Bai',     mobile:'9848088888', category:'Water Supply',  title:'Pipeline leakage wasting water',          location:'Ward 3, Market Road',     description:'A major pipeline leakage near the market is wasting water continuously for 2 weeks. Road is flooded and slippery.',         date:'2024-11-30', status:'Resolved',    remarks:'Leakage repaired on Dec 3. Road restored.',                citizen:'9848088888' },
  { id:'GRV-2024-0019', name:'Narasimha Rao',   mobile:'9848099999', category:'Sanitation',    title:'Garbage dumping on vacant plot',          location:'Ward 7, Indira Nagar',    description:'People are illegally dumping garbage on a vacant government plot. It is attracting stray animals and creating health issues.', date:'2024-12-01', status:'In Progress', remarks:'Board installed. Surveillance camera proposed.',          citizen:'9848099999' },
  { id:'GRV-2024-0020', name:'Hema Latha',      mobile:'9849000000', category:'Electricity',   title:'Fallen electric pole after storm',         location:'Ward 1, Ring Road',       description:'The electric pole fell during last night storm. Live wires are on the road. Extremely dangerous situation.',                date:'2024-12-02', status:'Resolved',    remarks:'Emergency team fixed the pole on same day Dec 2.',         citizen:'9849000000' },
  { id:'GRV-2024-0021', name:'Venkat Swamy',    mobile:'9849011111', category:'Drainage',      title:'Drain construction needed in new layout',  location:'Ward 11, New Layout',    description:'The new layout has no drainage facility at all. Rainwater stagnates for days. More than 200 families are affected.',        date:'2024-12-04', status:'Pending',     remarks:'',                                                         citizen:'9849011111' },
  { id:'GRV-2024-0022', name:'Manjula Devi',    mobile:'9849022222', category:'Public Health', title:'Dog menace near primary school',           location:'Ward 8, Church Road',     description:'A pack of stray dogs near the primary school has bitten 3 children this month. Parents are scared to send kids to school.', date:'2024-12-06', status:'In Progress', remarks:'Animal welfare team deployed. Sterilization drive planned.', citizen:'9849022222' },
  { id:'GRV-2024-0023', name:'Tirupati Rao',    mobile:'9849033333', category:'Street Lights', title:'Broken streetlight causing accidents',     location:'Ward 5, College Road',    description:'A streetlight pole is half broken and the wire is hanging. It already caused a minor accident. Immediate removal needed.',  date:'2024-12-07', status:'Resolved',    remarks:'Broken pole removed. New pole installation scheduled.',    citizen:'9849033333' },
  { id:'GRV-2024-0024', name:'Saraswathi',      mobile:'9849044444', category:'Water Supply',  title:'Drinking water problem in summer',         location:'Ward 9, Kakatiya Colony', description:'During summer months the ward gets water only on alternate days. Please improve the supply schedule for our ward.',          date:'2024-12-08', status:'Pending',     remarks:'',                                                         citizen:'9849044444' },
  { id:'GRV-2024-0025', name:'Ramana Murthy',   mobile:'9849055555', category:'Roads',         title:'Bridge road collapsed during rains',       location:'Ward 12, River Road',     description:'The small bridge road connecting our colony collapsed during heavy rains. People are using boats to cross. Urgent repair!',  date:'2024-12-09', status:'In Progress', remarks:'Inspection done. Estimate submitted for emergency repair.', citizen:'9849055555' },
  { id:'GRV-2024-0026', name:'Durga Bhavani',   mobile:'9849066666', category:'Sanitation',    title:'Drain cleaning required urgently',         location:'Ward 6, Bus Stand Area',  description:'The drain near the bus stand is completely choked with silt and garbage. Overflow during rains floods the bus stand area.',  date:'2024-12-10', status:'Resolved',    remarks:'Drain desilted completely on Dec 14. Area cleaned.',       citizen:'9849066666' },
  { id:'GRV-2024-0027', name:'Sateesh Kumar',   mobile:'9849077777', category:'Others',        title:'Encroachment on public road',             location:'Ward 4, Gandhi Chowk',    description:'A commercial establishment has encroached on the public road near Gandhi Chowk reducing traffic lane width significantly.',  date:'2024-12-11', status:'Pending',     remarks:'',                                                         citizen:'9849077777' },
  { id:'GRV-2024-0028', name:'Aruna Kumari',    mobile:'9849088888', category:'Public Health', title:'Open drainage creating health hazard',     location:'Ward 10, Nagar Bhavi',    description:'Open drainage near residential area is creating severe health hazard. Children playing near it are at risk of disease.',    date:'2024-12-12', status:'In Progress', remarks:'Covering of drain approved in budget. Work to start soon.', citizen:'9849088888' },
  { id:'GRV-2024-0029', name:'Venkateswara',    mobile:'9849099999', category:'Electricity',   title:'Illegal power connections drawing from main', location:'Ward 2, Weaker Section Colony', description:'Several illegal power connections have been drawn from the main line. This is causing voltage fluctuation and power loss.', date:'2024-12-13', status:'Pending', remarks:'',                                                         citizen:'9849099999' },
  { id:'GRV-2024-0030', name:'Padma Rekha',     mobile:'9876543210', category:'Others',        title:'Public toilet in very bad condition',      location:'Ward 7, Market Area',     description:'The only public toilet in the market area is in extremely bad condition. No water, broken doors, unbearable smell.',         date:'2024-12-14', status:'Resolved',    remarks:'Complete renovation done. Water supply connected.',        citizen:'9876543210' },
  { id:'GRV-2024-0031', name:'Suryanarayana',   mobile:'9848011111', category:'Drainage',      title:'Manhole cover missing — dangerous',        location:'Ward 5, Bypass Lane',     description:'A manhole cover is missing on the main road. Two scooters have already fallen into it at night. Very dangerous situation.',  date:'2024-12-15', status:'In Progress', remarks:'Work order issued. Replacement by Dec 18.',                citizen:'9848011111' },
  { id:'GRV-2024-0032', name:'Rukminidevi',     mobile:'9848022222', category:'Water Supply',  title:'Handpump not working for 2 months',        location:'Ward 11, SC Colony',      description:'The government handpump in SC Colony has been non-functional for 2 months. This is the only water source for 40 families.', date:'2024-12-15', status:'Pending',     remarks:'',                                                         citizen:'9848022222' },
];

/* ================================================================
   2. OFFICER CREDENTIALS
   ================================================================ */
const OFFICER_CREDENTIALS = {
  'WTR001': { password: 'officer123', name: 'Sri K. Ramesh Kumar',    dept: 'Water Supply',  icon: 'fa-tint' },
  'ELC001': { password: 'officer123', name: 'Sri M. Nagaraju',        dept: 'Electricity',   icon: 'fa-bolt' },
  'RDS001': { password: 'officer123', name: 'Sri P. Venkatesh',       dept: 'Roads',         icon: 'fa-road' },
  'SAN001': { password: 'officer123', name: 'Smt. L. Padmavathi',     dept: 'Sanitation',    icon: 'fa-trash-alt' },
  'HLT001': { password: 'officer123', name: 'Dr. S. Vijayalakshmi',   dept: 'Public Health', icon: 'fa-heartbeat' },
  'DRN001': { password: 'officer123', name: 'Sri T. Suresh Babu',     dept: 'Drainage',      icon: 'fa-water' },
  'SLT001': { password: 'officer123', name: 'Sri R. Kishore Babu',    dept: 'Street Lights', icon: 'fa-lightbulb' },
};

/* ================================================================
   3. CITIZEN CREDENTIALS
   ================================================================ */
const CITIZEN_CREDENTIALS = [
  { mobile: '9876543210', password: 'citizen123', name: 'Rajesh Kumar' },
  { mobile: '9848011111', password: 'citizen123', name: 'Ramesh Chandra' },
  { mobile: '9848022222', password: 'citizen123', name: 'Latha Krishnan' },
  { mobile: '9848033333', password: 'citizen123', name: 'Prasad Varma' },
  { mobile: '9848044444', password: 'citizen123', name: 'Usha Devi' },
  { mobile: '9848055555', password: 'citizen123', name: 'Krishna Murthy' },
  { mobile: 'test@gmail.com', password: 'citizen123', name: 'Test Citizen' },
];

/* ================================================================
   4. LOCALSTORAGE HELPERS
   ================================================================ */
const LS = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } },
  set: (key, val) => { localStorage.setItem(key, JSON.stringify(val)); },
  remove: (key) => { localStorage.removeItem(key); },
};

function initSampleData() {
  if (!LS.get('grievance_complaints')) {
    LS.set('grievance_complaints', SAMPLE_COMPLAINTS);
  }
  if (!LS.get('grievance_citizens')) {
    LS.set('grievance_citizens', CITIZEN_CREDENTIALS);
  }
}

function getAllComplaints() { return LS.get('grievance_complaints') || []; }
function saveAllComplaints(data) { LS.set('grievance_complaints', data); }

function getCurrentCitizen() { return LS.get('grievance_citizen_session'); }
function getCurrentOfficer() { return LS.get('grievance_officer_session'); }

/* ================================================================
   5. AUTH — LOGIN FUNCTIONS (used on index.html)
   ================================================================ */
function loginCitizen() {
  const username = document.getElementById('citizenUsername').value.trim();
  const password = document.getElementById('citizenPassword').value.trim();
  const errEl = document.getElementById('citizenLoginError');

  if (!username || !password) {
    showLoginError(errEl, 'Please enter mobile number and password.');
    return;
  }

  const citizens = LS.get('grievance_citizens') || CITIZEN_CREDENTIALS;
  const match = citizens.find(c =>
    (c.mobile === username || c.email === username) && c.password === password
  );

  if (match) {
    LS.set('grievance_citizen_session', { name: match.name, mobile: match.mobile });
    window.location.href = 'citizen-dashboard.html';
  } else {
    // Allow any mobile + citizen123 for demo
    if (password === 'citizen123' && username.length >= 6) {
      const name = 'Citizen ' + username.slice(-4);
      LS.set('grievance_citizen_session', { name, mobile: username });
      window.location.href = 'citizen-dashboard.html';
    } else {
      showLoginError(errEl, 'Invalid credentials. Use any mobile + citizen123.');
    }
  }
}

function loginOfficer() {
  const officerId  = document.getElementById('officerUsername').value.trim().toUpperCase();
  const password   = document.getElementById('officerPassword').value.trim();
  const dept       = document.getElementById('officerDept').value;
  const errEl      = document.getElementById('officerLoginError');

  if (!officerId || !password || !dept) {
    showLoginError(errEl, 'Please enter Officer ID, Password and select Department.');
    return;
  }

  const officer = OFFICER_CREDENTIALS[officerId];
  if (officer && officer.password === password) {
    LS.set('grievance_officer_session', {
      id: officerId, name: officer.name, dept: officer.dept, icon: officer.icon
    });
    window.location.href = 'officer-dashboard.html';
  } else if (password === 'officer123') {
    // Any ID + correct dept + officer123
    const deptEntry = Object.values(OFFICER_CREDENTIALS).find(o => o.dept === dept);
    const name = deptEntry ? deptEntry.name : 'Officer ' + officerId;
    LS.set('grievance_officer_session', {
      id: officerId, name, dept, icon: 'fa-user-shield'
    });
    window.location.href = 'officer-dashboard.html';
  } else {
    showLoginError(errEl, 'Invalid credentials. Try WTR001 / officer123.');
  }
}

function logoutCitizen() {
  LS.remove('grievance_citizen_session');
  window.location.href = 'index.html';
}
function logoutOfficer() {
  LS.remove('grievance_officer_session');
  window.location.href = 'index.html';
}

function showLoginError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('d-none');
  setTimeout(() => el.classList.add('d-none'), 4000);
}

/* ================================================================
   6. MODAL OPENERS (Landing Page)
   ================================================================ */
function openLoginModal(type) {
  const id = type === 'citizen' ? 'citizenLoginModal' : 'officerLoginModal';
  const el = document.getElementById(id);
  if (el && window.bootstrap) {
    const m = new bootstrap.Modal(el);
    m.show();
  }
}
function openTrackModal() {
  const el = document.getElementById('trackModal');
  if (el && window.bootstrap) {
    const m = new bootstrap.Modal(el);
    m.show();
  }
}

/* ================================================================
   7. DEMO FILL BUTTONS
   ================================================================ */
function fillCitizenDemo() {
  const u = document.getElementById('citizenUsername');
  const p = document.getElementById('citizenPassword');
  if (u) u.value = '9876543210';
  if (p) p.value = 'citizen123';
}
function fillOfficerDemo() {
  const u = document.getElementById('officerUsername');
  const p = document.getElementById('officerPassword');
  const d = document.getElementById('officerDept');
  if (u) u.value = 'WTR001';
  if (p) p.value = 'officer123';
  if (d) d.value = 'Water Supply';
}

/* ================================================================
   8. TRACK COMPLAINT (Landing Page Modal)
   ================================================================ */
function trackComplaint() {
  const input = document.getElementById('trackInput');
  const result = document.getElementById('trackResult');
  if (!input || !result) return;

  const id = input.value.trim().toUpperCase();
  if (!id) { result.innerHTML = '<div class="alert alert-warning mt-2">Please enter a Complaint ID.</div>'; return; }

  const complaints = getAllComplaints();
  const c = complaints.find(x => x.id.toUpperCase() === id);

  if (!c) {
    result.innerHTML = `<div class="alert alert-danger mt-2"><i class="fas fa-times-circle me-2"></i>Complaint ID <strong>${id}</strong> not found.</div>`;
    return;
  }

  result.innerHTML = `
    <div class="track-result-card mt-3">
      <div class="tr-id"><i class="fas fa-hashtag me-1"></i>${c.id}</div>
      <div class="tr-row">
        <div class="tr-field"><div class="tr-label">Category</div><div class="tr-value">${c.category}</div></div>
        <div class="tr-field"><div class="tr-label">Date Filed</div><div class="tr-value">${formatDate(c.date)}</div></div>
        <div class="tr-field"><div class="tr-label">Location</div><div class="tr-value">${c.location}</div></div>
        <div class="tr-field"><div class="tr-label">Status</div><div class="tr-value">${statusBadge(c.status)}</div></div>
      </div>
      ${c.remarks ? `<div class="mt-2"><strong>Officer Remarks:</strong> <span class="text-muted">${c.remarks}</span></div>` : ''}
    </div>`;
}

/* ================================================================
   9. THEME TOGGLE
   ================================================================ */
function initTheme() {
  const saved = localStorage.getItem('grievance_theme') || 'light';
  applyTheme(saved);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('grievance_theme', theme);
  // Update all theme toggle buttons
  document.querySelectorAll('[id^="themeIcon"]').forEach(icon => {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });
}
function toggleTheme() {
  const current = localStorage.getItem('grievance_theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ================================================================
   10. DATE/TIME DISPLAY
   ================================================================ */
function updateDateTime() {
  const now = new Date();
  const opts = { weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' };
  const str = now.toLocaleDateString('en-IN', opts);
  document.querySelectorAll('[id*="datetime"], [id*="Datetime"]').forEach(el => {
    el.textContent = str;
  });
}

/* ================================================================
   11. SCROLL TO TOP
   ================================================================ */
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });
}

/* ================================================================
   12. COUNTER ANIMATION (landing page)
   ================================================================ */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    let count = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = Math.floor(count).toLocaleString('en-IN');
      if (count >= target) clearInterval(timer);
    }, 16);
  });
}

/* ================================================================
   13. SIDEBAR TOGGLE (Dashboard pages)
   ================================================================ */
function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const isOpen   = sidebar && sidebar.classList.contains('open');
  if (sidebar)  sidebar.classList.toggle('open', !isOpen);
  if (overlay)  overlay.classList.toggle('open', !isOpen);
}

/* ================================================================
   14. UTILITY HELPERS
   ================================================================ */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  } catch { return dateStr; }
}

function statusBadge(status) {
  const map = {
    'Pending':     'status-badge status-pending',
    'In Progress': 'status-badge status-inprogress',
    'Resolved':    'status-badge status-resolved',
  };
  return `<span class="${map[status] || 'status-badge'}">${status}</span>`;
}

function categoryBadge(cat) {
  const map = {
    'Water Supply':  ['cat-water',    'fa-tint'],
    'Electricity':   ['cat-electric', 'fa-bolt'],
    'Roads':         ['cat-roads',    'fa-road'],
    'Drainage':      ['cat-drainage', 'fa-water'],
    'Sanitation':    ['cat-sanit',    'fa-trash-alt'],
    'Street Lights': ['cat-lights',   'fa-lightbulb'],
    'Public Health': ['cat-health',   'fa-heartbeat'],
    'Others':        ['cat-others',   'fa-ellipsis-h'],
  };
  const [cls, icon] = map[cat] || ['cat-others', 'fa-tag'];
  return `<span class="cat-badge ${cls}"><i class="fas ${icon}"></i>${cat}</span>`;
}

function generateComplaintId() {
  const existing = getAllComplaints();
  const yr = new Date().getFullYear();
  const maxNum = existing.reduce((max, c) => {
    const m = c.id.match(/GRV-\d{4}-(\d+)/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `GRV-${yr}-${String(maxNum + 1).padStart(4, '0')}`;
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector('i');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fas fa-eye';
  }
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle text-success', danger: 'fa-times-circle text-danger', info: 'fa-info-circle text-primary', warning: 'fa-exclamation-circle text-warning' };
  const toast = document.createElement('div');
  toast.className = `officer-toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><div><div class="toast-msg">${message}</div></div><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ================================================================
   15. AUTH GUARD (for dashboard pages)
   ================================================================ */
function requireCitizenAuth() {
  const session = getCurrentCitizen();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}
function requireOfficerAuth() {
  const session = getCurrentOfficer();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

/* ================================================================
   16. PAGE INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  initTheme();
  updateDateTime();
  setInterval(updateDateTime, 60000);
  initScrollTop();

  // Theme toggle buttons
  document.querySelectorAll('[id^="themeToggle"]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Landing page counters
  if (document.querySelector('[data-count]')) {
    setTimeout(animateCounters, 400);
  }

  // Set today's date on complaint form
  const dateField = document.getElementById('fc_date');
  if (dateField) dateField.value = new Date().toISOString().split('T')[0];
});