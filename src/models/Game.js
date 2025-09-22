import database from '../config/database.js';

export class Game {
  static async recordGame(gameData) {
    const { userId, gameType, betAmount, result, payout, multiplier, gameData: data } = gameData;
    
    return await database.run(
      'INSERT INTO games (user_id, game_type, bet_amount, result, payout, multiplier, game_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, gameType, betAmount, result, payout, multiplier, JSON.stringify(data)]
    );
  }

  static async getUserGames(userId, limit = 10) {
    return await database.all(
      'SELECT * FROM games WHERE user_id = ? ORDER BY played_at DESC LIMIT ?',
      [userId, limit]
    );
  }

  static async getGameStats(userId) {
    const stats = await database.get(
      `SELECT 
        COUNT(*) as total_games,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
        SUM(bet_amount) as total_bet,
        SUM(payout) as total_payout,
        MAX(multiplier) as best_multiplier
      FROM games 
      WHERE user_id = ?`,
      [userId]
    );
    
    return {
      ...stats,
      win_rate: stats.total_games > 0 ? (stats.wins / stats.total_games * 100).toFixed(1) : 0,
      profit: stats.total_payout - stats.total_bet
    };
  }

  static async getTotalGames() {
    const result = await database.get('SELECT COUNT(*) as count FROM games');
    return result.count;
  }

  static async getTodayGames() {
    const result = await database.get(
      "SELECT COUNT(*) as count FROM games WHERE DATE(played_at) = DATE('now')"
    );
    return result.count;
  }
}