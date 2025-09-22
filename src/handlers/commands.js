import { Markup } from 'telegraf';

export function setupCommands(bot, starService) {
  // Команда /start
  bot.start(async (ctx) => {
    const user = ctx.user;
    const balance = await starService.getUserBalance(ctx.from.id);
    
    const welcomeMessage = `
🎰 *Приветствую вас в Pixelstars Casino!* ⭐

Привет, ${ctx.from.first_name}! 
Добро пожаловать в мир увлекательных игр!

Твой баланс: *${balance} звезд* ⭐

🎮 *Что ты можешь делать:*
🎁 Открывать кейсы с подарками
🚀 Играть в увлекательную игру "Ракетка"
📊 Соревноваться с другими игроками
💎 Получать эксклюзивные награды

💫 *Каждый новый игрок получает 1000 звезд для старта!*

Нажмите кнопку ниже, чтобы открыть наше мини-приложение:
    `;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.webApp('🎰 Открыть казино', 'http://localhost:3000'),
      ],
      [
        Markup.button.callback('💰 Баланс', 'balance'),
        Markup.button.callback('🎁 Кейсы', 'cases')
      ],
      [
        Markup.button.callback('🚀 Ракетка', 'rocket'),
        Markup.button.callback('📊 Статистика', 'stats')
      ],
      [
        Markup.button.callback('🏆 Топ игроков', 'leaderboard'),
        Markup.button.callback('ℹ️ Помощь', 'help')
      ]
    ]);

    await ctx.replyWithMarkdown(welcomeMessage, keyboard);
  });

  // Команда /balance
  bot.command('balance', async (ctx) => {
    try {
      const stats = await starService.getUserStats(ctx.from.id);
      
      const balanceMessage = `
💰 *Твой баланс и статистика:*

⭐ *Звезды:* ${stats.stars_balance}
📈 *Всего выиграно:* ${stats.total_won}
📉 *Всего потрачено:* ${stats.total_spent}
💹 *Прибыль:* ${stats.profit >= 0 ? '+' : ''}${stats.profit}

🎮 *Активность:*
🎲 Игр сыграно: ${stats.games_played}
🎁 Кейсов открыто: ${stats.cases_opened}
📊 Уровень: ${stats.level}
⚡ Опыт: ${stats.experience}
      `;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('🎁 Открыть кейс', 'cases'),
          Markup.button.callback('🚀 Играть', 'rocket')
        ],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);

      await ctx.replyWithMarkdown(balanceMessage, keyboard);
    } catch (error) {
      await ctx.reply('❌ Ошибка получения баланса. Попробуйте позже.');
    }
  });

  // Команда /help
  bot.command('help', async (ctx) => {
    const helpMessage = `
📖 *Руководство по Pixelstars Casino*

🎰 *Основные функции:*

🎁 *Кейсы* - открывай кейсы и получай:
• ⭐ Звезды (основная валюта)
• 🎨 Премиум стикеры
• 👑 Telegram Premium
• 🎊 Эксклюзивные награды

🚀 *Ракетка* - игра на умножение:
• Делай ставку звездами
• Выбирай момент для забора выигрыша
• Чем дольше ждешь - тем больше множитель
• Но ракета может взорваться в любой момент!

💫 *Звезды* - основная валюта:
• Получай за открытие кейсов
• Выигрывай в играх
• Участвуй в турнирах

🏆 *Рейтинг* - соревнуйся с другими игроками

⚡ *Советы:*
• Начинай с малых ставок
• Изучай вероятности в кейсах
• Не рискуй всем балансом сразу
• Следи за множителями в ракетке

🎮 *Удачной игры!*
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Главное меню', 'menu')]
    ]);

    await ctx.replyWithMarkdown(helpMessage, keyboard);
  });

  // Обработка callback кнопок
  bot.action('balance', async (ctx) => {
    await ctx.answerCbQuery();
    await bot.handleUpdate({
      ...ctx.update,
      message: { ...ctx.update.callback_query.message, text: '/balance' }
    });
  });

  bot.action('help', async (ctx) => {
    await ctx.answerCbQuery();
    await bot.handleUpdate({
      ...ctx.update,
      message: { ...ctx.update.callback_query.message, text: '/help' }
    });
  });

  bot.action('menu', async (ctx) => {
    await ctx.answerCbQuery();
    
    const balance = await starService.getUserBalance(ctx.from.id);
    
    const menuMessage = `
🎰 *Pixelstars Casino* ⭐

Твой баланс: *${balance} звезд*

Выбери, что хочешь делать:
    `;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.webApp('🎰 Открыть казино', 'http://localhost:3000'),
      ],
      [
        Markup.button.callback('💰 Баланс', 'balance'),
        Markup.button.callback('🎁 Кейсы', 'cases')
      ],
      [
        Markup.button.callback('🚀 Ракетка', 'rocket'),
        Markup.button.callback('📊 Статистика', 'stats')
      ],
      [
        Markup.button.callback('🏆 Топ игроков', 'leaderboard'),
        Markup.button.callback('ℹ️ Помощь', 'help')
      ]
    ]);

    await ctx.editMessageText(menuMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup
    });
  });

  bot.action('stats', async (ctx) => {
    await ctx.answerCbQuery();
    
    try {
      const stats = await starService.getUserStats(ctx.from.id);
      
      const statsMessage = `
📊 *Подробная статистика*

👤 *Профиль:*
${stats.first_name} ${stats.username ? `(@${stats.username})` : ''}

💰 *Финансы:*
⭐ Баланс: ${stats.stars_balance}
💰 Всего выиграно: ${stats.total_won}
💸 Всего потрачено: ${stats.total_spent}
📈 Чистая прибыль: ${stats.profit >= 0 ? '+' : ''}${stats.profit}

🎮 *Игровая активность:*
🎲 Игр сыграно: ${stats.games_played}
🎁 Кейсов открыто: ${stats.cases_opened}
📊 Уровень: ${stats.level}
⚡ Опыт: ${stats.experience}

📅 *Аккаунт:*
🗓 Зарегистрирован: ${new Date(stats.created_at).toLocaleDateString('ru-RU')}
🕐 Последняя активность: ${new Date(stats.last_active).toLocaleDateString('ru-RU')}
      `;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('🏆 Топ игроков', 'leaderboard'),
          Markup.button.callback('🎮 Играть', 'rocket')
        ],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);

      await ctx.editMessageText(statsMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      await ctx.editMessageText('❌ Ошибка получения статистики');
    }
  });

  bot.action('leaderboard', async (ctx) => {
    await ctx.answerCbQuery();
    
    try {
      const leaderboard = await starService.getLeaderboard(10);
      
      let leaderboardMessage = '🏆 *Топ 10 игроков:*\n\n';
      
      leaderboard.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const name = player.first_name || 'Аноним';
        const username = player.username ? ` (@${player.username})` : '';
        
        leaderboardMessage += `${medal} *${name}*${username}\n`;
        leaderboardMessage += `   ⭐ ${player.stars_balance} звезд | 💹 ${player.profit >= 0 ? '+' : ''}${player.profit}\n\n`;
      });

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('📊 Моя статистика', 'stats'),
          Markup.button.callback('🎮 Играть', 'rocket')
        ],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);

      await ctx.editMessageText(leaderboardMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      await ctx.editMessageText('❌ Ошибка получения рейтинга');
    }
  });
}