const bots = [
  { price: 1000, daily: 70 },
  { price: 2000, daily: 140 },
  { price: 4000, daily: 280 },
  { price: 7000, daily: 490 },
  { price: 10000, daily: 700 },
  { price: 15000, daily: 1050 },
  { price: 30000, daily: 2100 },
];

const container = document.getElementById("botContainer");

// Helper: Toggle Modal visibility
function toggleModal(show) {
  const modal = document.getElementById("paymentModal");
  const overlay = document.getElementById("modalOverlay");
  modal.classList.toggle("show", show);
  overlay.classList.toggle("show", show);
}

// Modal Buttons
document.querySelector(".confirm-pay").addEventListener("click", () => {
  toggleModal(false);
});
document.querySelector(".cancel-pay").addEventListener("click", () => {
  toggleModal(false);
});

bots.forEach((bot, index) => {
  const totalIn30Days = bot.daily * 30;

  const card = document.createElement("div");
  card.className = "bot-card";

  card.innerHTML = `
    <img src="/images/pic${index + 1}.jpg" alt="${
    bot.price
  } Bot" class="bot-image" />
    <h2>${bot.price.toLocaleString()} Ksh Bot</h2>
    <p>Earns: ${bot.daily.toLocaleString()} Ksh/day</p>
    <p><strong>Total in 30 Days: ${totalIn30Days.toLocaleString()} Ksh</strong></p>
    <p>Expires in: <span class="days-left">30</span> days</p>
    <button class="buy-btn">Buy Bot</button>
    <button class="claim-btn" disabled>Claim Earnings</button>
    <p class="earnings">Total Claimed: <span class="total-earned">0</span> Ksh</p>
  `;

  container.appendChild(card);

  const buyBtn = card.querySelector(".buy-btn");
  const claimBtn = card.querySelector(".claim-btn");
  const daysLeftSpan = card.querySelector(".days-left");
  const earningsSpan = card.querySelector(".total-earned");

  let daysLeft = 30;
  let totalEarnings = 0;
  let claimedToday = false;
  let intervalStarted = false;

  function handleClaim() {
    if (claimedToday || daysLeft <= 0) return;

    totalEarnings += bot.daily;
    earningsSpan.textContent = totalEarnings.toLocaleString();
    daysLeft--;
    daysLeftSpan.textContent = daysLeft;

    claimedToday = true;
    claimBtn.disabled = true;

    if (daysLeft <= 0) {
      card.classList.add("expired");
      claimBtn.disabled = true;
      const expiredLabel = document.createElement("p");
      expiredLabel.className = "expired-label";
      expiredLabel.textContent = "Bot Expired";
      card.appendChild(expiredLabel);
    }
  }

  claimBtn.addEventListener("click", handleClaim);

  buyBtn.addEventListener("click", () => {
    if (intervalStarted) return;

    toggleModal(true);

    buyBtn.disabled = true;
    claimBtn.disabled = false;
    intervalStarted = true;

    const interval = setInterval(() => {
      if (daysLeft <= 0) {
        clearInterval(interval);
        claimBtn.disabled = true;
        return;
      }
      claimedToday = false;
      claimBtn.disabled = false;
    }, 500);
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

  if (!user || !token) {
    // User not authenticated, redirect to login
    window.location.href = "https://emannuh254.github.io/login-page/index.html";
  }
});
