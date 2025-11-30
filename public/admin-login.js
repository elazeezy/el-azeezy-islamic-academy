document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  const pinInput = document.getElementById("pin");
  const errEl = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.textContent = "";

    const pin = pinInput.value.trim();
    if (!pin) { errEl.textContent = "PIN is required."; return; }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (data.success) {
        // Go to admin after cookie is set
        window.location.href = "/admin";
      } else {
        errEl.textContent = data.error || "Invalid PIN.";
      }
    } catch {
      errEl.textContent = "Server not reachable.";
    }
  });
});
