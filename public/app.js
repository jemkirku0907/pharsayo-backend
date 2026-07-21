const icons = {
  heart: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M8 12h2l1-2 2 4 1-2h2"/></svg>`,
  home: `<svg class="icon" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6"/></svg>`,
  pill: `<svg class="icon" viewBox="0 0 24 24"><path d="M8.5 19.5a5 5 0 0 1-7-7l9-9a5 5 0 0 1 7 7Z"/><path d="m6 8 7 7"/></svg>`,
  scan: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 8V4h5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 12h8M12 8v8"/></svg>`,
  bell: `<svg class="icon" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>`,
  users: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>`,
  user: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  logout: `<svg class="icon" viewBox="0 0 24 24"><path d="m10 17 5-5-5-5M15 12H3M15 3h5v18h-5"/></svg>`,
  chevron: `<svg class="icon" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  close: `<svg class="icon" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>`
};

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const supabase = window.supabase?.createClient(
  'https://zzuhgpzcdkigubowyxjd.supabase.co',
  'sb_publishable_NVzpI7OVt4ulDzOLodekIg_cfhT0voF'
);

const state = {
  role: 'Pasyente',
  user: null,
  activeView: 'home',
  medications: [
    { name: 'Metformin', dose: '500mg', time: '7:00 AM', note: 'Kasabay ng almusal', taken: true },
    { name: 'Amlodipine', dose: '5mg', time: '8:00 AM', note: 'Pagkatapos kumain', taken: false },
    { name: 'Atorvastatin', dose: '20mg', time: '9:00 PM', note: 'Bago matulog', taken: false }
  ],
  reminders: [
    { time: '7:00 AM', medicine: 'Metformin', note: 'Kasabay ng almusal', enabled: true },
    { time: '8:00 AM', medicine: 'Amlodipine', note: 'Pagkatapos kumain', enabled: true },
    { time: '9:00 PM', medicine: 'Atorvastatin', note: 'Bago matulog', enabled: true }
  ]
};

const brand = () => `<div class="brand"><span class="brand-mark">${icons.heart}</span><span>PharSayo</span></div>`;
const dateLabel = () => new Intl.DateTimeFormat('fil-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
const greeting = () => new Date().getHours() < 12 ? 'Magandang umaga' : new Date().getHours() < 18 ? 'Magandang hapon' : 'Magandang gabi';

function showLogin() {
  app.innerHTML = `<div class="login-shell">
    <section class="welcome-panel">
      ${brand()}
      <div class="welcome-copy">
        <span class="eyebrow">Gamot mo, gabay mo</span>
        <h1>Mas malinaw na gabay para sa mas malusog na araw.</h1>
        <p>Isang simple at mapagkakatiwalaang kasama para sa tamang pag-inom ng gamot—ginawa para sa pamilyang Pilipino.</p>
      </div>
      <div class="trust-row"><span>${icons.check} Simpleng Filipino</span><span>${icons.check} Ligtas at pribado</span><span>${icons.check} BHU connected</span></div>
      <div class="orb orb-one"></div><div class="orb orb-two"></div>
    </section>
    <section class="auth-panel">
      <form id="login-form" class="auth-card">
        <div class="mobile-brand">${brand()}</div>
        <span class="eyebrow">Welcome back</span>
        <h2>Maligayang pagbabalik</h2>
        <p class="muted">Mag-login para makita ang iyong gabay ngayong araw.</p>
        <div class="role-tabs" aria-label="Piliin ang iyong role">
          ${['Pasyente', 'BHU Staff', 'Admin'].map((x, i) => `<button type="button" class="role-tab ${i ? '' : 'active'}" data-role="${x}">${x}</button>`).join('')}
        </div>
        <label for="identity">Email address</label>
        <div class="input-wrap">${icons.user}<input id="identity" type="email" autocomplete="email" required placeholder="hal. maria@email.com"></div>
        <label for="password">Password</label>
        <div class="input-wrap">${icons.heart}<input id="password" type="password" autocomplete="current-password" minlength="6" required placeholder="Ilagay ang password"><button type="button" class="text-action password-toggle">Ipakita</button></div>
        <div class="form-meta"><label class="check-label"><input type="checkbox"> Tandaan ako</label><button type="button" class="text-action forgot">Nakalimutan?</button></div>
        <button class="primary-button" type="submit">Mag-login <span>→</span></button>
        <button class="secondary-button demo-login" type="button">Tingnan muna ang demo</button>
        <p class="signup-copy">Wala pang account? <button type="button" class="text-action signup">Gumawa ngayon</button></p>
      </form>
    </section>
  </div>`;
  bindLogin();
}

function bindLogin() {
  document.querySelectorAll('.role-tab').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.role-tab').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    state.role = button.dataset.role;
  }));
  document.querySelector('.password-toggle').addEventListener('click', event => {
    const input = document.querySelector('#password');
    input.type = input.type === 'password' ? 'text' : 'password';
    event.currentTarget.textContent = input.type === 'password' ? 'Ipakita' : 'Itago';
  });
  document.querySelector('.demo-login').addEventListener('click', () => { state.user = { name: state.role === 'Pasyente' ? 'Maria Angeles' : 'Juan Santos', demo: true }; renderDashboard(); });
  document.querySelector('.forgot').addEventListener('click', () => openModal('reset'));
  document.querySelector('.signup').addEventListener('click', () => openModal('signup'));
  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('.primary-button');
    const email = document.querySelector('#identity').value;
    const password = document.querySelector('#password').value;
    if (!supabase) return toast('Hindi ma-connect ang login. Subukan ang demo habang offline.');
    setLoading(button, true, 'Nagla-login…');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(button, false, 'Mag-login <span>→</span>');
    if (error) return toast(error.message);
    await openSession(data.user);
  });
}

