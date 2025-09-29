// ПРОСТАЯ КРАШ ИГРА БЕЗ ИГРОКОВ
class CrashGame {
    constructor() {
        console.log('🚀 Краш игра инициализируется...');
        
        // Основные переменные
        this.gameState = 'waiting'; // waiting, countdown, flying, crashed
        this.multiplier = 1.00;
        this.crashPoint = 0;
        this.countdownTimer = 10;
        this.playerBet = null;
        this.autoWithdraw = false;
        this.autoWithdrawAt = 2.0;
        
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
        console.log('� Начинаем игровой цикл...');
        this.waitingPhase();
    }
    
    // Фаза ожидания
    waitingPhase() {
        console.log('⏳ Фаза ожидания...');
        this.gameState = 'waiting';
        this.multiplier = 1.00;
        this.updateDisplay();
        
        // Через 3 секунды начинаем отсчет
        setTimeout(() => {
            this.countdownPhase();
        }, 3000);
    }
    
    // Фаза отсчета от 10 до 0
    countdownPhase() {
        console.log('⏰ Начинаем отсчет от 10 до 0...');
        this.gameState = 'countdown';
        this.countdownTimer = 10;
        
        const countdownInterval = setInterval(() => {
            this.updateDisplay();
            this.countdownTimer--;
            
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
        console.log('💥 КРАШ!');
        this.gameState = 'crashed';
        this.multiplier = this.crashPoint;
        this.updateDisplay();
        
        // Если игрок не забрал ставку - он проиграл
        if (this.playerBet) {
            console.log('😢 Игрок не успел забрать ставку');
            this.playerBet = null;
        }
        
        // Через 3 секунды новый раунд
        setTimeout(() => {
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
            
            // Добавляем анимацию во время полета
            if (this.gameState === 'flying') {
                multiplierEl.classList.add('flying');
                multiplierEl.classList.remove('crashed');
            } else if (this.gameState === 'crashed') {
                multiplierEl.classList.remove('flying');
                multiplierEl.classList.add('crashed');
            } else {
                multiplierEl.classList.remove('flying', 'crashed');
            }
        }
        
        
        // Управляем анимацией звезды
        const starEl = document.getElementById('crashStar');
        if (starEl) {
            starEl.classList.remove('flying', 'crashed', 'waiting');
            
            if (this.gameState === 'waiting') {
                starEl.classList.add('waiting');
            } else if (this.gameState === 'flying') {
                starEl.classList.add('flying');
            } else if (this.gameState === 'crashed') {
                starEl.classList.add('crashed');
                this.createExplosion();
            }
        }
        
        // Статус
        const statusEl = document.getElementById('crashStatus');
        if (statusEl) {
            switch (this.gameState) {
                case 'waiting':
                    statusEl.textContent = 'Готовимся к полету...';
                    statusEl.style.color = 'rgba(255, 255, 255, 0.6)';
                    break;
                case 'countdown':
                    statusEl.textContent = `Взлет через ${this.countdownTimer} сек`;
                    statusEl.style.color = '#fbbf24';
                    break;
                case 'flying':
                    statusEl.textContent = '🚀 Полет в процессе!';
                    statusEl.style.color = '#10b981';
                    break;
                case 'crashed':
                    statusEl.textContent = `💥 Краш на ${this.multiplier.toFixed(2)}x!`;
                    statusEl.style.color = '#ef4444';
                    break;
            }
        }
        
        this.updateButtons();
    }
    
    // Обновляем кнопки
    updateButtons() {
        const betBtn = document.getElementById('crashBetBtn');
        const withdrawBtn = document.getElementById('crashWithdrawBtn');
        
        if (!betBtn || !withdrawBtn) return;
        
        if (this.gameState === 'waiting' || this.gameState === 'countdown') {
            betBtn.disabled = false;
            betBtn.textContent = 'Поставить';
            betBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            betBtn.style.color = 'white';
            betBtn.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.4)';
            betBtn.style.cursor = 'pointer';
            
            withdrawBtn.disabled = true;
            withdrawBtn.textContent = 'Забрать';
            withdrawBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            withdrawBtn.style.color = 'rgba(255, 255, 255, 0.4)';
            withdrawBtn.style.boxShadow = 'none';
            withdrawBtn.style.cursor = 'not-allowed';
        } else if (this.gameState === 'flying' && this.playerBet) {
            betBtn.disabled = true;
            betBtn.textContent = 'Поставить';
            betBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            betBtn.style.color = 'rgba(255, 255, 255, 0.4)';
            betBtn.style.boxShadow = 'none';
            betBtn.style.cursor = 'not-allowed';
            
            withdrawBtn.disabled = false;
            withdrawBtn.textContent = `Забрать ${this.multiplier.toFixed(2)}x`;
            withdrawBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            withdrawBtn.style.color = 'white';
            withdrawBtn.style.boxShadow = '0 10px 40px rgba(245, 158, 11, 0.4)';
            withdrawBtn.style.cursor = 'pointer';
        } else {
            betBtn.disabled = true;
            betBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            betBtn.style.color = 'rgba(255, 255, 255, 0.4)';
            betBtn.style.boxShadow = 'none';
            betBtn.style.cursor = 'not-allowed';
            
            withdrawBtn.disabled = true;
            withdrawBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            withdrawBtn.style.color = 'rgba(255, 255, 255, 0.4)';
            withdrawBtn.style.boxShadow = 'none';
            withdrawBtn.style.cursor = 'not-allowed';
        }
    }
    
    // Сделать ставку
    placeBet() {
        if (this.gameState !== 'waiting' && this.gameState !== 'countdown') {
            console.log('❌ Ставки закрыты');
            return;
        }
        
        const betAmount = document.getElementById('crashBetAmount')?.value;
        const autoWithdrawValue = document.getElementById('autoWithdraw')?.value;
        const autoWithdrawEnabled = document.getElementById('autoWithdrawEnabled')?.checked;
        
        if (!betAmount || betAmount < 50) {
            console.log('❌ Минимальная ставка 50 звезд');
            return;
        }
        
        this.playerBet = {
            amount: parseInt(betAmount)
        };
        
        this.autoWithdraw = autoWithdrawEnabled;
        this.autoWithdrawAt = parseFloat(autoWithdrawValue) || 2.0;
        
        console.log(`✅ СТАВКА: ${betAmount}⭐`);
        if (this.autoWithdraw) {
            console.log(`🤖 АВТОВЫВОД АКТИВЕН на ${this.autoWithdrawAt}x`);
        } else {
            console.log(`🔴 Автовывод ОТКЛЮЧЕН`);
        }
        
        this.updateButtons();
    }
    
    // Забрать ставку
    withdrawBet() {
        if (!this.playerBet) {
            console.log('❌ Нет активной ставки');
            return;
        }
        
        const winAmount = Math.floor(this.playerBet.amount * this.multiplier);
        console.log(`🎉 ВЫИГРЫШ: ${winAmount} звезд (${this.multiplier.toFixed(2)}x)`);
        
        // Показываем сообщение о выигрыше
        const statusEl = document.getElementById('crashStatus');
        if (statusEl) {
            statusEl.textContent = `💰 Выигрыш ${winAmount}⭐ (${this.multiplier.toFixed(2)}x)`;
            statusEl.style.color = '#4caf50';
        }
        
        this.playerBet = null;
        this.autoWithdraw = false;
        this.updateButtons();
        
        // Через 2 секунды ждем новый раунд
        setTimeout(() => {
            this.waitingPhase();
        }, 2000);
    }
    
    // Создаем эффект взрыва
    createExplosion() {
        const container = document.getElementById('crashStarContainer');
        if (!container) return;
        
        // Создаем частицы взрыва
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            const angle = (i / 12) * 360;
            const distance = 50 + Math.random() * 30;
            
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = `translate(-50%, -50%)`;
            particle.style.background = i % 2 === 0 ? '#fbbf24' : '#ef4444';
            
            container.appendChild(particle);
            
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

// Здесь будет наш краш с нуля