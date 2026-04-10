document.addEventListener("DOMContentLoaded", () => {

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
    if (greetNameEl) greetNameEl.textContent = firstName + "! 🌙";
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
        if (responseTextEl) responseTextEl.textContent = "Bismillah, let's go! 🚀";
        if (responseStep) responseStep.classList.remove("hidden");
        setTimeout(() => closeWelcomeAndEnter(student), 1700);
      };
    }

    // No
    if (noBtn) {
      noBtn.onclick = () => {
        if (readyStep)    readyStep.classList.add("hidden");
        if (responseTextEl) responseTextEl.textContent = "Hmm, Ustaz is waiting tho 😅";
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

    if (count >= 2)     badges.push({ label: "Multi-course learner ⭐", cls: "badge-gold" });
    else if (count === 1) badges.push({ label: "Focused learner 🎯",    cls: "badge-gold" });

    badges.push({ label: "Qur'an journey 🌙", cls: "badge-soft" });

    row.innerHTML = badges.map(b => `<span class="badge ${b.cls}">${escapeHtml(b.label)}</span>`).join("");
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
        countdownEl.textContent = "Class time! 🟢";
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
