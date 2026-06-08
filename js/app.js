import {
    deleteProduct,
    filterProducts,
    formatPrice,
    getFilterOptions,
    loadProducts,
    saveProducts,
    upsertProduct
} from "./products.js";
import {
    addToCart,
    beginStripeCheckout,
    calculateCart,
    changeQuantity,
    getCart,
    getCartCount,
    getTotalSpent,
    getUserOrders,
    getVipLevel,
    removeFromCart,
    saveDemoOrder
} from "./cart.js";
import { getAuthProvider, initAuth, isAdmin, logout, signInOrRegister } from "./auth.js";
import { MYAIR_CONFIG } from "./config.js";

const state = {
    products: loadProducts(),
    user: null,
    authMode: "login"
};

const ui = {};

document.addEventListener("DOMContentLoaded", async () => {
    bindUi();
    setupAgeGate();
    setupNavigation();
    setupExternalLinks();
    setupFilters();
    setupCart();
    setupAuth();
    setupAdmin();

    state.user = await initAuth();
    renderFilters();
    renderProducts();
    refreshUi();

    if (new URLSearchParams(window.location.search).get("cart") === "open") {
        openCart();
    }
});

function bindUi() {
    [
        "ageGate", "confirmAgeBtn", "leaveAgeBtn", "searchFocusBtn", "searchInput", "categoryFilter",
        "flavorFilter", "priceFilter", "priceValue", "clearFiltersBtn", "productGrid", "cartToggle",
        "cartDrawer", "closeCartBtn", "drawerBackdrop", "cartCount", "cartItems", "cartSubtotal",
        "cartDiscount", "cartTotal", "cartVipNote", "checkoutBtn", "checkoutModal", "checkoutMessage",
        "saveDemoOrderBtn", "authModal", "authForm", "authName", "authEmail", "authPassword",
        "accountBtn", "openAccountHeroBtn", "profileModal", "profileName", "profileVip",
        "profileSpent", "purchaseHistory", "logoutBtn", "adminPanel", "adminNavBtn",
        "productForm", "productId", "productName", "productCategory", "productFlavors",
        "productPrice", "productStock", "productImage", "resetProductFormBtn", "adminProductList",
        "ordersList", "vipStatus", "toastRegion"
    ].forEach((id) => {
        ui[id] = document.getElementById(id);
    });
}

function setupExternalLinks() {
    document.querySelectorAll("[data-telegram-link]").forEach((link) => {
        link.href = MYAIR_CONFIG.telegramUrl;
    });
}

function setupAgeGate() {
    const confirmed = localStorage.getItem("myair.ageConfirmed") === "true";
    document.body.classList.toggle("age-locked", !confirmed);
    ui.ageGate.hidden = confirmed;

    ui.confirmAgeBtn.addEventListener("click", () => {
        localStorage.setItem("myair.ageConfirmed", "true");
        ui.ageGate.hidden = true;
        document.body.classList.remove("age-locked");
        showToast("Witamy w MY AIR demo 18+.");
    });

    ui.leaveAgeBtn.addEventListener("click", () => {
        ui.ageGate.querySelector(".age-card").innerHTML = `
            <span class="age-mark">18+</span>
            <h2>Dostep zablokowany</h2>
            <p>Ta strona demo jest przeznaczona wylacznie dla osob doroslych.</p>
        `;
    });
}

function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const target = document.querySelector(anchor.getAttribute("href"));
            if (!target) return;

            event.preventDefault();
            const headerOffset = getHeaderOffset();
            const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
            window.scrollTo({ top, behavior: "smooth" });
        });
    });

    ui.searchFocusBtn.addEventListener("click", () => {
        document.getElementById("products").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => ui.searchInput.focus(), 360);
    });

    ui.accountBtn.addEventListener("click", handleAccountClick);
    ui.openAccountHeroBtn.addEventListener("click", handleAccountClick);
    ui.adminNavBtn.addEventListener("click", () => ui.adminPanel.scrollIntoView({ behavior: "smooth" }));

    document.querySelectorAll("[data-close-modal]").forEach((button) => {
        button.addEventListener("click", () => closeModal(button.dataset.closeModal));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeCart();
            closeAllModals();
        }
    });
}

function getHeaderOffset() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--header-height");
    return (Number.parseFloat(value) || 72) + 28;
}

