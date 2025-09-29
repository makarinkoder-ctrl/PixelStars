
# 🌟 Pixelstars Casino

Telegram Web App казино с кейсами, играми и реальными подарками!

## 🎮 Особенности

- **🎁 Система кейсов** с реальными подарками Telegram
- **💰 Звездная валюта** с нулевым балансом по умолчанию  
- **🎯 Gifts Battle рулетка** с плавной анимацией
- **💳 Система пополнения** через @puwmvshop_bot
- **📱 Мобильная оптимизация** для Telegram Web App
- **🔒 Безопасность** с webhook и производственной готовностью

## 🚀 Быстрый запуск

### Разработка
```bash
git clone https://github.com/makarchik13424/pixelstars-casino.git
cd pixelstars-casino
npm install
cp .env.example .env
# Настройте .env файл
npm run dev
```

### Production
```bash
npm start
```

## 🛠 Технологии

- **Backend**: Node.js, Express, Telegraf
- **Database**: SQLite с better-sqlite3
- **Frontend**: Vanilla JS, CSS3, HTML5
- **Deploy**: Ready for Render, Railway, Heroku

## 📦 Структура проекта

```
pixelstars-casino/
├── src/
│   ├── bot-working.js      # Разработка (polling)
│   └── bot-production.js   # Production (webhook)
├── web/
│   ├── src/
│   │   ├── main.js         # Основное приложение
│   │   ├── scripts/        # Игровые модули
│   │   └── styles/         # CSS стили
│   └── index.html          # Главная страница
├── database/               # SQLite база данных
├── package.json
├── .env.example
└── DEPLOY.md              # Инструкции по деплою
```

## 🎁 Кейсы и призы

### Стартовый кейс (50⭐)
- 🌸 Цветы (25⭐) - 45%
- 🍬 Сладости (35⭐) - 30%  
- ☕ Кофе (45⭐) - 20%
- 💎 Драгоценный камень (100⭐) - 5%

### Премиум кейс (150⭐)
- 🌹 Букет роз (75⭐) - 35%
- 🍫 Элитные сладости (125⭐) - 30%
- ☕ Эксклюзивный кофе (175⭐) - 20%
- 💎 Редкий камень (300⭐) - 10%
- ⭐ Платиновая звезда (500⭐) - 5%

### VIP кейс (300⭐)  
- � Премиум букет (200⭐) - 25%
- 🍰 Люксовые сладости (275⭐) - 25%
- ☕ Коллекционный кофе (350⭐) - 20%
- 💎 Эксклюзивный камень (600⭐) - 15%
- 🌟 Золотая звезда (1000⭐) - 10%
- 👑 Королевская корона (2000⭐) - 5%

## 💳 Пополнение баланса

Через @puwmvshop_bot:
- ⭐ 100 звезд - 99₽
- ⭐ 500 звезд - 449₽ (популярный)
- ⭐ 1000 звезд - 799₽  
- ⭐ 2500 звезд - 1899₽ (VIP)

## 🔧 API Endpoints

- `GET /api/cases` - Список кейсов
- `GET /api/user/:telegramId` - Данные пользователя
- `POST /api/case/open` - Открытие кейса
- `POST /webhook` - Telegram webhook

## 🚀 Деплой на Vercel

### Быстрый деплой

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Деплой проекта:**
   ```bash
   vercel --prod
   ```

3. **Настройка webhook:**
   ```bash
   # После деплоя запустите:
   ./setup-webhook.sh https://your-domain.vercel.app
   ```

### Альтернативные платформы
- ✅ Vercel (рекомендуется)
- ✅ Render.com  
- ✅ Railway.app  
- ✅ Heroku
- ✅ VPS с Python/Node.js

Подробные инструкции в [DEPLOY.md](DEPLOY.md)

## 📱 Telegram Bot

1. Создайте бота через @BotFather
2. Получите токен
3. Настройте webhook для production
4. Добавьте Web App в меню бота

## 🔒 Безопасность

- Webhook с секретным ключом
- Валидация входных данных  
- SQLite с WAL режимом
- Обработка ошибок
- Graceful shutdown

## 📄 Лицензия

MIT License

## 🤝 Поддержка

Для вопросов и поддержки обращайтесь к разработчику.

---

*Создано для Telegram Web Apps с ❤️*

## Структура проекта

```
pixelstars/
├── src/
│   ├── bot.js              # Основной файл бота
│   ├── config/
│   │   └── database.js     # Настройки базы данных
│   ├── models/
│   │   ├── User.js         # Модель пользователя
│   │   ├── Case.js         # Модель кейса
│   │   └── Game.js         # Модель игры
│   ├── handlers/
│   │   ├── commands.js     # Обработчики команд
│   │   ├── cases.js        # Логика кейсов
│   │   └── games.js        # Логика игр
│   └── services/
│       ├── stars.js        # Сервис работы со звездами
│       └── rewards.js      # Сервис наград
├── web/
│   ├── index.html          # Главная страница веб-приложения
│   ├── src/
│   │   ├── main.js         # Точка входа
│   │   ├── components/     # React компоненты
│   │   ├── games/          # Игровые компоненты
│   │   └── styles/         # Стили
│   └── public/
│       └── assets/         # Статические ресурсы
└── database/
    └── casino.db           # SQLite база данных
```

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env` с настройками:
   ```
   BOT_TOKEN=your_telegram_bot_token
   WEBAPP_URL=your_webapp_url
   PORT=3000
   ```

4. Запустите проект:
   ```bash
   npm run dev
   ```

## Использование

- `/start` - Начать работу с ботом
- `/balance` - Проверить баланс звезд
- `/cases` - Открыть кейсы
- `/games` - Играть в игры
- `/top` - Таблица лидеров

## Технологии

- **Backend**: Node.js, Telegraf, Express, SQLite
- **Frontend**: Vite, Vanilla JS/React, CSS3
- **Telegram**: Bot API, Web Apps, Stars API

---

Создано с ❤️ для Telegram