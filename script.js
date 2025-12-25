// показать профиль
function showProfile(user) {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'flex';

    document.getElementById('profileName').textContent = `Имя: ${user.first_name}`;
    document.getElementById('profileId').textContent = `ID: ${user.id}`;

    // загрузка истории заказов и корзины
    const orders = JSON.parse(localStorage.getItem('orders_' + user.id) || '[]');
    const cart = JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');

    const orderList = document.getElementById('orderHistory');
    orderList.innerHTML = orders.length ? orders.map(o => `<li>${o}</li>`).join('') : '<li>Нет заказов</li>';

    const cartList = document.getElementById('cartList');
    cartList.innerHTML = cart.length ? cart.map(c => `<li>${c}</li>`).join('') : '<li>Корзина пуста</li>';
}

// кнопки
document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('tg_user');
    location.reload();
};

document.getElementById('closeProfile').onclick = () => {
    document.getElementById('profileModal').style.display = 'none';
};

// заменяем кнопку с именем на открытие профиля
function showUser(user) {
    const btn = document.getElementById('authBtn');
    btn.innerHTML = `<div class="btn" onclick="showProfile(${JSON.stringify(user)})">${user.first_name}</div>`;
}


function addToCart(productName) {
    const saved = JSON.parse(localStorage.getItem('tg_user') || '{}');
    if (!saved.id) return alert('Сначала авторизуйтесь');

    // добавить в корзину
    const cart = JSON.parse(localStorage.getItem('cart_' + saved.id) || '[]');
    cart.push(productName);
    localStorage.setItem('cart_' + saved.id, JSON.stringify(cart));

    // добавить в историю заказов
    const orders = JSON.parse(localStorage.getItem('orders_' + saved.id) || '[]');
    orders.push(productName);
    localStorage.setItem('orders_' + saved.id, JSON.stringify(orders));

    alert(`${productName} добавлен в корзину и историю заказов`);
}
