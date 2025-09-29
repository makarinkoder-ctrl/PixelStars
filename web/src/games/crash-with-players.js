// КРАШ ИГРА С ИГРОКАМИ
class CrashGame {
    constructor() {
        console.log('🚀 Краш игра инициализируется...');
        
        // Основные переменные
        this.gameState = 'waiting'; // waiting, countdown, flying, crashed
        this.multiplier = 1.00;
        this.crashPoint = 0;
        this.countdownTimer = 10; // отсчет от 10 до 0
        this.playerBet = null;
        this.autoWithdraw = false;
        this.autoWithdrawAt = 2.0;
        
        // Система игроков
        this.players = [];
        this.playerNames = [
            'CryptoKing', 'StarHunter', 'LuckyBeast', 'GoldRush', 'MoonWalker',
            'DiamondHand', 'RocketMan', 'WinStreak', 'BetMaster', 'CoinFlip',
            'PixelStar', 'GalaxyBot', 'NeonPlayer', 'TurboWin', 'BlazeFire'
        ];
        
        // Запускаем игру
        this.init();
    }
    
    init() {
        console.log('📋 Инициализация интерфейса...');
        this.setupEventListeners();
        this.startGameLoop();
    }
    
    setupEventListeners() {
        // Кнопка ставки
        const betBtn = document.getElementById('crashBetBtn');
        if (betBtn) {
            betBtn.onclick = () => this.placeBet();
        }
        
        // Кнопка забрать
        const withdrawBtn = document.getElementById('crashWithdrawBtn');
        if (withdrawBtn) {
            withdrawBtn.onclick = () => this.withdrawBet();
        }
        
        // Генерируем начальных игроков
        this.generatePlayers();
    }
    
    generatePlayers() {
        // Создаем 8-12 случайных игроков
        const playersCount = Math.floor(Math.random() * 5) + 8;
        this.players = [];
        
        for (let i = 0; i < playersCount; i++) {
            const player = {
                id: Date.now() + Math.random(),
                name: this.playerNames[Math.floor(Math.random() * this.playerNames.length)],
                bet: Math.floor(Math.random() * 2000) + 100, // от 100 до 2100
                autoWithdraw: Math.random() < 0.7, // 70% используют автовывод
                autoWithdrawAt: Math.round((Math.random() * 4 + 1.5) * 100) / 100, // от 1.5x до 5.5x
                cashoutMultiplier: null,
                status: 'betting' // betting, withdrawn, crashed
            };
            this.players.push(player);
        }
        
        this.updatePlayersList();
    }
    
