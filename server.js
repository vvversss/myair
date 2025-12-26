//BETA 1.2
// ===================== 18+ =====================
document.addEventListener('DOMContentLoaded', () => {
    const ageCheck = document.getElementById('ageCheck');
    const enterBtn = document.getElementById('enterBtn');

    if (localStorage.getItem('ageConfirmed') === 'true' && ageCheck) {
        ageCheck.style.display = 'none';
    }

    if (enterBtn && ageCheck) {
        enterBtn.addEventListener('click', () => {
            localStorage.setItem('ageConfirmed', 'true');
            ageCheck.style.display = 'none';
        });
    }

    // Открыть профиль
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', showProfile);
});

// ===================== Telegram Auth =====================
function onTelegramAuth(user) {
    localStorage.setItem('tg_user', JSON.stringify(user));
    showUser(user);
}

function showUser(user) {
    const btn = document.getElementById('authBtn');
    if (btn) btn.innerHTML = `<div class="btn">${user.first_name}</div>`;
}

const savedUser = localStorage.getItem('tg_user');
if (savedUser) showUser(JSON.parse(savedUser));

// ===================== PROFILE =====================
function showProfile() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь');

    const modal = document.getElementById('profileModal');
    if (!modal) return;
    modal.style.display = 'flex';

    // Основная информация
    document.getElementById('profileName').textContent = `Имя: ${user.first_name}`;
    document.getElementById('profileId').textContent = `ID: ${user.id}`;

    // История заказов
    const ordersKey = 'orders_' + user.id;
    const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const ordersList = document.getElementById('orderHistory');
    ordersList.innerHTML = orders.length
        ? orders.map(o => `<li>${o.cart.map(p => p.name).join(', ')} — ${new Date(o.date).toLocaleString()}</li>`).join('')
        : '<li>Нет заказов</li>';

    // Корзина
    const cart = getCart();
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = cart.length
        ? cart.map(p => `<li>${p.name} — ${p.price} zł</li>`).join('')
        : '<li>Корзина пуста</li>';

    // Выход
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.onclick = () => {
        localStorage.removeItem('tg_user');
        localStorage.removeItem('cart_' + user.id);
        location.reload();
    };

    // Закрыть модалку
    const closeProfile = document.getElementById('closeProfile');
    closeProfile.onclick = () => modal.style.display = 'none';
}

// ===================== CART =====================
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь через Telegram');

    const key = 'cart_' + user.id;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');

    cart.push({
        name: product.name,
        price: product.price,
        description: product.description
    });

    localStorage.setItem(key, JSON.stringify(cart));
    showToast(`${product.name} добавлен в корзину`);
}

function getCart() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return [];
    return JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');
}

function clearCart() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return;
    localStorage.removeItem('cart_' + user.id);
}

// ===================== CATALOG =====================
function renderCatalog(products) {
    const catalogGrid = document.querySelector('.catalog-grid');
    if (!catalogGrid) return;

    catalogGrid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product';

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">${product.price} zł</div>
            <button class="btn">Заказать</button>
        `;

        card.querySelector('button')
            .addEventListener('click', () => addToCart(product));

        catalogGrid.appendChild(card);
    });
}

fetch('https://myair-zjra.onrender.com/catalog')
    .then(res => res.json())
    .then(renderCatalog)
    .catch(() => showToast('Ошибка загрузки каталога'));

// ===================== TOAST =====================
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}
