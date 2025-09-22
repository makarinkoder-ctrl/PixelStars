import database from '../config/database.js';

export class User {
  static async findByTelegramId(telegramId) {
    return await database.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      [telegramId.toString()]
    );
  }

  static async create(userData) {
    const { telegramId, username, firstName, lastName } = userData;
    
    const result = await database.run(
      'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
      [telegramId.toString(), username, firstName, lastName]
    );
    
    return await this.findByTelegramId(telegramId);
  }

  static async updateBalance(telegramId, newBalance) {
    return await database.run(
      'UPDATE users SET stars_balance = ? WHERE telegram_id = ?',
      [newBalance, telegramId.toString()]
    );
  }

  static async addExperience(telegramId, experience) {
    const user = await this.findByTelegramId(telegramId);
    if (!user) return false;

    const newExperience = user.experience + experience;
    let newLevel = user.level;

    // Простая формула уровней: каждые 1000 опыта = новый уровень
    if (newExperience >= user.level * 1000) {
      newLevel = Math.floor(newExperience / 1000) + 1;
    }

    return await database.run(
      'UPDATE users SET experience = ?, level = ? WHERE telegram_id = ?',
      [newExperience, newLevel, telegramId.toString()]
    );
  }

  static async getTopPlayers(limit = 10) {
    return await database.all(
      `SELECT 
        telegram_id, 
        first_name, 
        username, 
        stars_balance, 
        level,
        total_won,
        total_spent
      FROM users 
      ORDER BY stars_balance DESC 
      LIMIT ?`,
      [limit]
    );
  }
}