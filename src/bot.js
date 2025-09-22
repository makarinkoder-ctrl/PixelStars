// Production bot with webhook support
const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
require('dotenv').config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Ensure database directory exists
const dbPath = process.env.DB_PATH || './database/casino.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('📁 Created database directory:', dbDir);
}

// Database setup
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        stars_balance INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL, -- 'deposit', 'withdraw', 'case_open', 'game_win'
        amount INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (telegram_id)
    );

    CREATE TABLE IF NOT EXISTS case_openings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        case_type TEXT NOT NULL,
        case_cost INTEGER NOT NULL,
        prize_won TEXT,
        prize_value INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (telegram_id)
    );
`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'web')));

// Webhook endpoint
if (process.env.NODE_ENV === 'production') {
    app.use(bot.webhookCallback('/webhook'));
} else {
    bot.launch();
}

// Database helper functions
const getUserFromDB = (telegramId) => {
    try {
        return db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
    } catch (error) {
        console.error('Database error:', error);
        return null;
    }
};

const createOrUpdateUser = (telegramUser) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO users (telegram_id, username, first_name, last_name, stars_balance)
            VALUES (?, ?, ?, ?, 0)
            ON CONFLICT(telegram_id) DO UPDATE SET
                username = excluded.username,
                first_name = excluded.first_name,
                last_name = excluded.last_name,
                updated_at = CURRENT_TIMESTAMP
        `);
        
        stmt.run(
            telegramUser.id,
            telegramUser.username || null,
            telegramUser.first_name || null,
            telegramUser.last_name || null
        );
        
        return getUserFromDB(telegramUser.id);
    } catch (error) {
        console.error('Database error:', error);
        return null;
    }
};

const updateUserBalance = (telegramId, newBalance) => {
    try {
        const stmt = db.prepare('UPDATE users SET stars_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?');
        stmt.run(newBalance, telegramId);
        return true;
    } catch (error) {
        console.error('Database error:', error);
        return false;
    }
};

// Case data with real Telegram gifts
const casesData = [
    {
        id: 1,
        name: "Стартовый кейс",
        description: "Простые подарки для начинающих",
        cost: 50,
        image: "🎁",
        rarity: "common",
        prizes: [
            { name: "Цветы", value: 25, rarity: "common", emoji: "🌸", probability: 45 },
            { name: "Сладости", value: 35, rarity: "common", emoji: "🍬", probability: 30 },
            { name: "Кофе", value: 45, rarity: "uncommon", emoji: "☕", probability: 20 },
            { name: "Драгоценный камень", value: 100, rarity: "rare", emoji: "💎", probability: 5 }
        ]
    },
    {
        id: 2,
        name: "Премиум кейс",
        description: "Ценные подарки и эксклюзивы",
        cost: 150,
        image: "💎",
        rarity: "rare",
        prizes: [
            { name: "Букет роз", value: 75, rarity: "uncommon", emoji: "🌹", probability: 35 },
            { name: "Элитные сладости", value: 125, rarity: "uncommon", emoji: "🍫", probability: 30 },
            { name: "Эксклюзивный кофе", value: 175, rarity: "rare", emoji: "☕", probability: 20 },
            { name: "Редкий драгоценный камень", value: 300, rarity: "epic", emoji: "💎", probability: 10 },
            { name: "Платиновая звезда", value: 500, rarity: "legendary", emoji: "⭐", probability: 5 }
        ]
    },
    {
        id: 3,
        name: "VIP кейс",
        description: "Самые редкие и дорогие призы",
        cost: 300,
        image: "👑",
        rarity: "legendary",
        prizes: [
            { name: "Премиум букет", value: 200, rarity: "rare", emoji: "💐", probability: 25 },
            { name: "Люксовые сладости", value: 275, rarity: "rare", emoji: "🍰", probability: 25 },
            { name: "Коллекционный кофе", value: 350, rarity: "epic", emoji: "☕", probability: 20 },
            { name: "Эксклюзивный драгоценный камень", value: 600, rarity: "epic", emoji: "💎", probability: 15 },
            { name: "Золотая звезда", value: 1000, rarity: "legendary", emoji: "🌟", probability: 10 },
            { name: "Королевская корона", value: 2000, rarity: "mythic", emoji: "👑", probability: 5 }
        ]
    }
];

// Bot commands
bot.start(async (ctx) => {
    const user = createOrUpdateUser(ctx.from);
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🎮 Играть в казино', web_app: { url: process.env.WEBAPP_URL || 'https://your-domain.com' } }],
            [{ text: '💰 Баланс', callback_data: 'balance' }],
            [{ text: '💳 Пополнить', callback_data: 'topup' }]
        ]
    };
    
    await ctx.reply(
        `🌟 Добро пожаловать в Pixelstars Casino!\n\n` +
        `👋 Привет, ${ctx.from.first_name}!\n` +
        `💰 Ваш баланс: ${user ? user.stars_balance : 0} звезд\n\n` +
        `🎁 Открывайте кейсы, играйте в игры и выигрывайте реальные подарки Telegram!\n\n` +
        `Нажмите "Играть в казино" чтобы начать!`,
        { reply_markup: keyboard }
    );
});

