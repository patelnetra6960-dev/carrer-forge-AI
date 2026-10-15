/* ============================================================
   CareerForge AI — Unified AI Services Engine
   - 1. Future Career Visualization (Domain-Tailored Local Images)
   - 2. Live Technical & HR Interview Question Generator (Gemini 3.6 Flash)
   - 3. AI Mock Interview Evaluator (Gemini 3.6 Flash)
   - 4. Personalized Career Assessment Report (Gemini 3.6 Flash)
   ============================================================ */

const GEMINI_API_KEY = "AQ.Ab8RN6KQR3INCPnkJEnPrALdp8M_YICP-jhL8gaklO5DNaKlMA";

// Clamp helper
function clampVal(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Client-side gibberish and keyboard mash detector
function isGibberishText(str) {
  if (!str || typeof str !== "string") return true;
  const s = str.trim();
  if (s.length < 5) return true;

  // Check consonant-to-vowel ratio in letters
  const lettersOnly = s.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length >= 6) {
    const vowels = (lettersOnly.match(/[aeiouyAEIOUY]/g) || []).length;
    if (vowels / lettersOnly.length < 0.12) return true; // Gibberish keyboard mash like 'sfdfdsfsnfbsjdfsdjf'
  }

  // Check long sequences of identical characters
  if (/(.)\1{4,}/.test(s)) return true;

  // Check 6+ consecutive consonants in single words
  const mashPattern = /(?:[bcdfghjklmnpqrstvwxyz]{6,})/i;
  if (mashPattern.test(s) && s.split(/\s+/).length <= 2) return true;

  return false;
}

// Call Google Gemini API (uses gemini-3.6-flash for fastest speed and high precision)
async function callGemini(prompt, systemInstruction = "") {
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + GEMINI_API_KEY;
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("Gemini API error status:", res.status, err);
      return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn("Gemini connection error:", err);
    return null;
  }
}

// 1. Future Career Visualization (Domain-Tailored 25 High-Resolution Images)
const DOMAIN_IMAGE_MAP = {
  uiux: "UIUX_Design.png",
  aiml: "AI&ML.png",
  frontend: "Frontend_Development.png",
  backend: "Backend Development.png",
  fullstack: "Full Stack Development.png",
  datasci: "Data Science.png",
  cyber: "Cybersecurity.png",
  cloud: "Cloud Computing.png",
  mobile: "Mobile App Development.png",
  devops: "DevOps.png",
  dataanalytics: "Data Analytics.png",
  dataeng: "Data Engineering.png",
  pm: "Product Management.png",
  game: "Game Development.png",
  embedded: "Embedded Systems.png",
  robotics: "Robotics.png",
  blockchain: "Blockchain Development.png",
  arvr: "ARVR Development.png",
  qa: "Quality Assurance & Testing.png",
  itsupport: "IT Support & Systems Administration.png",
  network: "Network Engineering.png",
  busanalysis: "Business Analysis.png",
  digitalmkt: "Digital Marketing (Tech).png",
  iot: "Internet of Things (IoT).png",
  swarch: "Software Architecture.png"
};

function getFutureCareerImageUrl(domainObj) {
  const id = domainObj?.id || "frontend";
  const filename = DOMAIN_IMAGE_MAP[id];
  if (filename) {
    return encodeURI(`img/${filename}`);
  }
  return "img/future_career.jpg";
}

