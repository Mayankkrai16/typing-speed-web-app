/* ═══════════════════════════════════════════
   KeyForge — Typing Lab  |  script.js
   Full game logic, charts, challenges, sound
═══════════════════════════════════════════ */

// ── PARAGRAPH DATA ──
const PARAGRAPHS = {
  easy: [
  "The quick brown fox jumps over the lazy dog and runs into the green forest where the trees are tall and the air feels fresh and calm. The birds are singing softly and the sun shines gently through the leaves making everything look peaceful and bright",
  "She likes to walk by the sea every morning where the waves move slowly and the cool breeze touches her face. People around her smile and enjoy the moment while the sound of water makes everything feel relaxed and quiet",
  "A small cat sat on the warm window and looked outside at the busy street where people were walking and talking happily. The sky was clear and blue and the day felt calm and simple without any stress or worry",
  "Every morning i wake up early and drink a glass of water before starting my day with a fresh mind and positive thoughts. I enjoy simple things like reading books and listening to music while sitting in a quiet place",
  "The sun rises in the east and fills the sky with light while people slowly begin their daily work and routines. Children go to school and adults go to their jobs while everything moves in a smooth and natural way"
],
  medium: [
  "Typing speed is an essential skill in today's digital world where communication happens quickly and efficiently across different platforms. Improving both speed and accuracy requires consistent practice and a strong focus on proper finger placement",
  "Many professionals spend hours working on computers which makes typing an important part of their daily routine and productivity. Developing this skill can significantly reduce time spent on repetitive tasks and increase overall efficiency",
  "Learning how to type without looking at the keyboard is one of the most valuable abilities you can build over time. It allows you to focus more on your thoughts and ideas rather than worrying about each key you press",
  "Practice sessions should be structured in a way that balances speed and accuracy so that improvement happens gradually and effectively. Rushing too much can lead to more mistakes which slows down progress in the long run",
  "Building muscle memory is the key to becoming faster because your fingers start remembering patterns automatically. Over time this leads to smoother typing and better control even during longer and more complex paragraphs"
],
  hard: [
  "The rapid evolution of technology has significantly changed how individuals interact with digital systems enabling faster communication and more efficient workflows across various industries. Mastering typing is a foundational skill that supports this transformation",
  "Cognitive performance improves when individuals engage in deliberate practice that challenges both speed and accuracy simultaneously while maintaining consistent focus throughout the session. This approach leads to long term skill development",
  "Modern software development requires engineers to write clean and efficient code while also communicating ideas clearly through documentation and collaboration tools. Typing fluency plays a crucial role in achieving these goals effectively",
  "Artificial intelligence and machine learning systems rely on large amounts of data processing and human interaction which makes efficient input methods increasingly important. Faster typing contributes to improved productivity and smoother workflows",
  "Developing advanced skills requires patience discipline and a structured approach to learning where individuals gradually increase difficulty while maintaining accuracy. This balance ensures steady improvement without unnecessary frustration or burnout"
]
};

// ── CHALLENGE DEFINITIONS ──
const CHALLENGES = [
  {
    id: "speed_demon",
    title: "Speed Demon: Hit 70+ WPM",
    description: "Complete 3 tests with 70+ WPM",
    goal: 3,
    check: (result) => result.wpm >= 70
  },
  {
    id: "accuracy_king",
    title: "Accuracy King: 95%+ Accuracy",
    description: "Complete 3 tests with 95%+ accuracy",
    goal: 3,
    check: (result) => result.accuracy >= 95
  },
  {
    id: "marathon",
    title: "Marathon: Complete 5 Tests",
    description: "Complete any 5 typing tests",
    goal: 5,
    check: () => true
  },
  {
    id: "elite_combo",
    title: "Elite: 80+ WPM & 95%+ Accuracy",
    description: "Achieve both high speed and accuracy",
    goal: 1,
    check: (result) => result.wpm >= 80 && result.accuracy >= 95
  }
];

// ── STATE ──
const state = {
  // test config
  mode: "time",         // "time" | "paragraph"
  duration: 30,         // seconds for timed mode
  difficulty: "easy",

  // runtime
  running: false,
  finished: false,
  countdownRunning: false, 
  startTime: null,
  timerInterval: null,
  timeLeft: 30,
  paragraph: "",
  currentIndex: 0,
  errors: 0,
  totalTyped: 0,
  wpmLog: [],           // [{sec, wpm}]

  // sound
  soundEnabled: true,

  // challenge
  challengeIndex: 0,
  challengeProgress: {},
};

