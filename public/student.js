document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("studentLogin");
  const dashView  = document.getElementById("studentDashboard");
  const nameEl    = document.getElementById("studentName");
  const loginForm = document.getElementById("studentLoginForm");
  const loginErr  = document.getElementById("studentLoginError");
  const logoutBtn = document.getElementById("studentLogoutBtn");

  // ===== Notifications =====
  const notifBell = document.getElementById("notifBell");
  const notifPanel = document.getElementById("notifPanel");
  const notifDot = document.getElementById("notifDot");
  const notifClearBtn = document.getElementById("notifClearBtn");

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
    if (
      !notifPanel.contains(e.target) &&
      !notifBell.contains(e.target)
    ) {
      notifPanel.setAttribute("hidden", "true");
    }
  });


    // Initial state: show login, hide dashboard.
  // We will override this below if a saved student exists.
  if (loginView) loginView.style.display = "block";
  if (dashView) dashView.style.display = "none";


  const countdownEl = document.getElementById("countdown");
  const nextClassLabelEl = document.getElementById("nextClassLabel");
  const profileBox = document.getElementById("profileBox");

  const LS_KEY = "ela_student";
  let countdownInterval = null;

  // Load local "logged in" student
  const savedStudent = loadStudentFromStorage();
  if (savedStudent?.fullName) {
    showDashboard(savedStudent);
    loadSchedule(savedStudent.fullName);
  } else {
    showLogin();
  }

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
   function showLogin() {
    if (loginView) {
      loginView.style.display = "block";
    }
    if (dashView) {
      dashView.style.display = "none";
    }
  // Always scroll to the top so dashboard never shows behind
  window.scrollTo({ top: 0, behavior: "instant" });


    // If we have a saved student, pre-fill the fields
    const saved = loadStudentFromStorage();
    if (saved) {
      const nameInput = document.getElementById("studentNameInput");
      const phoneInput = document.getElementById("studentPhoneInput");
      if (nameInput && saved.fullName) nameInput.value = saved.fullName;
      if (phoneInput && saved.phone) phoneInput.value = saved.phone;
    }
  }

  
