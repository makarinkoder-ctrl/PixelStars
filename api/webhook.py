import json
import requests
import os
from urllib.parse import parse_qs

# Конфигурация бота
BOT_TOKEN = os.environ.get('BOT_TOKEN', '8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE')
BOT_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def send_message(chat_id, text, parse_mode='HTML', reply_markup=None):
    """Отправка сообщения пользователю"""
    url = f"{BOT_API_URL}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    if reply_markup:
        data['reply_markup'] = reply_markup
    
    try:
        response = requests.post(url, json=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Ошибка отправки сообщения: {e}")
        return None

def create_main_keyboard(base_url):
    """Создание главной клавиатуры с кнопкой PixelStars"""
    keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "🎮 PixelStars Casino",
                    "url": base_url
                }
            ],
            [
                {
                    "text": "📊 Статистика",
                    "callback_data": "stats"
                },
                {
                    "text": "🎁 Бонусы",
                    "callback_data": "bonuses"
                }
            ],
            [
                {
                    "text": "ℹ️ Помощь",
                    "callback_data": "help"
                }
            ]
        ]
    }
    return keyboard

def process_message(message, base_url):
    """Обработка входящего сообщения"""
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user = message.get('from', {})
    
    first_name = user.get('first_name', 'Игрок')
    
    print(f"📨 Сообщение от {first_name}: {text}")
    
    # Обработка команд
    if text == '/start':
        welcome_message = f"""🎮 <b>Добро пожаловать в Pixelstars Casino!</b>

👋 Привет, {first_name}!

🎰 <b>Доступные игры:</b>
• 🚀 Crash - множители до 100x
• 🎁 Кейсы с призами
• ⭐ Система звезд

🎯 <b>Как играть:</b>
1. Нажми кнопку "🎮 PixelStars Casino"
2. Получи бонусные звезды
3. Играй и выигрывай!

💎 <b>Бонус для новичков:</b>
1000 ⭐ при первом входе!"""
        
        keyboard = create_main_keyboard(base_url)
        send_message(chat_id, welcome_message, reply_markup=keyboard)
        
    elif text == '/help':
        help_message = """📋 <b>Помощь по Pixelstars Casino</b>

🎮 <b>Команды бота:</b>
/start - Запуск бота
/menu - Показать кнопки
/help - Эта справка
/balance - Проверить баланс
/games - Список игр

🚀 <b>Crash Game:</b>
• Делай ставку
• Забирай на нужном множителе
• Не дай звезде упасть!

🎁 <b>Кейсы:</b>
• Открывай кейсы за звезды
• Получай редкие призы
• Собирай коллекцию"""
        
        send_message(chat_id, help_message)
        
    elif text == '/balance':
        balance_message = f"""💰 <b>Ваш баланс</b>

👤 Игрок: {first_name}
⭐ Звезды: 1000 (стартовый бонус)
🎮 Игр сыграно: 0
💎 Общий выигрыш: 0

🎯 Играйте, чтобы увеличить баланс!
🌐 Играть: {base_url}"""
        
        send_message(chat_id, balance_message)
        
    elif text == '/games':
        games_message = f"""🎮 <b>Доступные игры</b>

🚀 <b>Crash Game</b>
Множители до 100x! Главное - вовремя забрать выигрыш.

🎁 <b>Кейсы</b>
Открывай кейсы и получай случайные призы.

⭐ <b>Бонусы</b>
Ежедневные награды и специальные предложения."""
        
        keyboard = create_main_keyboard(base_url)
        send_message(chat_id, games_message, reply_markup=keyboard)
        
    elif text == '/menu':
        menu_message = f"""🎮 <b>Главное меню</b>

Привет, {first_name}!
Выберите действие с помощью кнопок ниже:"""
        
        keyboard = create_main_keyboard(base_url)
        send_message(chat_id, menu_message, reply_markup=keyboard)
        
    else:
        # Обработка обычных сообщений
        default_message = f"""🤖 Привет, {first_name}!

Я понимаю только команды:
/start - Начать
/help - Помощь
/balance - Баланс
/games - Игры

🎮 Для игры открой: {base_url}"""
        
        send_message(chat_id, default_message)

def handler(request):
    """Основная функция для Vercel"""
    try:
        # Определяем метод и путь
        method = request.method
        path = request.path
        
        # Базовый URL
        host = request.headers.get('host', 'pixel-stars.vercel.app')
        base_url = f"https://{host}"
        
        # Главная страница
        if method == 'GET' and path == '/':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'status': 'ok',
                    'message': 'PixelStars Casino Bot API',
                    'bot': 'active'
                })
            }
        
        # Статус бота
        elif method == 'GET' and path == '/api/status':
            url = f"{BOT_API_URL}/getMe"
            try:
                response = requests.get(url, timeout=10)
                bot_info = response.json()
                
                if bot_info.get('ok'):
                    bot_data = bot_info['result']
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'status': 'active',
                            'bot_username': bot_data.get('username'),
                            'bot_name': bot_data.get('first_name'),
                            'bot_id': bot_data.get('id')
                        })
                    }
                else:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'status': 'error', 'message': 'Bot not accessible'})
                    }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'status': 'error', 'message': str(e)})
                }
        
        # Webhook для Telegram
        elif method == 'POST' and path == '/api/webhook':
            # Получаем JSON данные
            body = request.get_data(as_text=True)
            update = json.loads(body)
            
            print(f"Получено обновление: {json.dumps(update, indent=2)}")
            
            if 'message' in update:
                process_message(update['message'], base_url)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ok'})
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Not found'})
            }
            
    except Exception as e:
        print(f"Ошибка: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }