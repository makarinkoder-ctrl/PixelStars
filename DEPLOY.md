# Pixelstars Casino - Деплой

Этот проект готов для развертывания на различных платформах.

## Быстрый деплой

### 1. Render.com (Рекомендуется)
1. Подключите GitHub репозиторий к Render
2. Выберите "Web Service"
3. Настройте переменные окружения:
   ```
   BOT_TOKEN=ваш_токен_бота
   WEBHOOK_URL=https://ваш-домен.onrender.com/webhook
   WEBAPP_URL=https://ваш-домен.onrender.com
   NODE_ENV=production
   PORT=10000
   ```
4. Команда запуска: `npm start`
5. Автодеплой готов!

### 2. Railway.app
1. Подключите GitHub к Railway
2. Создайте новый проект
3. Добавьте переменные окружения (те же что выше)
4. Railway автоматически определит Node.js проект

### 3. Heroku
1. Установите Heroku CLI
2. Выполните команды:
   ```bash
   heroku create pixelstars-casino
   heroku config:set BOT_TOKEN=ваш_токен
   heroku config:set WEBHOOK_URL=https://pixelstars-casino.herokuapp.com/webhook
   heroku config:set WEBAPP_URL=https://pixelstars-casino.herokuapp.com
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

### 4. Vercel (только для фронтенда)
1. Для фронтенда используйте Vercel
2. Для бота - отдельный сервис (Railway/Render)

## Переменные окружения

Обязательные переменные:
- `BOT_TOKEN` - токен вашего Telegram бота
- `WEBHOOK_URL` - URL для webhook (https://ваш-домен.com/webhook)
- `WEBAPP_URL` - URL веб-приложения (https://ваш-домен.com)
- `NODE_ENV=production`

## После деплоя

1. Откройте ваш бот в Telegram
2. Нажмите /start
3. Протестируйте веб-приложение
4. Проверьте систему пополнения

## Поддержка

Если нужна помощь с настройкой - обращайтесь!