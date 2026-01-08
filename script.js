// BETA 1.5.2 — CLEAN & STABLE

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page || 'index';

    /* ===================== 18+ ===================== */
    if (page === 'index') {
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
    }

    /* ===================== USER ===================== */
    const savedUser = localStorage.getItem('tg_user');
    if (savedUser) showUser(JSON.parse(savedUser));

    /* ===================== PROFILE ===================== */
    const closeProfileBtn = document.getElementById('closeProfile');
    const logoutBtn = document.getElementById('logoutBtn');

    if (closeProfileBtn) {
        closeProfileBtn.onclick = () => {
            const modal = document.getElementById('profileModal');
            if (modal) modal.style.display = 'none';
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('tg_user');
            location.reload();
        };
    }

    /* ===================== INDEX ===================== */
    if (page === 'index') {
        fetch('https://myair-zjra.onrender.com/catalog')
            .then(r => r.json())
            .then(renderCatalog)
            .catch(err => console.error(err));
    }

    /* ===================== CART ===================== */
    if (page === 'cart') {
        showCart();

        const placeBtn = document.getElementById('placeOrderBtn');
        if (placeBtn) placeBtn.onclick = placeOrder;
    }
});

/* ===================== TELEGRAM ===================== */
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
    btn.querySelector('button').onclick = showProfile;
}

/* ===================== PROFILE ===================== */
function showProfile() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь');

    const modal = document.getElementById('profileModal');
    if (!modal) return;

    modal.style.display = 'flex';

    document.getElementById('profileName').textContent = `Имя: ${user.first_name}`;
    document.getElementById('profileId').textContent = `ID: ${user.id}`;

    const list = document.getElementById('orderHistory');
    const orders = JSON.parse(localStorage.getItem('orders_' + user.id) || '[]');

    list.innerHTML = orders.length
        ? orders.map(o =>
            `<li>${o.cart.map(p => p.name).join(', ')} — ${new Date(o.date).toLocaleString()}</li>`
          ).join('')
        : '<li>Заказов пока нет</li>';
}

/* ===================== CART ===================== */
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь');

    const key = 'cart_' + user.id;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');

    cart.push(product);
    localStorage.setItem(key, JSON.stringify(cart));

    showToast(`${product.name} добавлен в корзину`);
}

function showCart() {
    const container = document.getElementById('cartItems');
    const user = JSON.parse(localStorage.getItem('tg_user'));

    if (!container) return;

    if (!user) {
        container.innerHTML = '<p>Сначала авторизуйтесь</p>';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');
    container.innerHTML = '';

    if (!cart.length) {
        container.innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'product cart-item';
        div.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="price">${item.price} zł</div>
            </div>
        `;

        const btn = document.createElement('button');
        btn.className = 'btn btn-outline';
        btn.textContent = 'Удалить';
        btn.onclick = () => removeItem(index);

        div.appendChild(btn);
        container.appendChild(div);
    });
}

function removeItem(index) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    const key = 'cart_' + user.id;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');

    cart.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(cart));

    showCart();
    showToast('Товар удалён');
}

function clearCart() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    localStorage.removeItem('cart_' + user.id);
}

/* ===================== ORDER ===================== */
function placeOrder() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    const cart = JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');

    if (!cart.length) return showToast('Корзина пуста');

    fetch('https://myair-zjra.onrender.com/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, cart })
    })
    .then(r => r.json())
    .then(() => {
        const key = 'orders_' + user.id;
        const orders = JSON.parse(localStorage.getItem(key) || '[]');
        orders.push({ cart, date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(orders));

        clearCart();
        showCart();
        showToast('Заказ отправлен');
    });
}

/* ===================== CATALOG ===================== */
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

/* ===================== TOAST ===================== */
function showToast(message) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);

    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.remove(), 3000);
}
