# Pixelstars Casino - Деплой

Этот проект готов для развертывания на **Vercel** и других платформах.

## ⚡ Vercel (Рекомендуется)

### 1. Быстрый деплой
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой проекта
cd /Users/maczone/pixelstars
vercel --prod
```

### 2. Настройка webhook
После деплоя выполните:
```bash
# Замените YOUR_DOMAIN на реальный домен Vercel
./setup-webhook.sh https://YOUR_DOMAIN.vercel.app
```

### 3. Настройка бота в @BotFather
1. Откройте @BotFather в Telegram
2. Отправьте команду `/setmenubutton`
3. Выберите вашего бота (@PixelStarsK_bot)
4. Добавьте кнопку меню:
   - Текст: "🎮 Играть"
   - URL: `https://YOUR_DOMAIN.vercel.app`

### 4. Переменные окружения
Vercel автоматически использует переменные из `vercel.json`:
```json
{
  "env": {
    "BOT_TOKEN": "8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE"
  }
}
```

## 🌐 Альтернативные платформы

### Render.com
1. Подключите репозиторий
2. Настройте переменные окружения:
   ```
   BOT_TOKEN=8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE
   PORT=10000
   WEBHOOK_URL=https://your-app.onrender.com/api/webhook
   ```
3. Установите команду запуска: `python api/bot.py`

### Railway.app
1. Подключите GitHub репозиторий
2. Добавьте переменную `BOT_TOKEN`
3. Railway автоматически определит Python проект

### Heroku
1. Создайте приложение
2. Добавьте buildpack Python
3. Настройте Config Vars
4. Деплойте через Git

## 📱 После деплоя

1. **Проверьте бота:** https://t.me/PixelStarsK_bot
2. **Протестируйте команды:**
   - `/start` - приветствие
   - `/help` - помощь  
   - `/games` - список игр
3. **Кнопка PixelStars** должна открывать веб-приложение
4. **Краш игра** должна работать 24/7
5. **История крашей** показывает последние 4 результата

## 🔧 Мониторинг

### Vercel
- Логи доступны в панели Vercel
- Автоматический SSL
- CDN по умолчанию
- Серверless функции

### Проверка webhook
```bash
curl https://api.telegram.org/bot8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE/getWebhookInfo
```

## 🚀 Обновления

### Автоматические
Настройте GitHub Actions или используйте автодеплой платформы:

### Ручные
```bash
git add .
git commit -m "Update features"
git push origin main

# Для Vercel
vercel --prod
```

## 🎮 Структура API

```
/api/webhook          # Telegram webhook
/api/status           # Статус бота
/api/send_message     # Отправка сообщений
/                     # Веб-приложение
```

## ✅ Готовые функции

- 🚀 **Краш игра** с автовыводом и историей
- 🤖 **Telegram бот** с inline клавиатурой  
- 🎮 **Кнопка PixelStars** открывает сайт
- ⭐ **Система звезд** и бонусов
- 📊 **Статистика** и профиль игрока
- 🎁 **Бонусы** и награды
- 📱 **Мобильная** оптимизация

---

*Проект готов к production использованию! 🌟*

## Настройка Render.com

### 1. Настройка переменных окружения в Render
В панели Render добавьте следующие переменные:
```
BOT_TOKEN=ваш_токен_бота_от_BotFather
WEBHOOK_URL=https://pixelstars1.onrender.com/webhook
WEBAPP_URL=https://pixelstars1.onrender.com
NODE_ENV=production
PORT=10000
WEBHOOK_SECRET=любая_случайная_строка_для_безопасности
```

### 2. Настройка бота в @BotFather
1. Откройте @BotFather в Telegram
2. Отправьте команду `/setmenubutton`
3. Выберите вашего бота
4. Добавьте кнопку меню:
   - Текст: "🎮 Играть"
   - URL: `https://pixelstars1.onrender.com`

### 3. Автодеплой
- Render автоматически пересобирает проект при каждом пуше в main ветку
- Команда запуска: `npm start` (уже настроена в package.json)
- Порт: 10000 (стандарт для Render)

## После деплоя

1. Откройте вашего бота в Telegram
2. Нажмите /start или кнопку "🎮 Играть"
3. Проверьте работу кейсов
4. Протестируйте систему пополнения через @puwmvshop_bot

## Мониторинг

- Логи доступны в панели Render
- Webhook автоматически настроится при первом запуске
- База данных SQLite создается автоматически

## Обновления

Для обновления просто делайте:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Render автоматически пересоберет и задеплоит!