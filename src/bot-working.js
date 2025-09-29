import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// Простая команда start
bot.start(async (ctx) => {
  try {
    console.log('📨 Получен /start от:', ctx.from.first_name);
    
    const welcomeMessage = `
🎰 *Приветствую вас в Pixelstars Casino!* ⭐

Привет, ${ctx.from.first_name}! 
Добро пожаловать в мир увлекательных игр!

🌐 *Откройте игру в браузере:*
https://pixelstars1.onrender.com

🎮 *Доступные функции:*
• 🚀 Ракета - игра на множители (24/7)
• ⏱ 10-секундные перерывы между раундами
• 💰 Система авто-вывода
• ⭐ Ставки от 50+ звезд
• ✨ Красивые анимации звезды

Просто скопируйте ссылку выше и откройте в браузере!`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.webApp('🎰 Играть в казино', 'https://pixelstars1.onrender.com')],
      [Markup.button.callback('ℹ️ Подробная информация', 'info')],
      [Markup.button.callback('📊 Статистика', 'stats')]
    ]);

    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup
    });
    
    console.log('✅ Ответ отправлен!');
  } catch (error) {
    console.error('❌ Ошибка в start:', error.message);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка кнопки статистики
bot.action('stats', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const statsMessage = `
📊 *Статистика игрока:*

👤 Игрок: ${ctx.from.first_name}
⭐ Баланс: 1000 звезд (стартовый)
🎮 Игр сыграно: 0
💰 Всего выиграно: 0 звезд
📈 Лучший множитель: 1.00x

🚀 *Текущее состояние игры:*
Игра работает 24/7!
Присоединяйтесь: https://pixelstars1.onrender.com`;

    await ctx.reply(statsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Ошибка в stats:', error.message);
  }
});

// Обработка кнопки информации
bot.action('info', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const infoMessage = `
ℹ️ *Информация о казино:*

🎮 *Доступные игры:*
• 🚀 Ракета - игра на множители
• 🎁 Кейсы - открывай и получай призы

🔗 *Как играть:*
1. Откройте ссылку: https://pixelstars1.onrender.com
2. Играйте прямо в браузере
3. Все функции доступны!

✅ *Особенности:*
• 24/7 работа
• 10-секундные перерывы
• Система авто-вывода
• Ставки от 50+ звезд
• Красивые анимации звезды`;

    await ctx.reply(infoMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Ошибка в info:', error.message);
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('❌ Ошибка бота:', err);
  console.error('Контекст:', ctx.update);
});

// Игровое состояние
let gameState = {
  phase: 'waiting', // waiting, flying, crashed
  multiplier: 1.0,
  startTime: Date.now() + 10000, // начало через 10 сек
  crashPoint: 1.0 + Math.random() * 4, // случайный краш от 1 до 5
  players: 0
};

// Хранение активных ставок текущего раунда
let currentRoundBets = new Map(); // userId -> { amount, autoWithdraw, timestamp }

// История последних 5 крашей
let crashHistory = []; // массив последних crashPoint-ов (максимум 5)

// Функция запуска игры
function startGame() {
  console.log('🚀 Запуск игры ракета...');
  runGameCycle();
}

function runGameCycle() {
  // Фаза ожидания (10 секунд)
  gameState.phase = 'waiting';
  gameState.startTime = Date.now() + 10000;
  gameState.crashPoint = 1.0 + Math.random() * 4;
  gameState.multiplier = 1.0;
  
  // Очищаем ставки предыдущего раунда
  currentRoundBets.clear();
  console.log(`🧹 Очищены ставки предыдущего раунда`);
  
  console.log(`⭐ Новый раунд, краш-поинт: ${gameState.crashPoint}`);
  
  setTimeout(() => {
    // Фаза полета
    gameState.phase = 'flying';
    gameState.startTime = Date.now();
    
    const flyDuration = (gameState.crashPoint - 1) * 10000; // 10 сек на каждый множитель
    
    setTimeout(() => {
      // Фаза краша
      gameState.phase = 'crashed';
      gameState.multiplier = gameState.crashPoint;
      
      // Добавляем краш в историю
      crashHistory.unshift(gameState.crashPoint);
      if (crashHistory.length > 5) {
        crashHistory.pop(); // Оставляем только последние 5
      }
      
      console.log(`💥 Звезда разбилась на x${gameState.crashPoint.toFixed(2)}`);
      console.log(`📊 История: [${crashHistory.map(x => 'x' + x.toFixed(2)).join(', ')}]`);
      
      setTimeout(() => {
        runGameCycle(); // Новый цикл
      }, 3000); // 3 секунды на показ результата
    }, flyDuration);
  }, 10000);
}