// ── DOM REFS ──
const dom = {
  paraDisplay:    document.getElementById("para-display"),
  typingInput:    document.getElementById("typing-input"),
  startBtn:       document.getElementById("start-btn"),
  restartBtn:     document.getElementById("restart-btn"),
  liveWpm:        document.getElementById("live-wpm"),
  liveAcc:        document.getElementById("live-acc"),
  liveTimer:      document.getElementById("live-timer"),
  timerWrap:      document.getElementById("timer-wrap"),
  resultsPanel:   document.getElementById("results-panel"),
  resWpm:         document.getElementById("res-wpm"),
  resAcc:         document.getElementById("res-acc"),
  resErrors:      document.getElementById("res-errors"),
  resChars:       document.getElementById("res-chars"),
  adviceText:     document.getElementById("advice-text"),
  retryBtn:       document.getElementById("retry-btn"),
  newParaResultsBtn: document.getElementById("new-para-results-btn"),
  newParaBtn:     document.getElementById("new-para-btn"),
  themeToggle:    document.getElementById("theme-toggle"),
  soundToggle:    document.getElementById("sound-toggle"),
  moonIcon:       document.getElementById("moon-icon"),
  sunIcon:        document.getElementById("sun-icon"),
  soundOnIcon:    document.getElementById("sound-on-icon"),
  soundOffIcon:   document.getElementById("sound-off-icon"),
  hsDisplay:      document.getElementById("hs-display"),
  challengeTitle: document.getElementById("challenge-title"),
  challengeFill:  document.getElementById("challenge-progress-fill"),
  challengeText:  document.getElementById("challenge-progress-text"),
  nextChallengeBtn: document.getElementById("next-challenge-btn"),
  countdownOverlay: document.getElementById("countdown-overlay"),
  countdownNumber:  document.getElementById("countdown-number"),
  resultsBadge:   document.getElementById("results-badge"),
};

// Chart instances (keep references to prevent duplicates)
let chartSession = null, chartConsistency = null, chartHistory = null;

/* ════════════════════════════════════════
   AUDIO ENGINE (Web Audio API)
════════════════════════════════════════ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone({ freq = 440, type = "sine", duration = 0.08, volume = 0.15, decay = 0.05 } = {}) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + decay);
  } catch(e) {}
}

const sfx = {
  keyPress : () => playTone({ freq: 880, type: "sine",    duration: 0.06, volume: 0.08 }),
  error    : () => playTone({ freq: 180, type: "sawtooth", duration: 0.12, volume: 0.12 }),
  complete : () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone({ freq: f, type: "sine", duration: 0.18, volume: 0.18 }), i * 100));
  }
};

/* ════════════════════════════════════════
   STORAGE HELPERS
════════════════════════════════════════ */
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch(e) { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

function getHighScore()   { return lsGet("kf_highscore", 0); }
function saveHighScore(s) { if (s > getHighScore()) lsSet("kf_highscore", s); }
function getHistory()     { return lsGet("kf_history", []); }
function pushHistory(wpm) {
  const h = getHistory();
  h.push(wpm);
  if (h.length > 20) h.shift();
  lsSet("kf_history", h);
}
function getChallengeProgress() { return lsGet("kf_challenges", {}); }
function saveChallengeProgress(p) { lsSet("kf_challenges", p); }

/* ════════════════════════════════════════
   PARAGRAPH HELPERS
════════════════════════════════════════ */
function pickParagraph() {
  const pool = PARAGRAPHS[state.difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderParagraph() {
  const chars = state.paragraph.split("");
  dom.paraDisplay.innerHTML = chars.map((ch, i) => {
    const cls = i === 0 ? "char active" : "char";
    // preserve spaces visually
    const display = ch === " " ? "&nbsp;" : ch;
    return `<span class="${cls}" data-i="${i}">${display}</span>`;
  }).join("");
}

function getCharEl(i) {
  return dom.paraDisplay.querySelector(`[data-i="${i}"]`);
}

/* ════════════════════════════════════════
   TEST LIFECYCLE
════════════════════════════════════════ */
function initTest() {
  state.running   = false;
  state.finished  = false;
  state.startTime = null;
  state.currentIndex = 0;
  state.errors    = 0;
  state.totalTyped = 0;
  state.wpmLog    = [];
  state.timeLeft  = state.duration;

  state.paragraph = pickParagraph();
  renderParagraph();

  dom.typingInput.value = "";
  dom.typingInput.disabled = false;

  dom.liveWpm.textContent   = "—";
  dom.liveAcc.textContent   = "—";
  dom.liveTimer.textContent = state.mode === "time" ? state.duration : "∞";
  dom.timerWrap.style.display = state.mode === "time" ? "" : "none";

  dom.resultsPanel.classList.add("hidden");
  dom.startBtn.classList.remove("hidden");
  dom.restartBtn.classList.add("hidden");

  clearInterval(state.timerInterval);
}

async function startCountdown() {

  // 🚫 Prevent double start
  if (state.countdownRunning || state.running) return;

  state.countdownRunning = true;

  dom.typingInput.disabled = true;
  dom.startBtn.classList.add("hidden");
  dom.countdownOverlay.classList.remove("hidden");

  for (let n = 3; n >= 1; n--) {
    dom.countdownNumber.textContent = n;
    await sleep(900);
  }

  dom.countdownNumber.textContent = "GO!";
  await sleep(500);

  dom.countdownOverlay.classList.add("hidden");
  dom.typingInput.disabled = false;
  dom.typingInput.focus();

  state.countdownRunning = false; // ✅ reset

  beginTest();
}

function beginTest() {
  state.running   = true;
  state.startTime = Date.now();

  dom.restartBtn.classList.remove("hidden");

  if (state.mode === "time") {
    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - state.startTime) / 1000;
      state.timeLeft = Math.max(0, state.duration - elapsed);
      dom.liveTimer.textContent = Math.ceil(state.timeLeft);

      // Log WPM snapshot every second
      const words = state.totalTyped / 5;
      const mins  = elapsed / 60;
      const wpm   = mins > 0 ? Math.round(words / mins) : 0;
      state.wpmLog.push({ sec: Math.round(elapsed), wpm });
      dom.liveWpm.textContent = wpm;

      if (state.timeLeft <= 0) endTest();
    }, 300);
  }
}

