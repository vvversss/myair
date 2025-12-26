//BETA 1.4.1

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

// ===================== CART =====================
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь через Telegram');

    const key = 'cart_' + user.id;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');

    cart.push(product);
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
    const grid = document.querySelector('.catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';

    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';

        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">${product.price} zł</div>
            <button class="btn">Заказать</button>
        `;

        div.querySelector('button')
            .addEventListener('click', () => addToCart(product));

        grid.appendChild(div);
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
