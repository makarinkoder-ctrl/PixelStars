// Cases functionality
class CasesManager {
    constructor() {
        this.loadCases();
        this.updateInventoryDisplay(); // Загружаем инвентарь при старте
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчики для модального окна превью
        const previewModal = document.getElementById('case-preview-modal');
        const closePreviewBtn = document.getElementById('close-preview-modal');
        const cancelBtn = document.getElementById('cancel-case-preview');
        const openFromPreviewBtn = document.getElementById('open-case-from-preview');

        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => this.closePreviewModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closePreviewModal());
        }

        if (openFromPreviewBtn) {
            openFromPreviewBtn.addEventListener('click', () => this.openCaseFromPreview());
        }

        // Закрытие по клику на фон
        if (previewModal) {
            previewModal.addEventListener('click', (e) => {
                if (e.target === previewModal) {
                    this.closePreviewModal();
                }
            });
        }

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (previewModal && previewModal.style.display === 'flex') {
                    this.closePreviewModal();
                }
            }
        });
    }

    async initializeCases() {
        try {
            // Load available cases
            await this.loadCases();
        } catch (error) {
            console.error('Failed to initialize cases:', error);
            this.showError('Ошибка загрузки кейсов');
        }
    }

    async loadCases() {
        try {
            const response = await fetch('/api/cases');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // API возвращает массив кейсов напрямую
            if (Array.isArray(data)) {
                this.renderCases(data);
            } else if (data.success) {
                this.renderCases(data.cases);
            } else {
                throw new Error(data.error || 'Failed to load cases');
            }
        } catch (error) {
            console.error('Error loading cases:', error);
            this.showError('Не удалось загрузить кейсы');
        }
    }

    renderCases(cases) {
        console.log('Rendering cases:', cases); // Debug
        const casesGrid = document.getElementById('cases-grid');
        if (!casesGrid) {
            console.error('Cases grid not found!');
            return;
        }

        casesGrid.innerHTML = cases.map(caseData => `
            <div class="case-card ${caseData.rarity}" data-case-id="${caseData.id}">
                <div class="case-image">${caseData.image || caseData.emoji}</div>
                <div class="case-name">${caseData.name}</div>
                <div class="case-price">${caseData.price} ⭐</div>
                <div class="case-description">${caseData.description}</div>
            </div>
        `).join('');
        
        // Добавляем обработчики кликов после создания элементов
        console.log('Adding event listeners for', cases.length, 'cases'); // Debug
        cases.forEach(caseData => {
            const caseCard = casesGrid.querySelector(`[data-case-id="${caseData.id}"]`);
            if (caseCard) {
                console.log('Adding click listener for case', caseData.id); // Debug
                caseCard.addEventListener('click', () => {
                    console.log('Case clicked:', caseData.id); // Debug
                    this.showCasePreview(caseData);
                });
                
                // Добавляем визуальную индикацию что можно кликать
                caseCard.style.cursor = 'pointer';
            } else {
                console.error('Case card not found for id:', caseData.id);
            }
        });
    }

    async openCase(caseId) {
        try {
            console.log('Opening case:', caseId); // Debug log
            
            let user = window.Telegram?.WebApp?.initDataUnsafe?.user;
            
            // For testing outside Telegram, use fake user
            if (!user) {
                user = { id: 123456, first_name: 'TestUser' };
                console.log('Using test user for development');
            }

            // Show opening modal
            this.showOpeningModal(caseId);

            // Request case opening
            const response = await fetch('/api/open-case', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    caseId: caseId
                })
            });

            const data = await response.json();

            if (data.success) {
                // Immediately update balance before animation
                if (data.newBalance !== undefined) {
                    const balanceElement = document.getElementById('balanceAmount');
                    if (balanceElement) {
                        balanceElement.textContent = data.newBalance;
                        console.log(`💰 Баланс сразу обновлен: ${data.newBalance} звезд`);
                    }
                }
                
                // Start roulette animation
                this.startRouletteAnimation(data.result, data.allPossiblePrizes, data.newBalance);
            } else {
                this.closeModal();
                this.showError(data.error || 'Ошибка при открытии кейса');
            }

        } catch (error) {
            console.error('Error opening case:', error);
            this.closeModal();
            this.showError('Не удалось открыть кейс');
        }
    }

    showOpeningModal(caseId) {
        const modal = document.getElementById('case-modal');
        const openingSection = document.getElementById('case-opening');
        const resultSection = document.getElementById('case-result');
        
        // Reset modal state
        openingSection.style.display = 'block';
        resultSection.style.display = 'none';
        resultSection.classList.remove('show');
        
        modal.style.display = 'flex';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    startRouletteAnimation(winningPrize, allPrizes, newBalance) {
        const rouletteItems = document.getElementById('roulette-items');
        
        // Generate extended roulette with repeating items
        const rouletteData = this.generateRouletteItems(winningPrize, allPrizes);
        
        // Render roulette items with more visual effects
        rouletteItems.innerHTML = rouletteData.items.map((item, index) => `
            <div class="roulette-item ${item.rarity}" data-index="${index}">
                <div class="roulette-emoji">${item.emoji}</div>
                <div class="roulette-name">${item.name}</div>
                <div class="rarity-glow ${item.rarity}"></div>
            </div>
        `).join('');

        // Улучшенная анимация как в Gifts Battle
        const itemWidth = 96; // Увеличил для лучшего вида
        const winningIndex = rouletteData.winningIndex;
        
        // Показываем указатель в центре
        this.addRoulettePointer();
        
        // Начальная позиция - далеко слева
        rouletteItems.style.transition = 'none';
        rouletteItems.style.transform = 'translateX(400px)';
        
        // Принудительный reflow
        rouletteItems.offsetHeight;
        
        // Расчет финальной позиции для указателя
        const containerCenter = rouletteItems.parentElement.offsetWidth / 2;
        const winningElementCenter = winningIndex * itemWidth + itemWidth / 2;
        const finalPosition = containerCenter - winningElementCenter;
        
        // Добавляем несколько полных оборотов + случайность
        const extraSpins = 4 + Math.floor(Math.random() * 3); // 4-6 полных оборотов
        const totalWidth = rouletteData.items.length * itemWidth;
        const randomOffset = (Math.random() - 0.5) * 20; // Небольшое случайное смещение
        const moveDistance = finalPosition - (extraSpins * totalWidth) + randomOffset;

        console.log(`🎰 Улучшенная анимация: индекс ${winningIndex}, дистанция ${moveDistance}`);

        // Звуковые эффекты (имитация)
        this.playRouletteSound();

        // Запускаем плавную анимацию с несколькими фазами
        setTimeout(() => {
            // Фаза 1: Быстрый старт
            rouletteItems.style.transition = 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            rouletteItems.style.transform = `translateX(${moveDistance * 0.3}px)`;
            
            // Фаза 2: Средняя скорость
            setTimeout(() => {
                rouletteItems.style.transition = 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)';
                rouletteItems.style.transform = `translateX(${moveDistance * 0.7}px)`;
                
                // Фаза 3: Медленное завершение
                setTimeout(() => {
                    rouletteItems.style.transition = 'transform 1.8s cubic-bezier(0.19, 1, 0.22, 1)';
                    rouletteItems.style.transform = `translateX(${moveDistance}px)`;
                }, 1500);
            }, 1000);
        }, 300);

        // Подсветка выигрышного элемента перед результатом
        setTimeout(() => {
            this.highlightWinningItem(winningIndex);
        }, 4300);

        // Show result after complete animation 
        setTimeout(() => {
            this.showResult(winningPrize, newBalance);
        }, 5000); // 5 секунд на полную анимацию
    }

    // Добавить указатель рулетки
    addRoulettePointer() {
        const rouletteContainer = document.querySelector('.roulette-container');
        
        // Удаляем старый указатель если есть
        const existingPointer = rouletteContainer.querySelector('.roulette-pointer');
        if (existingPointer) existingPointer.remove();
        
        // Создаем новый указатель
        const pointer = document.createElement('div');
        pointer.className = 'roulette-pointer';
        pointer.innerHTML = '▼';
        rouletteContainer.appendChild(pointer);
    }

    // Подсветка выигрышного элемента
    highlightWinningItem(winningIndex) {
        const items = document.querySelectorAll('.roulette-item');
        const winningItem = items[winningIndex];
        
        if (winningItem) {
            winningItem.classList.add('winning-item');
            
            // Эффект пульсации
            setTimeout(() => {
                winningItem.style.transform = 'scale(1.1)';
                winningItem.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
            }, 100);
        }
    }

    // Звуковые эффекты (имитация через console)
    playRouletteSound() {
        console.log('🔊 Звук рулетки: tick-tick-tick...');
    }

    generateRouletteItems(winningPrize, allPrizes) {
        const items = [];
        const totalItems = Math.min(allPrizes.length, 100); // Используем все доступные призы (до 100)
        
        // Копируем все призы в рулетку
        for (let i = 0; i < totalItems; i++) {
            items.push(allPrizes[i % allPrizes.length]);
        }
        
        // Вставляем выигрышный приз в конце (для эффекта)
        const winningIndex = totalItems - Math.floor(Math.random() * 10) - 5; // Ближе к концу
        items[winningIndex] = winningPrize;
        
        return {
            items: items,
            winningIndex: winningIndex
        };
    }

    showResult(winningPrize, newBalance) {
        // Update balance display
        if (window.balanceManager) {
            window.balanceManager.updateBalance(newBalance);
        }

        // Add to inventory
        this.addToInventory(winningPrize);

        const modal = document.getElementById('case-modal');
        const opening = document.getElementById('case-opening');
        const result = document.getElementById('case-result');
        
        // Hide opening animation, show result
        opening.style.display = 'none';
        result.style.display = 'block';
        
        // Update result display
        document.getElementById('result-emoji').textContent = winningPrize.emoji;
        document.getElementById('result-name').textContent = winningPrize.name;
        document.getElementById('result-rarity').textContent = winningPrize.rarity;
        document.getElementById('result-rarity').className = `result-rarity ${winningPrize.rarity}`;

        console.log('🎉 Результат показан:', winningPrize);
    }

    closeModal() {
        const modal = document.getElementById('case-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Reset roulette
        const rouletteItems = document.getElementById('roulette-items');
        if (rouletteItems) {
            rouletteItems.style.transform = 'translateX(0)';
        }
    }

    bindEvents() {
        // Close modal events
        const modal = document.getElementById('case-modal');
        const closeBtn = document.getElementById('close-case-modal');
        const openAnotherBtn = document.getElementById('open-another-case');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (openAnotherBtn) {
            openAnotherBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.closeModal();
            }
        });
    }

    showError(message) {
        // You can implement a toast notification system here
        alert(message);
    }

    // Показать превью кейса
    async showCasePreview(caseData) {
        this.currentCaseData = caseData;
        
        const modal = document.getElementById('case-preview-modal');
        const title = document.getElementById('case-preview-title');
        const icon = document.getElementById('case-preview-icon');
        const price = document.getElementById('case-preview-price');
        const description = document.getElementById('case-preview-desc');
        const prizesGrid = document.getElementById('prizes-preview-grid');

        // Заполняем информацию о кейсе
        title.textContent = caseData.name;
        icon.textContent = caseData.image || caseData.emoji;
        price.innerHTML = `${caseData.price} ⭐`;
        description.textContent = caseData.description;

        // Получаем список призов для этого кейса из API
        try {
            const response = await fetch('/api/cases');
            const cases = await response.json();
            const casePrizes = this.getPrizesForCase(caseData.id);
            
            // Заполняем сетку призов
            prizesGrid.innerHTML = casePrizes.map(prize => `
                <div class="prize-preview-item ${prize.rarity}">
                    <span class="prize-emoji">${prize.emoji}</span>
                    <div class="prize-name">${prize.name}</div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading case prizes:', error);
            prizesGrid.innerHTML = '<div class="error">Ошибка загрузки призов</div>';
        }

        // Показываем модал
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Закрыть превью модал
    closePreviewModal() {
        const modal = document.getElementById('case-preview-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        this.currentCaseData = null;
    }

    // Открыть кейс из превью
    openCaseFromPreview() {
        console.log('openCaseFromPreview called, currentCaseData:', this.currentCaseData); // Debug
        if (this.currentCaseData) {
            console.log('Closing preview and opening case:', this.currentCaseData.id); // Debug
            this.closePreviewModal();
            this.openCase(this.currentCaseData.id);
        } else {
            console.error('No currentCaseData set!'); // Debug
            alert('Ошибка: данные кейса не найдены');
        }
    }

    // Получить призы для конкретного кейса
    getPrizesForCase(caseId) {
        // Возвращаем реальные Telegram подарки
        const allPrizes = [
            // Общие призы
            { name: "50 звезд", emoji: "⭐", rarity: "common" },
            { name: "100 звезд", emoji: "⭐", rarity: "common" },
            { name: "Тюльпан", emoji: "🌷", rarity: "common" },
            // Редкие призы
            { name: "300 звезд", emoji: "💫", rarity: "rare" },
            { name: "Торт", emoji: "🎂", rarity: "rare" },
            { name: "Связка шаров", emoji: "🎈", rarity: "rare" },
            // Эпические призы
            { name: "1000 звезд", emoji: "🌟", rarity: "epic" },
            { name: "Плюшевый мишка", emoji: "🧸", rarity: "epic" },
            { name: "Букет роз", emoji: "🌹", rarity: "epic" },
            // Легендарные призы
            { name: "ДЖЕКПОТ 5000⭐", emoji: "🎰", rarity: "legendary" },
            { name: "Изумруд", emoji: "💎", rarity: "legendary" }
        ];

        // В зависимости от кейса возвращаем разные наборы призов
        switch(caseId) {
            case 'basic':
                return allPrizes.filter(p => ['common', 'rare'].includes(p.rarity));
            case 'premium':
                return allPrizes.filter(p => ['common', 'rare', 'epic'].includes(p.rarity));
            case 'legendary':
                return allPrizes;
            case 'mega':
                return allPrizes.filter(p => ['rare', 'epic', 'legendary'].includes(p.rarity));
            default:
                return allPrizes.slice(0, 8); // Показываем первые 8 призов
        }
    }

    // Генерация превью подарков для кейса
    generateCasePreview(caseId) {
        const casePrizes = {
            'basic': [
                { emoji: '🍎', name: 'Яблоко', rarity: 'common' },
                { emoji: '🍌', name: 'Банан', rarity: 'common' },
                { emoji: '🍇', name: 'Виноград', rarity: 'uncommon' },
                { emoji: '🍓', name: 'Клубника', rarity: 'rare' }
            ],
            'premium': [
                { emoji: '💎', name: 'Алмаз', rarity: 'rare' },
                { emoji: '👑', name: 'Корона', rarity: 'epic' },
                { emoji: '🏆', name: 'Кубок', rarity: 'epic' },
                { emoji: '⚡', name: 'Молния', rarity: 'legendary' }
            ],
            'legendary': [
                { emoji: '🦄', name: 'Единорог', rarity: 'legendary' },
                { emoji: '🐉', name: 'Дракон', rarity: 'legendary' },
                { emoji: '⭐', name: 'Звезда', rarity: 'mythic' },
                { emoji: '🌟', name: 'Суперзвезда', rarity: 'mythic' }
            ],
            'mythic': [
                { emoji: '🔥', name: 'Огонь', rarity: 'mythic' },
                { emoji: '❄️', name: 'Лед', rarity: 'mythic' },
                { emoji: '🌙', name: 'Луна', rarity: 'mythic' },
                { emoji: '☀️', name: 'Солнце', rarity: 'mythic' }
            ]
        };

        const prizes = casePrizes[caseId] || casePrizes['basic'];
        return prizes.map(prize => 
            `<div class="preview-item ${prize.rarity}">
                <span class="preview-emoji">${prize.emoji}</span>
                <span class="preview-name">${prize.name}</span>
            </div>`
        ).join('');
    }

    // Добавить подарок в инвентарь
    addToInventory(prize) {
        let inventory = JSON.parse(localStorage.getItem('playerInventory') || '[]');
        
        // Добавляем подарок с timestamp
        const inventoryItem = {
            ...prize,
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString()
        };
        
        inventory.push(inventoryItem);
        localStorage.setItem('playerInventory', JSON.stringify(inventory));
        
        // Обновляем отображение инвентаря
        this.updateInventoryDisplay();
        
        console.log('🎁 Подарок добавлен в инвентарь:', inventoryItem);
    }

    // Обновить отображение инвентаря
    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;

        const inventory = JSON.parse(localStorage.getItem('playerInventory') || '[]');
        
        if (inventory.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="inventory-empty">
                    <span class="empty-icon">📦</span>
                    <p>Подарки появятся здесь после открытия кейсов</p>
                </div>
            `;
        } else {
            inventoryGrid.innerHTML = inventory.map(item => `
                <div class="inventory-item ${item.rarity}">
                    <div class="inventory-emoji">${item.emoji}</div>
                    <div class="inventory-name">${item.name}</div>
                    <div class="inventory-rarity">${item.rarity}</div>
                </div>
            `).join('');
        }
    }
}

// Initialize cases manager immediately
window.casesManager = new CasesManager();

// Also initialize when DOM loads (backup)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.casesManager) {
        window.casesManager = new CasesManager();
    }
});