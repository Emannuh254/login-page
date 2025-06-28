document.addEventListener("DOMContentLoaded", () => {
  const signUpForm = document.getElementById("signup-form");
  const signInForm = document.getElementById("login-form");
  const letters = document.querySelectorAll(".animated-title .letter");

  const nameInput = document.getElementById("signUpName");
  const emailSignUpInput = document.getElementById("signUpEmail");
  const signUpPasswordInput = document.getElementById("signUpPassword");
  const emailSignInInput = document.getElementById("signInEmail");
  const signInPasswordInput = document.getElementById("signInPassword");
  const toastContainer = document.getElementById("toast-container");
  const activeToasts = new Set();

  function showToast(message, type = "success", duration = 3000) {
    if (!toastContainer) return;
    const toastId = `${message}-${type}`;
    if (activeToasts.has(toastId)) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    activeToasts.add(toastId);
    toastContainer.appendChild(toast);

    toast.addEventListener("click", () => {
      toast.remove();
      activeToasts.delete(toastId);
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        toast.remove();
        activeToasts.delete(toastId);
      }, 300);
    }, duration);
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isPasswordStrong(password) {
    return password.length >= 6 && /\d/.test(password);
  }

  function triggerTitleAnimation() {
    letters.forEach((letter) => {
      letter.style.animation = "none";
      void letter.offsetHeight;
      letter.style.animation = "";
    });
  }

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

  // ✅ Handle Signup
  signUpForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!emailSignUpInput || !signUpPasswordInput || !nameInput) return;

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

    fetch("https://notes-sniy.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value,
        email: emailSignUpInput.value,
        password: signUpPasswordInput.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          showToast("Account created successfully!", "success");
          signUpForm.reset();
          document.getElementById("show-login").click();
        } else {
          showToast("Signup failed. Try again.", "error");
        }
      })
      .catch(() => showToast("Server error. Try again later.", "error"));
  });

  // ✅ Handle Signin
  signInForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!emailSignInInput || !signInPasswordInput) return;

    if (!isEmailValid(emailSignInInput.value)) {
      showToast("Please enter a valid email.", "error");
      return;
    }
    if (signInPasswordInput.value.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    fetch("https://notes-sniy.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailSignInInput.value,
        password: signInPasswordInput.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          showToast("Logged in successfully!", "success");
          setTimeout(() => {
            window.location.href =
              "https://emannuh254.github.io/login-page/Components/splash.html";
          }, 1000);
        } else {
          showToast("Login failed: " + data.error, "error");
        }
      })
      .catch(() => showToast("Server error. Try again later.", "error"));
  });

  // ✅ JWT Parser
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

  // ✅ Google Sign-In Handler
  window.handleCredentialResponse = (response) => {
    const jwt = response.credential;
    const data = parseJwt(jwt);

    if (data && data.email && data.name) {
      fetch("https://notes-sniy.onrender.com/google-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, name: data.name }),
      })
        .then((res) => res.json())
        .then((result) => {
          showToast(`Welcome, ${data.name}!`, "success", 2500);
          localStorage.setItem("authToken", jwt);
          setTimeout(() => {
            window.location.href =
              "https://emannuh254.github.io/login-page/Components/splash.html";
          }, 2600);
        })
        .catch((err) => {
          console.error("Error storing Google user:", err);
          showToast("Google sign-in failed. Try again.", "error", 2500);
        });
    } else {
      showToast("Google sign-in failed. Please try again.", "error", 2500);
    }
  };

  // ✅ Google Sign-In Button Init
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

  const googleApiInterval = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(googleApiInterval);
      initGoogleSignIn();
    }
  }, 100);

  // ✅ Password Toggle
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = document.getElementById(icon.dataset.target);
      if (!input) return;
      const isPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", isPassword ? "text" : "password");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });
});
