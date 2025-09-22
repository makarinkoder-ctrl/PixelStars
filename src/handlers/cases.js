import { Markup } from 'telegraf';
import database from '../config/database.js';

export function setupCaseHandlers(bot, starService) {
  bot.action('cases', async (ctx) => {
    await ctx.answerCbQuery();
    
    try {
      const cases = await database.all(
        'SELECT * FROM cases WHERE active = 1 ORDER BY price ASC'
      );
      
      const balance = await starService.getUserBalance(ctx.from.id);
      
      let casesMessage = `🎁 *Доступные кейсы:*\n\n💰 Твой баланс: *${balance} звезд*\n\n`;
      
      cases.forEach(caseItem => {
        const rarityEmoji = getRarityEmoji(caseItem.rarity);
        casesMessage += `${rarityEmoji} *${caseItem.name}*\n`;
        casesMessage += `💰 Цена: ${caseItem.price} звезд\n`;
        casesMessage += `📝 ${caseItem.description}\n\n`;
      });

      const keyboard = Markup.inlineKeyboard([
        ...cases.map(caseItem => [
          Markup.button.callback(
            `${getRarityEmoji(caseItem.rarity)} ${caseItem.name} (${caseItem.price}⭐)`,
            `open_case_${caseItem.id}`
          )
        ]),
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);

      await ctx.editMessageText(casesMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      await ctx.editMessageText('❌ Ошибка загрузки кейсов');
    }
  });

  // Обработка открытия кейсов
  bot.action(/^open_case_(\d+)$/, async (ctx) => {
    const caseId = ctx.match[1];
    await ctx.answerCbQuery();
    
    try {
      const caseInfo = await database.get(
        'SELECT * FROM cases WHERE id = ? AND active = 1',
        [caseId]
      );
      
      if (!caseInfo) {
        await ctx.editMessageText('❌ Кейс не найден');
        return;
      }
      
      const balance = await starService.getUserBalance(ctx.from.id);
      
      if (balance < caseInfo.price) {
        const errorMessage = `
❌ *Недостаточно звезд!*

Для открытия кейса "${caseInfo.name}" нужно: *${caseInfo.price} звезд*
Твой баланс: *${balance} звезд*
Не хватает: *${caseInfo.price - balance} звезд*
        `;
        
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('🎁 Другие кейсы', 'cases')],
          [Markup.button.callback('🔙 Главное меню', 'menu')]
        ]);
        
        await ctx.editMessageText(errorMessage, {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        });
        return;
      }

      // Показываем подтверждение
      const confirmMessage = `
🎁 *Открытие кейса*

${getRarityEmoji(caseInfo.rarity)} *${caseInfo.name}*
💰 Цена: *${caseInfo.price} звезд*
📝 ${caseInfo.description}

💳 Твой баланс: *${balance} звезд*
💸 Останется: *${balance - caseInfo.price} звезд*

❓ Открыть этот кейс?
      `;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Да, открыть!', `confirm_open_${caseId}`),
          Markup.button.callback('❌ Отмена', 'cases')
        ]
      ]);

      await ctx.editMessageText(confirmMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } catch (error) {
      await ctx.editMessageText('❌ Ошибка обработки кейса');
    }
  });

  // Подтверждение открытия кейса
  bot.action(/^confirm_open_(\d+)$/, async (ctx) => {
    const caseId = ctx.match[1];
    await ctx.answerCbQuery();
    
    // Показываем анимацию открытия
    const openingMessage = `
🎁✨ *Открываем кейс...* ✨🎁

🔄 Крутим барабан...
⏳ Определяем награду...
🎊 Почти готово...
    `;
    
    await ctx.editMessageText(openingMessage, { parse_mode: 'Markdown' });
    
    // Имитируем задержку для создания эффекта ожидания
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const result = await starService.openCase(ctx.from.id, caseId);
      
      if (result.success) {
        const reward = result.reward;
        const rarityEmoji = getRarityEmoji(reward.rarity);
        
        let resultMessage = `
🎊 *ПОЗДРАВЛЯЕМ!* 🎊

Ты открыл: *${result.case.name}*
        
${rarityEmoji} *ТВОЯ НАГРАДА:*
🎁 ${reward.reward_name}
        `;
        
        if (reward.reward_type === 'stars') {
          resultMessage += `\n⭐ +${reward.stars_value} звезд добавлено на баланс!`;
        } else if (reward.reward_type === 'premium') {
          resultMessage += `\n👑 ${reward.reward_value} дней Telegram Premium!`;
        } else if (reward.reward_type === 'sticker') {
          resultMessage += `\n🎨 Эксклюзивный премиум стикер!`;
        } else if (reward.reward_type === 'jackpot') {
          resultMessage += `\n🎰 ДЖЕКПОТ! +${reward.stars_value} звезд!`;
        } else if (reward.reward_type === 'mega_jackpot') {
          resultMessage += `\n💎 МЕГА ДЖЕКПОТ! +${reward.stars_value} звезд!`;
        } else if (reward.reward_type === 'ultimate') {
          resultMessage += `\n🌟 УЛЬТРА ПРИЗ! +${reward.stars_value} звезд!`;
        }
        
        resultMessage += `\n\n💰 Новый баланс: *${result.newBalance} звезд*`;
        
        // Добавляем дополнительные эффекты для редких наград
        if (reward.rarity === 'legendary' || reward.rarity === 'mythic') {
          resultMessage = `🌟✨🎊 ${resultMessage} 🎊✨🌟`;
        }
        
        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback('🎁 Открыть еще', 'cases'),
            Markup.button.callback('🚀 Играть', 'rocket')
          ],
          [Markup.button.callback('📊 Статистика', 'stats')],
          [Markup.button.callback('🔙 Главное меню', 'menu')]
        ]);

        await ctx.editMessageText(resultMessage, {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        });
      }
    } catch (error) {
      const errorMessage = `
❌ *Ошибка открытия кейса*

${error.message}

Попробуйте еще раз или выберите другой кейс.
      `;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Выбрать кейс', 'cases')],
        [Markup.button.callback('🔙 Главное меню', 'menu')]
      ]);
      
      await ctx.editMessageText(errorMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    }
  });
}

function getRarityEmoji(rarity) {
  const rarityEmojis = {
    'common': '⭐',
    'uncommon': '💫',
    'rare': '💎',
    'epic': '👑',
    'legendary': '🏆',
    'mythic': '🌟'
  };
  
  return rarityEmojis[rarity] || '⭐';
}