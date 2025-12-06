document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("studentLogin");
  const dashView = document.getElementById("studentDashboard");
  const nameEl = document.getElementById("studentName");
  const loginForm = document.getElementById("studentLoginForm");
  const loginErr = document.getElementById("studentLoginError");
  const logoutBtn = document.getElementById("studentLogoutBtn");

  const countdownEl = document.getElementById("countdown");
  const nextClassLabelEl = document.getElementById("nextClassLabel");
  const profileBox = document.getElementById("profileBox");
  const joinBtn = document.getElementById("joinClassBtn");

  const LS_KEY = "ela_student";
  let countdownInterval = null;
  let currentStudent = null;

  // ===== Notifications =====
  const notifBell = document.getElementById("notifBell");
  const notifPanel = document.getElementById("notifPanel");
  const notifDot = document.getElementById("notifDot");
  const notifClearBtn = document.getElementById("notifClearBtn");
  const notifList = document.getElementById("notifList");

  if (notifBell && notifPanel) {
    notifBell.addEventListener("click", () => {
      const isHidden = notifPanel.hasAttribute("hidden");
      if (isHidden) {
        notifPanel.removeAttribute("hidden");
      } else {
        notifPanel.setAttribute("hidden", "true");
      }
    });
  }

  if (notifClearBtn && notifDot) {
    notifClearBtn.addEventListener("click", () => {
      notifDot.style.display = "none";
    });
  }

  // close notif panel if clicking outside
  document.addEventListener("click", (e) => {
    if (!notifPanel || !notifBell) return;
    if (!notifPanel.contains(e.target) && !notifBell.contains(e.target)) {
      notifPanel.setAttribute("hidden", "true");
    }
  });

  // ===== Initial login vs dashboard state =====
  if (loginView) loginView.style.display = "block";
  if (dashView) dashView.style.display = "none";

  const savedStudent = loadStudentFromStorage();
  if (savedStudent?.fullName) {
    showDashboard(savedStudent);
  } else {
    showLogin();
  }

  // ===== LocalStorage helpers =====
  function loadStudentFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveStudentToStorage(s) {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }

  function clearStudentFromStorage() {
    localStorage.removeItem(LS_KEY);
  }

  // ===== View toggles =====
  function showLogin() {
    if (loginView) loginView.style.display = "block";
    if (dashView) dashView.style.display = "none";

    window.scrollTo({ top: 0, behavior: "instant" });

    // Prefill login form from saved student if available
    const saved = loadStudentFromStorage();
    if (saved) {
      const nameInput = document.getElementById("studentNameInput");
      const phoneInput = document.getElementById("studentPhoneInput");
      if (nameInput && saved.fullName) nameInput.value = saved.fullName;
      if (phoneInput && saved.phone) phoneInput.value = saved.phone;
    }
  }

  function showDashboard(s) {
    currentStudent = s;

    if (nameEl) nameEl.textContent = s.fullName || "Student";
    if (loginView) loginView.style.display = "none";
    if (dashView) dashView.style.display = "grid";

    initViews();
    renderProfile(s);
    renderBadges(s);
    renderTodayTask(s);
    loadSchedule(s);
    loadAttendance(s);
    loadSyllabus(s);
    loadAnnouncements();
  }

  // ===== Login form =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (loginErr) loginErr.textContent = "";

      const fullNameInput = document
        .getElementById("studentNameInput")
        .value.trim();
      const phoneInput = document
        .getElementById("studentPhoneInput")
        .value.trim();

      if (!fullNameInput) {
        if (loginErr) loginErr.textContent = "Please enter your name.";
        return;
      }

      try {
        const students = await fetchJson("/api/students");

        const student = students.find(
          (st) =>
            (st.fullName || "").trim().toLowerCase() ===
            fullNameInput.toLowerCase()
        );

        if (!student) {
          if (loginErr) {
            loginErr.textContent =
              "We couldn't find your name in the system. Please go back to the main website and book your free assessment.";
          }
          return;
        }

        const s = {
          ...student,
          phone: student.whatsapp || phoneInput || "",
          joinedAt: student.joinedAt || new Date().toISOString(),
        };

        saveStudentToStorage(s);
        showDashboard(s);
      } catch (err) {
        console.error("Error during login:", err);
        if (loginErr) {
          loginErr.textContent =
            "Could not check your account. Please try again.";
        }
      }
    });
  }

  // ===== Logout =====
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearStudentFromStorage();
      clearCountdown();
      if (countdownEl) countdownEl.textContent = "Loading…";
      if (nextClassLabelEl) nextClassLabelEl.textContent = "";
      if (joinBtn) {
        joinBtn.disabled = true;
        joinBtn.classList.add("disabled");
        joinBtn.onclick = null;
      }
      showLogin();
    });
  }

  // ===== Sidebar + mobile nav =====
  function initViews() {
    const links = document.querySelectorAll(".dash-link");
    const views = document.querySelectorAll(".dash-main .view");
    const mobileTabs = document.querySelectorAll(".mobile-tab");

    function activateView(viewName) {
      const id = "view-" + viewName;

      views.forEach((v) => v.classList.toggle("active", v.id === id));
      links.forEach((b) =>
        b.classList.toggle("active", b.dataset.view === viewName)
      );
      mobileTabs.forEach((t) =>
        t.classList.toggle("active", t.dataset.view === viewName)
      );
    }

    links.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        activateView(view);
      });
    });

    mobileTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const view = tab.dataset.view;
        activateView(view);
      });
    });

    activateView("home");
  }

  // ===== Profile box =====
  function renderProfile(s) {
    if (!profileBox) return;

    const joined = s.joinedAt
      ? new Date(s.joinedAt).toLocaleString()
      : "Unknown";

    const courses = Array.isArray(s.courses) ? s.courses : [];

    profileBox.innerHTML = `
      <div><strong>Name:</strong> ${escapeHtml(s.fullName)}</div>
      ${
        s.phone
          ? `<div><strong>WhatsApp:</strong> ${escapeHtml(s.phone)}</div>`
          : ""
      }
      <div><strong>Joined:</strong> ${escapeHtml(joined)}</div>
      <div style="margin-top:.6rem;"><strong>Enrolled courses:</strong></div>
      ${
        courses.length
          ? `<ul class="profile-course-list">
               ${courses
                 .map(
                   (c) =>
                     `<li>${escapeHtml(
                       c.courseName || c.courseId || "Course"
                     )}</li>`
                 )
                 .join("")}
             </ul>`
          : `<div class="muted" style="font-size:.85rem;">No courses stored yet. Admin can attach you later insha’Allah.</div>`
      }
      <div class="muted" style="margin-top:.7rem">
        Your real courses, attendance, and syllabus are linked to your profile insha’Allah.
      </div>
    `;
  }

  // ===== Badges =====
  function renderBadges(student) {
    const row = document.getElementById("badgeRow");
    if (!row) return;

    const badges = [];

    const coursesCount = Array.isArray(student.courses)
      ? student.courses.length
      : 0;
    if (coursesCount >= 2) {
      badges.push("Multi-course learner ⭐");
    } else if (coursesCount === 1) {
      badges.push("Focused learner 🎯");
    }

    badges.push("Qur’an journey in progress 🌙");

    row.innerHTML =
      badges
        .map(
          (text, idx) =>
            `<span class="badge-pill ${
              idx === 0 ? "badge-primary" : "badge-soft"
            }">${escapeHtml(text)}</span>`
        )
        .join("") || row.innerHTML;
  }

  // ===== Today’s Task =====
  function renderTodayTask(student) {
    const mainEl = document.getElementById("todayTaskMain");
    const subEl = document.getElementById("todayTaskSub");
    if (!mainEl || !subEl) return;

    const firstCourse =
      Array.isArray(student.courses) && student.courses[0]
        ? student.courses[0]
        : null;

    if (!firstCourse) {
      mainEl.textContent =
        "Review any pages you recited in your last class.";
      subEl.textContent =
        "If you keep revising, Allah will make the recitation firm in your heart insha’Allah.";
      return;
    }

    const courseName =
      firstCourse.courseName || firstCourse.courseId || "your class";

    mainEl.textContent = `Spend 10–15 minutes revising today’s portion for ${courseName}.`;
    subEl.textContent =
      "Read slowly, focus on your tajwīd, and repeat difficult ayāt 5 times.";
  }

  // ===== Fetch helper =====
  function fetchJson(url) {
    return fetch(url).then((r) => {
      if (!r.ok) throw new Error("Failed to fetch " + url);
      return r.json();
    });
  }

  // ===== Schedule / Next Class / Join button =====
  async function loadSchedule(student) {
    if (!student) return;

    if (countdownEl) countdownEl.textContent = "Loading…";
    if (nextClassLabelEl) nextClassLabelEl.textContent = "";
    if (joinBtn) {
      joinBtn.disabled = true;
      joinBtn.classList.add("disabled");
      joinBtn.onclick = null;
    }

    try {
      const slots = await fetchJson("/api/class-slots");
      const nextClass = findNextClassForStudent(student, slots);

      if (!nextClass) {
        if (countdownEl) countdownEl.textContent = "No upcoming class scheduled.";
        if (nextClassLabelEl) {
          nextClassLabelEl.textContent =
            "You are enrolled, but there is no class time set yet.";
        }
        return;
      }

      if (nextClassLabelEl) {
        nextClassLabelEl.textContent = `${nextClass.courseName} • ${nextClass.slotName} • ${nextClass.prettyTime}`;
      }

      if (joinBtn) {
        if (nextClass.meetLink) {
          joinBtn.disabled = false;
          joinBtn.classList.remove("disabled");
          joinBtn.onclick = () => {
            window.open(nextClass.meetLink, "_blank", "noopener");
          };
        } else {
          joinBtn.disabled = true;
          joinBtn.classList.add("disabled");
          joinBtn.onclick = null;
        }
      }

      startCountdown(nextClass.date);
    } catch (err) {
      console.error("Error loading schedule:", err);
      if (countdownEl) countdownEl.textContent = "Could not load schedule.";
    }
  }

  function findNextClassForStudent(student, slots) {
    if (!student || !Array.isArray(student.courses) || !slots?.length)
      return null;

    const now = new Date();
    let best = null;

    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    student.courses.forEach((course) => {
      const slot = slots.find((s) => s.id === course.slotId);
      if (!slot) return;

      const startParts = (slot.startTime || "00:00").split(":");
      const startHour = parseInt(startParts[0], 10) || 0;
      const startMin = parseInt(startParts[1], 10) || 0;

      (slot.days || []).forEach((dayName) => {
        const targetDow = dayMap[dayName];
        if (targetDow === undefined) return;

        const candidate = new Date();
        const currentDow = candidate.getDay();
        let diffDays = (targetDow - currentDow + 7) % 7;

        candidate.setHours(startHour, startMin, 0, 0);
        if (diffDays === 0 && candidate <= now) {
          diffDays = 7;
        }
        candidate.setDate(candidate.getDate() + diffDays);

        if (candidate <= now) return;

        if (!best || candidate < best.date) {
          best = {
            date: candidate,
            courseId: course.courseId,
            courseName: course.courseName || course.courseId,
            slotName: slot.name,
            meetLink: slot.meetLink,
            prettyTime: `${dayName} at ${slot.startTime} (${slot.timezone || "local time"})`,
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
      const now = Date.now();
      let diff = target - now;
      if (diff <= 0) {
        countdownEl.textContent = "Class time!";
        clearCountdown();
        return;
      }

      const h = Math.floor(diff / 3_600_000);
      diff %= 3_600_000;
      const m = Math.floor(diff / 60_000);
      diff %= 60_000;
      const s = Math.floor(diff / 1000);

      countdownEl.textContent = `${String(h).padStart(2, "0")}h : ${String(
        m
      ).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`;
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function clearCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  // ===== Attendance (real streak) =====
  async function loadAttendance(student) {
    const streakEl = document.querySelector(".streak-number");
    if (!student || student.id == null || !streakEl) return;

    try {
      const records = await fetchJson(
        `/api/attendance?studentId=${encodeURIComponent(student.id)}`
      );

      if (!Array.isArray(records) || records.length === 0) {
        streakEl.textContent = "0";
        return;
      }

      const sorted = records
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      let streak = 0;
      for (const rec of sorted) {
        if (rec.status === "present") {
          streak += 1;
        } else {
          break;
        }
      }

      streakEl.textContent = String(streak);
    } catch (err) {
      console.error("Error loading attendance:", err);
    }
  }

  // ===== Syllabus (real data) =====
  async function loadSyllabus(student) {
    const container = document.querySelector("#view-syllabus .syllabus-box");
    if (!student || !container) return;

    const courses = Array.isArray(student.courses) ? student.courses : [];
    if (!courses.length) {
      container.innerHTML = `
        <p class="muted">
          No courses are attached to your profile yet. Please contact admin.
        </p>
      `;
      return;
    }

    const uniqueCourseIds = [...new Set(courses.map((c) => c.courseId))].filter(
      Boolean
    );

    try {
      const all = [];

      for (const courseId of uniqueCourseIds) {
        const items = await fetchJson(
          `/api/syllabus?courseId=${encodeURIComponent(courseId)}`
        );
        (items || []).forEach((s) => {
          all.push({ courseId, ...s });
        });
      }

      renderSyllabus(all, student);
    } catch (err) {
      console.error("Error loading syllabus:", err);
    }
  }

  function renderSyllabus(syllList, student) {
    const container = document.querySelector("#view-syllabus .syllabus-box");
    if (!container) return;

    if (!Array.isArray(syllList) || !syllList.length) {
      container.innerHTML = `
        <p class="muted">
          Your syllabus hasn’t been attached yet. Admin will add it soon insha’Allah.
        </p>
      `;
      return;
    }

    const courseLabelById = {};
    (student.courses || []).forEach((c) => {
      courseLabelById[c.courseId] = c.courseName || c.courseId;
    });

    container.innerHTML = syllList
      .map((s) => {
        const courseLabel =
          courseLabelById[s.courseId] || s.title || s.courseId;
        const units = Array.isArray(s.units) ? s.units : [];

        const unitsHtml = units
          .map(
            (u) => `
          <li class="syll-unit">
            <div class="syll-unit-main">
              <div class="syll-unit-title">${escapeHtml(u.title || "")}</div>
              ${
                u.description
                  ? `<div class="syll-unit-desc">${escapeHtml(
                      u.description
                    )}</div>`
                  : ""
              }
            </div>
            ${
              u.resourceUrl
                ? `<a class="syll-unit-link" href="${escapeHtml(
                    u.resourceUrl
                  )}" target="_blank" rel="noopener">Open PDF</a>`
                : ""
            }
          </li>
        `
          )
          .join("");

        return `
        <div class="syll-course-block">
          <h3 class="syll-course-title">${escapeHtml(courseLabel)}</h3>
          ${
            unitsHtml
              ? `<ul class="syll-unit-list">${unitsHtml}</ul>`
              : `<p class="muted">No units added yet.</p>`
          }
        </div>
      `;
      })
      .join("");
  }

  // ===== Announcements → notifications bell =====
  async function loadAnnouncements() {
    if (!notifList) return;

    try {
      const anns = await fetchJson("/api/announcements");

      if (!Array.isArray(anns) || !anns.length) {
        notifList.innerHTML = `<li class="muted">No announcements right now.</li>`;
        if (notifDot) notifDot.style.display = "none";
        return;
      }

      const latest = anns.slice(0, 5);

      notifList.innerHTML = latest
        .map(
          (a) => `
        <li>
          <strong>${escapeHtml(a.title || "")}</strong><br>
          <span class="muted">${escapeHtml(a.message || "")}</span>
        </li>
      `
        )
        .join("");

      if (notifDot) notifDot.style.display = "inline-block";
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  }

  // ===== Utility: escape HTML =====
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});