// 2. AI Mock Interview Evaluator (Strict, Accurate Scoring & Full Breakdown)
async function evaluateInterviewAnswerWithAI(questionOrSession, studentAnswerOrDomain, optionalDomain) {
  let domainName = "Software Engineer";
  let qaContext = "";
  let isAllGibberish = false;

  if (Array.isArray(questionOrSession)) {
    domainName = studentAnswerOrDomain || "Software Engineer";
    const pairs = questionOrSession;
    if (!pairs.length) {
      return {
        score: 0,
        relevance: 0,
        communication: 0,
        technical: 0,
        structure: 0,
        feedback: "No answers were provided during this interview session.",
        tips: "Complete all questions with structured explanations."
      };
    }
    const validAnswers = pairs.filter(p => p.a && !isGibberishText(p.a));
    if (validAnswers.length === 0) {
      isAllGibberish = true;
    }
    qaContext = pairs.map((p, i) => `Question ${i+1}: "${p.q}"\nCandidate Answer ${i+1}: "${p.a}"`).join("\n\n");
  } else {
    const question = questionOrSession || "Interview Question";
    const answer = studentAnswerOrDomain || "";
    domainName = optionalDomain || "Software Engineer";

    if (!answer || isGibberishText(answer)) {
      isAllGibberish = true;
    }
    qaContext = `Question: "${question}"\nCandidate Answer: "${answer}"`;
  }

  // Pre-filter: Gibberish gets instant 0 score with no false inflation
  if (isAllGibberish) {
    return {
      score: 0,
      relevance: 0,
      communication: 0,
      technical: 0,
      structure: 0,
      feedback: "The submitted response is unintelligible keyboard mash or gibberish. It fails to answer the question and contains no meaningful technical reasoning.",
      tips: "Provide a coherent, genuine answer detailing your experience, technical decisions, and structured thought process."
    };
  }

  const prompt = `You are a strict Senior Technical Hiring Manager evaluating candidate interview responses for a ${domainName} position.
Evaluate the candidate's answers with rigorous realism, precision, and accuracy.

CRITICAL GRADING RULES:
1. If any answer is unintelligible keyboard mash, gibberish (e.g. "sfdfdsfsnfbsjdfsdjf", "asdf"), spam, or completely irrelevant, ALL SCORES (score, relevance, communication, technical, structure) MUST BE 0. Explicitly state in feedback that the input was gibberish/unintelligible.
2. If the answer is very short, shallow, or lacks technical substance, score it strictly between 10 and 45.
3. For competent, well-structured answers with clear examples, score realistically between 50 and 85. Scores above 85 are reserved for exceptional answers with concrete architectural trade-offs or measurable results.

${qaContext}

Provide an honest evaluation formatted strictly as a single JSON object with this exact schema (no markdown, no backticks):
{
  "score": (integer 0-100 overall score),
  "relevance": (integer 0-100 answer relevance to the domain & question),
  "communication": (integer 0-100 communication clarity & grammar),
  "technical": (integer 0-100 technical depth & domain precision),
  "structure": (integer 0-100 logical structure & reasoning),
  "feedback": "(2 concise, honest sentences summarizing technical depth and clarity)",
  "tips": "(1 actionable tip to improve)"
}`;

  const raw = await callGemini(prompt, "You are an expert technical interviewer. Output valid JSON only, no markdown backticks.");
  if (raw) {
    try {
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        score: clampVal(Number(parsed.score) || 0, 0, 100),
        relevance: clampVal(Number(parsed.relevance) || 0, 0, 100),
        communication: clampVal(Number(parsed.communication) || 0, 0, 100),
        technical: clampVal(Number(parsed.technical) || 0, 0, 100),
        structure: clampVal(Number(parsed.structure) || 0, 0, 100),
        feedback: parsed.feedback || "Evaluation complete.",
        tips: parsed.tips || "Structure answers using the STAR framework (Situation, Task, Action, Result)."
      };
    } catch (e) {
      console.warn("JSON parse error from Gemini response:", raw);
    }
  }

  // Strict offline fallback
  const sampleText = Array.isArray(questionOrSession) ? questionOrSession.map(p => p.a).join(" ") : (studentAnswerOrDomain || "");
  const wordCount = sampleText.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      score: 10,
      relevance: 10,
      communication: 15,
      technical: 5,
      structure: 10,
      feedback: "Answer is excessively brief and provides insufficient technical detail to evaluate.",
      tips: "Expand your answer with specific examples and your technical approach."
    };
  }

  const baseline = Math.min(80, Math.max(20, Math.round(20 + wordCount * 0.8)));
  return {
    score: baseline,
    relevance: clampVal(baseline + 2, 0, 100),
    communication: clampVal(baseline - 3, 0, 100),
    technical: clampVal(baseline - 5, 0, 100),
    structure: clampVal(baseline, 0, 100),
    feedback: `Evaluated response for ${domainName}. Demonstrates baseline concepts, but requires deeper architectural metrics.`,
    tips: "Structure answers using the STAR framework with concrete architectural decisions."
  };
}

