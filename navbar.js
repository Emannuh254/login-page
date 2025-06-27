document.addEventListener("DOMContentLoaded", () => {
  fetch("navbar.html") // Use "./navbar.html" or just "navbar.html" if in same folder
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load navbar");
      return response.text();
    })
    .then((html) => {
      const container = document.getElementById("navbar-container");
      container.innerHTML = html;

      // Execute any <script> tags inside the loaded navbar
      container.querySelectorAll("script").forEach((oldScript) => {
        const newScript = document.createElement("script");
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });
    })
    .catch((error) => {
      console.error("Navbar loading error:", error);
    });
});
