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

  const loginToggleBtn = document.getElementById("show-login");
  const signupToggleBtn = document.getElementById("show-signup");

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

  loginToggleBtn?.addEventListener("click", () => {
    signInForm.classList.add("active");
    signUpForm.classList.remove("active");
    loginToggleBtn.classList.add("active");
    signupToggleBtn.classList.remove("active");
    triggerTitleAnimation();
  });

  signupToggleBtn?.addEventListener("click", () => {
    signUpForm.classList.add("active");
    signInForm.classList.remove("active");
    signupToggleBtn.classList.add("active");
    loginToggleBtn.classList.remove("active");
    triggerTitleAnimation();
  });

  signUpForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!emailSignUpInput || !signUpPasswordInput || !nameInput) return;

    const nameValue = nameInput.value.trim();
    const nameParts = nameValue.split(/\s+/);

    if (nameParts.length < 2) {
      showToast("Please enter at least two names (e.g., Emmanuel Mutugi).", "error");
      nameInput.focus();
      return;
    }

    if (!isEmailValid(emailSignUpInput.value)) {
      showToast("Please enter a valid email address.", "error");
      emailSignUpInput.focus();
      return;
    }

    if (!isPasswordStrong(signUpPasswordInput.value)) {
      showToast("Password must be at least 6 characters and include a number.", "error");
      signUpPasswordInput.focus();
      return;
    }

    fetch("https://notes-sniy.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameValue,
        email: emailSignUpInput.value.trim(),
        password: signUpPasswordInput.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showToast(data.error, "error");
        } else if (data.message && data.message.includes("successful")) {
          localStorage.setItem(
            "user",
            JSON.stringify({ name: nameValue, email: emailSignUpInput.value.trim() })
          );
          showToast("Account created successfully!", "success");
          signUpForm.reset();
          loginToggleBtn?.click();
        } else {
          showToast("Signup failed. Try again.", "error");
        }
      })
      .catch(() => showToast("Server error. Try again later.", "error"));
  });

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
        email: emailSignInInput.value.trim(),
        password: signInPasswordInput.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showToast(data.error, "error");
        } else if (data.token && data.user) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          showToast("Logged in successfully!", "success");
          setTimeout(() => {
            window.location.href = "https://emannuh254.github.io/login-page/Components/splash.html";
          }, 100);
        } else {
          showToast("Login failed. Try again.", "error");
        }
      })
      .catch(() => showToast("Server error. Try again later.", "error"));
  });

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
          if (result.error) {
            showToast(result.error, "error");
          } else {
            localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
            localStorage.setItem("authToken", jwt);
            showToast(`Welcome, ${data.name}!`, "success", 2500);
            setTimeout(() => {
              window.location.href = "https://emannuh254.github.io/login-page/Components/splash.html";
            }, 600);
          }
        })
        .catch((err) => {
          console.error("Error storing Google user:", err);
          showToast("Google sign-in failed. Try again.", "error", 2500);
        });
    } else {
      showToast("Google sign-in failed. Please try again.", "error", 2500);
    }
  };

  function initGoogleSignIn() {
    if (window.google?.accounts?.id && document.getElementById("google-signin-button")) {
      google.accounts.id.initialize({
        client_id: "57706195065-klr8q7oot7ee889ohh40o9jp1huc7420.apps.googleusercontent.com",
        callback: window.handleCredentialResponse,
      });

      google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        logo_alignment: "left",
        width: 240,
      });
    }
  }

  const googleApiInterval = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(googleApiInterval);
      initGoogleSignIn();
    }
  }, 100);

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
   document.getElementById("loader-overlay").style.display = "flex"; // show

fetch("...", {
  method: "POST",
  ...
})
.then(res => res.json())
.then(data => {
  ...
})
.finally(() => {
  document.getElementById("loader-overlay").style.display = "none"; // hide
});

});
