// Toggle sign-in/sign-up mode
const signUpBtn = document.getElementById("sign-up-btn");
const signInBtn = document.getElementById("sign-in-btn");
const container = document.querySelector(".container");

signUpBtn?.addEventListener("click", () => {
  container?.classList.add("sign-up-mode");
});

signInBtn?.addEventListener("click", () => {
  container?.classList.remove("sign-up-mode");
});

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (input) {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("fa-eye");
      toggle.classList.toggle("fa-eye-slash");
    }
  });
});

// Initialize international phone input
const phoneInput = document.querySelector("#phone");
const phoneError = document.getElementById("phone-error");

if (phoneInput && phoneError) {
  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "ke",
    preferredCountries: ["ke", "ng", "us", "gb"],
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  phoneInput.addEventListener("input", () => {
    const value = phoneInput.value;
    const isValid = /^[\d+]*$/.test(value); // only digits and '+'

    if (!isValid) {
      phoneError.style.display = "block";
      phoneError.style.opacity = "1";
    } else {
      phoneError.style.opacity = "0";
      setTimeout(() => {
        phoneError.style.display = "none";
      }, 200);
    }
  });
}

// Google Sign-In response handler
function handleCredentialResponse(response) {
  const jwt = response.credential;

  const data = parseJwt(jwt);
  console.log("Google User:", data);

  alert(`Welcome, ${data.name || "User"}!`);
}

// Decode JWT
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// Homepage Menu Toggle
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const overlay = document.getElementById("overlay");
const logout = document.getElementById("logout");

if (menuToggle && navLinks && overlay) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    navLinks.classList.remove("show");
    overlay.classList.remove("active");
  });
}

if (logout) {
  logout.addEventListener("click", () => {
    // Clear session or token here if needed
    window.location.href = "login.html";
  });
}
