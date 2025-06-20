const cards = document.querySelectorAll(".bot-card");

const botCountDisplay = document.getElementById("bot-count");
const totalClaimedDisplay = document.getElementById("total-claimed");

const paymentModal = document.getElementById("paymentModal");
const modalOverlay = document.getElementById("modalOverlay");
const confirmBtn = document.querySelector(".confirm-pay");
const cancelBtn = document.querySelector(".cancel-pay");

const customPrompt = document.createElement("div");
customPrompt.className = "modal";
customPrompt.innerHTML = `
  <div class="modal-content">
    <h3>Insufficient Balance</h3>
    <p>You do not have enough balance to buy this bot.<br>Would you like to deposit now?</p>
    <div style="margin-top: 15px;">
      <button class="btn btn-yes">Yes, Deposit</button>
      <button class="btn btn-no">Cancel</button>
    </div>
  </div>
`;
document.body.appendChild(customPrompt);

let balance = 0;
let selectedCard = null;
let totalBotsActivated = 0;
let globalEarnings = 0;
const balanceDisplay = document.getElementById("balance");

function updateBalanceDisplay() {
  if (balanceDisplay) {
    balanceDisplay.textContent = `Ksh ${balance.toLocaleString()}`;
  }
}

cards.forEach((card) => {
  const price = parseInt(card.dataset.price);
  const daily = parseInt(card.dataset.daily);

  const buyBtn = card.querySelector(".buy-btn");
  const claimBtn = card.querySelector(".claim-btn");
  const daysLeftSpan = card.querySelector(".days-left");
  const earningsSpan = card.querySelector(".total-earned");

  let daysLeft = 30;
  let totalEarnings = 0;
  let claimedToday = false;
  let interval;

  buyBtn.addEventListener("click", () => {
    if (balance < price) {
      selectedCard = {
        card,
        buyBtn,
        claimBtn,
        daily,
        daysLeftSpan,
        earningsSpan,
        price,
      };
      showCustomPrompt();
      return;
    }

    activateBot({
      card,
      buyBtn,
      claimBtn,
      daily,
      daysLeftSpan,
      earningsSpan,
      price,
    });
  });

  cancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  confirmBtn.addEventListener("click", () => {
    closeModal();
    if (!selectedCard) return;

    const depositAmount = selectedCard.price;
    balance += depositAmount;
    updateBalanceDisplay();

    activateBot(selectedCard);
  });
});

// Activate Bot Logic
function activateBot({
  card,
  buyBtn,
  claimBtn,
  daily,
  daysLeftSpan,
  earningsSpan,
  price,
}) {
  if (balance < price) {
    return;
  }

  balance -= price;
  updateBalanceDisplay();

  buyBtn.disabled = true;
  buyBtn.textContent = "Activated";
  claimBtn.disabled = false;

  totalBotsActivated++;
  botCountDisplay.textContent = totalBotsActivated;

  let daysLeft = 30;
  let totalEarnings = 0;
  let claimedToday = false;

  const interval = setInterval(() => {
    if (daysLeft > 0) {
      claimedToday = false;
      claimBtn.disabled = false;
    } else {
      clearInterval(interval);
      claimBtn.disabled = true;
    }
  }, 50);

  if (!claimBtn.hasAttribute("data-bound")) {
    claimBtn.setAttribute("data-bound", "true");

    claimBtn.addEventListener("click", () => {
      if (claimedToday || daysLeft <= 0) return;

      totalEarnings += daily;
      earningsSpan.textContent = totalEarnings.toLocaleString();
      daysLeft--;
      daysLeftSpan.textContent = daysLeft;
      claimedToday = true;
      claimBtn.disabled = true;

      globalEarnings += daily;
      totalClaimedDisplay.textContent = globalEarnings.toLocaleString();

      if (daysLeft <= 0) {
        clearInterval(interval);
        claimBtn.disabled = true;
        const expired = document.createElement("p");
        expired.className = "expired-label";
        expired.textContent = "Bot Expired";
        card.appendChild(expired);
      }
    });
  }
}

// Modal Controls
function openModal() {
  paymentModal.style.display = "flex";
  modalOverlay.style.display = "block";
}

function closeModal() {
  paymentModal.style.display = "none";
  modalOverlay.style.display = "none";
  selectedCard = null;
}

function showCustomPrompt() {
  customPrompt.style.display = "flex";
  modalOverlay.style.display = "block";

  const yesBtn = customPrompt.querySelector(".btn-yes");
  const noBtn = customPrompt.querySelector(".btn-no");

  yesBtn.onclick = () => {
    customPrompt.style.display = "none";
    openModal();
  };

  noBtn.onclick = () => {
    customPrompt.style.display = "none";
    modalOverlay.style.display = "none";
    selectedCard = null;
  };
}
