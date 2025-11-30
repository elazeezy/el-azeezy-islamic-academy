// server/server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env
require("dotenv").config();

// ========================
// Email (Nodemailer) setup
// ========================
const nodemailer = require("nodemailer");

const mailer = nodemailer.createTransport({
  service: "gmail", // or use "smtp" settings if not Gmail
  auth: {
    user: process.env.NOTIFY_EMAIL,
    pass: process.env.NOTIFY_EMAIL_PASSWORD,
  },
});

// helper to send email when new registration arrives
async function sendNewRegistrationEmail(entry) {
  if (!process.env.ADMIN_EMAIL || !process.env.NOTIFY_EMAIL) {
    console.warn("Email not configured (missing ADMIN_EMAIL / NOTIFY_EMAIL).");
    return;
  }

  const courses = Array.isArray(entry.courses)
    ? entry.courses.join(", ")
    : entry.courses || "N/A";

  const textBody = `
New assessment booking received:

Name: ${entry.fullName || "-"}
Adult name: ${entry.adultName || "-"}
Child name(s): ${entry.childNames || "-"}
Who for: ${entry.whoFor || "-"}

WhatsApp: ${entry.whatsapp || "-"}
Email: ${entry.email || "-"}
Country: ${entry.country || "-"}

Selected programs: ${courses}

Notes / goals:
${entry.goals || "-"}

Registration ID: ${entry.id}
Created at: ${entry.createdAt}
  `.trim();

  await mailer.sendMail({
    from: `"El-Azeezy Islamic Academy" <${process.env.NOTIFY_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Free Assessment Booking – ${entry.fullName || "New student"}`,
    text: textBody,
  });

  console.log("New registration email sent for", entry.fullName);
}

// ========================
// Existing server setup
// ========================
const app = express();
const PORT = process.env.PORT || 3000;

// --- Admin PIN (change this to your secret) ---
const ADMIN_PIN = "2468";

// --- Paths
const publicDir = path.resolve(__dirname, "../public");
const registrationsPath = path.resolve(__dirname, "../data/registrations.json");
const classSlotsPath = path.resolve(__dirname, "../data/classSlots.json");
const studentsPath = path.resolve(__dirname, "../data/students.json");

// --- Ensure registrations file exists (others you already created)
if (!fs.existsSync(registrationsPath)) {
  fs.writeFileSync(registrationsPath, "[]", "utf8");
}

// --- Middlewares
app.use(cors()); // ok for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

// --- Helper: read JSON safely
function safeReadJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading JSON file:", filePath, err.message);
    return fallback;
  }
}

// --- Helper: check admin cookie
function isAuthed(req) {
  const cookie = req.headers.cookie || "";
  return cookie.split(";").some((c) => c.trim() === "admin=ok");
}

// --- Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// --- Public: save a registration
app.post("/api/register", async (req, res) => {
  try {
    const payload = req.body;
    const list = safeReadJson(registrationsPath, []);

    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...payload,
    };

    list.push(entry);
    fs.writeFileSync(registrationsPath, JSON.stringify(list, null, 2), "utf8");

    // fire-and-forget email (don't block the response)
    sendNewRegistrationEmail(entry).catch((err) =>
      console.error("Error sending registration email:", err)
    );

    res.json({ success: true, id: entry.id });
  } catch (err) {
    console.error("Error saving registration:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// --- Admin login: verify PIN and set cookie
app.post("/api/admin/login", (req, res) => {
  const { pin } = req.body || {};
  if (pin === ADMIN_PIN) {
    res.setHeader(
      "Set-Cookie",
      "admin=ok; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax"
    );
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Invalid PIN." });
});

// --- Admin logout: clear cookie
app.post("/api/admin/logout", (req, res) => {
  res.setHeader(
      "Set-Cookie",
      "admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  res.json({ success: true });
});

// --- Admin-only: list registrations
app.get("/api/registrations", (req, res) => {
  if (!isAuthed(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const list = safeReadJson(registrationsPath, []);
  res.json(list);
});

// --- NEW: get class slots (for student portal)
app.get("/api/class-slots", (req, res) => {
  const slots = safeReadJson(classSlotsPath, []);
  res.json(slots);
});

// --- NEW: get students (for student portal)
app.get("/api/students", (req, res) => {
  const students = safeReadJson(studentsPath, []);
  res.json(students);
});

// --- Admin page gate: login first
app.get("/admin", (req, res) => {
  if (isAuthed(req)) {
    return res.sendFile(path.join(publicDir, "admin.html"));
  }
  return res.sendFile(path.join(publicDir, "admin-login.html"));
});

// --- Student portal
app.get("/student", (req, res) => {
  res.sendFile(path.join(publicDir, "student.html"));
});

// --- Start server
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
