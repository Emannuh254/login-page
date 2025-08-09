document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  fetch("http://localhost:8000/api/user", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(async (res) => {
    if (!res.ok) {
      window.location.href = "/index.html";
      return;
    }
    return res.json();
  })
  .then((user) => {
    if (!user) return;

    // Display user info
    document.getElementById("user-name").textContent = user.name || "User Name";

    const username = user.name
      ? "@" + user.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/gi, "")
      : "@username";
    document.getElementById("user-username").textContent = username;

    document.getElementById("user-email").textContent = user.email || "email@example.com";

    // Referrals and total earned
    const referralsStrong = document.querySelector(".referrals-card p strong.referrals-count");
    const totalEarnedStrong = document.querySelector(".referrals-card p strong.earned-amount");

    if (referralsStrong) {
      referralsStrong.textContent = `${user.referrals || 0} users`;
    }
    if (totalEarnedStrong) {
      totalEarnedStrong.textContent = `Ksh ${user.total_earned || 0}`;
    }
  })
  .catch(() => {
    window.location.href = "/index.html";
  });

  // Rest of your existing charts and hamburger menu code here...
  // ...
});