function setupFilters() {
    ["input", "change"].forEach((eventName) => {
        ui.searchInput.addEventListener(eventName, renderProducts);
        ui.categoryFilter.addEventListener(eventName, renderProducts);
        ui.flavorFilter.addEventListener(eventName, renderProducts);
        ui.priceFilter.addEventListener(eventName, () => {
            ui.priceValue.textContent = formatPrice(ui.priceFilter.value);
            renderProducts();
        });
    });

    ui.clearFiltersBtn.addEventListener("click", () => {
        ui.searchInput.value = "";
        ui.categoryFilter.value = "all";
        ui.flavorFilter.value = "all";
        ui.priceFilter.value = ui.priceFilter.max;
        ui.priceValue.textContent = formatPrice(ui.priceFilter.value);
        renderProducts();
    });
}

function setupCart() {
    ui.cartToggle.addEventListener("click", openCart);
    ui.closeCartBtn.addEventListener("click", closeCart);
    ui.drawerBackdrop.addEventListener("click", closeCart);

    ui.checkoutBtn.addEventListener("click", async () => {
        if (!getCart().length) {
            showToast("Koszyk jest pusty.");
            return;
        }

        if (!state.user) {
            showToast("Zaloguj sie, aby zapisac purchase history i VIP.");
            openModal("authModal");
            return;
        }

        const summary = calculateCart(getVipLevel(getTotalSpent(state.user)));
        const result = await beginStripeCheckout(summary, state.user);
        if (result.status === "redirected") return;

        ui.checkoutMessage.textContent = result.message;
        openModal("checkoutModal");
    });

    ui.saveDemoOrderBtn.addEventListener("click", () => {
        if (!state.user) {
            closeModal("checkoutModal");
            openModal("authModal");
            return;
        }

        const summary = calculateCart(getVipLevel(getTotalSpent(state.user)));
        if (!summary.items.length) {
            showToast("Koszyk jest pusty.");
            return;
        }

        saveDemoOrder(state.user, summary);
        closeModal("checkoutModal");
        closeCart();
        refreshUi();
        renderOrders();
        showToast("Zamowienie demo zapisane. VIP zostal przeliczony.");
    });
}

function setupAuth() {
    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
            state.authMode = button.dataset.authMode;
            document.querySelectorAll("[data-auth-mode]").forEach((tab) => tab.classList.toggle("active", tab === button));
            ui.authName.closest("label").style.display = state.authMode === "register" ? "grid" : "none";
        });
    });

    ui.authName.closest("label").style.display = "none";

    ui.authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            state.user = await signInOrRegister({
                mode: state.authMode,
                name: ui.authName.value,
                email: ui.authEmail.value,
                password: ui.authPassword.value
            });
            ui.authForm.reset();
            closeModal("authModal");
            refreshUi();
            showToast(`Zalogowano przez ${getAuthProvider()}.`);
        } catch (error) {
            showToast(error.message || "Nie udalo sie zalogowac.");
        }
    });

    ui.logoutBtn.addEventListener("click", async () => {
        await logout();
        state.user = null;
        closeModal("profileModal");
        refreshUi();
        showToast("Wylogowano.");
    });
}

function setupAdmin() {
    ui.productForm.addEventListener("submit", (event) => {
        event.preventDefault();

        state.products = upsertProduct(state.products, {
            id: ui.productId.value,
            name: ui.productName.value,
            category: ui.productCategory.value,
            flavors: ui.productFlavors.value,
            price: ui.productPrice.value,
            stock: ui.productStock.value,
            imageUrl: ui.productImage.value,
            imageIndex: state.products.length % 6
        });
        saveProducts(state.products);
        resetProductForm();
        renderFilters();
        renderProducts();
        renderAdminProducts();
        showToast("Produkt zapisany.");
    });

    ui.resetProductFormBtn.addEventListener("click", resetProductForm);
}

function renderFilters() {
    const { categories, flavors } = getFilterOptions(state.products);
    replaceOptions(ui.categoryFilter, categories);
    replaceOptions(ui.flavorFilter, flavors);
    const maxPrice = Math.max(...state.products.map((product) => product.price), 500);
    ui.priceFilter.max = Math.ceil(maxPrice / 10) * 10;
    ui.priceFilter.value = ui.priceFilter.max;
    ui.priceValue.textContent = formatPrice(ui.priceFilter.value);
}

function replaceOptions(select, options) {
    const current = select.value;
    select.replaceChildren(new Option("Wszystkie", "all"));
    options.forEach((option) => select.append(new Option(option, option)));
    select.value = options.includes(current) ? current : "all";
}

