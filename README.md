
# 🌟 PixelStars Casino Bot

> **Telegram Web App казино с краш игрой, кейсами и системой звезд**

[![GitHub](https://img.shields.io/badge/GitHub-makarinkoder--ctrl%2FPixelStars-blue)](https://github.com/makarinkoder-ctrl/PixelStars)
[![Bot](https://img.shields.io/badge/Telegram-@PixelStarsK_bot-blue)](https://t.me/PixelStarsK_bot)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

## 🎮 Особенности

- **🚀 Краш игра 24/7** - множители до 100x с автовыводом
- **🎯 История крашей** - показывает последние 4 результата  
- **🤖 Telegram бот** с inline клавиатурой
- **🎮 Кнопка PixelStars** - открывает веб-приложение
- **⭐ Система звезд** с бонусами и наградами
- **📱 Мобильная версия** оптимизирована для телефонов
- **🔧 Production ready** - готов к деплою на Vercel

## 🚀 Быстрый старт

### 1. Клонирование проекта
```bash
git clone https://github.com/makarinkoder-ctrl/PixelStars.git
cd PixelStars
```

### 2. Настройка переменных окружения
```bash
cp .env.example .env
# Отредактируйте .env файл и добавьте ваш BOT_TOKEN
```

### 3. Создание Telegram бота

1. **Создайте бота в @BotFather:**
   ```
   /newbot
   Название: PixelStars Casino
   Username: YourBot_bot
   ```

2. **Скопируйте токен** и добавьте в `.env`:
   ```
   BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```

3. **Настройте кнопку меню:**
   ```
   /setmenubutton
   Выберите вашего бота
   Текст: 🎮 Играть
   URL: https://your-domain.vercel.app
   ```

### 4. Локальная разработка

**Установка зависимостей:**
```bash
# Python зависимости
pip install -r requirements.txt

# Или создайте виртуальное окружение
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

**Запуск серверов:**
```bash
# Веб-сервер (в одном терминале)
cd web
python -m http.server 8200

# Бот сервер (в другом терминале)  
python bot_server.py
```

**Откройте:** http://localhost:8200

## 🌐 Production деплой

### Vercel (Рекомендуется)

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Деплойте проект:**
   ```bash
   vercel --prod
   ```

3. **Настройте webhook:**
   ```bash
   # Замените на ваш домен
   ./setup-webhook.sh https://your-domain.vercel.app
   ```

### Альтернативные платформы

<details>
<summary>🔧 Render.com</summary>

1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Команда запуска: `python api/bot.py`
</details>

<details>
<summary>🔧 Railway.app</summary>

1. Подключите репозиторий
2. Добавьте переменную `BOT_TOKEN`
3. Railway автоматически определит Python
</details>

## 🎮 Функции бота

### Команды
- `/start` - Приветствие и главное меню
- `/help` - Справка по командам
- `/games` - Список игр
- `/balance` - Проверка баланса звезд
- `/menu` - Показать кнопки

### Inline клавиатура
- **🎮 PixelStars Casino** - открывает веб-приложение
- **📊 Статистика** - показывает статистику игрока
- **🎁 Бонусы** - доступные бонусы и награды
- **ℹ️ Помощь** - справочная информация

## 🚀 Краш игра

### Механика
1. **Ставка** - выберите количество звезд
2. **Полет** - звезда летит с растущим множителем
3. **Вывод** - заберите выигрыш до краша
4. **Автовывод** - установите галочку для автоматического вывода

### Особенности
- ⏰ **24/7 работа** - игра никогда не останавливается
- 📊 **История** - последние 4 результата всегда видны
- 🎯 **Автовывод** - от 1.01x до 100.00x
- 💫 **Анимации** - плавные CSS анимации

## 🏗 Архитектура проекта

```
PixelStars/
├── 📁 api/                    # Vercel serverless functions
│   ├── bot.py                 # Основной API бота
│   └── requirements.txt       # Python зависимости
├── 📁 web/                    # Веб-приложение
│   ├── index.html             # Главная страница
│   └── src/
│       ├── main.js            # Основная логика
│       ├── games/
│       │   └── clean-crash.js # Краш игра
│       └── styles/
│           └── main.css       # Стили
├── 📁 database/               # База данных (создается автоматически)
├── ⚙️ vercel.json            # Конфигурация Vercel
├── 🔧 bot_server.py          # Локальный сервер для разработки
├── 📋 requirements.txt        # Python пакеты
├── 🔗 setup-webhook.sh       # Скрипт настройки webhook
└── 📖 .env.example           # Пример переменных окружения
```

## 🔧 API Endpoints

| Endpoint | Метод | Описание |
|----------|--------|----------|
| `/` | GET | Веб-приложение |
| `/api/webhook` | POST | Telegram webhook |
| `/api/status` | GET | Статус бота |
| `/api/send_message` | POST | Отправка сообщений |

## 🎨 Технологии

### Backend
- **Python 3.8+** - язык программирования
- **Flask** - веб-фреймворк
- **Requests** - HTTP клиент
- **SQLite** - база данных (автосоздание)

### Frontend  
- **Vanilla JavaScript** - без фреймворков
- **CSS3** - анимации и стили
- **HTML5** - семантическая разметка

### Deploy
- **Vercel** - serverless функции
- **Telegram Bot API** - интеграция бота
- **GitHub Actions** - CI/CD (опционально)

## 🤝 Содействие проекту

Мы приветствуем вклад в развитие PixelStars Casino! 

### Как внести вклад:
1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Типы вкладов:
- 🐛 **Исправление багов**
- ✨ **Новые функции**
- 📝 **Улучшение документации**
- 🎨 **Улучшение UI/UX**
- ⚡ **Оптимизация производительности**

## 📝 Лицензия

Этот проект лицензирован под [MIT License](LICENSE).

## 📞 Поддержка

- **GitHub Issues**: [Создать issue](https://github.com/makarinkoder-ctrl/PixelStars/issues)
- **Telegram**: [@PixelStarsK_bot](https://t.me/PixelStarsK_bot)
- **Email**: [Связаться с разработчиком](mailto:support@pixelstars.dev)

## 🌟 Авторы

- **Разработчик**: [@makarinkoder-ctrl](https://github.com/makarinkoder-ctrl)
- **Бот**: [@PixelStarsK_bot](https://t.me/PixelStarsK_bot)

---

<div align="center">

**Создано с ❤️ для Telegram Web Apps**

[🎮 Играть сейчас](https://t.me/PixelStarsK_bot) • [📚 Документация](./DEPLOY.md) • [🐛 Сообщить о баге](https://github.com/makarinkoder-ctrl/PixelStars/issues)

</div>

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