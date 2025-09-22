// Cases functionality
class CasesManager {
    constructor() {
        this.loadCases();
        this.updateInventoryDisplay(); // Загружаем инвентарь при старте
        this.setupEventListeners();
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
        const casesGrid = document.getElementById('cases-grid');
        if (!casesGrid) return;

        casesGrid.innerHTML = cases.map(caseData => `
            <div class="case-card ${caseData.rarity}" data-case-id="${caseData.id}">
                <div class="case-image">${caseData.image || caseData.emoji}</div>
                <div class="case-name">${caseData.name}</div>
                <div class="case-price">${caseData.price} ⭐</div>
                <div class="case-description">${caseData.description}</div>
                
                <!-- Превью подарков -->
                <div class="case-preview">
                    <div class="preview-title">Возможные подарки:</div>
                    <div class="preview-items">
                        ${this.generateCasePreview(caseData.id)}
                    </div>
                </div>
                
                <button class="case-btn" onclick="window.casesManager.openCase('${caseData.id}')">
                    Открыть кейс
                </button>
            </div>
        `).join('');
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
        
        // Generate random items for roulette (including the winning prize)
        const rouletteData = this.generateRouletteItems(winningPrize, allPrizes);
        
        // Render roulette items
        rouletteItems.innerHTML = rouletteData.items.map(item => `
            <div class="roulette-item ${item.rarity}">
                <div class="roulette-emoji">${item.emoji}</div>
                <div class="roulette-name">${item.name}</div>
            </div>
        `).join('');

        // Правильная анимация как в TG
        const itemWidth = 94; // 90px + 4px gap
        const winningIndex = rouletteData.winningIndex;
        
        // Начальная позиция - показываем элементы слева
        rouletteItems.style.transition = 'none';
        rouletteItems.style.transform = 'translateX(300px)';
        
        // Принудительный reflow
        rouletteItems.offsetHeight;
        
        // Финальная позиция - выигрышный элемент в центре контейнера
        const containerCenter = rouletteItems.parentElement.offsetWidth / 2;
        const winningElementCenter = winningIndex * itemWidth + itemWidth / 2;
        const finalPosition = containerCenter - winningElementCenter;
        
        // Добавляем дополнительные прокрутки
        const totalWidth = rouletteData.items.length * itemWidth;
        const extraSpins = 3 + Math.floor(Math.random() * 2); // 3-4 полных оборота
        const moveDistance = finalPosition - (extraSpins * totalWidth);

        console.log(`🎰 Анимация: индекс ${winningIndex}, финал ${finalPosition}, движение ${moveDistance}`);

        // Запускаем анимацию
        setTimeout(() => {
            rouletteItems.style.transition = 'transform 3.5s cubic-bezier(0.23, 1, 0.32, 1)';
            rouletteItems.style.transform = `translateX(${moveDistance}px)`;
        }, 200);

        // Show result after animation 
        setTimeout(() => {
            this.showResult(winningPrize, newBalance);
        }, 4000); // 4 секунды на анимацию
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