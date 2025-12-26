const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const MODERATORS = (process.env.MODERATORS || '').split(','); // ID или username модеров

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ===== Каталог =====
let catalog = [];
try {
    catalog = JSON.parse(fs.readFileSync('catalog.json'));
} catch (e) {
    catalog = [];
}

// ===== Заказы =====
let orders = [];
try {
    orders = JSON.parse(fs.readFileSync('orders.json'));
} catch (e) {
    orders = [];
}

// ===== Маршруты =====

// Получить каталог
app.get('/catalog', (req, res) => {
    res.json(catalog);
});

// Оформить заказ
app.post('/order', (req, res) => {
    try {
        const { user, cart } = req.body;
        if (!user || !cart || !cart.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order'
            });
        }

        const order = {
            user,
            cart,
            date: new Date().toISOString()
        };

        orders.push(order);
        fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));

        // Отправка модераторам
        MODERATORS.forEach(id => {
            let text = `🛒 Новый заказ\n`;
            text += `👤 @${user.username || user.first_name} (${user.id})\n\n`;

            cart.forEach(item => {
                text += `📦 ${item.name}\n`;
                text += `📝 ${item.description}\n`;
                text += `💰 ${item.price} zł\n\n`;
            });

            bot.sendMessage(id, text);
        });

        // ✅ ВОЗВРАЩАЕМ ОТВЕТ ФРОНТУ
        res.json({
            success: true,
            message: 'Заказ отправлен модераторам'
        });

    } catch (err) {
        console.error('ORDER ERROR:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


// ===== Бот для добавления товаров (только менеджеры) =====
bot.onText(/\/add_product (.+)/, (msg, match) => {
    const chatId = msg.from.id.toString();
    if (!MODERATORS.includes(chatId)) return bot.sendMessage(chatId, 'Нет доступа');

    const args = match[1].split('|'); // формат: Название|Цена|Описание
    if (args.length < 3) return bot.sendMessage(chatId, 'Формат: Название|Цена|Описание');

    const [name, price, description] = args;
    catalog.push({ name, price, description });
    fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2));
    bot.sendMessage(chatId, `Товар "${name}" добавлен в каталог`);
});

// ===== Запуск сервера =====
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
