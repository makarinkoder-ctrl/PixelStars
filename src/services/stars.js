import database from '../config/database.js';

export class StarService {
  async getUserBalance(telegramId) {
    const user = await database.get(
      'SELECT stars_balance FROM users WHERE telegram_id = ?',
      [telegramId.toString()]
    );
    return user ? user.stars_balance : 0;
  }

  async addStars(telegramId, amount, description = 'Пополнение баланса') {
    try {
      await database.run('BEGIN TRANSACTION');
      
      // Обновляем баланс пользователя
      await database.run(
        'UPDATE users SET stars_balance = stars_balance + ? WHERE telegram_id = ?',
        [amount, telegramId.toString()]
      );
      
      // Записываем транзакцию
      await database.run(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ((SELECT id FROM users WHERE telegram_id = ?), ?, ?, ?)',
        [telegramId.toString(), 'credit', amount, description]
      );
      
      await database.run('COMMIT');
      return true;
    } catch (error) {
      await database.run('ROLLBACK');
      console.error('Ошибка добавления звезд:', error);
      return false;
    }
  }

  async spendStars(telegramId, amount, description = 'Трата звезд') {
    try {
      const balance = await this.getUserBalance(telegramId);
      
      if (balance < amount) {
        throw new Error('Недостаточно звезд на балансе');
      }
      
      await database.run('BEGIN TRANSACTION');
      
      // Списываем звезды
      await database.run(
        'UPDATE users SET stars_balance = stars_balance - ?, total_spent = total_spent + ? WHERE telegram_id = ?',
        [amount, amount, telegramId.toString()]
      );
      
      // Записываем транзакцию
      await database.run(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ((SELECT id FROM users WHERE telegram_id = ?), ?, ?, ?)',
        [telegramId.toString(), 'debit', amount, description]
      );
      
      await database.run('COMMIT');
      return true;
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  }

  async openCase(telegramId, caseId) {
    try {
      // Получаем информацию о кейсе
      const caseInfo = await database.get(
        'SELECT * FROM cases WHERE id = ? AND active = 1',
        [caseId]
      );
      
      if (!caseInfo) {
        throw new Error('Кейс не найден или неактивен');
      }
      
      // Проверяем баланс
      const balance = await this.getUserBalance(telegramId);
      if (balance < caseInfo.price) {
        throw new Error('Недостаточно звезд для открытия кейса');
      }
      
      // Получаем все награды кейса
      const rewards = await database.all(
        'SELECT * FROM case_rewards WHERE case_id = ?',
        [caseId]
      );
      
      if (rewards.length === 0) {
        throw new Error('В кейсе нет наград');
      }
      
      // Выбираем случайную награду на основе вероятности
      const selectedReward = this.selectRandomReward(rewards);
      
      await database.run('BEGIN TRANSACTION');
      
      // Списываем стоимость кейса
      await this.spendStars(telegramId, caseInfo.price, `Открытие кейса: ${caseInfo.name}`);
      
      // Добавляем выигранные звезды (если награда - звезды)
      if (selectedReward.reward_type === 'stars') {
        await this.addStars(telegramId, selectedReward.stars_value, `Награда из кейса: ${selectedReward.reward_name}`);
      }
      
      // Записываем историю открытия
      await database.run(
        'INSERT INTO case_openings (user_id, case_id, reward_id, stars_spent) VALUES ((SELECT id FROM users WHERE telegram_id = ?), ?, ?, ?)',
        [telegramId.toString(), caseId, selectedReward.id, caseInfo.price]
      );
      
      // Обновляем статистику пользователя
      if (selectedReward.stars_value > 0) {
        await database.run(
          'UPDATE users SET total_won = total_won + ? WHERE telegram_id = ?',
          [selectedReward.stars_value, telegramId.toString()]
        );
      }
      
      await database.run('COMMIT');
      
      return {
        success: true,
        case: caseInfo,
        reward: selectedReward,
        newBalance: await this.getUserBalance(telegramId)
      };
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  }

  selectRandomReward(rewards) {
    // Нормализуем вероятности
    const totalProbability = rewards.reduce((sum, reward) => sum + reward.probability, 0);
    const random = Math.random() * totalProbability;
    
    let cumulative = 0;
    for (const reward of rewards) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return reward;
      }
    }
    
    // Fallback на последнюю награду
    return rewards[rewards.length - 1];
  }

  async playRocketGame(telegramId, betAmount, crashPoint) {
    try {
      const balance = await this.getUserBalance(telegramId);
      
      if (balance < betAmount) {
        throw new Error('Недостаточно звезд для ставки');
      }
      
      // Генерируем случайную точку краха (1.0 - 50.0)
      const serverCrashPoint = this.generateCrashPoint();
      
      await database.run('BEGIN TRANSACTION');
      
      let payout = 0;
      let multiplier = 0;
      let result = 'loss';
      
      if (crashPoint <= serverCrashPoint) {
        // Игрок выиграл
        multiplier = crashPoint;
        payout = Math.floor(betAmount * multiplier);
        result = 'win';
        
        await this.addStars(telegramId, payout - betAmount, `Выигрыш в Ракетке (x${multiplier.toFixed(2)})`);
      } else {
        // Игрок проиграл
        await this.spendStars(telegramId, betAmount, 'Ставка в игре Ракетка');
      }
      
      // Записываем игру
      await database.run(
        'INSERT INTO games (user_id, game_type, bet_amount, result, payout, multiplier, game_data) VALUES ((SELECT id FROM users WHERE telegram_id = ?), ?, ?, ?, ?, ?, ?)',
        [
          telegramId.toString(),
          'rocket',
          betAmount,
          result,
          payout,
          multiplier,
          JSON.stringify({ serverCrashPoint, playerCrashPoint: crashPoint })
        ]
      );
      
      await database.run('COMMIT');
      
      return {
        success: true,
        result,
        betAmount,
        payout,
        multiplier,
        serverCrashPoint,
        playerCrashPoint: crashPoint,
        newBalance: await this.getUserBalance(telegramId)
      };
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  }

  generateCrashPoint() {
    // Используем формулу для генерации краш-поинта с экспоненциальным распределением
    // Это обеспечивает реалистичные вероятности для игры ракетка
    const random = Math.random();
    const houseEdge = 0.04; // 4% преимущество казино
    
    if (random < 0.01) return 1.0; // 1% шанс мгновенного краха
    
    // Используем обратную экспоненциальную функцию
    const result = 1 / (1 - random * (1 - houseEdge));
    
    // Ограничиваем максимальный множитель
    return Math.min(result, 100);
  }

  async getUserStats(telegramId) {
    const user = await database.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      [telegramId.toString()]
    );
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    const gamesPlayed = await database.get(
      'SELECT COUNT(*) as count FROM games WHERE user_id = ?',
      [user.id]
    );
    
    const casesOpened = await database.get(
      'SELECT COUNT(*) as count FROM case_openings WHERE user_id = ?',
      [user.id]
    );
    
    return {
      ...user,
      games_played: gamesPlayed.count,
      cases_opened: casesOpened.count,
      profit: user.total_won - user.total_spent
    };
  }

  async getLeaderboard(limit = 10) {
    return await database.all(
      `SELECT 
        telegram_id, 
        first_name, 
        username, 
        stars_balance, 
        total_won, 
        total_spent,
        (total_won - total_spent) as profit
      FROM users 
      ORDER BY stars_balance DESC 
      LIMIT ?`,
      [limit]
    );
  }
}