function renderProducts() {
    const products = filterProducts(state.products, {
        search: ui.searchInput.value,
        category: ui.categoryFilter.value,
        flavor: ui.flavorFilter.value,
        maxPrice: Number(ui.priceFilter.value)
    });

    ui.productGrid.replaceChildren();

    if (!products.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "Brak produktow dla wybranych filtrow.";
        ui.productGrid.append(empty);
        return;
    }

    products.forEach((product) => ui.productGrid.append(createProductCard(product)));
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";

    if (product.imageUrl) {
        const image = document.createElement("img");
        image.className = "product-img";
        image.src = product.imageUrl;
        image.alt = product.name;
        card.append(image);
    } else {
        const shot = document.createElement("div");
        shot.className = `product-shot shot-${product.imageIndex}`;
        shot.setAttribute("role", "img");
        shot.setAttribute("aria-label", product.name);
        card.append(shot);
    }

    const title = document.createElement("h3");
    title.textContent = product.name;

    const meta = document.createElement("div");
    meta.className = "product-meta";
    meta.append(textSpan(product.category), textSpan(`${product.flavors.length} flavors`));

    const flavors = document.createElement("div");
    flavors.className = "flavor-list";
    product.flavors.slice(0, 3).forEach((flavor) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = flavor;
        flavors.append(chip);
    });

    const stock = document.createElement("div");
    stock.className = "stock-line";
    const price = document.createElement("strong");
    price.className = "price";
    price.textContent = formatPrice(product.price);
    const stockText = document.createElement("span");
    stockText.className = product.stock <= 8 ? "stock low" : "stock";
    stockText.textContent = product.stock ? `Stock ${product.stock}` : "Sold out";
    stock.append(price, stockText);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.type = "button";
    button.textContent = "Add to cart";
    button.disabled = product.stock <= 0;
    button.addEventListener("click", () => {
        addToCart(product);
        renderCart();
        showToast(`${product.name} dodany do koszyka.`);
    });

    card.append(title, meta, flavors, stock, button);
    return card;
}

function renderCart() {
    const totalSpent = getTotalSpent(state.user);
    const vipLevel = getVipLevel(totalSpent);
    const summary = calculateCart(vipLevel);

    ui.cartCount.textContent = String(getCartCount());
    ui.cartVipNote.textContent = `${vipLevel.name} discount: ${Math.round(vipLevel.discount * 100)}%`;
    ui.cartSubtotal.textContent = formatPrice(summary.subtotal);
    ui.cartDiscount.textContent = `-${formatPrice(summary.discount)}`;
    ui.cartTotal.textContent = formatPrice(summary.total);
    ui.cartItems.replaceChildren();

    if (!summary.items.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "Koszyk jest pusty.";
        ui.cartItems.append(empty);
        return;
    }

    summary.items.forEach((item) => ui.cartItems.append(createCartItem(item)));
}

function createCartItem(item) {
    const row = document.createElement("div");
    row.className = "cart-item";

    const head = document.createElement("div");
    head.className = "cart-line";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = item.name;
    const flavors = document.createElement("p");
    flavors.textContent = item.flavors.slice(0, 2).join(", ");
    titleWrap.append(title, flavors);
    const price = document.createElement("strong");
    price.textContent = formatPrice(item.price * item.quantity);
    head.append(titleWrap, price);

    const controls = document.createElement("div");
    controls.className = "cart-line";
    const qty = document.createElement("div");
    qty.className = "qty-controls";
    const minus = smallButton("-", () => {
        changeQuantity(item.id, -1);
        renderCart();
    });
    const amount = document.createElement("span");
    amount.textContent = String(item.quantity);
    const plus = smallButton("+", () => {
        changeQuantity(item.id, 1);
        renderCart();
    });
    qty.append(minus, amount, plus);

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
        removeFromCart(item.id);
        renderCart();
    });
    controls.append(qty, remove);

    row.append(head, controls);
    return row;
}

