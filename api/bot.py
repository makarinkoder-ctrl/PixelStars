import json
import requests
import os

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

def create_games_keyboard(base_url):
    """Создание клавиатуры с играми"""
    keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "🚀 Играть в Crash",
                    "url": base_url
                }
            ],
            [
                {
                    "text": "🎁 Открыть кейсы",
                    "url": base_url
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

def process_message(message, base_url):
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
        
        keyboard = create_games_keyboard(base_url)
        send_message(chat_id, games_message, reply_markup=keyboard)
        
    elif text == '/menu' or text == '/keyboard':
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

def process_callback_query(callback_query, base_url):
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
        
        keyboard = create_main_keyboard(base_url)
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
        
        keyboard = create_main_keyboard(base_url)
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
        
        keyboard = create_main_keyboard(base_url)
        edit_message(chat_id, message_id, help_message, keyboard)
        
    elif data == 'back_to_main':
        welcome_message = f"""🎮 <b>Pixelstars Casino</b>

👋 С возвращением, {first_name}!

Выберите действие:"""
        
        keyboard = create_main_keyboard(base_url)
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

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'ok',
        'message': 'PixelStars Casino Bot API',
        'bot': 'active'
    })

@app.route('/api/webhook', methods=['POST'])
def webhook():
    """Обработка webhook от Telegram"""
    try:
        update = request.get_json()
        print(f"Получено обновление: {json.dumps(update, indent=2)}")
        
        # Определяем базовый URL
        host = request.headers.get('Host', 'localhost:8200')
        base_url = f"https://{host}" if 'vercel.app' in host else f"http://{host}"
        
        if 'message' in update:
            process_message(update['message'], base_url)
        elif 'callback_query' in update:
            process_callback_query(update['callback_query'], base_url)
        
        return jsonify({'status': 'ok'})
        
    except Exception as e:
        print(f"Ошибка обработки webhook: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/send_message', methods=['POST'])
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

@app.route('/api/status', methods=['GET'])
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
                'bot_id': bot_data.get('id')
            })
        else:
            return jsonify({'status': 'error', 'message': 'Bot not accessible'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# Для Vercel
def handler(request):
    return app(request.environ, lambda status, headers: None)

if __name__ == '__main__':
    app.run(debug=True)