// API маршруты
app.get('/api/user/:telegramId', async (req, res) => {
  res.json({ balance: 1000, username: 'TestUser' });
});

// API для кейсов
app.get('/api/cases', async (req, res) => {
  const cases = [
    {
      id: 'starter_box',
      name: '🎁 Стартовый бокс',
      cost: 50,
      price: 50,
      image: '🎁',
      emoji: '🎁',
      rarity: 'common',
      description: 'Идеальный старт для новичков! Звезды и милые подарки ждут вас',
      items: [
        { name: '25 звезд', value: 25, emoji: '⭐', rarity: 'common', dropRate: 35, type: 'stars' },
        { name: '50 звезд', value: 50, emoji: '💫', rarity: 'common', dropRate: 25, type: 'stars' },
        { name: 'Тюльпан', value: 0, emoji: '�', rarity: 'common', dropRate: 20, type: 'gift' },
        { name: 'Роза', value: 0, emoji: '🌹', rarity: 'common', dropRate: 15, type: 'gift' },
        { name: 'Ромашка', value: 0, emoji: '🌼', rarity: 'common', dropRate: 5, type: 'gift' }
      ]
    },
    {
      id: 'premium_case',
      name: '🌟 Премиум кейс',
      cost: 120,
      price: 120,
      image: '🌟',
      emoji: '🌟',
      rarity: 'rare',
      description: 'Больше звезд и эксклюзивные подарки из Telegram Store',
      items: [
        { name: '75 звезд', value: 75, emoji: '⭐', rarity: 'rare', dropRate: 30, type: 'stars' },
        { name: '150 звезд', value: 150, emoji: '💫', rarity: 'rare', dropRate: 20, type: 'stars' },
        { name: 'Связка шаров', value: 0, emoji: '🎈', rarity: 'rare', dropRate: 20, type: 'gift' },
        { name: 'Торт', value: 0, emoji: '�', rarity: 'rare', dropRate: 15, type: 'gift' },
        { name: 'Кекс', value: 0, emoji: '🧁', rarity: 'rare', dropRate: 10, type: 'gift' },
        { name: 'Конфеты', value: 0, emoji: '�', rarity: 'rare', dropRate: 5, type: 'gift' }
      ]
    },
    {
      id: 'golden_box',
      name: '💎 Золотой бокс',
      cost: 250,
      price: 250,
      image: '💎',
      emoji: '💎',
      rarity: 'epic',
      description: 'Драгоценности и крупные звездные призы для удачливых игроков',
      items: [
        { name: '200 звезд', value: 200, emoji: '⭐', rarity: 'epic', dropRate: 25, type: 'stars' },
        { name: '350 звезд', value: 350, emoji: '🌟', rarity: 'epic', dropRate: 15, type: 'stars' },
        { name: 'Букет роз', value: 0, emoji: '�', rarity: 'epic', dropRate: 20, type: 'gift' },
        { name: 'Плюшевый мишка', value: 0, emoji: '🧸', rarity: 'epic', dropRate: 15, type: 'gift' },
        { name: 'Изумруд', value: 0, emoji: '💚', rarity: 'epic', dropRate: 12, type: 'gift' },
        { name: 'Сапфир', value: 0, emoji: '�', rarity: 'epic', dropRate: 8, type: 'gift' },
        { name: 'Алмаз', value: 0, emoji: '�', rarity: 'legendary', dropRate: 5, type: 'gift' }
      ]
    },
    {
      id: 'royal_chest',
      name: '👑 Королевский сундук',
      cost: 500,
      price: 500,
      image: '👑',
      emoji: '👑',
      rarity: 'legendary',
      description: 'Легендарные награды для настоящих королей казино!',
      items: [
        { name: '500 звезд', value: 500, emoji: '⭐', rarity: 'legendary', dropRate: 20, type: 'stars' },
        { name: '1000 звезд', value: 1000, emoji: '🌟', rarity: 'legendary', dropRate: 10, type: 'stars' },
        { name: '🎰 МЕГА ДЖЕКПОТ', value: 2500, emoji: '🎰', rarity: 'legendary', dropRate: 3, type: 'stars' },
        { name: 'Золотая корона', value: 0, emoji: '👑', rarity: 'legendary', dropRate: 15, type: 'gift' },
        { name: 'Платиновый мишка', value: 0, emoji: '🧸', rarity: 'legendary', dropRate: 12, type: 'gift' },
        { name: 'Редкий изумруд', value: 0, emoji: '💚', rarity: 'legendary', dropRate: 10, type: 'gift' },
        { name: 'Космический огонь', value: 0, emoji: '🔥', rarity: 'legendary', dropRate: 8, type: 'gift' },
        { name: 'Звездная пыль', value: 0, emoji: '✨', rarity: 'legendary', dropRate: 7, type: 'gift' },
        { name: '🦄 ЕДИНОРОГ', value: 0, emoji: '🦄', rarity: 'legendary', dropRate: 5, type: 'gift' },
        { name: '🎁 МИСТИЧЕСКИЙ ПОДАРОК', value: 0, emoji: '🎁', rarity: 'legendary', dropRate: 10, type: 'gift' }
      ]
    },
    {
      id: 'cosmic_vault',
      name: '🚀 Космическое хранилище',
      cost: 1000,
      price: 1000,
      image: '🚀',
      emoji: '🚀',
      rarity: 'mythic',
      description: 'Эксклюзивные космические призы для самых отважных игроков',
      items: [
        { name: '1500 звезд', value: 1500, emoji: '⭐', rarity: 'mythic', dropRate: 15, type: 'stars' },
        { name: '3000 звезд', value: 3000, emoji: '🌟', rarity: 'mythic', dropRate: 8, type: 'stars' },
        { name: '🎰 КОСМО ДЖЕКПОТ', value: 5000, emoji: '🎰', rarity: 'mythic', dropRate: 2, type: 'stars' },
        { name: 'Космический корабль', value: 0, emoji: '🚀', rarity: 'mythic', dropRate: 12, type: 'gift' },
        { name: 'Планета', value: 0, emoji: '🪐', rarity: 'mythic', dropRate: 10, type: 'gift' },
        { name: 'Галактика', value: 0, emoji: '�', rarity: 'mythic', dropRate: 8, type: 'gift' },
        { name: 'Черная дыра', value: 0, emoji: '🕳️', rarity: 'mythic', dropRate: 6, type: 'gift' },
        { name: 'Комета', value: 0, emoji: '☄️', rarity: 'mythic', dropRate: 15, type: 'gift' },
        { name: 'Инопланетянин', value: 0, emoji: '👽', rarity: 'mythic', dropRate: 12, type: 'gift' },
        { name: 'НЛО', value: 0, emoji: '🛸', rarity: 'mythic', dropRate: 12, type: 'gift' }
      ]
    }
  ];
  res.json(cases);
});

