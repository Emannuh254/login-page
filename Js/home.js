// Navbar toggle
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  navLinks.classList.remove("show");
  overlay.classList.remove("active");
});

// Chart.js charts

const usageCtx = document.getElementById("usageChart").getContext("2d");
const reviewsCtx = document.getElementById("reviewsChart").getContext("2d");

// Bots usage chart (line chart)
const usageChart = new Chart(usageCtx, {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active Bots",
        data: [12, 15, 14, 18, 20, 22, 25],
        backgroundColor: "rgba(199, 125, 255, 0.3)",
        borderColor: "#c77dff",
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "#aa4de8",
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#e0e0ff" },
        grid: { color: "#4a0072" },
      },
      x: {
        ticks: { color: "#e0e0ff" },
        grid: { color: "#4a0072" },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#c77dff" },
      },
    },
  },
});

// User reviews chart (bar chart)
const reviewsChart = new Chart(reviewsCtx, {
  type: "bar",
  data: {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Reviews",
        data: [85, 10, 5],
        backgroundColor: ["#aa4de8", "#c77dff88", "#ff6f6f"],
        borderColor: "#c77dff",
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#e0e0ff" },
        grid: { color: "#4a0072" },
      },
      x: {
        ticks: { color: "#e0e0ff" },
        grid: { color: "#4a0072" },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});
