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

bots.forEach((bot, index) => {
  const totalIn30Days = bot.daily * 30;
  const card = document.createElement("div");
  card.className = "bot-card";

  card.innerHTML = `
    <img src="images/pic${index + 1}.jpg" alt="${bot.price} Bot" />
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

  buyBtn.addEventListener("click", () => {
    buyBtn.disabled = true;

    // Daily claim reset every 50 seconds (simulate 24h)
    const interval = setInterval(() => {
      if (daysLeft <= 0) {
        clearInterval(interval);
        claimBtn.disabled = true;
        return;
      }

      claimedToday = false;
      claimBtn.disabled = false;
    }, 50000);

    claimBtn.addEventListener("click", () => {
      if (claimedToday || daysLeft <= 0) return;

      totalEarnings += bot.daily;
      earningsSpan.textContent = totalEarnings.toLocaleString();
      daysLeft--;
      daysLeftSpan.textContent = daysLeft;

      claimedToday = true;
      claimBtn.disabled = true;

      if (daysLeft <= 0) {
        claimBtn.disabled = true;
        card.classList.add("expired");
        const expiredLabel = document.createElement("p");
        expiredLabel.className = "expired-label";
        expiredLabel.textContent = "Bot Expired";
        card.appendChild(expiredLabel);
      }
    });

    claimBtn.disabled = false;
  });
});
