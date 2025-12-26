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

    // ===== Профиль =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('tg_user');
            location.reload();
        };
    }

    const closeProfile = document.getElementById('closeProfile');
    if (closeProfile) {
        closeProfile.onclick = () => {
            const modal = document.getElementById('profileModal');
            if (modal) modal.style.display = 'none';
        };
    }

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', showProfile);
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

// ===================== PROFILE =====================
function showProfile() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь');

    const modal = document.getElementById('profileModal');
    if (!modal) return;
    modal.style.display = 'flex';

    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = `Имя: ${user.first_name}`;

    const profileId = document.getElementById('profileId');
    if (profileId) profileId.textContent = `ID: ${user.id}`;

    const cartList = document.getElementById('cartList');
    if (cartList) {
        const cart = getCart();
        cartList.innerHTML = cart.length
            ? cart.map(p => `<li>${p.name}</li>`).join('')
            : '<li>Корзина пуста</li>';
    }
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