bot.action('balance', async (ctx) => {
    const user = getUserFromDB(ctx.from.id);
    const balance = user ? user.stars_balance : 0;
    
    await ctx.answerCbQuery();
    await ctx.reply(`💰 Ваш текущий баланс: ${balance} звезд`);
});

bot.action('topup', async (ctx) => {
    await ctx.answerCbQuery();
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '⭐ 100 звезд - 99₽', callback_data: 'buy_100' }],
            [{ text: '⭐ 500 звезд - 449₽ (популярный)', callback_data: 'buy_500' }],
            [{ text: '⭐ 1000 звезд - 799₽', callback_data: 'buy_1000' }],
            [{ text: '⭐ 2500 звезд - 1899₽ (VIP)', callback_data: 'buy_2500' }],
            [{ text: '❌ Отмена', callback_data: 'cancel' }]
        ]
    };
    
    await ctx.reply(
        `💳 Выберите пакет звезд для пополнения:\n\n` +
        `⭐ 100 звезд - 99₽\n` +
        `⭐ 500 звезд - 449₽ (+50 бонус)\n` +
        `⭐ 1000 звезд - 799₽ (+100 бонус)\n` +
        `⭐ 2500 звезд - 1899₽ (+300 бонус)\n\n` +
        `После выбора вы получите инструкции по оплате.`,
        { reply_markup: keyboard }
    );
});

// Handle purchase actions
['buy_100', 'buy_500', 'buy_1000', 'buy_2500'].forEach(action => {
    bot.action(action, async (ctx) => {
        await ctx.answerCbQuery();
        
        const packages = {
            'buy_100': { stars: 100, price: 99 },
            'buy_500': { stars: 500, price: 449 },
            'buy_1000': { stars: 1000, price: 799 },
            'buy_2500': { stars: 2500, price: 1899 }
        };
        
        const pkg = packages[action];
        
        await ctx.reply(
            `💳 Вы выбрали: ${pkg.stars} звезд за ${pkg.price}₽\n\n` +
            `📱 Для оплаты:\n` +
            `1. Переведите ${pkg.price}₽ на карту: 1234 5678 9012 3456\n` +
            `2. Отправите скриншот перевода в этот чат\n` +
            `3. Укажите ваш ID: ${ctx.from.id}\n\n` +
            `После проверки оплаты звезды будут зачислены автоматически!`
        );
    });
});

bot.action('cancel', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('❌ Операция отменена');
});

// API Routes
app.get('/api/cases', (req, res) => {
    res.json(casesData);
});

app.get('/api/user/:telegramId', (req, res) => {
    const telegramId = parseInt(req.params.telegramId);
    const user = getUserFromDB(telegramId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        telegram_id: user.telegram_id,
        first_name: user.first_name,
        stars_balance: user.stars_balance,
        level: 1,
        experience: 0,
        total_won: 0,
        total_spent: 0,
        games_played: 0,
        cases_opened: 0
    });
});

app.post('/api/case/open', (req, res) => {
    const { telegramId, caseId } = req.body;
    
    if (!telegramId || !caseId) {
        return res.status(400).json({ error: 'Missing telegramId or caseId' });
    }
    
    const user = getUserFromDB(telegramId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const caseData = casesData.find(c => c.id === parseInt(caseId));
    if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
    }
    
    if (user.stars_balance < caseData.cost) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Select random prize based on probability
    const random = Math.random() * 100;
    let currentProbability = 0;
    let selectedPrize = caseData.prizes[0];
    
    for (const prize of caseData.prizes) {
        currentProbability += prize.probability;
        if (random <= currentProbability) {
            selectedPrize = prize;
            break;
        }
    }
    
    // Update user balance
    const newBalance = user.stars_balance - caseData.cost;
    updateUserBalance(telegramId, newBalance);
    
    // Log transaction
    try {
        const transactionStmt = db.prepare(`
            INSERT INTO transactions (user_id, type, amount, description)
            VALUES (?, ?, ?, ?)
        `);
        transactionStmt.run(telegramId, 'case_open', -caseData.cost, `Opened ${caseData.name}`);
        
        const caseStmt = db.prepare(`
            INSERT INTO case_openings (user_id, case_type, case_cost, prize_won, prize_value)
            VALUES (?, ?, ?, ?, ?)
        `);
        caseStmt.run(telegramId, caseData.name, caseData.cost, selectedPrize.name, selectedPrize.value);
    } catch (error) {
        console.error('Database error:', error);
    }
    
    res.json({
        success: true,
        prize: selectedPrize,
        newBalance: newBalance,
        caseName: caseData.name
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
    // Set webhook
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
        bot.telegram.setWebhook(webhookUrl)
            .then(() => console.log('🔗 Webhook установлен:', webhookUrl))
            .catch(err => console.error('❌ Ошибка установки webhook:', err));
    }
} else {
    console.log('🚀 Запускаем бота с polling...');
}

app.listen(PORT, () => {
    console.log(`🚀 Веб-сервер запущен на порту ${PORT}`);
    console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));