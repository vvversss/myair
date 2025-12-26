//BETA 1.4.6

// ===================== 18+ =====================
document.addEventListener('DOMContentLoaded', () => {
    const ageCheck = document.getElementById('ageCheck');
    const enterBtn = document.getElementById('enterBtn');

    if (localStorage.getItem('ageConfirmed') === 'true' && ageCheck) {
        ageCheck.style.display = 'none';
    }

    if (enterBtn && ageCheck) {
        enterBtn.onclick = () => {
            localStorage.setItem('ageConfirmed', 'true');
            ageCheck.style.display = 'none';
        };
    }
});

// ===================== Telegram Auth =====================
function onTelegramAuth(user) {
    localStorage.setItem('tg_user', JSON.stringify(user));
    showUser(user);
}

function showUser(user) {
    const btn = document.getElementById('authBtn');
    if (!btn) return;

    btn.innerHTML = `
        <button class="btn btn-outline profile-trigger">
            👤 ${user.first_name}
        </button>
    `;

    btn.querySelector('button')
        .addEventListener('click', showProfile);
}


const savedUser = localStorage.getItem('tg_user');
if (savedUser) showUser(JSON.parse(savedUser));

// ===================== PROFILE =====================
function showProfile() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь');

    const modal = document.getElementById('profileModal');
    modal.style.display = 'flex';

    document.getElementById('profileName').textContent = `Имя: ${user.first_name}`;
    document.getElementById('profileId').textContent = `ID: ${user.id}`;

    const orders = JSON.parse(localStorage.getItem('orders_' + user.id) || '[]');
    const list = document.getElementById('orderHistory');

    list.innerHTML = orders.length
        ? orders.map(o =>
            `<li>${o.cart.map(p => p.name).join(', ')} — ${new Date(o.date).toLocaleString()}</li>`
          ).join('')
        : '<li>Заказов пока нет</li>';
}

// закрыть профиль
document.getElementById('closeProfile').onclick = () => {
    document.getElementById('profileModal').style.display = 'none';
};

// logout
document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('tg_user');
    location.reload();
};

// ===================== CART =====================
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь');

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

// ===================== CATALOG =====================
function renderCatalog(products) {
    const grid = document.querySelector('.catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';

    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="price">${p.price} zł</div>
            <button class="btn">Заказать</button>
        `;
        div.querySelector('button').onclick = () => addToCart(p);
        grid.appendChild(div);
    });
}

fetch('https://myair-zjra.onrender.com/catalog')
    .then(r => r.json())
    .then(renderCatalog);

// ===================== TOAST =====================
function showToast(message, duration = 3000) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);

    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 400);
    }, duration);
}
