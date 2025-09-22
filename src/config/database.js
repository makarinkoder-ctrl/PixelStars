import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../database/casino.db');
    this.db = new sqlite3.Database(dbPath);
    
    // Промисифицируем методы для удобства
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
    
    this.initTables();
  }

  async initTables() {
    try {
      // Таблица пользователей
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          telegram_id TEXT UNIQUE NOT NULL,
          username TEXT,
          first_name TEXT,
          last_name TEXT,
          stars_balance INTEGER DEFAULT 1000,
          total_spent INTEGER DEFAULT 0,
          total_won INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          experience INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Таблица кейсов
      await this.run(`
        CREATE TABLE IF NOT EXISTS cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          rarity TEXT DEFAULT 'common',
          image_url TEXT,
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Таблица наград в кейсах
      await this.run(`
        CREATE TABLE IF NOT EXISTS case_rewards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER,
          reward_type TEXT NOT NULL,
          reward_value TEXT NOT NULL,
          reward_name TEXT NOT NULL,
          rarity TEXT DEFAULT 'common',
          probability REAL NOT NULL,
          stars_value INTEGER DEFAULT 0,
          FOREIGN KEY (case_id) REFERENCES cases (id)
        )
      `);

      // Таблица истории открытия кейсов
      await this.run(`
        CREATE TABLE IF NOT EXISTS case_openings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          case_id INTEGER,
          reward_id INTEGER,
          stars_spent INTEGER,
          opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (case_id) REFERENCES cases (id),
          FOREIGN KEY (reward_id) REFERENCES case_rewards (id)
        )
      `);

      // Таблица игр
      await this.run(`
        CREATE TABLE IF NOT EXISTS games (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          game_type TEXT NOT NULL,
          bet_amount INTEGER NOT NULL,
          result TEXT,
          payout INTEGER DEFAULT 0,
          multiplier REAL DEFAULT 0,
          game_data TEXT,
          played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Таблица транзакций
      await this.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          description TEXT,
          reference_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      console.log('✅ База данных инициализирована');
      await this.seedDefaultData();
    } catch (error) {
      console.error('❌ Ошибка инициализации базы данных:', error);
    }
  }

  async seedDefaultData() {
    // Проверяем, есть ли уже кейсы
    const existingCases = await this.get('SELECT COUNT(*) as count FROM cases');
    
    if (existingCases.count === 0) {
      // Добавляем базовые кейсы
      const cases = [
        {
          name: '⭐ Звездный кейс',
          description: 'Базовый кейс с небольшими наградами',
          price: 100,
          rarity: 'common'
        },
        {
          name: '💎 Алмазный кейс', 
          description: 'Редкий кейс с ценными наградами',
          price: 500,
          rarity: 'rare'
        },
        {
          name: '👑 Королевский кейс',
          description: 'Эпический кейс с эксклюзивными наградами',
          price: 1000,
          rarity: 'epic'
        }
      ];

      for (const caseData of cases) {
        const result = await this.run(
          'INSERT INTO cases (name, description, price, rarity) VALUES (?, ?, ?, ?)',
          [caseData.name, caseData.description, caseData.price, caseData.rarity]
        );

        // Добавляем награды для каждого кейса
        await this.addCaseRewards(result.lastID, caseData.rarity);
      }

      console.log('✅ Добавлены базовые кейсы');
    }
  }

  async addCaseRewards(caseId, rarity) {
    const rewards = {
      common: [
        { type: 'stars', value: '50', name: '50 звезд', rarity: 'common', probability: 0.4, stars_value: 50 },
        { type: 'stars', value: '100', name: '100 звезд', rarity: 'common', probability: 0.3, stars_value: 100 },
        { type: 'sticker', value: 'premium_sticker_1', name: 'Премиум стикер', rarity: 'uncommon', probability: 0.2, stars_value: 150 },
        { type: 'stars', value: '200', name: '200 звезд', rarity: 'rare', probability: 0.1, stars_value: 200 }
      ],
      rare: [
        { type: 'stars', value: '200', name: '200 звезд', rarity: 'common', probability: 0.3, stars_value: 200 },
        { type: 'stars', value: '500', name: '500 звезд', rarity: 'uncommon', probability: 0.25, stars_value: 500 },
        { type: 'premium', value: '7', name: '7 дней премиума', rarity: 'rare', probability: 0.25, stars_value: 700 },
        { type: 'stars', value: '1000', name: '1000 звезд', rarity: 'epic', probability: 0.15, stars_value: 1000 },
        { type: 'jackpot', value: '2000', name: 'ДЖЕКПОТ! 2000 звезд', rarity: 'legendary', probability: 0.05, stars_value: 2000 }
      ],
      epic: [
        { type: 'stars', value: '500', name: '500 звезд', rarity: 'common', probability: 0.25, stars_value: 500 },
        { type: 'premium', value: '30', name: '30 дней премиума', rarity: 'uncommon', probability: 0.25, stars_value: 1500 },
        { type: 'stars', value: '2000', name: '2000 звезд', rarity: 'rare', probability: 0.2, stars_value: 2000 },
        { type: 'exclusive', value: 'vip_access', name: 'VIP доступ', rarity: 'epic', probability: 0.15, stars_value: 3000 },
        { type: 'mega_jackpot', value: '5000', name: 'МЕГА ДЖЕКПОТ! 5000 звезд', rarity: 'legendary', probability: 0.1, stars_value: 5000 },
        { type: 'ultimate', value: '10000', name: 'УЛЬТРА ПРИЗ! 10000 звезд', rarity: 'mythic', probability: 0.05, stars_value: 10000 }
      ]
    };

    const caseRewards = rewards[rarity] || rewards.common;
    
    for (const reward of caseRewards) {
      await this.run(
        'INSERT INTO case_rewards (case_id, reward_type, reward_value, reward_name, rarity, probability, stars_value) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [caseId, reward.type, reward.value, reward.name, reward.rarity, reward.probability, reward.stars_value]
      );
    }
  }

  close() {
    this.db.close();
  }
}

export default new Database();