function showDashboard(s) {
    if (nameEl) nameEl.textContent = s.fullName || "Student";
    if (loginView) {
      loginView.style.display = "none";
    }
    if (dashView) {
      dashView.style.display = "grid";
    }
  initViews();
  renderProfile(s);

      renderProfile(s);
    renderBadges(s);
    renderTodayTask(s);

}
  // Handle login form
    if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (loginErr) loginErr.textContent = "";

      const fullName = document.getElementById("studentNameInput").value.trim();
      const phone    = document.getElementById("studentPhoneInput").value.trim();

      if (!fullName) {
        if (loginErr) loginErr.textContent = "Please enter your name.";
        return;
      }

      try {
        // Get list of students from the server
        const students = await fetchJson("/api/students");

        // Find a student with matching full name (case-insensitive)
        const student = students.find(
          (st) =>
            st.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
        );

        if (!student) {
          if (loginErr) {
            loginErr.textContent =
              "We couldn't find your name in the system. Please go back to the main website and book your free assessment.";
          }
          return;
        }

        // Build the student object we keep on the frontend
        const s = {
          ...student,
          phone: student.whatsapp || phone || "",
          joinedAt: new Date().toISOString(),
        };

        saveStudentToStorage(s);
        showDashboard(s);
        loadSchedule(s.fullName);
      } catch (err) {
        console.error("Error during login:", err);
        if (loginErr) {
          loginErr.textContent = "Could not check your account. Please try again.";
        }
      }
    });
  }


  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearStudentFromStorage();
      clearCountdown();
      if (countdownEl) countdownEl.textContent = "Loading…";
      if (nextClassLabelEl) nextClassLabelEl.textContent = "";
      showLogin();
    });
  }

  // Sidebar navigation
    function initViews() {
    const links = document.querySelectorAll(".dash-link");
    const views = document.querySelectorAll(".dash-main .view");
    const mobileTabs = document.querySelectorAll(".mobile-tab");

    function activateView(viewName) {
      const id = "view-" + viewName;

      // views
      views.forEach((v) => v.classList.toggle("active", v.id === id));

      // sidebar
      links.forEach((b) =>
        b.classList.toggle("active", b.dataset.view === viewName)
      );

      // mobile
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

    // default
    activateView("home");
  }



  // Profile box (simple for now)
    function renderProfile(s) {
    if (!profileBox) return;

    const joined = s.joinedAt
      ? new Date(s.joinedAt).toLocaleString()
      : "Unknown";

    const courses = Array.isArray(s.courses) ? s.courses : [];

    profileBox.innerHTML = `
      <div><strong>Name:</strong> ${escapeHtml(s.fullName)}</div>
      ${s.phone ? `<div><strong>WhatsApp:</strong> ${escapeHtml(s.phone)}</div>` : ""}
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
        We’ll link your real courses, attendance, and syllabus here later insha’Allah.
      </div>
    `;
  }

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

  function renderTodayTask(student) {
    const mainEl = document.getElementById("todayTaskMain");
    const subEl = document.getElementById("todayTaskSub");
    if (!mainEl || !subEl) return;

    const firstCourse =
      Array.isArray(student.courses) && student.courses[0]
        ? student.courses[0]
        : null;

    if (!firstCourse) {
      mainEl.textContent = "Review any pages you recited in your last class.";
      subEl.textContent =
        "If you keep revising, Allah will make the recitation firm in your heart insha’Allah.";
      return;
    }

    const courseName = firstCourse.courseName || firstCourse.courseId || "your class";

    mainEl.textContent = `Spend 10–15 minutes revising today’s portion for ${courseName}.`;
    subEl.textContent =
      "Read slowly, focus on your tajwīd, and repeat difficult ayāt 5 times.";
  }



  // ===== Schedule / Next Class logic =====

  async function loadSchedule(fullName) {
    if (!fullName) return;

    // Reset UI while loading
    if (countdownEl) countdownEl.textContent = "Loading…";
    if (nextClassLabelEl) nextClassLabelEl.textContent = "";

    try {
      const [slots, students] = await Promise.all([
        fetchJson("/api/class-slots"),
        fetchJson("/api/students"),
      ]);

      const student = students.find(
        (st) => st.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
      );

      if (!student) {
        if (countdownEl) countdownEl.textContent = "No upcoming class scheduled.";
        if (nextClassLabelEl) {
          nextClassLabelEl.textContent = "We couldn't find your schedule yet. Please contact the admin.";
        }
        return;
      }

      const nextClass = findNextClassForStudent(student, slots);
      if (!nextClass) {
        if (countdownEl) countdownEl.textContent = "No upcoming class scheduled.";
        if (nextClassLabelEl) {
          nextClassLabelEl.textContent = "You are enrolled, but there is no class time set yet.";
        }
        return;
      }

      // Update label and Join button
      if (nextClassLabelEl) {
        nextClassLabelEl.textContent =
          `${nextClass.courseName} • ${nextClass.slotName} • ${nextClass.prettyTime}`;
      }
      const joinBtn = document.getElementById("joinClassBtn");
      if (joinBtn && nextClass.meetLink) {
        joinBtn.href = nextClass.meetLink;
      }

      // Start countdown
      startCountdown(nextClass.date);

    } catch (err) {
      console.error("Error loading schedule:", err);
      if (countdownEl) countdownEl.textContent = "Could not load schedule.";
    }
  }

  function fetchJson(url) {
    return fetch(url).then((r) => {
      if (!r.ok) throw new Error("Failed to fetch " + url);
      return r.json();
    });
  }

  function findNextClassForStudent(student, slots) {
    if (!student || !Array.isArray(student.courses) || !slots?.length) return null;

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

        // Compute the next date for this day + time
        const candidate = new Date();
        const currentDow = candidate.getDay();
        let diffDays = (targetDow - currentDow + 7) % 7;

        candidate.setHours(startHour, startMin, 0, 0);
        if (diffDays === 0 && candidate <= now) {
          diffDays = 7; // same day but time passed → next week
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
    if (!countdownEl) return;
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

      countdownEl.textContent =
        `${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`;
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

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});
