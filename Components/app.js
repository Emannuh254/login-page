document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://flipmarket-backend.onrender.com"; // Replace with your backend URL
  const token = localStorage.getItem("authToken");

  if (!token) {
    // No token found — redirect to login
    window.location.href = "https://flipmarkert.gt.tc";
    return;
  }

  // Fetch user info
  fetch(`${API_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        // Token invalid or expired
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "https://flipmarkert.gt.tc";
        return;
      }
      return res.json();
    })
    .then((user) => {
      if (!user) return;

      document.getElementById("user-name").textContent = user.name || "Guest";
      document.getElementById("user-email").textContent =
        user.email || "guest@example.com";
      document.getElementById("user-username").textContent =
        "@" + (user.name?.split(" ")[0] || "guest").toLowerCase().replace(/[^a-z0-9]/gi, "");

      document.querySelector(".referrals-count").textContent = `${user.referrals} users`;
      document.querySelector(".earned-amount").textContent = `Ksh ${user.balance.toFixed(2)}`;
    })
    .catch(console.error);

  // Fetch bots list
  fetch(`${API_URL}/bots`)
    .then((res) => res.json())
    .then((data) => {
      const botsList = document.getElementById("bots-list");
      if (!botsList) return;

      if (data.bots && data.bots.length > 0) {
        botsList.innerHTML = ""; // clear previous

        data.bots.forEach((bot) => {
          const botEl = document.createElement("div");
          botEl.style.padding = "8px 0";
          botEl.style.borderBottom = "1px solid #333";
          botEl.textContent = `${bot.name} - Ksh ${bot.price.toFixed(2)}`;
          botsList.appendChild(botEl);
        });
      } else {
        botsList.textContent = "No bots available.";
      }
    })
    .catch(console.error);

  // Charts code
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
          x: {
            ticks: { color: "#e0e0ff" },
            grid: { color: "#31003f" },
          },
          y: {
            ticks: { color: "#e0e0ff" },
            grid: { color: "#31003f" },
          },
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
          x: {
            ticks: { color: "#e0e0ff" },
            grid: { color: "#31003f" },
          },
          y: {
            ticks: { color: "#e0e0ff" },
            grid: { color: "#31003f" },
            max: 100,
          },
        },
      },
    });
  }

  // Hamburger menu
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navbar = document.getElementById("navbar");
  const overlay = document.getElementById("overlay");
  const navLinks = navbar.querySelectorAll("ul.nav-links li a");

  function closeNavbar() {
    navbar.classList.remove("active");
    overlay.classList.remove("active");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    navbar.setAttribute("aria-hidden", "true");
  }

  function openNavbar() {
    navbar.classList.add("active");
    overlay.classList.add("active");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    navbar.setAttribute("aria-hidden", "false");
  }

  hamburgerBtn.addEventListener("click", () => {
    navbar.classList.contains("active") ? closeNavbar() : openNavbar();
  });

  overlay.addEventListener("click", closeNavbar);
  navLinks.forEach((link) => link.addEventListener("click", closeNavbar));

  // Logout button
  const logoutBtn = document.getElementById("logout");
  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "https://flipmarkert.gt.tc";
  });
});
