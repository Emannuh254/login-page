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
      if (input.type === "password") {
        input.type = "text";
        toggle.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        toggle.classList.replace("fa-eye-slash", "fa-eye");
      }
    }
  });
});

// Initialize international phone input
const phoneInput = document.querySelector("#phone");
const phoneError = document.getElementById("phone-error");

if (phoneInput) {
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