    updatePlayersList() {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 12px 16px;
                border: 1px solid rgba(251, 191, 36, 0.2);
                transition: all 0.3s ease;
            `;
            
            let statusText = '';
            let statusColor = 'rgba(255, 255, 255, 0.8)';
            
            if (player.status === 'betting') {
                statusText = `${player.bet} ⭐`;
            } else if (player.status === 'withdrawn') {
                statusText = `+${Math.floor(player.bet * player.cashoutMultiplier)} ⭐`;
                statusColor = '#10b981';
            } else if (player.status === 'crashed') {
                statusText = `-${player.bet} ⭐`;
                statusColor = '#ef4444';
            }
            
            playerDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="color: white; font-weight: 600; font-size: 0.9rem;">
                            ${player.name}
                        </div>
                        ${player.autoWithdraw && player.status === 'betting' ? 
                            `<div style="color: rgba(251, 191, 36, 0.8); font-size: 0.75rem;">
                                Автовывод ${player.autoWithdrawAt}x
                            </div>` : ''
                        }
                    </div>
                    <div style="color: ${statusColor}; font-weight: 700; font-size: 0.85rem;">
                        ${statusText}
                    </div>
                </div>
            `;
            
            playersList.appendChild(playerDiv);
        });
    }

    startGameLoop() {
        console.log('🎮 Начинаем игровой цикл...');
        this.waitingPhase();
    }
    
    // Фаза ожидания
    waitingPhase() {
        console.log('⏳ Фаза ожидания...');
        this.gameState = 'waiting';
        this.multiplier = 1.00;
        this.updateDisplay();
        
        // Ждем 2 секунды, потом начинаем обратный отсчет
        setTimeout(() => {
            this.countdownPhase();
        }, 2000);
    }
    
    // Фаза обратного отсчета
    countdownPhase() {
        console.log('⏰ Обратный отсчет начался!');
        this.gameState = 'countdown';
        this.countdownTimer = 10;
        
        const countdownInterval = setInterval(() => {
            this.countdownTimer--;
            console.log(`⏰ Осталось: ${this.countdownTimer} сек`);
            this.updateDisplay();
            
            if (this.countdownTimer < 0) {
                clearInterval(countdownInterval);
                this.flyingPhase();
            }
        }, 1000);
    }
    
    // Фаза полета
    flyingPhase() {
        console.log('🚀 Звезда взлетает!');
        this.gameState = 'flying';
        this.crashPoint = this.generateCrashPoint();
        console.log(`🎯 Краш точка: ${this.crashPoint.toFixed(2)}x`);
        
        this.flyingInterval = setInterval(() => {
            this.multiplier += 0.01;
            this.updateDisplay();
            
            // Проверяем автовывод игроков
            this.players.forEach(player => {
                if (player.status === 'betting' && player.autoWithdraw && this.multiplier >= player.autoWithdrawAt) {
                    player.status = 'withdrawn';
                    player.cashoutMultiplier = this.multiplier;
                    console.log(`🤖 ${player.name} автовывод на ${this.multiplier.toFixed(2)}x`);
                }
            });
            
            // Проверяем автовывод ПЕРВЫМ
            if (this.playerBet && this.autoWithdraw && this.multiplier >= this.autoWithdrawAt) {
                console.log(`🤖 АВТОВЫВОД СРАБОТАЛ на ${this.multiplier.toFixed(2)}x!`);
                clearInterval(this.flyingInterval);
                this.withdrawBet();
                return; // Выходим из функции после автовывода
            }
            
            // Обновляем список игроков
            this.updatePlayersList();
            
            // Проверяем краш
            if (this.multiplier >= this.crashPoint) {
                clearInterval(this.flyingInterval);
                this.crashedPhase();
            }
        }, 100);
    }
    
    // Фаза краша
    crashedPhase() {
        console.log('💥 КРАШ! Звезда упала!');
        this.gameState = 'crashed';
        this.multiplier = this.crashPoint;
        this.updateDisplay();
        
        // Отмечаем игроков которые проиграли
        this.players.forEach(player => {
            if (player.status === 'betting') {
                player.status = 'crashed';
                console.log(`😢 ${player.name} проиграл ${player.bet} ⭐`);
            }
        });
        
        // Если игрок не забрал ставку - он проиграл
        if (this.playerBet) {
            console.log('😢 Игрок не успел забрать ставку');
            this.playerBet = null;
        }
        
        // Обновляем список игроков
        this.updatePlayersList();
        
        // Через 3 секунды новый раунд
        setTimeout(() => {
            this.generatePlayers(); // Генерируем новых игроков
            this.waitingPhase();
        }, 3000);
    }
    
    // Генерируем точку краша
    generateCrashPoint() {
        const rand = Math.random();
        if (rand < 0.5) return 1.00 + Math.random() * 0.50; // 1.00-1.50
        if (rand < 0.8) return 1.50 + Math.random() * 1.00; // 1.50-2.50  
        if (rand < 0.95) return 2.50 + Math.random() * 2.50; // 2.50-5.00
        return 5.00 + Math.random() * 10.00; // 5.00-15.00
    }
    
    // Обновляем дисплей
    updateDisplay() {
        // Множитель
        const multiplierEl = document.getElementById('crashMultiplier');
        if (multiplierEl) {
            multiplierEl.textContent = this.multiplier.toFixed(2) + 'x';
        }
        
        // Статус
        const statusEl = document.getElementById('crashStatus');
        if (statusEl) {
            if (this.gameState === 'waiting') {
                statusEl.textContent = 'Ожидание раунда...';
            } else if (this.gameState === 'countdown') {
                statusEl.textContent = `Взлет через ${this.countdownTimer} сек`;
            } else if (this.gameState === 'flying') {
                statusEl.textContent = '🚀 Полет в процессе!';
            } else if (this.gameState === 'crashed') {
                statusEl.textContent = `💥 Краш на ${this.crashPoint.toFixed(2)}x`;
            }
        }
        
        // Управление звездой
        const crashStar = document.getElementById('crashStar');
        const starContainer = document.getElementById('crashStarContainer');
        
        if (crashStar && starContainer) {
            // Убираем все классы
            crashStar.className = 'crash-star';
            
            // Добавляем нужный класс в зависимости от состояния
            if (this.gameState === 'waiting') {
                crashStar.classList.add('waiting');
            } else if (this.gameState === 'countdown') {
                crashStar.classList.add('waiting');
            } else if (this.gameState === 'flying') {
                crashStar.classList.add('flying');
            } else if (this.gameState === 'crashed') {
                crashStar.classList.add('crashed');
                // Создаем эффект взрыва
                this.createExplosion();
            }
        }
        
        // Обновляем кнопки
        this.updateButtons();
    }
    
    updateButtons() {
        const betBtn = document.getElementById('crashBetBtn');
        const withdrawBtn = document.getElementById('crashWithdrawBtn');
        
        if (!betBtn || !withdrawBtn) return;
        
        if (this.gameState === 'waiting' || this.gameState === 'countdown') {
            // Можно делать ставки
            betBtn.disabled = false;
            betBtn.style.opacity = '1';
            betBtn.style.cursor = 'pointer';
            betBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
            
            withdrawBtn.disabled = true;
            withdrawBtn.style.opacity = '0.3';
            withdrawBtn.style.cursor = 'not-allowed';
            withdrawBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        } else if (this.gameState === 'flying') {
            // Нельзя делать ставки, можно забирать
            betBtn.disabled = true;
            betBtn.style.opacity = '0.3';
            betBtn.style.cursor = 'not-allowed';
            betBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            
            if (this.playerBet) {
                withdrawBtn.disabled = false;
                withdrawBtn.style.opacity = '1';
                withdrawBtn.style.cursor = 'pointer';
                withdrawBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
        } else if (this.gameState === 'crashed') {
            // Нельзя ничего делать
            betBtn.disabled = true;
            withdrawBtn.disabled = true;
            betBtn.style.opacity = '0.3';
            withdrawBtn.style.opacity = '0.3';
        }
    }
    
    placeBet() {
        if (this.gameState !== 'waiting' && this.gameState !== 'countdown') return;
        if (this.playerBet) return; // Уже есть ставка
        
        const betAmountEl = document.getElementById('crashBetAmount');
        const autoWithdrawEl = document.getElementById('crashAutoWithdraw');
        const autoWithdrawAtEl = document.getElementById('crashAutoWithdrawAt');
        
        if (!betAmountEl) return;
        
        const betAmount = parseInt(betAmountEl.value);
        if (isNaN(betAmount) || betAmount < 50) {
            alert('Минимальная ставка 50 звезд');
            return;
        }
        
        this.playerBet = betAmount;
        
        // Проверяем автовывод
        if (autoWithdrawEl && autoWithdrawEl.checked) {
            this.autoWithdraw = true;
            this.autoWithdrawAt = parseFloat(autoWithdrawAtEl.value);
        } else {
            this.autoWithdraw = false;
        }
        
        console.log(`💰 Ставка ${betAmount} звезд размещена!`);
        if (this.autoWithdraw) {
            console.log(`🤖 Автовывод на ${this.autoWithdrawAt}x активирован`);
        }
        
        this.updateButtons();
    }
    
    withdrawBet() {
        if (this.gameState !== 'flying' || !this.playerBet) return;
        
        const winAmount = Math.floor(this.playerBet * this.multiplier);
        console.log(`💰 Выигрыш: ${winAmount} звезд (${this.multiplier.toFixed(2)}x)`);
        
        // Сохраняем баланс
        const currentBalance = parseInt(localStorage.getItem('stars') || '1000');
        const newBalance = currentBalance - this.playerBet + winAmount;
        localStorage.setItem('stars', newBalance.toString());
        
        // Обновляем отображение баланса
        const balanceEl = document.querySelector('.balance-amount');
        if (balanceEl) {
            balanceEl.textContent = newBalance;
        }
        
        // Сбрасываем ставку
        this.playerBet = null;
        this.autoWithdraw = false;
        
        // Останавливаем игру для этого игрока
        this.gameState = 'waiting';
        this.updateDisplay();
        
        // Возвращаемся к ожиданию следующего раунда
        setTimeout(() => {
            this.waitingPhase();
        }, 2000);
    }
    
    createExplosion() {
        const starContainer = document.getElementById('crashStarContainer');
        if (!starContainer) return;
        
        // Создаем 12 частиц взрыва
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            // Случайные цвета
            const colors = ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#dc2626'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Позиционируем в центре звезды
            particle.style.left = '50%';
            particle.style.top = '50%';
            
            starContainer.appendChild(particle);
            
            // Случайное направление
            const angle = (360 / 12) * i + (Math.random() * 30 - 15);
            const distance = 50 + Math.random() * 50;
            
            // Анимируем частицу
            setTimeout(() => {
                particle.style.transform = `translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px)`;
                particle.style.opacity = '0';
                particle.style.transition = 'all 0.8s ease-out';
            }, 10);
            
            // Удаляем частицу
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
}

// Запускаем игру когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    window.crashGame = new CrashGame();
});