function endTest() {
  if (state.finished) return;
  state.finished = true;
  state.running  = false;
  clearInterval(state.timerInterval);
  dom.typingInput.disabled = true;

  const elapsed = (Date.now() - state.startTime) / 1000 || 1;
  const words   = state.totalTyped / 5;
  const mins    = elapsed / 60;
  const wpm     = Math.round(words / mins);
  const accuracy = state.totalTyped > 0
    ? Math.round(((state.totalTyped - state.errors) / state.totalTyped) * 100)
    : 100;

  sfx.complete();

  const result = { wpm, accuracy, errors: state.errors, chars: state.totalTyped };
  saveHighScore(wpm);
  pushHistory(wpm);
  updateChallengeProgress(result);
  updateHeaderHighscore();
  showResults(result);
}

function showResults(result) {
  dom.resWpm.textContent    = result.wpm;
  dom.resAcc.textContent    = result.accuracy + "%";
  dom.resErrors.textContent = result.errors;
  dom.resChars.textContent  = result.chars;

  // badge
  if (result.wpm >= 80 && result.accuracy >= 95) dom.resultsBadge.textContent = "🏆";
  else if (result.wpm >= 60)                      dom.resultsBadge.textContent = "🥇";
  else if (result.wpm >= 40)                      dom.resultsBadge.textContent = "🥈";
  else                                            dom.resultsBadge.textContent = "🎯";

  // advice
  let advice = "Keep practicing to improve your typing skills!";
  if (result.accuracy < 80)
    advice = "⚠️ Accuracy needs work. Focus on hitting the right keys rather than rushing — slow down and build muscle memory.";
  else if (result.accuracy < 90 && result.wpm > 50)
    advice = "You're fast, but making mistakes. Try to maintain 90%+ accuracy before pushing for more speed.";
  else if (result.accuracy >= 95 && result.wpm < 40)
    advice = "Great accuracy! Now focus on building speed. Try not to look at your hands and aim for smooth, rhythmic keystrokes.";
  else if (result.accuracy >= 95 && result.wpm >= 70)
    advice = "🌟 Excellent performance! You've mastered the balance of speed and accuracy. Keep challenging yourself!";
  else if (result.errors > 10)
    advice = "You're making frequent errors. Slow down, breathe, and focus on accuracy first — speed will follow naturally.";
  else if (result.accuracy >= 90 && result.wpm >= 50)
    advice = "Solid performance! You're in a great zone. Try the Hard difficulty to keep growing.";

  dom.adviceText.textContent = advice;

  dom.resultsPanel.classList.remove("hidden");
  dom.startBtn.classList.add("hidden");

  renderCharts(result);
}

