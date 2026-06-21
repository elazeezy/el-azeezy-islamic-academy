// ===== Inline Lucide icons (no CDN — self-contained, no network dependency) =====
const ICON_PATHS = {
  bell:            '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  home:            '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  "calendar-days": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  "check-circle":  '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "book-open":     '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  user:            '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  "log-out":       '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
  "arrow-right":   '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-left":    '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "moon-star":     '<path d="M18 5h4"/><path d="M20 3v4"/><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  globe:           '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  target:          '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  mic:             '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  lightbulb:       '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  hand:            '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  flame:           '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  sprout:          '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/><path d="M5 21h14"/>',
  sparkles:        '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  rocket:          '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
  clock:           '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  "play-circle":   '<path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"/><circle cx="12" cy="12" r="10"/>',
  star:            '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  lock:            '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};

function icon(name, extraClass) {
  const d = ICON_PATHS[name];
  if (!d) return "";
  return `<svg class="ic${extraClass ? " " + extraClass : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

function renderIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass);
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // Convert every static data-icon placeholder in the markup into a real SVG icon
  renderIcons(document);

  // ===== Element refs =====
  const loginView    = document.getElementById("studentLogin");
  const dashView     = document.getElementById("studentDashboard");
  const nameEl       = document.getElementById("studentName");
  const loginForm    = document.getElementById("studentLoginForm");
  const loginErr     = document.getElementById("studentLoginError");
  const logoutBtn    = document.getElementById("studentLogoutBtn");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

  // Welcome overlay
  const welcomeOverlay = document.getElementById("welcomeOverlay");
  const greetNameEl    = document.getElementById("greetName");
  const greetDateEl    = document.getElementById("greetDate");
  const greetStep      = document.getElementById("greetStep");
  const readyStep      = document.getElementById("readyStep");
  const responseStep   = document.getElementById("responseStep");
  const yesBtn         = document.getElementById("yesBtn");
  const noBtn          = document.getElementById("noBtn");
  const responseTextEl = document.getElementById("responseText");
  const continueDashBtn = document.getElementById("continueDashBtn");

  // Dashboard UI
  const countdownEl     = document.getElementById("countdown");
  const nextClassLabelEl = document.getElementById("nextClassLabel");
  const profileBox      = document.getElementById("profileBox");
  const joinBtn         = document.getElementById("joinClassBtn");
  const sidebarAvatar   = document.getElementById("sidebarAvatar");
  const sidebarDate     = document.getElementById("sidebarDate");
  const homeGreeting    = document.getElementById("homeGreeting");
  const homeDateEl      = document.getElementById("homeDate");

  // Notifications
  const notifBell    = document.getElementById("notifBell");
  const notifPanel   = document.getElementById("notifPanel");
  const notifDot     = document.getElementById("notifDot");
  const notifClearBtn = document.getElementById("notifClearBtn");
  const notifList    = document.getElementById("notifList");

  const LS_KEY = "ela_student";
  let countdownInterval = null;

  // ===== Notification bell =====
  if (notifBell && notifPanel) {
    notifBell.addEventListener("click", (e) => {
      e.stopPropagation();
      notifPanel.hidden ? notifPanel.removeAttribute("hidden") : notifPanel.setAttribute("hidden", "");
    });
  }

  if (notifClearBtn && notifDot) {
    notifClearBtn.addEventListener("click", () => {
      notifDot.style.display = "none";
    });
  }

  document.addEventListener("click", (e) => {
    if (!notifPanel || !notifBell) return;
    if (!notifPanel.contains(e.target) && !notifBell.contains(e.target)) {
      notifPanel.setAttribute("hidden", "");
    }
  });

  // ===== Date helpers =====
  function formatDate() {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  // ===== Storage =====
  function loadStudentFromStorage() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); }
    catch { return null; }
  }

  function saveStudentToStorage(s) {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }

  function clearStudentFromStorage() {
    localStorage.removeItem(LS_KEY);
  }

  // ===== Boot =====
  if (loginView) loginView.style.display = "block";
  if (dashView)  dashView.style.display  = "none";

  const savedStudent = loadStudentFromStorage();
  if (savedStudent?.fullName) {
    showDashboard(savedStudent); // no welcome overlay on page-restore
  } else {
    showLogin();
  }

  // ===== Login =====
  function showLogin() {
    if (loginView) loginView.style.display = "block";
    if (dashView)  dashView.style.display  = "none";
    window.scrollTo({ top: 0, behavior: "instant" });

    const saved = loadStudentFromStorage();
    if (saved) {
      const ni = document.getElementById("studentNameInput");
      const pi = document.getElementById("studentPhoneInput");
      if (ni && saved.fullName) ni.value = saved.fullName;
      if (pi && saved.phone)    pi.value = saved.phone;
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (loginErr) loginErr.textContent = "";

      const fullNameInput = document.getElementById("studentNameInput").value.trim();
      const phoneInput    = document.getElementById("studentPhoneInput").value.trim();
      const pinEl         = document.getElementById("studentPinInput");
      const pinInput      = pinEl ? pinEl.value.trim() : "";

      if (!fullNameInput) {
        if (loginErr) loginErr.textContent = "Please enter your name.";
        return;
      }

      try {
        const students = await fetchJson("/api/students");
        const student  = students.find(
          (st) => (st.fullName || "").trim().toLowerCase() === fullNameInput.toLowerCase()
        );

        if (!student) {
          if (loginErr) {
            loginErr.textContent =
              "We couldn't find your name. Please book your free assessment on the main website first.";
          }
          return;
        }

        // PIN is optional — only checked if the student has one set AND they typed one in.
        if (student.pin && pinInput && pinInput !== student.pin) {
          if (loginErr) loginErr.textContent = "That PIN doesn't look right. Leave it blank if you're not sure.";
          return;
        }

        const s = {
          ...student,
          phone: student.whatsapp || phoneInput || "",
          joinedAt: student.joinedAt || new Date().toISOString(),
        };

        saveStudentToStorage(s);

        // Hide login, show welcome overlay
        if (loginView) loginView.style.display = "none";
        showWelcome(s);

      } catch (err) {
        console.error("Login error:", err);
        if (loginErr) loginErr.textContent = "Could not check your account. Please try again.";
      }
    });
  }

  // ===== Welcome Overlay =====
  function showWelcome(student) {
    const firstName = (student.fullName || "Student").split(" ")[0];

    // Populate
    if (greetNameEl) greetNameEl.innerHTML = escapeHtml(firstName) + "! " + icon("moon-star", "ic-inline ic-gold");
    if (greetDateEl) greetDateEl.textContent  = formatDate();

    // Reset steps
    if (greetStep)    { greetStep.classList.remove("hidden");    greetStep.style.opacity = ""; }
    if (readyStep)    readyStep.classList.add("hidden");
    if (responseStep) responseStep.classList.add("hidden");

    // Show overlay
    if (welcomeOverlay) welcomeOverlay.classList.remove("hidden");

    // After 1.8s → transition to ready question
    setTimeout(() => {
      if (!greetStep) return;
      greetStep.style.transition = "opacity .3s ease";
      greetStep.style.opacity = "0";
      setTimeout(() => {
        greetStep.classList.add("hidden");
        greetStep.style.opacity = "";
        greetStep.style.transition = "";
        if (readyStep) readyStep.classList.remove("hidden");
      }, 320);
    }, 1800);

    // Yes
    if (yesBtn) {
      yesBtn.onclick = () => {
        if (readyStep)    readyStep.classList.add("hidden");
        if (responseTextEl) responseTextEl.innerHTML = "Bismillah, let's go! " + icon("rocket", "ic-inline ic-gold");
        if (responseStep) responseStep.classList.remove("hidden");
        setTimeout(() => closeWelcomeAndEnter(student), 1700);
      };
    }

    // No
    if (noBtn) {
      noBtn.onclick = () => {
        if (readyStep)    readyStep.classList.add("hidden");
        if (responseTextEl) responseTextEl.innerHTML = "Hmm, Ustaz is waiting tho " + icon("clock", "ic-inline ic-gold");
        if (responseStep) responseStep.classList.remove("hidden");
        setTimeout(() => closeWelcomeAndEnter(student), 2000);
      };
    }

    // Continue button
    if (continueDashBtn) {
      continueDashBtn.onclick = () => closeWelcomeAndEnter(student);
    }
  }

  function closeWelcomeAndEnter(student) {
    if (welcomeOverlay) {
      welcomeOverlay.style.transition = "opacity .4s ease";
      welcomeOverlay.style.opacity = "0";
      setTimeout(() => {
        welcomeOverlay.classList.add("hidden");
        welcomeOverlay.style.opacity = "";
        welcomeOverlay.style.transition = "";
        showDashboard(student);
      }, 410);
    } else {
      showDashboard(student);
    }
  }

  // ===== Dashboard =====
  function showDashboard(s) {

    if (loginView) loginView.style.display = "none";
    if (dashView)  dashView.style.display  = "grid";

    // Sidebar
    if (nameEl) nameEl.textContent = s.fullName || "Student";
    if (sidebarAvatar && s.fullName) sidebarAvatar.textContent = s.fullName.charAt(0).toUpperCase();
    if (sidebarDate) sidebarDate.textContent = formatDate();

    // Home greeting
    const firstName = (s.fullName || "Student").split(" ")[0];
    if (homeGreeting) homeGreeting.textContent = getGreeting() + ", " + firstName + "!";
    if (homeDateEl)   homeDateEl.textContent   = formatDate();

    initViews();
    renderProfile(s);
    renderBadges(s);
    renderTodayTask(s);
    loadSchedule(s);
    loadAttendance(s);
    loadSyllabus(s);
    loadAnnouncements();
  }

  // ===== Logout =====
  function doLogout() {
    clearStudentFromStorage();
    clearCountdown();
    currentStudent = null;
    if (countdownEl)      countdownEl.textContent = "Loading…";
    if (nextClassLabelEl) nextClassLabelEl.textContent = "";
    if (joinBtn) {
      joinBtn.disabled = true;
      joinBtn.onclick  = null;
    }
    showLogin();
  }

  if (logoutBtn)       logoutBtn.addEventListener("click", doLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", doLogout);

  // ===== Views (sidebar nav + mobile tabs) =====
  function initViews() {
    const links      = document.querySelectorAll(".dash-link");
    const views      = document.querySelectorAll(".dash-main .view");
    const mobileTabs = document.querySelectorAll(".mobile-tab");

    function activateView(viewName) {
      const id = "view-" + viewName;
      views.forEach((v) => v.classList.toggle("active", v.id === id));
      links.forEach((b) => b.classList.toggle("active", b.dataset.view === viewName));
      mobileTabs.forEach((t) => t.classList.toggle("active", t.dataset.view === viewName));
    }

    links.forEach((btn) => btn.addEventListener("click", () => activateView(btn.dataset.view)));
    mobileTabs.forEach((tab) => tab.addEventListener("click", () => activateView(tab.dataset.view)));

    activateView("home");
  }

  // ===== Profile =====
  function renderProfile(s) {
    if (!profileBox) return;

    const joined  = s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Unknown";
    const courses = Array.isArray(s.courses) ? s.courses : [];

    profileBox.innerHTML = `
      <div><strong>Name:</strong> ${escapeHtml(s.fullName)}</div>
      ${s.phone ? `<div><strong>WhatsApp:</strong> ${escapeHtml(s.phone)}</div>` : ""}
      <div><strong>Joined:</strong> ${escapeHtml(joined)}</div>
      <div style="margin-top:.6rem;"><strong>Enrolled courses:</strong></div>
      ${courses.length
        ? `<ul class="profile-course-list">${courses.map(c => `<li>${escapeHtml(c.courseName || c.courseId || "Course")}</li>`).join("")}</ul>`
        : `<p class="muted" style="margin-top:.35rem;">No courses stored yet. Admin will attach them insha'Allah.</p>`
      }
    `;
  }

  // ===== Badges =====
  function renderBadges(student) {
    const row = document.getElementById("badgeRow");
    if (!row) return;

    const badges = [];
    const count  = Array.isArray(student.courses) ? student.courses.length : 0;

    if (count >= 2)     badges.push({ label: "Multi-course learner", iconName: "star",   cls: "badge-gold" });
    else if (count === 1) badges.push({ label: "Focused learner",    iconName: "target", cls: "badge-gold" });

    badges.push({ label: "Qur'an journey", iconName: "moon-star", cls: "badge-soft" });

    row.innerHTML = badges.map(b =>
      `<span class="badge ${b.cls}">${icon(b.iconName, "ic-inline")} ${escapeHtml(b.label)}</span>`
    ).join("");
  }

  // ===== Today's task =====
  function renderTodayTask(student) {
    const mainEl = document.getElementById("todayTaskMain");
    const subEl  = document.getElementById("todayTaskSub");
    if (!mainEl || !subEl) return;

    const firstCourse = Array.isArray(student.courses) && student.courses[0] ? student.courses[0] : null;

    if (!firstCourse) {
      mainEl.textContent = "Review any pages you recited in your last class.";
      subEl.textContent  = "Even 10 focused minutes is powerful.";
      return;
    }

    const name = firstCourse.courseName || firstCourse.courseId || "your class";
    mainEl.textContent = `Spend 10–15 min revising today's portion for ${name}.`;
    subEl.textContent  = "Read slowly, focus on tajwīd, repeat difficult āyāt 5×.";
  }

  // ===== Fetch helper =====
  function fetchJson(url) {
    return fetch(url).then((r) => {
      if (!r.ok) throw new Error("Failed: " + url);
      return r.json();
    });
  }

  // ===== Schedule / countdown / join =====
  async function loadSchedule(student) {
    if (!student) return;
    if (countdownEl)      countdownEl.textContent = "Loading…";
    if (nextClassLabelEl) nextClassLabelEl.textContent = "";
    if (joinBtn) { joinBtn.disabled = true; joinBtn.onclick = null; }

    try {
      const slots     = await fetchJson("/api/class-slots");
      const nextClass = findNextClassForStudent(student, slots);

      if (!nextClass) {
        if (countdownEl)      countdownEl.textContent = "No class scheduled";
        if (nextClassLabelEl) nextClassLabelEl.textContent = "Contact admin to set up your slots.";
        return;
      }

      if (nextClassLabelEl) {
        nextClassLabelEl.textContent =
          `${nextClass.courseName} · ${nextClass.slotName} · ${nextClass.prettyTime}`;
      }

      if (joinBtn && nextClass.meetLink) {
        joinBtn.disabled = false;
        joinBtn.onclick  = () => window.open(nextClass.meetLink, "_blank", "noopener");
      }

      startCountdown(nextClass.date);
    } catch (err) {
      console.error("Schedule error:", err);
      if (countdownEl) countdownEl.textContent = "Could not load";
    }
  }

  function findNextClassForStudent(student, slots) {
    if (!student || !Array.isArray(student.courses) || !slots?.length) return null;

    const dayMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const now    = new Date();
    let best     = null;

    student.courses.forEach((course) => {
      const slot = slots.find((s) => s.id === course.slotId);
      if (!slot) return;

      const [sh, sm] = (slot.startTime || "00:00").split(":").map(Number);

      (slot.days || []).forEach((dayName) => {
        const targetDow = dayMap[dayName];
        if (targetDow === undefined) return;

        const candidate  = new Date();
        const currentDow = candidate.getDay();
        let diff         = (targetDow - currentDow + 7) % 7;

        candidate.setHours(sh, sm, 0, 0);
        if (diff === 0 && candidate <= now) diff = 7;
        candidate.setDate(candidate.getDate() + diff);

        if (candidate <= now) return;

        if (!best || candidate < best.date) {
          best = {
            date:       candidate,
            courseId:   course.courseId,
            courseName: course.courseName || course.courseId,
            slotName:   slot.name,
            meetLink:   slot.meetLink,
            prettyTime: `${dayName} at ${slot.startTime} (${slot.timezone || "UTC"})`,
          };
        }
      });
    });

    return best;
  }

  function startCountdown(targetDate) {
    clearCountdown();
    if (!countdownEl || !targetDate) return;

    const target = targetDate.getTime();

    function tick() {
      let diff = target - Date.now();
      if (diff <= 0) {
        countdownEl.innerHTML = "Class time! " + icon("play-circle", "ic-inline ic-gold");
        clearCountdown();
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      diff %= 3_600_000;
      const m = Math.floor(diff / 60_000);
      diff %= 60_000;
      const s = Math.floor(diff / 1000);
      countdownEl.textContent =
        `${String(h).padStart(2,"0")}h : ${String(m).padStart(2,"0")}m : ${String(s).padStart(2,"0")}s`;
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function clearCountdown() {
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  }

  // ===== Attendance =====
  async function loadAttendance(student) {
    const streakEls = document.querySelectorAll(".streak-number");
    if (!student || student.id == null || !streakEls.length) return;

    try {
      const records = await fetchJson(`/api/attendance?studentId=${encodeURIComponent(student.id)}`);

      if (!Array.isArray(records) || !records.length) {
        streakEls.forEach(el => (el.textContent = "0"));
        return;
      }

      const sorted = records.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      let streak = 0;
      for (const rec of sorted) {
        if (rec.status === "present") streak++;
        else break;
      }

      streakEls.forEach(el => (el.textContent = String(streak)));
    } catch (err) {
      console.error("Attendance error:", err);
    }
  }

  // ===== Syllabus =====
  async function loadSyllabus(student) {
    const container = document.querySelector("#view-syllabus .syllabus-box");
    if (!student || !container) return;

    const courses = Array.isArray(student.courses) ? student.courses : [];
    if (!courses.length) {
      container.innerHTML = `<p class="muted">No courses attached yet. Admin will add them insha'Allah.</p>`;
      return;
    }

    const uniqueIds = [...new Set(courses.map(c => c.courseId).filter(Boolean))];

    try {
      const all = [];
      for (const courseId of uniqueIds) {
        const items = await fetchJson(`/api/syllabus?courseId=${encodeURIComponent(courseId)}`);
        (items || []).forEach(s => all.push({ courseId, ...s }));
      }
      renderSyllabus(all, student);
    } catch (err) {
      console.error("Syllabus error:", err);
    }
  }

  async function renderSyllabus(syllList, student) {
    const container = document.querySelector("#view-syllabus .syllabus-box");
    if (!container) return;

    if (!syllList.length) {
      container.innerHTML = `<p class="muted">Your syllabus hasn't been set up yet. Admin will add it soon insha'Allah.</p>`;
      return;
    }

    const labelById = {};
    (student.courses || []).forEach(c => { labelById[c.courseId] = c.courseName || c.courseId; });

    container.innerHTML = syllList.map(s => {
      const label = labelById[s.courseId] || s.title || s.courseId;
      const units = Array.isArray(s.units) ? s.units : [];
      const unitsHtml = units.map(u => `
        <li class="syll-unit">
          <div class="syll-unit-main">
            <div class="syll-unit-title">${escapeHtml(u.title || "")}</div>
            ${u.description ? `<div class="syll-unit-desc">${escapeHtml(u.description)}</div>` : ""}
          </div>
          ${u.resourceUrl ? `<a class="syll-unit-link" href="${escapeHtml(u.resourceUrl)}" target="_blank" rel="noopener">Open PDF</a>` : ""}
        </li>
      `).join("");

      return `
        <div class="syll-course-block">
          <h3 class="syll-course-title">${escapeHtml(label)}</h3>
          ${unitsHtml ? `<ul class="syll-unit-list">${unitsHtml}</ul>` : `<p class="muted">No units added yet.</p>`}
        </div>
      `;
    }).join("");
  }

  // ===== Announcements → notification bell =====
  async function loadAnnouncements() {
    if (!notifList) return;

    try {
      const anns = await fetchJson("/api/announcements");

      if (!Array.isArray(anns) || !anns.length) {
        notifList.innerHTML = `<li class="muted">No announcements right now.</li>`;
        if (notifDot) notifDot.style.display = "none";
        return;
      }

      notifList.innerHTML = anns.slice(0, 5).map(a => `
        <li>
          <strong>${escapeHtml(a.title || "")}</strong>
          <span class="muted">${escapeHtml(a.message || "")}</span>
        </li>
      `).join("");

      if (notifDot) notifDot.style.display = "inline-block";
    } catch (err) {
      console.error("Announcements error:", err);
    }
  }

  // ===== Utility =====
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&",  "&amp;")
      .replaceAll("<",  "&lt;")
      .replaceAll(">",  "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

});
