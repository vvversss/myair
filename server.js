//BETA 1.4
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

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ===== МОДЕРАТОРЫ =====
const MODS_FILE = 'moderators.json';
let mods = { admins: [], moderators: [] };

try {
    mods = JSON.parse(fs.readFileSync(MODS_FILE));
} catch {
    fs.writeFileSync(MODS_FILE, JSON.stringify(mods, null, 2));
}

function saveMods() {
    fs.writeFileSync(MODS_FILE, JSON.stringify(mods, null, 2));
}

function isAdmin(id) {
    return mods.admins.includes(id.toString());
}

function isModerator(id) {
    return mods.moderators.includes(id.toString()) || isAdmin(id);
}

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
            return res.status(400).json({ success: false, message: 'Invalid order' });
        }

        const order = { user, cart, date: new Date().toISOString() };
        orders.push(order);
        fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));

        // Отправка модераторам
        mods.moderators.forEach(id => {
            let text = `🛒 Новый заказ\n👤 @${user.username || user.first_name} (${user.id})\n\n`;
            cart.forEach(item => {
                text += `📦 ${item.name}\n📝 ${item.description}\n💰 ${item.price} zł\n\n`;
            });
            bot.sendMessage(id, text);
        });

        res.json({ success: true, message: 'Заказ отправлен модераторам' });

    } catch (err) {
        console.error('ORDER ERROR:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===== Бот: добавление товаров =====
bot.onText(/\/add_product (.+)/, (msg, match) => {
    const chatId = msg.from.id.toString();
    if (!isModerator(chatId)) return bot.sendMessage(chatId, '❌ Нет доступа');

    const args = match[1].split('|'); // формат: Название|Цена|Описание
    if (args.length < 3) return bot.sendMessage(chatId, 'Формат: Название|Цена|Описание');

    const [name, price, description] = args;
    catalog.push({ name, price, description });
    fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2));
    bot.sendMessage(chatId, `✅ Товар "${name}" добавлен в каталог`);
});

// ===== Бот: управление модерами =====

// Добавить модератора
bot.onText(/\/add_moderator (.+)/, async (msg, match) => {
    const adminId = msg.from.id.toString();
    if (!isAdmin(adminId)) return bot.sendMessage(adminId, '❌ Только админ');

    const username = match[1].replace('@', '');
    try {
        const user = await bot.getChat(username);
        const id = user.id.toString();

        if (mods.moderators.includes(id)) return bot.sendMessage(adminId, '⚠️ Уже модератор');

        mods.moderators.push(id);
        saveMods();
        bot.sendMessage(adminId, `✅ @${username} добавлен в модераторы`);
    } catch {
        bot.sendMessage(adminId, '❌ Пользователь не найден');
    }
});

// Удалить модератора
bot.onText(/\/remove_moderator (.+)/, async (msg, match) => {
    const adminId = msg.from.id.toString();
    if (!isAdmin(adminId)) return bot.sendMessage(adminId, '❌ Только админ');

    const username = match[1].replace('@', '');
    try {
        const user = await bot.getChat(username);
        const id = user.id.toString();

        mods.moderators = mods.moderators.filter(m => m !== id);
        saveMods();
        bot.sendMessage(adminId, `🗑 @${username} удалён из модераторов`);
    } catch {
        bot.sendMessage(adminId, '❌ Пользователь не найден');
    }
});

// Список модераторов
bot.onText(/\/moderators/, (msg) => {
    const id = msg.from.id.toString();
    if (!isAdmin(id)) return;

    const list = mods.moderators.length
        ? mods.moderators.map(m => `• ${m}`).join('\n')
        : 'Модераторов нет';

    bot.sendMessage(id, `👮 Модераторы:\n${list}`);
});

// ===== Запуск сервера =====
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
