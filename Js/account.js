// ===========================
// CONFIGURATION & STATE MANAGEMENT
// ===========================
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://flipmarket-backend.onrender.com' 
  : 'http://localhost:3001';

// Global state with persistence
let userData = {
  isLoggedIn: false,
  balance: 0,
  bots: [],
  totalClaimed: 0,
  dailyRate: 0,
  transactions: [],
  userInfo: {
    name: 'Guest User',
    email: 'guest@flipmarket.com',
    avatar: '',
    userId: '000000'
  },
  referralStatus: {
    isEligible: false,
    message: ''
  },
  requiresLogin: false
};

// Cache for Binance deposit address (admin-only)
let binanceDepositAddress = null;
let lastAddressFetch = 0;
const ADDRESS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// DOM Elements with better organization
const DOM = {
  // Navigation
  hamburgerBtn: document.getElementById("hamburger-btn"),
  navbar: document.getElementById("navbar"),
  overlay: document.getElementById("overlay"),
  
  // Notification
  notification: document.getElementById("notification"),
  notificationTitle: document.getElementById("notificationTitle"),
  notificationMessage: document.getElementById("notificationMessage"),
  
  // User Info
  userInfo: document.getElementById("userInfo"),
  userAvatar: document.getElementById("userAvatar"),
  userName: document.getElementById("userName"),
  userEmail: document.getElementById("userEmail"),
  
  // Forms
  depositForm: document.getElementById('deposit-form'),
  withdrawForm: document.getElementById('withdraw-form'),
  depositAmount: document.getElementById('deposit-amount'),
  withdrawAmount: document.getElementById('withdraw-amount'),
  
  // Payment methods
  paymentDetails: document.getElementById('payment-details'),
  withdrawMethod: document.getElementById('withdraw-method'),
  
  // Protected elements
  binanceDepositAddress: document.getElementById('binance-deposit-address'),
  protectedSections: document.querySelectorAll('.protected-section'),
  
  // Navigation links
  logoutBtn: document.getElementById("logout"),
  loginLink: document.getElementById("loginLink"),
  
  // Stats display
  accountBalance: document.getElementById("accountBalance"),
  activeBots: document.getElementById("activeBots"),
  totalEarned: document.getElementById("totalEarned"),
  dailyRate: document.getElementById("dailyRate"),
  
  // Container elements
  myBotsGrid: document.getElementById("myBotsGrid"),
  transactionsContainer: document.getElementById("transactionsContainer"),
  
  // Profile elements
  profileAvatarLarge: document.getElementById("profileAvatarLarge"),
  profileName: document.getElementById("profileName"),
  profileEmailDisplay: document.getElementById("profileEmailDisplay"),
  userId: document.getElementById("userId")
};

// ===========================
// AUTHENTICATION MANAGEMENT
// ===========================

// Enhanced auth requirement check
function requireAuth(actionName, redirect = true) {
  if (!userData.isLoggedIn) {
    showNotification("Authentication Required", `Please log in to ${actionName}.`);
    
    if (redirect) {
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    }
    return false;
  }
  return true;
}

// ===========================
// INITIALIZATION & DATA FETCHING
// ===========================

async function init() {
  try {
    // Show loading state
    setLoadingState(true);
    
    // Fetch user data from backend (handles both logged in and guest states)
    await fetchUserData();
    
    // Update UI based on auth status
    updateAuthUI();
    updateProtectedElements();
    
    // Render all data
    renderAccountInfo();
    renderMyBots();
    renderTransactions();
    
    // Set up auto-refresh for logged-in users
    if (userData.isLoggedIn) {
      setupAutoRefresh();
      setupIdleRefresh();
    }
    
    // Check session periodically for guests
    setupSessionMonitor();
    
  } catch (error) {
    console.error('Initialization error:', error);
    showNotification("Error", "Failed to load your account data. Please refresh.");
    
    // Fallback to guest mode
    userData.isLoggedIn = false;
    userData.requiresLogin = true;
    updateAuthUI();
    updateProtectedElements();
  } finally {
    setLoadingState(false);
  }
}

