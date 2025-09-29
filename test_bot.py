#!/usr/bin/env python3
import requests
import time

BOT_TOKEN = "8475765506:AAFENFMSv1Zp9QYMgVnmFonk8I2RJTDQErE"
BOT_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def send_test_message():
    """Отправляем тестовое сообщение с кнопками"""
    
    # ID чата для тестирования (замени на свой chat_id)
    # Чтобы получить chat_id, напиши боту любое сообщение и проверь getUpdates
    
    # Сначала получим обновления чтобы найти chat_id
    response = requests.get(f'{BOT_API_URL}/getUpdates')
    updates = response.json()
    
    print("Последние обновления:")
    print(updates)
    
    if updates.get('result'):
        for update in updates['result']:
            if 'message' in update:
                chat_id = update['message']['chat']['id']
                print(f"Найден chat_id: {chat_id}")
                
                # Создаем клавиатуру с кнопками
                keyboard = {
                    "inline_keyboard": [
                        [
                            {
                                "text": "🎮 PixelStars Casino",
                                "url": "http://localhost:8200"
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
                        ]
                    ]
                }
                
                # Отправляем сообщение с кнопками
                message_data = {
                    'chat_id': chat_id,
                    'text': '🎮 <b>PixelStars Casino</b>\n\nВыберите действие:',
                    'parse_mode': 'HTML',
                    'reply_markup': keyboard
                }
                
                response = requests.post(f'{BOT_API_URL}/sendMessage', json=message_data)
                result = response.json()
                print(f"Результат отправки: {result}")
                break
    else:
        print("Сообщений не найдено. Отправьте боту любое сообщение сначала.")

if __name__ == '__main__':
    send_test_message()