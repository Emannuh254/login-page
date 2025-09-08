const hamburgerBtn = document.getElementById("hamburger-btn");
const navbar = document.getElementById("navbar");
const overlay = document.getElementById("overlay");

hamburgerBtn.onclick = () => {
  const open = navbar.classList.toggle("active");
  overlay.classList.toggle("active", open);
  navbar.setAttribute("aria-hidden", open ? "false" : "true");
};

overlay.onclick = () => {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  navbar.setAttribute("aria-hidden", "true");
};

async function loadReferralData() {
  try {
    const res = await fetch("/api/referral-data");
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    document.getElementById("userName").textContent = data.user.name;
    document.getElementById("userEmail").textContent = data.user.email;
    document.getElementById("referralLink").textContent = data.referralLink;

    const tbody = document.getElementById("referralList");
    if (data.referredUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#777;">No referred users yet.</td></tr>`;
    } else {
      tbody.innerHTML = data.referredUsers
        .map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.dateJoined}</td></tr>`)
        .join("");
    }
  } catch {
    const tbody = document.getElementById("referralList");
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#f55;">Failed to load data</td></tr>`;
  }
}

function copyReferral() {
  const link = document.getElementById("referralLink").textContent;
  navigator.clipboard.writeText(link)
    .then(() => alert("Referral link copied!"))
    .catch(() => alert("Failed to copy referral link."));
}

document.addEventListener("DOMContentLoaded", loadReferralData);
