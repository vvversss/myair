const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

/* ================= INIT DB ================= */
async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS moderators (
            id TEXT PRIMARY KEY,
            role TEXT DEFAULT 'moderator'
        );

        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price NUMERIC,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            username TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            name TEXT,
            description TEXT,
            price NUMERIC
        );
    `);

    if (ADMIN_ID) {
        await pool.query(
            `INSERT INTO moderators(id, role)
             VALUES ($1,'admin')
             ON CONFLICT (id) DO NOTHING`,
            [ADMIN_ID]
        );
    }
}
initDB();

/* ================= HELPERS ================= */
async function isModerator(id) {
    const r = await pool.query(
        'SELECT 1 FROM moderators WHERE id=$1',
        [id]
    );
    return r.rowCount > 0;
}

async function getAllStaff() {
    const r = await pool.query('SELECT id FROM moderators');
    return r.rows.map(r => r.id);
}

/* ================= API ================= */

// каталог
app.get('/catalog', async (_, res) => {
    const r = await pool.query(
        'SELECT name, price, description FROM products ORDER BY id DESC'
    );
    res.json(r.rows);
});

// заказ
app.post('/order', async (req, res) => {
    try {
        const { user, cart } = req.body;
        if (!user || !cart?.length)
            return res.status(400).json({ success: false });

        const o = await pool.query(
            `INSERT INTO orders(user_id, username)
             VALUES($1,$2) RETURNING id`,
            [user.id, user.username || user.first_name]
        );

        const orderId = o.rows[0].id;

        for (const item of cart) {
            await pool.query(
                `INSERT INTO order_items(order_id,name,description,price)
                 VALUES($1,$2,$3,$4)`,
                [orderId, item.name, item.description, item.price]
            );
        }

        const staff = await getAllStaff();
        let text = `🛒 Новый заказ\n👤 @${user.username || user.first_name}\n\n`;

        cart.forEach(i => {
            text += `📦 ${i.name}\n📝 ${i.description}\n💰 ${i.price} zł\n\n`;
        });

        staff.forEach(id => bot.sendMessage(id, text));

        res.json({ success: true, message: 'Заказ отправлен' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
});

/* ================= BOT ================= */

// добавить товар
bot.onText(/\/add_product (.+)/, async (msg, match) => {
    if (!(await isModerator(msg.from.id.toString())))
        return bot.sendMessage(msg.chat.id, '❌ Нет доступа');

    const [name, price, description] = match[1].split('|');
    if (!name || !price || !description)
        return bot.sendMessage(msg.chat.id, 'Формат: Название|Цена|Описание');

    await pool.query(
        `INSERT INTO products(name,price,description)
         VALUES($1,$2,$3)`,
        [name, price, description]
    );

    bot.sendMessage(msg.chat.id, `✅ ${name} добавлен`);
});

// добавить модера
bot.onText(/\/add_moderator (\d+)/, async (msg, match) => {
    if (msg.from.id.toString() !== ADMIN_ID) return;

    await pool.query(
        `INSERT INTO moderators(id) VALUES($1)
         ON CONFLICT DO NOTHING`,
        [match[1]]
    );

    bot.sendMessage(msg.chat.id, '✅ Модератор добавлен');
});

// список
bot.onText(/\/moderators/, async (msg) => {
    if (msg.from.id.toString() !== ADMIN_ID) return;

    const r = await pool.query('SELECT id, role FROM moderators');
    const list = r.rows.map(x => `• ${x.id} (${x.role})`).join('\n');
    bot.sendMessage(msg.chat.id, list || 'Пусто');
});

app.listen(PORT, () =>
    console.log('🚀 Server running')
);
