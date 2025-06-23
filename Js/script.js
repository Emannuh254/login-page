document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const signUpBtn = document.getElementById("sign-up-btn");
  const signInBtn = document.getElementById("sign-in-btn");
  const container = document.querySelector(".container");
  const signInForm = document.querySelector(".sign-in-form");
  const signUpForm = document.querySelector(".sign-up-form");

  // Toggle between forms by adding/removing CSS classes
  signUpBtn?.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
  });

  signInBtn?.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
  });

  // Password visibility toggle for all toggles
  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = document.getElementById(toggle.dataset.target);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        toggle.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        toggle.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });

  // Intl Tel Input setup and basic input validation (phone number)
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
    });
  }

  // Simple email validation regex
  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Password strength (min 6 chars + digit)
  const isPasswordStrong = (password) =>
    password.length >= 6 && /\d/.test(password);

  // Sign Up form validation
  signUpForm?.addEventListener("submit", (e) => {
    const email = signUpForm.querySelector('input[type="email"]')?.value || "";
    const password = document.getElementById("signUpPassword")?.value || "";
    let hasError = false;

    if (iti && !iti.isValidNumber()) {
      phoneError.textContent = "Please enter a valid phone number!";
      phoneError.style.display = "block";
      hasError = true;
    }

    if (!isEmailValid(email)) {
      alert("Please enter a valid email address.");
      hasError = true;
    }

    if (!isPasswordStrong(password)) {
      alert("Password must be at least 6 characters and include a number.");
      hasError = true;
    }

    if (hasError) e.preventDefault();
    else alert("Account created successfully!");
  });

  // Sign In form validation
  signInForm?.addEventListener("submit", (e) => {
    const password = document.getElementById("signInPassword")?.value || "";
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      e.preventDefault();
    }
  });

  // Google Sign-In handler (if used)
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
});
