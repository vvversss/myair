// ===== 18+ =====
window.addEventListener('load', () => {
    const ageBtn = document.getElementById('enterBtn');
    const ageCheck = document.getElementById('ageCheck');
    if (ageBtn && ageCheck) {
        ageBtn.addEventListener('click', () => {
            ageCheck.style.display = 'none';
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = () => {
        localStorage.removeItem('tg_user');
        location.reload();
    };

    const closeProfile = document.getElementById('closeProfile');
    if (closeProfile) closeProfile.onclick = () => {
        const modal = document.getElementById('profileModal');
        if (modal) modal.style.display = 'none';
    };

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', showProfile);

});

// ===== Telegram Auth =====
function onTelegramAuth(user) {
    localStorage.setItem('tg_user', JSON.stringify(user));
    showUser(user);
}

function showUser(user) {
    const btn = document.getElementById('authBtn');
    if (btn) btn.innerHTML = `<div class="btn">${user.first_name}</div>`;
}

// Проверка сохранённого пользователя
const saved = localStorage.getItem('tg_user');
if (saved) showUser(JSON.parse(saved));

// ===== PROFILE =====
function showProfile() {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return alert('Сначала авторизуйтесь');

    const modal = document.getElementById('profileModal');
    if (!modal) return;
    modal.style.display = 'flex';

    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = `Имя: ${user.first_name}`;

    const profileId = document.getElementById('profileId');
    if (profileId) profileId.textContent = `ID: ${user.id}`;

    const ordersList = document.getElementById('orderHistory');
    if (ordersList) {
        const orders = JSON.parse(localStorage.getItem('orders_' + user.id) || '[]');
        ordersList.innerHTML = orders.length ? orders.map(o => `<li>${o}</li>`).join('') : '<li>Нет заказов</li>';
    }

    const cartList = document.getElementById('cartList');
    if (cartList) {
        const cart = JSON.parse(localStorage.getItem('cart_' + user.id) || '[]');
        cartList.innerHTML = cart.length ? cart.map(c => `<li>${c}</li>`).join('') : '<li>Корзина пуста</li>';
    }
}

// ===== CART / ORDERS =====
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) return showToast('Сначала авторизуйтесь через Telegram');

    const key = 'cart_' + user.id;
    let cart = JSON.parse(localStorage.getItem(key) || '[]');
    cart.push(product); // product = {name, price, description}
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

fetch("https://myair-zjra.onrender.com/catalog")
  .then(res => res.json())
  .then(data => {
      const catalogGrid = document.querySelector(".catalog-grid");
      catalogGrid.innerHTML = ""; // очищаем контейнер
      data.forEach(product => {
          catalogGrid.innerHTML += `
              <div class="product">
                  <h3>${product.name}</h3>
                  <p>${product.description}</p>
                  <div class="price">${product.price} zł</div>
                  <a href="javascript:void(0)" class="btn" onclick='addToCart(${JSON.stringify(product)})'>Заказать</a>
              </div>
          `;
      });
  });

  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Запуск анимации
    setTimeout(() => toast.classList.add('show'), 10);

    // Скрыть и удалить через duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 400);
    }, duration);
}
