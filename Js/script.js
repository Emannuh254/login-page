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

// ===== Initialize Intl Tel Input =====
const phoneInput = document.querySelector("#phone");
const phoneError = document.getElementById("phone-error");

let iti; // Store instance globally for later validation

if (phoneInput && phoneError) {
  iti = window.intlTelInput(phoneInput, {
    initialCountry: "ke",
    preferredCountries: ["ke", "ng", "us", "gb"],
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  phoneInput.addEventListener("input", () => {
    const value = phoneInput.value;
    const isValid = /^[\d+]*$/.test(value);

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

// ===== Validation Helpers =====
function isEmailValid(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isPasswordStrong(password) {
  return password.length >= 6 && /\d/.test(password);
}

// ===== Sign Up Form Validation =====
const signUpForm = document.querySelector(".sign-up-form");

signUpForm?.addEventListener("submit", function (e) {
  const phone = document.getElementById("phone");
  const email = signUpForm.querySelector('input[type="email"]');
  const password = document.getElementById("signUpPassword");

  let hasError = false;

  // Phone validity check
  if (iti && !iti.isValidNumber()) {
    phoneError.textContent = "Please enter a valid phone number!";
    phoneError.style.display = "block";
    phoneError.style.opacity = "1";
    hasError = true;
  }

  // Email format check
  if (!isEmailValid(email.value)) {
    alert("Please enter a valid email address.");
    hasError = true;
  }

  // Password strength check
  if (!isPasswordStrong(password.value)) {
    alert("Password must be at least 6 characters and include a number.");
    hasError = true;
  }

  if (hasError) {
    e.preventDefault(); // Stop form from submitting
  } else {
    // Valid data - connect to backend here later
    alert("Account created successfully!");
  }
});

// ===== Sign In Validation (optional) =====
const signInForm = document.querySelector(".sign-in-form");

signInForm?.addEventListener("submit", function (e) {
  const password = document.getElementById("signInPassword");

  if (password.value.length < 6) {
    alert("Password must be at least 6 characters.");
    e.preventDefault();
  }
});

// ===== Google Sign-In Token Handler =====
function handleCredentialResponse(response) {
  const jwt = response.credential;
  const data = parseJwt(jwt);
  console.log("Google User:", data);

  alert(`Welcome, ${data.name || "User"}!`);
  localStorage.setItem("authToken", jwt);
  window.location.href = "/Components/home.html"; // Redirect after login
}

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

// ===== Menu Toggle (Optional for Mobile Nav) =====
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

// ===== Logout Handler =====
const logout = document.getElementById("logout");
if (logout) {
  logout.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("authToken");
    window.location.href = "index.html"; // Adjust this route
  });
}
