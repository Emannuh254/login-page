document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/index.html"; // Redirect to login page
    return;
  }

  const API_URL = "https://flip-backend-5.onrender.com/api/user";

  // Elements to update
  const userNameEl = document.getElementById("user-name");
  const userUsernameEl = document.getElementById("user-username");
  const userEmailEl = document.getElementById("user-email");
  const referralsCountEl = document.querySelector(".referrals-count");
  // const totalEarnedEl = document.querySelector(".earned-amount"); // Uncomment if you track earnings server-side

  // Fetch user info from backend
  fetch(API_URL, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Unauthorized or error fetching user");
      return res.json();
    })
    .then(user => {
      // Display user info
      userNameEl.textContent = user.name || "User Name";
      
      // Create username from first name, cleaned up
      const username = user.name
        ? "@" + user.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
        : "@username";
      userUsernameEl.textContent = username;

      userEmailEl.textContent = user.email || "email@example.com";

      referralsCountEl.textContent = `${user.referrals || 0} users`;

      // If you have total_earned in API response:
      // totalEarnedEl.textContent = `Ksh ${user.total_earned || 0}`;
      
      // Initialize earnings chart after user data loaded
      initEarningsChart();
    })
    .catch(() => {
      // On error or invalid token, redirect to login
      window.location.href = "/index.html";
    });

  // Function to simulate and display real-time earnings chart
  function initEarningsChart() {
    const ctx = document.getElementById("earnings-chart").getContext("2d");

    // Initial empty data arrays
    const labels = [];
    const earningsData = [];

    // Starting earnings value
    let earnings = 0;

    // Create Chart.js line chart
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Bot Earnings (Ksh)",
          data: earningsData,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        animation: false,
        scales: {
          x: {
            title: { display: true, text: "Time (s)" }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Earnings (Ksh)" }
          }
        }
      }
    });

    // Update chart data every second (simulate earnings)
    let seconds = 0;
    setInterval(() => {
      seconds++;
      // Simulate earnings increment (random between 5-15)
      earnings += Math.floor(Math.random() * 11) + 5;

      labels.push(seconds.toString());
      earningsData.push(earnings);

      // Keep last 20 points only
      if (labels.length > 20) {
        labels.shift();
        earningsData.shift();
      }

      chart.update();
    }, 1000);
  }
});
