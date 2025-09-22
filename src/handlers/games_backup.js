import { Markup } from 'telegraf';
import database from '../config/database.js';

export function setupGameHandlers(bot, starService) {
  bot.action('rocket', async (ctx) => {
    await ctx.answerCbQuery();
    
    const balance = await starService.getUserBalance(ctx.from.id);
    
    const rocketMessage = `
🚀 *Игра "Ракетка"* 🚀

💫 Правила игры:
1. Делаешь ставку звездами
2. Ракета взлетает с множителем x1.00
3. Множитель растет: x1.05, x1.10, x1.50, x2.00...
4. Забирай выигрыш ПЕРЕД тем, как ракета взорвется!
5. Чем дольше ждешь - тем больше множитель
6. Но ракета может взорваться в любой момент!

💰 Твой баланс: *${balance} звезд*

⚡ Выбери размер ставки:
    `;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('10⭐', 'rocket_bet_10'),
        Markup.button.callback('50⭐', 'rocket_bet_50'),
        Markup.button.callback('100⭐', 'rocket_bet_100')
      ],
      [
        Markup.button.callback('250⭐', 'rocket_bet_250'),
        Markup.button.callback('500⭐', 'rocket_bet_500'),
        Markup.button.callback('1000⭐', 'rocket_bet_1000')
      ],
      [
        Markup.button.callback('🎯 Своя ставка', 'rocket_custom_bet'),
        Markup.button.callback('📊 История игр', 'rocket_history')
      ],
      [Markup.button.callback('🔙 Главное меню', 'menu')]
    ]);

    await ctx.editMessageText(rocketMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup
    });
  });

  // Обработка ставок
  bot.action(/^rocket_bet_(\d+)$/, async (ctx) => {
    const betAmount = parseInt(ctx.match[1]);
    await ctx.answerCbQuery();
    
    const balance = await starService.getUserBalance(ctx.from.id);
    
    if (balance < betAmount) {
      const errorMessage = `
❌ *Недостаточно звезд для ставки!*

Ставка: *${betAmount} звезд*
Твой баланс: *${balance} звезд*
Не хватает: *${betAmount - balance} звезд*
      `;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💰 Другие ставки', 'rocket')],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);
      
      await ctx.editMessageText(errorMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      return;
    }

    // Начинаем игру
    await startRocketGame(ctx, betAmount, starService);
  });

  bot.action('rocket_custom_bet', async (ctx) => {
    await ctx.answerCbQuery();
    
    const balance = await starService.getUserBalance(ctx.from.id);
    
    const customBetMessage = `
💰 *Введите размер ставки*

Доступно: *${balance} звезд*
Минимальная ставка: *10 звезд*
Максимальная ставка: *${Math.min(balance, 5000)} звезд*

Напишите число от 10 до ${Math.min(balance, 5000)}:
    `;

    await ctx.editMessageText(customBetMessage, { parse_mode: 'Markdown' });
    
    // Устанавливаем ожидание ввода ставки
    ctx.session = { waitingForBet: true, maxBet: Math.min(balance, 5000) };
  });

  // Обработка текстовых сообщений для ставки
  bot.on('text', async (ctx) => {
    if (ctx.session && ctx.session.waitingForBet) {
      const betAmount = parseInt(ctx.message.text);
      
      if (isNaN(betAmount) || betAmount < 10 || betAmount > ctx.session.maxBet) {
        await ctx.reply(`❌ Неверная ставка. Введите число от 10 до ${ctx.session.maxBet}`);
        return;
      }
      
      delete ctx.session.waitingForBet;
      await startRocketGame(ctx, betAmount, starService);
    }
  });

  bot.action('rocket_history', async (ctx) => {
    await ctx.answerCbQuery();
    
    try {
      const userId = ctx.user.id;
      const games = await database.all(
        `SELECT * FROM games 
         WHERE user_id = ? AND game_type = 'rocket' 
         ORDER BY played_at DESC 
         LIMIT 10`,
        [userId]
      );
      
      let historyMessage = '📊 *Последние 10 игр в Ракетку:*\n\n';
      
      if (games.length === 0) {
        historyMessage += 'Пока нет сыгранных игр.\n\n🚀 Сыграй первую партию!';
      } else {
        games.forEach((game, index) => {
          const date = new Date(game.played_at).toLocaleDateString('ru-RU');
          const time = new Date(game.played_at).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          const result = game.result === 'win' ? '✅' : '❌';
          const multiplier = game.multiplier > 0 ? `x${game.multiplier.toFixed(2)}` : 'Краш';
          
          historyMessage += `${index + 1}. ${result} ${date} ${time}\n`;
          historyMessage += `   💰 Ставка: ${game.bet_amount}⭐ | 🚀 ${multiplier}`;
          
          if (game.result === 'win') {
            historyMessage += ` | 🏆 +${game.payout - game.bet_amount}⭐`;
          } else {
            historyMessage += ` | 💸 -${game.bet_amount}⭐`;
          }
          
          historyMessage += '\n\n';
        });
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Играть', 'rocket')],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);

      await ctx.editMessageText(historyMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      await ctx.editMessageText('❌ Ошибка загрузки истории игр');
    }
  });
}

async function startRocketGame(ctx, betAmount, starService) {
  // Создаем игровое сообщение
  let gameMessage = `
🚀 *ИГРА НАЧАЛАСЬ!* 🚀

💰 Ставка: *${betAmount} звезд*
🚀 Множитель: *x1.00*
💎 Потенциальный выигрыш: *${betAmount} звезд*

⏰ Ракета взлетает...
  `;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('💰 ЗАБРАТЬ (x1.00)', `cashout_${betAmount}_1.00`)]
  ]);

  await ctx.editMessageText(gameMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard.reply_markup
  });

  // Генерируем точку краха
  const crashPoint = starService.generateCrashPoint();
  
  // Симуляция полета ракеты
  const multipliers = generateMultiplierSequence(crashPoint);
  
  for (let i = 0; i < multipliers.length; i++) {
    const multiplier = multipliers[i];
    
    // Проверяем, не взорвалась ли ракета
    if (multiplier >= crashPoint) {
      // КРАШ!
      const crashMessage = `
💥 *РАКЕТА ВЗОРВАЛАСЬ!* 💥

🚀 Множитель краха: *x${crashPoint.toFixed(2)}*
💸 Проиграно: *${betAmount} звезд*

😢 В следующий раз повезет больше!
      `;

      // Записываем проигрыш
      try {
        await starService.playRocketGame(ctx.from.id, betAmount, crashPoint + 0.01);
      } catch (error) {
        console.error('Ошибка записи игры:', error);
      }

      const newBalance = await starService.getUserBalance(ctx.from.id);
      const finalMessage = crashMessage + `\n💰 Баланс: *${newBalance} звезд*`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Играть снова', 'rocket')],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);

      await ctx.editMessageText(finalMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      return;
    }

    // Обновляем игровое сообщение
    const potential = Math.floor(betAmount * multiplier);
    gameMessage = `
🚀 *РАКЕТА ЛЕТИТ!* 🚀

💰 Ставка: *${betAmount} звезд*
🚀 Множитель: *x${multiplier.toFixed(2)}*
💎 Потенциальный выигрыш: *${potential} звезд*

${getAltitudeEmoji(multiplier)} Высота: ${getAltitudeText(multiplier)}
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(`💰 ЗАБРАТЬ (x${multiplier.toFixed(2)})`, `cashout_${betAmount}_${multiplier.toFixed(2)}`)]
    ]);

    try {
      await ctx.editMessageText(gameMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      // Игнорируем ошибки редактирования сообщений
    }

    // Задержка между обновлениями
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Обработка кнопки "ЗАБРАТЬ" - вынесено за пределы функции startRocketGame
async function handleCashout(ctx, betAmount, multiplier, starService) {
  const betAmount = parseInt(ctx.match[1]);
  const multiplier = parseFloat(ctx.match[2]);
  
  await ctx.answerCbQuery('💰 Выигрыш забран!');
  
  try {
    const result = await starService.playRocketGame(ctx.from.id, betAmount, multiplier);
    
    const winAmount = Math.floor(betAmount * multiplier);
    const profit = winAmount - betAmount;
    
    const winMessage = `
🎊 *ВЫИГРЫШ ЗАБРАН!* 🎊

💰 Ставка: *${betAmount} звезд*
🚀 Множитель: *x${multiplier.toFixed(2)}*
🏆 Выигрыш: *${winAmount} звезд*
💚 Прибыль: *+${profit} звезд*

💰 Новый баланс: *${result.newBalance} звезд*

🎮 Отличная игра!
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🚀 Играть снова', 'rocket')],
      [Markup.button.callback('📊 Статистика', 'stats')],
      [Markup.button.callback('🔙 Главное меню', 'menu')]
    ]);

    await ctx.editMessageText(winMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup
    });
  } catch (error) {
    await ctx.editMessageText(`❌ Ошибка обработки выигрыша: ${error.message}`);
  }
});