/* ════════════════════════════════════════
   TYPING HANDLER
════════════════════════════════════════ */
dom.typingInput.addEventListener("keydown", (e) => {

  // 🚀 AUTO START when user types
  if (!state.running && !state.finished && !state.countdownRunning) {
  startCountdown();
}

  if (!state.running || state.finished) return;

  // ⬅️ HANDLE BACKSPACE
  if (e.key === "Backspace") {
    e.preventDefault();

    if (state.currentIndex > 0) {
      state.currentIndex--;

      const el = getCharEl(state.currentIndex);
      if (el) el.className = "char";

      const prev = dom.paraDisplay.querySelector(".active");
      if (prev) prev.classList.remove("active");

      if (el) el.classList.add("active");
    }
    return;
  }

  // Ignore special keys
  if (e.key.length !== 1) return;

  const expected = state.paragraph[state.currentIndex];
  const correct  = e.key === expected;

  state.totalTyped++;

  if (!correct) {
    state.errors++;
    sfx.error();
  } else {
    sfx.keyPress();
  }

  const el = getCharEl(state.currentIndex);
  if (el) {
    el.className = "char " + (correct ? "correct" : "error");
  }

  state.currentIndex++;

  // Highlight next character
  const prev = dom.paraDisplay.querySelector(".active");
  if (prev) prev.classList.remove("active");

  const nextEl = getCharEl(state.currentIndex);
  if (nextEl) nextEl.classList.add("active");

  // 📊 Live stats
  const elapsed = (Date.now() - state.startTime) / 1000 || 0.01;
  const wpm = Math.round((state.totalTyped / 5) / (elapsed / 60));
  const accuracy = Math.round(((state.totalTyped - state.errors) / state.totalTyped) * 100);

  dom.liveWpm.textContent = wpm;
  dom.liveAcc.textContent = accuracy + "%";

  // End test if finished paragraph
  if (state.currentIndex >= state.paragraph.length) {
    endTest();
  }
});

// Prevent pasting
dom.typingInput.addEventListener("paste", (e) => e.preventDefault());

/* ════════════════════════════════════════
   CHARTS
════════════════════════════════════════ */
function getChartColors() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    accent:  isDark ? "#63d396" : "#16a34a",
    accent2: isDark ? "#5bc4ff" : "#0284c7",
    accent3: isDark ? "#f5a623" : "#d97706",
    error:   isDark ? "#ff6b6b" : "#dc2626",
    gridLine: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    text:    isDark ? "#6b7280"  : "#9ca3af",
  };
}

function destroyCharts() {
  [chartSession, chartConsistency, chartHistory].forEach(c => { if (c) c.destroy(); });
  chartSession = chartConsistency = chartHistory = null;
}

