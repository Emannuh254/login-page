document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const signUpForm = document.getElementById("sign-up-form"); // Use getElementById for direct access
  const signInForm = document.getElementById("sign-in-form"); // Use getElementById for direct access
  const animatedTitleElement = document.querySelector(".animated-title"); // Get the title container
  const letters = animatedTitleElement
    ? animatedTitleElement.querySelectorAll(".letter")
    : []; // Select letters, ensuring title element exists

  // Elements for sign-up form validation
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  const emailInput = signUpForm
    ? signUpForm.querySelector('input[type="email"]')
    : null;
  const emailError = document.getElementById("email-error");
  const signUpPasswordInput = document.getElementById("signUpPassword");
  const passwordError = document.getElementById("password-error");
  const signInPasswordInput = document.getElementById("signInPassword"); // Added for sign-in validation

  let iti; // Variable to hold intlTelInput instance
  let activeToasts = new Set(); // Keep track of active toast messages

  // --- Utility Functions ---

  /**
   * Displays a toast notification, preventing duplicates.
   * @param {string} message - The message to display.
   * @param {'success'|'error'} type - The type of toast (e.g., 'success', 'error').
   * @param {number} duration - How long the toast should be visible in milliseconds.
   */
  function showToast(message, type = "success", duration = 4000) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    // Prevent duplicate toasts for the same message and type
    const toastId = `${message}-${type}`;
    if (activeToasts.has(toastId)) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    activeToasts.add(toastId); // Add to active toasts set

    // Remove toast on click and from active set
    toast.addEventListener("click", () => {
      toast.remove();
      activeToasts.delete(toastId);
    });

    toastContainer.appendChild(toast);

    // Auto-remove toast after duration and from active set
    setTimeout(() => {
      // Check if toast still exists before trying to remove
      if (toast.parentNode === toastContainer) {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
          toast.remove();
          activeToasts.delete(toastId);
        }, 300); // Allow time for exit animation
      }
    }, duration);
  }

  /**
   * Validates if an email address is in a valid format.
   * @param {string} email - The email string to validate.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  /**
   * Validates if a password is strong enough (at least 6 characters and includes a number).
   * @param {string} password - The password string to validate.
   * @returns {boolean} True if the password is strong, false otherwise.
   */
  const isPasswordStrong = (password) =>
    password.length >= 6 && /\d/.test(password);

  /**
   * Triggers the animation for each letter in the animated title.
   * This is used when switching between forms to re-play the animation.
   */
  function triggerTitleAnimation() {
    letters.forEach((letter, index) => {
      // Set the CSS variable for staggered animation
      letter.style.setProperty("--index", index);
      // Remove any existing animation
      letter.style.animation = "none";
      // Trigger reflow to restart the animation
      void letter.offsetHeight;
      // Re-apply the animation defined in CSS
      letter.style.animation = "";
    });
  }

  // --- Initial Setup ---

  // Set data-index for letters for staggered animation
  if (letters.length > 0) {
    letters.forEach((letter, index) => {
      letter.style.setProperty("--index", index);
    });
  }

  // Set initial form state: Sign In is active by default.
  // This aligns with the common login page pattern.
  // If you want Sign Up to be default, set `signUpForm.classList.add("active");`
  // and `signInForm.classList.remove("active");` and potentially `container.classList.add("sign-up-mode");`
  signInForm.classList.add("active");
  signUpForm.classList.remove("active");
  container.classList.remove("sign-up-mode"); // Ensure container is in sign-in mode initially

  // Initialize International Telephone Input
  if (phoneInput && window.intlTelInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "ro", // Romania as per current location
      preferredCountries: ["ro", "us", "gb", "de", "fr"], // Updated preferred countries
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    // Live validation for phone number
    phoneInput.addEventListener("input", () => {
      if (iti.isValidNumber()) {
        if (phoneError) phoneError.style.display = "none";
      } else {
        if (phoneError) {
          phoneError.style.display = "block";
          phoneError.textContent = "Please enter a valid phone number!";
        }
      }
    });
  }

  // Live validation for email
  if (emailInput && emailError) {
    emailInput.addEventListener("input", () => {
      emailError.style.display = isEmailValid(emailInput.value)
        ? "none"
        : "block";
    });
  }

  // Live validation for sign-up password
  if (signUpPasswordInput && passwordError) {
    signUpPasswordInput.addEventListener("input", () => {
      passwordError.style.display = isPasswordStrong(signUpPasswordInput.value)
        ? "none"
        : "block";
    });
  }

  // --- Event Listeners ---

  // Handle form switching
  document
    .querySelectorAll(".switch-to-signin, .switch-to-signup")
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default anchor behavior

        const isSwitchToSignIn = button.classList.contains("switch-to-signin");

        if (isSwitchToSignIn) {
          container.classList.remove("sign-up-mode");
          signInForm.classList.add("active");
          signUpForm.classList.remove("active");
        } else {
          container.classList.add("sign-up-mode");
          signUpForm.classList.add("active");
          signInForm.classList.remove("active");
        }
        triggerTitleAnimation(); // Re-trigger animation on every switch
        activeToasts.clear(); // Clear active toasts when switching forms
        // Hide all error messages when switching forms
        document
          .querySelectorAll(".error-message")
          .forEach((el) => (el.style.display = "none"));
      });
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

  // Sign Up Form Submission
  if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let hasError = false;

      // Validate phone number
      if (phoneInput && iti && !iti.isValidNumber()) {
        showToast("Please enter a valid phone number.", "error");
        phoneInput.focus();
        hasError = true;
      }

      // Validate email
      if (emailInput && !isEmailValid(emailInput.value)) {
        showToast("Please enter a valid email address.", "error");
        emailInput.focus();
        hasError = true;
      }

      // Validate password
      if (signUpPasswordInput && !isPasswordStrong(signUpPasswordInput.value)) {
        showToast(
          "Password must be at least 6 characters and include a number.",
          "error"
        );
        signUpPasswordInput.focus();
        hasError = true;
      }

      if (!hasError) {
        // All validations passed, proceed with sign-up
        showToast("Account created successfully!", "success");
        signUpForm.reset(); // Clear form fields
        if (iti) iti.reset(); // Reset phone input
        activeToasts.clear(); // Clear all active toasts on successful submission
        // Hide error messages
        if (phoneError) phoneError.style.display = "none";
        if (emailError) emailError.style.display = "none";
        if (passwordError) passwordError.style.display = "none";

        // Potentially switch to sign-in form after successful sign-up
        // Find the sign-in button within the sign-up form's context or a global one
        const switchToSignInBtn = document.querySelector(
          ".sign-up-form .switch-to-signin"
        );
        if (switchToSignInBtn) {
          switchToSignInBtn.click(); // Programmatically click to switch
        }
      }
    });
  }

  // Sign In Form Submission
  if (signInForm) {
    signInForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Ensure signInPasswordInput exists before accessing its value
      const password = signInPasswordInput?.value || "";

      if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        signInPasswordInput?.focus(); // Use optional chaining for focus too
        return;
      }

      // Here you would typically send data to your server for authentication
      showToast("Logged in successfully!", "success");
      signInForm.reset();
      activeToasts.clear(); // Clear all active toasts on successful submission
      // Redirect or perform other actions after successful login
      // window.location.href = "/Components/home.html"; // Example redirect
    });
  }

  // --- Google Sign-In Integration ---

  // Google Sign-In Response Handler
  window.handleCredentialResponse = (response) => {
    const jwt = response.credential;
    const data = parseJwt(jwt);

    if (data) {
      showToast(`Welcome, ${data.name || "User"}!`, "success");
      localStorage.setItem("authToken", jwt);
      activeToasts.clear(); // Clear all active toasts on successful Google sign-in
      // Redirect to home page or dashboard
      // window.location.href = "/Components/home.html";
    } else {
      showToast("Google sign-in failed. Please try again.", "error");
    }
  };

  // Initialize Google Sign-In buttons
  // Only try to initialize if the Google global object exists
  if (window.google && window.google.accounts && window.google.accounts.id) {
    // Use your actual Google OAuth Client ID
    const clientId =
      "57706195065-klr8q7oot7ee889ohh40o9jp1huc7420.apps.googleusercontent.com";

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

    // Optional: for One Tap prompt
    // google.accounts.id.prompt();
  }

  // Optional: for One Tap prompt
  // google.accounts.id.prompt();
});
