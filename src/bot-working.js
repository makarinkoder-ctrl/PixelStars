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
      
      console.log(`💥 Звезда разбилась на x${gameState.crashPoint.toFixed(2)}`);
      
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
      id: 1,
      name: 'Стартовый кейс',
      price: 50,
      image: '🎁',
      rarity: 'common',
      description: 'Базовый кейс для новичков'
    },
    {
      id: 2,
      name: 'Звездный кейс',
      price: 150,
      image: '⭐',
      rarity: 'rare',
      description: 'Больше шансов на редкие предметы'
    },
    {
      id: 3,
      name: 'Премиум кейс',
      price: 300,
      image: '💎',
      rarity: 'epic',
      description: 'Эксклюзивные награды'
    },
    {
      id: 4,
      name: 'Легендарный кейс',
      price: 500,
      image: '👑',
      rarity: 'legendary',
      description: 'Самые редкие предметы'
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
    
    // Найти кейс
    const cases = [
      { id: 1, name: 'Стартовый кейс', price: 50, rarity: 'common' },
      { id: 2, name: 'Звездный кейс', price: 150, rarity: 'rare' },
      { id: 3, name: 'Премиум кейс', price: 300, rarity: 'epic' },
      { id: 4, name: 'Легендарный кейс', price: 500, rarity: 'legendary' }
    ];
    
    const selectedCase = cases.find(c => c.id == caseId);
    if (!selectedCase) {
      return res.status(404).json({ error: 'Кейс не найден' });
    }
    
    // Получить случайный приз
    const prize = getRandomPrize(selectedCase.rarity);
    
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
    
    res.json({
      success: true,
      case: selectedCase,
      prize,
      animation: animationItems,
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
        playersCount: Math.floor(Math.random() * 15) + 5,
        isRunning: false
      });
    } else if (gameState.phase === 'flying') {
      const elapsed = Date.now() - gameState.startTime;
      const currentMultiplier = 1 + elapsed * 0.0001; // Рост множителя
      
      res.json({
        phase: 'flying',
        multiplier: Math.min(currentMultiplier, gameState.crashPoint),
        playersCount: Math.floor(Math.random() * 15) + 5,
        timeLeft: 0,
        isRunning: true
      });
    } else { // crashed
      res.json({
        phase: 'crashed',
        multiplier: gameState.crashPoint,
        playersCount: Math.floor(Math.random() * 15) + 5,
        timeLeft: 3,
        isRunning: false
      });
    }
  } catch (error) {
    console.error('Rocket API Error:', error);
    res.status(500).json({ error: 'Ошибка получения состояния игры' });
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

    // Проверяем баланс (пока фиктивный)
    const userBalance = 1000;
    if (userBalance < selectedCase.price) {
      return res.status(400).json({
        success: false,
        error: `Недостаточно звезд! Нужно ${selectedCase.price}, у вас ${userBalance}`
      });
    }

    console.log(`💰 Списано ${selectedCase.price} звезд с пользователя ${userId}`);

    // Генерируем случайный приз
    const allPrizes = [
      // Общие призы (40% шанс)
      { name: "50 звезд", emoji: "⭐", rarity: "common", description: "Неплохая добавка к балансу", weight: 20 },
      { name: "100 звезд", emoji: "⭐", rarity: "common", description: "Хороший бонус звезд", weight: 15 },
      { name: "Стикер-пак", emoji: "🎨", rarity: "common", description: "Классные стикеры", weight: 5 },
      
      // Редкие призы (35% шанс) 
      { name: "300 звезд", emoji: "💫", rarity: "rare", description: "Отличный приз!", weight: 15 },
      { name: "500 звезд", emoji: "💫", rarity: "rare", description: "Великолепный бонус", weight: 10 },
      { name: "Премиум стикеры", emoji: "🎭", rarity: "rare", description: "Эксклюзивные стикеры", weight: 10 },
      
      // Эпические призы (20% шанс)
      { name: "1000 звезд", emoji: "🌟", rarity: "epic", description: "Потрясающая награда!", weight: 10 },
      { name: "7 дней VIP", emoji: "👑", rarity: "epic", description: "Неделя премиум статуса", weight: 5 },
      { name: "Редкий предмет", emoji: "💎", rarity: "epic", description: "Очень ценная находка", weight: 5 },
      
      // Легендарные призы (5% шанс)
      { name: "ДЖЕКПОТ 5000!", emoji: "🎰", rarity: "legendary", description: "НЕВЕРОЯТНО! Главный приз!", weight: 3 },
      { name: "30 дней VIP", emoji: "🏆", rarity: "legendary", description: "Месяц премиум статуса!", weight: 2 }
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

    // Возвращаем результат с большим количеством призов для рулетки
    const extendedPrizes = [];
    for (let i = 0; i < 100; i++) { // 100 призов для длинной рулетки
      const randomPrize = allPrizes[Math.floor(Math.random() * allPrizes.length)];
      extendedPrizes.push(randomPrize);
    }

    res.json({
      success: true,
      result: selectedPrize,
      allPossiblePrizes: extendedPrizes,
      newBalance: userBalance - selectedCase.price
    });

  } catch (error) {
    console.error('Open case error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при открытии кейса'
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