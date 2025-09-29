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
                <div class="case-price">${caseData.cost} ⭐</div>
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

    // УЛУЧШЕННАЯ анимация с эффектами
    startSimpleRouletteAnimation(winningPrize, allPrizes, newBalance) {
        console.log('🎰 Запуск ПРЕМИУМ рулетки для кейса');
        console.log('🏆 Выигрышный приз:', winningPrize);
        
        // Создаем полноэкранный контейнер с эффектами
        const fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.id = 'fullscreen-roulette-overlay';
        fullscreenOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeInOverlay 0.5s ease;
        `;
        
        // Создаем рулетку с новым дизайном
        const rouletteContainer = document.createElement('div');
        rouletteContainer.id = 'premium-roulette';
        rouletteContainer.style.cssText = `
            width: 95vw;
            max-width: 1200px;
            height: 220px;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            border: 3px solid transparent;
            border-image: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700) 1;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            box-shadow: 
                0 0 50px rgba(255, 215, 0, 0.6),
                0 0 100px rgba(255, 215, 0, 0.3),
                inset 0 0 50px rgba(255, 215, 0, 0.1);
            animation: containerPulse 2s infinite ease-in-out;
        `;
        
        // Добавляем CSS анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOverlay {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes containerPulse {
                0%, 100% { 
                    box-shadow: 
                        0 0 50px rgba(255, 215, 0, 0.6),
                        0 0 100px rgba(255, 215, 0, 0.3),
                        inset 0 0 50px rgba(255, 215, 0, 0.1);
                }
                50% { 
                    box-shadow: 
                        0 0 70px rgba(255, 215, 0, 0.8),
                        0 0 120px rgba(255, 215, 0, 0.5),
                        inset 0 0 70px rgba(255, 215, 0, 0.2);
                }
            }
            @keyframes itemFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            @keyframes rarityGlow {
                0%, 100% { filter: brightness(1) drop-shadow(0 0 10px currentColor); }
                50% { filter: brightness(1.3) drop-shadow(0 0 20px currentColor); }
            }
            @keyframes winnerExplosion {
                0% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.2) rotate(90deg); }
                50% { transform: scale(1.4) rotate(180deg); }
                75% { transform: scale(1.2) rotate(270deg); }
                100% { transform: scale(1) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Создаем контейнер для элементов рулетки
        const rouletteItems = document.createElement('div');
        rouletteItems.style.cssText = `
            display: flex;
            align-items: center;
            height: 100%;
            gap: 15px;
            padding: 15px;
            transition: transform 5s cubic-bezier(0.15, 0.1, 0.25, 1);
        `;
        
        // Создаем массив призов из реальных данных кейса
        const totalItems = 35;
        const winPosition = 28; // Выигрышная позиция ближе к концу
        const prizesList = [];
        
        console.log('🎁 Призы из кейса для премиум рулетки:', allPrizes);
        
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
        
        // Функция получения цвета редкости
        const getRarityColor = (rarity) => {
            switch(rarity) {
                case 'common': return '#95a5a6';
                case 'rare': return '#3498db';
                case 'epic': return '#9b59b6';
                case 'legendary': return '#f39c12';
                case 'mythic': return '#e74c3c';
                default: return '#95a5a6';
            }
        };
        
        // Создаем HTML элементы с улучшенным дизайном
        prizesList.forEach((prize, index) => {
            const item = document.createElement('div');
            const rarityColor = getRarityColor(prize.rarity);
            
            item.style.cssText = `
                min-width: 120px;
                width: 120px;
                height: 180px;
                background: linear-gradient(135deg, 
                    rgba(${hexToRgb(rarityColor)}, 0.3) 0%, 
                    rgba(${hexToRgb(rarityColor)}, 0.1) 50%, 
                    rgba(0,0,0,0.8) 100%);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 15px;
                flex-shrink: 0;
                font-size: 13px;
                font-weight: bold;
                border: 3px solid ${rarityColor};
                position: relative;
                overflow: hidden;
                animation: itemFloat 3s infinite ease-in-out;
                animation-delay: ${index * 0.1}s;
                transition: all 0.3s ease;
            `;
            
            // Добавляем эффект свечения для редких предметов
            if (['epic', 'legendary', 'mythic'].includes(prize.rarity)) {
                item.style.animation += ', rarityGlow 2s infinite ease-in-out';
            }
            
            item.innerHTML = `
                <div style="
                    font-size: 40px; 
                    margin-bottom: 12px; 
                    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
                    animation: itemFloat 2s infinite ease-in-out;
                ">
                    ${prize.emoji || prize.image || '🎁'}
                </div>
                <div style="
                    text-align: center; 
                    line-height: 1.3; 
                    margin-bottom: 8px;
                    color: ${rarityColor};
                    text-shadow: 0 2px 4px rgba(0,0,0,0.7);
                    font-weight: 800;
                ">
                    ${(prize.name || 'Приз').substring(0, 10)}
                </div>
                <div style="
                    color: #ffd700; 
                    font-size: 12px;
                    background: rgba(255,215,0,0.2);
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-weight: bold;
                ">
                    ${prize.value ? prize.value + ' ⭐' : 'ПОДАРОК'}
                </div>
                <div style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: ${rarityColor};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: bold;
                ">
                    ${prize.rarity}
                </div>
            `;
            
            rouletteItems.appendChild(item);
        });
        
        // Функция конвертации hex в RGB
        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 
                `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
                '255, 255, 255';
        }
        
        rouletteContainer.appendChild(rouletteItems);
        
        // УЛУЧШЕННЫЙ указатель в центре с эффектами
        const pointer = document.createElement('div');
        pointer.style.cssText = `
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 25px solid #ffd700;
            z-index: 15;
            filter: drop-shadow(0 5px 10px rgba(255, 215, 0, 0.8));
            animation: containerPulse 1s infinite ease-in-out;
        `;
        rouletteContainer.appendChild(pointer);
        
        // Добавляем заголовок
        const title = document.createElement('div');
        title.style.cssText = `
            position: absolute;
            top: -80px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffd700;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            z-index: 15;
            animation: containerPulse 1.5s infinite ease-in-out;
        `;
        title.textContent = '🎰 РОЗЫГРЫШ ПРИЗОВ 🎰';
        fullscreenOverlay.appendChild(title);
        
        // Стильная кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 20;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.transform = 'scale(1.1)';
            closeBtn.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.6)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.transform = 'scale(1)';
            closeBtn.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.4)';
        };
        closeBtn.onclick = () => {
            document.body.removeChild(fullscreenOverlay);
            this.showResult(winningPrize, newBalance);
        };
        rouletteContainer.appendChild(closeBtn);
        
        // Добавляем контейнер в оверлей
        fullscreenOverlay.appendChild(rouletteContainer);
        
        // Добавляем на страницу
        document.body.appendChild(fullscreenOverlay);
        
        console.log('✅ ПРЕМИУМ рулетка создана с', totalItems, 'элементами');
        
        // Добавляем звуковые эффекты (визуальные)
        this.createVisualSoundEffects(fullscreenOverlay);
        
        // Запускаем анимацию с задержкой для эффекта
        setTimeout(() => {
            const containerWidth = rouletteContainer.offsetWidth;
            const itemWidth = 135; // ширина + gap
            const centerOffset = containerWidth / 2;
            const targetX = -(winPosition * itemWidth - centerOffset + 60);
            
            console.log('🎯 Запуск ПРЕМИУМ анимации к позиции:', targetX);
            rouletteItems.style.transform = `translateX(${targetX}px)`;
            
            // Добавляем эффекты частиц во время движения
            this.createParticleEffect(rouletteContainer);
            
            // Подсвечиваем победителя через 5 секунд
            setTimeout(() => {
                const winnerItem = rouletteItems.children[winPosition];
                if (winnerItem) {
                    // МОЩНЫЙ эффект победителя
                    winnerItem.style.animation = 'winnerExplosion 1s ease-out';
                    winnerItem.style.boxShadow = `
                        0 0 50px ${getRarityColor(winningPrize.rarity)},
                        0 0 100px ${getRarityColor(winningPrize.rarity)},
                        inset 0 0 30px rgba(255,255,255,0.3)
                    `;
                    winnerItem.style.transform = 'scale(1.2)';
                    winnerItem.style.zIndex = '10';
                    
                    // Создаем фейерверк эффект
                    this.createFireworkEffect(winnerItem, winningPrize.rarity);
                }
                
                // Показываем результат через 4 секунды после подсветки
                setTimeout(() => {
                    if (document.body.contains(fullscreenOverlay)) {
                        fullscreenOverlay.style.animation = 'fadeInOverlay 0.5s ease reverse';
                        setTimeout(() => {
                            if (document.body.contains(fullscreenOverlay)) {
                                document.body.removeChild(fullscreenOverlay);
                            }
                            this.showResult(winningPrize, newBalance);
                        }, 500);
                    }
                }, 4000);
            }, 5000);
        }, 1000);
        
        // Функция получения цвета редкости (локальная копия)
        function getRarityColor(rarity) {
            switch(rarity) {
                case 'common': return '#95a5a6';
                case 'rare': return '#3498db';
                case 'epic': return '#9b59b6';
                case 'legendary': return '#f39c12';
                case 'mythic': return '#e74c3c';
                default: return '#95a5a6';
            }
        }
    }

    // Создание визуальных звуковых эффектов
    createVisualSoundEffects(container) {
        const soundIndicator = document.createElement('div');
        soundIndicator.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            color: #ffd700;
            font-size: 16px;
            z-index: 15;
            animation: containerPulse 0.5s infinite ease-in-out;
        `;
        soundIndicator.textContent = '🔊 Рулетка крутится...';
        container.appendChild(soundIndicator);
        
        // Меняем текст через 3 секунды
        setTimeout(() => {
            soundIndicator.textContent = '🎵 Замедляется...';
        }, 3000);
        
        setTimeout(() => {
            soundIndicator.textContent = '🎊 Результат!';
        }, 5000);
    }

    // Создание эффекта частиц
    createParticleEffect(container) {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #ffd700;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 5;
                    animation: particleFall 2s linear forwards;
                    left: ${Math.random() * 100}%;
                    top: -10px;
                `;
                
                // Добавляем CSS для анимации частиц
                if (!document.querySelector('#particle-styles')) {
                    const particleStyle = document.createElement('style');
                    particleStyle.id = 'particle-styles';
                    particleStyle.textContent = `
                        @keyframes particleFall {
                            to {
                                transform: translateY(250px) rotate(360deg);
                                opacity: 0;
                            }
                        }
                    `;
                    document.head.appendChild(particleStyle);
                }
                
                container.appendChild(particle);
                
                // Удаляем частицу через 2 секунды
                setTimeout(() => {
                    if (container.contains(particle)) {
                        container.removeChild(particle);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    // Создание эффекта фейерверка
    createFireworkEffect(element, rarity) {
        const colors = {
            'common': '#95a5a6',
            'rare': '#3498db', 
            'epic': '#9b59b6',
            'legendary': '#f39c12',
            'mythic': '#e74c3c'
        };
        
        const color = colors[rarity] || '#ffd700';
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                const angle = (i * 24) * Math.PI / 180; // 15 частиц по кругу
                const distance = 50 + Math.random() * 50;
                
                firework.style.cssText = `
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: ${color};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 15;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    animation: fireworkExplode 1s ease-out forwards;
                `;
                
                // Добавляем CSS для фейерверка
                if (!document.querySelector('#firework-styles')) {
                    const fireworkStyle = document.createElement('style');
                    fireworkStyle.id = 'firework-styles';
                    fireworkStyle.textContent = `
                        @keyframes fireworkExplode {
                            to {
                                transform: translate(
                                    calc(-50% + ${Math.cos(angle) * distance}px), 
                                    calc(-50% + ${Math.sin(angle) * distance}px)
                                ) scale(0);
                                opacity: 0;
                            }
                        }
                    `;
                    document.head.appendChild(fireworkStyle);
                }
                
                element.appendChild(firework);
                
                setTimeout(() => {
                    if (element.contains(firework)) {
                        element.removeChild(firework);
                    }
                }, 1000);
            }, i * 50);
        }
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