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
        this.isAutoWithdrawing = false;
        this.isWithdrawing = false;
        
        // История крашей (максимум 4 элемента)
        this.crashHistory = [];
        
        // Интервалы для очистки
        this.countdownInterval = null;
        this.flyingInterval = null;
        
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
            betBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Клик по кнопке ставки');
                this.placeBet();
            };
        }
        
        // Кнопка забрать - несколько обработчиков для надежности
        const withdrawBtn = document.getElementById('crashWithdrawBtn');
        if (withdrawBtn) {
            // Основной обработчик клика
            withdrawBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 КЛИК по кнопке забрать');
                this.withdrawBet();
            };
            
            // Дополнительный обработчик mousedown для быстрой реакции
            withdrawBtn.onmousedown = (e) => {
                if (!withdrawBtn.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ MOUSEDOWN по кнопке забрать');
                    this.withdrawBet();
                }
            };
            
            // Тач для мобильных
            withdrawBtn.addEventListener('touchstart', (e) => {
                if (!withdrawBtn.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📱 ТАЧ по кнопке забрать');
                    this.withdrawBet();
                }
            }, { passive: false });
        }
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
        
        // Очищаем предыдущий интервал если есть
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            this.countdownTimer--;
            console.log(`⏰ Осталось: ${this.countdownTimer} сек`);
            this.updateDisplay();
            
            if (this.countdownTimer < 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
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
        
        // Очищаем предыдущий интервал если есть
        if (this.flyingInterval) {
            clearInterval(this.flyingInterval);
        }
        
        this.flyingInterval = setInterval(() => {
            this.multiplier += 0.01;
            this.updateDisplay();
            
            // Детальное логирование для автовывода
            if (this.playerBet && this.autoWithdraw) {
                console.log(`🤖 Проверка автовывода: ${this.multiplier.toFixed(2)}x >= ${this.autoWithdrawAt}x`);
            }
            
            // Проверяем автовывод
            if (this.playerBet && this.autoWithdraw && this.multiplier >= this.autoWithdrawAt) {
                console.log(`🤖 АВТОВЫВОД СРАБОТАЛ на ${this.multiplier.toFixed(2)}x!`);
                this.isAutoWithdrawing = true;
                this.withdrawBet();
                // Игра продолжается! НЕ останавливаем интервал
                return;
            }
            
            // Проверяем краш
            if (this.multiplier >= this.crashPoint) {
                clearInterval(this.flyingInterval);
                this.flyingInterval = null;
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
        
        // Добавляем краш в историю
        this.addToHistory(this.crashPoint);
        
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
        
        if (crashStar) {
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
        
        // Обновляем состояние автовывода
        this.updateAutoWithdrawControl();
    }
    
    updateButtons() {
        const betBtn = document.getElementById('crashBetBtn');
        const withdrawBtn = document.getElementById('crashWithdrawBtn');
        
        // Проверяем что кнопки существуют
        if (!betBtn || !withdrawBtn) {
            console.log('⚠️ Кнопки не найдены в DOM');
            return;
        }
        
        console.log(`🔄 Обновляем кнопки, состояние: ${this.gameState}, ставка: ${this.playerBet}`);
        
        // Сбрасываем все inline стили
        betBtn.style.cssText = '';
        withdrawBtn.style.cssText = '';
        
        if (this.gameState === 'waiting') {
            // В ожидании - нельзя ставить, ждем отсчета
            betBtn.disabled = true;
            betBtn.textContent = 'Ожидание...';
            withdrawBtn.disabled = true;
            withdrawBtn.textContent = 'Забрать';
        } else if (this.gameState === 'countdown') {
            // Во время отсчета - МОЖНО ставить
            if (!this.playerBet) {
                betBtn.disabled = false;
                betBtn.textContent = 'Поставить';
            } else {
                betBtn.disabled = true;
                betBtn.textContent = 'Ставка сделана';
            }
            withdrawBtn.disabled = true;
            withdrawBtn.textContent = 'Забрать';
        } else if (this.gameState === 'flying') {
            // Во время полета - нельзя ставить, можно забирать
            betBtn.disabled = true;
            betBtn.textContent = 'Полет!';
            
            if (this.playerBet) {
                withdrawBtn.disabled = false;
                withdrawBtn.textContent = `Забрать ${(this.playerBet * this.multiplier).toFixed(0)}⭐`;
            } else {
                withdrawBtn.disabled = true;
                withdrawBtn.textContent = 'Забрать';
            }
        } else if (this.gameState === 'crashed') {
            // После краша - нельзя ничего делать
            betBtn.disabled = true;
            betBtn.textContent = 'Краш!';
            withdrawBtn.disabled = true;
            withdrawBtn.textContent = 'Поздно!';
        }
    }
    
    updateAutoWithdrawControl() {
        const autoWithdrawEl = document.getElementById('autoWithdrawEnabled');
        const autoWithdrawAtEl = document.getElementById('autoWithdraw');
        
        if (!autoWithdrawEl || !autoWithdrawAtEl) return;
        
        // Если есть ставка и игра летит - блокируем изменение автовывода
        if (this.playerBet && this.gameState === 'flying') {
            autoWithdrawEl.disabled = true;
            autoWithdrawAtEl.disabled = true;
            autoWithdrawEl.style.opacity = '0.5';
            autoWithdrawAtEl.style.opacity = '0.5';
            autoWithdrawEl.style.cursor = 'not-allowed';
            autoWithdrawAtEl.style.cursor = 'not-allowed';
            console.log('🔒 Автовывод заблокирован во время полета');
        } else {
            // Разблокируем в остальных случаях
            autoWithdrawEl.disabled = false;
            autoWithdrawAtEl.disabled = false;
            autoWithdrawEl.style.opacity = '1';
            autoWithdrawAtEl.style.opacity = '1';
            autoWithdrawEl.style.cursor = 'pointer';
            autoWithdrawAtEl.style.cursor = 'text';
        }
    }
    
    placeBet() {
        // Ставки можно делать ТОЛЬКО во время отсчета
        if (this.gameState !== 'countdown') {
            console.log(`❌ Нельзя ставить в состоянии: ${this.gameState}`);
            return;
        }
        
        if (this.playerBet) {
            console.log('❌ Ставка уже сделана');
            return; // Уже есть ставка
        }
        
        const betAmountEl = document.getElementById('crashBetAmount');
        const autoWithdrawEl = document.getElementById('autoWithdrawEnabled');
        const autoWithdrawAtEl = document.getElementById('autoWithdraw');
        
        if (!betAmountEl) return;
        
        const betAmount = parseInt(betAmountEl.value);
        if (isNaN(betAmount) || betAmount < 50) {
            alert('Минимальная ставка 50 звезд');
            return;
        }
        
        // Проверяем баланс
        const currentBalance = parseInt(localStorage.getItem('stars') || '0');
        if (currentBalance < betAmount) {
            alert(`Недостаточно звезд! У вас: ${currentBalance}, нужно: ${betAmount}`);
            return;
        }
        
        this.playerBet = betAmount;
        
        // Списываем ставку с баланса
        const newBalance = currentBalance - betAmount;
        localStorage.setItem('stars', newBalance.toString());
        
        // Обновляем отображение баланса
        const balanceEl = document.querySelector('.balance-amount');
        if (balanceEl) {
            balanceEl.textContent = newBalance;
        }
        
        // Проверяем автовывод
        if (autoWithdrawEl && autoWithdrawEl.checked) {
            this.autoWithdraw = true;
            this.autoWithdrawAt = parseFloat(autoWithdrawAtEl.value);
            console.log(`🤖 Автовывод ВКЛЮЧЕН на ${this.autoWithdrawAt}x`);
        } else {
            this.autoWithdraw = false;
            console.log(`❌ Автовывод ВЫКЛЮЧЕН`);
        }
        
        console.log(`💰 Ставка ${betAmount} звезд размещена! Баланс: ${newBalance}`);
        console.log(`🎯 Состояние автовывода: ${this.autoWithdraw}, значение: ${this.autoWithdrawAt}`);
        
        this.updateButtons();
    }
    
    withdrawBet() {
        console.log(`🎯 Попытка вывода, состояние: ${this.gameState}, ставка: ${this.playerBet}`);
        
        // Защита от двойного вызова
        if (this.isWithdrawing) {
            console.log('⚠️ Вывод уже в процессе, пропускаем');
            return;
        }
        
        if (this.gameState !== 'flying' || !this.playerBet) {
            console.log('❌ Нельзя забрать ставку сейчас');
            return;
        }
        
        this.isWithdrawing = true;
        
        // Рассчитываем полный выигрыш (ставка × множитель)
        const totalWinAmount = Math.floor(this.playerBet * this.multiplier);
        console.log(`💰 Полный выигрыш: ${totalWinAmount} звезд (${this.playerBet} × ${this.multiplier.toFixed(2)})`);
        
        // ВАЖНО: При ставке мы уже списали деньги, поэтому добавляем ПОЛНЫЙ выигрыш
        const currentBalance = parseInt(localStorage.getItem('stars') || '1000');
        const newBalance = currentBalance + totalWinAmount;
        localStorage.setItem('stars', newBalance.toString());
        
        console.log(`💳 Баланс: ${currentBalance} + ${totalWinAmount} = ${newBalance}`);
        
        // Обновляем отображение баланса
        const balanceEl = document.querySelector('.balance-amount');
        if (balanceEl) {
            balanceEl.textContent = newBalance;
        }
        
        // НЕ ОСТАНАВЛИВАЕМ игру! Игра работает 24/7
        // Только сбрасываем ставку игрока
        this.playerBet = null;
        this.autoWithdraw = false;
        this.isAutoWithdrawing = false;
        this.isWithdrawing = false;
        
        // Обновляем кнопки
        this.updateButtons();
        
        // Уведомляем бота о выигрыше
        this.notifyBotAboutWin(this.playerBet, this.multiplier, totalWinAmount);
        
        console.log(`✅ Ставка забрана! Новый баланс: ${newBalance}. Игра продолжается!`);
    }
    
    // Добавляем краш в историю
    addToHistory(crashMultiplier) {
        console.log(`📊 Добавляем в историю: ${crashMultiplier.toFixed(2)}x`);
        
        // Добавляем в начало массива
        this.crashHistory.unshift(crashMultiplier);
        
        // Оставляем только последние 4 элемента
        if (this.crashHistory.length > 4) {
            this.crashHistory = this.crashHistory.slice(0, 4);
        }
        
        // Обновляем отображение истории
        this.updateHistoryDisplay();
    }
    
    // Обновляем отображение истории
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('crashHistoryList');
        if (!historyContainer) return;
        
        // Очищаем контейнер
        historyContainer.innerHTML = '';
        
        // Добавляем каждый элемент истории
        this.crashHistory.forEach(multiplier => {
            const historyItem = document.createElement('div');
            historyItem.className = 'crash-history-item';
            historyItem.textContent = multiplier.toFixed(2) + 'x';
            
            // Определяем цвет в зависимости от множителя
            if (multiplier < 1.5) {
                historyItem.classList.add('low');
            } else if (multiplier < 3.0) {
                historyItem.classList.add('medium');
            } else if (multiplier < 10.0) {
                historyItem.classList.add('high');
            } else {
                historyItem.classList.add('ultra');
            }
            
            historyContainer.appendChild(historyItem);
        });
        
        console.log(`📊 История обновлена: [${this.crashHistory.map(x => x.toFixed(2)).join(', ')}]`);
    }
    
    // Уведомление бота о выигрыше
    async notifyBotAboutWin(betAmount, multiplier, winAmount) {
        try {
            // Проверяем есть ли доступ к Telegram WebApp
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
                const user = window.Telegram.WebApp.initDataUnsafe.user;
                const profit = winAmount - betAmount;
                
                const message = `🎉 <b>ВЫИГРЫШ В CRASH!</b>\n\n` +
                               `👤 Игрок: ${user.first_name}\n` +
                               `💰 Ставка: ${betAmount} ⭐\n` +
                               `🚀 Множитель: ${multiplier.toFixed(2)}x\n` +
                               `💎 Выигрыш: ${winAmount} ⭐\n` +
                               `📈 Прибыль: +${profit} ⭐`;
                
                // Отправляем через основное приложение
                if (window.pixelstarsCasino && window.pixelstarsCasino.sendBotMessage) {
                    await window.pixelstarsCasino.sendBotMessage(user.id, message);
                    console.log('🤖 Уведомление о выигрыше отправлено в бот');
                }
            }
        } catch (error) {
            console.error('❌ Ошибка отправки уведомления в бот:', error);
        }
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