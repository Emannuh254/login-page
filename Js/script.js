document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const signUpForm = document.getElementById("signup-form");
  const signInForm = document.getElementById("login-form");
  const letters = document.querySelectorAll(".animated-title .letter");

  const emailSignUpInput = signUpForm?.querySelector('input[type="email"]');
  const signUpPasswordInput = signUpForm?.querySelector(
    'input[type="password"]'
  );

  const signInPasswordInput = signInForm?.querySelector(
    'input[type="password"]'
  );

  const toastContainer = document.getElementById("toast-container");
  const activeToasts = new Set();

  // Show toast notification helper
  function showToast(message, type = "success", duration = 3000) {
    if (!toastContainer) return;

    const toastId = `${message}-${type}`;
    if (activeToasts.has(toastId)) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    activeToasts.add(toastId);
    toastContainer.appendChild(toast);

    // Remove on click
    toast.addEventListener("click", () => {
      toast.remove();
      activeToasts.delete(toastId);
    });

    // Auto remove after duration with fade out
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        toast.remove();
        activeToasts.delete(toastId);
      }, 300);
    }, duration);
  }

  // Simple email validation
  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  // Password validation: min 6 chars, at least one digit
  function isPasswordStrong(password) {
    return password.length >= 6 && /\d/.test(password);
  }

  // Animate title letters (optional)
  function triggerTitleAnimation() {
    letters.forEach((letter, i) => {
      letter.style.animation = "none";
      void letter.offsetHeight; // trigger reflow
      letter.style.animation = "";
    });
  }

  // Toggle active form classes
  document.getElementById("show-login").addEventListener("click", () => {
    signInForm.classList.add("active");
    signUpForm.classList.remove("active");
    triggerTitleAnimation();
  });

  document.getElementById("show-signup").addEventListener("click", () => {
    signUpForm.classList.add("active");
    signInForm.classList.remove("active");
    triggerTitleAnimation();
  });

  // Sign-up form submit handler
  signUpForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!emailSignUpInput || !signUpPasswordInput) return;

    if (!isEmailValid(emailSignUpInput.value)) {
      showToast("Please enter a valid email address.", "error");
      emailSignUpInput.focus();
      return;
    }

    if (!isPasswordStrong(signUpPasswordInput.value)) {
      showToast(
        "Password must be at least 6 characters and include a number.",
        "error"
      );
      signUpPasswordInput.focus();
      return;
    }

    // If all validations pass
    showToast("Account created successfully!", "success");
    signUpForm.reset();

    // Switch to login after sign up
    document.getElementById("show-login").click();
  });

  // Sign-in form submit handler
  signInForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!signInPasswordInput) return;

    if (signInPasswordInput.value.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      signInPasswordInput.focus();
      return;
    }

    // Simulate successful login
    showToast("Logged in successfully!", "success");
    signInForm.reset();
  });

  // Google Sign-In JWT parser
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Google sign-in callback
  window.handleCredentialResponse = (response) => {
    const jwt = response.credential;
    const data = parseJwt(jwt);

    if (data) {
      showToast(
        `Welcome, ${data.name || "User"}! You are signed in.`,
        "success",
        2500
      );
      localStorage.setItem("authToken", jwt);

      // TODO: Redirect to dashboard/home if needed
      // window.location.href = "/dashboard.html";
    } else {
      showToast("Google sign-in failed. Please try again.", "error", 2500);
    }
  };

  // Initialize Google Sign-In button
  function initGoogleSignIn() {
    if (
      window.google?.accounts?.id &&
      document.getElementById("google-signin-button")
    ) {
      google.accounts.id.initialize({
        client_id:
          "57706195065-klr8q7oot7ee889ohh40o9jp1huc7420.apps.googleusercontent.com",
        callback: window.handleCredentialResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          logo_alignment: "left",
          width: 240,
        }
      );
    }
  }

  // Poll for Google API availability then init
  const googleApiInterval = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(googleApiInterval);
      initGoogleSignIn();
    }
  }, 100);
});