// 3. Personalized Career Discovery Report Generator
async function generateCareerReportWithAI(domainObj, answersSummary) {
  const domainName = domainObj?.name || "Technology Track";
  const prompt = "The student completed a career compatibility assessment matching with " + domainName + ".\n" +
    "Key interests: " + (answersSummary || "System architecture, modern tools, practical engineering") + ".\n\n" +
    "Generate a 3-paragraph career guidance summary:\n" +
    "1. Why this domain strongly matches their cognitive and work style.\n" +
    "2. The highest-demand industry skills to prioritize.\n" +
    "3. A concise 30-day starter roadmap. Keep it encouraging, professional, and directly actionable.";

  const report = await callGemini(prompt, "You are an elite academic career mentor. Provide direct markdown format with bold headers.");
  if (report) return report;

  return "### ✦ Personalized Placement Roadmap for " + domainName + "\n\n" +
    "**1. Career Alignment & Potential:**\n" +
    "Your assessment results reveal strong analytical reasoning and practical problem-solving affinity. Professionals in **" + domainName + "** excel by combining structural thinking with modern tools, making this domain an ideal match for your strengths.\n\n" +
    "**2. Core High-Demand Skills to Master:**\n" +
    "To become industry-ready, prioritize foundational architecture, hands-on portfolio projects, and modern testing standards.\n\n" +
    "**3. 30-Day Starter Roadmap:**\n" +
    "- **Week 1-2:** Master core technical foundations and build 2 focused micro-projects.\n" +
    "- **Week 3:** Complete an end-to-end domain project and document your architecture.\n" +
    "- **Week 4:** Take CareerForge technical mock interviews and apply for faculty endorsement.";
}

// 4. Live Technical & HR Interview Question Generator (Gemini 3.6 Flash)
async function generateInterviewQuestionsWithAI(type, domainObj) {
  const d = domainObj || { name: "Software Engineer", skills: ["Coding", "System Design"] };
  const domainName = d.name || "Software Engineer";
  const isTech = type === "tech";

  let prompt = "";
  if (isTech) {
    prompt = `You are a Principal Engineer and Technical Interviewer at a premier technology company.
Generate 7 realistic, high-yield multiple-choice technical interview questions for a candidate interviewing for a ${domainName} position.
Cover core engineering concepts, architecture, performance, real-world edge cases, and modern industry tools.
Format strictly as a JSON array of 7 objects (no markdown, no backticks):
[
  {
    "q": "Clear, realistic technical question",
    "opts": ["Option 0", "Option 1", "Option 2", "Option 3"],
    "correct": 0,
    "explain": "In-depth technical explanation of why this is correct and why other approaches are sub-optimal.",
    "tip": "An actionable industry interview tip for this topic."
  }
]`;
  } else {
    prompt = `You are a Senior HR Director and Talent Acquisition Lead at a premier technology enterprise.
Generate 7 realistic behavioral, cultural, and situational interview questions for a candidate entering a ${domainName} role.
Cover key behavioral areas: handling team disagreements, unclear project requirements, ethical dilemmas, deadline pressure, and career ambition.
Format strictly as a JSON array of 7 objects (no markdown, no backticks):
[
  {
    "q": "Realistic situational or behavioral question",
    "opts": ["Option 0", "Option 1", "Option 2", "Option 3"],
    "correct": 0,
    "explain": "Recruiter reasoning explaining what leadership/communication qualities the best answer demonstrates.",
    "tip": "An actionable advice tip for answering behavioral prompts using the STAR method."
  }
]`;
  }

  const raw = await callGemini(prompt, "You are an expert technical and HR interviewer. Output valid JSON array only, no markdown formatting, no code fences.");
  if (raw) {
    try {
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 5).map(item => ({
          q: item.q || "Interview Question",
          opts: Array.isArray(item.opts) && item.opts.length === 4 ? item.opts : ["Option A", "Option B", "Option C", "Option D"],
          correct: typeof item.correct === "number" && item.correct >= 0 && item.correct <= 3 ? item.correct : 0,
          explain: item.explain || "Understanding foundational principles is key for industry interviews.",
          tip: item.tip || "Use structured reasoning to demonstrate your thought process."
        }));
      }
    } catch (e) {
      console.warn("JSON parse error from Gemini interview question generation:", raw);
    }
  }

  // Graceful offline fallback from INTERVIEW_QUESTIONS if Gemini unavailable
  if (typeof INTERVIEW_QUESTIONS !== "undefined" && Array.isArray(INTERVIEW_QUESTIONS)) {
    const seed = (domainName.length + (isTech ? 7 : 3)) % INTERVIEW_QUESTIONS.length;
    const fallbackSlice = [...INTERVIEW_QUESTIONS.slice(seed), ...INTERVIEW_QUESTIONS.slice(0, seed)].slice(0, 5);
    return fallbackSlice;
  }

  return [
    {
      q: `How do you ensure maintainability and high performance when working on ${domainName} projects?`,
      opts: [
        "By enforcing modular design, automated testing, and comprehensive documentation",
        "By writing all code in a single file to reduce file overhead",
        "By deferring optimization until after release without monitoring",
        "By relying strictly on manual QA testing without unit tests"
      ],
      correct: 0,
      explain: "Modular design and automated test coverage prevent regressions and allow scalable team collaboration.",
      tip: "Mention continuous integration and automated test suites when discussing project maintainability."
    }
  ];
}