// Подарки которые могут выпасть
const prizes = {
  common: [
    { name: '10 звезд', value: 10, emoji: '⭐', rarity: 'common', chance: 40 },
    { name: '25 звезд', value: 25, emoji: '⭐', rarity: 'common', chance: 30 },
    { name: 'Стикер Smile', value: 0, emoji: '😊', rarity: 'common', chance: 20 },
    { name: 'Стикер Wink', value: 0, emoji: '😉', rarity: 'common', chance: 10 }
  ],
  rare: [
    { name: '50 звезд', value: 50, emoji: '⭐', rarity: 'rare', chance: 35 },
    { name: '100 звезд', value: 100, emoji: '⭐', rarity: 'rare', chance: 25 },
    { name: 'Премиум стикер', value: 0, emoji: '🎨', rarity: 'rare', chance: 20 },
    { name: 'Бонус x2', value: 0, emoji: '🎲', rarity: 'rare', chance: 15 },
    { name: 'Редкий эмодзи', value: 0, emoji: '🦄', rarity: 'rare', chance: 5 }
  ],
  epic: [
    { name: '200 звезд', value: 200, emoji: '⭐', rarity: 'epic', chance: 30 },
    { name: '350 звезд', value: 350, emoji: '⭐', rarity: 'epic', chance: 20 },
    { name: 'VIP статус', value: 0, emoji: '👑', rarity: 'epic', chance: 25 },
    { name: 'Эпический стикер', value: 0, emoji: '✨', rarity: 'epic', chance: 15 },
    { name: 'Мега бонус', value: 0, emoji: '🎊', rarity: 'epic', chance: 10 }
  ],
  legendary: [
    { name: '500 звезд', value: 500, emoji: '⭐', rarity: 'legendary', chance: 25 },
    { name: '1000 звезд', value: 1000, emoji: '⭐', rarity: 'legendary', chance: 15 },
    { name: 'Telegram Premium', value: 0, emoji: '⚡', rarity: 'legendary', chance: 30 },
    { name: 'Легендарный стикер', value: 0, emoji: '🔥', rarity: 'legendary', chance: 20 },
    { name: 'Джекпот!', value: 2000, emoji: '💰', rarity: 'legendary', chance: 10 }
  ]
};