function renderCharts(result) {
  destroyCharts();
  const C = getChartColors();

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: C.gridLine }, ticks: { color: C.text, font: { family: "'DM Mono', monospace", size: 11 } } },
      y: { grid: { color: C.gridLine }, ticks: { color: C.text, font: { family: "'DM Mono', monospace", size: 11 } } }
    }
  };

  // ── 1. Session breakdown (bar)
  chartSession = new Chart(document.getElementById("session-chart"), {
    type: "bar",
    data: {
      labels: ["WPM", "Accuracy", "Errors"],
      datasets: [{
        data: [result.wpm, result.accuracy, result.errors],
        backgroundColor: [C.accent + "cc", C.accent2 + "cc", C.error + "cc"],
        borderColor:     [C.accent, C.accent2, C.error],
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: { ...baseOptions }
  });

  // ── 2. WPM over time (line)
  const logData = state.wpmLog.length > 0
    ? state.wpmLog
    : [{ sec: 0, wpm: 0 }, { sec: (Date.now() - state.startTime) / 1000, wpm: result.wpm }];

  chartConsistency = new Chart(document.getElementById("consistency-chart"), {
    type: "line",
    data: {
      labels: logData.map(d => d.sec + "s"),
      datasets: [{
        data: logData.map(d => d.wpm),
        borderColor: C.accent2,
        backgroundColor: C.accent2 + "20",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: C.accent2,
      }]
    },
    options: { ...baseOptions }
  });

  // ── 3. History (bar)
  const history = getHistory();
  chartHistory = new Chart(document.getElementById("history-chart"), {
    type: "bar",
    data: {
      labels: history.map((_, i) => "#" + (i + 1)),
      datasets: [{
        data: history,
        backgroundColor: history.map((v, i) => i === history.length - 1 ? C.accent : C.accent + "66"),
        borderColor: C.accent,
        borderWidth: 1,
        borderRadius: 5,
      }]
    },
    options: { ...baseOptions }
  });
}

dom.typingInput.addEventListener("focus", () => {
  if (!state.running && !state.finished && !state.countdownRunning) {
    startCountdown();
  }
});

/* ════════════════════════════════════════
   CHALLENGE SYSTEM
════════════════════════════════════════ */
function getCurrentChallenge() {
  return CHALLENGES[state.challengeIndex % CHALLENGES.length];
}

function renderChallengeBanner() {
  const ch = getCurrentChallenge();
  const progress = getChallengeProgress();
  const count = progress[ch.id] || 0;
  const pct   = Math.min(100, (count / ch.goal) * 100);

  dom.challengeTitle.textContent = ch.title;
  dom.challengeFill.style.width  = pct + "%";
  dom.challengeText.textContent  = count + " / " + ch.goal;
}

function updateChallengeProgress(result) {
  const ch = getCurrentChallenge();
  if (!ch.check(result)) return;

  const progress = getChallengeProgress();
  progress[ch.id] = (progress[ch.id] || 0) + 1;
  saveChallengeProgress(progress);

  renderChallengeBanner();

  if (progress[ch.id] >= ch.goal) {
    showToast("🎉 Challenge Complete!", ch.title);
    // Auto-advance challenge after a moment
    setTimeout(() => {
      state.challengeIndex++;
      lsSet("kf_challenge_idx", state.challengeIndex);
      renderChallengeBanner();
    }, 3000);
  }
}

function showToast(title, sub) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<div class="toast-icon">🏅</div><div><div class="toast-text">${title}</div><div class="toast-sub">${sub}</div></div>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = "opacity 0.4s, transform 0.4s";
    t.style.opacity = "0";
    t.style.transform = "translateX(120%)";
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

/* ════════════════════════════════════════
   THEME & SOUND TOGGLES
════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  lsSet("kf_theme", theme);
  if (theme === "dark") {
    dom.moonIcon.classList.remove("hidden");
    dom.sunIcon.classList.add("hidden");
  } else {
    dom.moonIcon.classList.add("hidden");
    dom.sunIcon.classList.remove("hidden");
  }
}

dom.themeToggle.addEventListener("click", () => {
  const curr = document.documentElement.getAttribute("data-theme");
  applyTheme(curr === "dark" ? "light" : "dark");
});

dom.soundToggle.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  dom.soundOnIcon.classList.toggle("hidden", !state.soundEnabled);
  dom.soundOffIcon.classList.toggle("hidden", state.soundEnabled);
  lsSet("kf_sound", state.soundEnabled);
});

/* ════════════════════════════════════════
   HEADER HIGH SCORE
════════════════════════════════════════ */
function updateHeaderHighscore() {
  const hs = getHighScore();
  dom.hsDisplay.textContent = hs > 0 ? hs : "—";
}

/* ════════════════════════════════════════
   CONTROLS — mode / time / difficulty
════════════════════════════════════════ */
document.querySelectorAll("[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;
    const tg = document.getElementById("time-group");
    tg.style.display = state.mode === "time" ? "" : "none";
    initTest();
  });
});

document.querySelectorAll("[data-time]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-time]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.duration = parseInt(btn.dataset.time);
    initTest();
  });
});

document.querySelectorAll("[data-diff]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-diff]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.difficulty = btn.dataset.diff;
    initTest();
  });
});

/* ════════════════════════════════════════
   BUTTON ACTIONS
════════════════════════════════════════ */
dom.startBtn.addEventListener("click", () => startCountdown());
dom.restartBtn.addEventListener("click", () => initTest());
dom.retryBtn.addEventListener("click", () => initTest());
dom.newParaBtn.addEventListener("click", () => initTest());
dom.newParaResultsBtn.addEventListener("click", () => initTest());
dom.nextChallengeBtn.addEventListener("click", () => {
  state.challengeIndex++;
  lsSet("kf_challenge_idx", state.challengeIndex);
  renderChallengeBanner();
});

/* ════════════════════════════════════════
   UTILS
════════════════════════════════════════ */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ════════════════════════════════════════
   BOOT
════════════════════════════════════════ */
function boot() {
  // Restore prefs
  const savedTheme = lsGet("kf_theme", "dark");
  applyTheme(savedTheme);

  const savedSound = lsGet("kf_sound", true);
  state.soundEnabled = savedSound;
  dom.soundOnIcon.classList.toggle("hidden", !savedSound);
  dom.soundOffIcon.classList.toggle("hidden", savedSound);

  state.challengeIndex = lsGet("kf_challenge_idx", 0);

  updateHeaderHighscore();
  renderChallengeBanner();
  initTest();
}

boot();
