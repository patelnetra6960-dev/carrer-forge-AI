/* ============================================================
   CareerForge AI — Faculty/Admin Portal engine
   ============================================================ */

const A_STORE = "cf_admin_v1";

// ── Supabase Client Initialization ─────────────────────────────
const SUPABASE_URL  = "https://ksydolkbimcxpvhmqfsb.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzeWRvbGtiaW1jeHB2aG1xZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDczNDQsImV4cCI6MjEwNDMyMzM0NH0.89oVZyRfUp_vmoXa0_PTbjsDmq8tdxTPlIAkb5i9V0E";
const adb = (typeof supabase !== "undefined") ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON) : null;

function aDefault(){
  return {
    session: null, // {name, email}
    students: [],
    domains: DOMAINS.map(d=>({ ...d, status: "Active", students: 0, questions: 8, updated: new Date().toISOString().slice(0,10) })),
    certRequests: [],
  };
}
function aLoad(){
  try{ const raw = localStorage.getItem(A_STORE); if(!raw) return aDefault(); return Object.assign(aDefault(), JSON.parse(raw)); }
  catch(e){ return aDefault(); }
}
function aSave(){ localStorage.setItem(A_STORE, JSON.stringify(AS)); }
let AS = aLoad();

// Fetch live student accounts exclusively from Supabase student_states table
async function fetchRealStudents(){
  if (!adb) return;
  try {
    const { data, error } = await adb.from("student_states").select("user_id, state_data, updated_at");
    if (error || !data) return;

    const liveStudents = data.map((row, idx) => {
      const s = row.state_data || {};
      const acc = s.account || {};
      const prof = s.profile || {};
      const dom = s.domain ? (DOMAINS.find(d=>d.id===s.domain)?.name || s.domain) : "Frontend Development";
      const hrB = s.hr?.best || 0;
      const techB = s.tech?.best || 0;
      const mockB = s.mock?.best || 0;
      const attempts = (s.hr?.attempts || 0) + (s.tech?.attempts || 0) + (s.mock?.attempts || 0);
      const vals = [hrB, techB, mockB].filter(v=>v>0);
      const readiness = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
      const cert = s.certStatus || "Not Eligible";

      return {
        id: row.user_id,
        enrollment: prof.enrollment || "22010100" + (10 + idx),
        name: acc.name || "Student " + (idx + 1),
        email: acc.email || "student" + idx + "@university.edu",
        dept: prof.dept || "Computer Science",
        domain: dom,
        readiness: readiness,
        ats: s.resume?.best || 0,
        hr: hrB,
        tech: techB,
        mock: mockB,
        attempts: attempts,
        improvement: Math.max(0, Math.round(readiness * 0.15)),
        cert: cert === "Pending Faculty Review" ? "Pending" : cert,
        isLive: true
      };
    });

    // Populate strictly with real Supabase records (remove temporary dummy data)
    AS.students = liveStudents;

    // Update domain enrollment counts based on real students
    const domainCounts = {};
    liveStudents.forEach(s => { domainCounts[s.domain] = (domainCounts[s.domain] || 0) + 1; });
    AS.domains.forEach(d => { d.students = domainCounts[d.name] || 0; });

    // Rebuild cert requests from real students
    AS.certRequests = AS.students.filter(s => s.cert !== "Not Eligible").map(s => ({
      id: s.id,
      student: s.name,
      domain: s.domain,
      readiness: s.readiness,
      completion: Math.min(100, s.readiness + 5),
      improvement: s.improvement,
      date: new Date().toISOString().slice(0,10),
      status: s.cert
    }));
    aSave();
    aRender();
  } catch(err) {
    console.warn("Live students fetch error:", err);
  }
}

if(!AS.certRequests){
  AS.certRequests = AS.students.filter(s=>s.cert!=="Not Eligible").map(s=>({
    id: s.id, student: s.name, domain: s.domain, readiness: s.readiness, completion: Math.min(100, s.readiness+5),
    improvement: s.improvement, date: "2026-07-1"+Math.floor(Math.random()*8), status: s.cert
  }));
  aSave();
}

function aInitials(name){ return name.trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join(""); }
function aGo(route){ if(location.hash===route) aRender(); else location.hash = route; }
function aRequireAuth(){ if(!AS.session){ aGo("#/a-login"); return false; } return true; }
function aToggleSidebar(open){ document.getElementById("a-sidebar")?.classList.toggle("open", open); document.getElementById("a-scrim")?.classList.toggle("show", open); }

const A_NAV = [
  { r:"#/a-dashboard", ic:"⌂", label:"Overview" },
  { r:"#/a-students", ic:"🧑‍🎓", label:"Students" },
  { r:"#/a-domains", ic:"🗂️", label:"Domains" },
  { r:"#/a-insights", ic:"✦", label:"AI Talent Insights" },
  { r:"#/a-certs", ic:"🎓", label:"Certificate Requests" },
  { r:"#/a-analytics", ic:"📊", label:"Analytics" },
];