// Функция для выбора случайного приза
function getRandomPrize(caseRarity) {
  const availablePrizes = prizes[caseRarity] || prizes.common;
  const totalChance = availablePrizes.reduce((sum, prize) => sum + prize.chance, 0);
  let random = Math.random() * totalChance;
  
  for (const prize of availablePrizes) {
    random -= prize.chance;
    if (random <= 0) {
      return prize;
    }
  }
  
  return availablePrizes[0]; // fallback
}

// API для открытия кейса
app.post('/api/case/open/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Не указан Telegram ID' });
    }
    
    // Проверяем пользователя
    const user = users.get(parseInt(telegramId));
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Найти кейс
    const casesData = [
      { id: 1, name: 'Стартовый кейс', price: 50, rarity: 'common' },
      { id: 2, name: 'Звездный кейс', price: 150, rarity: 'rare' },
      { id: 3, name: 'Премиум кейс', price: 300, rarity: 'epic' },
      { id: 4, name: 'Легендарный кейс', price: 500, rarity: 'legendary' }
    ];
    
    const selectedCase = casesData.find(c => c.id == caseId);
    if (!selectedCase) {
      return res.status(404).json({ error: 'Кейс не найден' });
    }
    
    // Проверяем баланс
    if (user.stars_balance < selectedCase.price) {
      return res.status(400).json({ 
        error: 'Недостаточно звезд',
        required: selectedCase.price,
        current: user.stars_balance
      });
    }
    
    // Списываем стоимость кейса
    user.stars_balance -= selectedCase.price;
    user.total_spent += selectedCase.price;
    user.cases_opened++;
    
    // Получить случайный приз
    const prize = getRandomPrize(selectedCase.rarity);
    
    // Обрабатываем выигрыш
    if (prize.type === 'stars') {
      // Если это звезды - начисляем на баланс
      user.stars_balance += prize.value;
      user.total_won += prize.value;
    } else {
      // Если это предмет - добавляем в инвентарь
      if (!user.inventory) {
        user.inventory = [];
      }
      
      const inventoryItem = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: prize.name,
        emoji: prize.emoji,
        rarity: prize.rarity,
        description: prize.description || 'Предмет из кейса',
        sell_price: Math.floor((prize.value || 50) * 0.7), // 70% от стоимости
        obtained_at: new Date().toISOString(),
        from_case: selectedCase.name
      };
      
      user.inventory.push(inventoryItem);
    }
    
    // Начисляем опыт
    user.experience += 10;
    const newLevel = Math.floor(user.experience / 100) + 1;
    let levelUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      levelUp = true;
    }
    
    user.last_activity = new Date().toISOString();
    users.set(parseInt(telegramId), user);
    
    // Создать анимацию (список возможных призов для барабана)
    const animationItems = [];
    const allPrizes = Object.values(prizes).flat();
    
    // Добавить 20 случайных предметов для анимации
    for (let i = 0; i < 20; i++) {
      const randomPrize = allPrizes[Math.floor(Math.random() * allPrizes.length)];
      animationItems.push({
        name: randomPrize.name,
        emoji: randomPrize.emoji,
        rarity: randomPrize.rarity
      });
    }
    
    // Добавить выигрышный предмет в конец
    animationItems.push({
      name: prize.name,
      emoji: prize.emoji,
      rarity: prize.rarity
    });
    
    console.log(`🎁 ${user.first_name} открыл кейс ${selectedCase.name} и получил: ${prize.name}`);
    
    res.json({
      success: true,
      case: selectedCase,
      prize,
      animation: animationItems,
      new_balance: user.stars_balance,
      level_up: levelUp,
      new_level: user.level,
      user: user,
      message: `Поздравляем! Вы получили: ${prize.emoji} ${prize.name}!`
    });
  } catch (error) {
    console.error('Case opening error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rocket/status', async (req, res) => {
  try {
    if (gameState.phase === 'waiting') {
      const timeLeft = Math.max(0, Math.ceil((gameState.startTime - Date.now()) / 1000));
      res.json({
        phase: 'waiting',
        timeLeft,
        multiplier: 1.0,
        playersCount: currentRoundBets.size,
        isRunning: false,
        crashHistory: crashHistory
      });
    } else if (gameState.phase === 'flying') {
      const elapsed = Date.now() - gameState.startTime;
      const currentMultiplier = 1 + elapsed * 0.0001; // Рост множителя
      
      res.json({
        phase: 'flying',
        multiplier: Math.min(currentMultiplier, gameState.crashPoint),
        playersCount: currentRoundBets.size,
        timeLeft: 0,
        isRunning: true,
        crashHistory: crashHistory
      });
    } else { // crashed
      res.json({
        phase: 'crashed',
        multiplier: gameState.crashPoint,
        playersCount: currentRoundBets.size,
        timeLeft: 3,
        isRunning: false,
        crashHistory: crashHistory
      });
    }
  } catch (error) {
    console.error('Rocket API Error:', error);
    res.status(500).json({ error: 'Ошибка получения состояния игры' });
  }
});

// API для размещения ставки в ракете
app.post('/api/rocket/bet', async (req, res) => {
  try {
    const { userId, amount, autoWithdraw } = req.body;
    
    // Проверка входных данных
    if (!userId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Требуется userId и amount' 
      });
    }
    
    // Проверка что игра в фазе ожидания
    if (gameState.phase !== 'waiting') {
      return res.status(400).json({ 
        success: false, 
        error: 'Ставки закрыты. Дождитесь следующего раунда.' 
      });
    }
    
    // Проверка минимальной ставки
    if (amount < 50) {
      return res.status(400).json({ 
        success: false, 
        error: 'Минимальная ставка 50 звезд' 
      });
    }
    
    // Проверка что игрок еще не делал ставку в этом раунде
    if (currentRoundBets.has(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Вы уже сделали ставку в этом раунде' 
      });
    }
    
    // Регистрируем ставку
    currentRoundBets.set(userId, {
      amount: amount,
      autoWithdraw: autoWithdraw || null,
      timestamp: Date.now()
    });
    
    console.log(`🎰 Новая ставка: ${userId} поставил ${amount} звезд (автовывод: ${autoWithdraw || 'ручной'})`);
    console.log(`👥 Всего игроков в раунде: ${currentRoundBets.size}`);
    
    res.json({ 
      success: true, 
      message: 'Ставка принята',
      playersCount: currentRoundBets.size
    });
    
  } catch (error) {
    console.error('Ошибка размещения ставки:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// API для открытия кейса
app.post('/api/open-case', async (req, res) => {
  try {
    const { userId, caseId } = req.body;
    
    if (!userId || !caseId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Требуется userId и caseId' 
      });
    }

    // Находим кейс
    const casesData = [
      { id: "1", name: "Стартовый кейс", price: 50, emoji: "🎁", rarity: "common" },
      { id: "2", name: "Звездный кейс", price: 150, emoji: "⭐", rarity: "rare" },
      { id: "3", name: "Премиум кейс", price: 300, emoji: "💎", rarity: "epic" },
      { id: "4", name: "Легендарный кейс", price: 500, emoji: "👑", rarity: "legendary" }
    ];

    const selectedCase = casesData.find(c => c.id === caseId);
    if (!selectedCase) {
      return res.status(404).json({
        success: false,
        error: 'Кейс не найден'
      });
    }

    // Проверяем пользователя
    const user = users.get(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    if (user.stars_balance < selectedCase.price) {
      return res.status(400).json({
        success: false,
        error: `Недостаточно звезд! Нужно ${selectedCase.price}, у вас ${user.stars_balance}`
      });
    }

    // Списываем стоимость кейса
    user.stars_balance -= selectedCase.price;
    user.total_spent += selectedCase.price;
    user.cases_opened++;
    
    console.log(`💰 Списано ${selectedCase.price} звезд с пользователя ${user.first_name}. Новый баланс: ${user.stars_balance}`);

    // Генерируем случайный приз с настоящими Telegram подарками
    const allPrizes = [
      // Общие призы (45% шанс)
      { name: "50 звезд", emoji: "⭐", rarity: "common", description: "Звезды Telegram", weight: 20 },
      { name: "100 звезд", emoji: "⭐", rarity: "common", description: "Звезды Telegram", weight: 15 },
      { name: "Тюльпан", emoji: "�", rarity: "common", description: "Цветок-подарок", weight: 10 },
      
      // Редкие призы (30% шанс) 
      { name: "300 звезд", emoji: "💫", rarity: "rare", description: "Звезды Telegram", weight: 12 },
      { name: "Торт", emoji: "🎂", rarity: "rare", description: "Вкусный подарок", weight: 8 },
      { name: "Связка шаров", emoji: "�", rarity: "rare", description: "Праздничный подарок", weight: 10 },
      
      // Эпические призы (20% шанс)
      { name: "1000 звезд", emoji: "🌟", rarity: "epic", description: "Звезды Telegram", weight: 8 },
      { name: "Плюшевый мишка", emoji: "🧸", rarity: "epic", description: "Милый подарок", weight: 6 },
      { name: "Букет роз", emoji: "🌹", rarity: "epic", description: "Романтичный подарок", weight: 6 },
      
      // Легендарные призы (5% шанс)
      { name: "ДЖЕКПОТ 5000⭐", emoji: "🎰", rarity: "legendary", description: "Главный приз в звездах!", weight: 3 },
      { name: "Изумруд", emoji: "💎", rarity: "legendary", description: "Драгоценный камень", weight: 2 }
    ];

    // Взвешенный случайный выбор
    const totalWeight = allPrizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedPrize = allPrizes[0];
    for (const prize of allPrizes) {
      random -= prize.weight;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    // Обрабатываем выигрыш
    if (selectedPrize.name.includes('звезд')) {
      // Если это звезды - начисляем на баланс
      const starsWon = parseInt(selectedPrize.name.match(/\d+/)[0]);
      user.stars_balance += starsWon;
      user.total_won += starsWon;
    } else {
      // Если это предмет - добавляем в инвентарь
      if (!user.inventory) {
        user.inventory = [];
      }
      
      const inventoryItem = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: selectedPrize.name,
        emoji: selectedPrize.emoji,
        rarity: selectedPrize.rarity,
        description: selectedPrize.description || 'Предмет из кейса',
        sell_price: Math.floor((selectedPrize.weight || 50) * 10), // Цена продажи
        obtained_at: new Date().toISOString(),
        from_case: selectedCase.name
      };
      
      user.inventory.push(inventoryItem);
    }
    
    // Начисляем опыт
    user.experience += 10;
    const newLevel = Math.floor(user.experience / 100) + 1;
    let levelUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      levelUp = true;
    }
    
    user.last_activity = new Date().toISOString();
    users.set(parseInt(userId), user);
    
    // Возвращаем результат с большим количеством призов для рулетки
    const extendedPrizes = [];
    for (let i = 0; i < 100; i++) { // 100 призов для длинной рулетки
      const randomPrize = allPrizes[Math.floor(Math.random() * allPrizes.length)];
      extendedPrizes.push(randomPrize);
    }

    console.log(`🎁 ${user.first_name} открыл кейс ${selectedCase.name} и получил: ${selectedPrize.name}`);

    res.json({
      success: true,
      result: selectedPrize,
      allPossiblePrizes: extendedPrizes,
      newBalance: user.stars_balance,
      level_up: levelUp,
      new_level: user.level,
      user: user
    });

  } catch (error) {
    console.error('Open case error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при открытии кейса'
    });
  }
});

