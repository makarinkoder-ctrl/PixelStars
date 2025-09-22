import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } fr// Тестируем подключение к боту
console.log('🚀 Тестируем подключение к Telegram API...');

bot.telegram.getMe().then((botInfo) => {
  console.log('✅ Подключение к Telegram API успешно!');
  console.log('🤖 Имя бота:', botInfo.first_name);
  console.log('📝 Username:', botInfo.username);
  
  // Теперь запускаем бота
  console.log('🚀 Запускаем бота...');
  return bot.launch();
}).then(() => {
  console.log('🤖 Бот запущен успешно!');
  console.log('✅ Готов принимать сообщения');
  console.log('📱 WebApp URL:', `http://localhost:${PORT}`);
  
  // Запускаем игру только после успешного запуска бота
  console.log('🚀 Запуск непрерывной игры звезда...');
  startRocketGame();
}).catch((error) => {
  console.error('❌ Ошибка:', error.message);
  console.error('🔍 Код ошибки:', error.code);
});atabase from './config/database.js';
import { setupCommands } from './handlers/commands.js';
import { setupCaseHandlers } from './handlers/cases.js';
import { setupGameHandlers } from './handlers/games.js';
import { StarService } from './services/stars.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Инициализация бота
// Проверка BOT_TOKEN
if (!process.env.BOT_TOKEN) {
  console.error('❌ Ошибка: BOT_TOKEN не найден в .env файле');
  process.exit(1);
}

console.log('🔑 BOT_TOKEN найден:', process.env.BOT_TOKEN ? 'Да' : 'Нет');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Инициализация сервисов
const starService = new StarService();

// Middleware для бота - регистрация пользователей
bot.use(async (ctx, next) => {
  console.log('📨 Получено сообщение:', ctx.update);
  
  if (ctx.from) {
    const user = await database.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      [ctx.from.id.toString()]
    );

    if (!user) {
      await database.run(
        'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
        [
          ctx.from.id.toString(),
          ctx.from.username || null,
          ctx.from.first_name || null,
          ctx.from.last_name || null
        ]
      );
      console.log(`🆕 Новый пользователь: ${ctx.from.first_name} (@${ctx.from.username})`);
    } else {
      // Обновляем время последней активности
      await database.run(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE telegram_id = ?',
        [ctx.from.id.toString()]
      );
    }

    ctx.user = user || await database.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      [ctx.from.id.toString()]
    );
  }
  
  return next();
});

// Настройка обработчиков
setupCommands(bot, starService);
setupCaseHandlers(bot, starService);
setupGameHandlers(bot, starService);

// API роуты
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const user = await database.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      [req.params.telegramId]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/cases', async (req, res) => {
  try {
    const cases = await database.all(
      'SELECT * FROM cases WHERE active = 1 ORDER BY price ASC'
    );
    res.json(cases);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// API для состояния ракетки
app.get('/api/rocket/status', async (req, res) => {
  try {
    // Простая имитация состояния игры без импорта
    const now = Date.now();
    const cycle = (now % 20000) / 1000; // 20-секундный цикл
    
    let gameData;
    
    if (cycle < 10) {
      // Фаза ставок
      const timeLeft = Math.ceil(10 - cycle);
      gameData = {
        phase: 'waiting',
        multiplier: 1.00,
        playersCount: Math.floor(Math.random() * 15) + 5, // 5-20 игроков
        timeLeft: timeLeft,
        isRunning: true
      };
    } else if (cycle < 18) {
      // Фаза полета
      const flightTime = cycle - 10;
      const multiplier = 1 + flightTime * 0.15;
      gameData = {
        phase: 'flying',
        multiplier: multiplier,
        playersCount: Math.floor(Math.random() * 15) + 5, // 5-20 игроков
        timeLeft: 0,
        isRunning: true
      };
    } else {
      // Фаза взрыва
      gameData = {
        phase: 'crashed',
        multiplier: 1 + (18 - 10) * 0.15,
        playersCount: Math.floor(Math.random() * 15) + 5, // 5-20 игроков
        timeLeft: 0,
        isRunning: true
      };
    }
    
    res.json(gameData);
  } catch (error) {
    console.error('Rocket API Error:', error);
    res.status(500).json({ error: 'Ошибка получения состояния игры' });
  }
});app.post('/api/case/open/:caseId', async (req, res) => {
  try {
    const { telegramId } = req.body;
    const { caseId } = req.params;
    
    const result = await starService.openCase(telegramId, caseId);
    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Web App маршрут
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Веб-сервер запущен на порту ${PORT}`);
});

// Тестируем подключение к боту
console.log('🚀 Тестируем подключение к Telegram API...');

bot.telegram.getMe().then((botInfo) => {
  console.log('✅ Подключение к Telegram API успешно!');
  console.log('🤖 Имя бота:', botInfo.first_name);
  console.log('� Username:', botInfo.username);
  
  // Теперь запускаем бота
  console.log('🚀 Запускаем бота...');
  return bot.launch();
}).then(() => {
  console.log('🤖 Бот запущен успешно!');
  console.log('✅ Готов принимать сообщения');
  console.log('📱 WebApp URL:', `http://localhost:${PORT}`);
}).catch((error) => {
  console.error('❌ Ошибка:', error.message);
  console.error('🔍 Код ошибки:', error.code);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Завершение работы...');
  bot.stop('SIGINT');
  database.close();
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('🛑 Завершение работы...');
  bot.stop('SIGTERM');
  database.close();
  process.exit(0);
});

export { bot, app };