function aLogoSvg(size = 32){
  const uid = Math.random().toString(36).substring(2, 7);
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aCfBg_${uid}" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#111111"/>
        <stop offset="60%" stop-color="#8F070E"/>
        <stop offset="100%" stop-color="#B60A13"/>
      </linearGradient>
      <linearGradient id="aCfFlame_${uid}" x1="24" y1="9" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FF6B6B"/>
        <stop offset="50%" stop-color="#FF2B2B"/>
        <stop offset="100%" stop-color="#B60A13"/>
      </linearGradient>
      <linearGradient id="aCfAnvil_${uid}" x1="12" y1="28" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E0E0E0"/>
      </linearGradient>
    </defs>
    <!-- Rounded Shield Background -->
    <rect width="48" height="48" rx="12" fill="url(#aCfBg_${uid})"/>
    <rect x="1.5" y="1.5" width="45" height="45" rx="10.5" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>

    <!-- Anvil (Skill Foundation / Forge) -->
    <path d="M14 36H34C35.1 36 36 35.1 36 34V32H12V34C12 35.1 12.9 36 14 36Z" fill="url(#aCfAnvil_${uid})"/>
    <path d="M16 32L18.5 27.5H29.5L32 32H16Z" fill="url(#aCfAnvil_${uid})" opacity="0.9"/>

    <!-- Flame of Career Growth -->
    <path d="M24 8C24 8 29.5 14.5 29.5 20.5C29.5 23.5 27 26 24 26C21 26 18.5 23.5 18.5 20.5C18.5 16.5 22 13 24 8Z" fill="url(#aCfFlame_${uid})"/>
    <path d="M24 14C24 14 26.8 18 26.8 21C26.8 22.5 25.5 23.5 24 23.5C22.5 23.5 21.2 22.5 21.2 21C21.2 19 23 17 24 14Z" fill="#FFF5F5"/>

    <!-- 4-Point AI Sparkle Star -->
    <path d="M35 8L35.9 10.1L38 11L35.9 11.9L35 14L34.1 11.9L32 11L34.1 10.1L35 8Z" fill="#FFD700"/>
    <path d="M13 11L13.6 12.4L15 13L13.6 13.6L13 15L12.4 13.6L11 13L12.4 12.4L13 11Z" fill="rgba(255,255,255,0.8)"/>

    <!-- Ascending Career Growth Arc -->
    <path d="M9 29C13 20 21 13 36 11" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
  </svg>`;
}

function aToggleProfileDropdown(e){
  if(e) e.stopPropagation();
  const menu = document.getElementById("a-profile-dropdown");
  if(menu){ menu.classList.toggle("show"); }
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("a-profile-dropdown");
  const trigger = document.getElementById("a-profile-trigger");
  if(menu && menu.classList.contains("show") && !menu.contains(e.target) && !trigger?.contains(e.target)){
    menu.classList.remove("show");
  }
});

function aShell(active, title, inner, searchable){
  const nav = A_NAV.map(n=>`
    <div class="a-nav-item ${active===n.r?'active':''}" onclick="aGo('${n.r}')" style="display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:8px; margin-bottom:4px; font-weight:600;">
      <span style="display:inline-flex; align-items:center; justify-content:center; width:20px;">${n.ic}</span>
      <span>${n.label}</span>
    </div>
  `).join("");

  return `
  <div class="a-shell">
    <div class="a-scrim" id="a-scrim" onclick="aToggleSidebar(false)"></div>
    <aside class="a-sidebar" id="a-sidebar">
      <div class="a-brand" style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:12px;">
        ${aLogoSvg(34)}
        <div>
          <div class="a-name" style="font-weight:800; font-size:15px; color:#fff; line-height:1.2;">CareerForge AI</div>
          <div class="a-sub" style="font-size:10px; color:#FF5252; font-weight:700; letter-spacing:0.08em; margin-top:2px;">FACULTY PORTAL</div>
        </div>
      </div>
      <div class="a-nav" style="padding:16px 12px;">${nav}</div>
      <div class="a-sidebar-foot" style="padding:16px 20px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:rgba(255,255,255,0.6);">
        Faculty Advisor:<br>
        <strong style="color:#fff; font-size:13px; font-weight:700; margin-top:2px; display:block;">${AS.session?.name || 'Faculty Member'}</strong>
      </div>
    </aside>
    <div class="a-main">
      <div class="a-topbar" style="height:64px; background:#fff; border-bottom:1px solid var(--a-border); display:flex; align-items:center; justify-content:space-between; padding:0 28px; position:sticky; top:0; z-index:20;">
        <div style="display:flex; align-items:center; gap:12px;">
          <button class="a-hamburger" onclick="aToggleSidebar(true)">☰</button>
          <div class="a-h3" style="font-size:18px; font-weight:700; color:var(--a-navy);">${title}</div>
        </div>
        ${searchable?`<div class="a-search" style="flex:1; max-width:400px; display:flex; align-items:center; gap:8px; background:var(--a-bg); border:1px solid var(--a-border); border-radius:8px; padding:6px 14px;"><span style="color:var(--a-ink-soft);">🔎</span><input id="a-global-search" placeholder="Search students, domains…" oninput="aRender()" style="border:none; background:transparent; font-size:13px; outline:none; width:100%;"></div>`:'<div></div>'}
        
        <!-- Responsive Profile & Logout Controls -->
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="a-profile-wrap">
            <div class="a-profile-trigger" id="a-profile-trigger" onclick="aToggleProfileDropdown(event)" title="View Profile">
              <div class="a-avatar" style="width:34px; height:34px; border-radius:8px; background:var(--a-navy); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12.5px;">
                ${aInitials(AS.session?.name||'FA')}
              </div>
              <div class="a-profile-name-text" style="text-align:left;">
                <div style="font-size:12.5px; font-weight:700; color:var(--a-navy); line-height:1.2;">${AS.session?.name || 'Faculty Advisor'}</div>
                <div style="font-size:10.5px; color:var(--a-ink-soft); font-weight:500;">Admin User</div>
              </div>
              <span style="font-size:10px; color:var(--a-ink-soft); margin-left:2px;">▾</span>
            </div>

            <!-- Profile Dropdown Card -->
            <div class="a-profile-dropdown" id="a-profile-dropdown">
              <div style="display:flex; align-items:center; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--a-border); margin-bottom:12px;">
                <div class="a-avatar" style="width:40px; height:40px; border-radius:10px; background:var(--a-navy); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px;">
                  ${aInitials(AS.session?.name||'FA')}
                </div>
                <div style="min-width:0; flex:1;">
                  <div style="font-weight:800; font-size:14px; color:var(--a-navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${AS.session?.name || 'Faculty Advisor'}</div>
                  <div style="font-size:11.5px; color:var(--a-ink-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${AS.session?.email || 'faculty@forge.edu'}</div>
                </div>
              </div>

              <div style="margin-bottom:12px;">
                <span class="a-badge neutral" style="font-size:10px; font-weight:700; background:var(--a-red-tint); color:var(--a-red);">INSTITUTIONAL FACULTY</span>
              </div>

              <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:14px;">
                <div style="display:flex; justify-content:space-between; font-size:12px;">
                  <span style="color:var(--a-ink-soft);">Department:</span>
                  <span style="font-weight:600; color:var(--a-navy);">Academic Review</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px;">
                  <span style="color:var(--a-ink-soft);">Role:</span>
                  <span style="font-weight:600; color:var(--a-navy);">Certifier</span>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--a-border); padding-top:12px;">
                <a href="index.html#/splash" class="a-btn a-btn-outline" style="width:100%; height:36px; font-size:12px; font-weight:600; justify-content:center; text-decoration:none; color:var(--a-navy);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  <span>Switch to Student App</span>
                </a>
                <button class="a-btn a-btn-outline" style="width:100%; height:36px; font-size:12.5px; font-weight:600; justify-content:center; color:var(--a-red);" onclick="aLogout()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="a-page" style="padding:28px; max-width:1360px;">${inner}</div>
    </div>
  </div>`;
}

function aScreenLogin(){
  return `
  <div class="a-login-wrap" style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg, #0D0F14 0%, #171B24 55%, #23080A 100%); padding:20px; position:relative; overflow:hidden;">
    <div style="position:absolute; top:-120px; right:-120px; width:360px; height:360px; background:radial-gradient(circle, rgba(182,10,19,0.22) 0%, transparent 70%); pointer-events:none;"></div>
    <div style="position:absolute; bottom:-120px; left:-120px; width:360px; height:360px; background:radial-gradient(circle, rgba(255,82,82,0.12) 0%, transparent 70%); pointer-events:none;"></div>

    <div class="a-login-card" style="background:#FFFFFF; border-radius:20px; padding:44px 38px; width:100%; max-width:440px; box-shadow:0 24px 60px rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.2); position:relative; z-index:2;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
        ${aLogoSvg(48)}
        <span class="a-badge neutral" style="background:var(--a-bg); color:var(--a-navy); border:1px solid var(--a-border); font-size:10px; padding:4px 10px; font-weight:700;">FACULTY PORTAL</span>
      </div>

      <div class="a-h1" style="font-size:24px; font-weight:800; color:var(--a-navy); margin-bottom:4px; letter-spacing:-0.01em;">Faculty & Admin Sign In</div>
      <div class="a-muted" style="font-size:13px; color:var(--a-ink-soft); margin-bottom:24px;">Enter your institutional credentials to manage domain tracks & review student readiness certificates.</div>

      <form class="stack" style="gap:16px;" onsubmit="return aDoLogin(event)">
        <div class="a-field">
          <label style="font-weight:700; color:var(--a-navy); font-size:13px;">Email <span style="color:var(--a-red, #B60A13)">*</span></label>
          <input id="a-email" type="email" placeholder="Email" style="height:44px; font-size:14px; border-radius:10px;" required>
        </div>

        <div class="a-field">
          <label style="font-weight:700; color:var(--a-navy); font-size:13px;">Password <span style="color:var(--a-red, #B60A13)">*</span></label>
          <input id="a-pass" type="password" placeholder="Password" style="height:44px; font-size:14px; border-radius:10px;" required>
        </div>

        <button class="a-btn a-btn-primary" style="width:100%; height:46px; border-radius:10px; font-size:14px; font-weight:700; background:var(--a-navy); gap:8px; margin-top:8px; box-shadow:0 4px 14px rgba(18,21,28,0.25);" type="submit">
          <span>Log In to Faculty Portal</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </form>

      <div style="margin-top:24px; padding-top:18px; border-top:1px dashed var(--a-border); text-align:center;">
        <div class="a-muted" style="font-size:12px; line-height:1.45; color:var(--a-ink-soft); margin-bottom:12px;">
          🔒 Authorized faculty & administrator access point. Contact IT support for account reset.
        </div>
        <a href="index.html#/splash" style="font-size:13px; font-weight:600; color:var(--a-red); text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          <span>← Return to Student Portal</span>
        </a>
      </div>
    </div>
  </div>`;
}
function aDoLogin(e){
  e.preventDefault();
  const email = document.getElementById("a-email").value.trim();
  AS.session = { name: "Dr. " + (email.split("@")[0].replace(/[._]/g," ").replace(/\b\w/g,c=>c.toUpperCase())), email };
  aSave();
  aGo("#/a-dashboard");
  return false;
}
function aLogout(){ AS.session = null; aSave(); aGo("#/a-login"); }

/* ---------- Dashboard ---------- */
function aScreenDashboard(){
  const st = AS.students;
  const total = st.length;
  const active = st.filter(s=>s.attempts>0).length;
  const domainsCount = AS.domains.filter(d=>d.status==="Active").length;
  const pendingCerts = AS.certRequests.filter(c=>c.status==="Pending Faculty Review" || c.status==="Pending").length;

  const buckets = [ [0,40],[40,60],[60,75],[75,90],[90,101] ];
  const bucketLabels = ["0-40%","40-60%","60-75%","75-90%","90-100%"];
  const dist = buckets.map(([a,b])=> st.filter(s=>s.readiness>=a && s.readiness<b).length);
  const maxDist = Math.max(...dist,1);

  const domainCounts = {};
  st.forEach(s=>{ domainCounts[s.domain] = (domainCounts[s.domain]||0)+1; });
  const topDomains = Object.entries(domainCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxDomain = Math.max(...topDomains.map(d=>d[1]),1);

  const recentCerts = AS.certRequests.slice(0,5);

  const inner = `
    <!-- Top Welcome Banner -->
    <div style="background:#fff; border:1px solid var(--a-border); border-radius:14px; padding:24px 28px; margin-bottom:24px; box-shadow:var(--a-shadow); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <div class="a-h1" style="font-size:26px; font-weight:800; color:var(--a-navy); margin-bottom:4px;">Faculty Overview Dashboard</div>
        <div class="a-muted" style="font-size:13.5px; color:var(--a-ink-soft);">
          Cohort-wide readiness analytics, domain performance metrics, and pending certificate approvals.
        </div>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <button class="a-btn a-btn-outline" onclick="aGo('#/a-students')" style="height:40px; font-weight:600;">View All Students</button>
        <button class="a-btn a-btn-primary" onclick="aGo('#/a-certs')" style="height:40px; font-weight:700; background:var(--a-navy);">
          <span>Review Certificates</span>
        </button>
      </div>
    </div>

    <!-- 4 Key Stat Cards Row -->
    <div class="grid a-grid-4" style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
      <div class="a-stat" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:20px; box-shadow:var(--a-shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="a-caption" style="font-weight:700; color:var(--a-ink-soft);">TOTAL ENROLLED</span>
          <div style="width:36px; height:36px; border-radius:10px; background:var(--a-bg); color:var(--a-navy); display:flex; align-items:center; justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        <div class="v" style="font-size:30px; font-weight:800; color:var(--a-navy);">${total}</div>
        <div class="l" style="font-size:12px; color:var(--a-success); font-weight:600; margin-top:4px;">Active cohort count</div>
      </div>

      <div class="a-stat" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:20px; box-shadow:var(--a-shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="a-caption" style="font-weight:700; color:var(--a-ink-soft);">ACTIVE STUDENTS</span>
          <div style="width:36px; height:36px; border-radius:10px; background:var(--a-success-tint); color:var(--a-success); display:flex; align-items:center; justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
        </div>
        <div class="v" style="font-size:30px; font-weight:800; color:var(--a-navy);">${active}</div>
        <div class="l" style="font-size:12px; color:var(--a-ink-soft); margin-top:4px;">${Math.round((active/total)*100)}% engagement rate</div>
      </div>

      <div class="a-stat" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:20px; box-shadow:var(--a-shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="a-caption" style="font-weight:700; color:var(--a-ink-soft);">CAREER DOMAINS</span>
          <div style="width:36px; height:36px; border-radius:10px; background:var(--a-red-tint); color:var(--a-red); display:flex; align-items:center; justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
        </div>
        <div class="v" style="font-size:30px; font-weight:800; color:var(--a-navy);">${domainsCount}</div>
        <div class="l" style="font-size:12px; color:var(--a-ink-soft); margin-top:4px;">Active domain tracks</div>
      </div>

      <div class="a-stat" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:20px; box-shadow:var(--a-shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="a-caption" style="font-weight:700; color:var(--a-ink-soft);">PENDING REVIEWS</span>
          <div style="width:36px; height:36px; border-radius:10px; background:var(--a-warning-tint); color:var(--a-warning); display:flex; align-items:center; justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
        </div>
        <div class="v" style="font-size:30px; font-weight:800; color:${pendingCerts>0?'var(--a-red)':'var(--a-navy)'};">${pendingCerts}</div>
        <div class="l" style="font-size:12px; color:${pendingCerts>0?'var(--a-red)':'var(--a-ink-soft)'}; font-weight:600; margin-top:4px;">${pendingCerts>0?'Action required':'All clear'}</div>
      </div>
    </div>

    <!-- Analytics Section: Readiness Bar & Domain Breakdown -->
    <div class="grid a-grid-2" style="display:grid; grid-template-columns:1.2fr 1fr; gap:20px; margin-bottom:24px;">
      <div class="a-card a-pad" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:24px; box-shadow:var(--a-shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div class="a-h3" style="font-size:16px; color:var(--a-navy);">Career Readiness Distribution</div>
          <span class="a-badge neutral">Cohort Score Brackets</span>
        </div>
        <div class="a-bars" style="height:180px; align-items:flex-end; gap:14px; padding-top:20px;">
          ${dist.map((v,i)=>`
            <div class="a-bar" style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; gap:8px;">
              <div style="font-size:11px; font-weight:700; color:var(--a-navy);">${v} std</div>
              <div class="fill" style="height:${(v/maxDist)*100}%; width:100%; background:linear-gradient(180deg, var(--a-red) 0%, #7d070d 100%); border-radius:6px 6px 2px 2px;"></div>
              <div class="lbl" style="font-size:11px; font-weight:600; color:var(--a-ink-soft);">${bucketLabels[i]}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="a-card a-pad" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:24px; box-shadow:var(--a-shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div class="a-h3" style="font-size:16px; color:var(--a-navy);">Top Selected Domains</div>
          <span class="a-badge neutral">Popularity</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:14px; margin-top:8px;">
          ${topDomains.map(([name,count])=>`
            <div class="a-hbar-row" style="display:flex; align-items:center; gap:12px; margin:0;">
              <div style="width:140px; font-size:13px; font-weight:600; color:var(--a-navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${name}</div>
              <div class="a-hbar-track" style="flex:1; height:10px; background:var(--a-bg); border-radius:999px; overflow:hidden;">
                <div class="a-hbar-fill" style="width:${(count/maxDomain)*100}%; height:100%; background:var(--a-navy); border-radius:999px;"></div>
              </div>
              <div style="min-width:32px; font-size:12px; font-weight:700; color:var(--a-navy); text-align:right;">${count}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Bottom Section: Full-Width Recent Certificate Requests Table -->
    <div class="a-card a-pad" style="background:#fff; border:1.5px solid var(--a-border); border-radius:14px; padding:24px; box-shadow:var(--a-shadow);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;">
        <div>
          <div class="a-h3" style="font-size:17px; color:var(--a-navy); font-weight:800;">Recent Certificate Requests</div>
          <div class="a-muted" style="font-size:12.5px; color:var(--a-ink-soft); margin-top:2px;">Latest student submissions requiring faculty review & signature approval</div>
        </div>
        <button class="a-btn a-btn-outline a-btn-sm" onclick="aGo('#/a-certs')" style="font-weight:700;">View All Requests (${AS.certRequests.length}) →</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table" style="width:100%;">
          <thead>
            <tr>
              <th>Student</th>
              <th>Enrollment</th>
              <th>Target Domain</th>
              <th>Status</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${recentCerts.map(c=>`
              <tr>
                <td style="font-weight:700; color:var(--a-navy);">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--a-navy); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">${aInitials(c.student)}</div>
                    <span>${c.student}</span>
                  </div>
                </td>
                <td style="color:var(--a-ink-soft); font-size:12.5px;">${c.enrollment || 'ENR-2024'}</td>
                <td><span style="font-weight:600; color:var(--a-navy);">${c.domain}</span></td>
                <td>${aBadge(c.status)}</td>
                <td style="text-align:right;">
                  <button class="a-btn a-btn-outline a-btn-sm" onclick="aGo('#/a-certs')" style="font-size:11.5px; font-weight:600;">Review →</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  return aShell("#/a-dashboard", "Overview", inner);
}
function aBadge(status){
  const map = { "Approved":"ok", "Pending Faculty Review":"warn", "Pending":"warn", "Not Eligible":"neutral", "Rejected":"bad", "Active":"ok", "Inactive":"neutral" };
  return `<span class="a-badge ${map[status]||'neutral'}">${status}</span>`;
}

/* ---------- Student Management ---------- */
let aStudentFilters = { dept:"", year:"", domain:"", cert:"", sortKey:"readiness", sortDir:"desc" };
function aScreenStudents(){
  const q = (document.getElementById("a-global-search")?.value || "").toLowerCase();
  let rows = [...AS.students];
  if(q) rows = rows.filter(s=> s.name.toLowerCase().includes(q) || s.enrollment.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q));
  if(aStudentFilters.dept) rows = rows.filter(s=>s.dept===aStudentFilters.dept);
  if(aStudentFilters.year) rows = rows.filter(s=>s.year===aStudentFilters.year);
  if(aStudentFilters.domain) rows = rows.filter(s=>s.domain===aStudentFilters.domain);
  if(aStudentFilters.cert) rows = rows.filter(s=>s.cert===aStudentFilters.cert);
  rows.sort((a,b)=> aStudentFilters.sortDir==="desc" ? b[aStudentFilters.sortKey]-a[aStudentFilters.sortKey] : a[aStudentFilters.sortKey]-b[aStudentFilters.sortKey]);

  const depts = [...new Set(AS.students.map(s=>s.dept).filter(Boolean))];
  const years = [...new Set(AS.students.map(s=>s.year).filter(Boolean))];
  const domains = [...new Set(AS.students.map(s=>s.domain).filter(Boolean))];

  const hasFilters = aStudentFilters.dept || aStudentFilters.year || aStudentFilters.domain || aStudentFilters.cert;
  const liveCount = AS.students.filter(s=>s.isLive).length;

  const inner = `
    <!-- Page Header -->
    <div class="a-page-header">
      <div>
        <div class="a-h1">Student Directory & Performance</div>
        <div class="a-muted" style="margin-top:3px;">
          Showing ${rows.length} of ${AS.students.length} students across 25 career preparation tracks.
        </div>
      </div>
      <div class="a-page-header-actions">
        ${liveCount > 0 ? `<span class="a-badge ok" style="padding:6px 12px; font-size:11px; font-weight:700;"><span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--a-success); margin-right:4px;"></span>${liveCount} Live Connected</span>` : ''}
        <button class="a-btn a-btn-outline a-btn-sm" onclick="fetchRealStudents()" title="Refresh database records">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Sync Database</span>
        </button>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="a-filter-bar">
      <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:var(--a-ink-soft); text-transform:uppercase; letter-spacing:0.04em;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <span>Filters:</span>
      </div>
      <select class="a-select" onchange="aStudentFilters.dept=this.value; aRender()">
        <option value="">All Departments</option>
        ${depts.map(d=>`<option value="${d}" ${aStudentFilters.dept===d?'selected':''}>${d}</option>`).join("")}
      </select>
      <select class="a-select" onchange="aStudentFilters.year=this.value; aRender()">
        <option value="">All Academic Years</option>
        ${years.map(d=>`<option value="${d}" ${aStudentFilters.year===d?'selected':''}>${d}</option>`).join("")}
      </select>
      <select class="a-select" onchange="aStudentFilters.domain=this.value; aRender()">
        <option value="">All Career Domains</option>
        ${domains.map(d=>`<option value="${d}" ${aStudentFilters.domain===d?'selected':''}>${d}</option>`).join("")}
      </select>
      <select class="a-select" onchange="aStudentFilters.cert=this.value; aRender()">
        <option value="">All Certificate Statuses</option>
        ${["Not Eligible","Pending","Approved","Rejected"].map(d=>`<option value="${d}" ${aStudentFilters.cert===d?'selected':''}>${d}</option>`).join("")}
      </select>
      ${hasFilters ? `
        <button class="a-btn a-btn-outline a-btn-sm" style="margin-left:auto; color:var(--a-red);" onclick="aStudentFilters={dept:'',year:'',domain:'',cert:'',sortKey:'readiness',sortDir:'desc'}; aRender()">
          ✕ Clear Filters
        </button>
      ` : ''}
    </div>

    <!-- Students Table -->
    <div class="a-card a-table-wrap">
      <table class="a-table">
        <thead>
          <tr>
            <th class="sortable" onclick="aSortStudents('name')">Student Name ${aSortIcon('name')}</th>
            <th>Enrollment No.</th>
            <th>Department</th>
            <th>Target Domain</th>
            <th class="sortable" style="text-align:center;" onclick="aSortStudents('readiness')">Readiness ${aSortIcon('readiness')}</th>
            <th class="sortable" style="text-align:center;" onclick="aSortStudents('points')">Points ${aSortIcon('points')}</th>
            <th class="sortable" style="text-align:center;" onclick="aSortStudents('attempts')">Attempts ${aSortIcon('attempts')}</th>
            <th class="sortable" style="text-align:center;" onclick="aSortStudents('improvement')">Growth ${aSortIcon('improvement')}</th>
            <th style="text-align:center;">Certificate</th>
            <th style="text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(s=>`
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="a-avatar" style="${s.isLive?'background:linear-gradient(135deg, #12151C, #B60A13); border:1px solid rgba(182,10,19,0.3);':''}">${aInitials(s.name)}</div>
                  <div>
                    <div style="font-weight:700; color:var(--a-navy); display:flex; align-items:center; gap:6px;">
                      <span>${s.name}</span>
                      ${s.isLive ? `<span style="font-size:9.5px; font-weight:800; background:var(--a-success-tint); color:var(--a-success); padding:1px 6px; border-radius:4px; letter-spacing:0.04em;">LIVE</span>` : ''}
                    </div>
                    <div style="font-size:11.5px; color:var(--a-ink-soft); margin-top:1px;">${s.email}</div>
                  </div>
                </div>
              </td>
              <td><span style="font-family:monospace; font-weight:600; font-size:12px; color:var(--a-navy); background:var(--a-bg); padding:3px 7px; border-radius:5px; border:1px solid var(--a-border);">${s.enrollment}</span></td>
              <td><span style="color:var(--a-ink-soft); font-size:12.5px;">${s.dept}</span></td>
              <td><span style="font-weight:600; color:var(--a-navy); font-size:13px;">${s.domain}</span></td>
              <td style="text-align:center;">
                <span style="display:inline-block; font-weight:800; font-size:13.5px; color:${s.readiness>=75?'var(--a-success)':s.readiness>=50?'var(--a-navy)':'var(--a-red)'};">
                  ${s.readiness}%
                </span>
              </td>
              <td style="text-align:center; font-weight:600; color:var(--a-navy);">${s.points}</td>
              <td style="text-align:center; color:var(--a-ink-soft);">${s.attempts}</td>
              <td style="text-align:center;">
                <span style="color:var(--a-success); font-weight:700; font-size:12.5px;">+${s.improvement}%</span>
              </td>
              <td style="text-align:center;">${aBadge(s.cert)}</td>
              <td style="text-align:right;">
                <button class="a-btn a-btn-outline a-btn-sm" onclick="aGo('#/a-student/${s.id}')">View Details</button>
              </td>
            </tr>`).join("") : `
            <tr>
              <td colspan="10">
                <div style="padding:48px 20px; text-align:center;">
                  <div style="font-size:32px; margin-bottom:8px;">🔍</div>
                  <div style="font-weight:700; color:var(--a-navy); font-size:15px; margin-bottom:4px;">No students match these criteria</div>
                  <div class="a-muted">Try adjusting your search query or clear selected dropdown filters.</div>
                </div>
              </td>
            </tr>`}
        </tbody>
      </table>
    </div>`;
  return aShell("#/a-students", "Students", inner, true);
}
function aSortIcon(key){
  if(aStudentFilters.sortKey !== key) return `<span style="opacity:0.35; font-size:10px;">⇅</span>`;
  return aStudentFilters.sortDir === "desc" ? `<span style="color:var(--a-red); font-size:11px;">▼</span>` : `<span style="color:var(--a-red); font-size:11px;">▲</span>`;
}
function aSortStudents(key){
  if(aStudentFilters.sortKey===key) aStudentFilters.sortDir = aStudentFilters.sortDir==="desc"?"asc":"desc";
  else { aStudentFilters.sortKey = key; aStudentFilters.sortDir = "desc"; }
  aRender();
}

/* ---------- Student Detail View ---------- */
function aScreenStudentDetail(id){
  const s = AS.students.find(x=>x.id===id);
  if(!s) return aShell("#/a-students","Students", `<div class="a-muted">Student not found.</div>`, true);

  const ats = s.ats || Math.min(95, Math.round(s.readiness * 0.95 + 5));
  const hr = s.hr || Math.min(96, Math.max(40, Math.round(s.readiness * 0.9)));
  const tech = s.tech || Math.min(98, Math.max(45, Math.round(s.readiness * 1.05)));
  const mock = s.mock || Math.min(94, Math.max(40, Math.round(s.readiness * 0.92)));

  const inner = `
    <!-- Top Action -->
    <div style="margin-bottom:18px;">
      <button class="a-btn a-btn-outline a-btn-sm" onclick="aGo('#/a-students')" style="gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        <span>Back to Student Directory</span>
      </button>
    </div>

    <!-- Student Header Card -->
    <div class="a-card a-pad" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:18px; margin-bottom:20px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <div class="a-avatar" style="width:56px; height:56px; font-size:18px; border-radius:14px; background:var(--a-navy); color:#fff; font-weight:800; box-shadow:0 4px 14px rgba(18,21,28,0.2);">
          ${aInitials(s.name)}
        </div>
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="a-h1" style="font-size:22px; line-height:1.2;">${s.name}</div>
            ${s.isLive ? `<span class="a-badge ok" style="font-size:10px;">● Live Account</span>` : ''}
          </div>
          <div class="a-muted" style="margin-top:4px; font-size:13px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span><strong>Enrollment:</strong> ${s.enrollment}</span>
            <span>•</span>
            <span>${s.dept}</span>
            <span>•</span>
            <span>${s.year || '4th Year'}</span>
            <span>•</span>
            <span style="color:var(--a-red); font-weight:700;">${s.domain} Track</span>
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        ${aBadge(s.cert)}
        <button class="a-btn a-btn-primary" onclick="aGo('#/a-certs')" style="height:38px; font-weight:700;">
          <span>Review Certification</span>
        </button>
      </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="grid a-grid-4" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px;">
      <div class="a-stat">
        <div class="a-caption" style="margin-bottom:8px;">OVERALL READINESS</div>
        <div class="v" style="color:${s.readiness>=75?'var(--a-success)':'var(--a-navy)'};">${s.readiness}%</div>
        <div class="l">Composite preparation score</div>
      </div>
      <div class="a-stat">
        <div class="a-caption" style="margin-bottom:8px;">MODULE ATTEMPTS</div>
        <div class="v">${s.attempts}</div>
        <div class="l">Quizzes & simulations taken</div>
      </div>
      <div class="a-stat">
        <div class="a-caption" style="margin-bottom:8px;">SCORE IMPROVEMENT</div>
        <div class="v" style="color:var(--a-success);">+${s.improvement}%</div>
        <div class="l">Progress from baseline</div>
      </div>
      <div class="a-stat">
        <div class="a-caption" style="margin-bottom:8px;">PLATFORM REWARD POINTS</div>
        <div class="v">${s.points}</div>
        <div class="l">Total earned CareerForge XP</div>
      </div>
    </div>

    <!-- Module Performance Breakdown -->
    <div class="a-card a-pad" style="margin-bottom:20px;">
      <div class="a-h3" style="font-size:16px; margin-bottom:16px;">Core Module Performance Breakdown</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>ATS Resume Score</span>
            <span style="font-weight:700; color:var(--a-navy);">${ats}%</span>
          </div>
          <div class="a-hbar-track"><div class="a-hbar-fill" style="width:${ats}%; background:var(--a-navy);"></div></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>HR Behavioral Round</span>
            <span style="font-weight:700; color:var(--a-navy);">${hr}%</span>
          </div>
          <div class="a-hbar-track"><div class="a-hbar-fill" style="width:${hr}%; background:var(--a-navy);"></div></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>Domain Technical Round</span>
            <span style="font-weight:700; color:var(--a-navy);">${tech}%</span>
          </div>
          <div class="a-hbar-track"><div class="a-hbar-fill" style="width:${tech}%; background:var(--a-navy);"></div></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>AI Mock Interview Round</span>
            <span style="font-weight:700; color:var(--a-navy);">${mock}%</span>
          </div>
          <div class="a-hbar-track"><div class="a-hbar-fill" style="width:${mock}%; background:var(--a-navy);"></div></div>
        </div>
      </div>
    </div>

    <!-- AI Student Evaluation -->
    <div class="a-card a-pad" style="background:linear-gradient(180deg,#fff,#FDF6F6); border-color:#F1C6C8;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <span class="a-badge bad" style="font-size:10px; font-weight:800;">✦ AI-ASSISTED STUDENT SUMMARY</span>
        <span class="a-muted" style="font-size:12px;">Generated via CareerForge Placement Engine</span>
      </div>
      <p style="font-size:13.5px; line-height:1.6; color:var(--a-navy); margin:0;">
        <strong>${s.name}</strong> has demonstrated ${s.improvement>20?"rapid, consistent":"steady"} growth with an overall readiness rating of <strong>${s.readiness}%</strong> across ${s.attempts} practice sessions. Core competency metrics indicate strong alignment with <strong>${s.domain}</strong> industry requirements. ${s.readiness>=75?"The student has met the 75% qualification threshold and is eligible for institutional certificate endorsement.":"Additional practice sessions in the technical round are suggested to elevate readiness above the 75% benchmark."}
      </p>
    </div>`;
  return aShell("#/a-students", "Student Profile", inner);
}

/* ---------- Domain Management ---------- */
function aScreenDomains(){
  const q = (document.getElementById("a-global-search")?.value || "").toLowerCase();
  let rows = AS.domains;
  if(q) rows = rows.filter(d=>d.name.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q));

  const inner = `
    <!-- Page Header -->
    <div class="a-page-header">
      <div>
        <div class="a-h1">Domain Tracks & Curriculum</div>
        <div class="a-muted" style="margin-top:3px;">Manage all 25 specialized technical pathways, question repositories, and active student enrollments.</div>
      </div>
      <div class="a-page-header-actions">
        <button class="a-btn a-btn-primary" onclick="alert('Domain addition is managed via the curriculum committee (demo).')">
          <span>+ Add Domain Track</span>
        </button>
      </div>
    </div>

    <!-- Domain Table -->
    <div class="a-card a-table-wrap">
      <table class="a-table">
        <thead>
          <tr>
            <th>Domain Track</th>
            <th>Discipline Category</th>
            <th style="text-align:center;">Status</th>
            <th style="text-align:center;">Students Enrolled</th>
            <th style="text-align:center;">Question Bank</th>
            <th>Last Updated</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(d=>`
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:18px;">${d.icon}</span>
                  <div>
                    <div style="font-weight:700; color:var(--a-navy); font-size:13.5px;">${d.name}</div>
                    <div style="font-size:11.5px; color:var(--a-ink-soft);">${d.id}</div>
                  </div>
                </div>
              </td>
              <td><span class="a-badge neutral" style="font-weight:600;">${d.cat}</span></td>
              <td style="text-align:center;">${aBadge(d.status)}</td>
              <td style="text-align:center; font-weight:700; color:var(--a-navy);">${d.students}</td>
              <td style="text-align:center;"><span style="font-weight:600; color:var(--a-navy);">${d.questions} MCQs</span></td>
              <td style="color:var(--a-ink-soft); font-size:12.5px;">${d.updated}</td>
              <td style="text-align:right;">
                <div style="display:inline-flex; gap:6px; justify-content:flex-end;">
                  <button class="a-btn a-btn-outline a-btn-sm" onclick="aToggleDomain('${d.id}')" title="Toggle active status">
                    ${d.status==='Active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button class="a-btn a-btn-outline a-btn-sm" onclick="alert('Viewing 8 curated questions for ' + '${d.name}')">
                    Questions
                  </button>
                </div>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  return aShell("#/a-domains", "Domains", inner, true);
}
function aToggleDomain(id){
  const d = AS.domains.find(x=>x.id===id);
  d.status = d.status==="Active" ? "Inactive" : "Active";
  aSave(); aRender();
}

/* ---------- AI Talent Insights ---------- */
function aScreenInsights(){
  const ranked = [...AS.students].sort((a,b)=>b.readiness-a.readiness);
  function label(s){
    if(s.improvement>=25) return { text:"Consistent Improvement", type:"ok" };
    if(s.readiness>=85) return { text:"Top Tier Domain Talent", type:"ok" };
    if(s.attempts>=15) return { text:"High Platform Engagement", type:"ok" };
    if(s.attempts<6) return { text:"Needs More Attempts", type:"bad" };
    return { text:"Steady Progression", type:"warn" };
  }

  const topTalent = ranked.filter(s=>s.readiness>=80).length;
  const highGrowth = ranked.filter(s=>s.improvement>=20).length;

  const inner = `
    <!-- Page Header -->
    <div class="a-page-header">
      <div>
        <div class="a-h1">AI-Assisted Talent Insights</div>
        <div class="a-muted" style="margin-top:3px;">
          Machine-assisted candidate classification and readiness signals to help faculty prioritize placement recommendations.
        </div>
      </div>
      <div class="a-page-header-actions">
        <span class="a-badge ok" style="padding:6px 12px;">✦ ${topTalent} High-Readiness Candidates</span>
      </div>
    </div>

    <!-- Quick Insights Metric Row -->
    <div class="grid a-grid-4" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px;">
      <div class="a-stat">
        <div class="a-caption">TOP TIER CANDIDATES</div>
        <div class="v" style="color:var(--a-success);">${topTalent}</div>
        <div class="l">Readiness score ≥ 80%</div>
      </div>
      <div class="a-stat">
        <div class="a-caption">HIGH GROWTH STUDENTS</div>
        <div class="v" style="color:var(--a-navy);">${highGrowth}</div>
        <div class="l">Score improvement ≥ 20%</div>
      </div>
      <div class="a-stat">
        <div class="a-caption">COHORT AVERAGE READINESS</div>
        <div class="v">${Math.round(ranked.reduce((a,b)=>a+b.readiness,0)/ranked.length)}%</div>
        <div class="l">Across all 25 domains</div>
      </div>
      <div class="a-stat">
        <div class="a-caption">ENGAGEMENT INDEX</div>
        <div class="v">${Math.round(ranked.reduce((a,b)=>a+b.attempts,0)/ranked.length)}</div>
        <div class="l">Avg attempts per student</div>
      </div>
    </div>

    <!-- Talent Rankings Table -->
    <div class="a-card a-table-wrap">
      <table class="a-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Department</th>
            <th>Primary Domain</th>
            <th style="text-align:center;">Readiness Rating</th>
            <th style="text-align:center;">Improvement</th>
            <th style="text-align:center;">Attempts</th>
            <th style="text-align:left;">AI Talent Signal</th>
            <th style="text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${ranked.map(s=>{
            const lbl = label(s);
            return `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="a-avatar">${aInitials(s.name)}</div>
                  <div>
                    <div style="font-weight:700; color:var(--a-navy);">${s.name}</div>
                    <div style="font-size:11.5px; color:var(--a-ink-soft);">${s.enrollment}</div>
                  </div>
                </div>
              </td>
              <td style="color:var(--a-ink-soft);">${s.dept}</td>
              <td><span style="font-weight:600; color:var(--a-navy);">${s.domain}</span></td>
              <td style="text-align:center; font-weight:800; font-size:14px; color:${s.readiness>=75?'var(--a-success)':'var(--a-navy)'};">${s.readiness}%</td>
              <td style="text-align:center; font-weight:700; color:var(--a-success);">+${s.improvement}%</td>
              <td style="text-align:center; color:var(--a-ink-soft);">${s.attempts}</td>
              <td style="text-align:left;"><span class="a-badge ${lbl.type}">${lbl.text}</span></td>
              <td style="text-align:right;">
                <button class="a-btn a-btn-outline a-btn-sm" onclick="aGo('#/a-student/${s.id}')">Profile →</button>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
  return aShell("#/a-insights", "AI Talent Insights", inner);
}

/* ---------- Certificate Requests ---------- */
let aCertTab = "Pending";
function aScreenCerts(){
  const pendingCount = AS.certRequests.filter(c=>c.status==="Pending Faculty Review" || c.status==="Pending").length;
  const approvedCount = AS.certRequests.filter(c=>c.status==="Approved").length;
  const rejectedCount = AS.certRequests.filter(c=>c.status==="Rejected").length;

  const rows = AS.certRequests.filter(c=> {
    if(aCertTab==="Pending") return c.status==="Pending Faculty Review" || c.status==="Pending";
    return c.status===aCertTab;
  });

  const inner = `
    <!-- Page Header -->
    <div class="a-page-header">
      <div>
        <div class="a-h1">Readiness Certificate Approvals</div>
        <div class="a-muted" style="margin-top:3px;">
          Review institutional credential applications, evaluate simulation readiness scores, and grant certified endorsement.
        </div>
      </div>
      <div class="a-page-header-actions">
        <span class="a-badge warn" style="padding:6px 12px; font-size:11px; font-weight:700;">
          ${pendingCount} Pending Verification
        </span>
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="a-tabs">
      <div class="a-tab ${aCertTab==='Pending'?'active':''}" onclick="aCertTab='Pending'; aRender()">
        <span>Pending Review</span>
        <span class="a-tab-count">${pendingCount}</span>
      </div>
      <div class="a-tab ${aCertTab==='Approved'?'active':''}" onclick="aCertTab='Approved'; aRender()">
        <span>Approved Certificates</span>
        <span class="a-tab-count">${approvedCount}</span>
      </div>
      <div class="a-tab ${aCertTab==='Rejected'?'active':''}" onclick="aCertTab='Rejected'; aRender()">
        <span>Declined / Re-evaluation</span>
        <span class="a-tab-count">${rejectedCount}</span>
      </div>
    </div>

    <!-- Certificates Table -->
    <div class="a-card a-table-wrap">
      <table class="a-table">
        <thead>
          <tr>
            <th>Student Candidate</th>
            <th>Domain Specialization</th>
            <th style="text-align:center;">Readiness Score</th>
            <th style="text-align:center;">Completion Rate</th>
            <th style="text-align:center;">Growth Trend</th>
            <th>Submission Date</th>
            <th style="text-align:center;">Status</th>
            <th style="text-align:right;">Decision Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(c=>`
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="a-avatar">${aInitials(c.student)}</div>
                  <div style="font-weight:700; color:var(--a-navy);">${c.student}</div>
                </div>
              </td>
              <td><span style="font-weight:600; color:var(--a-navy);">${c.domain}</span></td>
              <td style="text-align:center; font-weight:800; font-size:13.5px; color:${c.readiness>=75?'var(--a-success)':'var(--a-navy)'};">${c.readiness}%</td>
              <td style="text-align:center; color:var(--a-ink-soft);">${c.completion}%</td>
              <td style="text-align:center; font-weight:700; color:var(--a-success);">+${c.improvement}%</td>
              <td style="color:var(--a-ink-soft); font-size:12.5px;">${c.date}</td>
              <td style="text-align:center;">${aBadge(c.status)}</td>
              <td style="text-align:right;">
                <button class="a-btn a-btn-outline a-btn-sm" onclick="aOpenCertReview('${c.id}')" style="font-weight:600;">
                  Review & Sign →
                </button>
              </td>
            </tr>`).join("") : `
            <tr>
              <td colspan="8">
                <div style="padding:48px 20px; text-align:center;">
                  <div style="font-size:30px; margin-bottom:8px;">🎓</div>
                  <div style="font-weight:700; color:var(--a-navy); font-size:15px; margin-bottom:4px;">No requests under "${aCertTab}"</div>
                  <div class="a-muted">When students complete their tracks and meet criteria, requests will show up here.</div>
                </div>
              </td>
            </tr>`}
        </tbody>
      </table>
    </div>`;
  return aShell("#/a-certs", "Certificate Requests", inner);
}

function aOpenCertReview(id){
  const c = AS.certRequests.find(x=>x.id===id);
  const s = AS.students.find(x=>x.id===id) || { dept:"Computer Science", year:"4th Year", attempts:8 };
  const overlay = document.createElement("div");
  overlay.className = "a-modal-overlay";
  overlay.innerHTML = `
    <div class="a-modal">
      <div class="a-modal-head">
        <div>
          <div class="a-h3" style="font-size:17px; margin-bottom:2px;">Institutional Certificate Evaluation</div>
          <div class="a-muted" style="font-size:12px;">Candidate: <strong>${c.student}</strong> · ${s.dept} (${s.year || '4th Year'})</div>
        </div>
        <button class="a-btn a-btn-outline a-btn-sm" onclick="this.closest('.a-modal-overlay').remove()">✕ Close</button>
      </div>
      <div class="a-modal-body">
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--a-bg); padding:12px 16px; border-radius:10px; margin-bottom:18px; border:1px solid var(--a-border);">
          <div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--a-ink-soft);">TARGET TRACK</div>
            <div style="font-weight:800; font-size:15px; color:var(--a-navy); margin-top:2px;">${c.domain} Specialization</div>
          </div>
          <div>${aBadge(c.status)}</div>
        </div>

        <div class="grid a-grid-4" style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px;">
          <div class="a-stat" style="padding:14px;">
            <div class="a-caption" style="font-size:10px;">READINESS</div>
            <div class="v" style="font-size:22px; color:${c.readiness>=75?'var(--a-success)':'var(--a-navy)'};">${c.readiness}%</div>
            <div class="l" style="font-size:11px;">Benchmark 75%</div>
          </div>
          <div class="a-stat" style="padding:14px;">
            <div class="a-caption" style="font-size:10px;">COMPLETION</div>
            <div class="v" style="font-size:22px;">${c.completion}%</div>
            <div class="l" style="font-size:11px;">Modules completed</div>
          </div>
          <div class="a-stat" style="padding:14px;">
            <div class="a-caption" style="font-size:10px;">IMPROVEMENT</div>
            <div class="v" style="font-size:22px; color:var(--a-success);">+${c.improvement}%</div>
            <div class="l" style="font-size:11px;">Growth curve</div>
          </div>
          <div class="a-stat" style="padding:14px;">
            <div class="a-caption" style="font-size:10px;">TOTAL ATTEMPTS</div>
            <div class="v" style="font-size:22px;">${s.attempts}</div>
            <div class="l" style="font-size:11px;">Evaluated sessions</div>
          </div>
        </div>

        <div class="a-card a-pad" style="background:linear-gradient(180deg,#fff,#FDF6F6); border-color:#F1C6C8; margin-bottom:18px;">
          <span style="font-size:10.5px; font-weight:800; color:var(--a-red); letter-spacing:0.04em;">✦ AI FACULTY DECISION SUPPORT</span>
          <p style="font-size:13px; line-height:1.55; color:var(--a-navy); margin-top:8px;">
            Candidate meets rigorous technical criteria with steady improvement trend across all modules. Readiness indicators firmly support institutional sign-off for ${c.domain}.
          </p>
        </div>

        <div class="a-field" style="margin-bottom:20px;">
          <label style="font-weight:700;">Faculty Endorsement / Observation Note</label>
          <textarea id="faculty-note-input" placeholder="Enter official faculty comments or feedback for the student credential dossier…" style="height:70px;"></textarea>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-top:1px solid var(--a-border); padding-top:18px;">
          <button class="a-btn a-btn-danger" onclick="aDecideCert('${id}','Rejected'); this.closest('.a-modal-overlay').remove();">
            Decline Request
          </button>
          <div style="display:flex; gap:10px; margin-left:auto;">
            <button class="a-btn a-btn-outline" onclick="aDecideCert('${id}','Pending Faculty Review', true); this.closest('.a-modal-overlay').remove();">
              Request More Attempts
            </button>
            <button class="a-btn a-btn-primary" style="background:var(--a-success);" onclick="aConfirmApprove('${id}', this)">
              ✓ Approve & Sign Certificate
            </button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
function aConfirmApprove(id, btn){
  if(confirm("Approve and sign this CareerForge certificate? The student profile will immediately update to 'Approved'.")){
    aDecideCert(id, "Approved");
    btn.closest(".a-modal-overlay").remove();
  }
}
function aDecideCert(id, status){
  const c = AS.certRequests.find(x=>x.id===id);
  const s = AS.students.find(x=>x.id===id);
  if(c) c.status = status;
  if(s) s.cert = status==="Pending Faculty Review" ? "Pending" : status;
  aSave(); 
  aRender();
}

/* ---------- Analytics ---------- */
function aScreenAnalytics(){
  const domainCounts = {};
  AS.students.forEach(s=>{ domainCounts[s.domain] = (domainCounts[s.domain]||0)+1; });
  const entries = Object.entries(domainCounts).sort((a,b)=>b[1]-a[1]);
  const maxV = Math.max(...entries.map(e=>e[1]),1);
  const avgImprovement = Math.round(AS.students.reduce((a,s)=>a+s.improvement,0)/AS.students.length);
  const completionRate = Math.round(AS.students.filter(s=>s.attempts>=10).length / AS.students.length * 100);
  const approvalStats = ["Approved","Rejected","Pending Faculty Review","Pending"].reduce((acc,k)=>{acc[k]=AS.certRequests.filter(c=>c.status===k).length; return acc;},{});

  const inner = `
    <!-- Page Header -->
    <div class="a-page-header">
      <div>
        <div class="a-h1">Institutional Placement Analytics</div>
        <div class="a-muted" style="margin-top:3px;">Macro-level trends, domain adoption distribution, and credential certification metrics.</div>
      </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="grid a-grid-4" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px;">
      <div class="a-stat">
        <div class="a-caption">AVERAGE IMPROVEMENT</div>
        <div class="v" style="color:var(--a-success);">+${avgImprovement}%</div>
        <div class="l">Cohort growth trend</div>
      </div>
      <div class="a-stat">
        <div class="a-caption">COMPLETION RATE</div>
        <div class="v">${completionRate}%</div>
        <div class="l">Completed ≥ 10 sessions</div>
      </div>
      <div class="a-stat">
        <div class="a-caption">CERTIFICATES ISSUED</div>
        <div class="v" style="color:var(--a-navy);">${approvalStats["Approved"]}</div>
        <div class="l">Officially endorsed</div>
      </div>
      <div class="a-stat">
        <div class="a-caption">PENDING REVIEW</div>
        <div class="v" style="color:${(approvalStats["Pending Faculty Review"]+approvalStats["Pending"])>0?'var(--a-red)':'var(--a-navy)'};">${approvalStats["Pending Faculty Review"]+approvalStats["Pending"]}</div>
        <div class="l">Awaiting faculty evaluation</div>
      </div>
    </div>

    <!-- Distribution Chart -->
    <div class="a-card a-pad">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <div class="a-h3" style="font-size:16px;">Student Enrollment Across Career Domains</div>
          <div class="a-muted" style="font-size:12.5px; margin-top:2px;">Headcount distribution across all 25 career development domains</div>
        </div>
        <span class="a-badge neutral">25 Tracks Active</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${entries.map(([name,count])=>`
          <div class="a-hbar-row">
            <div style="width:200px; font-size:13px; font-weight:600; color:var(--a-navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${name}</div>
            <div class="a-hbar-track">
              <div class="a-hbar-fill" style="width:${(count/maxV)*100}%;"></div>
            </div>
            <div style="width:36px; font-size:13px; font-weight:700; color:var(--a-navy); text-align:right;">${count}</div>
          </div>`).join("")}
      </div>
    </div>`;
  return aShell("#/a-analytics", "Analytics", inner);
}

/* ---------- Router ---------- */
function aParseRoute(){ const h = location.hash || "#/a-login"; const parts = h.replace(/^#\//,"").split("/"); return { name: parts[0], arg: parts[1] }; }
function aRender(){
  const { name, arg } = aParseRoute();
  const root = document.getElementById("aapp");
  let html = "";
  switch(name){
    case "a-login": html = aScreenLogin(); break;
    case "a-dashboard": if(!aRequireAuth())return; html = aScreenDashboard(); break;
    case "a-students": if(!aRequireAuth())return; html = aScreenStudents(); break;
    case "a-student": if(!aRequireAuth())return; html = aScreenStudentDetail(arg); break;
    case "a-domains": if(!aRequireAuth())return; html = aScreenDomains(); break;
    case "a-insights": if(!aRequireAuth())return; html = aScreenInsights(); break;
    case "a-certs": if(!aRequireAuth())return; html = aScreenCerts(); break;
    case "a-analytics": if(!aRequireAuth())return; html = aScreenAnalytics(); break;
    default: html = aScreenLogin();
  }
  root.innerHTML = html;
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", aRender);
window.addEventListener("DOMContentLoaded", ()=>{ 
  if(!location.hash) location.hash = "#/a-login"; 
  fetchRealStudents();
  aRender(); 
});
