/* ============================================================
   CareerForge AI — Student App engine (vanilla JS, hash router)
   ============================================================ */

const STORE_KEY = "cf_state_v1";

// ── Supabase Client Initialization ─────────────────────────────
const SUPABASE_URL  = "https://ksydolkbimcxpvhmqfsb.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzeWRvbGtiaW1jeHB2aG1xZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDczNDQsImV4cCI6MjEwNDMyMzM0NH0.89oVZyRfUp_vmoXa0_PTbjsDmq8tdxTPlIAkb5i9V0E";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

function defaultState(){
  return {
    account: null,               // {name, email, password}
    profile: null,               // {enrollment, dept, year, university, skills[], interests[]}
    domain: null,                // domain id
    assessment: { answers: [], score: null },
    resume: { best: 0, current: 0, attempts: 0 },
    hr: { best: 0, current: 0, attempts: 0 },
    tech: { best: 0, current: 0, attempts: 0 },
    mock: { best: 0, current: 0, attempts: 0 },
    reflection: { done: false },
    points: 0,
    pointHistory: [],
    certStatus: "Not Eligible", // Not Eligible -> Pending Faculty Review -> Approved
    // ephemeral session-only fields (not required to persist but kept for simplicity)
    qIndex: 0,
    interviewType: null,
    interviewSet: [],
    interviewCorrect: [],
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  }catch(e){ return defaultState(); }
}

// Save state locally AND push to Supabase in the background
function saveState(){
  localStorage.setItem(STORE_KEY, JSON.stringify(S));
  // Async push to Supabase (non-blocking — app continues instantly)
  db.auth.getSession().then(({ data }) => {
    const userId = data?.session?.user?.id;
    if (!userId) return;
    db.from("student_states")
      .upsert({ user_id: userId, state_data: S }, { onConflict: "user_id" })
      .then(({ error }) => { if (error) console.warn("Supabase sync error:", error.message); });
  });
}

let S = loadState();

function resetAll(){ localStorage.removeItem(STORE_KEY); S = defaultState(); go("#/splash"); }

