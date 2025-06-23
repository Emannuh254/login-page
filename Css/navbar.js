document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navbar = document.getElementById("navbar");
  const overlay = document.getElementById("overlay");

  // Function to open the navbar
  const openNavbar = () => {
    navbar.classList.add("active");
    overlay.classList.add("active");
    // Disable body scroll when navbar is open
    document.body.style.overflow = "hidden";
  };

  // Function to close the navbar
  const closeNavbar = () => {
    navbar.classList.remove("active");
    overlay.classList.remove("active");
    // Enable body scroll when navbar is closed
    document.body.style.overflow = "auto";
  };

  // Toggle mechanism for the hamburger icon
  menuToggle.addEventListener("click", () => {
    if (navbar.classList.contains("active")) {
      closeNavbar();
    } else {
      openNavbar();
    }
  });

  // Close navbar when a link is clicked (optional, but good for UX)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavbar);
  });

  // Close navbar when clicking outside (on the overlay)
  overlay.addEventListener("click", closeNavbar);

  // Close navbar on escape key (optional)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navbar.classList.contains("active")) {
      closeNavbar();
    }
  });

  // Handle initial state and resize events
  const handleResize = () => {
    if (window.innerWidth >= 992) {
      // If desktop, ensure navbar is active and overlay/toggle are hidden
      navbar.classList.add("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "auto"; // Ensure scroll is enabled on desktop
    } else {
      // If mobile, ensure navbar is closed unless explicitly opened
      // But don't force close if it was opened by user on mobile and then resized to smaller
      // Only close if it's currently open AND width is below desktop breakpoint
      if (navbar.classList.contains("active") && window.innerWidth < 992) {
        // Do nothing, let user manually close or keep it open if it was already open
      } else if (
        !navbar.classList.contains("active") &&
        window.innerWidth < 992
      ) {
        closeNavbar(); // Ensure it's closed if not active on mobile
      }
    }
  };

  // Initial call on load
  handleResize();
  // Listen for resize events
  window.addEventListener("resize", handleResize);
});
