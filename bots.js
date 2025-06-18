let balance = 0;
const balanceDisplay = document.getElementById("balance");
const transactionsList = document.getElementById("transactions");
const messageBox = document.getElementById("message");
const airtelIcon = document.getElementById("airtel-icon");

// Update balance display
function updateBalance() {
  balanceDisplay.innerText = `Ksh ${balance.toFixed(2)}`;
}

// Handle deposit
document.querySelectorAll(".deposit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("custom-deposit").value = btn.dataset.amount;
  });
});

function deposit() {
  const amount = parseFloat(document.getElementById("custom-deposit").value);
  if (isNaN(amount) || amount < 200) {
    showMessage("Minimum deposit is Ksh 200", "red");
    return;
  }

  balance += amount;
  updateBalance();
  addTransaction(`+ Ksh ${amount} (Deposit)`);
  showMessage(`Successfully deposited Ksh ${amount}`, "lightgreen");
}

// Handle withdrawal
function withdraw() {
  const amount = parseFloat(document.getElementById("withdraw-amount").value);
  const method = document.getElementById("payment-method").value;

  airtelIcon.style.display = "none";

  if (isNaN(amount) || amount < 200) {
    showMessage("Minimum withdrawal is Ksh 200", "red");
    return;
  }

  if (amount > balance) {
    showMessage("Insufficient balance", "red");
    return;
  }

  if (method === "airtel") {
    airtelIcon.style.display = "block";
    showMessage("Airtel option is still under development.", "orange");
    return;
  }

  balance -= amount;
  updateBalance();
  addTransaction(`− Ksh ${amount} (Withdraw via ${method})`);
  showMessage(`Successfully withdrawn Ksh ${amount}`, "lightgreen");
}

// Utility functions
function showMessage(text, color) {
  messageBox.style.color = color;
  messageBox.innerText = text;
}

function addTransaction(entry) {
  const li = document.createElement("li");
  li.innerText = entry;
  transactionsList.prepend(li);
}