function hashCode(str){
  let h = 0;
  for(let i=0;i<str.length;i++){ h = (h<<5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function initials(name){
  if(!name) return "?";
  return name.trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join("");
}
function domainById(id){ return DOMAINS.find(d=>d.id===id); }
function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

function awardPoints(amount, label){
  S.points += amount;
  S.pointHistory.unshift({ label, amount, date: new Date().toISOString().slice(0,10) });
  saveState();
}

function readinessScore(){
  const vals = [S.hr.best, S.tech.best, S.mock.best];
  const attempted = vals.filter(v=>v>0);
  const moduleAvg = attempted.length ? attempted.reduce((a,b)=>a+b,0)/attempted.length : 0;
  const reflectionBonus = S.reflection.done ? 5 : 0;
  return Math.round(clamp(moduleAvg * 0.9 + reflectionBonus, 0, 100));
}

function toast(msg){
  let host = document.querySelector(".toast-host");
  if(!host){ host = document.createElement("div"); host.className="toast-host"; document.body.appendChild(host); }
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = msg;
  host.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}

function go(hash){ if(location.hash === hash){ render(); } else { location.hash = hash; } }
function requireAuth(){ if(!S.account){ go("#/login"); return false; } return true; }
function requireDomain(){ if(!S.domain){ go("#/domains"); return false; } return true; }

/* ============================================================
   APP SHELL (sidebar + topnav) for logged-in area
   ============================================================ */
const NAV_ITEMS = [
  { r:"#/dashboard", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, label:"Overview" },
  { r:"#/interview-home", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`, label:"Interview Prep" },
  { r:"#/mock-home", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, label:"Mock Interview" },
  { r:"#/reflection", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`, label:"Career Reflection" },
  { r:"#/progress", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, label:"Progress" },
  { r:"#/rewards", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`, label:"Rewards" },
  { r:"#/certificate", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`, label:"Certificate" },
  { r:"#/settings", ic:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, label:"Settings" },
];

function shell(activeRoute, title, innerHtml){
  const d = domainById(S.domain);
  const nav = NAV_ITEMS.map(n => `
    <div class="nav-item ${activeRoute===(n.r||n.route)?'active':''}" onclick="go('${n.r||n.route}')">
      <span class="ic">${n.ic||n.icon||''}</span>
      <span>${n.label}</span>
    </div>
  `).join("");

  return `
  <div class="app-shell">
    <div class="sidebar-scrim" id="scrim" onclick="toggleSidebar(false)"></div>
    <aside class="sidebar" id="sidebar">
      <div class="brand" style="display:flex; align-items:center; gap:12px; padding:18px 20px; border-bottom:1px solid var(--border);">
        ${logoSvg(34)}
        <div>
          <div class="name" style="font-weight:800; font-size:15px; color:var(--black); line-height:1.2;">CareerForge AI</div>
          <div class="t-caption" style="font-size:10px; color:var(--red); font-weight:700; letter-spacing:0.08em; margin-top:2px;">FORGE YOUR FUTURE</div>
        </div>
      </div>
      <nav>${nav}</nav>
      <div class="foot" onclick="go('#/profile')" style="padding:14px 18px; border-top:1px solid var(--border); display:flex; align-items:center; gap:12px; cursor:pointer; background:var(--surface);">
        <div class="avatar sm">${initials(S.account?.name)}</div>
        <div style="min-width:0">
          <div class="t-body" style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--black); font-size:13.5px;">${S.account?.name || "Student"}</div>
          <div class="t-small" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11.5px; color:var(--ink-soft);">${d ? d.name : "No domain selected"}</div>
        </div>
      </div>
    </aside>
    <div class="main-col">
      <div class="topnav" style="height:68px; border-bottom:1px solid var(--border); background:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 24px; position:sticky; top:0; z-index:20;">
        <div class="flex items-center gap-3">
          <button class="hamburger" onclick="toggleSidebar(true)">☰</button>
          <div class="t-h3" style="font-size:18px; font-weight:700; color:var(--black);">${title}</div>
        </div>
        <div class="flex items-center gap-3">
          <span class="chip outline" style="font-size:11.5px; font-weight:600; background:var(--bg); border-color:var(--border); color:var(--black);">
            ${d ? d.name : "CareerForge"}
          </span>
          <button class="btn-icon" title="Notifications" onclick="toast('No new notifications')" style="border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">🔔</button>
          <div class="avatar sm" style="cursor:pointer; font-weight:700;" onclick="go('#/profile')" title="Your profile">${initials(S.account?.name)}</div>
        </div>
      </div>
      <div class="page">${innerHtml}</div>
    </div>
  </div>`;
}

function toggleSidebar(open){
  document.getElementById("sidebar")?.classList.toggle("open", open);
  document.getElementById("scrim")?.classList.toggle("show", open);
}

function proceedFromSplash(){
  go("#/login");
}

function screenSplash(){
  // Dynamic status text simulation
  setTimeout(() => {
    const el = document.getElementById("splash-status-text");
    if(el) el.textContent = "Analyzing domain indices...";
  }, 1000);
  setTimeout(() => {
    const el = document.getElementById("splash-status-text");
    if(el) el.textContent = "Synchronizing neural models...";
  }, 2000);
  setTimeout(() => {
    const el = document.getElementById("splash-status-text");
    if(el) {
      el.textContent = "Ready to begin";
      el.style.color = "#FF5252";
      el.style.fontWeight = "700";
    }
  }, 3000);

  // Generate 18 floating background cyber-particles
  const particles = Array.from({ length: 18 }).map((_, idx) => {
    const left = Math.random() * 100;
    const top = 55 + Math.random() * 35;
    const size = 3 + Math.random() * 5;
    const duration = 5 + Math.random() * 7;
    const delay = Math.random() * 4;
    return `<div class="splash-particle" style="left:${left}%; top:${top}%; width:${size}px; height:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
  }).join("");

  return `
  <div class="splash" onclick="proceedFromSplash()" style="cursor:pointer; user-select:none;">
    <div class="cyber-grid"></div>
    <div class="tech-hud-circle"></div>
    <div class="splash-glow"></div>
    ${particles}
    <div class="splash-content">
      <div class="splash-logo-wrap">
        <div class="logo-radar-ring"></div>
        ${logoSvg(80)}
      </div>
      <div class="splash-title-block">
        <div class="splash-tag">✦ AI-POWERED CAREER READINESS</div>
        <div class="splash-h1">CareerForge AI</div>
        <div class="splash-sub">Forge Your Future · Discover Your Potential</div>
      </div>
      
      <div class="splash-progress-wrap">
        <div class="splash-bar"><div></div></div>
        <div class="splash-status" id="splash-status-text">Initializing modules...</div>
      </div>

      <div class="splash-click-prompt">
        <span>Click anywhere to continue</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   SCREEN: Login / Signup
   ============================================================ */

function logoSvg(size = 36){
  const uid = Math.random().toString(36).substring(2, 7);
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="cf-main-logo">
    <defs>
      <linearGradient id="cfBg_${uid}" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#111111"/>
        <stop offset="60%" stop-color="#8F070E"/>
        <stop offset="100%" stop-color="#B60A13"/>
      </linearGradient>
      <linearGradient id="cfFlame_${uid}" x1="24" y1="9" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FF6B6B"/>
        <stop offset="50%" stop-color="#FF2B2B"/>
        <stop offset="100%" stop-color="#B60A13"/>
      </linearGradient>
      <linearGradient id="cfAnvil_${uid}" x1="12" y1="28" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E0E0E0"/>
      </linearGradient>
    </defs>
    <!-- Rounded Shield Background -->
    <rect width="48" height="48" rx="12" fill="url(#cfBg_${uid})"/>
    <rect x="1.5" y="1.5" width="45" height="45" rx="10.5" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>

    <!-- Anvil (Skill Foundation / Forge) -->
    <path d="M14 36H34C35.1 36 36 35.1 36 34V32H12V34C12 35.1 12.9 36 14 36Z" fill="url(#cfAnvil_${uid})"/>
    <path d="M16 32L18.5 27.5H29.5L32 32H16Z" fill="url(#cfAnvil_${uid})" opacity="0.9"/>

    <!-- Flame of Career Growth -->
    <path d="M24 8C24 8 29.5 14.5 29.5 20.5C29.5 23.5 27 26 24 26C21 26 18.5 23.5 18.5 20.5C18.5 16.5 22 13 24 8Z" fill="url(#cfFlame_${uid})"/>
    <path d="M24 14C24 14 26.8 18 26.8 21C26.8 22.5 25.5 23.5 24 23.5C22.5 23.5 21.2 22.5 21.2 21C21.2 19 23 17 24 14Z" fill="#FFF5F5"/>

    <!-- 4-Point AI Sparkle Star -->
    <path d="M35 8L35.9 10.1L38 11L35.9 11.9L35 14L34.1 11.9L32 11L34.1 10.1L35 8Z" fill="#FFD700"/>
    <path d="M13 11L13.6 12.4L15 13L13.6 13.6L13 15L12.4 13.6L11 13L12.4 12.4L13 11Z" fill="rgba(255,255,255,0.8)"/>

    <!-- Ascending Career Growth Arc -->
    <path d="M9 29C13 20 21 13 36 11" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
  </svg>`;
}

const AUTH_STEPS = [
  {
    title: "Discover",
    desc: "Explore 25+ industry domains matching your strengths",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
  },
  {
    title: "Prepare",
    desc: "AI-assisted resume optimization & domain readiness checks",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  {
    title: "Practice",
    desc: "Real-time simulated HR & Technical Q&A interview practice",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`
  },
  {
    title: "Improve",
    desc: "Instant feedback scores, reflection logs & skill gap insights",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
  },
  {
    title: "Become Career Ready",
    desc: "Verified readiness certificate backed by faculty review",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
  }
];

function authVisual(){
  // Generate 12 floating background particles for left visual panel
  const particles = Array.from({ length: 12 }).map((_, idx) => {
    const left = Math.random() * 100;
    const top = 55 + Math.random() * 35;
    const size = 2.5 + Math.random() * 4;
    const duration = 6 + Math.random() * 6;
    const delay = Math.random() * 3;
    return `<div class="splash-particle" style="left:${left}%; top:${top}%; width:${size}px; height:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
  }).join("");

  return `
  <div class="auth-visual">
    ${particles}
    <div class="auth-brand-top">
      <div class="flex items-center gap-3">
        ${logoSvg(44)}
        <div>
          <div class="t-h2" style="color:#fff; font-size:22px; line-height:1.2;">CareerForge AI</div>
          <div class="t-caption" style="color:#FF5252; letter-spacing:0.08em;">Forge Your Future</div>
        </div>
      </div>
    </div>
    
    <div class="path-graphic">
      <div class="path-title">YOUR CAREER ROADMAP</div>
      ${AUTH_STEPS.map((s, i, arr) => `
        <div class="path-step-card" style="--step-idx: ${i};">
          <div class="step-icon-col">
            <div class="step-badge">${s.icon}</div>
            ${i < arr.length - 1 ? '<div class="step-line"></div>' : ''}
          </div>
          <div class="step-text-col">
            <div class="step-heading">${s.title}</div>
            <div class="step-desc">${s.desc}</div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="auth-quote">
      <div class="t-body" style="color:rgba(255,255,255,0.85); font-style:italic;">"Every expert was once a beginner. Your career journey starts with one honest assessment."</div>
    </div>
  </div>`;
}

function googleSvg(){
  return `
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>`;
}

function screenLogin(){
  return `
  <div class="auth-wrap">
    ${authVisual()}
    <div class="auth-form-side">
      <canvas id="auth-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1;"></canvas>
      <div class="auth-form">
        <div class="auth-form-logo">
          ${logoSvg(46)}
          <div class="brand-title">CareerForge AI</div>
          <div class="brand-subtitle">AI-Powered Skill Readiness Platform</div>
        </div>

        <div class="t-h1" style="margin-bottom:4px">Welcome Back</div>
        <div class="t-body muted" style="margin-bottom:24px">Sign in to continue your career journey.</div>
        <form class="stack gap-3" onsubmit="return App.login(event)">
          <div class="field" id="f-email"><label>Email <span style="color:var(--red)">*</span></label><input type="email" id="login-email" placeholder="Email" required></div>
          <div class="field" id="f-pass"><label>Password <span style="color:var(--red)">*</span></label>
            <div class="pw-wrap"><input type="password" id="login-pass" placeholder="Password" required>
            <button type="button" class="pw-toggle" onclick="togglePw('login-pass',this)">Show</button></div>
          </div>
          <div class="flex justify-between items-center">
            <label class="checkbox-row"><input type="checkbox">Remember me</label>
            <a class="btn-text t-small" href="#" onclick="toast('Password reset link sent (demo)'); return false;">Forgot password?</a>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Log In</button>
        </form>
        <div class="divider">or</div>
        <button class="btn btn-secondary btn-block flex items-center justify-center gap-2" onclick="App.googleDemo()">
          ${googleSvg()} <span>Continue with Google</span>
        </button>
        <div class="t-small" style="text-align:center; margin-top:18px">Don't have an account? <a class="btn-text" href="#" onclick="go('#/signup'); return false;">Create Account</a></div>
        <div class="t-small" style="text-align:center; margin-top:10px"><a class="btn-text" href="admin.html" style="color:var(--ink-soft)">Faculty / Admin Portal →</a></div>
      </div>
    </div>
  </div>`;
}

function screenSignup(){
  return `
  <div class="auth-wrap">
    ${authVisual()}
    <div class="auth-form-side">
      <canvas id="auth-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1;"></canvas>
      <div class="auth-form">
        <div class="auth-form-logo">
          ${logoSvg(46)}
          <div class="brand-title">CareerForge AI</div>
          <div class="brand-subtitle">AI-Powered Skill Readiness Platform</div>
        </div>

        <div class="t-h1" style="margin-bottom:4px">Create Account</div>
        <div class="t-body muted" style="margin-bottom:24px">Start your CareerForge journey today.</div>
        <form class="stack gap-3" onsubmit="return App.signup(event)">
          <div class="field"><label>Full Name <span style="color:var(--red)">*</span></label><input id="su-name" placeholder="Full Name" required></div>
          <div class="field"><label>Email <span style="color:var(--red)">*</span></label><input type="email" id="su-email" placeholder="Email" required></div>
          <div class="field">
            <label>Enrollment Number <span style="color:var(--red)">*</span></label>
            <input id="su-enroll" type="text" placeholder="Enrollment Number (11 digits)" maxlength="11" oninput="this.value=this.value.replace(/\D/g,'').slice(0,11)" required>
            <div class="hint">Must be exactly 11 numeric digits.</div>
          </div>
          <div class="field"><label>Password <span style="color:var(--red)">*</span></label>
            <div class="pw-wrap"><input type="password" id="su-pass" placeholder="Password" oninput="pwStrength(this.value)" required>
            <button type="button" class="pw-toggle" onclick="togglePw('su-pass',this)">Show</button></div>
            <div class="pw-strength"><div id="pw-bar"></div></div>
            <div class="hint" id="pw-hint">Use 8+ characters with a number and a symbol.</div>
          </div>
          <div class="field" id="f-confirm"><label>Confirm Password <span style="color:var(--red)">*</span></label><input type="password" id="su-confirm" placeholder="Confirm Password" required>
            <div class="error-msg">Passwords do not match.</div>
          </div>
          <label class="checkbox-row"><input type="checkbox" required>I agree to the Terms of Service and Privacy Policy <span style="color:var(--red)">*</span></label>
          <button class="btn btn-primary btn-block" type="submit">Create Account</button>
        </form>
        <div class="t-small" style="text-align:center; margin-top:18px">Already have an account? <a class="btn-text" href="#" onclick="go('#/login'); return false;">Log In</a></div>
      </div>
    </div>
  </div>`;
}

function togglePw(id, btn){
  const el = document.getElementById(id);
  const show = el.type === "password";
  el.type = show ? "text" : "password";
  btn.textContent = show ? "Hide" : "Show";
}
function pwStrength(v){
  let score = 0;
  if(v.length>=8) score++;
  if(/[0-9]/.test(v)) score++;
  if(/[^A-Za-z0-9]/.test(v)) score++;
  if(/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  const pct = [0,25,50,75,100][score];
  const colors = ["#B60A13","#B60A13","#B8860B","#B8860B","#1E8E5A"];
  const bar = document.getElementById("pw-bar");
  if(bar){ bar.style.width = pct+"%"; bar.style.background = colors[score]; }
  const labels = ["Very weak","Weak","Fair","Good","Strong"];
  const hint = document.getElementById("pw-hint");
  if(hint) hint.textContent = v ? `Password strength: ${labels[score]}` : "Use 8+ characters with a number and a symbol.";
}

/* ============================================================
   SCREEN: Profile Setup (Step 1 of 3)
   ============================================================ */
let tempSkills = [], tempInterests = [];
function screenProfileSetup(){
  tempSkills = S.profile?.skills || [];
  tempInterests = S.profile?.interests || [];
  return `
  <div class="page" style="max-width:720px; margin:0 auto;">
    <div class="t-caption" style="margin-top:24px">Step 1 of 3</div>
    <div class="progress-bar" style="margin:8px 0 24px"><div style="width:33%"></div></div>
    <div class="t-h1">Tell us about yourself</div>
    <div class="t-body muted" style="margin-bottom:24px">Help us personalize your CareerForge journey.</div>
    <form class="stack gap-3" onsubmit="return App.saveProfile(event)">
      <div class="field"><label>Full Name <span style="color:var(--red)">*</span></label><input id="p-name" placeholder="Full Name" value="${S.account?.name||''}" required></div>
      <div class="field"><label>Email <span style="color:var(--red)">*</span></label><input id="p-email" placeholder="Email" value="${S.account?.email||''}" required></div>
      <div class="field">
        <label>Enrollment Number <span style="color:var(--red)">*</span></label>
        <input id="p-enroll" type="text" placeholder="Enrollment Number (11 digits)" value="${S.profile?.enrollment||''}" maxlength="11" oninput="this.value=this.value.replace(/\D/g,'').slice(0,11)" required>
        <div class="hint">Must be exactly 11 numeric digits.</div>
      </div>
      <div class="field"><label>Department <span style="color:var(--red)">*</span></label>
        <select id="p-dept" required>
          <option value="">Select Department</option>
          ${["Computer Science","Information Technology","Electronics & Comm.","Mechanical Engineering","Civil Engineering"].map(d=>`<option ${S.profile?.dept===d?'selected':''}>${d}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Current Semester or Academic Year <span style="color:var(--red)">*</span></label>
        <select id="p-year" required>
          <option value="">Select Semester or Year</option>
          ${["1st Year","2nd Year","3rd Year","4th Year"].map(d=>`<option ${S.profile?.year===d?'selected':''}>${d}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>University Name <span style="color:var(--red)">*</span></label><input id="p-univ" placeholder="University Name" value="${S.profile?.university||''}" required></div>
      <div class="field"><label>Existing Skills</label>
        <div class="chip-input" id="skills-input"><input placeholder="Add Skills" onkeydown="addChip(event,'skills')"></div>
      </div>
      <div class="field"><label>Areas of Interest</label>
        <div class="chip-input" id="interests-input"><input placeholder="Add Interests" onkeydown="addChip(event,'interests')"></div>
      </div>
      <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px">Save Profile</button>
    </form>
  </div>`;
}
function renderChips(kind){
  const arr = kind==='skills' ? tempSkills : tempInterests;
  const host = document.getElementById(kind+"-input");
  const input = host.querySelector("input");
  host.querySelectorAll(".chip").forEach(c=>c.remove());
  arr.forEach((val,i)=>{
    const c = document.createElement("span");
    c.className="chip";
    c.innerHTML = `${val} <button type="button" onclick="removeChip('${kind}',${i})">×</button>`;
    host.insertBefore(c, input);
  });
}
function addChip(e, kind){
  if(e.key === "Enter" && e.target.value.trim()){
    e.preventDefault();
    (kind==='skills'?tempSkills:tempInterests).push(e.target.value.trim());
    e.target.value = "";
    renderChips(kind);
  }
}
function removeChip(kind, i){
  (kind==='skills'?tempSkills:tempInterests).splice(i,1);
  renderChips(kind);
}

/* ============================================================
   SCREEN: Personal Information (Live Resume Builder)
   ============================================================ */
window.updateLivePreview = function() {
  const name = document.getElementById("p-name")?.value || S.account?.name || "Your Name";
  const email = document.getElementById("p-email")?.value || S.account?.email || "email@domain.com";
  const phone = document.getElementById("p-phone")?.value || "Phone Number";
  const address = document.getElementById("p-address")?.value || "";
  const linkedin = document.getElementById("p-linkedin")?.value || "";
  const github = document.getElementById("p-github")?.value || "";
  const portfolio = document.getElementById("p-portfolio")?.value || "";

  const univ = document.getElementById("p-univ")?.value || "University Name";
  const degree = document.getElementById("p-degree")?.value || "Degree";
  const dept = document.getElementById("p-dept")?.value || "";
  const semester = document.getElementById("p-semester")?.value || "";
  const year = document.getElementById("p-year")?.value || "";
  const cgpa = document.getElementById("p-cgpa")?.value || "";

  const previewDiv = document.getElementById("resume-paper-preview");
  if(!previewDiv) return;

  // Trigger compiler update flash animation and 3D wave surge
  window._resumeWaveImpact = 95;
  previewDiv.classList.remove("update-flash");
  void previewDiv.offsetWidth; // trigger reflow
  previewDiv.classList.add("update-flash");

  // Trigger holographic laser scanner sweep
  const scanner = document.getElementById("scanner-wrapper");
  if (scanner) {
    scanner.classList.remove("scanning");
    void scanner.offsetWidth; // trigger reflow
    scanner.classList.add("scanning");
  }

  // Trigger epic forge spark burst
  if (typeof window._triggerForgeBurst === "function") {
    window._triggerForgeBurst();
  }

  // Build contact row
  const contacts = [];
  if(phone) contacts.push(`<span>📞 ${phone}</span>`);
  if(email) contacts.push(`<span>✉️ ${email}</span>`);
  if(address) contacts.push(`<span>📍 ${address}</span>`);
  if(linkedin) contacts.push(`<span>🔗 LinkedIn</span>`);
  if(github) contacts.push(`<span>🔗 GitHub</span>`);
  if(portfolio) contacts.push(`<span>🔗 Portfolio</span>`);

  // Build projects html
  const projectsHtml = [];
  const projCards = document.querySelectorAll(".project-form-card");
  projCards.forEach(card => {
    const pTitle = card.querySelector(".proj-title").value.trim();
    const pDesc = card.querySelector(".proj-desc").value.trim();
    const pTech = card.querySelector(".proj-tech").value.trim();
    if(pTitle || pDesc) {
      projectsHtml.push(`
        <div class="rp-item">
          <div class="rp-item-header">
            <span style="font-weight:700; color:#12151c;">${pTitle || 'Project Title'}</span>
            <span style="font-size:10px; font-weight:600; color:var(--red); font-style:italic;">${pTech}</span>
          </div>
          <div style="font-size:10.5px; color:#4c5567; margin-top:3px; line-height:1.4;">${pDesc || 'Project description...'}</div>
        </div>
      `);
    }
  });

  const skillsHtml = tempSkills.map(sk => `<span class="rp-skill-chip">${sk}</span>`).join("");

  previewDiv.innerHTML = `
    <div class="rp-header">
      <div class="rp-name">${name}</div>
      <div class="rp-contacts">${contacts.join("")}</div>
    </div>
    
    <div>
      <div class="rp-section-title">Education</div>
      <div class="rp-item">
        <div class="rp-item-header">
          <span>${univ}</span>
          <span>${cgpa ? `CGPA: ${cgpa}` : ''}</span>
        </div>
        <div class="rp-item-sub">
          <span>${degree} ${dept ? `(${dept})` : ''}</span>
          <span>${semester ? `${semester} Semester` : ''} ${year ? `· ${year}` : ''}</span>
        </div>
      </div>
    </div>

    <div>
      <div class="rp-section-title">Skills</div>
      <div class="rp-skills-list">
        ${skillsHtml || '<span class="rp-placeholder">Add skills in the form to preview</span>'}
      </div>
    </div>

    <div>
      <div class="rp-section-title">Projects</div>
      ${projectsHtml.length ? projectsHtml.join("") : '<div class="rp-placeholder">No projects added yet (optional for freshers)</div>'}
    </div>
  `;
};

window.addProjectField = function() {
  const container = document.getElementById("project-fields-container");
  if(!container) return;

  const card = document.createElement("div");
  card.className = "card card-pad project-form-card";
  card.style = "margin-bottom:12px; background:#faf9f9; border:1.5px solid var(--border); border-radius:10px; position:relative; padding:18px;";
  
  card.innerHTML = `
    <button type="button" class="btn-icon" onclick="removeProjectField(this)" style="position:absolute; top:12px; right:12px; font-size:16px; color:var(--red); font-weight:bold; cursor:pointer; background:none; border:none;" title="Remove Project">×</button>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
      <div class="field" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; color:var(--black);">Project Title <span style="color:var(--red)">*</span></label>
        <input class="proj-title" placeholder="e.g. Portfolio Website" oninput="updateLivePreview()" required>
      </div>
      <div class="field" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; color:var(--black);">Technologies Used</label>
        <input class="proj-tech" placeholder="e.g. HTML, CSS, JavaScript" oninput="updateLivePreview()">
      </div>
    </div>
    <div class="field" style="margin:0;">
      <label style="font-size:11.5px; font-weight:700; color:var(--black);">Description <span style="color:var(--red)">*</span></label>
      <textarea class="proj-desc" placeholder="Briefly describe what you built and your role..." rows="3" oninput="updateLivePreview()" required style="width:100%; min-height:60px; font-family:inherit; font-size:13px; padding:8px; border-radius:6px; border:1.5px solid var(--border); outline:none;"></textarea>
    </div>
  `;
  container.appendChild(card);
  updateLivePreview();
};

window.removeProjectField = function(btn) {
  const card = btn.closest(".project-form-card");
  if(card) {
    card.remove();
    updateLivePreview();
  }
};

function screenDomains(){
  tempSkills = S.profile?.skills || [];
  
  // Render existing projects if any
  const projects = S.profile?.projects || [];
  const projectsHtml = projects.map(p => `
    <div class="card card-pad project-form-card" style="margin-bottom:12px; background:#faf9f9; border:1.5px solid var(--border); border-radius:10px; position:relative; padding:18px;">
      <button type="button" class="btn-icon" onclick="removeProjectField(this)" style="position:absolute; top:12px; right:12px; font-size:16px; color:var(--red); font-weight:bold; cursor:pointer; background:none; border:none;" title="Remove Project">×</button>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
        <div class="field" style="margin:0;">
          <label style="font-size:11.5px; font-weight:700; color:var(--black);">Project Title <span style="color:var(--red)">*</span></label>
          <input class="proj-title" value="${p.title || ''}" placeholder="e.g. Portfolio Website" oninput="updateLivePreview()" required>
        </div>
        <div class="field" style="margin:0;">
          <label style="font-size:11.5px; font-weight:700; color:var(--black);">Technologies Used</label>
          <input class="proj-tech" value="${p.tech || ''}" placeholder="e.g. HTML, CSS, JavaScript" oninput="updateLivePreview()">
        </div>
      </div>
      <div class="field" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; color:var(--black);">Description <span style="color:var(--red)">*</span></label>
        <textarea class="proj-desc" placeholder="Briefly describe what you built and your role..." rows="3" oninput="updateLivePreview()" required style="width:100%; min-height:60px; font-family:inherit; font-size:13px; padding:8px; border-radius:6px; border:1.5px solid var(--border); outline:none;">${p.desc || ''}</textarea>
      </div>
    </div>
  `).join("");

  setTimeout(() => {
    renderChips('skills');
    if(window.updateLivePreview) window.updateLivePreview();
  }, 40);

  return `
  <div class="page" style="max-width:1320px; margin:16px auto; padding:28px 24px; position:relative; overflow:hidden; background:#fafafb; border:1px solid #e1e3e8; border-radius:16px; box-shadow:inset 0 0 30px rgba(0,0,0,0.015);">
    <canvas id="resume-bg-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1; opacity:0.95;"></canvas>
    <div style="position:relative; z-index:2;">
      <div style="margin-bottom:20px;">
        <div class="t-h1" style="font-size:28px; font-weight:800; color:var(--black); letter-spacing:-0.02em;">Live Resume Profile Builder</div>
      <div class="t-body muted" style="font-size:14px;">Complete your academic details, skills, and projects to compile a professional resume in real-time.</div>
    </div>

    <div class="resume-builder-layout">
      <!-- LEFT: Dynamic Form Panel -->
      <div class="rb-form-panel">
        <form class="stack gap-3" onsubmit="return App.saveProfile(event, true)">
          
          <!-- Personal Details -->
          <div class="card card-pad" style="background:#fff; border:1.5px solid var(--border); border-radius:12px; padding:24px; box-shadow:var(--shadow-sm);">
            <div class="t-h3" style="margin-bottom:16px; display:flex; align-items:center; gap:8px; border-bottom:1.5px solid var(--border); padding-bottom:10px; color:var(--black); font-size:15.5px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Personal Details</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:12px;">
              <div class="field" style="margin:0;">
                <label>Full Name <span style="color:var(--red)">*</span></label>
                <input id="p-name" placeholder="Full Name" value="${S.account?.name || ''}" oninput="updateLivePreview()" required>
              </div>
              <div class="field" style="margin:0;">
                <label>Email Address <span style="color:var(--red)">*</span></label>
                <input type="email" id="p-email" placeholder="Email" value="${S.account?.email || ''}" oninput="updateLivePreview()" required>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:16px; margin-bottom:12px;">
              <div class="field" style="margin:0;">
                <label>Phone Number <span style="color:var(--red)">*</span></label>
                <input id="p-phone" placeholder="Phone Number" value="${S.profile?.phone || ''}" oninput="updateLivePreview()" required>
              </div>
              <div class="field" style="margin:0;">
                <label>Address (Optional)</label>
                <input id="p-address" placeholder="Address, City" value="${S.profile?.address || ''}" oninput="updateLivePreview()">
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
              <div class="field" style="margin:0;">
                <label>LinkedIn Link</label>
                <input id="p-linkedin" placeholder="LinkedIn URL" value="${S.profile?.linkedin || ''}" oninput="updateLivePreview()">
              </div>
              <div class="field" style="margin:0;">
                <label>GitHub Link</label>
                <input id="p-github" placeholder="GitHub URL" value="${S.profile?.github || ''}" oninput="updateLivePreview()">
              </div>
              <div class="field" style="margin:0;">
                <label>Portfolio Link</label>
                <input id="p-portfolio" placeholder="Portfolio URL" value="${S.profile?.portfolio || ''}" oninput="updateLivePreview()">
              </div>
            </div>
          </div>

          <!-- Academic Details -->
          <div class="card card-pad" style="background:#fff; border:1.5px solid var(--border); border-radius:12px; padding:24px; box-shadow:var(--shadow-sm);">
            <div class="t-h3" style="margin-bottom:16px; display:flex; align-items:center; gap:8px; border-bottom:1.5px solid var(--border); padding-bottom:10px; color:var(--black); font-size:15.5px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span>Academic Credentials</span>
            </div>
            <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:16px; margin-bottom:12px;">
              <div class="field" style="margin:0;">
                <label>University / College <span style="color:var(--red)">*</span></label>
                <input id="p-univ" placeholder="University Name" value="${S.profile?.university || ''}" oninput="updateLivePreview()" required>
              </div>
              <div class="field" style="margin:0;">
                <label>Degree / Course <span style="color:var(--red)">*</span></label>
                <input id="p-degree" placeholder="e.g. B.Tech / BCA" value="${S.profile?.degree || 'B.Tech'}" oninput="updateLivePreview()" required>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:12px;">
              <div class="field" style="margin:0;">
                <label>Department <span style="color:var(--red)">*</span></label>
                <select id="p-dept" onchange="updateLivePreview()" required>
                  <option value="">Select Dept</option>
                  ${["Computer Science","Information Technology","Electronics & Comm.","Mechanical Engineering","Civil Engineering"].map(d=>`<option ${S.profile?.dept===d?'selected':''}>${d}</option>`).join("")}
                </select>
              </div>
              <div class="field" style="margin:0;">
                <label>Semester <span style="color:var(--red)">*</span></label>
                <select id="p-semester" onchange="updateLivePreview()" required>
                  <option value="">Select Sem</option>
                  ${["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(d=>`<option ${S.profile?.semester===d?'selected':''}>${d}</option>`).join("")}
                </select>
              </div>
              <div class="field" style="margin:0;">
                <label>Academic Year <span style="color:var(--red)">*</span></label>
                <select id="p-year" onchange="updateLivePreview()" required>
                  <option value="">Select Year</option>
                  ${["1st Year","2nd Year","3rd Year","4th Year"].map(d=>`<option ${S.profile?.year===d?'selected':''}>${d}</option>`).join("")}
                </select>
              </div>
              <div class="field" style="margin:0;">
                <label>CGPA / Percentage <span style="color:var(--red)">*</span></label>
                <input id="p-cgpa" placeholder="e.g. 8.4" value="${S.profile?.cgpa || ''}" oninput="updateLivePreview()" required>
              </div>
            </div>
            <div class="field" style="margin:0;">
              <label>Enrollment Number <span style="color:var(--red)">*</span></label>
              <input id="p-enroll" type="text" placeholder="Enrollment Number (11 digits)" value="${S.profile?.enrollment||''}" maxlength="11" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,11); updateLivePreview();" required>
              <div class="hint" style="margin-top:4px;">Must be exactly 11 numeric digits.</div>
            </div>
          </div>

          <!-- Professional Skills -->
          <div class="card card-pad" style="background:#fff; border:1.5px solid var(--border); border-radius:12px; padding:24px; box-shadow:var(--shadow-sm);">
            <div class="t-h3" style="margin-bottom:16px; display:flex; align-items:center; gap:8px; border-bottom:1.5px solid var(--border); padding-bottom:10px; color:var(--black); font-size:15.5px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
              <span>Skills (Multi-select)</span>
            </div>
            <div class="field" style="margin:0;">
              <label>Add skills (e.g. Python, Java, Figma, Leadership)</label>
              <div class="chip-input" id="skills-input" style="min-height:44px; display:flex; flex-wrap:wrap; gap:6px; border:1.5px solid var(--border); border-radius:8px; padding:6px 12px; background:#fff;">
                <input placeholder="Type a skill and press Enter" onkeydown="addChip(event,'skills')" style="border:none; outline:none; flex:1; min-width:180px; height:30px; font-family:inherit;">
              </div>
            </div>
          </div>

          <!-- Project Showcase -->
          <div class="card card-pad" style="background:#fff; border:1.5px solid var(--border); border-radius:12px; padding:24px; box-shadow:var(--shadow-sm);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1.5px solid var(--border); padding-bottom:10px;">
              <div class="t-h3" style="display:flex; align-items:center; gap:8px; color:var(--black); margin:0; font-size:15.5px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <span>Projects (Optional)</span>
              </div>
              <button type="button" class="btn btn-outline btn-sm" onclick="addProjectField()" style="height:32px; font-size:12px; font-weight:700;">+ Add Project</button>
            </div>
            
            <div id="project-fields-container">
              ${projectsHtml}
            </div>
            <div class="t-small" style="color:var(--ink-soft); font-style:italic; margin-top:8px;">
              💡 Fresher? You can leave this blank and update it later.
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center" style="margin-top:24px; gap:16px;">
            <button type="button" class="btn btn-outline" onclick="App.saveProfile(null, false)" style="flex:1; height:46px; font-weight:700;">Save Draft</button>
            <button type="submit" class="btn btn-primary" style="flex:1; height:46px; font-weight:700; background:var(--red); box-shadow:0 4px 14px rgba(182,10,19,0.25);">Save & Continue</button>
          </div>
        </form>
      </div>

      <!-- RIGHT: Live Resume Preview Panel -->
      <div class="rb-preview-panel">
        <div class="t-caption" style="font-weight:700; color:var(--ink-soft); display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span>Interactive Resume Preview</span>
          <span style="font-size:10px; color:var(--red); font-weight:700; letter-spacing:0.04em;">✦ REAL-TIME PREVIEW</span>
        </div>
        <div class="rb-paper-scanner-wrapper" id="scanner-wrapper">
          <!-- Laser scanner line -->
          <div class="scan-laser-line"></div>
          
          <!-- Holographic brackets -->
          <div class="scanner-bracket top-left"></div>
          <div class="scanner-bracket top-right"></div>
          <div class="scanner-bracket bottom-left"></div>
          <div class="scanner-bracket bottom-right"></div>
          
          <!-- Spinning tech HUD target sights in corners -->
          <div class="hud-target-reticle tr1"></div>
          <div class="hud-target-reticle tr2"></div>

          <div class="resume-paper" id="resume-paper-preview">
            <!-- Dynamic Content Rendered Live -->
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenDomainDetail(id){
  const d = domainById(id);
  if(!d) return `<div class="page"><div class="empty-state"><div class="glyph">🔍</div>Domain not found.</div></div>`;
  return `
  <div class="page" style="max-width:760px; margin:0 auto;">
    <button class="btn-back" onclick="go('#/domains')">← Back to Domains</button>
    <div class="card card-pad" style="margin-top:12px">
      <div class="flex items-center gap-3"><div class="icon" style="font-size:36px">${d.icon}</div><div><div class="t-h1">${d.name}</div><span class="badge neutral">${d.cat}</span></div></div>
      <p class="t-body-lg" style="margin-top:16px">${d.desc}</p>
      <div class="t-h3" style="margin-top:20px">What professionals in this field do</div>
      <p class="t-body muted">They apply ${d.skills[0].toLowerCase()} and ${d.skills[1].toLowerCase()} skills to solve real problems, typically working with tools like ${d.tools.join(", ")}.</p>
      <div class="grid two-col" style="grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
        <div><div class="t-h3">Common Skills</div><div class="flex gap-2" style="flex-wrap:wrap; margin-top:8px">${d.skills.map(s=>`<span class="chip outline">${s}</span>`).join("")}</div></div>
        <div><div class="t-h3">Common Tools</div><div class="flex gap-2" style="flex-wrap:wrap; margin-top:8px">${d.tools.map(s=>`<span class="chip outline">${s}</span>`).join("")}</div></div>
      </div>
      <div class="t-h3" style="margin-top:20px">Example Job Roles</div>
      <div class="flex gap-2" style="flex-wrap:wrap; margin-top:8px">${d.roles.map(s=>`<span class="chip outline">${s}</span>`).join("")}</div>
      <div class="ai-card" style="margin-top:20px"><div class="t-h3">You may enjoy this field if…</div><p class="t-body" style="margin-top:6px">${d.fit}</p></div>
      <div class="flex gap-3" style="margin-top:24px">
        <button class="btn btn-outline" onclick="go('#/domains')">Explore Another Domain</button>
        <button class="btn btn-primary" style="flex:1" onclick="S.domain = '${d.id}'; saveState(); go('#/assessment-intro')">Choose This Domain</button>
      </div>
    </div>
  </div>`;
}

function getDomainQuestions(domainId){
  if(domainId && typeof DOMAIN_QUESTIONS !== "undefined" && DOMAIN_QUESTIONS[domainId]){
    return DOMAIN_QUESTIONS[domainId];
  }
  return ASSESSMENT_QUESTIONS;
}

function screenAssessmentIntro(){
  return `
  <div class="page" style="max-width:720px; margin:0 auto; padding:24px 16px;">
    <button class="btn-back" onclick="go('#/domains')">← Back to Profile</button>
    <div class="t-caption" style="margin-top:12px">Step 2 of 3</div>
    <div class="progress-bar" style="margin:8px 0 20px"><div style="width:66%"></div></div>
    <div class="t-h1">Career Discovery Assessment</div>
    <p class="t-body muted">Discover your natural strengths and interests. We'll present a set of 15 questions covering different engineering, design, and management disciplines to help map out your ideal path. Take your time, there are no penalties.</p>
    <div class="grid" style="grid-template-columns:repeat(3,1fr); gap:14px; margin:24px 0;">
      <div class="card card-pad" style="border:1.5px solid var(--border); border-radius:10px; text-align:left;"><div class="t-h3" style="font-size:14px;">15 Questions</div><div class="t-small" style="margin-top:4px;">Broadly sampled to gauge your conceptual intuition across 25 fields.</div></div>
      <div class="card card-pad" style="border:1.5px solid var(--border); border-radius:10px; text-align:left;"><div class="t-h3" style="font-size:14px;">Interest Mapping</div><div class="t-small" style="margin-top:4px;">No correct/incorrect pressure — focus on finding what you enjoy most.</div></div>
      <div class="card card-pad" style="border:1.5px solid var(--border); border-radius:10px; text-align:left;"><div class="t-h3" style="font-size:14px;">Top 5 Pathways</div><div class="t-small" style="margin-top:4px;">Computes your customized alignment score and personalized career roadmaps.</div></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="App.startAssessment()" style="background:var(--red); font-weight:700; height:46px; box-shadow:0 4px 14px rgba(182,10,19,0.25);">Start Assessment</button>
  </div>`;
}

function screenAssessmentQuestion(){
  const i = S.qIndex;
  const questions = S.assessmentQuestions || [];
  const total = questions.length;
  if(total === 0) {
    return `<div class="page"><div class="empty-state">No questions loaded. Please start the assessment again.</div></div>`;
  }
  const item = questions[i];
  const chosen = S.assessment.answers[i];
  const opts = item.opts.map((o,oi)=>`
    <div class="option-card ${chosen===oi?'selected':''}" onclick="App.answerAssessment(${oi}, event)">
      <div class="dot"></div>
      <div class="t-body" style="text-align:left;">${o.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    </div>`).join("");
  return `
  <div class="page" style="max-width:680px; margin:0 auto; padding:24px 16px;">
    <div class="flex justify-between items-center">
      <button class="btn-back" onclick="App.exitAssessment()">← Exit</button>
      <span class="chip outline" style="font-weight:700; font-size:11.5px; border-color:var(--border);">Career Discovery</span>
    </div>
    <div class="t-caption" style="margin-top:16px">Question ${i+1} of ${total}</div>
    <div class="progress-bar" style="margin:8px 0 24px"><div style="width:${((i+1)/total)*100}%"></div></div>
    <div class="t-h2" style="margin-bottom:20px; font-weight:800; color:var(--black); font-size:20px; line-height:1.45; text-align:left;">${item.q.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    <div class="stack gap-2" style="margin-bottom:24px;">${opts}</div>
    <div class="flex justify-between" style="margin-top:28px">
      <button class="btn btn-secondary" ${i===0?'disabled':''} onclick="App.prevAssessmentQ()">Previous</button>
      <button class="btn btn-primary" ${chosen===undefined?'disabled':''} onclick="App.nextAssessmentQ()" style="background:${chosen===undefined?'var(--border)':'var(--red)'}; font-weight:700; color:#fff;">${i===total-1 ? 'Finish' : 'Next'}</button>
    </div>
  </div>`;
}

const LOADING_MSGS = ["Reviewing your preferences…","Identifying interest patterns…","Understanding your work style…","Preparing your career insight…"];
function screenAssessmentLoading(){
  let i = 0;
  setTimeout(function tick(){
    const el = document.getElementById("loading-msg");
    if(!el) return;
    i = (i+1) % LOADING_MSGS.length;
    el.textContent = LOADING_MSGS[i];
    if(i < LOADING_MSGS.length) setTimeout(tick, 650);
  }, 650);
  setTimeout(()=>{ App.finishAssessment(); }, 2700);
  return `
  <div class="splash" style="background: linear-gradient(145deg, #090B0E 0%, #170709 50%, #29080B 100%);">
    <div class="circular" style="--pct:70; background: conic-gradient(var(--red) 70%, rgba(255,255,255,0.15) 0);">
      <style>
        .splash .circular::before { background: #0c0f13 !important; }
      </style>
      <div class="num" style="color:#fff;">✦</div>
    </div>
    <div class="t-h2" style="color:#ffffff; margin-top:24px; font-weight:800; font-family:'Outfit', sans-serif;">Understanding Your Career Preferences</div>
    <div class="t-body" style="color:rgba(255,255,255,0.7); margin-top:10px;" id="loading-msg">${LOADING_MSGS[0]}</div>
  </div>`;
}

function screenResult(){
  const recs = S.assessment?.recommendations || [];
  if(recs.length === 0) {
    return `<div class="page"><div class="empty-state">No recommendations found. Please run the assessment first.</div></div>`;
  }
  
  return `
  <div class="page" style="max-width:920px; margin:0 auto; padding:24px 16px; text-align:center;">
    <div style="margin-bottom:10px;">
      <span class="ai-tag" style="background:var(--red-tint); color:var(--red); font-weight:700; padding:6px 16px; border-radius:999px; font-size:11px; letter-spacing:0.06em;">✦ AI CAREER DISCOVERY ANALYSIS</span>
    </div>
    <div class="t-h1" style="font-size:28px; font-weight:800; letter-spacing:-0.02em; margin-bottom:6px; color:var(--black);">Your Career Fit Analysis</div>
    <div class="t-body muted" style="margin-bottom:16px; font-size:14.5px;">Based on your assessment answers, here are your top 5 recommended paths. Choose one to start your roadmap.</div>

    <!-- Student Awareness Note -->
    <div class="card card-pad" style="background:#FFFDF5; border:1.5px solid #F59E0B; border-radius:12px; padding:16px 20px; max-width:760px; margin:0 auto 24px; text-align:left; box-shadow: 0 0 16px rgba(245, 158, 11, 0.28), inset 0 0 8px rgba(245, 158, 11, 0.05);">
      <div style="display:flex; align-items:flex-start; gap:12px;">
        <span style="font-size:20px; line-height:1.2;">💡</span>
        <div style="font-size:13px; line-height:1.5; color:#78350F;">
          <strong style="color:#B45309; font-size:13.5px; display:block; margin-bottom:2px;">⚠️ Student Awareness Notice (AI Generated)</strong>
          These career recommendations are dynamically predicted by our AI model analyzing your responses and conceptual affinity. While highly aligned, this is meant as an advisory guidance resource to help you discover your strengths—not a rigid constraint. You are fully empowered to choose whichever career pathway you are most passionate to pursue.
        </div>
      </div>
    </div>

    <!-- Recommendation List Container -->
    <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:28px;">
      ${recs.map((rec, index) => {
        const isSelected = S.domain === rec.id;
        const explanation = `You demonstrated strong conceptual skills in ${rec.cat.toLowerCase()} problem solving. ${rec.fit.replace(/^you enjoy /, "Specifically, you enjoy ")}.`;
        return `
          <div class="selection-card ${isSelected ? 'selected' : ''}" 
               onclick="S.domain='${rec.id}'; saveState(); render();">
            
            <!-- Column 1: Icon and Percentage -->
            <div style="display:flex; flex-direction:column; align-items:center; min-width:80px; text-align:center; border-right:1px solid var(--border); padding-right:20px;">
              <div style="font-size:32px; margin-bottom:4px;">${rec.icon}</div>
              <div style="font-size:20px; font-weight:800; color:${isSelected ? 'var(--red)' : 'var(--black)'};">${rec.pct}%</div>
              <div class="t-caption" style="font-size:9.5px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.04em;">Match</div>
            </div>

            <!-- Column 2: Title and AI Explanation -->
            <div style="min-width:0;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span class="t-h3" style="font-size:16px; font-weight:800; color:var(--black); margin:0;">#${index + 1} ${rec.name}</span>
                <span class="badge neutral" style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;">${rec.cat}</span>
              </div>
              <p class="t-body muted" style="font-size:12.5px; line-height:1.45; margin:0 0 6px 0; font-weight:600; color:var(--ink-soft);">${rec.desc}</p>
              <div class="t-small" style="font-size:12px; font-style:italic; color:var(--red); font-weight:500; display:flex; align-items:flex-start; gap:4px; line-height:1.4;">
                <span style="font-style:normal;">✦</span>
                <span><strong>AI Insight:</strong> ${explanation}</span>
              </div>
            </div>

            <!-- Column 3: Radio Selector -->
            <div class="selector-dot">
              ${isSelected ? '✓' : ''}
            </div>
          </div>
        `;
      }).join("")}
    </div>

    <!-- AI Personalized Career Roadmap Dossier -->
    <div class="card card-pad" style="background:#FFFFFF; border:1.5px solid var(--border); border-radius:14px; padding:24px; max-width:760px; margin:0 auto 32px; text-align:left; box-shadow:var(--shadow);">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge" style="background:var(--red); color:#fff; font-size:10px; font-weight:800;">✦ GEMINI ROADMAP REPORT</span>
          <span class="t-h3" style="font-size:15px; color:var(--black); margin:0;">Active: ${domainById(S.domain)?.name || "Selected Track"}</span>
        </div>
        <span class="badge success" style="font-size:11px;">Validated</span>
      </div>
      <div style="font-size:13.5px; line-height:1.65; color:var(--black);">
        <p style="margin-bottom:8px;">
          <strong>1. Cognitive & Role Alignment:</strong> Your assessment answers exhibit an affinity for structured systems and measurable implementation. In modern industries, a <strong>${domainById(S.domain)?.name || "specialist"}</strong> bridges user-facing requirements with high-reliability execution.
        </p>
        <p style="margin-bottom:8px;">
          <strong>2. Strategic High-Yield Skills:</strong> Focus on foundational architecture, version control workflows, and unit testing practices before diving into niche frameworks.
        </p>
        <p style="margin:0;">
          <strong>3. Recommended 30-Day Milestone:</strong> Complete your profile builder, pass the technical quiz with ≥ 75% score, and sit for your AI mock interview session.
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3" style="justify-content:center; align-items:center;">
      <button class="btn btn-outline" style="min-width:190px; height:46px;" onclick="go('#/domains')">Edit Profile</button>
      <button class="btn btn-primary" style="min-width:210px; height:46px; gap:8px; box-shadow:0 4px 14px rgba(182,10,19,0.3); background:var(--red); font-weight:700;" onclick="go('#/future')">
        <span>Confirm & View Future</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
    </div>
  </div>`;
}

function screenFuture(){
  const d = domainById(S.domain) || { name: "Software Engineer", cat: "Engineering" };
  const bgImg = typeof getFutureCareerImageUrl === "function" ? getFutureCareerImageUrl(d) : "img/future_career.jpg";

  return `
  <div class="future-view-container" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:#0B0E14; z-index:99999; display:flex; flex-direction:column; justify-content:space-between; align-items:center; padding:32px 24px 50px; box-sizing:border-box; overflow:hidden;">
    
    <!-- 16:9 Career Workstation Visualization Image -->
    <img id="future-ai-image" src="${bgImg}" alt="Future Career Workstation" 
         onerror="this.onerror=null; this.src='img/future_career.jpg';"
         style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; z-index:0; opacity:0; transition:opacity 0.4s ease-in-out;" 
         onload="this.style.opacity='1'; const sk=document.getElementById('future-loading-skeleton'); if(sk) sk.style.display='none';" />

    <!-- Loading Indicator Skeleton -->
    <div id="future-loading-skeleton" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0D0F15; z-index:1; gap:16px;">
      <div style="width:48px; height:48px; border:3px solid rgba(182,10,19,0.2); border-top-color:var(--red); border-radius:50%; animation:cfSpin 0.8s linear infinite;"></div>
      <div style="color:#fff; font-size:15px; font-weight:700; letter-spacing:0.02em;">Loading Your Future ${d.name} Workstation…</div>
    </div>
    <style>@keyframes cfSpin { to { transform:rotate(360deg); } }</style>

    <!-- Top Navigation & Role Badge -->
    <div style="position:relative; z-index:2; width:100%; max-width:1200px; display:flex; justify-content:space-between; align-items:center;">
      <div style="background:rgba(18,21,28,0.75); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:8px 22px; color:#fff; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
        <span style="color:#FF5252; font-weight:800; font-size:13px;">✦ CAREER VISION:</span>
        <span style="font-weight:700; font-size:14px;">Your Professional Workstation as a ${d.name}</span>
      </div>
      <button onclick="go('#/dashboard')" 
              style="background:rgba(18,21,28,0.75); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:8px 18px; color:#fff; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s ease;">
        <span>✕ Close</span>
      </button>
    </div>

    <!-- Soft Bottom Gradient strictly behind Action Buttons to keep screen crystal clear -->
    <div style="position:absolute; bottom:0; left:0; right:0; height:180px; background:linear-gradient(to top, rgba(10,12,18,0.7) 0%, transparent 100%); pointer-events:none; z-index:1;"></div>
    
    <!-- Action Buttons -->
    <div style="position:relative; z-index:2; display:flex; gap:20px; width:100%; max-width:500px; padding:0; box-sizing:border-box; justify-content:center;">
      <button class="btn" onclick="go('#/dashboard')" style="flex:1; height:50px; border:2px solid var(--red); background:#fff; color:var(--red); font-weight:700; border-radius:12px; cursor:pointer; font-size:15px; transition:all 0.2s ease; box-shadow:0 4px 14px rgba(0,0,0,0.3);">
        Back to Dashboard
      </button>
      <button class="btn btn-primary" onclick="go('#/journey')" style="flex:1; height:50px; background:var(--red); border:none; color:#fff; font-weight:700; border-radius:12px; cursor:pointer; font-size:15px; box-shadow:0 6px 20px rgba(182,10,19,0.5); display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s ease;">
        <span>Yes, Start My Journey</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  </div>`;
}

function screenJourneyIntro(){
  const d = domainById(S.domain);
  const steps = [
    { num: 1, name: "Discover", active: true },
    { num: 2, name: "Build Profile", active: true },
    { num: 3, name: "Practice", active: false },
    { num: 4, name: "Improve", active: false },
    { num: 5, name: "Become Career Ready", active: false }
  ];

  const modules = [
    {
      title: "Interview Preparation",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
      tag: "HR & Tech Q&A",
      desc: "Practice tailored domain-specific questions with AI-guided correct answer breakdowns.",
      pts: "+15 pts",
      route: "#/interview-home"
    },
    {
      title: "Mock Interview",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      tag: "Full AI Simulation",
      desc: "Experience a complete, timed interview assessment evaluating performance and readiness.",
      pts: "+25 pts",
      route: "#/mock-home"
    },
    {
      title: "Career Reflection",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
      tag: "Self Evaluation & Cert",
      desc: "Reflect on your growth insights and submit your eligibility request for faculty certification.",
      pts: "+15 pts",
      route: "#/reflection"
    }
  ];

  return `
  <div class="page journey-page" style="max-width:960px; margin:0 auto; padding: 24px 16px;">
    <div class="journey-header" style="text-align:center; margin-bottom:32px;">
      <span class="ai-tag" style="margin-bottom:10px;">✨ AI-Powered Career Readiness Roadmap</span>
      <div class="t-h1" style="font-size:32px; letter-spacing:-0.02em; margin:6px 0;">Your CareerForge Journey Starts Here</div>
      <div class="t-body muted" style="font-size:15px; max-width:560px; margin:0 auto;">
        Target Domain: <strong style="color:var(--black);">${d?.name || "Selected Domain"}</strong>
      </div>
    </div>

    <!-- Stepper Roadmap -->
    <div class="journey-stepper-wrap">
      <div class="stepper-line-bg"></div>
      <div class="stepper-line-active" style="width: 38%;"></div>
      <div class="stepper-steps">
        ${steps.map(s => `
          <div class="stepper-step ${s.active ? 'active' : ''}">
            <div class="stepper-circle">${s.num}</div>
            <div class="stepper-label">${s.name}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 3-Column Module Grid -->
    <div class="grid journey-grid" style="grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin:36px 0 28px;">
      ${modules.map(m => `
        <div class="journey-card" onclick="go('${m.route}')">
          <div class="flex justify-between items-start" style="margin-bottom:12px;">
            <div class="journey-card-icon">${m.icon}</div>
            <div class="flex items-center gap-2">
              <span class="badge neutral" style="font-size:11px;">${m.tag}</span>
              <span class="badge success" style="font-size:11px;">${m.pts}</span>
            </div>
          </div>
          <div class="t-h3" style="font-size:18px; margin-bottom:6px; color:var(--black);">${m.title}</div>
          <div class="t-small" style="color:var(--ink-soft); line-height:1.45; font-size:13.5px;">${m.desc}</div>
          <div class="journey-card-footer">
            <span class="link-text">Explore Module</span>
            <span class="arrow">→</span>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- Primary Action Bar -->
    <div class="journey-footer" style="text-align:center; margin-top:20px;">
      <button class="btn btn-primary btn-lg journey-cta-btn" onclick="go('#/dashboard')">
        <span>Enter Career Dashboard</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  </div>`;
}

/* ============================================================
   SCREEN: Dashboard
   ============================================================ */
function screenDashboard(){
  const d = domainById(S.domain);
  const readiness = readinessScore();
  const completedCount = [S.hr.attempts, S.tech.attempts, S.mock.attempts].filter(a => a > 0).length;
  
  const modules = [
    {
      key: "hr",
      title: "HR Interview Prep",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
      best: S.hr.best,
      attempts: S.hr.attempts,
      route: "#/interview-home",
      cta: S.hr.attempts ? "Continue Practice" : "Start HR Prep",
      desc: "Behavioral questions & communication skill readiness"
    },
    {
      key: "tech",
      title: "Technical Interview Prep",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      best: S.tech.best,
      attempts: S.tech.attempts,
      route: "#/interview-home",
      cta: S.tech.attempts ? "Continue Practice" : "Start Technical Prep",
      desc: "Core domain concepts, code logic & technical Q&A"
    },
    {
      key: "mock",
      title: "Mock Interview",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      best: S.mock.best,
      attempts: S.mock.attempts,
      route: "#/mock-home",
      cta: S.mock.attempts ? "Retake Mock" : "Start Mock Interview",
      desc: "Comprehensive timed evaluation with AI feedback score"
    },
  ];

  const inner = `
    <div class="dash-welcome-banner">
      <div class="flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <div class="t-h1" style="font-size:26px;">Welcome back, ${S.account?.name?.split(" ")[0] || "Student"} 👋</div>
          <div class="t-body muted" style="margin-top:4px;">
            Target Domain: <span class="badge neutral" style="font-weight:700; font-size:12px;">${d?.name || "No domain selected"}</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="go('#/journey')">View Journey Roadmap →</button>
      </div>
    </div>

    <!-- Metrics Cards Row -->
    <div class="grid metrics-grid" style="grid-template-columns:repeat(4,1fr); gap:16px; margin:20px 0;">
      <div class="metric-card">
        <div class="flex justify-between items-center">
          <span class="label">Career Readiness</span>
          <span class="badge ${readiness>=75?'success':readiness>=40?'warning':'neutral'}">${readiness>=75?"Strong":readiness>=40?"Building":"Starting"}</span>
        </div>
        <div class="value"><span class="count-up" data-target="${readiness}">0</span>%</div>
        <div class="delta">Readiness Index</div>
      </div>
      
      <div class="metric-card">
        <div class="flex justify-between items-center">
          <span class="label">Total Points</span>
          <span class="badge success">⚡ Rewards</span>
        </div>
        <div class="value"><span class="count-up" data-target="${S.points}">0</span> <span style="font-size:14px; font-weight:600; color:var(--ink-soft);">pts</span></div>
        <div class="delta">Earned Points</div>
      </div>

      <div class="metric-card">
        <div class="flex justify-between items-center">
          <span class="label">Modules Attempted</span>
          <span class="badge neutral">${completedCount}/3</span>
        </div>
        <div class="value">${completedCount} <span style="font-size:14px; font-weight:600; color:var(--ink-soft);">/ 3</span></div>
        <div class="delta">${completedCount === 3 ? 'All completed 🎉' : 'In Progress'}</div>
      </div>

      <div class="metric-card">
        <div class="flex justify-between items-center">
          <span class="label">Cert Status</span>
          <span class="badge ${S.certStatus==='Approved'?'success':S.certStatus==='Pending Faculty Review'?'warning':'neutral'}">${S.certStatus}</span>
        </div>
        <div class="value" style="font-size:16px; line-height:1.4; font-weight:700; margin-top:4px;">${S.certStatus === 'Approved' ? 'Ready to Download 🎓' : 'In Progress'}</div>
        <div class="delta"><a href="#" onclick="go('#/certificate'); return false;" class="btn-text t-small">View Details</a></div>
      </div>
    </div>

    <!-- Insight & Meter Section -->
    <div class="grid two-col" style="grid-template-columns:1.3fr 1fr; gap:16px; margin-bottom:24px;">
      <div class="card card-pad flex items-center gap-4">
        <div class="circular" style="--pct:${readiness}"><div class="num"><span class="count-up" data-target="${readiness}">0</span>%</div></div>
        <div>
          <div class="t-h3">Career Readiness Index</div>
          <div class="t-small" style="margin-top:4px; line-height:1.4; color:var(--ink-soft);">${readiness>=75?"You're in strong shape — keep practicing to stay interview-ready.":readiness>=40?"Good progress — complete your remaining modules to boost your score.":"Just getting started — take module practice tests to build your readiness score."}</div>
        </div>
      </div>

      <div class="ai-card">
        <span class="ai-tag">✦ AI Talent Recommendation</span>
        <div class="t-h3" style="margin-top:8px">Next Recommended Step</div>
        <p class="t-small" style="margin-top:6px; line-height:1.4; color:var(--ink);">${
          !S.hr.attempts ? "Start with <strong>HR Interview Questions</strong> to build confidence." :
          !S.tech.attempts ? "Next up: Solve <strong>Technical Domain Questions</strong> tailored to your field." :
          !S.mock.attempts ? "Take the <strong>Mock Interview Simulation</strong> for full readiness evaluation." :
          "You've completed all modules! Review your reflection log and claim your certificate."
        }</p>
      </div>
    </div>

    <!-- Active Modules Section -->
    <div class="flex justify-between items-center" style="margin-bottom:14px;">
      <div class="t-h2">Career Readiness Modules</div>
      <a href="#" onclick="go('#/journey'); return false;" class="btn-text t-small">View Full Roadmap →</a>
    </div>

    <div class="grid" style="grid-template-columns:repeat(2,1fr); gap:16px;">
      ${modules.map(m => `
        <div class="dash-module-card">
          <div class="flex justify-between items-start" style="margin-bottom:8px;">
            <div class="flex items-center gap-3">
              <div class="dash-module-icon">${m.icon}</div>
              <div>
                <div class="t-h3" style="font-size:16px;">${m.title}</div>
                <div class="t-small muted" style="font-size:12px;">${m.desc}</div>
              </div>
            </div>
            ${m.best ? `<span class="badge success" style="font-weight:700;">Score: ${m.best}%</span>` : `<span class="badge neutral" style="font-size:11px;">Not Started</span>`}
          </div>

          <div class="progress-bar" style="margin:12px 0 8px;"><div style="width:${m.best || 0}%"></div></div>
          
          <div class="flex justify-between items-center" style="margin-top:12px;">
            <div class="t-small muted">Attempts: <strong>${m.attempts}</strong> ${m.best ? `| Best: <strong>${m.best}%</strong>` : ''}</div>
            <button class="btn btn-primary btn-sm" onclick="go('${m.route}')">${m.cta} →</button>
          </div>
        </div>
      `).join("")}
    </div>`;

  return shell("#/dashboard", "Overview", inner);
}

/* ============================================================
   SCREEN: Resume Analysis
   ============================================================ */
function screenResume(){
  const inner = `
    <button class="btn-back" onclick="go('#/dashboard')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">Resume Analysis</div><div class="t-body muted">Get AI feedback on how your resume fits ${domainById(S.domain)?.name || "your domain"}.</div></div>
    <div class="grid two-col" style="grid-template-columns:1.4fr 1fr; gap:20px;">
      <div class="card card-pad">
        <div id="drop-zone" style="border:2px dashed var(--border); border-radius:12px; padding:40px; text-align:center; cursor:pointer;" onclick="document.getElementById('resume-file').click()">
          <div style="font-size:30px">⬆️</div>
          <div class="t-h3" style="margin-top:8px">Drag & drop your resume, or click to browse</div>
          <div class="t-small">PDF or DOCX, up to 5MB</div>
          <input type="file" id="resume-file" style="display:none" onchange="App.resumeChosen(this.files[0])">
        </div>
        <div id="file-name" class="t-small" style="margin-top:10px"></div>
        <div class="t-small" style="margin-top:14px">🔒 Your resume is analyzed privately and never shared with third parties.</div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="go('#/resume-processing')">Analyze Resume</button>
      </div>
      <div class="card card-pad">
        <div class="t-h3">What we'll review</div>
        <ul class="stack gap-2" style="margin-top:10px">
          <li class="t-small">✓ ATS compatibility & formatting</li>
          <li class="t-small">✓ Domain relevance for ${domainById(S.domain)?.name || "your domain"}</li>
          <li class="t-small">✓ Content quality & clarity</li>
          <li class="t-small">✓ Skills presentation & keywords</li>
        </ul>
      </div>
    </div>`;
  return shell("#/resume", "Resume Analysis", inner);
}
function screenResumeProcessing(){
  const steps = ["Reading structure…","Reviewing skills…","Checking domain relevance…","Evaluating ATS compatibility…","Preparing suggestions…"];
  setTimeout(()=>App.finishResume(), 2400);
  let i=0;
  setTimeout(function tick(){
    const el = document.getElementById("rp-step");
    if(!el) return;
    i++;
    if(i<steps.length){ el.textContent = steps[i]; setTimeout(tick,450); }
  },450);
  const inner = `
    <div class="stack" style="align-items:center; text-align:center; padding:60px 0;">
      <div class="circular" style="--pct:60"><div class="num">📄</div></div>
      <div class="t-h2" style="margin-top:16px">Analyzing Your Resume</div>
      <div class="t-body muted" id="rp-step">${steps[0]}</div>
    </div>`;
  return shell("#/resume", "Resume Analysis", inner);
}
function screenResumeResult(){
  const r = S.resume;
  const sub = { ats: clamp(r.current-4,0,100), domain: clamp(r.current+3,0,100), content: clamp(r.current-8,0,100), skills: clamp(r.current+1,0,100) };
  const inner = `
    <button class="btn-back" onclick="go('#/dashboard')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">Resume Analysis Result</div></div>
    <div class="grid two-col" style="grid-template-columns:1fr 1.4fr; gap:20px;">
      <div class="card card-pad" style="text-align:center">
        <div class="circular" style="--pct:${r.current}"><div class="num">${r.current}</div></div>
        <div class="t-small" style="margin-top:8px">out of 100</div>
        <div class="flex justify-between t-small" style="margin-top:16px; text-align:left;">
          <span>Best Score<br><strong>${r.best}</strong></span><span>Current<br><strong>${r.current}</strong></span><span>Attempts<br><strong>${r.attempts}</strong></span>
        </div>
      </div>
      <div class="card card-pad">
        <div class="t-h3">Sub-scores</div>
        ${Object.entries({"ATS Compatibility":sub.ats,"Domain Relevance":sub.domain,"Content Quality":sub.content,"Skills Presentation":sub.skills}).map(([k,v])=>`
          <div style="margin:10px 0"><div class="flex justify-between t-small"><span>${k}</span><span>${v}</span></div><div class="progress-bar"><div style="width:${v}%"></div></div></div>`).join("")}
      </div>
    </div>
    <div class="grid two-col" style="grid-template-columns:1fr 1fr; gap:20px; margin-top:16px;">
      <div class="card card-pad"><div class="t-h3">Strengths</div><ul class="stack gap-2" style="margin-top:8px"><li class="t-small">✓ Clear project structure</li><li class="t-small">✓ Quantified impact in one role</li></ul></div>
      <div class="card card-pad"><div class="t-h3">Needs Improvement</div><ul class="stack gap-2" style="margin-top:8px"><li class="t-small">⚠ Missing domain-specific keywords</li><li class="t-small">⚠ Summary section could be sharper</li></ul></div>
    </div>
    <div class="ai-card" style="margin-top:16px"><span class="ai-tag">✦ AI-Generated</span><div class="t-h3" style="margin-top:8px">Top Missing Skills/Keywords</div>
      <div class="flex gap-2" style="flex-wrap:wrap; margin-top:8px">${(domainById(S.domain)?.skills||["Skill A","Skill B"]).map(s=>`<span class="chip outline">${s}</span>`).join("")}</div>
    </div>
    <div class="flex gap-3" style="margin-top:20px">
      <button class="btn btn-outline" onclick="go('#/resume')">Upload Improved Resume</button>
      <button class="btn btn-primary" onclick="toast('+ ${r.attempts>1?'Improvement':'First attempt'} — see comparison below')">View Detailed Feedback</button>
    </div>
    ${r.attempts>1?`<div class="card card-pad" style="margin-top:16px"><div class="t-h3">Improvement</div><div class="t-body">Previous ${r.best!==r.current?Math.max(0,r.best-((r.current-r.best))):r.best} → Current <strong>${r.current}</strong></div></div>`:""}
  `;
  return shell("#/resume", "Resume Analysis", inner);
}

/* ============================================================
   SCREEN: Interview Prep (HR + Technical share the same engine)
   ============================================================ */
function screenInterviewHome(){
  const inner = `
    <button class="btn-back" onclick="go('#/dashboard')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">Interview Preparation</div><div class="t-body muted">Real-time AI-powered interview practice for ${domainById(S.domain)?.name || "your domain"} — powered by Google Gemini 3.6 Flash.</div></div>
    <div class="grid" style="grid-template-columns:repeat(2,1fr); gap:16px;">
      <div class="module-card">
        <div class="row"><div class="flex items-center gap-2"><div class="icon-badge">🗣️</div><div class="t-h3">HR Interview</div></div><span class="badge" style="background:var(--red); color:#fff; font-size:10px; font-weight:800;">✦ GEMINI AI</span></div>
        <div class="t-small">Behavioral and situational challenges tailored for your domain, evaluated with recruiter reasoning.</div>
        <div class="row t-small muted"><span>Best: ${S.hr.best||'—'}</span><span>Attempts: ${S.hr.attempts}</span></div>
        <button class="btn btn-primary" onclick="App.startInterview('hr')">Start HR Practice</button>
      </div>
      <div class="module-card">
        <div class="row"><div class="flex items-center gap-2"><div class="icon-badge">💻</div><div class="t-h3">Technical Interview</div></div><span class="badge" style="background:var(--red); color:#fff; font-size:10px; font-weight:800;">✦ GEMINI AI</span></div>
        <div class="t-small">Real-world engineering and architecture questions generated specifically for your selected career track.</div>
        <div class="row t-small muted"><span>Best: ${S.tech.best||'—'}</span><span>Attempts: ${S.tech.attempts}</span></div>
        <button class="btn btn-primary" onclick="App.startInterview('tech')">Start Tech Practice</button>
      </div>
    </div>
    <div class="ai-card" style="margin-top:20px"><span class="ai-tag">✦ AI Recommended for You</span><div class="t-body" style="margin-top:8px">${S.resume.attempts ? "Since you've completed resume analysis, technical interview practice is a strong next step." : "Try HR interview practice first to build interview confidence."}</div></div>`;
  return shell("#/interview-home", "Interview Prep", inner);
}
function screenInterviewIntro(){
  const type = S.interviewType;
  const label = type==='hr' ? "HR" : "Technical";
  const d = domainById(S.domain);
  const inner = `
    <button class="btn-back" onclick="go('#/interview-home')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">${d?.name || ''} ${label} Interview</div>
    <div class="t-body muted">Questions are dynamically synthesized by <strong>Google Gemini 3.6 Flash</strong> specifically for ${d?.name || 'your domain'}. Each question includes deep technical/recruiter reasoning.</div></div>
    <div class="card card-pad">
      <div class="flex justify-between t-small"><span>Total Questions</span><strong>7 dynamic challenges</strong></div>
      <div class="flex justify-between t-small" style="margin-top:6px"><span>Points per question</span><strong>20</strong></div>
      <div class="flex justify-between t-small" style="margin-top:6px"><span>Max score</span><strong>100</strong></div>
      <p class="t-small muted" style="margin-top:12px">Every attempt generates fresh, realistic interview questions directly from Google Gemini AI.</p>
      <button id="btn-start-interview" class="btn btn-primary btn-block" style="margin-top:16px" onclick="App.beginInterviewQuestions()">Start Interview Practice</button>
    </div>`;
  return shell("#/interview-home", "Interview Prep", inner);
}
function screenInterviewQuestion(){
  const i = S.qIndex;
  const set = S.interviewSet;
  const item = set[i];
  const total = set.length;
  const answered = S.interviewCorrect[i] !== undefined;
  const type = S.interviewType==='hr'?'HR':'Technical';
  const opts = item.opts.map((o,oi)=>{
    let cls = "";
    if(answered){
      if(oi===item.correct) cls="correct";
      else if(oi===S.interviewCorrect[i].picked) cls="incorrect";
    }
    return `<div class="option-card ${cls}" onclick="${answered?'':'App.pickInterviewOption('+oi+')'}"><div class="dot"></div><div class="t-body">${o}</div></div>`;
  }).join("");
  const inner = `
    <div class="flex justify-between items-center">
      <button class="btn-back" onclick="App.exitInterview()">← Exit</button>
      <div class="flex gap-2 items-center"><span class="chip outline">${type} · ${domainById(S.domain)?.name||''}</span><span class="badge" style="background:var(--red); color:#fff; font-size:10px; font-weight:800;">✦ GEMINI AI POWERED</span></div>
    </div>
    <div class="t-caption" style="margin-top:14px">Question ${i+1} of ${total}</div>
    <div class="progress-bar" style="margin:8px 0 20px"><div style="width:${((i+1)/total)*100}%"></div></div>
    <div class="t-h2" style="margin-bottom:20px">${item.q}</div>
    <div class="stack gap-3">${opts}</div>
    ${answered ? feedbackBlock(item, S.interviewCorrect[i]) : ""}
    <div class="flex justify-between" style="margin-top:24px">
      <button class="btn btn-secondary" ${i===0?'disabled':''} onclick="App.prevInterviewQ()">Previous</button>
      <button class="btn btn-primary" ${answered?'':'disabled'} onclick="App.nextInterviewQ()">${i===total-1?'See Results':'Next Question'}</button>
    </div>`;
  return shell("#/interview-home", "Interview Prep", inner);
}
function feedbackBlock(item, res){
  if(res.picked === item.correct){
    return `<div class="card card-pad" style="margin-top:16px; border-color:var(--success); background:var(--success-tint)">
      <span class="badge success">Correct</span>
      <div class="t-body" style="margin-top:8px">${item.explain}</div>
      <div class="t-small muted" style="margin-top:6px">💡 Recruiter tip: ${item.tip}</div>
    </div>`;
  }
  return `<div class="ai-card" style="margin-top:16px">
    <span class="ai-tag">✦ Gemini AI Feedback</span>
    <div class="t-h3" style="margin-top:8px">Not quite — here's the industry standard</div>
    <div class="t-small" style="margin-top:6px"><strong>Correct answer:</strong> ${item.opts[item.correct]}</div>
    <p class="t-body" style="margin-top:8px">${item.explain}</p>
    <div class="t-small muted" style="margin-top:6px">💡 Recruiter tip: ${item.tip}</div>
  </div>`;
}
function screenInterviewResult(){
  const type = S.interviewType;
  const bucket = type==='hr' ? S.hr : S.tech;
  const correctCount = S.interviewCorrect.filter(r=>r && r.picked===r.correct).length;
  const inner = `
    <button class="btn-back" onclick="go('#/interview-home')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">${type==='hr'?'HR':'Technical'} Interview Result</div></div>
    <div class="grid two-col" style="grid-template-columns:1fr 1fr; gap:16px;">
      <div class="card card-pad" style="text-align:center"><div class="circular" style="--pct:${bucket.current}"><div class="num">${bucket.current}</div></div><div class="t-small" style="margin-top:8px">Score this attempt</div></div>
      <div class="stack gap-3">
        <div class="metric-card"><div class="label">Highest Score</div><div class="value">${bucket.best}</div></div>
        <div class="metric-card"><div class="label">Total Attempts</div><div class="value">${bucket.attempts}</div></div>
      </div>
    </div>
    <div class="grid two-col" style="grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
      <div class="card card-pad"><div class="t-h3">Performance Summary</div><div class="t-small" style="margin-top:8px">Correctly answered ${correctCount} of ${S.interviewSet.length} questions in this Gemini AI session.</div></div>
      <div class="card card-pad"><div class="t-h3">Next Steps</div><div class="t-small" style="margin-top:8px">Review explanations for any missed concepts, or start a new attempt for fresh AI questions.</div></div>
    </div>
    <div class="flex gap-3" style="margin-top:20px">
      <button class="btn btn-outline" onclick="App.startInterview('${type}')">Retry with New AI Questions</button>
      <button class="btn btn-secondary" onclick="go('#/interview-home')">Review Topics</button>
      <button class="btn btn-primary" style="flex:1" onclick="go('#/dashboard')">Back to Dashboard</button>
    </div>
    <div class="t-small muted" style="margin-top:12px">Every retry dynamically generates a brand-new Gemini AI question set.</div>`;
  return shell("#/interview-home", "Interview Prep", inner);
}

/* ============================================================
   SCREEN: Mock Interview
   ============================================================ */
function screenMockHome(){
  const d = domainById(S.domain);
  const inner = `
    <button class="btn-back" onclick="go('#/dashboard')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">AI Mock Interview</div><div class="t-body muted">Role: ${d?.roles?.[0] || "Domain Specialist"}</div></div>
    <div class="card card-pad">
      <div class="grid" style="grid-template-columns:repeat(3,1fr); gap:14px;">
        <div><div class="t-caption">Duration</div><div class="t-body-lg">~15 minutes</div></div>
        <div><div class="t-caption">Questions</div><div class="t-body-lg">7 open-ended</div></div>
        <div><div class="t-caption">Mode</div><div class="t-body-lg">Text response</div></div>
      </div>
      <p class="t-small muted" style="margin-top:14px">Your answers are evaluated by AI across relevance, structure, communication and domain knowledge.</p>
      <div class="flex gap-4" style="margin-top:14px">
        <div class="t-small">Best score: <strong>${S.mock.best||'—'}</strong></div>
        <div class="t-small">Attempts: <strong>${S.mock.attempts}</strong></div>
      </div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="App.startMock()">Start Mock Interview</button>
    </div>`;
  return shell("#/mock-home", "Mock Interview", inner);
}
const MOCK_QUESTIONS = [
  "Walk me through a project you're proud of and your role in it.",
  "How do you approach learning a new tool or technology quickly?",
  "Describe a time you disagreed with a teammate. How did you handle it?",
  "Why are you interested in this particular career domain?",
  "Where do you want to be professionally in three years?",
];
function screenMockSession(){
  const i = S.qIndex;
  const q = MOCK_QUESTIONS[i];
  const inner = `
    <div class="flex justify-between items-center">
      <button class="btn-back" onclick="App.exitMock()">← Exit</button>
      <span class="chip outline">Question ${i+1} of ${MOCK_QUESTIONS.length}</span>
    </div>
    <div class="grid two-col" style="grid-template-columns:1.4fr 1fr; gap:20px; margin-top:16px;">
      <div class="card card-pad">
        <div class="flex items-center gap-3"><div class="avatar" style="background:var(--red)">AI</div><div class="t-h3">AI Interviewer</div></div>
        <div class="t-body-lg" style="margin-top:16px">${q}</div>
        <textarea id="mock-answer" placeholder="Type your answer here…" style="width:100%; min-height:160px; margin-top:16px; border:1px solid var(--border); border-radius:12px; padding:14px; font-family:inherit;" oninput="document.getElementById('char-count').textContent = this.value.length + ' characters'"></textarea>
        <div class="flex justify-between t-small muted" style="margin-top:6px"><span id="char-count">0 characters</span></div>
        <button class="btn btn-primary" style="margin-top:12px" onclick="App.submitMockAnswer()">Submit Answer</button>
      </div>
      <div class="stack gap-3">
        <div class="card card-pad"><div class="t-h3">Session Info</div>
          <div class="progress-bar" style="margin:10px 0"><div style="width:${(i/MOCK_QUESTIONS.length)*100}%"></div></div>
          <div class="t-small">Questions completed: ${i} of ${MOCK_QUESTIONS.length}</div>
        </div>
        <div class="card card-pad" style="opacity:0.6">
          <div class="flex justify-between items-center"><div class="t-h3">Voice Mode</div><span class="badge neutral">Coming Soon</span></div>
          <div class="t-small" style="margin-top:6px">Speak your answers instead of typing.</div>
          <button class="btn btn-secondary btn-block" style="margin-top:10px" disabled>Enable Voice Mode</button>
        </div>
      </div>
    </div>`;
  return shell("#/mock-home", "Mock Interview", inner);
}
function screenMockFeedback(){
  const m = S.mock;
  const ai = S.mockAIFeedback || {
    score: typeof m.current === "number" ? m.current : 0,
    relevance: typeof m.current === "number" ? m.current : 0,
    communication: typeof m.current === "number" ? m.current : 0,
    technical: typeof m.current === "number" ? m.current : 0,
    structure: typeof m.current === "number" ? m.current : 0,
    feedback: "Assessment completed.",
    tips: "Structure answers using the STAR framework (Situation, Task, Action, Result) with measurable metrics."
  };

  const currentScore = typeof ai.score === "number" ? ai.score : (m.current || 0);

  const cats = {
    "Answer Relevance": typeof ai.relevance === "number" ? ai.relevance : currentScore,
    "Communication": typeof ai.communication === "number" ? ai.communication : currentScore,
    "Technical Precision": typeof ai.technical === "number" ? ai.technical : currentScore,
    "Answer Structure": typeof ai.structure === "number" ? ai.structure : currentScore
  };

  const inner = `
    <button class="btn-back" onclick="go('#/dashboard')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">AI Mock Interview Feedback</div></div>
    <div class="grid two-col" style="grid-template-columns:1fr 1.4fr; gap:20px;">
      <div class="card card-pad" style="text-align:center">
        <div class="circular" style="--pct:${currentScore}"><div class="num">${currentScore}</div></div>
        <div class="t-small" style="margin-top:8px">Gemini Evaluation Score</div>
      </div>
      <div class="card card-pad">
        ${Object.entries(cats).map(([k,v])=>`
          <div style="margin:8px 0"><div class="flex justify-between t-small"><span>${k}</span><span>${v}%</span></div><div class="progress-bar"><div style="width:${v}%"></div></div></div>`).join("")}
      </div>
    </div>
    <div class="card card-pad" style="margin-top:16px; background:linear-gradient(180deg,#fff,#FFF8F8); border-color:#F5C2C4;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="badge" style="background:var(--red); color:#fff; font-size:10px; font-weight:800;">✦ GEMINI AI EVALUATION</span>
      </div>
      <p class="t-body" style="margin-top:10px; font-size:14px; line-height:1.6; color:var(--black);">
        ${ai.feedback}
      </p>
      <div class="card card-pad" style="background:#fff; margin-top:12px; border-left:4px solid var(--red); padding:10px 14px;">
        <strong style="font-size:12.5px; color:var(--red);">Actionable Coaching Tip:</strong>
        <div style="font-size:13px; color:var(--ink-soft); margin-top:3px;">${ai.tips}</div>
      </div>
    </div>
    <div class="flex gap-3" style="margin-top:20px">
      <button class="btn btn-outline" onclick="App.startMock()">Retry Interview</button>
      <button class="btn btn-primary" style="flex:1" onclick="go('#/dashboard')">Continue Journey</button>
    </div>`;
  return shell("#/mock-home", "Mock Interview", inner);
}

/* ============================================================
   SCREEN: Reflection
   ============================================================ */
const REFLECTION_QS = [
  "What did you learn about yourself through this process?",
  "Which module challenged you the most, and why?",
  "What's one skill you want to strengthen before your next attempt?",
  "How has your view of this career domain changed?",
];
function screenReflection(){
  const inner = `
    <button class="btn-back" onclick="go('#/dashboard')">← Back</button>
    <div class="page-head" style="margin-top:8px"><div class="t-h1">Career Reflection</div><div class="t-body muted">Take a moment to reflect on your journey so far.</div></div>
    <form class="stack gap-4" onsubmit="return App.submitReflection(event)">
      ${REFLECTION_QS.map((q,i)=>`<div class="field"><label>${q}</label><textarea placeholder="Share your thoughts…" oninput="App.autosave()"></textarea></div>`).join("")}
      <div class="flex justify-between items-center">
        <span class="t-small muted" id="autosave-status">All changes saved</span>
        <button class="btn btn-primary" type="submit">Submit Reflection</button>
      </div>
    </form>`;
  return shell("#/reflection", "Career Reflection", inner);
}
function screenReflectionDone(){
  const inner = `
    <div class="stack" style="align-items:center; text-align:center; padding:50px 0;">
      <div style="font-size:40px">🌱</div>
      <div class="t-h1" style="margin-top:12px">Reflection Complete</div>
      <p class="t-body muted" style="max-width:480px">Thank you for taking time to reflect — self-awareness compounds just like practice does.</p>
      <div class="ai-card" style="max-width:480px; margin-top:16px; text-align:left;"><span class="ai-tag">✦ AI Insight</span><p class="t-body" style="margin-top:8px">Your reflections show growing clarity about what excites you in this domain — a strong sign of genuine interest.</p></div>
      <div class="badge success" style="margin-top:16px">+15 Reward Points Earned</div>
      <button class="btn btn-primary" style="margin-top:20px" onclick="go('#/progress')">View My Progress</button>
    </div>`;
  return shell("#/reflection", "Career Reflection", inner);
}

/* ============================================================
   SCREEN: Progress / Rewards / Certificate / Profile / Settings
   ============================================================ */
function screenProgress(){
  const readiness = readinessScore();
  const mods = [
    {name:"HR Interview", d:S.hr}, {name:"Technical Interview", d:S.tech}, {name:"Mock Interview", d:S.mock},
  ];
  const inner = `
    <div class="page-head"><div class="t-h1">Progress Dashboard</div></div>
    <div class="grid metrics-grid" style="grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px;">
      <div class="metric-card"><div class="label">Career Readiness</div><div class="value">${readiness}%</div></div>
      <div class="metric-card"><div class="label">Overall Improvement</div><div class="value">+${mods.reduce((a,m)=>a+ (m.d.attempts>1? Math.round(m.d.best*0.1):0),0)}%</div></div>
      <div class="metric-card"><div class="label">Total Attempts</div><div class="value">${mods.reduce((a,m)=>a+m.d.attempts,0)}</div></div>
      <div class="metric-card"><div class="label">Total Reward Points</div><div class="value">${S.points}</div></div>
    </div>
    <div class="t-h2" style="margin-bottom:12px">Module Performance</div>
    <div class="grid" style="grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:24px;">
      ${mods.map(m=>`<div class="module-card"><div class="row"><div class="t-h3">${m.name}</div><span class="badge ${m.d.best?'success':'neutral'}">${m.d.best||'Not started'}</span></div>
        <div class="progress-bar"><div style="width:${m.d.best}%"></div></div>
        <div class="row t-small muted"><span>Attempts: ${m.d.attempts}</span><span>Best: ${m.d.best||'—'}</span></div></div>`).join("")}
    </div>
    <div class="card card-pad">
      <div class="t-h3">Your Growth Journey</div>
      <div class="stack gap-3" style="margin-top:12px">
        ${S.pointHistory.length ? S.pointHistory.slice(0,6).map(p=>`<div class="flex justify-between t-small" style="border-bottom:1px solid var(--border); padding-bottom:8px;"><span>${p.label}</span><span class="muted">${p.date} · +${p.amount} pts</span></div>`).join("") : '<div class="empty-state"><div class="glyph">📈</div>Complete a module to start your timeline.</div>'}
      </div>
    </div>
    <div class="ai-card" style="margin-top:16px"><span class="ai-tag">✦ AI Progress Insight</span><p class="t-body" style="margin-top:8px">${readiness>=60?"You're building consistent momentum — technical depth is your biggest lever right now.":"Complete a few more modules to unlock a personalized growth insight."}</p></div>`;
  return shell("#/progress", "Progress", inner);
}
function screenRewards(){
  const inner = `
    <div class="page-head"><div class="t-h1">Rewards & Points</div></div>
    <div class="grid metrics-grid" style="grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px;">
      <div class="metric-card"><div class="label">Total Points</div><div class="value">${S.points}</div></div>
      <div class="metric-card"><div class="label">Points This Week</div><div class="value">${S.pointHistory.reduce((a,p)=>a+p.amount,0)}</div></div>
      <div class="metric-card"><div class="label">Improvement Points</div><div class="value">${Math.round(S.points*0.2)}</div></div>
    </div>
    <div class="card card-pad" style="margin-bottom:20px">
      <div class="t-h3">How Points Work</div>
      <p class="t-small muted" style="margin-top:8px">You earn points for completing modules, improving on previous scores, and finishing reflections. Points reflect effort and consistency, not just raw scores.</p>
    </div>
    <div class="card" style="overflow:auto">
      <table><thead><tr><th>Activity</th><th>Points</th><th>Date</th></tr></thead>
      <tbody>${S.pointHistory.length ? S.pointHistory.map(p=>`<tr><td>${p.label}</td><td>+${p.amount}</td><td>${p.date}</td></tr>`).join("") : `<tr><td colspan="3"><div class="empty-state">No activity yet — complete a module to earn your first points.</div></td></tr>`}</tbody></table>
    </div>`;
  return shell("#/rewards", "Rewards", inner);
}
function screenCertificate(){
  const readiness = readinessScore();
  const criteria = [
    { label:"HR Interview practiced", done: S.hr.attempts>0 },
    { label:"Technical Interview practiced", done: S.tech.attempts>0 },
    { label:"Mock Interview completed", done: S.mock.attempts>0 },
    { label:"Career Reflection submitted", done: S.reflection.done },
  ];
  const allDone = criteria.every(c=>c.done);
  if(allDone && S.certStatus==="Not Eligible"){ S.certStatus = "Pending Faculty Review"; saveState(); }
  const inner = `
    <div class="page-head"><div class="t-h1">Certificate Eligibility</div></div>
    <div class="card card-pad">
      <div class="flex justify-between items-center"><div class="t-h3">Readiness Progress</div><span class="badge ${readiness>=70?'success':'warning'}">${readiness}% Complete</span></div>
      <div class="progress-bar" style="margin-top:10px"><div style="width:${readiness}%"></div></div>
      <ul class="stack gap-2" style="margin-top:18px">
        ${criteria.map(c=>`<li class="t-small">${c.done?'✅':'⬜'} ${c.label}</li>`).join("")}
      </ul>
      <div class="badge ${S.certStatus==='Approved'?'success':S.certStatus==='Pending Faculty Review'?'warning':'neutral'}" style="margin-top:16px">${S.certStatus}</div>
      <p class="t-small muted" style="margin-top:10px">Certificates are reviewed by faculty and are never issued automatically.</p>
      ${S.certStatus==='Approved' ? `<button class="btn btn-primary" style="margin-top:14px" onclick="go('#/cert-preview')">View Certificate</button>`:''}
    </div>`;
  return shell("#/certificate", "Certificate", inner);
}
function screenCertPreview(){
  const inner = `
    <button class="btn-back" onclick="go('#/certificate')">← Back</button>
    <div class="card card-pad" style="max-width:800px; margin:20px auto; text-align:center; border:2px solid var(--black); padding:48px; border-radius:16px; background:#fff; box-shadow:var(--shadow-md);">
      <div style="display:flex; justify-content:center; margin-bottom:12px;">${logoSvg(44)}</div>
      <div class="t-caption" style="letter-spacing:0.12em;">CAREERFORGE AI — INSTITUTIONAL CERTIFICATION</div>
      <div class="t-h1" style="margin:10px 0; font-size:28px;">Career Readiness Certificate</div>
      <div class="t-body-lg" style="margin:16px 0">This certifies that</div>
      <div class="t-h1" style="color:var(--red); font-size:32px;">${S.account?.name || "Student Name"}</div>
      <div class="t-body muted" style="margin:10px 0">has successfully demonstrated career readiness and core skill proficiency in</div>
      <div class="t-h2" style="font-size:22px; color:var(--black); font-weight:700;">${domainById(S.domain)?.name || "Selected Domain"}</div>
      <div class="flex justify-between" style="margin-top:36px; text-align:left;">
        <div><div class="t-caption">Certificate ID</div><div class="t-small" style="font-weight:700;">CF-${hashCode(S.account?.email||'x').toString().slice(0,8)}</div></div>
        <div><div class="t-caption">Issue Date</div><div class="t-small" style="font-weight:700;">${new Date().toISOString().slice(0,10)}</div></div>
      </div>
      <div class="flex justify-between" style="margin-top:24px; text-align:left;">
        <div><div class="t-caption">Faculty Signature</div><div class="t-small" style="margin-top:20px; border-top:1px solid var(--border); padding-top:6px; font-weight:700;">Dr. Faculty Advisor</div></div>
        <div><div class="t-caption">QR Verification</div><div style="width:60px;height:60px;background:var(--bg); border:1px solid var(--border); border-radius:8px; margin-top:6px; display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--ink-soft); text-align:center;">VERIFIED</div></div>
      </div>
    </div>
    <div class="flex gap-3" style="justify-content:center">
      <button class="btn btn-secondary" onclick="toast('Downloading certificate (demo)')">Download</button>
      <button class="btn btn-secondary" onclick="toast('Verification link copied (demo)')">Verify</button>
      <button class="btn btn-primary" onclick="toast('Shared to profile (demo)')">Share Achievement</button>
    </div>`;
  return shell("#/certificate", "Certificate", inner);
}
function screenProfile(){
  const d = domainById(S.domain);
  const p = S.profile || {};
  const inner = `
    <div class="page-head"><div class="t-h1">Student Profile</div></div>
    <div class="card card-pad flex items-center gap-4">
      <div class="avatar lg">${initials(S.account?.name)}</div>
      <div>
        <div class="t-h2">${S.account?.name || "Student"}</div>
        <div class="t-small muted">${p.enrollment||''} · ${p.dept||''} · ${p.year||''}</div>
        <div class="t-small muted">${d ? d.name : "No domain selected"}</div>
      </div>
      <button class="btn btn-secondary" style="margin-left:auto" onclick="go('#/profile-setup')">Edit Resume & Profile</button>
    </div>
    <div class="grid metrics-grid" style="grid-template-columns:repeat(4,1fr); gap:16px; margin:20px 0;">
      <div class="metric-card"><div class="label">Readiness Score</div><div class="value">${readinessScore()}%</div></div>
      <div class="metric-card"><div class="label">Reward Points</div><div class="value">${S.points}</div></div>
      <div class="metric-card"><div class="label">Modules Completed</div><div class="value">${[S.hr,S.tech,S.mock].filter(m=>m.attempts>0).length}/3</div></div>
      <div class="metric-card"><div class="label">Total Attempts</div><div class="value">${[S.hr,S.tech,S.mock].reduce((a,m)=>a+m.attempts,0)}</div></div>
    </div>
    <div class="grid two-col" style="grid-template-columns:1fr 1fr; gap:16px;">
      <div class="card card-pad"><div class="t-h3">Skills</div><div class="flex gap-2" style="flex-wrap:wrap; margin-top:8px">${(p.skills||[]).map(s=>`<span class="chip outline">${s}</span>`).join("") || '<span class="t-small muted">No skills added yet</span>'}</div></div>
      <div class="card card-pad">
        <div class="t-h3">Projects</div>
        <div style="margin-top:8px; display:flex; flex-direction:column; gap:8px;">
          ${(p.projects||[]).map(pr => `
            <div style="border-bottom: 1px dashed var(--border); padding-bottom: 6px; text-align:left;">
              <div style="font-weight:700; color:var(--black); font-size:12.5px;">${pr.title} <span style="font-size:10px; font-weight:500; color:var(--red); font-style:italic;">${pr.tech}</span></div>
              <div class="t-small muted" style="margin-top:2px; font-size:11.5px; line-height:1.35;">${pr.desc}</div>
            </div>
          `).join("") || '<span class="t-small muted">No projects added yet</span>'}
        </div>
      </div>
    </div>
    <div class="card card-pad" style="margin-top:16px"><div class="t-h3">Certificate Status</div><span class="badge ${S.certStatus==='Approved'?'success':S.certStatus==='Pending Faculty Review'?'warning':'neutral'}" style="margin-top:8px">${S.certStatus}</span></div>`;
  return shell("#/profile", "Profile", inner);
}
function screenSettings(){
  const inner = `
    <div class="page-head"><div class="t-h1">Settings</div></div>
    <div class="stack gap-4" style="max-width:560px">
      <div class="card card-pad"><div class="t-h3">Account</div><div class="field" style="margin-top:10px"><label>Email</label><input value="${S.account?.email||''}" disabled></div><button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="toast('Password change link sent (demo)')">Change Password</button></div>
      <div class="card card-pad"><div class="t-h3">Notifications</div><label class="checkbox-row" style="margin-top:10px"><input type="checkbox" checked>Email me about new AI insights</label><label class="checkbox-row" style="margin-top:8px"><input type="checkbox" checked>Remind me to retry modules</label></div>
      <div class="card card-pad"><div class="t-h3">Appearance</div><div class="field" style="margin-top:10px"><select><option>Light (default)</option><option>System</option></select></div></div>
      <div class="card card-pad"><div class="t-h3">Security</div><button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="App.logout()">Log Out</button></div>
    </div>`;
  return shell("#/settings", "Settings", inner);
}

/* ============================================================
   INTERACTIVE NEURAL NETWORK CANVAS ANIMATION (AUTH PAGE BACKDROP)
   ============================================================ */
function initAuthCanvas() {
  const canvas = document.getElementById('auth-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationId;
  
  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  const particles = [];
  const particleCount = 42;
  let mouse = { x: null, y: null };
  
  const parent = canvas.parentElement;
  parent.addEventListener('mousemove', (e) => {
    const rect = parent.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  
  parent.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = 1.5 + Math.random() * 2.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      
      // Mouse magnetic effect
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          this.x += dx * 0.012;
          this.y += dy * 0.012;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(182, 10, 19, 0.16)';
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();
      
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 105) {
          const alpha = (1 - dist / 105) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(182, 10, 19, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
      
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(182, 10, 19, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    
    animationId = requestAnimationFrame(animate);
  }
  animate();
  
  canvas._cleanup = () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  };
}

/* ============================================================
   INTERACTIVE RESUME BUILDER BACKDROP CANVAS
   ============================================================ */
function initResumeCanvas() {
  const canvas = document.getElementById('resume-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationId;
  let time = 0;
  
  let tunnelCenterX = canvas.parentElement.offsetWidth / 2;
  let tunnelCenterY = canvas.parentElement.offsetHeight / 2;
  
  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    ctx.fillStyle = '#fafafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);
  
  const particles = [];
  const particleCount = 110;
  let mouse = { x: null, y: null };
  
  const parent = canvas.parentElement;
  parent.addEventListener('mousemove', (e) => {
    const rect = parent.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  parent.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  let fov = 320;
  let targetFov = 320;
  window._tunnelSpeedBoost = 1.0; // Baseline speed of travel (slower, smoother)
  
  class TunnelParticle {
    constructor(isSpark = false) {
      this.isSpark = isSpark;
      // Position particles in a 3D circle pipeline
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * 280 + 35;
      
      this.x3D = Math.cos(theta) * radius;
      this.y3D = Math.sin(theta) * radius;
      this.z3D = isSpark ? (Math.random() * 200 + 100) : (Math.random() * 950 + 50);
      
      // Radial explosion speeds for sparks
      this.vx = isSpark ? Math.cos(theta) * (Math.random() * 12 + 6) : 0;
      this.vy = isSpark ? Math.sin(theta) * (Math.random() * 12 + 6) : 0;
      
      this.r = isSpark ? Math.random() * 1.5 + 1.0 : Math.random() * 3.5 + 1.5;
      this.alpha = isSpark ? 1.0 : 0; // fade in as they travel
      
      const colors = [
        'rgba(182, 10, 19, ', // CareerForge Red
        'rgba(244, 63, 94, ', // Rose
        'rgba(254, 95, 85, ', // Neon Coral
        'rgba(249, 115, 22, ', // Orange
        'rgba(245, 158, 11, '  // Gold
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      if (this.isSpark) {
        // Sparks shoot outwards and fade
        this.x3D += this.vx;
        this.y3D += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.z3D -= window._tunnelSpeedBoost * 1.4;
        this.alpha -= 0.02;
        
        // Prevent z3D division-by-zero or negative projection crash
        if (this.z3D <= 5) {
          this.alpha = 0;
          this.z3D = 5;
        }
      } else {
        // Move towards the screen
        this.z3D -= window._tunnelSpeedBoost;
        
        // Dynamic sine wave spiral rotation
        const rotSpeed = 0.0035;
        const rx = this.x3D * Math.cos(rotSpeed) - this.y3D * Math.sin(rotSpeed);
        const ry = this.x3D * Math.sin(rotSpeed) + this.y3D * Math.cos(rotSpeed);
        this.x3D = rx;
        this.y3D = ry;
        
        // Fade in from distance, fade out when close
        if (this.z3D > 800) {
          this.alpha = (1000 - this.z3D) / 200;
        } else if (this.z3D < 150) {
          this.alpha = this.z3D / 150;
        } else {
          this.alpha = 0.85;
        }
        
        // Reset when passing behind camera
        if (this.z3D <= 15) {
          this.z3D = 1000;
          const theta = Math.random() * Math.PI * 2;
          const radius = Math.random() * 280 + 35;
          this.x3D = Math.cos(theta) * radius;
          this.y3D = Math.sin(theta) * radius;
          this.alpha = 0;
        }
      }
    }
  }
  
  // Fill tunnel
  for (let i = 0; i < particleCount; i++) {
    particles.push(new TunnelParticle(false));
  }
  
  // Keystroke Warp Speed trigger
  window._triggerForgeBurst = () => {
    // Warp-speed jump multiplier! (Slower, elegant surge)
    window._tunnelSpeedBoost = 10.0;
    
    // Throttle spark creation to prevent coordinate lag on rapid typing
    const activeSparks = particles.filter(p => p.isSpark).length;
    if (activeSparks < 80) {
      // Spawn 22 high-velocity cosmic energy rings
      const splashCount = 22;
      for (let i = 0; i < splashCount; i++) {
        particles.push(new TunnelParticle(true));
      }
    }
  };
  
  function animate() {
    fov += (targetFov - fov) * 0.08;
    // Transparent layer wash for liquid trails
    ctx.fillStyle = 'rgba(250, 250, 251, 0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    time += 0.015;
    
    // Slow decay of warp boost back to baseline speed
    if (window._tunnelSpeedBoost > 1.0) {
      window._tunnelSpeedBoost -= 0.45;
    }
    
    // Locked tunnel center (no cursor steering follow)
    const targetCenterX = canvas.width / 2;
    const targetCenterY = canvas.height / 2;
    tunnelCenterX += (targetCenterX - tunnelCenterX) * 0.08;
    tunnelCenterY += (targetCenterY - tunnelCenterY) * 0.08;
    
    // Sort tunnel rings to connect wireframe polygon structures
    const sorted = particles.filter(p => !p.isSpark).sort((a, b) => a.z3D - b.z3D);
    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i+1];
      
      // Connect adjacent nodes in depth to form 3D grid polygon rings
      if (Math.abs(p1.z3D - p2.z3D) < 18) {
        const scale1 = fov / p1.z3D;
        const scale2 = fov / p2.z3D;
        
        const px1 = tunnelCenterX + p1.x3D * scale1;
        const py1 = tunnelCenterY + p1.y3D * scale1;
        const px2 = tunnelCenterX + p2.x3D * scale2;
        const py2 = tunnelCenterY + p2.y3D * scale2;
        
        const lineDist = Math.hypot(px1 - px2, py1 - py2);
        if (lineDist < 160) {
          const lineAlpha = (1 - p1.z3D / 1000) * (window._tunnelSpeedBoost > 2.5 ? 0.38 : 0.15);
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.strokeStyle = `rgba(182, 10, 19, ${lineAlpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }
    
    // Update and draw all projected points
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();
      
      if (p.isSpark && p.alpha <= 0) {
        particles.splice(i, 1);
        i--;
        continue;
      }
      
      const scale = fov / p.z3D;
      const projX = tunnelCenterX + p.x3D * scale;
      const projY = tunnelCenterY + p.y3D * scale;
      const r = p.r * scale;
      
      // Draw projected circular particle node
      ctx.beginPath();
      ctx.arc(projX, projY, r, 0, Math.PI * 2);
      ctx.fillStyle = p.colorBase + Math.max(0, p.alpha) + ')';
      
      // Neon glows on warp surge or large nodes
      if (window._tunnelSpeedBoost > 10 || r > 4.5) {
        ctx.shadowBlur = r * 2.8;
        ctx.shadowColor = 'rgba(254, 95, 85, 0.75)';
      }
      
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
    
    animationId = requestAnimationFrame(animate);
  }
  animate();
  
  // Dynamic zoom on input focus inside profile setup forms
  setTimeout(() => {
    const inputs = document.querySelectorAll("#profile-setup-form input, #profile-setup-form textarea, #profile-setup-form select");
    inputs.forEach(input => {
      input.addEventListener("focus", () => { targetFov = 400; });
      input.addEventListener("blur", () => { targetFov = 320; });
    });
  }, 100);

  canvas._cleanup = () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    window._triggerForgeBurst = null;
  };
}

// Global Count-up animation helper for numbers
window.animateCounters = function() {
  document.querySelectorAll(".count-up").forEach(el => {
    if (el.dataset.animated) return;
    el.dataset.animated = "true";
    const target = parseFloat(el.dataset.target) || 0;
    let current = 0;
    const duration = 1100; // 1.1 seconds
    const startTime = performance.now();
    
    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress); // Easing Quad Out
      current = Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  });
};
