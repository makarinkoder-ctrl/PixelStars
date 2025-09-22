import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Простой обработчик
bot.start((ctx) => {
  console.log('📨 Получен /start от:', ctx.from.first_name);
  
  const welcomeMessage = `
🎰 *Приветствую вас в Pixelstars Casino!* ⭐

🎮 Добро пожаловать в мир увлекательных игр!

Нажмите кнопку ниже, чтобы открыть наше мини-приложение:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 Открыть казино', 'http://localhost:3000')]
  ]);

  ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard.reply_markup
  });
});

bot.command('test', (ctx) => {
  console.log('📨 Получен /test от:', ctx.from.first_name);
  ctx.reply('Тест прошел успешно!');
});

console.log('🚀 Запускаем тестового бота...');

setTimeout(() => {
  console.log('⏰ Прошло 10 секунд...');
}, 10000);

bot.launch().then(() => {
  console.log('✅ Тестовый бот запущен!');
  console.log('📝 Попробуйте отправить /start');
}).catch((error) => {
  console.error('❌ Ошибка:', error.message);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));