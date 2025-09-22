// Main app initialization
class PixelstarsCasino {
    constructor() {
        this.user = null;
        this.balance = 0;
        this.currentTab = 'home';
        this.telegramUser = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize Telegram Web App
            this.initTelegram();
            
            // Show loading screen
            await this.showLoading();
            
            // Load user data
            await this.loadUserData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial content
            await this.loadContent();
            
            // Hide loading screen
            this.hideLoading();
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoading();
        }
    }

    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            this.telegramUser = tg.initDataUnsafe?.user;
            
            // Configure Telegram WebApp
            tg.ready();
            tg.expand();
            
            // Set theme
            document.documentElement.style.setProperty('--tg-bg', tg.themeParams.bg_color || '#17212b');
            document.documentElement.style.setProperty('--tg-text', tg.themeParams.text_color || '#ffffff');
            document.documentElement.style.setProperty('--tg-button', tg.themeParams.button_color || '#5288c1');
        }
    }

    async showLoading() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000); // Simulate loading time
        });
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    async loadUserData() {
        try {
            if (this.telegramUser) {
                const response = await fetch(`/api/user/${this.telegramUser.id}`);
                if (response.ok) {
                    this.user = await response.json();
                    this.balance = this.user.stars_balance;
                } else {
                    // Create default user data for demo
                    this.user = {
                        telegram_id: this.telegramUser.id,
                        first_name: this.telegramUser.first_name,
                        stars_balance: 1000,
                        level: 1,
                        experience: 0,
                        total_won: 0,
                        total_spent: 0,
                        games_played: 0,
                        cases_opened: 0
                    };
                    this.balance = 1000;
                }
            } else {
                // Demo data for development
                this.user = {
                    telegram_id: 'demo',
                    first_name: 'Demo User',
                    stars_balance: 1000,
                    level: 1,
                    experience: 0,
                    total_won: 0,
                    total_spent: 0,
                    games_played: 0,
                    cases_opened: 0
                };
                this.balance = 1000;
            }
            
            this.updateUI();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    updateUI() {
        // Update balance display
        document.getElementById('balanceAmount').textContent = this.balance.toLocaleString();
        
        // Update profile
        if (this.user) {
            document.getElementById('profileName').textContent = this.user.first_name || 'Игрок';
            document.getElementById('profileLevel').textContent = `Уровень ${this.user.level}`;
            document.getElementById('profileBalance').textContent = this.balance.toLocaleString();
            document.getElementById('profileGames').textContent = this.user.games_played || 0;
            document.getElementById('profileCases').textContent = this.user.cases_opened || 0;
            
            const profit = (this.user.total_won || 0) - (this.user.total_spent || 0);
            document.getElementById('profileProfit').textContent = profit >= 0 ? `+${profit}` : profit;
            
            // Set profile initials
            const initials = this.user.first_name ? this.user.first_name.charAt(0).toUpperCase() : '👤';
            document.getElementById('profileInitials').textContent = initials;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Скрывающаяся шапка при прокрутке
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const header = document.querySelector('.header');
            const scrollY = window.scrollY;

            if (Math.abs(scrollY - lastScrollY) < 5) {
                ticking = false;
                return;
            }

            if (scrollY > lastScrollY && scrollY > 100) {
                // Прокрутка вниз - скрываем хедер
                header.classList.add('hidden');
            } else {
                // Прокрутка вверх - показываем хедер
                header.classList.remove('hidden');
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    switchTab(tabName) {
        // Очищаем интервал ракетки при переключении
        this.stopRocketUpdates();
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        
        // Load tab-specific content
        if (tabName === 'cases') {
            this.loadCases();
        } else if (tabName === 'rocket') {
            this.initRocketGame();
        } else if (tabName === 'profile') {
            // Обновляем инвентарь при переключении на профиль
            if (window.casesManager) {
                window.casesManager.updateInventoryDisplay();
            }
        }
    }

    async loadContent() {
        await this.loadCases();
        this.updateStats();
    }

    async loadCases() {
        // Кейсы теперь загружаются через CasesManager
        // Эта функция может быть пустой или удалена
    }

    // Cases are now handled by CasesManager
    // Old case functions removed

    // Old case generation functions removed - now handled by server API

    initRocketGame() {
        const gameContainer = document.getElementById('rocketGame');
        
        // Создаем HTML для живой ракетки
        gameContainer.innerHTML = `
            <div class="rocket-live-game">
                <div class="rocket-header">
                    <h3>⭐ Звезда LIVE</h3>
                    <div class="game-status" id="gameStatus">Загрузка...</div>
                </div>
                
                <div class="rocket-display">
                    <div class="multiplier-display" id="multiplierDisplay">x1.00</div>
                    <div class="star-icon" id="starIcon">⭐</div>
                    <div class="game-phase" id="gamePhase">Ожидание...</div>
                </div>
                
                <div class="rocket-betting" id="rocketBetting">
                    <div class="betting-controls">
                        <div class="bet-input-section">
                            <label>Твоя ставка:</label>
                            <input type="number" id="betInput" min="50" max="${this.balance}" value="50" placeholder="Минимум 50">
                            <div class="quick-bets">
                                <button onclick="app.setBetAmount(50)" class="quick-bet">50⭐</button>
                                <button onclick="app.setBetAmount(100)" class="quick-bet">100⭐</button>
                                <button onclick="app.setBetAmount(500)" class="quick-bet">500⭐</button>
                                <button onclick="app.setBetAmount(1000)" class="quick-bet">1000⭐</button>
                            </div>
                        </div>
                        
                        <div class="auto-withdraw-section">
                            <label>Автовывод на:</label>
                            <input type="number" id="autoWithdraw" min="1.01" max="100" step="0.01" placeholder="Например: 2.5">
                            <div class="quick-withdraw">
                                <button onclick="app.setAutoWithdraw(1.5)" class="quick-withdraw-btn">x1.5</button>
                                <button onclick="app.setAutoWithdraw(2)" class="quick-withdraw-btn">x2.0</button>
                                <button onclick="app.setAutoWithdraw(5)" class="quick-withdraw-btn">x5.0</button>
                                <button onclick="app.setAutoWithdraw(10)" class="quick-withdraw-btn">x10</button>
                            </div>
                        </div>
                        
                        <button id="placeBetButton" onclick="app.placeBet()" class="place-bet-btn">
                            Поставить ставку
                        </button>
                    </div>
                </div>
                
                <div class="rocket-playing" id="rocketPlaying" style="display: none;">
                    <div class="current-bet-info" id="currentBetInfo"></div>
                    <button id="withdrawButton" onclick="app.withdrawNow()" class="withdraw-btn">
                        💸 ЗАБРАТЬ СЕЙЧАС!
                    </button>
                </div>
                
                <div class="game-info">
                    <div class="balance-display">💰 Баланс: <span id="currentBalance">${this.balance}</span> звезд</div>
                    <div class="players-count" id="playersCount">👥 Игроков в раунде: 0</div>
                </div>
            </div>
        `;
        
        // Добавляем стили
        this.addRocketStyles();
        
        // Запускаем обновление состояния игры
        this.startRocketUpdates();
    }

    addRocketStyles() {
        if (document.getElementById('rocketStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'rocketStyles';
        style.textContent = `
            .rocket-live-game {
                text-align: center;
                padding: 20px;
            }
            
            .rocket-header h3 {
                color: var(--tg-text-primary);
                margin-bottom: 10px;
            }
            
            .game-status {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            
            .game-status.waiting {
                background: linear-gradient(45deg, #FFA500, #FF8C00);
                color: white;
            }
            
            .game-status.flying {
                background: linear-gradient(45deg, #00FF00, #32CD32);
                color: white;
                animation: pulse 1s infinite;
            }
            
            .game-status.crashed {
                background: linear-gradient(45deg, #FF0000, #DC143C);
                color: white;
            }
            
            .rocket-display {
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
            }
            
            .multiplier-display {
                font-size: 3rem;
                font-weight: bold;
                color: var(--tg-accent);
                margin-bottom: 15px;
                text-shadow: 0 0 20px rgba(0,123,255,0.5);
            }
            
            .rocket-icon {
                font-size: 4rem;
                margin-bottom: 15px;
                transition: transform 0.3s ease;
            }
            
            .rocket-icon.flying {
                animation: rocketFly 2s infinite;
            }
            
            .rocket-icon.crashed {
                animation: explosion 0.5s ease-out;
            }
            
            .star-icon {
                font-size: 5rem;
                margin-bottom: 15px;
                transition: all 0.5s ease;
                filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
                position: relative;
            }
            
            .star-icon.flying {
                animation: starFly 1.5s infinite ease-in-out;
                filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1)) 
                        drop-shadow(0 0 50px rgba(255, 165, 0, 0.8));
            }
            
            .star-icon.crashed {
                animation: starExplosion 1s ease-out;
                filter: drop-shadow(0 0 50px rgba(255, 0, 0, 1));
            }
            
            @keyframes starFly {
                0% { 
                    transform: translateY(0px) scale(1) rotate(0deg);
                    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1)) 
                            drop-shadow(0 0 50px rgba(255, 165, 0, 0.8));
                }
                25% { 
                    transform: translateY(-20px) scale(1.1) rotate(90deg);
                    filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1)) 
                            drop-shadow(0 0 60px rgba(255, 140, 0, 1));
                }
                50% { 
                    transform: translateY(-30px) scale(1.2) rotate(180deg);
                    filter: drop-shadow(0 0 50px rgba(255, 215, 0, 1)) 
                            drop-shadow(0 0 70px rgba(255, 100, 0, 1));
                }
                75% { 
                    transform: translateY(-20px) scale(1.1) rotate(270deg);
                    filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1)) 
                            drop-shadow(0 0 60px rgba(255, 140, 0, 1));
                }
                100% { 
                    transform: translateY(0px) scale(1) rotate(360deg);
                    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1)) 
                            drop-shadow(0 0 50px rgba(255, 165, 0, 0.8));
                }
            }
            
            @keyframes starExplosion {
                0% { 
                    transform: scale(1) rotate(0deg);
                    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
                }
                20% { 
                    transform: scale(1.5) rotate(180deg);
                    filter: drop-shadow(0 0 50px rgba(255, 100, 0, 1)) 
                            drop-shadow(0 0 80px rgba(255, 0, 0, 0.8));
                }
                40% { 
                    transform: scale(2) rotate(360deg);
                    filter: drop-shadow(0 0 80px rgba(255, 0, 0, 1)) 
                            drop-shadow(0 0 120px rgba(200, 0, 0, 1));
                }
                60% { 
                    transform: scale(1.8) rotate(540deg);
                    filter: drop-shadow(0 0 100px rgba(150, 0, 0, 1));
                }
                80% { 
                    transform: scale(1.2) rotate(720deg);
                    filter: drop-shadow(0 0 60px rgba(100, 0, 0, 0.8));
                }
                100% { 
                    transform: scale(0.8) rotate(720deg);
                    filter: drop-shadow(0 0 20px rgba(50, 0, 0, 0.5));
                }
            }
            
            .game-phase {
                font-size: 18px;
                font-weight: 600;
                color: var(--tg-text-secondary);
            }
            
            @keyframes rocketFly {
                0% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(5deg); }
                100% { transform: translateY(0px) rotate(0deg); }
            }
            
            @keyframes explosion {
                0% { transform: scale(1); }
                50% { transform: scale(1.3) rotate(180deg); }
                100% { transform: scale(0.8) rotate(360deg); }
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            
            .betting-controls {
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .bet-input-section {
                margin-bottom: 15px;
            }
            
            .bet-input-section label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: var(--tg-text-primary);
            }
            
            #betInput {
                width: 100%;
                padding: 12px;
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                background: rgba(255,255,255,0.1);
                color: var(--tg-text-primary);
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .quick-bets {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            
            .quick-bet {
                padding: 8px;
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 8px;
                background: transparent;
                color: var(--tg-text-primary);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .quick-bet:hover {
                background: rgba(255,255,255,0.1);
                transform: scale(1.05);
            }
            
            .auto-withdraw-section {
                margin-bottom: 15px;
            }
            
            .auto-withdraw-section label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: var(--tg-text-primary);
            }
            
            #autoWithdraw {
                width: 100%;
                padding: 12px;
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                background: rgba(255,255,255,0.1);
                color: var(--tg-text-primary);
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .quick-withdraw {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            
            .quick-withdraw-btn {
                padding: 8px;
                border: 1px solid rgba(255,215,0,0.5);
                border-radius: 8px;
                background: rgba(255,215,0,0.1);
                color: #FFD700;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
            }
            
            .quick-withdraw-btn:hover {
                background: rgba(255,215,0,0.2);
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(255,215,0,0.3);
            }
            
            .place-bet-btn {
                width: 100%;
                background: var(--gradient-primary);
                border: none;
                color: white;
                padding: 15px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .place-bet-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-medium);
            }
            
            .place-bet-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .current-bet-info {
                background: rgba(0,123,255,0.2);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                color: var(--tg-text-primary);
            }
            
            .withdraw-btn {
                width: 100%;
                background: linear-gradient(45deg, #00FF00, #32CD32);
                border: none;
                color: white;
                padding: 20px;
                border-radius: 15px;
                font-weight: bold;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                animation: pulse 1.5s infinite;
            }
            
            .withdraw-btn:hover {
                transform: scale(1.05);
            }
            
            .game-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 20px;
            }
            
            .balance-display, .players-count {
                background: rgba(255,255,255,0.1);
                padding: 12px;
                border-radius: 10px;
                color: var(--tg-text-primary);
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }

    startRocketUpdates() {
        // Обновляем состояние игры каждые 100мс
        this.rocketUpdateInterval = setInterval(() => {
            this.updateRocketDisplay();
        }, 100);
    }

    setBetAmount(amount) {
        const betInput = document.getElementById('betInput');
        if (betInput) {
            betInput.value = Math.min(amount, this.balance);
        }
    }

    setAutoWithdraw(multiplier) {
        const autoWithdrawInput = document.getElementById('autoWithdraw');
        if (autoWithdrawInput) {
            autoWithdrawInput.value = multiplier;
        }
    }

    async placeBet() {
        const betInput = document.getElementById('betInput');
        const autoWithdraw = document.getElementById('autoWithdraw');
        const betAmount = parseInt(betInput.value);
        const autoWithdrawValue = autoWithdraw.value ? parseFloat(autoWithdraw.value) : null;
        
        // Проверяем фазу игры - ставки можно делать только в фазе waiting
        if (this.currentGamePhase !== 'waiting') {
            this.showNotification('❌ Ставки закрыты! Дождись следующего раунда.', 'error');
            return;
        }
        
        if (betAmount < 50) {
            this.showNotification('❌ Минимальная ставка 50 звезд!', 'error');
            return;
        }
        
        if (betAmount > this.balance) {
            this.showNotification('❌ Недостаточно звезд!', 'error');
            return;
        }
        
        if (autoWithdrawValue && (autoWithdrawValue < 1.01 || autoWithdrawValue > 100)) {
            this.showNotification('❌ Автовывод должен быть от x1.01 до x100!', 'error');
            return;
        }
        
        try {
            // Снимаем деньги с баланса сразу
            this.balance -= betAmount;
            this.updateUI();
            
            // Сохраняем данные ставки
            this.playerBet = {
                amount: betAmount,
                autoWithdraw: autoWithdrawValue,
                placed: true
            };
            
            // Переключаем интерфейс
            document.getElementById('rocketBetting').style.display = 'none';
            document.getElementById('rocketPlaying').style.display = 'block';
            
            // Обновляем информацию о ставке
            const betInfo = document.getElementById('currentBetInfo');
            betInfo.innerHTML = `
                <div>💰 Ставка: ${betAmount} звезд</div>
                ${this.playerBet.autoWithdraw ? `<div>🤖 Автовывод: x${this.playerBet.autoWithdraw}</div>` : '<div>✋ Ручной вывод</div>'}
            `;
            
            this.showNotification(`✅ Ставка ${betAmount} звезд размещена!`, 'success');
            
        } catch (error) {
            this.showNotification('❌ Ошибка размещения ставки!', 'error');
        }
    }

    async withdrawNow() {
        if (!this.playerBet || this.playerBet.withdrawn || this.playerBet.lost) {
            // Если ставки нет, уже выведена или проиграна - ничего не делаем
            if (this.playerBet?.lost) {
                this.showNotification('💥 Слишком поздно! Звезда уже взорвалась!', 'error');
            }
            return;
        }
        
        // ГЛАВНАЯ ПРОВЕРКА: можно забирать только когда звезда летит!
        if (this.currentGamePhase === 'waiting') {
            this.showNotification('⏰ Дождись старта раунда! Забрать можно только во время полета.', 'error');
            return;
        }
        
        // Дополнительная проверка фазы игры
        if (this.currentGamePhase === 'crashed') {
            this.showNotification('💥 Слишком поздно! Звезда уже взорвалась!', 'error');
            return;
        }
        
        // Можно забирать только в фазе flying
        if (this.currentGamePhase !== 'flying') {
            this.showNotification('❌ Забрать можно только во время полета звезды!', 'error');
            return;
        }
        
        try {
            const currentMultiplier = this.currentGameMultiplier || 1.0;
            const winAmount = Math.floor(this.playerBet.amount * currentMultiplier);
            
            // Добавляем выигрыш к балансу
            this.balance += winAmount;
            this.updateUI();
            
            // Помечаем как выведено
            this.playerBet.withdrawn = true;
            this.playerBet.winAmount = winAmount;
            
            this.showNotification(`✅ Выведено на x${currentMultiplier.toFixed(2)}! Выигрыш: ${winAmount} звезд`, 'success');
            
            // Сброс состояния через 2 секунды
            setTimeout(() => {
                this.playerBet = null;
                document.getElementById('rocketBetting').style.display = 'block';
                document.getElementById('rocketPlaying').style.display = 'none';
            }, 2000);
            
        } catch (error) {
            this.showNotification('❌ Ошибка вывода!', 'error');
        }
    }

    async updateRocketDisplay() {
        try {
            // Получаем актуальное состояние игры
            const response = await fetch('/api/rocket/status');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const gameData = await response.json();
            
            const statusElement = document.getElementById('gameStatus');
            const multiplierElement = document.getElementById('multiplierDisplay');
            const starIcon = document.getElementById('starIcon');
            const gamePhase = document.getElementById('gamePhase');
            const playersCount = document.getElementById('playersCount');
            
            if (!statusElement) return;
            
            // Сохраняем текущую фазу игры
            this.currentGamePhase = gameData.phase;
            
            // Обновляем интерфейс на основе реальных данных
            switch (gameData.phase) {
                case 'waiting':
                    statusElement.textContent = `⏱ До старта: ${gameData.timeLeft} сек`;
                    statusElement.className = 'game-status waiting';
                    multiplierElement.textContent = 'x1.00';
                    starIcon.className = 'star-icon';
                    gamePhase.textContent = `Ожидание... Ставки открыты! (${gameData.timeLeft} сек)`;
                    
                    // В фазе ожидания разрешаем делать ставки
                    const placeBetButton = document.getElementById('placeBetButton');
                    if (placeBetButton) {
                        placeBetButton.disabled = false;
                        placeBetButton.textContent = 'Поставить ставку';
                    }
                    
                    // Блокируем кнопку вывода в фазе ожидания если есть ставка
                    const withdrawButtonWaiting = document.getElementById('withdrawButton');
                    if (withdrawButtonWaiting && this.playerBet && !this.playerBet.withdrawn) {
                        withdrawButtonWaiting.disabled = true;
                        withdrawButtonWaiting.textContent = '⏰ Дождись старта раунда';
                        withdrawButtonWaiting.style.background = 'linear-gradient(45deg, #888888, #666666)';
                    } else if (withdrawButtonWaiting) {
                        withdrawButtonWaiting.disabled = false;
                        withdrawButtonWaiting.textContent = '💸 ЗАБРАТЬ СЕЙЧАС!';
                        withdrawButtonWaiting.style.background = 'linear-gradient(45deg, #00FF00, #32CD32)';
                    }
                    break;
                    
                case 'flying':
                    statusElement.textContent = '⭐ ЛЕТИТ!';
                    statusElement.className = 'game-status flying';
                    multiplierElement.textContent = `x${gameData.multiplier.toFixed(2)}`;
                    starIcon.className = 'star-icon flying';
                    gamePhase.textContent = 'Звезда в полете!';
                    this.currentGameMultiplier = gameData.multiplier;
                    
                    // В фазе полета блокируем ставки
                    const placeBetButtonFlying = document.getElementById('placeBetButton');
                    if (placeBetButtonFlying) {
                        placeBetButtonFlying.disabled = true;
                        placeBetButtonFlying.textContent = 'Ставки закрыты';
                    }
                    
                    // В фазе полета РАЗРЕШАЕМ вывод если есть ставка
                    const withdrawButtonFlying = document.getElementById('withdrawButton');
                    if (withdrawButtonFlying && this.playerBet && !this.playerBet.withdrawn && !this.playerBet.lost) {
                        withdrawButtonFlying.disabled = false;
                        withdrawButtonFlying.textContent = '💸 ЗАБРАТЬ СЕЙЧАС!';
                        withdrawButtonFlying.style.background = 'linear-gradient(45deg, #00FF00, #32CD32)';
                    }
                    
                    // Проверяем автовывод
                    if (this.playerBet && !this.playerBet.withdrawn && this.playerBet.autoWithdraw && gameData.multiplier >= this.playerBet.autoWithdraw) {
                        this.withdrawNow();
                    }
                    break;
                    
                case 'crashed':
                    statusElement.textContent = '💥 ВЗРЫВ!';
                    statusElement.className = 'game-status crashed';
                    starIcon.className = 'star-icon crashed';
                    gamePhase.textContent = 'Звезда взорвалась!';
                    
                    // МГНОВЕННО блокируем кнопку вывода
                    const withdrawButton = document.getElementById('withdrawButton');
                    if (withdrawButton) {
                        withdrawButton.disabled = true;
                        withdrawButton.textContent = '💥 СЛИШКОМ ПОЗДНО!';
                        withdrawButton.style.background = 'linear-gradient(45deg, #FF0000, #DC143C)';
                    }
                    
                    // Сброс ставки если не вывели (проиграли)
                    if (this.playerBet && !this.playerBet.withdrawn) {
                        // Помечаем как проигранную МГНОВЕННО
                        this.playerBet.lost = true;
                        this.showNotification(`💸 Проиграли ${this.playerBet.amount} звезд! Краш на x${gameData.multiplier.toFixed(2)}`, 'error');
                        
                        setTimeout(() => {
                            this.playerBet = null;
                            document.getElementById('rocketBetting').style.display = 'block';
                            document.getElementById('rocketPlaying').style.display = 'none';
                        }, 2000);
                    }
                    break;
                    
                default:
                    statusElement.textContent = 'Загрузка...';
                    statusElement.className = 'game-status';
                    gamePhase.textContent = 'Подключение к игре...';
            }
            
            // Обновляем счетчик игроков
            playersCount.textContent = `👥 Игроков в раунде: ${gameData.playersCount || 0}`;
            
            // Обновляем баланс
            const balanceElement = document.getElementById('currentBalance');
            if (balanceElement) {
                balanceElement.textContent = this.balance;
            }
            
        } catch (error) {
            console.error('Ошибка обновления ракетки:', error);
            
            // Fallback на локальную имитацию
            const statusElement = document.getElementById('gameStatus');
            const gamePhase = document.getElementById('gamePhase');
            const playersCount = document.getElementById('playersCount');
            
            if (statusElement) {
                statusElement.textContent = '❌ Ошибка соединения';
                statusElement.className = 'game-status';
            }
            
            if (gamePhase) {
                gamePhase.textContent = 'Проблемы с подключением...';
            }
            
            if (playersCount) {
                playersCount.textContent = '👥 Игроков в раунде: --';
            }
            
            // Повторная попытка через 3 секунды
            setTimeout(() => {
                this.updateRocketDisplay();
            }, 3000);
        }
    }

    // Очистка интервала при переключении табов
    stopRocketUpdates() {
        if (this.rocketUpdateInterval) {
            clearInterval(this.rocketUpdateInterval);
            this.rocketUpdateInterval = null;
        }
    }

    updateStats() {
        // Update home page stats with random data
        document.getElementById('totalPlayers').textContent = (1200 + Math.floor(Math.random() * 100)).toLocaleString();
        document.getElementById('totalPayout').textContent = (15.2 + Math.random() * 2).toFixed(1) + 'M';
        document.getElementById('todayGames').textContent = (800 + Math.floor(Math.random() * 200)).toLocaleString();
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--gradient-success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: var(--shadow-heavy);
        `;
        notification.textContent = message;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
window.switchTab = (tab) => window.app.switchTab(tab);
window.showDailyBonus = () => window.app.showNotification('🎊 Ежедневный бонус: +100 звезд!', 'success');
window.showLeaderboard = () => window.app.switchTab('profile');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PixelstarsCasino();
});

export default PixelstarsCasino;