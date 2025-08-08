document.addEventListener("DOMContentLoaded", () => {
  const loginCard = document.getElementById("login-card");
  const signupCard = document.getElementById("signup-card");
  const forgotCard = document.getElementById("forgot-card");

  const signUpForm = document.getElementById("signup-form");
  const signInForm = document.getElementById("login-form");
  const forgotForm = document.getElementById("forgot-password-form");

  const nameInput = document.getElementById("signUpName");
  const emailSignUpInput = document.getElementById("signUpEmail");
  const signUpPasswordInput = document.getElementById("signUpPassword");
  const emailSignInInput = document.getElementById("signInEmail");
  const signInPasswordInput = document.getElementById("signInPassword");
  const forgotEmail = document.getElementById("forgotEmail");

  const toastContainer = document.getElementById("toast-container");
  const loaderOverlay = document.getElementById("loader-overlay");
  const activeToasts = new Set();

  const loginToggleBtn = document.getElementById("show-login");
  const signupToggleBtn = document.getElementById("show-signup");
  const forgotLink = document.getElementById("forgot-password-link");

  const showLoader = () => (loaderOverlay.style.display = "flex");
  const hideLoader = () => (loaderOverlay.style.display = "none");

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

  function showForm(cardToShow) {
    [loginCard, signupCard, forgotCard].forEach((card) => {
      if (card) card.style.display = "none";
    });
    if (cardToShow) cardToShow.style.display = "block";
  }

  // Form toggles
  loginToggleBtn?.addEventListener("click", () => {
    showForm(loginCard);
    loginToggleBtn.classList.add("active");
    signupToggleBtn.classList.remove("active");
  });

  signupToggleBtn?.addEventListener("click", () => {
    showForm(signupCard);
    signupToggleBtn.classList.add("active");
    loginToggleBtn.classList.remove("active");
  });

  forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm(forgotCard);
    signupToggleBtn.classList.remove("active");
    loginToggleBtn.classList.remove("active");
  });

  // SIGN UP
  signUpForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameValue = nameInput.value.trim();
    const nameParts = nameValue.split(/\s+/);

    if (nameParts.length < 2) {
      return showToast("Please enter at least two names (e.g., Emmanuel Mutugi).", "error");
    }
    if (!isEmailValid(emailSignUpInput.value)) {
      return showToast("Enter a valid email address.", "error");
    }
    if (!isPasswordStrong(signUpPasswordInput.value)) {
      return showToast("Password must be at least 6 characters and include a number.", "error");
    }

    showLoader();
    fetch("http://localhost:5000/register", {
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
        if (data.error) return showToast(data.error, "error");
        showToast(data.message, "success");
        signUpForm.reset();
        loginToggleBtn?.click();
      })
      .catch(() => showToast("Server error. Try again later.", "error"))
      .finally(hideLoader);
  });

  // SIGN IN
  signInForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isEmailValid(emailSignInInput.value))
      return showToast("Enter a valid email.", "error");
    if (signInPasswordInput.value.length < 6)
      return showToast("Password too short.", "error");

    showLoader();
    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailSignInInput.value.trim(),
        password: signInPasswordInput.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return showToast(data.error, "error");
        showToast(data.message, "success");
      })
      .catch(() => showToast("Server error. Try again later.", "error"))
      .finally(hideLoader);
  });

  // FORGOT PASSWORD
  forgotForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isEmailValid(forgotEmail.value))
      return showToast("Enter a valid email.", "error");
    showToast("If your email exists, a reset link will be sent.", "success");
    forgotForm.reset();
    setTimeout(() => loginToggleBtn?.click(), 3000);
  });

  // Password visibility toggle
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

  // Initial state
  showForm(loginCard);
  hideLoader();
});
