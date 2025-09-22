import database from '../config/database.js';

export class RewardService {
  static rewardTypes = {
    STARS: 'stars',
    PREMIUM: 'premium', 
    STICKER: 'sticker',
    EXCLUSIVE: 'exclusive',
    JACKPOT: 'jackpot',
    MEGA_JACKPOT: 'mega_jackpot',
    ULTIMATE: 'ultimate'
  };

  static rarities = {
    COMMON: 'common',
    UNCOMMON: 'uncommon', 
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
  };

  static async giveReward(userId, reward) {
    try {
      await database.run('BEGIN TRANSACTION');
      
      let description = `Награда: ${reward.reward_name}`;
      
      switch (reward.reward_type) {
        case this.rewardTypes.STARS:
          // Добавляем звезды на баланс
          await database.run(
            'UPDATE users SET stars_balance = stars_balance + ?, total_won = total_won + ? WHERE id = ?',
            [reward.stars_value, reward.stars_value, userId]
          );
          break;
          
        case this.rewardTypes.PREMIUM:
          // Здесь можно интегрировать с Telegram Premium API
          description += ` (${reward.reward_value} дней Premium)`;
          break;
          
        case this.rewardTypes.STICKER:
          // Здесь можно интегрировать с Telegram Sticker API
          description += ' (Премиум стикер)';
          break;
          
        case this.rewardTypes.EXCLUSIVE:
        case this.rewardTypes.JACKPOT:
        case this.rewardTypes.MEGA_JACKPOT:
        case this.rewardTypes.ULTIMATE:
          // Особые награды - добавляем звезды и записываем в историю
          if (reward.stars_value > 0) {
            await database.run(
              'UPDATE users SET stars_balance = stars_balance + ?, total_won = total_won + ? WHERE id = ?',
              [reward.stars_value, reward.stars_value, userId]
            );
          }
          break;
      }
      
      // Записываем транзакцию
      await database.run(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)',
        [userId, 'credit', reward.stars_value || 0, description]
      );
      
      // Добавляем опыт пользователю
      const experienceGain = this.calculateExperience(reward.rarity);
      await database.run(
        'UPDATE users SET experience = experience + ? WHERE id = ?',
        [experienceGain, userId]
      );
      
      await database.run('COMMIT');
      
      return {
        success: true,
        reward,
        experienceGain
      };
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  }

  static calculateExperience(rarity) {
    const experienceMap = {
      [this.rarities.COMMON]: 10,
      [this.rarities.UNCOMMON]: 25,
      [this.rarities.RARE]: 50,
      [this.rarities.EPIC]: 100,
      [this.rarities.LEGENDARY]: 250,
      [this.rarities.MYTHIC]: 500
    };
    
    return experienceMap[rarity] || 10;
  }

  static getRarityColor(rarity) {
    const colorMap = {
      [this.rarities.COMMON]: '#95a5a6',
      [this.rarities.UNCOMMON]: '#27ae60',
      [this.rarities.RARE]: '#3498db',
      [this.rarities.EPIC]: '#9b59b6',
      [this.rarities.LEGENDARY]: '#f39c12',
      [this.rarities.MYTHIC]: '#e74c3c'
    };
    
    return colorMap[rarity] || '#95a5a6';
  }

  static getRarityEmoji(rarity) {
    const emojiMap = {
      [this.rarities.COMMON]: '⭐',
      [this.rarities.UNCOMMON]: '💫',
      [this.rarities.RARE]: '💎',
      [this.rarities.EPIC]: '👑',
      [this.rarities.LEGENDARY]: '🏆',
      [this.rarities.MYTHIC]: '🌟'
    };
    
    return emojiMap[rarity] || '⭐';
  }

  static async getDailyBonus(userId) {
    // Проверяем, получал ли пользователь бонус сегодня
    const today = new Date().toISOString().split('T')[0];
    const lastBonus = await database.get(
      "SELECT * FROM transactions WHERE user_id = ? AND description LIKE 'Ежедневный бонус%' AND DATE(created_at) = ?",
      [userId, today]
    );
    
    if (lastBonus) {
      throw new Error('Ежедневный бонус уже получен сегодня');
    }
    
    // Определяем размер бонуса (базовый + случайный)
    const baseBonus = 100;
    const randomBonus = Math.floor(Math.random() * 100); // 0-99
    const totalBonus = baseBonus + randomBonus;
    
    try {
      await database.run('BEGIN TRANSACTION');
      
      // Добавляем бонус на баланс
      await database.run(
        'UPDATE users SET stars_balance = stars_balance + ? WHERE id = ?',
        [totalBonus, userId]
      );
      
      // Записываем транзакцию
      await database.run(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)',
        [userId, 'credit', totalBonus, `Ежедневный бонус: ${totalBonus} звезд`]
      );
      
      // Добавляем опыт
      await database.run(
        'UPDATE users SET experience = experience + 20 WHERE id = ?',
        [userId]
      );
      
      await database.run('COMMIT');
      
      return {
        success: true,
        amount: totalBonus,
        baseBonus,
        randomBonus
      };
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  }
}