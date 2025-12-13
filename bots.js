<!-- Script
        // ========================================
        // CONFIGURATION
        // ========================================
        
        // API Configuration - Replace with your actual API URL
        const API_BASE_URL = "https://your-api-domain.com/api";
        
        // Set to true to use mock data for development, false for production
        const USE_MOCK_DATA = true;
        
        // ========================================
        // BOT DATA
        // ========================================
        
        // Bot data with image URLs (prices in USD)
        const botTypes = [
            {
                id: 1,
                name: "MineX Bot",
                price: 10,
                dailyEarning: 0.70,
                totalEarning: 21,
                image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 2,
                name: "HashNova Bot",
                price: 20,
                dailyEarning: 1.40,
                totalEarning: 42,
                image: "https://media.istockphoto.com/id/903578410/photo/data-storage-center.jpg?s=612x612&w=0&k=20&c=dARiz1f9c-XfpJcDfWJ-rbeQfj9MK2hugg-eOtDWPoQ="
            },
            {
                id: 3,
                name: "CryptoPulse Bot",
                price: 40,
                dailyEarning: 2.80,
                totalEarning: 84,
                image: "https://images.unsplash.com/photo-1577538926988-7926820ed209?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hbGwlMjBzZXJ2ZXJ8ZW58MHx8MHx8fDA%3D"
            },
            {
                id: 4,
                name: "EtherForge Bot",
                price: 70,
                dailyEarning: 4.90,
                totalEarning: 147,
                image: "https://plus.unsplash.com/premium_photo-1664297989345-f4ff2063b212?q=80&w=1098&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                id: 5,
                name: "VoltHash Bot",
                price: 100,
                dailyEarning: 7.00,
                totalEarning: 210,
                image: "https://media.istockphoto.com/id/1040386538/photo/hard-drives-in-computer-monitoring-recording-server.jpg?s=2048x2048&w=is&k=20&c=lin3Auj8YIhiYEQ51n3YjMDqTldlTJ6aYgmwd9yRrTg="
            },
            {
                id: 6,
                name: "IronNode Bot",
                price: 150,
                dailyEarning: 10.50,
                totalEarning: 315,
                image: "https://media.istockphoto.com/id/2181288788/photo/servers-in-server-rooms-corporate-networks.jpg?s=612x612&w=0&k=20&c=9FH3f6lkYFZUUWb2NNUyOeftLvioza-C96wdqjXlySo="
            },
            {
                id: 7,
                name: "QuantumHash Bot",
                price: 300,
                dailyEarning: 21.00,
                totalEarning: 630,
                image: "https://images.unsplash.com/photo-1548544027-1a96c4c24c7a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                id: 8,
                name: "NebulaMine Bot",
                price: 800,
                dailyEarning: 60.00,
                totalEarning: 1800,
                image: "https://media.istockphoto.com/id/1860756412/photo/server-computer-should-be-high-performance-stable-able-to-serve-a-large-number-of-users.jpg?s=2048x2048&w=is&k=20&c=SyVTCXAcNT_8ZVWlp7Rs5SieM9he59MNpV69PXPHRAc="
            }
        ];

        // ========================================
        // USER DATA
        // ========================================
        
        // User data (simulating localStorage)
        let userData = {
            isLoggedIn: false,
            balance: 0,
            bots: [],
            totalClaimed: 0,
            dailyRate: 0,
            userInfo: {
                name: '',
                email: '',
                avatar: ''
            }
        };

        // ========================================
        // DOM ELEMENTS
        // ========================================
        
        const hamburgerBtn = document.getElementById("hamburger-btn");
        const navbar = document.getElementById("navbar");
        const overlay = document.getElementById("overlay");
        const botContainer = document.getElementById("botContainer");
        const paymentModal = document.getElementById("paymentModal");
        const modalOverlay = document.getElementById("modalOverlay");
        const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
        const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
        const paymentLoading = document.getElementById("paymentLoading");
        const notification = document.getElementById("notification");
        const notificationTitle = document.getElementById("notificationTitle");
        const notificationMessage = document.getElementById("notificationMessage");
        
        // User info elements
        const userInfo = document.getElementById("userInfo");
        const userAvatar = document.getElementById("userAvatar");
        const userName = document.getElementById("userName");
        const userEmail = document.getElementById("userEmail");
        
        // Dashboard elements
        const dashboard = document.getElementById("dashboard");
        
        // Login redirect notification elements
        const loginRedirectNotification = document.getElementById("loginRedirectNotification");
        const loginRedirectOverlay = document.getElementById("loginRedirectOverlay");
        const redirectCountdown = document.getElementById("redirectCountdown");
        const continueToLogin = document.getElementById("continueToLogin");
        const cancelRedirect = document.getElementById("cancelRedirect");

        // Current bot being purchased
        let currentBot = null;
        let redirectTimer = null;

        // ========================================
        // API FUNCTIONS
        // ========================================
        
        // API request wrapper function
        async function apiRequest(endpoint, method = 'GET', data = null) {
            try {
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                
                // Add auth token if available
                const token = localStorage.getItem('authToken');
                if (token) {
                    options.headers.Authorization = `Bearer ${token}`;
                }
                
                // Add body for POST/PUT requests
                if (data) {
                    options.body = JSON.stringify(data);
                }
                
                const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
                
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API request error:', error);
                throw error;
            }
        }
        
        // API functions for different operations
        const api = {
            // Authentication
            login: async (email, password) => {
                if (USE_MOCK_DATA) {
                    // Mock login response
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                data: {
                                    user: {
                                        id: Math.floor(Math.random() * 1000),
                                        name: email.split('@')[0],
                                        email: email
                                    },
                                    token: 'mock-jwt-token'
                                }
                            });
                        }, 1000);
                    });
                }
                
                return await apiRequest('/auth/login', 'POST', { email, password });
            },
            
            signup: async (name, email, password) => {
                if (USE_MOCK_DATA) {
                    // Mock signup response
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                data: {
                                    user: {
                                        id: Math.floor(Math.random() * 1000),
                                        name: name,
                                        email: email
                                    },
                                    token: 'mock-jwt-token'
                                }
                            });
                        }, 1000);
                    });
                }
                
                return await apiRequest('/auth/signup', 'POST', { name, email, password });
            },
            
            // Bots
            getBots: async () => {
                if (USE_MOCK_DATA) {
                    // Mock bots response
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                data: userData.bots
                            });
                        }, 500);
                    });
                }
                
                return await apiRequest('/bots', 'GET');
            },
            
            purchaseBot: async (botId) => {
                if (USE_MOCK_DATA) {
                    // Mock purchase response
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                data: {
                                    id: botId,
                                    purchaseDate: new Date().toISOString(),
                                    active: true,
                                    totalClaimed: 0
                                }
                            });
                        }, 2000);
                    });
                }
                
                return await apiRequest('/bots/purchase', 'POST', { botId });
            },
            
            claimEarnings: async (botId) => {
                if (USE_MOCK_DATA) {
                    // Mock claim response
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            const bot = userData.bots.find(b => b.id === botId);
                            const now = new Date();
                            const timeDiff = now - new Date(bot.purchaseDate);
                            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                            const earnings = Math.min(bot.dailyEarning * daysDiff, bot.totalEarning) - bot.totalClaimed;
                            
                            resolve({
                                success: true,
                                data: {
                                    earnings: earnings,
                                    botId: botId
                                }
                            });
                        }, 1000);
                    });
                }
                
                return await apiRequest('/bots/claim', 'POST', { botId });
            },
            
            // User data
            getUserData: async () => {
                if (USE_MOCK_DATA) {
                    // Mock user data response
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                data: {
                                    balance: userData.balance,
                                    bots: userData.bots,
                                    totalClaimed: userData.totalClaimed,
                                    userInfo: userData.userInfo
                                }
                            });
                        }, 500);
                    });
                }
                
                return await apiRequest('/user', 'GET');
            }
        };

        // ========================================
        // INITIALIZATION
        // ========================================
        
        // Initialize the page
        function init() {
            // Load user data from localStorage
            const savedData = localStorage.getItem("flipMarketUserData");
            if (savedData) {
                userData = JSON.parse(savedData);
            }
            
            // Check if user is logged in
            checkAuthStatus();
            
            // Render bot cards
            renderBotCards();
            
            // Start mining simulation
            startMiningSimulation();
        }

        // ========================================
        // AUTHENTICATION FUNCTIONS
        // ========================================
        
        // Check authentication status
        function checkAuthStatus() {
            if (userData.isLoggedIn) {
                // Show user info in navbar
                userInfo.style.display = "block";
                userAvatar.textContent = userData.userInfo.name.charAt(0).toUpperCase();
                userName.textContent = userData.userInfo.name;
                userEmail.textContent = userData.userInfo.email;
                
                // Show logout link, hide login link
                document.getElementById("logout").style.display = "block";
                document.getElementById("loginLink").style.display = "none";
                
                // Show dashboard, hide login required message
                dashboard.style.display = "block";
                
                // Update dashboard
                updateDashboard();
            } else {
                // Hide user info
                userInfo.style.display = "none";
                
                // Show login link, hide logout link
                document.getElementById("logout").style.display = "none";
                document.getElementById("loginLink").style.display = "block";
                
                // Hide dashboard
                dashboard.style.display = "none";
            }
        }

        // Update dashboard
        function updateDashboard() {
            document.getElementById("balance").textContent = `$${userData.balance.toFixed(2)}`;
            document.getElementById("bot-count").textContent = userData.bots.length;
            document.getElementById("total-claimed").textContent = `$${userData.totalClaimed.toFixed(2)}`;
            
            // Calculate daily rate
            let dailyRate = 0;
            userData.bots.forEach(bot => {
                if (bot.active) {
                    dailyRate += bot.dailyEarning;
                }
            });
            userData.dailyRate = dailyRate;
            document.getElementById("daily-rate").textContent = `$${dailyRate.toFixed(2)}/day`;
            
            // Save updated data
            saveUserData();
        }

        // Save user data to localStorage
        function saveUserData() {
            localStorage.setItem("flipMarketUserData", JSON.stringify(userData));
        }

        // ========================================
        // UI FUNCTIONS
        // ========================================
        
        // Render bot cards
        function renderBotCards() {
            botContainer.innerHTML = "";
            
            botTypes.forEach(botType => {
                // Check if user owns this bot
                const userBot = userData.bots.find(b => b.id === botType.id);
                
                const card = document.createElement("div");
                card.className = `bot-card ${userBot && userBot.active ? "active" : ""}`;
                
                // Calculate days left
                let daysLeft = 30;
                let earnings = 0;
                let progress = 0;
                    
                if (userBot) {
                    const now = new Date();
                    const timeDiff = now - new Date(userBot.purchaseDate);
                    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    daysLeft = Math.max(0, 30 - daysDiff);
                    
                    // Calculate earnings
                    earnings = Math.min(userBot.dailyEarning * daysDiff, userBot.totalEarning);
                    progress = Math.min(100, (earnings / userBot.totalEarning) * 100);
                }
                
                card.innerHTML = `
                    <div class="mining-indicator ${userBot && userBot.active ? "active" : ""}"></div>
                    <div class="bot-image-container">
                        <img src="${botType.image}" alt="${botType.name}" class="bot-image" />
                        <div class="bot-badge">${userBot ? "ACTIVE" : "NEW"}</div>
                    </div>
                    <h3 class="bot-title">${botType.name}</h3>
                    <div class="bot-details">
                        <div class="bot-detail">
                            <span class="bot-detail-label">Mining Power:</span>
                            <span class="bot-detail-value">$${botType.dailyEarning.toFixed(2)}/day</span>
                        </div>
                        <div class="bot-detail">
                            <span class="bot-detail-label">Total Potential:</span>
                            <span class="bot-detail-value">$${botType.totalEarning.toFixed(2)}</span>
                        </div>
                        <div class="bot-detail">
                            <span class="bot-detail-label">Expires in:</span>
                            <span class="bot-detail-value countdown">${daysLeft} days</span>
                        </div>
                    </div>
                    
                    ${userBot ? `
                        <div class="earnings-progress">
                            <div class="earnings-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="bot-stats">
                            <div class="stat-item">
                                <div class="stat-label">Mined</div>
                                <div class="stat-value">$${earnings.toFixed(2)}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Remaining</div>
                                <div class="stat-value">$${(botType.totalEarning - earnings).toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="bot-actions">
                            <button class="claim-btn ${earnings > 0 ? "" : "disabled"}" data-id="${botType.id}">
                                ${earnings > 0 ? "Claim Earnings" : "No Earnings"}
                            </button>
                        </div>
                    ` : `
                        <div class="bot-actions">
                            <button class="buy-btn" data-id="${botType.id}">Buy Mining Bot</button>
                        </div>
                    `}
                `;
                
                botContainer.appendChild(card);
            });
            
            // Add event listeners to buttons
            document.querySelectorAll(".buy-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    if (!userData.isLoggedIn) {
                        // Show login redirect notification
                        showLoginRedirectNotification();
                        return;
                    }
                    
                    const botId = parseInt(this.getAttribute("data-id"));
                    currentBot = botTypes.find(b => b.id === botId);
                    showPaymentModal();
                });
            });
            
            document.querySelectorAll(".claim-btn:not([disabled])").forEach(btn => {
                btn.addEventListener("click", function() {
                    const botId = parseInt(this.getAttribute("data-id"));
                    claimEarnings(botId);
                });
            });
        }

        // Show payment modal
        function showPaymentModal() {
            paymentModal.classList.add("active");
            modalOverlay.classList.add("active");
            paymentLoading.style.display = "none";
            confirmPaymentBtn.style.display = "block";
        }

        // Hide payment modal
        function hidePaymentModal() {
            paymentModal.classList.remove("active");
            modalOverlay.classList.remove("active");
            currentBot = null;
        }

        // Show login redirect notification
        function showLoginRedirectNotification() {
            loginRedirectNotification.classList.add("active");
            loginRedirectOverlay.classList.add("active");
            
            // Start countdown
            let secondsLeft = 5;
            redirectCountdown.textContent = secondsLeft;
            
            redirectTimer = setInterval(() => {
                secondsLeft--;
                redirectCountdown.textContent = secondsLeft;
                
                if (secondsLeft <= 0) {
                    clearInterval(redirectTimer);
                    // Redirect to login page
                    window.location.href = "index.html";
                }
            }, 1000);
        }

        // Hide login redirect notification
        function hideLoginRedirectNotification() {
            loginRedirectNotification.classList.remove("active");
            loginRedirectOverlay.classList.remove("active");
            
            if (redirectTimer) {
                clearInterval(redirectTimer);
                redirectTimer = null;
            }
        }

        // ========================================
        // BOT FUNCTIONS
        // ========================================
        
        // Confirm payment
        confirmPaymentBtn.addEventListener("click", async function() {
            // Show loading
            paymentLoading.style.display = "block";
            confirmPaymentBtn.style.display = "none";
            
            try {
                // Call API to purchase bot
                const response = await api.purchaseBot(currentBot.id);
                
                if (response.success) {
                    // Add bot to user's bots
                    const newBot = {
                        ...currentBot,
                        ...response.data
                    };
                    
                    userData.bots.push(newBot);
                    
                    // Update dashboard
                    updateDashboard();
                    
                    // Re-render bot cards
                    renderBotCards();
                    
                    // Hide modal
                    hidePaymentModal();
                    
                    // Show notification
                    showNotification("Purchase Successful", `Your ${currentBot.name} is now mining!`);
                } else {
                    throw new Error(response.message || "Purchase failed");
                }
            } catch (error) {
                console.error("Purchase error:", error);
                paymentLoading.style.display = "none";
                confirmPaymentBtn.style.display = "block";
                showNotification("Purchase Failed", "There was an error processing your payment. Please try again.");
            }
        });

        // Cancel payment
        cancelPaymentBtn.addEventListener("click", hidePaymentModal);
        modalOverlay.addEventListener("click", hidePaymentModal);

        // Claim earnings
        async function claimEarnings(botId) {
            try {
                // Call API to claim earnings
                const response = await api.claimEarnings(botId);
                
                if (response.success) {
                    const { earnings } = response.data;
                    
                    if (earnings <= 0) {
                        showNotification("No Earnings", "You don't have any earnings to claim yet.");
                        return;
                    }
                    
                    // Update user data
                    userData.balance += earnings;
                    
                    // Find and update the bot
                    const bot = userData.bots.find(b => b.id === botId);
                    if (bot) {
                        bot.totalClaimed += earnings;
                        userData.totalClaimed += earnings;
                        
                        // Check if bot has expired
                        if (bot.totalClaimed >= bot.totalEarning) {
                            bot.active = false;
                            showNotification("Bot Expired", "Your mining bot has completed its cycle.");
                        }
                    }
                    
                    // Update dashboard
                    updateDashboard();
                    
                    // Re-render bot cards
                    renderBotCards();
                    
                    // Show notification
                    showNotification("Earnings Claimed", `You've successfully claimed $${earnings.toFixed(2)}!`);
                } else {
                    throw new Error(response.message || "Claim failed");
                }
            } catch (error) {
                console.error("Claim error:", error);
                showNotification("Claim Failed", "There was an error claiming your earnings. Please try again.");
            }
        }

        // ========================================
        // AUTH MODAL FUNCTIONS
        // ========================================
        
        // Login redirect notification event listeners
        continueToLogin.addEventListener("click", function() {
            // Redirect immediately to login page
            window.location.href = "index.html";
        });
        
        cancelRedirect.addEventListener("click", function() {
            hideLoginRedirectNotification();
        });

        loginRedirectOverlay.addEventListener("click", function() {
            hideLoginRedirectNotification();
        });

        // ========================================
        // UTILITY FUNCTIONS
        // ========================================
        
        // Show notification
        function showNotification(title, message) {
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            notification.classList.add("show");
            
            setTimeout(() => {
                notification.classList.remove("show");
            }, 3000);
        }

        // Start mining simulation
        function startMiningSimulation() {
            // Update every minute
            setInterval(() => {
                // Update dashboard to show real-time earnings
                if (userData.isLoggedIn) {
                    updateDashboard();
                    
                    // Update bot cards if needed
                    renderBotCards();
                }
            }, 60000); // Every minute
        }

        // ========================================
        // NAVBAR FUNCTIONALITY
        // ========================================
        
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
            if (navbar.classList.contains("active")) {
                closeNavbar();
            } else {
                openNavbar();
            }
        });

        overlay.addEventListener("click", closeNavbar);

        document.querySelectorAll(".nav-links li a").forEach(link => {
            link.addEventListener("click", closeNavbar);
        });

        // Initialize the page when DOM is loaded
        document.addEventListener("DOMContentLoaded", init);
   