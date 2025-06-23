document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const signUpForm = document.querySelector(".sign-up-form");
  const signInForm = document.querySelector(".sign-in-form");

  // Show sign-up form by default
  container.classList.add("sign-up-mode");
  signUpForm.classList.add("active");
  signInForm.classList.remove("active");

  // Dynamic form switch buttons (inside forms)
  const switchToSignInBtn = document.querySelector(".switch-to-signin");
  const switchToSignUpBtn = document.querySelector(".switch-to-signup");

  switchToSignInBtn?.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
    signUpForm.classList.remove("active");
    signInForm.classList.add("active");
    triggerAnimation();
  });

  switchToSignUpBtn?.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
    signInForm.classList.remove("active");
    signUpForm.classList.add("active");
    triggerAnimation();
  });

  // Toggle Password Visibility
  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = document.getElementById(toggle.dataset.target);
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("fa-eye");
      toggle.classList.toggle("fa-eye-slash");
    });
  });

  // Intl Tel Input setup
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  let iti;

  if (phoneInput && phoneError && window.intlTelInput) {
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

  // Validation helpers
  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isPasswordStrong = (password) =>
    password.length >= 6 && /\d/.test(password);

  // Sign Up Form Validation
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

  // Sign In Form Validation
  signInForm?.addEventListener("submit", (e) => {
    const password = document.getElementById("signInPassword")?.value || "";
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      e.preventDefault();
    }
  });

  // Google Sign-In Response Handler
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

  // GOOGLE SIGN-IN BUTTON INIT
  if (window.google?.accounts?.id) {
    // Replace with your actual Google OAuth Client ID
    const clientId =
      "37850694475-0dlp5pc22vrpvhn2t70ij4cjprvlsqhr.apps.googleusercontent.com";

    google.accounts.id.initialize({
      client_id: clientId,
      callback: window.handleCredentialResponse,
    });

    document.querySelectorAll(".g_id_signin").forEach((btn) => {
      google.accounts.id.renderButton(btn, {
        theme: btn.getAttribute("data-theme") || "outline",
        size: btn.getAttribute("data-size") || "large",
        text: btn.getAttribute("data-text") || "signin_with",
        shape: btn.getAttribute("data-shape") || "rectangular",
        logo_alignment: btn.getAttribute("data-logo_alignment") || "left",
      });
    });

    // google.accounts.id.prompt(); // Optional: for One Tap
  }

  // Animated title letters
  const letters = document.querySelectorAll(".letter");

  function triggerAnimation() {
    letters.forEach((letter) => {
      letter.style.animation = "none";
      letter.offsetHeight; // trigger reflow
      letter.style.animation = null;
    });
  }
});
