# Pixelstars Casino Bot 🎰⭐

Современное казино в Telegram с валютой Stars, кейсами и мини-играми.

## Возможности

- 💫 **Система Stars** - внутренняя валюта как в Telegram
- 🎁 **Кейсы с подарками** - стикеры, премиум и другие награды из Telegram
- 🚀 **Игра "Ракетка"** - захватывающая игра в стиле Telegram Stars
- 🎨 **Стильный дизайн** - современный UI с градиентами и анимациями
- 📱 **Web App интеграция** - полноценное веб-приложение в Telegram

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