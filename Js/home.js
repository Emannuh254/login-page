document.addEventListener("DOMContentLoaded", () => {
  // Load navbar HTML dynamically
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;

      // Navbar toggle setup AFTER navbar is loaded
      const menuToggle = document.getElementById("menu-toggle");
      const navLinks = document.getElementById("nav-links");
      const overlay = document.getElementById("overlay");

      if (menuToggle && navLinks && overlay) {
        menuToggle.addEventListener("click", () => {
          navLinks.classList.toggle("active");
          overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", () => {
          navLinks.classList.remove("active");
          overlay.classList.remove("active");
        });
      }
    })
    .catch((error) => console.error("Failed to load navbar:", error));

  // Initialize charts (assumes canvas elements exist on page)
  const usageChartCanvas = document.getElementById("usageChart");
  const reviewsChartCanvas = document.getElementById("reviewsChart");

  if (usageChartCanvas && reviewsChartCanvas) {
    const usageCtx = usageChartCanvas.getContext("2d");
    const reviewsCtx = reviewsChartCanvas.getContext("2d");

    new Chart(usageCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Active Bots",
            data: [5, 10, 7, 12, 15, 18, 22],
            borderColor: "#c77dff",
            backgroundColor: "rgba(199,125,255,0.2)",
            tension: 0.3,
            pointBackgroundColor: "#aa4de8",
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#c77dff" } } },
        scales: {
          x: { ticks: { color: "#e0e0ff" }, grid: { color: "#31003f" } },
          y: { ticks: { color: "#e0e0ff" }, grid: { color: "#31003f" } },
        },
      },
    });

    new Chart(reviewsCtx, {
      type: "bar",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [
          {
            data: [85, 10, 5],
            backgroundColor: ["#aa4de8", "#888", "#ff6f6f"],
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#e0e0ff" }, grid: { color: "#31003f" } },
          y: {
            ticks: { color: "#e0e0ff" },
            grid: { color: "#31003f" },
            max: 100,
          },
        },
      },
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

  if (!user || !token) {
    // User not authenticated, redirect to login
    window.location.href = "https://emannuh254.github.io/login-page/index.html";
  }
});
