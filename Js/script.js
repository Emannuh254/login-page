// ===== DOM Ready =====
document.addEventListener("DOMContentLoaded", () => {
  // ===== Toggle Sign In / Sign Up Mode =====
  const signUpBtn = document.getElementById("sign-up-btn");
  const signInBtn = document.getElementById("sign-in-btn");
  const container = document.querySelector(".container");

  signUpBtn?.addEventListener("click", () => {
    container?.classList.add("sign-up-mode");
  });

  signInBtn?.addEventListener("click", () => {
    container?.classList.remove("sign-up-mode");
  });

  // ===== Toggle Password Visibility =====
  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.dataset.target;
      const input = document.getElementById(targetId);

      if (input) {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.classList.toggle("fa-eye");
        toggle.classList.toggle("fa-eye-slash");
      }
    });
  });

  // ===== Intl Tel Input Initialization =====
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  let iti;

  if (phoneInput && phoneError) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "ke",
      preferredCountries: ["ke", "ng", "us", "gb"],
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    phoneInput.addEventListener("input", () => {
      const isValid = /^[\d+]*$/.test(phoneInput.value);
      phoneError.style.display = isValid ? "none" : "block";
      phoneError.style.opacity = isValid ? "0" : "1";
    });
  }

  // ===== Validation Helpers =====
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPasswordStrong = (password) =>
    password.length >= 6 && /\d/.test(password);

  // ===== Sign Up Form Validation =====
  const signUpForm = document.querySelector(".sign-up-form");

  signUpForm?.addEventListener("submit", (e) => {
    const email = signUpForm.querySelector('input[type="email"]');
    const password = document.getElementById("signUpPassword");
    let hasError = false;

    if (iti && !iti.isValidNumber()) {
      phoneError.textContent = "Please enter a valid phone number!";
      phoneError.style.display = "block";
      phoneError.style.opacity = "1";
      hasError = true;
    }

    if (!isEmailValid(email.value)) {
      alert("Please enter a valid email address.");
      hasError = true;
    }

    if (!isPasswordStrong(password.value)) {
      alert("Password must be at least 6 characters and include a number.");
      hasError = true;
    }

    if (hasError) e.preventDefault();
    else alert("Account created successfully!");
  });

  // ===== Sign In Form Validation =====
  const signInForm = document.querySelector(".sign-in-form");

  signInForm?.addEventListener("submit", (e) => {
    const password = document.getElementById("signInPassword");
    if (password.value.length < 6) {
      alert("Password must be at least 6 characters.");
      e.preventDefault();
    }
  });

  // ===== Google Sign-In Token Handler =====
  window.handleCredentialResponse = (response) => {
    const jwt = response.credential;
    const data = parseJwt(jwt);

    alert(`Welcome, ${data.name || "User"}!`);
    localStorage.setItem("authToken", jwt);
    window.location.href = "/Components/home.html";
  };

  function parseJwt(token) {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  // ===== Mobile Menu Toggle =====
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const overlay = document.getElementById("overlay");

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

  // ===== Logout =====
  const logout = document.getElementById("logout");
  logout?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    window.location.href = "/Components/index.html";
  });
});
