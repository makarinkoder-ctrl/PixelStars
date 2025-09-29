// КРАШ ИГРА С НУЛЯ - БАЗОВАЯ ВЕРСИЯ
class SimpleCrash {
    constructor() {
        // Состояния игры
        this.state = 'waiting'; // waiting, flying, crashed
        this.multiplier = 1.0;
        this.crashPoint = 2.0;
        
        // Находим элементы
        this.multiplierEl = document.getElementById('crashMultiplier');
        this.statusEl = document.getElementById('crashStatus');
        
        // Стартуем
        this.start();
    }
    
    start() {
        console.log('🚀 Краш игра запущена');
        this.state = 'waiting';
        this.multiplier = 1.0;
        this.crashPoint = 1.5 + Math.random() * 3; // Случайный краш от 1.5 до 4.5
        
        this.updateDisplay();
        
        // Через 3 секунды начинаем полет
        setTimeout(() => {
            this.startFlying();
        }, 3000);
    }
    
    startFlying() {
        this.state = 'flying';
        this.multiplier = 1.0;
        
        console.log(`🎯 Полет начался! Краш будет на ${this.crashPoint.toFixed(2)}x`);
        
        this.fly();
    }
    
    fly() {
        if (this.state !== 'flying') return;
        
        // Увеличиваем множитель
        this.multiplier += 0.01;
        
        // Обновляем экран
        this.updateDisplay();
        
        // Проверяем краш
        if (this.multiplier >= this.crashPoint) {
            this.crash();
            return;
        }
        
        // Продолжаем полет
        setTimeout(() => this.fly(), 50);
    }
    
    crash() {
        this.state = 'crashed';
        console.log(`💥 КРАШ на ${this.crashPoint.toFixed(2)}x!`);
        
        this.updateDisplay();
        
        // Через 3 секунды новая игра
        setTimeout(() => {
            this.start();
        }, 3000);
    }
    
    updateDisplay() {
        if (this.multiplierEl) {
            this.multiplierEl.textContent = this.multiplier.toFixed(2) + 'x';
        }
        
        if (this.statusEl) {
            if (this.state === 'waiting') {
                this.statusEl.textContent = '⏳ Ожидание...';
            } else if (this.state === 'flying') {
                this.statusEl.textContent = '🚀 ПОЛЕТ!';
            } else if (this.state === 'crashed') {
                this.statusEl.textContent = `💥 КРАШ ${this.crashPoint.toFixed(2)}x!`;
            }
        }
    }
}

// Запуск когда страница готова
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Страница загружена, запускаем краш');
    window.crashGame = new SimpleCrash();
});