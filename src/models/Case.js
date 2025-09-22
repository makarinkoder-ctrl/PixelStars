import database from '../config/database.js';

export class Case {
  static async findAll() {
    return await database.all(
      'SELECT * FROM cases WHERE active = 1 ORDER BY price ASC'
    );
  }

  static async findById(id) {
    return await database.get(
      'SELECT * FROM cases WHERE id = ? AND active = 1',
      [id]
    );
  }

  static async getRewards(caseId) {
    return await database.all(
      'SELECT * FROM case_rewards WHERE case_id = ?',
      [caseId]
    );
  }

  static async recordOpening(userId, caseId, rewardId, starsSpent) {
    return await database.run(
      'INSERT INTO case_openings (user_id, case_id, reward_id, stars_spent) VALUES (?, ?, ?, ?)',
      [userId, caseId, rewardId, starsSpent]
    );
  }

  static async getUserOpenings(userId, limit = 10) {
    return await database.all(
      `SELECT 
        co.*, 
        c.name as case_name, 
        cr.reward_name, 
        cr.reward_type,
        cr.stars_value
      FROM case_openings co
      JOIN cases c ON co.case_id = c.id
      JOIN case_rewards cr ON co.reward_id = cr.id
      WHERE co.user_id = ?
      ORDER BY co.opened_at DESC
      LIMIT ?`,
      [userId, limit]
    );
  }

  static async getTotalOpenings() {
    const result = await database.get('SELECT COUNT(*) as count FROM case_openings');
    return result.count;
  }
}