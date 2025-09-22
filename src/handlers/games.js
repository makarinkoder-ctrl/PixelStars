import { Markup } from 'telegraf';

// Глобальное состояние игры
const gameState = {
  isRunning: false,
  phase: 'waiting', // waiting, betting, flying, crashed
  multiplier: 1.00,
  crashPoint: null,
  startTime: null,
  bettingEndTime: null,
  players: new Map(), // userId -> { bet, autoWithdraw }
  interval: null,
  bettingInterval: null
};

let bot;
let starService;

// Экспорт состояния игры для API
export function getGameState() {
  const now = Date.now();
  const timeLeft = gameState.phase === 'waiting' 
    ? Math.max(0, Math.ceil((gameState.bettingEndTime - now) / 1000))
    : 0;
    
  return {
    phase: gameState.phase,
    multiplier: gameState.multiplier,
    playersCount: gameState.players.size,
    timeLeft: timeLeft,
    isRunning: gameState.isRunning
  };
}

export function setupGameHandlers(botInstance, starServiceInstance) {
  bot = botInstance;
  starService = starServiceInstance;

  // Запускаем игру при старте
  startRocketGame();

  bot.action('rocket', async (ctx) => {
    await ctx.answerCbQuery();
    await showRocketInterface(ctx);
  });

  // Кастомная ставка
  bot.action('rocket_custom_bet', async (ctx) => {
    await ctx.answerCbQuery();
    
    const balance = await starService.getUserBalance(ctx.from.id);
    
    const message = `💰 Введи свою ставку\n\nМинимум: 50 звезд\nТвой баланс: ${balance} звезд\n\nНапиши число:`;
    
    await ctx.editMessageText(message, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('← Назад к ракетке', 'rocket')]
      ]).reply_markup
    });
    
    // Ждем ввод ставки
    bot.hears(/^\d+$/, async (replyCtx) => {
      if (replyCtx.from.id !== ctx.from.id) return;
      
      const betAmount = parseInt(replyCtx.message.text);
      
      if (betAmount < 50) {
        await replyCtx.reply('❌ Минимальная ставка 50 звезд');
        return;
      }
      
      const userBalance = await starService.getUserBalance(replyCtx.from.id);
      if (betAmount > userBalance) {
        await replyCtx.reply(`❌ Недостаточно звезд! У тебя: ${userBalance}`);
        return;
      }
      
      await placeBet(replyCtx, betAmount);
    });
  });

  // Быстрые ставки
  bot.action(/^rocket_bet_(\d+)$/, async (ctx) => {
    const betAmount = parseInt(ctx.match[1]);
    await ctx.answerCbQuery();
    await placeBet(ctx, betAmount);
  });

  // Автовывод
  bot.action(/^rocket_withdraw_([\d.]+)$/, async (ctx) => {
    const withdrawAt = parseFloat(ctx.match[1]);
    await ctx.answerCbQuery();
    
    const userId = ctx.from.id;
    if (gameState.players.has(userId)) {
      gameState.players.get(userId).autoWithdraw = withdrawAt;
      await ctx.editMessageText(
        `✅ Автовывод установлен на x${withdrawAt}\n\n${getGameStatus()}`,
        { reply_markup: getRocketKeyboard(userId) }
      );
    }
  });

  // Ручной вывод
  bot.action('rocket_withdraw_now', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    
    if (gameState.phase === 'flying' && gameState.players.has(userId)) {
      await withdrawPlayer(userId);
      await showRocketInterface(ctx);
    }
  });

  // Отмена ставки
  bot.action('rocket_cancel_bet', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    
    if (gameState.phase === 'waiting' && gameState.players.has(userId)) {
      gameState.players.delete(userId);
      await showRocketInterface(ctx);
    }
  });
}

async function startRocketGame() {
  if (gameState.isRunning) return;
  
  gameState.isRunning = true;
  console.log('🚀 Запуск непрерывной игры звезда...');
  
  runGameCycle();
}

async function runGameCycle() {
  try {
    // Фаза ожидания и ставок (10 секунд)
    gameState.phase = 'waiting';
    gameState.multiplier = 1.00;
    gameState.crashPoint = generateCrashPoint();
    gameState.players.clear();
    
    console.log(`⭐ Новый раунд, краш-поинт: ${gameState.crashPoint}`);
    
    // 10 секунд на ставки
    gameState.bettingEndTime = Date.now() + 10000;
    
    const bettingCountdown = setInterval(() => {
      const timeLeft = Math.max(0, Math.ceil((gameState.bettingEndTime - Date.now()) / 1000));
      if (timeLeft === 0) {
        clearInterval(bettingCountdown);
        startFlying();
      }
    }, 1000);
    
  } catch (error) {
    console.error('Ошибка в игровом цикле:', error);
    setTimeout(runGameCycle, 5000);
  }
}

async function startFlying() {
  gameState.phase = 'flying';
  gameState.startTime = Date.now();
  
  // Снимаем ставки с балансов
  for (const [userId, playerData] of gameState.players) {
    try {
      await starService.spendStars(userId, playerData.bet);
    } catch (error) {
      gameState.players.delete(userId);
    }
  }
  
  // Игра длится до краш-поинта
  gameState.interval = setInterval(async () => {
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    gameState.multiplier = 1 + elapsed * 0.1; // Растет по 0.1x в секунду
    
    // Проверяем автовывод
    for (const [userId, playerData] of gameState.players) {
      if (playerData.autoWithdraw && gameState.multiplier >= playerData.autoWithdraw) {
        await withdrawPlayer(userId);
      }
    }
    
    // Краш!
    if (gameState.multiplier >= gameState.crashPoint) {
      await crashRocket();
    }
  }, 100);
}

