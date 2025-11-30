// public/admin.js
(async function () {
  // Grab elements
  const tbody = document.getElementById("regTbody");
  const q = document.getElementById("q");
  const courseFilter = document.getElementById("courseFilter");
  const levelFilter = document.getElementById("levelFilter");
  const sortBy = document.getElementById("sortBy");
  const exportBtn = document.getElementById("exportCsvBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Logout -> call backend and reload /admin (will show login page)
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {}
      window.location.href = "/admin";
    });
  }
// Fetch registrations (requires admin cookie)
let data = [];
try {
  const res = await fetch("/api/registrations");

  if (!res.ok) {
    // If unauthorized, send to login
    if (res.status === 401) {
      window.location.href = "/admin"; // server will show login page
      return;
    }
    throw new Error("Failed to load");
  }

  data = await res.json();

  // --- Stats ---
  const total = data.length;

  // Count unique WhatsApp or email as "students"
  const byKey = new Set(
    data.map(r =>
      (r.whatsappNumber || r.whatsapp || r.email || "")
        .trim()
        .toLowerCase()
    )
  );
  const unique = byKey.size;

  document.getElementById("statTotalRegistrations").textContent = total;
  document.getElementById("statUniqueStudents").textContent = unique;
} catch (e) {
  console.error(e);
  if (tbody) {
    tbody.innerHTML =
      `<tr><td colspan="9">Could not load data. Is the server running?</td></tr>`;
  }
  return;
}

  // Build unique course list -> filter dropdown
  const courseSet = new Set();
  data.forEach((r) => (r.courses || []).forEach((c) => courseSet.add(c)));
  [...courseSet].sort().forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    courseFilter.appendChild(opt);
  });

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
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

  function render(rows) {
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="9">No registrations yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map((r) => {
        const courseHtml = (r.courses || [])
          .map((c) => `<span class="pill">${escapeHtml(c)}</span>`)
          .join("");
        return `
          <tr>
            <td>${escapeHtml(formatDate(r.createdAt))}</td>
            <td>${escapeHtml(r.fullName || "")}</td>
            <td class="mono">${escapeHtml(r.whatsappNumber || "")}</td>
            <td>${escapeHtml(r.email || "")}</td>
            <td>${escapeHtml(r.country || "")}</td>
            <td>${escapeHtml(r.timePreference || "")}</td>
            <td>${escapeHtml(r.level || "")}</td>
            <td>${courseHtml}</td>
            <td class="mono">${escapeHtml(String(r.id || ""))}</td>
          </tr>
        `;
      })
      .join("");
  }

  function applyFilters() {
    const query = (q?.value || "").toLowerCase();
    const course = courseFilter?.value || "";
    const level = levelFilter?.value || "";
    const sort = sortBy?.value || "createdAt_desc";

    let rows = data.slice();

    // Search in name/email/phone/country
    if (query) {
      rows = rows.filter((r) =>
        (r.fullName || "").toLowerCase().includes(query) ||
        (r.email || "").toLowerCase().includes(query) ||
        (r.whatsappNumber || "").toLowerCase().includes(query) ||
        (r.country || "").toLowerCase().includes(query)
      );
    }

    // Course filter
    if (course) {
      rows = rows.filter((r) => Array.isArray(r.courses) && r.courses.includes(course));
    }

    // Level filter
    if (level) {
      rows = rows.filter(
        (r) => (r.level || "").toLowerCase() === level.toLowerCase()
      );
    }

    // Sort
    rows.sort((a, b) => {
      switch (sort) {
        case "createdAt_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "createdAt_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "name_asc":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "name_desc":
          return (b.fullName || "").localeCompare(a.fullName || "");
        default:
          return 0;
      }
    });

    render(rows);
  }

  // CSV export (all rows)
  function toCsv(rows) {
    const headers = [
      "id","createdAt","fullName","whatsappNumber","email","country","timePreference","level","courses"
    ];
    const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const lines = [headers.join(",")];
    rows.forEach((r) => {
      lines.push([
        r.id,
        r.createdAt,
        r.fullName,
        r.whatsappNumber,
        r.email,
        r.country,
        r.timePreference,
        r.level,
        (r.courses || []).join("; ")
      ].map(escape).join(","));
    });
    return lines.join("\r\n");
  }

  function downloadCsv() {
    const csv = toCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  // Hook up events
  q?.addEventListener("input", applyFilters);
  courseFilter?.addEventListener("change", applyFilters);
  levelFilter?.addEventListener("change", applyFilters);
  sortBy?.addEventListener("change", applyFilters);
  exportBtn?.addEventListener("click", downloadCsv);

  // First render
  applyFilters();
})();
