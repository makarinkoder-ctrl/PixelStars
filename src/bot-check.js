import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Простые команды
bot.start(async (ctx) => {
  console.log('📨 Получен /start от:', ctx.from.first_name);
  
  const welcomeMessage = `
🎰 *Приветствую вас в Pixelstars Casino!* ⭐

🎮 Добро пожаловать в мир увлекательных игр!

Нажмите кнопку ниже, чтобы открыть наше мини-приложение:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 Открыть казино', 'http://localhost:3000')]
  ]);

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard.reply_markup
  });
});

bot.command('test', async (ctx) => {
  console.log('📨 Получен /test от:', ctx.from.first_name);
  await ctx.reply('✅ Тест прошел успешно!');
});

// Тестируем только getMe без launch
console.log('🚀 Тестируем подключение...');

bot.telegram.getMe().then((botInfo) => {
  console.log('✅ Подключение успешно!');
  console.log('🤖 Бот:', botInfo.first_name, '@' + botInfo.username);
  console.log('📝 Готов к приему команд');
  
  // Только проверяем подключение, но не запускаем polling
}).catch((error) => {
  console.error('❌ Ошибка подключения:', error.message);
});

export { bot };