async function withdrawPlayer(userId) {
  const playerData = gameState.players.get(userId);
  if (!playerData || playerData.withdrawn) return;
  
  const winAmount = Math.floor(playerData.bet * gameState.multiplier);
  await starService.addStars(userId, winAmount);
  
  playerData.withdrawn = true;
  playerData.winAmount = winAmount;
  
  console.log(`✅ Игрок ${userId} вывел на x${gameState.multiplier.toFixed(2)}, выигрыш: ${winAmount}`);
}

async function crashRocket() {
  clearInterval(gameState.interval);
  gameState.phase = 'crashed';
  
  console.log(`💥 Звезда разбилась на x${gameState.multiplier.toFixed(2)}`);
  
  // Через 3 секунды новый раунд
  setTimeout(runGameCycle, 3000);
}

function generateCrashPoint() {
  // Алгоритм честного краш-поинта
  const random = Math.random();
  if (random < 0.33) return 1.00 + Math.random() * 0.5; // 1.0-1.5x (33%)
  if (random < 0.66) return 1.5 + Math.random() * 1.0; // 1.5-2.5x (33%)
  if (random < 0.90) return 2.5 + Math.random() * 2.5; // 2.5-5.0x (24%)
  return 5.0 + Math.random() * 10.0; // 5.0-15.0x (10%)
}

async function placeBet(ctx, betAmount) {
  const userId = ctx.from.id;
  
  if (gameState.phase !== 'waiting') {
    await ctx.editMessageText('❌ Ставки закрыты! Дождись следующего раунда.');
    return;
  }
  
  const balance = await starService.getUserBalance(userId);
  if (balance < betAmount) {
    await ctx.editMessageText(`❌ Недостаточно звезд! Нужно: ${betAmount}, у тебя: ${balance}`);
    return;
  }
  
  gameState.players.set(userId, {
    bet: betAmount,
    autoWithdraw: null,
    withdrawn: false,
    winAmount: 0
  });
  
  await showRocketInterface(ctx);
}

async function showRocketInterface(ctx) {
  const userId = ctx.from.id;
  const balance = await starService.getUserBalance(userId);
  const isPlayerActive = gameState.players.has(userId);
  
  const message = getGameStatus() + `\n\n💰 Баланс: ${balance} звезд`;
  
  await ctx.editMessageText(message, {
    reply_markup: getRocketKeyboard(userId)
  });
}

function getGameStatus() {
  const timeLeft = gameState.phase === 'waiting' 
    ? Math.max(0, Math.ceil((gameState.bettingEndTime - Date.now()) / 1000))
    : 0;
    
  switch (gameState.phase) {
    case 'waiting':
      return `⭐ ЗВЕЗДА\n\n⏱ Ставки: ${timeLeft}с\n👥 Игроков: ${gameState.players.size}`;
    case 'flying':
      return `⭐ ЛЕТИТ!\n\n📈 x${gameState.multiplier.toFixed(2)}\n👥 Игроков: ${gameState.players.size}`;
    case 'crashed':
      return `💥 ВЗРЫВ!\n\n💀 Разбилась на x${gameState.multiplier.toFixed(2)}\n⏳ Новый раунд через 3с...`;
    default:
      return '⭐ ЗВЕЗДА';
  }
}

function getRocketKeyboard(userId) {
  const isPlayerActive = gameState.players.has(userId);
  const playerData = gameState.players.get(userId);
  
  if (gameState.phase === 'waiting') {
    if (isPlayerActive) {
      return Markup.inlineKeyboard([
        [Markup.button.callback('❌ Отменить ставку', 'rocket_cancel_bet')],
        [
          Markup.button.callback('Автовывод x2', 'rocket_withdraw_2.0'),
          Markup.button.callback('Автовывод x3', 'rocket_withdraw_3.0')
        ],
        [
          Markup.button.callback('Автовывод x5', 'rocket_withdraw_5.0'),
          Markup.button.callback('Автовывод x10', 'rocket_withdraw_10.0')
        ],
        [Markup.button.callback('← Назад', 'menu')]
      ]);
    } else {
      return Markup.inlineKeyboard([
        [
          Markup.button.callback('50⭐', 'rocket_bet_50'),
          Markup.button.callback('100⭐', 'rocket_bet_100'),
          Markup.button.callback('500⭐', 'rocket_bet_500')
        ],
        [Markup.button.callback('💰 Своя ставка', 'rocket_custom_bet')],
        [Markup.button.callback('← Назад', 'menu')]
      ]);
    }
  } else if (gameState.phase === 'flying' && isPlayerActive && !playerData.withdrawn) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('💸 ЗАБРАТЬ СЕЙЧАС!', 'rocket_withdraw_now')],
      [Markup.button.callback('🔄 Обновить', 'rocket')]
    ]);
  } else {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Обновить', 'rocket')],
      [Markup.button.callback('← Назад', 'menu')]
    ]);
  }
}