// === НОВЫЕ API ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ===

// База данных пользователей в памяти (в продакшн нужна реальная БД)
const users = new Map();

// Обновленный API получения пользователя
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const telegramId = parseInt(req.params.telegramId);
    const user = users.get(telegramId);
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API регистрации нового пользователя
app.post('/api/user/register', async (req, res) => {
  try {
    const { telegram_id, first_name, last_name, username, language_code, is_premium } = req.body;
    
    if (!telegram_id || !first_name) {
      return res.status(400).json({ error: 'Недостаточно данных для регистрации' });
    }

    // Проверяем, существует ли пользователь
    if (users.has(telegram_id)) {
      return res.json(users.get(telegram_id));
    }

    // Создаем нового пользователя
    const newUser = {
      telegram_id: telegram_id,
      first_name: first_name,
      last_name: last_name || '',
      username: username || '',
      language_code: language_code || 'ru',
      is_premium: is_premium || false,
      stars_balance: 100, // Стартовый бонус
      level: 1,
      experience: 0,
      total_won: 0,
      total_spent: 0,
      games_played: 0,
      cases_opened: 0,
      inventory: [], // Инвентарь пользователя
      registration_date: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    users.set(telegram_id, newUser);
    
    console.log(`🆕 Новый пользователь зарегистрирован: ${first_name} (ID: ${telegram_id})`);
    
    res.json(newUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// API обновления баланса пользователя
app.post('/api/user/balance', async (req, res) => {
  try {
    const { telegram_id, amount, new_balance } = req.body;
    
    if (!telegram_id || amount === undefined) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    const user = users.get(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Обновляем баланс и статистику
    user.stars_balance = new_balance;
    user.last_activity = new Date().toISOString();
    
    if (amount > 0) {
      user.total_won += amount;
    } else {
      user.total_spent += Math.abs(amount);
    }

    users.set(telegram_id, user);
    
    console.log(`💰 Баланс пользователя ${user.first_name} обновлен: ${amount} (итого: ${new_balance})`);
    
    res.json({ 
      success: true, 
      balance: user.stars_balance,
      user: user
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Ошибка обновления баланса' });
  }
});

// API статистики пользователя
app.post('/api/user/stats', async (req, res) => {
  try {
    const { telegram_id, action, data } = req.body;
    
    const user = users.get(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Обновляем статистику
    switch (action) {
      case 'game_played':
        user.games_played++;
        break;
      case 'case_opened':
        user.cases_opened++;
        break;
      case 'experience_gained':
        user.experience += data.amount || 1;
        // Проверяем повышение уровня
        const newLevel = Math.floor(user.experience / 100) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
          console.log(`🎉 Пользователь ${user.first_name} достиг уровня ${newLevel}!`);
        }
        break;
    }

    user.last_activity = new Date().toISOString();
    users.set(telegram_id, user);
    
    res.json({ success: true, user: user });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Ошибка обновления статистики' });
  }
});

// API списка всех пользователей (для админки)
app.get('/api/users/all', async (req, res) => {
  try {
    const allUsers = Array.from(users.values()).map(user => ({
      telegram_id: user.telegram_id,
      first_name: user.first_name,
      username: user.username,
      stars_balance: user.stars_balance,
      level: user.level,
      total_won: user.total_won,
      total_spent: user.total_spent,
      games_played: user.games_played,
      cases_opened: user.cases_opened,
      registration_date: user.registration_date,
      last_activity: user.last_activity
    }));
    
    res.json({
      total_users: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// === API ДЛЯ ИНВЕНТАРЯ ===

// Получить инвентарь пользователя
app.get('/api/inventory/:telegramId', async (req, res) => {
  try {
    const telegramId = parseInt(req.params.telegramId);
    const user = users.get(telegramId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({
      inventory: user.inventory || [],
      total_items: (user.inventory || []).length
    });
  } catch (error) {
    console.error('Error getting inventory:', error);
    res.status(500).json({ error: 'Ошибка получения инвентаря' });
  }
});

// Добавить предмет в инвентарь
app.post('/api/inventory/add', async (req, res) => {
  try {
    const { telegram_id, item } = req.body;
    
    if (!telegram_id || !item) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }
    
    const user = users.get(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Инициализируем инвентарь если его нет
    if (!user.inventory) {
      user.inventory = [];
    }
    
    // Добавляем предмет с уникальным ID и временем получения
    const inventoryItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: item.name,
      emoji: item.emoji,
      rarity: item.rarity,
      description: item.description,
      sell_price: Math.floor((item.value || 50) * 0.7), // 70% от стоимости
      obtained_at: new Date().toISOString(),
      from_case: item.from_case || 'Unknown'
    };
    
    user.inventory.push(inventoryItem);
    user.last_activity = new Date().toISOString();
    users.set(telegram_id, user);
    
    console.log(`📦 Предмет ${item.name} добавлен в инвентарь ${user.first_name}`);
    
    res.json({ 
      success: true, 
      item: inventoryItem,
      inventory: user.inventory
    });
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    res.status(500).json({ error: 'Ошибка добавления предмета' });
  }
});

// Продать предмет из инвентаря
app.post('/api/inventory/sell', async (req, res) => {
  try {
    const { telegram_id, item_id } = req.body;
    
    if (!telegram_id || !item_id) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }
    
    const user = users.get(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (!user.inventory) {
      return res.status(400).json({ error: 'Инвентарь пуст' });
    }
    
    // Находим предмет в инвентаре
    const itemIndex = user.inventory.findIndex(item => item.id === item_id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Предмет не найден в инвентаре' });
    }
    
    const soldItem = user.inventory[itemIndex];
    const sellPrice = soldItem.sell_price;
    
    // Удаляем предмет из инвентаря
    user.inventory.splice(itemIndex, 1);
    
    // Начисляем звезды
    user.stars_balance += sellPrice;
    user.total_won += sellPrice;
    user.last_activity = new Date().toISOString();
    users.set(telegram_id, user);
    
    console.log(`💰 ${user.first_name} продал ${soldItem.name} за ${sellPrice} звезд`);
    
    res.json({
      success: true,
      sold_item: soldItem,
      sell_price: sellPrice,
      new_balance: user.stars_balance,
      inventory: user.inventory
    });
  } catch (error) {
    console.error('Error selling item:', error);
    res.status(500).json({ error: 'Ошибка продажи предмета' });
  }
});

// API для вывода средств в ракете
app.post('/api/rocket/withdraw', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Не указан ID пользователя' 
      });
    }
    
    // Проверяем есть ли ставка
    if (!currentRoundBets.has(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'У вас нет активной ставки' 
      });
    }
    
    // Можно забрать только во время полета
    if (gameState.phase !== 'flying') {
      return res.status(400).json({ 
        success: false, 
        error: 'Вывод средств доступен только во время полета' 
      });
    }
    
    const bet = currentRoundBets.get(userId);
    const winAmount = Math.floor(bet.amount * gameState.multiplier);
    
    // Удаляем ставку из активных
    currentRoundBets.delete(userId);
    
    console.log(`💰 Пользователь ${userId} забрал ${winAmount} звезд на множителе ${gameState.multiplier.toFixed(2)}x`);
    
    res.json({ 
      success: true, 
      winAmount: winAmount,
      multiplier: gameState.multiplier
    });
    
  } catch (error) {
    console.error('Ошибка вывода средств:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Web App маршрут
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Webhook для бота (если понадобится)
app.use(bot.webhookCallback('/webhook'));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Веб-сервер запущен на порту ${PORT}`);
  
  // Запускаем игру сразу
  console.log('🎮 Запускаем игровой цикл...');
  startGame();
});

// Простой запуск с polling (без блокировки игры)
console.log('🚀 Запускаем бота с polling...');
setTimeout(() => {
  bot.launch().then(() => {
    console.log('✅ Бот запущен в polling режиме!');
  }).catch((error) => {
    console.log('❌ Polling не работает');
  });
}, 1000);

export { bot, app };