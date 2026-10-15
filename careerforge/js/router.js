/* ============================================================
   CareerForge AI — Router + Action Controller
   ============================================================ */

const App = {
  async login(e){
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pass  = document.getElementById("login-pass").value;
    if(!email || !pass){ toast("Please enter your email and password."); return false; }

    toast("Signing in…");
    const { data, error } = await db.auth.signInWithPassword({ email, password: pass });
    if(error){ toast("Login failed: " + error.message); return false; }

    // Load state from Supabase if it exists, else keep default
    const { data: stateRow } = await db.from("student_states")
      .select("state_data")
      .eq("user_id", data.user.id)
      .single();

    if(stateRow?.state_data){
      S = Object.assign(defaultState(), stateRow.state_data);
      localStorage.setItem(STORE_KEY, JSON.stringify(S));
    }

    if(!S.account){
      S.account = { name: email.split("@")[0].replace(/[._]/g," ").replace(/\b\w/g,c=>c.toUpperCase()), email };
    }
    saveState();
    toast("Welcome back, " + S.account.name + "!");
    go(S.domain ? "#/dashboard" : "#/domains");
    return false;
  },
  googleDemo(){
    if(!S.account){
      S.account = { name: "Alex Student", email: "alex.student@university.edu" };
    }
    saveState();
    toast("Signed in with Google (demo)");
    go(S.domain ? "#/dashboard" : "#/domains");
  },
  async signup(e){
    e.preventDefault();
    const name    = document.getElementById("su-name").value.trim();
    const email   = document.getElementById("su-email").value.trim();
    const rawEnroll = document.getElementById("su-enroll").value;
    const enroll  = rawEnroll.replace(/\D/g, "").slice(0, 11);
    const pass    = document.getElementById("su-pass").value;
    const confirm = document.getElementById("su-confirm").value;
    const confirmField = document.getElementById("f-confirm");

    if(enroll.length !== 11){
      toast(`Enrollment Number must be exactly 11 digits (entered ${enroll.length} digits).`);
      return false;
    }
    if(pass !== confirm){ confirmField.classList.add("error"); return false; }
    confirmField.classList.remove("error");

    toast("Creating your account…");
    const { data, error } = await db.auth.signUp({ email, password: pass });
    if(error){ toast("Signup failed: " + error.message); return false; }

    // Build the fresh student state
    S.account  = { name, email };
    S.profile  = { enrollment: enroll, dept: "Computer Science", year: "4th Year", university: "University Tech", skills: [], interests: [] };
    S.domain   = null;
    S.assessment = { answers: [], score: null };
    S.resume   = { best: 0, current: 0, attempts: 0 };
    S.hr       = { best: 0, current: 0, attempts: 0 };
    S.tech     = { best: 0, current: 0, attempts: 0 };
    S.mock     = { best: 0, current: 0, attempts: 0 };
    S.reflection = { done: false };
    S.points   = 0;
    S.pointHistory = [];
    S.certStatus = "Not Eligible";
    S.domain   = "frontend";
    saveState();
    toast("Account created! Welcome to CareerForge, " + name + ".");
    go("#/domains");
    return false;
  },
  saveProfile(e, continueFlow = false){
    if(e) e.preventDefault();
    const rawEnroll = document.getElementById("p-enroll").value;
    const enroll = rawEnroll.replace(/\D/g, "").slice(0, 11);
    if(enroll.length !== 11){
      toast(`Enrollment Number must be exactly 11 digits (entered ${enroll.length} digits).`);
      return false;
    }
    const name = document.getElementById("p-name").value.trim();
    const email = document.getElementById("p-email").value.trim();
    const phone = document.getElementById("p-phone")?.value.trim() || "";
    const address = document.getElementById("p-address")?.value.trim() || "";
    const linkedin = document.getElementById("p-linkedin")?.value.trim() || "";
    const github = document.getElementById("p-github")?.value.trim() || "";
    const portfolio = document.getElementById("p-portfolio")?.value.trim() || "";

    const univ = document.getElementById("p-univ").value.trim();
    const degree = document.getElementById("p-degree")?.value.trim() || "";
    const dept = document.getElementById("p-dept").value;
    const semester = document.getElementById("p-semester")?.value || "";
    const year = document.getElementById("p-year").value;
    const cgpa = document.getElementById("p-cgpa")?.value.trim() || "";

    // Extract projects
    const projects = [];
    const projCards = document.querySelectorAll(".project-form-card");
    projCards.forEach(card => {
      const pTitle = card.querySelector(".proj-title").value.trim();
      const pDesc = card.querySelector(".proj-desc").value.trim();
      const pTech = card.querySelector(".proj-tech").value.trim();
      if(pTitle) {
        projects.push({ title: pTitle, desc: pDesc, tech: pTech });
      }
    });

    S.account.name = name;
    S.account.email = email;
    S.profile = {
      enrollment: enroll,
      phone,
      address,
      linkedin,
      github,
      portfolio,
      university: univ,
      degree,
      dept,
      semester,
      year,
      cgpa,
      skills: [...tempSkills],
      projects
    };
    S.domain = "frontend";
    saveState();
    
    if(continueFlow) {
      toast("Profile & Resume saved! Let's start your Career Discovery.");
      go("#/assessment-intro");
    } else {
      toast("Draft saved successfully.");
      render();
    }
    return false;
  },

  startAssessment(){
    // Shuffle the 15 standard questions so the order is randomized for each student
    const shuffledQuestions = [...ASSESSMENT_QUESTIONS].sort(() => Math.random() - 0.5);
    
    S.assessmentQuestions = shuffledQuestions.map(qObj => {
      return {
        q: qObj.q,
        opts: qObj.opts
      };
    });
    
    S.qIndex = 0;
    S.assessment.answers = [];
    saveState();
    go("#/assessment");
  },
  answerAssessment(oi, e){
    S.assessment.answers[S.qIndex] = oi;
    saveState();
    if (e && typeof window._triggerAssessmentBurst === "function") {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);
      window._triggerAssessmentBurst(clickX, clickY);
      setTimeout(render, 160); // brief delay to let the click bubble splash draw
    } else {
      render();
    }
  },
  nextAssessmentQ(){
    const questions = S.assessmentQuestions || [];
    if(S.qIndex < questions.length-1){ S.qIndex++; saveState(); render(); }
    else { go("#/assessment-loading"); }
  },
  prevAssessmentQ(){ if(S.qIndex>0){ S.qIndex--; render(); } },
  exitAssessment(){ if(confirm("Exit assessment? Your progress on this attempt will be lost.")) go("#/dashboard"); },
  finishAssessment(){
    const scores = {};
    const seed = hashCode(S.account?.email + S.assessment.answers.join(""));
    
    // Tally answers for categories
    const categoryCounts = { Design: 0, Data: 0, Engineering: 0, Infrastructure: 0 };
    S.assessment.answers.forEach(ansIndex => {
      if (ansIndex === 0) categoryCounts.Design++;
      else if (ansIndex === 1) categoryCounts.Data++;
      else if (ansIndex === 2) categoryCounts.Engineering++;
      else if (ansIndex === 3) categoryCounts.Infrastructure++;
    });

    DOMAINS.forEach(d => {
      let catScore = 0;
      if (d.cat === "Design") catScore = categoryCounts.Design;
      else if (d.cat === "Data") catScore = categoryCounts.Data;
      else if (d.cat === "Engineering") catScore = categoryCounts.Engineering;
      else if (d.cat === "Infrastructure" || d.cat === "Business") catScore = categoryCounts.Infrastructure;

      // Base score is directly derived from user interest categories
      const baseScore = 40 + (catScore * 3.4);
      // Small deterministic variance based on domain name and user email
      const variance = hashCode(d.id + seed) % 12;
      const finalPct = Math.min(96, Math.max(45, Math.round(baseScore + variance)));
      scores[d.id] = finalPct;
    });

    const recommendations = Object.entries(scores)
      .map(([id, pct]) => {
        const d = domainById(id);
        return {
          id,
          name: d.name,
          icon: d.icon,
          cat: d.cat,
          fit: d.fit,
          desc: d.desc,
          pct: pct
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    S.assessment.recommendations = recommendations;
    S.domain = recommendations[0].id;
    saveState();
    go("#/result");
  },

  resumeChosen(file){
    document.getElementById("file-name").textContent = file ? `Selected: ${file.name}` : "";
  },
  finishResume(){
    const seed = hashCode(S.domain + S.resume.attempts + Date.now());
    let score = 55 + (seed % 38);
    if(S.resume.attempts>0) score = clamp(score, S.resume.best, 100); // encourage improvement narrative
    S.resume.current = score;
    S.resume.best = Math.max(S.resume.best, score);
    S.resume.attempts++;
    awardPoints(20, "Resume Analysis completed");
    go("#/resume-result");
  },

  startInterview(type){
    S.interviewType = type;
    go("#/interview-intro");
  },
  async beginInterviewQuestions(){
    const d = domainById(S.domain) || { name: "Software Engineer" };
    const label = S.interviewType === 'hr' ? "HR" : "Technical";
    toast(`✦ Gemini AI generating ${label} interview questions for ${d.name}…`);
    
    const btn = document.getElementById("btn-start-interview");
    if(btn) { btn.disabled = true; btn.textContent = "✦ Gemini Generating Questions…"; }

    let questions = [];
    if(typeof generateInterviewQuestionsWithAI === "function"){
      questions = await generateInterviewQuestionsWithAI(S.interviewType, d);
    }
    
    if(!questions || !questions.length){
      const seed = hashCode(S.domain + S.interviewType + Date.now());
      const shuffled = [...INTERVIEW_QUESTIONS].sort(()=> (seed % 7) - 3 + Math.random()-0.5);
      questions = shuffled.slice(0, 7);
    }
    
    S.interviewSet = questions;
    S.interviewCorrect = [];
    S.qIndex = 0;
    saveState();
    go("#/interview-question");
  },
  pickInterviewOption(oi){
    const item = S.interviewSet[S.qIndex];
    S.interviewCorrect[S.qIndex] = { picked: oi, correct: item.correct };
    saveState();
    render();
  },
  nextInterviewQ(){
    if(S.qIndex < S.interviewSet.length-1){ S.qIndex++; render(); }
    else { App.finishInterview(); }
  },
  prevInterviewQ(){ if(S.qIndex>0){ S.qIndex--; render(); } },
  exitInterview(){ if(confirm("Exit this interview attempt? Your progress will be lost.")) go("#/interview-home"); },
  finishInterview(){
    const total = S.interviewSet && S.interviewSet.length ? S.interviewSet.length : 5;
    const correct = S.interviewCorrect.filter(r=>r && r.picked===r.correct).length;
    const score = Math.round((correct / total) * 100);
    const bucket = S.interviewType==='hr' ? S.hr : S.tech;
    bucket.current = score;
    bucket.best = Math.max(bucket.best, score);
    bucket.attempts++;
    awardPoints(20, `${S.interviewType==='hr'?'HR':'Technical'} Interview practiced`);
    go("#/interview-result");
  },

  startMock(){ S.qIndex = 0; S.mockAnswers = []; S.mockAIFeedback = null; go("#/mock-session"); },
  async submitMockAnswer(){
    const val = document.getElementById("mock-answer").value.trim();
    if(val.length < 5){ toast("Please write a fuller answer before submitting."); return; }
    if(!S.mockAnswers) S.mockAnswers = [];
    S.mockAnswers.push({ q: MOCK_QUESTIONS[S.qIndex], a: val });

    if(S.qIndex < MOCK_QUESTIONS.length-1){
      S.qIndex++;
      render();
    } else {
      toast("AI evaluating your responses with Gemini…");
      const d = domainById(S.domain);

      if(typeof evaluateInterviewAnswerWithAI === "function"){
        const aiRes = await evaluateInterviewAnswerWithAI(S.mockAnswers, d?.name || "Software Engineer");
        S.mockAIFeedback = aiRes;
        const score = typeof aiRes.score === "number" ? aiRes.score : 0;
        S.mock.current = score;
        S.mock.best = Math.max(S.mock.best, score);
        S.mock.attempts++;
        if(score >= 25){
          awardPoints(25, "Mock Interview evaluated by AI");
        } else {
          toast(`Evaluation complete. Score: ${score}%`);
        }
        go("#/mock-feedback");
      } else {
        App.finishMock();
      }
    }
  },
  exitMock(){ if(confirm("Exit mock interview? Your progress will be lost.")) go("#/mock-home"); },
  finishMock(){
    const seed = hashCode(S.domain + Date.now());
    const score = 65 + (seed % 30);
    S.mock.current = score;
    S.mock.best = Math.max(S.mock.best, score);
    S.mock.attempts++;
    awardPoints(25, "Mock Interview completed");
    go("#/mock-feedback");
  },

  autosave(){
    const el = document.getElementById("autosave-status");
    if(!el) return;
    el.textContent = "Saving…";
    clearTimeout(App._autosaveT);
    App._autosaveT = setTimeout(()=>{ el.textContent = "All changes saved"; }, 600);
  },
  submitReflection(e){
    e.preventDefault();
    S.reflection.done = true;
    awardPoints(15, "Career Reflection submitted");
    go("#/reflection-done");
    return false;
  },

  async logout(){
    await db.auth.signOut();
    S.account = null;
    localStorage.removeItem(STORE_KEY);
    S = defaultState();
    toast("Logged out successfully.");
    go("#/login");
  },
};

/* ============================================================
   ROUTER
   ============================================================ */
function parseRoute(){
  const hash = location.hash || "#/splash";
  const parts = hash.replace(/^#\//,"").split("/");
  return { name: parts[0] || "splash", arg: parts[1] };
}

let lastRouteKey = null;

function render(){
  const { name, arg } = parseRoute();
  const routeKey = `${name}/${arg || ''}`;
  

  const app = document.getElementById("app");
  let html = "";
  switch(name){
    case "splash": html = screenSplash(); break;
    case "login": html = screenLogin(); break;
    case "signup": html = screenSignup(); break;
    case "profile-setup": if(!requireAuth())return; html = screenDomains(); break;
    case "domains": if(!requireAuth())return; html = screenDomains(); break;
    case "domain": if(!requireAuth())return; html = screenDomainDetail(arg); break;
    case "assessment-intro": if(!requireAuth()||!requireDomain())return; html = screenAssessmentIntro(); break;
    case "assessment": if(!requireAuth()||!requireDomain())return; html = screenAssessmentQuestion(); break;
    case "assessment-loading": if(!requireAuth())return; html = screenAssessmentLoading(); break;
    case "result": if(!requireAuth())return; html = screenResult(); break;
    case "future": if(!requireAuth())return; html = screenFuture(); break;
    case "journey": if(!requireAuth())return; html = screenJourneyIntro(); break;
    case "dashboard": if(!requireAuth())return; html = screenDashboard(); break;
    case "resume": if(!requireAuth())return; html = screenResume(); break;
    case "resume-processing": if(!requireAuth())return; html = screenResumeProcessing(); break;
    case "resume-result": if(!requireAuth())return; html = screenResumeResult(); break;
    case "interview-home": if(!requireAuth())return; html = screenInterviewHome(); break;
    case "interview-intro": if(!requireAuth())return; html = screenInterviewIntro(); break;
    case "interview-question": if(!requireAuth())return; html = screenInterviewQuestion(); break;
    case "interview-result": if(!requireAuth())return; html = screenInterviewResult(); break;
    case "mock-home": if(!requireAuth())return; html = screenMockHome(); break;
    case "mock-session": if(!requireAuth())return; html = screenMockSession(); break;
    case "mock-feedback": if(!requireAuth())return; html = screenMockFeedback(); break;
    case "reflection": if(!requireAuth())return; html = screenReflection(); break;
    case "reflection-done": if(!requireAuth())return; html = screenReflectionDone(); break;
    case "progress": if(!requireAuth())return; html = screenProgress(); break;
    case "rewards": if(!requireAuth())return; html = screenRewards(); break;
    case "certificate": if(!requireAuth())return; html = screenCertificate(); break;
    case "cert-preview": if(!requireAuth())return; html = screenCertPreview(); break;
    case "profile": if(!requireAuth())return; html = screenProfile(); break;
    case "settings": if(!requireAuth())return; html = screenSettings(); break;
    default: html = screenSplash();
  }

  // Cleanup old canvas instances to prevent animation/memory leaks
  const oldCanvas = document.getElementById("auth-canvas");
  if (oldCanvas && typeof oldCanvas._cleanup === "function") {
    oldCanvas._cleanup();
  }
  const oldResumeCanvas = document.getElementById("resume-bg-canvas");
  if (oldResumeCanvas && typeof oldResumeCanvas._cleanup === "function") {
    oldResumeCanvas._cleanup();
  }
  const oldAssessmentCanvas = document.getElementById("assessment-bg-canvas");
  if (oldAssessmentCanvas && typeof oldAssessmentCanvas._cleanup === "function") {
    oldAssessmentCanvas._cleanup();
  }
  
  app.innerHTML = html;
  if (typeof window.animateCounters === "function") {
    setTimeout(window.animateCounters, 30);
  }
  if (lastRouteKey !== routeKey) {
    window.scrollTo(0, 0);
  }
  lastRouteKey = routeKey;
  
  // Initialize interactive neural connection nodes for login/signup
  if (name === "login" || name === "signup") {
    setTimeout(initAuthCanvas, 60);
  }
  // Initialize interactive resume builder bg canvas
  if (name === "profile-setup" || name === "domains") {
    setTimeout(initResumeCanvas, 60);
  }
  // Initialize interactive assessment bg canvas
  if (name === "assessment" || name === "result") {
    setTimeout(initAssessmentCanvas, 60);
  }

  if(name === "profile-setup"){ renderChips("skills"); renderChips("interests"); }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", async () => {
  // Sync active Supabase session on page load
  try {
    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
      const { data: stateRow } = await db.from("student_states")
        .select("state_data")
        .eq("user_id", session.user.id)
        .single();
      if (stateRow?.state_data) {
        S = Object.assign(defaultState(), stateRow.state_data);
        localStorage.setItem(STORE_KEY, JSON.stringify(S));
      }
    }
  } catch(err) {
    console.warn("Session restore check:", err);
  }
  // Render current active route directly on page reloads/refreshes
  render();
});
