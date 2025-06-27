document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");

  // Load the navbar HTML and inject it
  fetch("/Components/navbar.html") // Adjust path as needed
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;

      // After loading, activate functionality
      const hamburgerBtn = document.getElementById("hamburger-btn");
      const navbar = document.getElementById("navbar");
      const overlay = document.getElementById("overlay");
      const navLinks = navbar.querySelectorAll("ul.nav-links li a");

      function closeNavbar() {
        navbar.classList.remove("active");
        overlay.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        navbar.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "auto";
      }

      function openNavbar() {
        navbar.classList.add("active");
        overlay.classList.add("active");
        hamburgerBtn.setAttribute("aria-expanded", "true");
        navbar.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      hamburgerBtn.addEventListener("click", () => {
        navbar.classList.contains("active") ? closeNavbar() : openNavbar();
      });

      overlay.addEventListener("click", closeNavbar);
      navLinks.forEach((link) => link.addEventListener("click", closeNavbar));

      // OPTIONAL: Highlight the current page
      const current = window.location.pathname.split("/").pop();
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.includes(current)) {
          link.classList.add("active");
        }
      });
    });
});
