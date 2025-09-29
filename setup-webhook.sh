#!/bin/bash

# Скрипт для настройки webhook после деплоя на Vercel

if [ -z "$1" ]; then
    echo "❌ Использование: $0 <vercel-domain>"
    echo "Пример: $0 https://my-app.vercel.app"
    exit 1
fi

VERCEL_DOMAIN=$1
BOT_TOKEN="8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE"
WEBHOOK_URL="${VERCEL_DOMAIN}/api/webhook"

echo "🚀 Настройка webhook для Telegram бота..."
echo "📋 Домен: $VERCEL_DOMAIN"
echo "🔗 Webhook URL: $WEBHOOK_URL"

# Устанавливаем webhook
response=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    -d "url=${WEBHOOK_URL}" \
    -d "allowed_updates=[\"message\",\"callback_query\"]")

echo "📡 Ответ Telegram API:"
echo "$response" | python3 -m json.tool

# Проверяем webhook
echo ""
echo "🔍 Проверка webhook..."
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool

echo ""
echo "✅ Настройка завершена!"
echo "🎮 Теперь бот доступен по адресу: https://t.me/PixelStarsK_bot"
echo "🌐 Веб-приложение доступно по адресу: $VERCEL_DOMAIN"