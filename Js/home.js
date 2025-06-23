// Navbar toggle
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const overlay = document.getElementById("overlay");

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  overlay.classList.toggle("active");
});

overlay?.addEventListener("click", () => {
  navLinks.classList.remove("show");
  overlay.classList.remove("active");
});

// Charts
const usageCtx = document.getElementById("usageChart").getContext("2d");
const reviewsCtx = document.getElementById("reviewsChart").getContext("2d");

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
      y: { ticks: { color: "#e0e0ff" }, grid: { color: "#31003f" }, max: 100 },
    },
  },
});