const navItems = [
  ['home', 'Ngayon'], ['pill', 'Mga Gamot'], ['scan', 'I-scan'], ['bell', 'Paalaala'], ['users', 'BHU Monitor']
];

function navigation(className) {
  return `<nav class="${className}" aria-label="Pangunahing menu">${navItems.map(([id, label]) => `<button class="nav-button ${state.activeView === id ? 'active' : ''}" data-view="${id}" ${id === 'users' && state.role === 'Pasyente' ? 'data-support="true"' : ''}>${icons[id]}<span>${label}</span></button>`).join('')}</nav>`;
}

function renderDashboard() {
  const staff = state.role !== 'Pasyente';
  const name = state.user?.name || (staff ? 'Juan Santos' : 'Maria Angeles');
  app.innerHTML = `<div class="dashboard-shell">
    <aside class="sidebar">
      ${brand()}
      ${navigation('desktop-nav')}
      <div class="sidebar-help"><span class="help-icon">?</span><div><strong>Kailangan ng tulong?</strong><small>Makipag-ugnayan sa BHU</small></div></div>
      <div class="profile-block"><span class="avatar">${name.split(' ').map(x => x[0]).join('').slice(0, 2)}</span><div><strong>${name}</strong><small>${state.role}${state.user?.demo ? ' · Demo' : ''}</small></div><button class="logout-button" aria-label="Mag-logout">${icons.logout}</button></div>
    </aside>
    <main class="dashboard-main">
      <header class="topbar"><div><p class="today">${dateLabel()}</p><h1>${greeting()}, ${name.split(' ')[0]}!</h1><p class="muted">${staff ? 'Narito ang kalagayan ng inyong barangay ngayon.' : 'Narito ang iyong gabay sa gamot ngayong araw.'}</p></div><div class="top-actions"><button class="round-button notification" aria-label="Mga notification">${icons.bell}<span></span></button><span class="top-avatar">${name.charAt(0)}</span></div></header>
      <section id="view-content" class="view-content">${renderView(state.activeView)}</section>
    </main>
    ${navigation('mobile-nav')}
  </div>`;
  bindDashboard();
}

function renderView(view) {
  if (view === 'home') return state.role === 'Pasyente' ? patientHome() : staffHome();
  if (view === 'pill') return medicinesView();
  if (view === 'scan') return scannerView();
  if (view === 'bell') return remindersView();
  return state.role === 'Pasyente' ? supportView() : monitorView();
}

function patientHome() {
  const next = state.medications.find(med => !med.taken) || state.medications[0];
  const completed = state.medications.filter(med => med.taken).length;
  const percent = Math.round((completed / state.medications.length) * 100);
  return `<div class="summary-grid">
    <article class="dose-hero"><div><span class="light-eyebrow">Susunod · ${next.time}</span><h2>Oras na para sa iyong ${next.name}.</h2><p>${next.dose} · ${next.note}</p><button class="hero-button take-dose" data-name="${next.name}">${next.taken ? `${icons.check} Nainom na` : 'Nainom ko na'} </button></div><div class="pill-art">${icons.pill}<span></span></div></article>
    <article class="adherence-card"><div class="card-heading"><div><span class="eyebrow">Linggong ito</span><h3>Pagsunod sa gamot</h3></div><span class="trend">↑ 8%</span></div><div class="progress-row"><div class="progress-ring" style="--progress:${percent * 3.6}deg"><span>${percent}%</span></div><div><strong>${completed} sa ${state.medications.length}</strong><p class="muted">Mahusay! Ituloy lang natin.</p></div></div></article>
  </div>${scheduleSection()}${quickActions()}`;
}

