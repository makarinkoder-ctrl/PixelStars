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
app.use(express.static(path.join(__dirname, '../dist')));

// Простая команда start
bot.start((ctx) => {
  console.log('📨 Получен /start от:', ctx.from.first_name);
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🎰 Открыть Казино', 'http://localhost:3000')],
    [Markup.button.callback('📊 Баланс', 'balance')],
    [Markup.button.callback('ℹ️ Помощь', 'help')]
  ]);
  
  ctx.reply(`🎰 *Добро пожаловать в Pixelstars Casino!* ⭐

Привет, ${ctx.from.first_name}! 

🎮 *Что ты можешь делать:*
🎁 Открывать кейсы с подарками
🚀 Играть в увлекательную игру "Звезда"
📊 Соревноваться с другими игроками
💎 Получать эксклюзивные награды`, {
    parse_mode: 'Markdown',
    ...keyboard
  });
});

// Обработчик кнопок
bot.action('balance', (ctx) => {
  ctx.answerCbQuery();
  ctx.editMessageText('💰 Ваш баланс: 1000 ⭐', {
    reply_markup: {
      inline_keyboard: [[
        { text: '← Назад', callback_data: 'menu' }
      ]]
    }
  });
});

bot.action('help', (ctx) => {
  ctx.answerCbQuery();
  ctx.editMessageText('ℹ️ Помощь:\n\n🎰 Нажмите "Открыть Казино" чтобы начать играть!\n🚀 Игра "Звезда" - ставьте и забирайте до краша!', {
    reply_markup: {
      inline_keyboard: [[
        { text: '← Назад', callback_data: 'menu' }
      ]]
    }
  });
});

bot.action('menu', (ctx) => {
  ctx.answerCbQuery();
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🎰 Открыть Казино', 'http://localhost:3000')],
    [Markup.button.callback('📊 Баланс', 'balance')],
    [Markup.button.callback('ℹ️ Помощь', 'help')]
  ]);
  
  ctx.editMessageText(`🎰 *Pixelstars Casino* ⭐

🎮 Выберите действие:`, {
    parse_mode: 'Markdown',
    ...keyboard
  });
});

// API для веб-приложения
app.get('/api/user/:telegramId', (req, res) => {
  res.json({
    telegram_id: req.params.telegramId,
    balance: 1000,
    username: 'player'
  });
});

// Заглушка для rocket API
app.get('/api/rocket/status', (req, res) => {
  res.json({
    phase: 'waiting',
    timeLeft: 10,
    multiplier: 1,
    playersCount: 12,
    isRunning: false
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Веб-сервер запущен на порту ${PORT}`);
});

// Запуск бота
bot.launch().then(() => {
  console.log('🤖 Бот запущен успешно!');
  console.log('✅ Готов принимать сообщения');
  console.log('📱 WebApp URL: http://localhost:3000');
}).catch((error) => {
  console.error('❌ Ошибка запуска бота:', error.message);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));