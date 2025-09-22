// Cases functionality
console.log('🚀 CASES.JS ЗАГРУЖЕН В', new Date().toLocaleTimeString());

class CasesManager {
    constructor() {
        console.log('🎁 CasesManager: Инициализация начата');
        this.cases = []; // Инициализируем пустой массив
        this.loadCases();
        this.updateInventoryDisplay(); // Загружаем инвентарь при старте
        this.setupEventListeners();
        console.log('🎁 CasesManager: Инициализация завершена');
    }

    setupEventListeners() {
        console.log('🎁 CasesManager: Настройка обработчиков событий');
        // Обработчики для модального окна превью
        const previewModal = document.getElementById('case-preview-modal');
        const closePreviewBtn = document.getElementById('close-preview-modal');
        const cancelBtn = document.getElementById('cancel-case-preview');
        const openFromPreviewBtn = document.getElementById('open-case-from-preview');

        console.log('🎁 Элементы модала:', {
            previewModal: !!previewModal,
            closePreviewBtn: !!closePreviewBtn,
            cancelBtn: !!cancelBtn,
            openFromPreviewBtn: !!openFromPreviewBtn
        });

        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => this.closePreviewModal());
        } else {
            console.warn('🎁 Кнопка закрытия превью не найдена!');
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closePreviewModal());
        } else {
            console.warn('🎁 Кнопка отмены не найдена!');
        }

        if (openFromPreviewBtn) {
            openFromPreviewBtn.addEventListener('click', () => this.openCaseFromPreview());
            console.log('🎁 Обработчик клика добавлен к кнопке открытия кейса');
        } else {
            console.error('🎁 КНОПКА ОТКРЫТИЯ КЕЙСА НЕ НАЙДЕНА!');
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
                this.cases = data; // Сохраняем кейсы
                this.renderCases(data);
            } else if (data.success) {
                this.cases = data.cases; // Сохраняем кейсы
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
        console.log('🎁 Rendering cases:', cases); // Debug
        const casesGrid = document.getElementById('cases-grid');
        if (!casesGrid) {
            console.error('❌ Cases grid не найден!');
            return;
        }

        if (!cases || cases.length === 0) {
            console.warn('⚠️ Нет кейсов для отображения');
            casesGrid.innerHTML = '<p>Загрузка кейсов...</p>';
            return;
        }

        console.log('🎁 Создаем HTML для', cases.length, 'кейсов');

        casesGrid.innerHTML = cases.map(caseData => `
            <div class="case-card ${caseData.rarity}" data-case-id="${caseData.id}">
                <div class="case-image">${caseData.image || caseData.emoji}</div>
                <div class="case-name">${caseData.name}</div>
                <div class="case-price">${caseData.price} ⭐</div>
                <div class="case-description">${caseData.description}</div>
                <div class="case-open-btn" data-case-id="${caseData.id}">🎁 ОТКРЫТЬ</div>
            </div>
        `).join('');
        
        // Добавляем обработчики кликов для карточек кейсов (просмотр)
        const caseCards = casesGrid.querySelectorAll('.case-card');
        caseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Если клик не по кнопке открытия, показываем модальное окно
                if (!e.target.classList.contains('case-open-btn')) {
                    const caseId = card.getAttribute('data-case-id');
                    console.log('👁️ Клик по кейсу для просмотра:', caseId);
                    this.showCaseModal(caseId);
                }
            });
        });
        
        // Добавляем обработчики кликов для кнопок открытия
        const openButtons = casesGrid.querySelectorAll('.case-open-btn');
        openButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const caseId = btn.getAttribute('data-case-id');
                console.log('🎁 Клик по кнопке открытия кейса:', caseId);
                this.directOpenCase(caseId);
            });
        });
        
        console.log('🎁 Добавлены обработчики для', caseCards.length, 'кейсов и', openButtons.length, 'кнопок открытия');
    }

    // Показать модальное окно с содержимым кейса
    showCaseModal(caseId) {
        console.log('👁️ Показываем модальное окно для кейса:', caseId);
        
        const caseIdString = String(caseId);
        const selectedCase = this.cases.find(c => String(c.id) === caseIdString);
        
        if (!selectedCase) {
            console.error('❌ Кейс не найден:', caseIdString);
            return;
        }

        console.log('👁️ Найденный кейс:', selectedCase);
        console.log('🎁 Призы в кейсе:', selectedCase.items);
        console.log('🔍 Есть ли items?', !!selectedCase.items);
        console.log('📦 Длина items:', selectedCase.items ? selectedCase.items.length : 'undefined');
        
        // Получаем или создаем модальное окно
        let modal = document.getElementById('casePreviewModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'casePreviewModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        // Создаем содержимое модального окна
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('casePreviewModal').style.display='none'">&times;</span>
                <h2>${selectedCase.name}</h2>
                <div class="modal-case-info">
                    <div class="modal-case-image">${selectedCase.image || selectedCase.emoji}</div>
                    <div class="modal-case-details">
                        <p><strong>Цена:</strong> ${selectedCase.price} ⭐</p>
                        <p><strong>Описание:</strong> ${selectedCase.description}</p>
                        <p><strong>Редкость:</strong> ${selectedCase.rarity}</p>
                    </div>
                </div>
                <h3>Возможные призы:</h3>
                <div class="prizes-grid" id="prizesGrid">
                    ${selectedCase.items ? selectedCase.items.map(prize => `
                        <div class="prize-item ${prize.rarity}">
                            <div class="prize-image">${prize.emoji}</div>
                            <div class="prize-name">${prize.name}</div>
                            <div class="prize-value">${prize.value} ⭐</div>
                            <div class="prize-chance">${prize.dropRate}%</div>
                        </div>
                    `).join('') : '<p>Нет данных о призах</p>'}
                </div>
                <div class="modal-actions">
                    <button class="open-case-btn" onclick="window.casesManager.openCaseFromModal('${selectedCase.id}')">
                        🎁 ОТКРЫТЬ ЗА ${selectedCase.price} ⭐
                    </button>
                </div>
            </div>
        `;

        // Показываем модальное окно
        modal.style.display = 'block';
        
        // Добавляем обработчик закрытия по клику вне модального окна
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Открыть кейс из модального окна
    openCaseFromModal(caseId) {
        console.log('🎁 Открытие кейса из модального окна:', caseId);
        
        // Закрываем модальное окно
        const modal = document.getElementById('casePreviewModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Открываем кейс
        this.directOpenCase(caseId);
    }

    // Прямое открытие кейса без превью для упрощения
    async directOpenCase(caseId) {
        console.log('🎁 Открытие кейса:', caseId);
        
        const caseIdString = String(caseId);
        const selectedCase = this.cases.find(c => String(c.id) === caseIdString);
        
        if (!selectedCase) {
            console.error('❌ Кейс не найден:', caseIdString);
            this.showToast('Кейс не найден!', 'error');
            return;
        }
        
        // Получаем текущий баланс правильным способом
        const currentBalance = window.getBalance ? window.getBalance() : (window.userStars || 0);
        
        console.log('🎁 Проверяем баланс для кейса:', selectedCase.price);
        console.log('🎁 Текущий баланс:', currentBalance);
        
        // Проверяем баланс
        if (currentBalance < selectedCase.price) {
            console.log('❌ Недостаточно звезд:', currentBalance, '<', selectedCase.price);
            this.showToast(`Недостаточно звезд! Нужно: ${selectedCase.price}, есть: ${currentBalance}`, 'error');
            return;
        }

        console.log('🎁 Начинаем открытие кейса...');
        
        try {
            await this.openCase(caseIdString);
        } catch (error) {
            console.error('❌ Ошибка открытия кейса:', error);
            this.showToast('Ошибка открытия кейса: ' + error.message, 'error');
        }
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
                    // Обновляем глобальный баланс
                    window.userStars = data.newBalance;
                    
                    // Обновляем отображение
                    const balanceElement = document.getElementById('balanceAmount');
                    if (balanceElement) {
                        balanceElement.textContent = data.newBalance;
                        console.log(`💰 Баланс сразу обновлен: ${data.newBalance} звезд`);
                    }
                    
                    // Сохраняем в localStorage если не в демо режиме
                    if (!window.isDemoMode) {
                        localStorage.setItem('realBalance', data.newBalance.toString());
                        console.log('💰 Баланс сохранен в localStorage после открытия кейса:', data.newBalance);
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
        console.log('🎰 Запуск рулетки через startRouletteAnimation');
        
        // Всегда используем новую простую рулетку
        this.startSimpleRouletteAnimation(winningPrize, allPrizes, newBalance);
        
        // Закрываем старое модальное окно если оно есть
        const modal = document.getElementById('case-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Восстанавливаем скролл
        document.body.style.overflow = 'auto';
    }

    // Упрощенная анимация для мобильных устройств
    startSimpleRouletteAnimation(winningPrize, allPrizes, newBalance) {
        console.log('🎰 Запуск рулетки для кейса');
        console.log('🏆 Выигрышный приз:', winningPrize);
        
        // Создаем рулетку прямо поверх страницы (как в тесте)
        const rouletteContainer = document.createElement('div');
        rouletteContainer.id = 'dynamic-roulette';
        rouletteContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 1000px;
            height: 200px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #ffd700;
            border-radius: 15px;
            overflow: hidden;
            z-index: 9999;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
        `;
        
        // Создаем контейнер для элементов рулетки
        const rouletteItems = document.createElement('div');
        rouletteItems.style.cssText = `
            display: flex;
            align-items: center;
            height: 100%;
            gap: 10px;
            padding: 10px;
            transition: transform 4s cubic-bezier(0.25, 0.1, 0.25, 1);
        `;
        
        // Создаем массив призов из реальных данных кейса
        const totalItems = 30;
        const winPosition = 22; // Выигрышная позиция
        const prizesList = [];
        
        console.log('🎁 Призы из кейса для рулетки:', allPrizes);
        
        for (let i = 0; i < totalItems; i++) {
            if (i === winPosition) {
                prizesList.push(winningPrize);
            } else if (allPrizes && allPrizes.length > 0) {
                // Используем реальные призы из кейса
                const randomPrize = allPrizes[Math.floor(Math.random() * allPrizes.length)];
                prizesList.push(randomPrize);
            } else {
                // Фейковые призы только если нет данных
                prizesList.push({
                    name: 'Приз ' + (i + 1),
                    emoji: '🎁',
                    rarity: 'common',
                    value: 100
                });
            }
        }
        
        // Создаем HTML элементы
        prizesList.forEach((prize, index) => {
            const item = document.createElement('div');
            // Убираем выделение выигрышного - все элементы одинаковые
            
            item.style.cssText = `
                min-width: 100px;
                width: 100px;
                height: 160px;
                background: linear-gradient(135deg, #2a2a4a 0%, #1a1a3a 100%);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                flex-shrink: 0;
                font-size: 12px;
                font-weight: bold;
                border: 2px solid #444;
                position: relative;
                overflow: hidden;
            `;
            
            item.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                    ${prize.emoji || prize.image || '🎁'}
                </div>
                <div style="text-align: center; line-height: 1.2; margin-bottom: 4px;">
                    ${(prize.name || 'Приз').substring(0, 8)}
                </div>
                <div style="color: #ffd700; font-size: 10px;">
                    ${prize.value || '?'} ⭐
                </div>
            `;
            
            rouletteItems.appendChild(item);
        });
        
        rouletteContainer.appendChild(rouletteItems);
        
        // Добавляем указатель в центре
        const pointer = document.createElement('div');
        pointer.style.cssText = `
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-top: 20px solid #ffd700;
            z-index: 10;
            filter: drop-shadow(0 3px 6px rgba(255, 215, 0, 0.6));
        `;
        rouletteContainer.appendChild(pointer);
        
        // Добавляем кнопку закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 68, 68, 0.8);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10;
            font-size: 16px;
            font-weight: bold;
        `;
        closeBtn.onclick = () => {
            document.body.removeChild(rouletteContainer);
            this.showResult(winningPrize, newBalance);
        };
        rouletteContainer.appendChild(closeBtn);
        
        // Добавляем на страницу
        document.body.appendChild(rouletteContainer);
        
        console.log('✅ Рулетка создана с', totalItems, 'элементами');
        
        // Запускаем анимацию
        setTimeout(() => {
            const containerWidth = rouletteContainer.offsetWidth;
            const itemWidth = 110; // ширина + gap
            const centerOffset = containerWidth / 2;
            const targetX = -(winPosition * itemWidth - centerOffset + 50);
            
            console.log('🎯 Анимация к позиции:', targetX);
            rouletteItems.style.transform = `translateX(${targetX}px)`;
            
            // Подсвечиваем победителя через 4 секунды
            setTimeout(() => {
                const winnerItem = rouletteItems.children[winPosition];
                if (winnerItem) {
                    winnerItem.style.boxShadow = '0 0 30px #ffd700';
                    winnerItem.style.transform = 'scale(1.05)';
                    winnerItem.style.zIndex = '5';
                }
                
                // Автоматически закрываем через 3 секунды после подсветки
                setTimeout(() => {
                    if (document.body.contains(rouletteContainer)) {
                        document.body.removeChild(rouletteContainer);
                        this.showResult(winningPrize, newBalance);
                    }
                }, 3000);
            }, 4000);
        }, 500);
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

    showToast(message, type = 'info') {
        console.log('💬 Toast:', message, type);
        
        // Создаем toast элемент
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : '#2ed573'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
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