function staffHome() {
  return `<div class="summary-grid"><article class="dose-hero staff-hero"><div><span class="light-eyebrow">BHU overview</span><h2>12 pasyente ang kailangan ng follow-up.</h2><p>May 7 bagong missed-dose alert mula kahapon.</p><button class="hero-button go-view" data-view="users">Tingnan ang mga pasyente →</button></div><div class="metric-art"><strong>84%</strong><small>adherence</small></div></article><article class="adherence-card"><div class="card-heading"><div><span class="eyebrow">Barangay</span><h3>Weekly adherence</h3></div><span class="trend">↑ 4%</span></div><div class="mini-bars">${[58,72,64,83,76,90,84].map((x,i)=>`<span style="--h:${x}%"><i>${['L','M','M','H','B','S','L'][i]}</i></span>`).join('')}</div></article></div>${monitorView()}`;
}

function scheduleSection() {
  return `<div class="section-heading"><div><span class="eyebrow">Araw-araw na gabay</span><h3>Iskedyul ngayon</h3></div><button class="text-action go-view" data-view="pill">Tingnan lahat →</button></div><div class="medicine-grid">${state.medications.map(med => `<article class="medicine-card ${med.taken ? 'done' : ''}"><div class="medicine-icon">${med.taken ? icons.check : icons.pill}</div><div class="medicine-info"><div class="medicine-title"><h4>${med.name}</h4><span>${med.dose}</span></div><p>${med.note}</p><div class="medicine-meta"><strong>${med.time}</strong><span>${med.taken ? 'Nainom na' : med === state.medications.find(x => !x.taken) ? 'Susunod' : 'Mamaya'}</span></div></div></article>`).join('')}</div>`;
}

function quickActions() {
  const actions = [['scan','Kilalanin ang gamot','I-scan ang label o tableta'],['pill','Mga gamot ko','Detalye at pag-iingat'],['bell','Gumawa ng reminder','Ayusin ang iskedyul'],['users','BHU support','Humingi ng tulong']];
  return `<div class="section-heading"><div><span class="eyebrow">Shortcuts</span><h3>Mabilis na gawain</h3></div></div><div class="quick-grid">${actions.map(([id,title,copy]) => `<button class="quick-card go-view" data-view="${id}"><span class="quick-icon">${icons[id]}</span><span><strong>${title}</strong><small>${copy}</small></span>${icons.chevron}</button>`).join('')}</div>`;
}

function medicinesView() {
  return `<div class="page-heading"><div><span class="eyebrow">Medication list</span><h2>Mga gamot ko</h2><p class="muted">Lahat ng aktibong gamot at iskedyul sa isang lugar.</p></div><button class="primary-button compact add-medicine">${icons.plus} Magdagdag</button></div><div class="list-card">${state.medications.map((med, index) => `<div class="list-row"><span class="medicine-icon">${icons.pill}</span><div class="list-copy"><strong>${med.name} <small>${med.dose}</small></strong><p>${med.note} · ${med.time}</p></div><span class="status-pill active">Aktibo</span><button class="row-action remove-med" data-index="${index}" aria-label="Alisin ang ${med.name}">×</button></div>`).join('')}</div>`;
}

function remindersView() {
  return `<div class="page-heading"><div><span class="eyebrow">Notifications</span><h2>Mga paalaala</h2><p class="muted">I-manage kung kailan ka namin paaalalahanan.</p></div><button class="primary-button compact add-reminder">${icons.plus} Bagong reminder</button></div><div class="list-card">${state.reminders.map((item,index) => `<div class="list-row"><span class="time-badge">${item.time}</span><div class="list-copy"><strong>${item.medicine}</strong><p>${item.note}</p></div><label class="switch"><input type="checkbox" data-index="${index}" ${item.enabled ? 'checked' : ''}><span></span></label></div>`).join('')}</div>`;
}

function scannerView() {
  return `<div class="page-heading"><div><span class="eyebrow">Medicine scanner</span><h2>Kilalanin ang iyong gamot</h2><p class="muted">Kunan o i-upload ang malinaw na larawan ng label.</p></div></div><article class="scanner-card"><div class="scan-visual"><span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>${icons.scan}<div class="scan-line"></div></div><h3>Ilagay ang label sa loob ng frame</h3><p class="muted">Siguraduhing malinaw ang pangalan, dosage, at expiration date.</p><label class="primary-button compact upload-button">${icons.scan} Pumili ng larawan<input id="medicine-photo" type="file" accept="image/*" capture="environment"></label><button class="secondary-button type-medicine">I-type ang pangalan</button><div id="scan-result"></div></article>`;
}