function generateMultiplierSequence(crashPoint) {
  const sequence = [];
  let current = 1.00;
  
  while (current < crashPoint) {
    sequence.push(current);
    
    if (current < 1.10) {
      current += 0.01;
    } else if (current < 2.00) {
      current += 0.05;
    } else if (current < 5.00) {
      current += 0.10;
    } else {
      current += 0.25;
    }
    
    // Округляем до 2 знаков после запятой
    current = Math.round(current * 100) / 100;
  }
  
  return sequence;
}

function getAltitudeEmoji(multiplier) {
  if (multiplier < 1.5) return '🌱';
  if (multiplier < 2.0) return '🌿';
  if (multiplier < 3.0) return '🌳';
  if (multiplier < 5.0) return '🏔️';
  if (multiplier < 10.0) return '🚁';
  if (multiplier < 20.0) return '✈️';
  return '🚀';
}

function getAltitudeText(multiplier) {
  if (multiplier < 1.5) return 'Взлет';
  if (multiplier < 2.0) return 'Низкая высота';
  if (multiplier < 3.0) return 'Средняя высота';
  if (multiplier < 5.0) return 'Высокая высота';
  if (multiplier < 10.0) return 'Стратосфера';
  if (multiplier < 20.0) return 'Космос';
  return 'Далекий космос';
}