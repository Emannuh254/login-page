let balance = 0;
const balanceEl = document.getElementById("balance");
const transactionsEl = document.getElementById("transactions");

// Quick deposit buttons
document.querySelectorAll(".deposit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const amount = parseInt(btn.getAttribute("data-amount"));
    makeDeposit(amount);
  });
});

function deposit() {
  const input = document.getElementById("custom-deposit");
  const amount = parseInt(input.value);
  if (isNaN(amount) || amount < 200) {
    alert("Minimum deposit is Ksh 200.");
    return;
  }
  makeDeposit(amount);
  input.value = "";
}

function makeDeposit(amount) {
  balance += amount;
  updateBalance();
  addTransaction(`Deposited Ksh ${amount}`);
}

function withdraw() {
  const input = document.getElementById("withdraw-amount");
  const amount = parseInt(input.value);
  if (isNaN(amount) || amount < 200) {
    alert("Minimum withdrawal is Ksh 200.");
    return;
  }
  if (amount > balance) {
    alert("Insufficient balance.");
    return;
  }
  balance -= amount;
  updateBalance();
  addTransaction(`Withdrew Ksh ${amount}`);
  input.value = "";
}

function updateBalance() {
  balanceEl.textContent = `Ksh ${balance.toFixed(2)}`;
}

function addTransaction(text) {
  const li = document.createElement("li");
  li.textContent = text;
  transactionsEl.prepend(li);
}
// document.addEventListener("DOMContentLoaded", () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("authToken");

//   if (!user || !token) {
//     // User not authenticated, redirect to login
//     window.location.href = "https://emannuh254.github.io/login-page/index.html";
//   }
// });
