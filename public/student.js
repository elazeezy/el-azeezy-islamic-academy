document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("studentLogin");
  const dashView  = document.getElementById("studentDashboard");
  const nameEl    = document.getElementById("studentName");
  const loginForm = document.getElementById("studentLoginForm");
  const loginErr  = document.getElementById("studentLoginError");
  const logoutBtn = document.getElementById("studentLogoutBtn");

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
    loginView.hidden = false;
    dashView.hidden = true;
  }

  function showDashboard(s) {
    if (nameEl) nameEl.textContent = s.fullName;
    loginView.hidden = true;
    dashView.hidden = false;
    initViews();
    renderProfile(s);
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

    links.forEach((btn) => {
      btn.addEventListener("click", () => {
        links.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const id = "view-" + btn.dataset.view;
        views.forEach((v) => v.classList.toggle("active", v.id === id));
      });
    });
  }

  // Profile box (simple for now)
  function renderProfile(s) {
    if (!profileBox) return;
    profileBox.innerHTML = `
      <div><strong>Name:</strong> ${escapeHtml(s.fullName)}</div>
      ${s.phone ? `<div><strong>WhatsApp:</strong> ${escapeHtml(s.phone)}</div>` : ""}
      <div class="muted" style="margin-top:.5rem">
        We’ll link your real courses, attendance, and syllabus here later insha’Allah.
      </div>
    `;
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
