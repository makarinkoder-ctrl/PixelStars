#!/usr/bin/env python3
import json
import requests
import time
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

# Конфигурация бота
BOT_TOKEN = "8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE"
BOT_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

app = Flask(__name__)
CORS(app)

# Переменная для хранения последнего update_id
last_update_id = 0

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

def create_main_keyboard():
    """Создание главной клавиатуры с кнопкой PixelStars"""
    keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "🎮 PixelStars Casino",
                    "web_app": {"url": "https://pixel-stars.vercel.app"}
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

def create_games_keyboard():
    """Создание клавиатуры с играми"""
    keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "🚀 Играть в Crash",
                    "web_app": {"url": "https://pixel-stars.vercel.app"}
                }
            ],
            [
                {
                    "text": "🎁 Открыть кейсы",
                    "web_app": {"url": "https://pixel-stars.vercel.app"}
                }
            ],
            [
                {
                    "text": "🔙 Назад",
                    "callback_data": "back_to_main"
                }
            ]
        ]
    }
    return keyboard

def get_updates():
    """Получение обновлений через long polling"""
    global last_update_id
    
    url = f"{BOT_API_URL}/getUpdates"
    params = {
        'offset': last_update_id + 1,
        'timeout': 30
    }
    
    try:
        response = requests.get(url, params=params, timeout=35)
        return response.json()
    except Exception as e:
        print(f"Ошибка получения обновлений: {e}")
        return None

def process_message(message):
    """Обработка входящего сообщения"""
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user = message.get('from', {})
    
    first_name = user.get('first_name', 'Игрок')
    username = user.get('username', '')
    
    print(f"📨 Сообщение от {first_name} (@{username}): {text}")
    
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
        
        keyboard = create_main_keyboard()
        send_message(chat_id, welcome_message, reply_markup=keyboard)
        
    elif text == '/help':
        help_message = """📋 <b>Помощь по Pixelstars Casino</b>

🎮 <b>Команды бота:</b>
/start - Запуск бота
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
• Собирай коллекцию

❓ <b>Нужна помощь?</b>
Играй на: https://pixel-stars.vercel.app"""
        
        send_message(chat_id, help_message)
        
    elif text == '/balance':
        balance_message = f"""💰 <b>Ваш баланс</b>

👤 Игрок: {first_name}
⭐ Звезды: 1000 (стартовый бонус)
🎮 Игр сыграно: 0
💎 Общий выигрыш: 0

🎯 Играйте, чтобы увеличить баланс!
🌐 Играть: https://pixel-stars.vercel.app"""
        
        send_message(chat_id, balance_message)
        
    elif text == '/games':
        games_message = """🎮 <b>Доступные игры</b>

🚀 <b>Crash Game</b>
Множители до 100x! Главное - вовремя забрать выигрыш.

🎁 <b>Кейсы</b>
Открывай кейсы и получай случайные призы:
• Обычные кейсы
• Редкие кейсы  
• Легендарные кейсы

⭐ <b>Бонусы</b>
Ежедневные награды и специальные предложения."""
        
        keyboard = create_games_keyboard()
        send_message(chat_id, games_message, reply_markup=keyboard)
        
    elif text == '/menu' or text == '/keyboard':
        menu_message = f"""🎮 <b>Главное меню</b>

Привет, {first_name}!
Выберите действие с помощью кнопок ниже:"""
        
        keyboard = create_main_keyboard()
        send_message(chat_id, menu_message, reply_markup=keyboard)
        
    else:
        # Обработка обычных сообщений
        default_message = f"""🤖 Привет, {first_name}!

Я понимаю только команды:
/start - Начать
/help - Помощь
/balance - Баланс
/games - Игры

🎮 Для игры открой: https://pixel-stars.vercel.app"""
        
        send_message(chat_id, default_message)

