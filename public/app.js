// public/app.js

// =========================
// CONFIG
// =========================
const PAYSTACK_PUBLIC_KEY = "pk_live_4546ca5d80bae452b25e1d6eb1fa1ffb4f14b475";

// Put YOUR WhatsApp number here (no +, no spaces, in international format)
const USTAZ_WHATSAPP = "2349031476912"; // example: +234 903 147 6912 -> "2349031476912"

const PLAN_PRICING = {
  standard: { ngn: 29999, usd: 29.99 },
  premium: { ngn: 39999, usd: 39.99 },
  family: { ngn: 120000, usd: 120.0 },
};

// Store user data after successful form submission (so payment works even after reset)
let savedUserData = {
  email: "",
  whatsappNumber: "",
  country: ""
};

// =========================
// SCROLL REVEAL
// =========================
const revealEls = document.querySelectorAll(".reveal-on-scroll");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => observer.observe(el));

// =========================
// COURSE SELECTION
// =========================
const courseCards = document.querySelectorAll(".course-card");
const selectedCoursesList = document.getElementById("selectedCoursesList");
const selectedCoursesInForm = document.getElementById("selectedCoursesInForm");
const selectedCourses = new Set();

function renderSelectedCoursesInto(ul) {
  ul.innerHTML = "";
  const arr = Array.from(selectedCourses);
  if (arr.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No programs selected yet.";
    ul.appendChild(li);
    return;
  }
  arr.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    ul.appendChild(li);
  });
}

function updateSelectedCourseLists() {
  renderSelectedCoursesInto(selectedCoursesList);
  renderSelectedCoursesInto(selectedCoursesInForm);
}

courseCards.forEach((card) => {
  const btn = card.querySelector(".course-select-btn");
  const name = card.dataset.course;
  btn.addEventListener("click", () => {
    if (card.classList.contains("selected")) {
      card.classList.remove("selected");
      selectedCourses.delete(name);
    } else {
      card.classList.add("selected");
      selectedCourses.add(name);
    }
    updateSelectedCourseLists();
  });
});

// =========================
// "WHO IS THIS FOR" FIELDS
// =========================
const whoForSelect = document.getElementById("whoFor");
const childNamesRow = document.getElementById("childNamesRow");
const adultNameRow = document.getElementById("adultNameRow");

function updateNameFields() {
  const value = whoForSelect.value;
  childNamesRow.style.display = "none";
  adultNameRow.style.display = "none";

  if (value === "child-6-12" || value === "teen-13-18" || value === "family") {
    childNamesRow.style.display = "flex";
  }
  if (value === "adult" || value === "family") {
    adultNameRow.style.display = "flex";
  }
}

if (whoForSelect) {
  whoForSelect.addEventListener("change", updateNameFields);
  updateNameFields();
}

// =========================
// ASSESSMENT FORM SUBMIT
// =========================
const form = document.getElementById("assessmentForm");
const successBox = document.getElementById("formSuccess");

function setError(id, message) {
  const errorEl = document.querySelector(`[data-error-for="${id}"]`);
  if (errorEl) errorEl.textContent = message || "";
}

function clearErrors() {
  ["whoFor", "email", "whatsapp", "country"].forEach((id) =>
    setError(id, "")
  );
}

function buildPrimaryName(whoFor, childNames, adultName) {
  if (whoFor === "adult") return adultName || "";
  if (whoFor === "child-6-12" || whoFor === "teen-13-18") return childNames || "";
  if (whoFor === "family") {
    const parts = [];
    if (adultName) parts.push(adultName);
    if (childNames) parts.push(childNames);
    return parts.join(" | ");
  }
  return adultName || childNames || "";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    successBox.hidden = true;

    const whoFor = document.getElementById("whoFor").value.trim();
    const childNames = document.getElementById("childNames").value.trim();
    const adultName = document.getElementById("adultName").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const country = document.getElementById("country").value.trim();
    const goals = document.getElementById("goals").value.trim();

    const requiredIds = ["whoFor", "email", "whatsapp", "country"];
    let hasError = false;

    requiredIds.forEach((id) => {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        hasError = true;
        setError(id, "This field is required.");
      }
    });

    if (hasError) return;

    // SAVE CRITICAL DATA BEFORE ANY RESET
    savedUserData = {
      email,
      whatsappNumber: whatsapp,
      country
    };

    const fullName = buildPrimaryName(whoFor, childNames, adultName);
    const coursesArr = Array.from(selectedCourses);

    const payload = {
      fullName,
      whoFor,
      childNames,
      adultName,
      email,
      whatsappNumber: whatsapp,
      country,
      goals,
      courses: coursesArr,
      timePreference: "",
      level: "",
      paymentPlan: "",
    };

        try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Could not submit right now. Please try again shortly.");
        return;
      }

      // =========================
      // SUCCESS: show message + WhatsApp redirect
      // =========================

      // Build WhatsApp message with key details
      const waMessage = `
Assalamu alaikum Ustaz,
I just booked a FREE assessment from the website.

Primary name: ${fullName || "-"}
Who is this for: ${whoFor || "-"}
WhatsApp: ${whatsapp || "-"}
Country: ${country || "-"}
Program(s): ${coursesArr.length ? coursesArr.join(", ") : "-"}
Goals / notes: ${goals || "-"}

Please confirm my assessment time in shaa Allah.
      `.trim();

      const waLink = `https://wa.me/${USTAZ_WHATSAPP}?text=${encodeURIComponent(
        waMessage
      )}`;

      // Clear form (except contact details we saved in savedUserData)
      document.getElementById("whoFor").value = "";
      document.getElementById("childNames").value = "";
      document.getElementById("adultName").value = "";
      document.getElementById("goals").value = "";
      updateNameFields();
      clearErrors();

      selectedCourses.clear();
      updateSelectedCourseLists();

      // Show success box
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: "smooth", block: "start" });

      // Prompt user to go to WhatsApp
      const goToWhatsApp = confirm(
        "Alhamdulillah! Your free assessment request has been received.\n\n" +
        "Click OK to open WhatsApp and send your details to Ustaz now."
      );

      if (goToWhatsApp) {
        window.location.href = waLink;
      }

    } catch (err) {
      console.error(err);
      alert("Network error. Please check your connection and try again.");
    }

  });
}