function renderProfile() {
    if (!state.user) return;

    const totalSpent = getTotalSpent(state.user);
    const vipLevel = getVipLevel(totalSpent);
    const orders = getUserOrders(state.user);

    ui.profileName.textContent = state.user.name || state.user.email;
    ui.profileVip.textContent = `${vipLevel.name} (${Math.round(vipLevel.discount * 100)}%)`;
    ui.profileSpent.textContent = formatPrice(totalSpent);
    ui.purchaseHistory.replaceChildren();

    if (!orders.length) {
        const empty = document.createElement("div");
        empty.className = "history-item";
        empty.textContent = "Brak zakupow demo.";
        ui.purchaseHistory.append(empty);
        return;
    }

    orders.forEach((order) => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = `${new Date(order.date).toLocaleString()} | ${formatPrice(order.total)} | ${order.items.length} items`;
        ui.purchaseHistory.append(item);
    });
}

function renderVip() {
    const totalSpent = getTotalSpent(state.user);
    const vipLevel = getVipLevel(totalSpent);
    ui.vipStatus.textContent = `${vipLevel.name} | ${Math.round(vipLevel.discount * 100)}% | ${formatPrice(totalSpent)} spent`;

    document.querySelectorAll(".vip-card").forEach((card) => {
        card.dataset.active = card.dataset.level === vipLevel.name ? "true" : "false";
    });
}

function renderAdminProducts() {
    ui.adminProductList.replaceChildren();
    state.products.forEach((product) => {
        const item = document.createElement("div");
        item.className = "admin-item";

        const title = document.createElement("strong");
        title.textContent = product.name;
        const meta = document.createElement("span");
        meta.textContent = `${product.category} | ${formatPrice(product.price)} | stock ${product.stock}`;

        const actions = document.createElement("div");
        actions.className = "admin-item-actions";
        const edit = document.createElement("button");
        edit.className = "btn btn-ghost";
        edit.type = "button";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => fillProductForm(product));
        const remove = document.createElement("button");
        remove.className = "btn btn-ghost";
        remove.type = "button";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
            state.products = deleteProduct(state.products, product.id);
            saveProducts(state.products);
            renderFilters();
            renderProducts();
            renderAdminProducts();
            showToast("Produkt usuniety.");
        });
        actions.append(edit, remove);
        item.append(title, meta, actions);
        ui.adminProductList.append(item);
    });
}

function renderOrders() {
    ui.ordersList.replaceChildren();
    const orders = getUserOrders(state.user);

    if (!orders.length) {
        const empty = document.createElement("div");
        empty.className = "order-item";
        empty.textContent = "Brak zamowien demo dla obecnego konta.";
        ui.ordersList.append(empty);
        return;
    }

    orders.forEach((order) => {
        const item = document.createElement("div");
        item.className = "order-item";
        item.textContent = `${order.userEmail} | ${formatPrice(order.total)} | ${new Date(order.date).toLocaleString()}`;
        ui.ordersList.append(item);
    });
}

function fillProductForm(product) {
    ui.productId.value = product.id;
    ui.productName.value = product.name;
    ui.productCategory.value = product.category;
    ui.productFlavors.value = product.flavors.join(", ");
    ui.productPrice.value = product.price;
    ui.productStock.value = product.stock;
    ui.productImage.value = product.imageUrl || "";
    ui.productName.focus();
}

function resetProductForm() {
    ui.productForm.reset();
    ui.productId.value = "";
}

function refreshUi() {
    const admin = isAdmin(state.user);
    ui.accountBtn.textContent = state.user ? state.user.name : "Konto";
    ui.adminPanel.hidden = !admin;
    ui.adminNavBtn.hidden = !admin;
    renderCart();
    renderVip();
    renderProfile();
    renderAdminProducts();
    renderOrders();
}

function handleAccountClick() {
    if (!state.user) {
        openModal("authModal");
        return;
    }

    renderProfile();
    openModal("profileModal");
}

function openCart() {
    ui.cartDrawer.classList.add("open");
    ui.cartDrawer.setAttribute("aria-hidden", "false");
    ui.drawerBackdrop.hidden = false;
}

function closeCart() {
    ui.cartDrawer.classList.remove("open");
    ui.cartDrawer.setAttribute("aria-hidden", "true");
    ui.drawerBackdrop.hidden = true;
}

function openModal(id) {
    ui[id].hidden = false;
}

function closeModal(id) {
    ui[id].hidden = true;
}

function closeAllModals() {
    ["authModal", "profileModal", "checkoutModal"].forEach(closeModal);
}

function smallButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function textSpan(text) {
    const span = document.createElement("span");
    span.textContent = text;
    return span;
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    ui.toastRegion.append(toast);
    setTimeout(() => toast.remove(), 3600);
}
