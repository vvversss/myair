// ===== 18+
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('enterBtn').addEventListener('click', () => {
        document.getElementById('ageCheck').style.display = 'none';
    });

    // кнопки профиля
    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('tg_user');
        location.reload();
    };
    document.getElementById('closeProfile').onclick = () => {
        document.getElementById('profileModal').style.display = 'none';
    };
});


// ===== Telegram Auth =====
function onTelegramAuth(user) {
    localStorage.setItem('tg_user', JSON.stringify(user));
    showUser(user);
}

function showUser(user) {
    const btn = document.getElementById('authBtn');
    btn.innerHTML = `<div class="btn" id="profileBtn">${user.first_name}</div>`;

    // Открытие профиля по клику
    document.getElementById('profileBtn').addEventListener('click', () => {
        showProfile();
    });
}

// Проверка сохранённого пользователя
const saved = localStorage.getItem('tg_user');
if (saved) showUser(JSON.parse(saved));

// ===== PROFILE =====
function showProfile() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return alert('Сначала авторизуйтесь');

    const modal = document.getElementById('profileModal');
    modal.style.display = 'flex';

    document.getElementById('profileName').textContent = `Имя: ${user.first_name}`;
    document.getElementById('profileId').textContent = `ID: ${user.id}`;

    const orders = JSON.parse(localStorage.getItem('orders_' + user.id) || '[]');
    const cart = JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');

    document.getElementById('orderHistory').innerHTML = orders.length ? orders.map(o => `<li>${o}</li>`).join('') : '<li>Нет заказов</li>';
    document.getElementById('cartList').innerHTML = cart.length ? cart.map(c => `<li>${c}</li>`).join('') : '<li>Корзина пуста</li>';
}

// Кнопки закрытия и выхода
// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('logoutBtn').onclick = () => {
//         localStorage.removeItem('tg_user');
//         location.reload();
//     };
//     document.getElementById('closeProfile').onclick = () => {
//         document.getElementById('profileModal').style.display = 'none';
//     };
// });

// ===== CART / ORDERS =====
function addToCart(productName) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return alert('Сначала авторизуйтесь');

    // Добавление в корзину
    const cart = JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');
    cart.push(productName);
    localStorage.setItem('cart_' + user.id, JSON.stringify(cart));

    // Добавление в историю заказов
    const orders = JSON.parse(localStorage.getItem('orders_' + user.id) || '[]');
    orders.push(productName);
    localStorage.setItem('orders_' + user.id, JSON.stringify(orders));

    alert(`${productName} добавлен в корзину и историю заказов`);
}