def process_callback_query(callback_query):
    """Обработка нажатий на inline кнопки"""
    query_id = callback_query['id']
    data = callback_query.get('data', '')
    user = callback_query.get('from', {})
    chat_id = user.get('id')
    message_id = callback_query.get('message', {}).get('message_id')
    
    first_name = user.get('first_name', 'Игрок')
    
    print(f"🔘 Callback от {first_name}: {data}")
    
    # Отвечаем на callback_query
    answer_callback_query(query_id)
    
    if data == 'stats':
        stats_message = f"""📊 <b>Ваша статистика</b>

👤 Игрок: {first_name}
⭐ Звезды: 1000 (стартовый бонус)
🎮 Игр сыграно: 0
💎 Общий выигрыш: 0
🚀 Лучший множитель: 0x

🎯 Играйте, чтобы улучшить статистику!"""
        
        keyboard = create_main_keyboard()
        edit_message(chat_id, message_id, stats_message, keyboard)
        
    elif data == 'bonuses':
        bonuses_message = f"""🎁 <b>Бонусы и награды</b>

💎 <b>Доступные бонусы:</b>
• Стартовый бонус: 1000 ⭐ ✅
• Ежедневный бонус: 100 ⭐
• Реферальный бонус: 500 ⭐

🎮 <b>Активности:</b>
• Первая игра: +200 ⭐
• 10 игр подряд: +1000 ⭐
• Выигрыш 10x: +5000 ⭐

🔥 Играйте и зарабатывайте больше!"""
        
        keyboard = create_main_keyboard()
        edit_message(chat_id, message_id, bonuses_message, keyboard)
        
    elif data == 'help':
        help_message = """📋 <b>Помощь по Pixelstars Casino</b>

🎮 <b>Команды бота:</b>
/start - Запуск бота
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
        
        keyboard = create_main_keyboard()
        edit_message(chat_id, message_id, help_message, keyboard)
        
    elif data == 'back_to_main':
        welcome_message = f"""🎮 <b>Pixelstars Casino</b>

👋 С возвращением, {first_name}!

Выберите действие:"""
        
        keyboard = create_main_keyboard()
        edit_message(chat_id, message_id, welcome_message, keyboard)

def answer_callback_query(query_id, text=""):
    """Отвечаем на callback_query"""
    url = f"{BOT_API_URL}/answerCallbackQuery"
    data = {
        'callback_query_id': query_id,
        'text': text
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Ошибка ответа на callback: {e}")
        return None

def edit_message(chat_id, message_id, text, reply_markup=None):
    """Редактирование сообщения"""
    url = f"{BOT_API_URL}/editMessageText"
    data = {
        'chat_id': chat_id,
        'message_id': message_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    if reply_markup:
        data['reply_markup'] = reply_markup
    
    try:
        response = requests.post(url, json=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Ошибка редактирования сообщения: {e}")
        return None

def polling_worker():
    """Воркер для получения сообщений через polling"""
    global last_update_id
    
    print("🔄 Запуск polling для получения сообщений...")
    
    while True:
        try:
            updates = get_updates()
            
            if updates and updates.get('ok'):
                for update in updates.get('result', []):
                    update_id = update.get('update_id')
                    
                    if update_id > last_update_id:
                        last_update_id = update_id
                    
                    if 'message' in update:
                        process_message(update['message'])
                    elif 'callback_query' in update:
                        process_callback_query(update['callback_query'])
            
            time.sleep(1)
            
        except Exception as e:
            print(f"Ошибка в polling: {e}")
            time.sleep(5)

@app.route('/')
def home():
    return '''
    <h1>🤖 Pixelstars Casino Bot Server</h1>
    <p>Бот активен и готов к работе!</p>
    <p><a href="/status">Проверить статус</a></p>
    <p><strong>Команды бота:</strong></p>
    <ul>
        <li>/start - Начать</li>
        <li>/help - Помощь</li>
        <li>/balance - Баланс</li>
        <li>/games - Игры</li>
    </ul>
    '''

@app.route('/status')
def status():
    """Проверка статуса бота"""
    url = f"{BOT_API_URL}/getMe"
    try:
        response = requests.get(url, timeout=10)
        bot_info = response.json()
        
        if bot_info.get('ok'):
            bot_data = bot_info['result']
            return jsonify({
                'status': 'active',
                'bot_username': bot_data.get('username'),
                'bot_name': bot_data.get('first_name'),
                'bot_id': bot_data.get('id'),
                'last_update_id': last_update_id
            })
        else:
            return jsonify({'status': 'error', 'message': 'Bot not accessible'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/send_message', methods=['POST'])
def send_message_api():
    """API для отправки сообщений из веб-приложения"""
    try:
        data = request.get_json()
        chat_id = data.get('chat_id')
        text = data.get('text')
        
        if not chat_id or not text:
            return jsonify({'error': 'Missing chat_id or text'})
        
        result = send_message(chat_id, text)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    print("🤖 Запуск Pixelstars Casino Bot Server...")
    print(f"🔗 Bot Token: {BOT_TOKEN[:10]}...")
    
    # Запускаем polling в отдельном потоке
    polling_thread = threading.Thread(target=polling_worker, daemon=True)
    polling_thread.start()
    
    print("🌐 Сервер запущен на http://localhost:5002")
    print("📱 Бот готов к работе!")
    print("💬 Напишите боту /start для проверки")
    
    app.run(host='0.0.0.0', port=5002, debug=False)