function monitorView() {
  const people = [['Rosa Villanueva','3 sunod-sunod na missed dose','Mataas','RV'],['Antonio Cruz','2 missed dose ngayong linggo','Mataas','AC'],['Luz Mendoza','Hindi nag-confirm ng intake','Katamtaman','LM']];
  return `<div class="section-heading monitor-heading"><div><span class="eyebrow">Patient monitoring</span><h3>Mga kailangang follow-up</h3></div><button class="text-action">Lahat ng pasyente →</button></div><div class="list-card">${people.map(([name,reason,risk,initials]) => `<button class="list-row patient-row"><span class="patient-avatar">${initials}</span><div class="list-copy"><strong>${name}</strong><p>${reason}</p></div><span class="status-pill ${risk === 'Mataas' ? 'danger' : 'warning'}">${risk}</span>${icons.chevron}</button>`).join('')}</div>`;
}

function supportView() {
  return `<div class="page-heading"><div><span class="eyebrow">BHU support</span><h2>Hindi ka nag-iisa.</h2><p class="muted">Makipag-ugnayan sa inyong Barangay Health Unit para sa gabay.</p></div></div><div class="support-grid"><article class="support-card"><span>${icons.users}</span><h3>BHU San Isidro</h3><p>Barangay Health Center · Bukas 8:00 AM–5:00 PM</p><button class="primary-button compact support-action">Tumawag sa BHU</button></article><article class="support-card soft"><span>${icons.heart}</span><h3>Emergency?</h3><p>Kung malubha ang nararamdaman, tumawag agad sa 911 o pumunta sa pinakamalapit na ospital.</p></article></div>`;
}

function bindDashboard() {
  document.querySelectorAll('.nav-button,.go-view').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  document.querySelector('.logout-button').addEventListener('click', logout);
  document.querySelector('.notification').addEventListener('click', () => toast('Wala kang bagong notification.'));
  document.querySelector('.take-dose')?.addEventListener('click', event => {
    const med = state.medications.find(item => item.name === event.currentTarget.dataset.name);
    if (med) med.taken = true;
    toast('Naitala ang pag-inom. Magaling!'); renderDashboard();
  });
  document.querySelector('.add-medicine')?.addEventListener('click', () => openModal('medicine'));
  document.querySelector('.add-reminder')?.addEventListener('click', () => openModal('reminder'));
  document.querySelectorAll('.remove-med').forEach(button => button.addEventListener('click', () => { state.medications.splice(Number(button.dataset.index), 1); toast('Inalis ang gamot.'); renderDashboard(); }));
  document.querySelectorAll('.switch input').forEach(toggle => toggle.addEventListener('change', () => { state.reminders[Number(toggle.dataset.index)].enabled = toggle.checked; toast(toggle.checked ? 'Naka-on ang reminder.' : 'Naka-pause ang reminder.'); }));
  document.querySelector('#medicine-photo')?.addEventListener('change', event => showScanResult(event.target.files[0]));
  document.querySelector('.type-medicine')?.addEventListener('click', () => openModal('medicine'));
  document.querySelector('.support-action')?.addEventListener('click', () => toast('BHU San Isidro: (02) 8123-4567'));
  document.querySelectorAll('.patient-row').forEach(row => row.addEventListener('click', () => toast('Patient details will open in the secure BHU portal.')));
}