// =========================
// STEP 2: CHECKBOX → SHOW PAYMENT UI
// =========================
const readyBox = document.getElementById("readyToPay");
const payBtn = document.getElementById("payNowBtn");
const paymentDetails = document.getElementById("paymentDetails");
const paymentPlanSel = document.getElementById("paymentPlan");

if (readyBox && payBtn && paymentDetails) {
  readyBox.addEventListener("change", () => {
    const show = readyBox.checked;
    payBtn.hidden = !show;
    paymentDetails.hidden = !show;
  });

  payBtn.addEventListener("click", () => {
    payBtn.disabled = true;
    payBtn.textContent = "Opening Paystack...";
    payWithPaystack();
  });
}
// =========================
// PAYSTACK LOGIC (UPDATED)
// =========================

// Decide which currency to use based on country
function determineCurrency(countryValue) {
  if (!countryValue) return "NGN"; // safe default

  const c = countryValue.toLowerCase();

  // Nigerians → NGN
  if (c.includes("nigeria") || c.includes("ng")) return "NGN";

  // Everyone else → USD  (only works if USD is enabled on your Paystack account)
  // If you STILL get "Currency not supported by merchant",
  // change the next line to:  return "NGN";
  return "USD";
}

// Get amount for a plan in the chosen currency
function getAmountForPlan(planCode, currency) {
  const plan = PLAN_PRICING[planCode];
  if (!plan) return 0;

  // PLAN_PRICING = { standard: { ngn, usd }, ... }
  return currency === "NGN" ? plan.ngn : plan.usd;
}

function payWithPaystack() {
  // Basic safety checks
  if (!PAYSTACK_PUBLIC_KEY || typeof PaystackPop === "undefined") {
    alert("Payment system is not ready yet. Please try again later.");
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Proceed to Payment →";
    }
    return;
  }

  const planCode = paymentPlanSel?.value;
  if (!planCode) {
    alert("Please select a plan to pay for.");
    paymentPlanSel?.focus();
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Proceed to Payment →";
    }
    return;
  }

  // PRIORITY: use saved form data (from successful registration)
  const email =
    savedUserData.email ||
    document.getElementById("email")?.value.trim() ||
    "";
  const whatsapp =
    savedUserData.whatsappNumber ||
    document.getElementById("whatsapp")?.value.trim() ||
    "";
  const country =
    savedUserData.country ||
    document.getElementById("country")?.value.trim() ||
    "";

  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address.");
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Proceed to Payment →";
    }
    return;
  }

  // Decide currency + amount
  const currency = determineCurrency(country);
  const amount = getAmountForPlan(planCode, currency);

  if (!amount || amount <= 0) {
    alert("Invalid amount for this plan. Please contact admin.");
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Proceed to Payment →";
    }
    return;
  }

  // Convert to minor units (kobo / cents)
  const amountMinor = Math.round(amount * 100);

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountMinor,
    currency,
    ref: "ELZ_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    metadata: {
      custom_fields: [
        { display_name: "Plan", variable_name: "plan", value: planCode },
        { display_name: "WhatsApp", variable_name: "whatsapp", value: whatsapp },
        { display_name: "Country", variable_name: "country", value: country },
      ],
    },
    callback: function (response) {
      alert(`Payment successful! Reference: ${response.reference}`);
      // Later you can POST reference to your server for verification here
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = "Proceed to Payment →";
      }
    },
    onClose: function () {
      alert("Payment window closed. You can try again.");
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = "Proceed to Payment →";
      }
    },
  });

  handler.openIframe();
}


// PERFECT MOBILE MENU (smooth + closes properly)
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mobileOverlay = document.querySelector('.mobile-menu-overlay');

if (mobileToggle && mobileOverlay) {
  mobileToggle.addEventListener('click', () => {
    mobileOverlay.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
  });

  mobileOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileOverlay.classList.remove('active');
      mobileToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// =========================
// FOOTER YEAR
// =========================
document.getElementById("year").textContent = new Date().getFullYear();