// Enhanced user data fetching with retry logic
async function fetchUserData() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // Handle 401 - Not authenticated (guest mode)
      if (response.status === 401 || response.status === 403) {
        userData.isLoggedIn = false;
        userData.requiresLogin = true;
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.isLoggedIn && data.profile) {
        // User is logged in
        userData.isLoggedIn = true;
        userData.balance = data.stats?.balance || 0;
        userData.bots = data.bots || [];
        userData.totalClaimed = data.stats?.totalClaimed || 0;
        userData.dailyRate = data.stats?.dailyRate || 0;
        userData.transactions = data.transactions || [];
        userData.userInfo = {
          name: data.profile?.name || 'User',
          email: data.profile?.email,
          avatar: '',
          userId: data.profile?.userId || '000000'
        };
        userData.referralStatus = data.referralStatus || { isEligible: false, message: '' };
        userData.requiresLogin = false;
        
        // Fetch Binance address if needed
        if (Date.now() - lastAddressFetch > ADDRESS_CACHE_DURATION) {
          await fetchBinanceDepositAddress();
        }
      } else {
        // Not logged in or guest mode
        userData.isLoggedIn = false;
        userData.requiresLogin = true;
      }
      
      return;
      
    } catch (error) {
      retries--;
      console.error(`Fetch user data attempt ${3 - retries} failed:`, error);
      
      if (retries === 0) {
        // All retries failed
        userData.isLoggedIn = false;
        userData.requiresLogin = true;
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Fetch Binance deposit address (protected)
async function fetchBinanceDepositAddress() {
  if (!userData.isLoggedIn) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/account/binance-address`, {
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.address) {
        binanceDepositAddress = data.address;
        lastAddressFetch = Date.now();
        
        // Update UI if element exists
        updateBinanceAddressUI();
      }
    }
  } catch (error) {
    console.error('Error fetching Binance address:', error);
  }
}

// Update Binance address in UI
function updateBinanceAddressUI() {
  const binanceAddressElements = document.querySelectorAll('.binance-address');
  binanceAddressElements.forEach(el => {
    if (userData.isLoggedIn && binanceDepositAddress) {
      el.textContent = binanceDepositAddress;
      el.style.userSelect = 'auto';
      el.style.cursor = 'text';
      el.style.opacity = '1';
    } else {
      el.textContent = 'Log in to view deposit address';
      el.style.userSelect = 'none';
      el.style.cursor = 'default';
      el.style.opacity = '0.7';
    }
  });
}

// Clear local auth state
function clearLocalAuth() {
  // Clear auth cookies
  document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'is-authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// ===========================
// UI UPDATES & RENDER FUNCTIONS
// ===========================

function updateAuthUI() {
  if (userData.isLoggedIn) {
    // Show user info
    if (DOM.userInfo) DOM.userInfo.style.display = "flex";
    if (DOM.userAvatar) DOM.userAvatar.textContent = userData.userInfo.name.charAt(0).toUpperCase();
    if (DOM.userName) DOM.userName.textContent = userData.userInfo.name;
    if (DOM.userEmail) DOM.userEmail.textContent = userData.userInfo.email;
    
    // Show logout, hide login
    if (DOM.logoutBtn) DOM.logoutBtn.style.display = "block";
    if (DOM.loginLink) DOM.loginLink.style.display = "none";
    
  } else {
    // Show guest info
    if (DOM.userInfo) DOM.userInfo.style.display = "none";
    
    // Show login, hide logout
    if (DOM.logoutBtn) DOM.logoutBtn.style.display = "none";
    if (DOM.loginLink) DOM.loginLink.style.display = "block";
    
    // Set guest info
    if (DOM.userAvatar) DOM.userAvatar.textContent = 'G';
    if (DOM.userName) DOM.userName.textContent = 'Guest User';
    if (DOM.userEmail) DOM.userEmail.textContent = 'guest@flipmarket.com';
  }
}

// Update protected elements based on auth status
function updateProtectedElements() {
  const isLoggedIn = userData.isLoggedIn;
  
  // Update protected sections
  if (DOM.protectedSections) {
    DOM.protectedSections.forEach(section => {
      const action = section.dataset.authAction;
      
      if (action === 'hide-if-guest' && !isLoggedIn) {
        section.style.display = 'none';
      } else if (action === 'show-if-loggedin' && isLoggedIn) {
        section.style.display = 'block';
      } else if (action === 'disable-if-guest' && !isLoggedIn) {
        section.querySelectorAll('input, button, select, textarea').forEach(el => {
          el.disabled = true;
          el.style.opacity = '0.6';
          el.style.cursor = 'not-allowed';
        });
      }
    });
  }
  
  // Update Binance address visibility
  updateBinanceAddressUI();
  
  // Handle forms
  if (DOM.depositForm) {
    DOM.depositForm.style.display = isLoggedIn ? 'block' : 'none';
  }
  
  if (DOM.withdrawForm) {
    DOM.withdrawForm.style.display = isLoggedIn ? 'block' : 'none';
  }
  
  // Show login prompt for guests
  if (!isLoggedIn) {
    const depositContent = document.getElementById('deposit-content');
    const withdrawContent = document.getElementById('withdraw-content');
    
    // Only add auth prompt if not already present
    if (depositContent && !depositContent.querySelector('.auth-prompt')) {
      const authPrompt = document.createElement('div');
      authPrompt.className = 'auth-prompt';
      authPrompt.style.cssText = `
        text-align: center;
        padding: 2rem;
        background: rgba(159, 84, 255, 0.05);
        border-radius: 12px;
        margin-top: 1.5rem;
        border: 1px solid rgba(159, 84, 255, 0.2);
      `;
      authPrompt.innerHTML = `
        <i class="fas fa-lock" style="font-size: 2rem; color: #9f54ff; margin-bottom: 1rem;"></i>
        <h3 style="margin: 0.5rem 0; color: #333;">Authentication Required</h3>
        <p style="color: #666; margin-bottom: 1.5rem;">Please log in to access deposit and withdrawal features.</p>
        <button onclick="window.location.href='index.html'" style="
          background: linear-gradient(135deg, #9f54ff, #6a11cb);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        ">
          <i class="fas fa-sign-in-alt"></i> Login Now
        </button>
      `;
      depositContent.appendChild(authPrompt);
    }
    
    if (withdrawContent && !withdrawContent.querySelector('.auth-prompt')) {
      const authPrompt = document.createElement('div');
      authPrompt.className = 'auth-prompt';
      authPrompt.style.cssText = `
        text-align: center;
        padding: 2rem;
        background: rgba(255, 107, 107, 0.05);
        border-radius: 12px;
        margin-top: 1.5rem;
        border: 1px solid rgba(255, 107, 107, 0.2);
      `;
      authPrompt.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
        <h3 style="margin: 0.5rem 0; color: #333;">Login Required</h3>
        <p style="color: #666; margin-bottom: 1.5rem;">Please log in to access withdrawal features.</p>
        <button onclick="window.location.href='index.html'" style="
          background: linear-gradient(135deg, #ff6b6b, #ff416c);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        ">
          <i class="fas fa-sign-in-alt"></i> Login Now
        </button>
      `;
      withdrawContent.appendChild(authPrompt);
    }
  } else {
    // Remove auth prompts if logged in
    const authPrompts = document.querySelectorAll('.auth-prompt');
    authPrompts.forEach(prompt => prompt.remove());
  }
}

// Render account information
function renderAccountInfo() {
  // Update profile info
  if (DOM.profileAvatarLarge) DOM.profileAvatarLarge.textContent = userData.userInfo.name.charAt(0).toUpperCase();
  if (DOM.profileName) DOM.profileName.textContent = userData.userInfo.name;
  if (DOM.profileEmailDisplay) DOM.profileEmailDisplay.textContent = userData.userInfo.email;
  if (DOM.userId) DOM.userId.textContent = `#${userData.userInfo.userId}`;
  
  // Update stats
  if (DOM.accountBalance) DOM.accountBalance.textContent = `$${userData.balance.toFixed(2)}`;
  if (DOM.activeBots) DOM.activeBots.textContent = userData.bots.filter(bot => bot.isActive).length;
  if (DOM.totalEarned) DOM.totalEarned.textContent = `$${userData.totalClaimed.toFixed(2)}`;
  if (DOM.dailyRate) DOM.dailyRate.textContent = `$${userData.dailyRate.toFixed(2)}/day`;
  
  // Update referral status notice
  const balanceCard = document.querySelector('.stat-card');
  const existingReferralNotice = document.getElementById('referral-notice');
  if (existingReferralNotice) existingReferralNotice.remove();

  if (!userData.referralStatus.isEligible && userData.referralStatus.message) {
    const notice = document.createElement('div');
    notice.id = 'referral-notice';
    notice.className = 'referral-notice';
    notice.style.cssText = `
      margin-top: 10px;
      padding: 8px;
      background: rgba(255, 85, 85, 0.1);
      border: 1px solid rgba(255, 85, 85, 0.3);
      border-radius: 8px;
      font-size: 0.85rem;
      color: #ff8888;
    `;
    notice.textContent = userData.referralStatus.message;
    if (balanceCard) balanceCard.appendChild(notice);
  }
}

// Render my bots
function renderMyBots() {
  if (!DOM.myBotsGrid) return;
  
  if (!userData.bots.length) {
    DOM.myBotsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-robot"></i>
        <p>You don't have any mining bots yet.</p>
        ${userData.isLoggedIn ? 
          '<p style="margin-top: 10px;"><a href="bots.html" style="color: #9f54ff; text-decoration: underline;">Purchase your first bot</a></p>' : 
          '<p style="margin-top: 10px;"><a href="index.html" style="color: #9f54ff; text-decoration: underline;">Login to purchase bots</a></p>'
        }
      </div>`;
    return;
  }

  DOM.myBotsGrid.innerHTML = '';
  userData.bots.forEach(bot => {
    const botCard = document.createElement("div");
    botCard.className = "bot-item";
    botCard.innerHTML = `
      <div class="bot-item-header">
        <div class="bot-item-name">${bot.bot_types?.name || 'Unknown Bot'}</div>
        <div class="bot-status ${bot.isActive ? 'active' : 'expired'}">
          ${bot.isActive ? 'Active' : 'Expired'}
        </div>
      </div>
      <div class="bot-item-details">
        <div class="bot-detail-row">
          <span>Daily Earning:</span>
          <span>$${bot.bot_types?.daily_earning?.toFixed(2) || '0.00'}</span>
        </div>
        <div class="bot-detail-row">
          <span>Days Left:</span>
          <span>${bot.daysLeft || 0} days</span>
        </div>
        <div class="bot-detail-row">
          <span>Total Earned:</span>
          <span>$${bot.totalEarnedSoFar?.toFixed(2) || '0.00'}</span>
        </div>
      </div>`;
    DOM.myBotsGrid.appendChild(botCard);
  });
}

// Render transactions
function renderTransactions() {
  if (!DOM.transactionsContainer) return;
  
  if (!userData.transactions.length) {
    DOM.transactionsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>No transactions yet.</p>
        ${!userData.isLoggedIn ? 
          '<p style="margin-top: 10px;"><a href="index.html" style="color: #9f54ff; text-decoration: underline;">Login to see transactions</a></p>' : 
          ''
        }
      </div>`;
    return;
  }

  DOM.transactionsContainer.innerHTML = '';
  userData.transactions.slice().reverse().forEach(tx => {
    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";

    const isPositive = tx.type === "claim" || tx.type === "deposit";
    const amountSign = isPositive ? "+" : "-";

    transactionItem.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-type">
          <i class="fas fa-${tx.type === 'claim' ? 'coins' : tx.type === 'purchase' ? 'shopping-cart' : 'wallet'}"></i>
          ${tx.description || 'Transaction'}
        </div>
        <div class="transaction-date">${new Date(tx.date || tx.created_at).toLocaleString()}</div>
      </div>
      <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
        ${amountSign}$${Math.abs(tx.amount).toFixed(2)}
      </div>`;
    DOM.transactionsContainer.appendChild(transactionItem);
  });
}

// Set loading state
function setLoadingState(isLoading) {
  const loader = document.getElementById('page-loader');
  const mainContent = document.getElementById('main-content');
  
  if (loader && mainContent) {
    if (isLoading) {
      loader.style.display = 'flex';
      mainContent.style.opacity = '0.5';
      mainContent.style.pointerEvents = 'none';
    } else {
      loader.style.display = 'none';
      mainContent.style.opacity = '1';
      mainContent.style.pointerEvents = 'auto';
    }
  }
}

// Setup auto-refresh for logged-in users
function setupAutoRefresh() {
  // Refresh data every 30 seconds
  setInterval(async () => {
    if (userData.isLoggedIn) {
      try {
        await fetchUserData();
        renderAccountInfo();
        renderMyBots();
        renderTransactions();
      } catch (error) {
        console.log('Auto-refresh failed:', error);
      }
    }
  }, 30000);
}

// Setup idle refresh (when user comes back to tab)
function setupIdleRefresh() {
  let lastActive = Date.now();
  
  document.addEventListener('mousemove', () => lastActive = Date.now());
  document.addEventListener('keypress', () => lastActive = Date.now());
  
  setInterval(() => {
    if (userData.isLoggedIn && Date.now() - lastActive > 5 * 60 * 1000) {
      // User idle for 5+ minutes, refresh session
      fetchUserData().catch(console.error);
    }
  }, 60000); // Check every minute
}

// Monitor session status
function setupSessionMonitor() {
  setInterval(async () => {
    if (!userData.isLoggedIn) {
      // Quick session check for guests
      try {
        const response = await fetch(`${API_BASE_URL}/account/session-check`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.isLoggedIn && !userData.isLoggedIn) {
            // User logged in from another tab
            location.reload();
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, 10000); // Check every 10 seconds
}

// ===========================
// EVENT HANDLERS
// ===========================

// Initialize event listeners
function initEventListeners() {
  // Hamburger menu
  if (DOM.hamburgerBtn) {
    DOM.hamburgerBtn.addEventListener("click", () => {
      const isActive = DOM.navbar.classList.toggle("active");
      if (DOM.overlay) DOM.overlay.classList.toggle("active", isActive);
      DOM.hamburgerBtn.setAttribute("aria-expanded", isActive);
      if (DOM.navbar) DOM.navbar.setAttribute("aria-hidden", !isActive);
    });
  }
  
  // Overlay click
  if (DOM.overlay) {
    DOM.overlay.addEventListener("click", () => {
      if (DOM.navbar) DOM.navbar.classList.remove("active");
      DOM.overlay.classList.remove("active");
      DOM.hamburgerBtn.setAttribute("aria-expanded", "false");
      if (DOM.navbar) DOM.navbar.setAttribute("aria-hidden", "true");
    });
  }
  
  // Logout
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  }
  
  // Form submissions with auth check
  setupFormHandlers();
  
  // Payment tab switching
  const paymentTabs = document.querySelectorAll('.payment-tab');
  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchPaymentTab(tabName);
    });
  });
}

// Setup form handlers
function setupFormHandlers() {
  // M-Pesa deposit
  const mpesaDepositBtn = document.getElementById('mpesa-deposit-btn');
  if (mpesaDepositBtn) {
    mpesaDepositBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!requireAuth('deposit funds')) return;
      await handleMpesaDeposit();
    });
  }
  
  // Binance deposit
  const binanceDepositBtn = document.getElementById('binance-deposit-btn');
  if (binanceDepositBtn) {
    binanceDepositBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!requireAuth('deposit via Binance')) return;
      await handleBinanceDeposit();
    });
  }
  
  // M-Pesa withdrawal
  const mpesaWithdrawBtn = document.getElementById('mpesa-withdraw-btn');
  if (mpesaWithdrawBtn) {
    mpesaWithdrawBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!requireAuth('withdraw funds')) return;
      await handleMpesaWithdraw();
    });
  }
  
  // Binance withdrawal
  const binanceWithdrawBtn = document.getElementById('binance-withdraw-btn');
  if (binanceWithdrawBtn) {
    binanceWithdrawBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!requireAuth('withdraw via Binance')) return;
      await handleBinanceWithdraw();
    });
  }
}

// ===========================
// DEPOSIT/WITHDRAWAL HANDLERS
// ===========================

async function handleMpesaDeposit() {
  if (!requireAuth('deposit funds')) return;
  
  const amount = parseFloat(DOM.depositAmount?.value || 0);
  const phone = document.getElementById('deposit-phone')?.value;
  
  // Validation
  if (!amount || amount < 1) {
    showNotification("Error", "Enter a valid amount (minimum $1)", "error");
    return;
  }
  
  if (!phone || !/^(07|01)\d{8}$/.test(phone.replace(/\s/g, ''))) {
    showNotification("Error", "Valid Kenyan phone number required", "error");
    return;
  }
  
  const submitBtn = document.querySelector('#mpesa-deposit-form button');
  const originalText = submitBtn.innerHTML;
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    const response = await fetch(`${API_BASE_URL}/account/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        amount, 
        phone,
        method: 'mpesa'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Deposit failed');
    }
    
    showNotification("Success", "STK Push initiated! Check your phone for PIN prompt.", "success");
    
    // Reset form
    if (DOM.depositAmount) DOM.depositAmount.value = '';
    if (document.getElementById('deposit-phone')) {
      document.getElementById('deposit-phone').value = '';
    }
    
    // Refresh user data after short delay
    setTimeout(async () => {
      await fetchUserData();
      renderAccountInfo();
      renderTransactions();
    }, 3000);
    
  } catch (error) {
    console.error('Deposit error:', error);
    showNotification("Error", error.message || "Deposit failed", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

async function handleBinanceDeposit() {
  if (!requireAuth('deposit via Binance')) return;
  
  const amount = parseFloat(document.getElementById('binance-deposit-amount')?.value || 0);
  const transactionHash = document.getElementById('transaction-hash')?.value;
  const yourWallet = document.getElementById('your-wallet')?.value;
  
  if (!amount || amount < 10) {
    showNotification("Error", "Enter a valid amount (minimum $10)", "error");
    return;
  }
  
  if (!transactionHash) {
    showNotification("Error", "Transaction hash is required", "error");
    return;
  }
  
  const submitBtn = document.querySelector('#binance-deposit-form button');
  const originalText = submitBtn.innerHTML;
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    const response = await fetch(`${API_BASE_URL}/account/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        amount,
        method: 'binance',
        transactionHash,
        yourWallet: yourWallet || ''
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Deposit failed');
    }
    
    showNotification("Success", "Binance deposit submitted for verification!", "success");
    
    // Reset form
    document.getElementById('binance-deposit-amount').value = '';
    document.getElementById('transaction-hash').value = '';
    document.getElementById('your-wallet').value = '';
    
    // Refresh transactions
    setTimeout(async () => {
      await fetchUserData();
      renderTransactions();
    }, 2000);
    
  } catch (error) {
    console.error('Binance deposit error:', error);
    showNotification("Error", error.message || "Deposit failed", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

async function handleMpesaWithdraw() {
  if (!requireAuth('withdraw funds')) return;
  
  const amount = parseFloat(DOM.withdrawAmount?.value || 0);
  const phone = document.getElementById('withdraw-phone')?.value;
  
  if (!amount || amount < 5) {
    showNotification("Error", "Minimum withdrawal is $5.00", "error");
    return;
  }
  
  if (!phone || !/^(07|01)\d{8}$/.test(phone.replace(/\s/g, ''))) {
    showNotification("Error", "Valid Kenyan phone number required", "error");
    return;
  }
  
  const submitBtn = document.querySelector('#mpesa-withdraw-form button');
  const originalText = submitBtn.innerHTML;
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // First check referral status
    const referralCheck = await fetch(`${API_BASE_URL}/account/withdraw/check-referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: userData.userInfo.userId })
    });
    
    const referralData = await referralCheck.json();
    
    if (!referralCheck.ok || !referralData.isEligible) {
      throw new Error(referralData.message || 'Referral condition not met');
    }
    
    // Proceed with withdrawal
    const response = await fetch(`${API_BASE_URL}/account/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        amount,
        method: 'mpesa',
        paymentDetails: phone
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Withdrawal request failed');
    }
    
    showNotification("Success", `Withdrawal request of $${amount.toFixed(2)} submitted! Processing may take 2-3 days.`, "success");
    
    // Reset form
    if (DOM.withdrawAmount) DOM.withdrawAmount.value = '';
    if (document.getElementById('withdraw-phone')) {
      document.getElementById('withdraw-phone').value = '';
    }
    
    // Refresh user data
    setTimeout(async () => {
      await fetchUserData();
      renderAccountInfo();
      renderTransactions();
    }, 2000);
    
  } catch (error) {
    console.error('Withdrawal error:', error);
    showNotification("Error", error.message || "Withdrawal request failed", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

async function handleBinanceWithdraw() {
  if (!requireAuth('withdraw via Binance')) return;
  
  const amount = parseFloat(document.getElementById('binance-withdraw-amount')?.value || 0);
  const wallet = document.getElementById('binance-wallet')?.value;
  const networkType = document.getElementById('network-type')?.value;
  
  if (!amount || amount < 5) {
    showNotification("Error", "Minimum withdrawal is $5.00", "error");
    return;
  }
  
  if (!wallet) {
    showNotification("Error", "Binance wallet address is required", "error");
    return;
  }
  
  const submitBtn = document.querySelector('#binance-withdraw-form button');
  const originalText = submitBtn.innerHTML;
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // First check referral status
    const referralCheck = await fetch(`${API_BASE_URL}/account/withdraw/check-referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: userData.userInfo.userId })
    });
    
    const referralData = await referralCheck.json();
    
    if (!referralCheck.ok || !referralData.isEligible) {
      throw new Error(referralData.message || 'Referral condition not met');
    }
    
    // Proceed with withdrawal
    const response = await fetch(`${API_BASE_URL}/account/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        amount,
        method: 'binance',
        paymentDetails: wallet,
        networkType: networkType || 'bep20'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Withdrawal request failed');
    }
    
    showNotification("Success", `Binance withdrawal request of $${amount.toFixed(2)} submitted! Processing may take 2-3 days.`, "success");
    
    // Reset form
    document.getElementById('binance-withdraw-amount').value = '';
    document.getElementById('binance-wallet').value = '';
    if (document.getElementById('network-type')) {
      document.getElementById('network-type').value = 'bep20';
    }
    
    // Refresh user data
    setTimeout(async () => {
      await fetchUserData();
      renderAccountInfo();
      renderTransactions();
    }, 2000);
    
  } catch (error) {
    console.error('Withdrawal error:', error);
    showNotification("Error", error.message || "Withdrawal request failed", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ===========================
// PAYMENT TABS & METHODS
// ===========================

function switchPaymentTab(tab) {
  document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.payment-content').forEach(c => c.classList.remove('active'));

  if (tab === 'deposit') {
    document.querySelector('.payment-tab[data-tab="deposit"]').classList.add('active');
    document.getElementById('deposit-content').classList.add('active');
  } else if (tab === 'withdraw') {
    document.querySelector('.payment-tab[data-tab="withdraw"]').classList.add('active');
    document.getElementById('withdraw-content').classList.add('active');
  }
}

function selectPaymentMethod(method, event) {
  document.querySelectorAll('.payment-method').forEach(pm => pm.classList.remove('active'));
  event.target.closest('.payment-method').classList.add('active');

  // Show/hide appropriate form
  if (method === 'mpesa') {
    document.getElementById('mpesa-deposit-form').style.display = 'block';
    document.getElementById('binance-deposit-form').style.display = 'none';
  } else if (method === 'binance') {
    document.getElementById('mpesa-deposit-form').style.display = 'none';
    document.getElementById('binance-deposit-form').style.display = 'block';
  }
}

function selectWithdrawMethod(method, event) {
  document.querySelectorAll('.payment-method').forEach(pm => pm.classList.remove('active'));
  event.target.closest('.payment-method').classList.add('active');

  // Show/hide appropriate form
  if (method === 'mpesa') {
    document.getElementById('mpesa-withdraw-form').style.display = 'block';
    document.getElementById('binance-withdraw-form').style.display = 'none';
  } else if (method === 'binance') {
    document.getElementById('mpesa-withdraw-form').style.display = 'none';
    document.getElementById('binance-withdraw-form').style.display = 'block';
  }
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================

function showNotification(title, message, type = 'info') {
  if (!DOM.notification || !DOM.notificationTitle || !DOM.notificationMessage) return;
  
  DOM.notificationTitle.textContent = title;
  DOM.notificationMessage.textContent = message;
  
  // Set color based on type
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };
  
  DOM.notification.style.backgroundColor = colors[type] || colors.info;
  
  DOM.notification.classList.add("show");
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    DOM.notification.classList.remove("show");
  }, 3000);
}

// ===========================
// LOGOUT FUNCTION
// ===========================

async function logout() {
  try {
    // Clear backend session
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    // Clear local state regardless of response
    userData.isLoggedIn = false;
    userData.requiresLogin = true;
    clearLocalAuth();
    
    // Update UI
    updateAuthUI();
    updateProtectedElements();
    renderAccountInfo();
    renderMyBots();
    renderTransactions();
    
    showNotification("Logged Out", "You have been successfully logged out.", "success");
    
    // Redirect to home page after delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear local state on error
    userData.isLoggedIn = false;
    userData.requiresLogin = true;
    clearLocalAuth();
    updateAuthUI();
    updateProtectedElements();
    
    showNotification("Logged Out", "You have been logged out.", "info");
    
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
}

// ===========================
// INITIALIZE APPLICATION
// ===========================

// Start everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add loading screen if not exists
  if (!document.getElementById('page-loader')) {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    loader.innerHTML = `
      <div class="spinner" style="
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #9f54ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      "></div>
      <p style="color: #333; font-size: 16px;">Loading your account...</p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loader);
  }
  
  // Initialize
  initEventListeners();
  init();
  
  // Add page visibility listener for session refresh
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && userData.isLoggedIn) {
      // Page became visible, refresh data
      fetchUserData().then(() => {
        renderAccountInfo();
        renderMyBots();
        renderTransactions();
      }).catch(console.error);
    }
  });
  
  // Add online/offline detection
  window.addEventListener('online', () => {
    if (userData.isLoggedIn) {
      showNotification("Back Online", "Reconnecting to server...", "info");
      fetchUserData().catch(console.error);
    }
  });
});

// Export for debugging
if (typeof window !== 'undefined') {
  window.app = {
    userData,
    refreshData: () => {
      fetchUserData().then(() => {
        renderAccountInfo();
        renderMyBots();
        renderTransactions();
      });
    },
    logout,
    showNotification,
    switchPaymentTab,
    selectPaymentMethod,
    selectWithdrawMethod
  };
}

// Console branding
console.log(
  "%cFLIPMARKET ACCOUNTS 🚀",
  `
  font-size: 24px;
  font-weight: bold;
  color: #9f54ff;
  text-shadow: 2px 2px 4px rgba(159,84,255,0.3);
  `
);
console.log(
  "%cSession persistence enabled | Secure authentication active",
  `color: #4CAF50; font-weight: bold;`
);