function switchView(view) { state.activeView = view; renderDashboard(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function showScanResult(file) {
  if (!file) return;
  const result = document.querySelector('#scan-result');
  result.innerHTML = `<div class="scan-success">${icons.check}<div><strong>Handa nang suriin</strong><small>${file.name}</small></div></div>`;
  toast('Na-upload ang larawan.');
}

function openModal(type) {
  const configs = {
    medicine: { title: 'Magdagdag ng gamot', fields: `<label>Pangalan ng gamot<input name="name" required placeholder="hal. Losartan"></label><div class="field-grid"><label>Dosage<input name="dose" required placeholder="50mg"></label><label>Oras<input name="time" type="time" required></label></div><label>Tagubilin<input name="note" required placeholder="hal. Pagkatapos kumain"></label>`, action: 'Idagdag ang gamot' },
    reminder: { title: 'Bagong reminder', fields: `<label>Gamot<select name="medicine" required>${state.medications.map(med => `<option>${med.name}</option>`).join('')}</select></label><label>Oras<input name="time" type="time" required></label><label>Paalala<input name="note" required placeholder="hal. Kasabay ng almusal"></label>`, action: 'I-save ang reminder' },
    reset: { title: 'I-reset ang password', fields: `<p class="muted modal-copy">Magpapadala kami ng reset link sa iyong email.</p><label>Email address<input name="email" type="email" required placeholder="maria@email.com"></label>`, action: 'Ipadala ang link' },
    signup: { title: 'Gumawa ng account', fields: `<label>Buong pangalan<input name="name" required placeholder="Juan Dela Cruz"></label><label>Email address<input name="email" type="email" required placeholder="juan@email.com"></label><label>Password<input name="password" type="password" minlength="6" required placeholder="Hindi bababa sa 6 characters"></label>`, action: 'Gumawa ng account' }
  };
  const config = configs[type];
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><span class="eyebrow">PharSayo</span><h2 id="modal-title">${config.title}</h2></div><button class="round-button close-modal" aria-label="Isara">${icons.close}</button></div><form id="modal-form">${config.fields}<div class="modal-actions"><button type="button" class="secondary-button close-modal">Kanselahin</button><button class="primary-button" type="submit">${config.action}</button></div></form></div></div>`;
  modalRoot.querySelectorAll('.close-modal').forEach(button => button.addEventListener('click', closeModal));
  modalRoot.querySelector('.modal-backdrop').addEventListener('click', event => { if (event.target === event.currentTarget) closeModal(); });
  modalRoot.querySelector('#modal-form').addEventListener('submit', event => handleModalSubmit(event, type));
  setTimeout(() => modalRoot.querySelector('input,select')?.focus(), 50);
}

async function handleModalSubmit(event, type) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  if (type === 'medicine') {
    state.medications.push({ name: data.name, dose: data.dose, time: formatTime(data.time), note: data.note, taken: false });
    closeModal(); toast('Naidagdag ang gamot.'); renderDashboard();
  } else if (type === 'reminder') {
    state.reminders.push({ medicine: data.medicine, time: formatTime(data.time), note: data.note, enabled: true });
    closeModal(); toast('Nagawa ang bagong reminder.'); renderDashboard();
  } else if (type === 'reset') {
    if (supabase) await supabase.auth.resetPasswordForEmail(data.email);
    closeModal(); toast('Kung may account ang email, ipinadala na ang reset link.');
  } else {
    if (!supabase) return toast('Offline ang account service. Subukan ulit mamaya.');
    const roleMap = { Pasyente: 'patient', 'BHU Staff': 'bhu_staff', Admin: 'admin' };
    const { error } = await supabase.auth.signUp({ email: data.email, password: data.password, options: { data: { full_name: data.name, role: roleMap[state.role] } } });
    if (error) return toast(error.message);
    closeModal(); toast('Nagawa ang account. I-check ang iyong email para mag-confirm.');
  }
}

function formatTime(value) { if (!value) return ''; const [hour, minute] = value.split(':').map(Number); return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`; }
function closeModal() { modalRoot.innerHTML = ''; }
function toast(message) { const item = document.querySelector('#toast'); item.textContent = message; item.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => item.classList.remove('show'), 3200); }
function setLoading(button, loading, label) { button.disabled = loading; button.innerHTML = label; }

async function openSession(user) {
  state.user = { name: user.user_metadata?.full_name || 'Maria Angeles', id: user.id };
  const profileResult = await supabase.from('pharsayo_profiles').select('full_name,role').eq('id', user.id).maybeSingle();
  if (profileResult.data) {
    state.user.name = profileResult.data.full_name || state.user.name;
    state.role = profileResult.data.role === 'patient' ? 'Pasyente' : profileResult.data.role === 'bhu_staff' ? 'BHU Staff' : 'Admin';
  }
  const medsResult = await supabase.from('pharsayo_medications').select('*').eq('patient_id', user.id).eq('active', true);
  if (medsResult.data?.length) state.medications = medsResult.data.map(med => ({ name: med.name || med.medication_name, dose: med.dosage || med.dose, time: med.schedule_time || '8:00 AM', note: med.instructions || 'Ayon sa reseta', taken: false }));
  renderDashboard();
}

async function logout() { if (supabase && !state.user?.demo) await supabase.auth.signOut(); state.user = null; state.activeView = 'home'; showLogin(); }

if (supabase) supabase.auth.getSession().then(({ data }) => data.session ? openSession(data.session.user) : showLogin()).catch(showLogin);
else showLogin();
