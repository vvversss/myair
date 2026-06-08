import { formatPrice } from "./products.js";
import { MYAIR_CONFIG } from "./config.js";

const CART_KEY = "myair.cart";
const ORDERS_KEY = "myair.orders";

export const VIP_LEVELS = [
    { name: "Bronze", min: 0, max: 199, discount: 0 },
    { name: "Silver", min: 200, max: 499, discount: 0.05 },
    { name: "Gold", min: 500, max: 999, discount: 0.10 },
    { name: "Diamond", min: 1000, max: Infinity, discount: 0.15 }
];

// Keep live payments blocked by default. Set legalComplianceConfirmed only after real legal review.
export const PAYMENT_CONFIG = {
    ...MYAIR_CONFIG.stripe
};

export function getCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            flavors: product.flavors,
            quantity: 1
        });
    }

    saveCart(cart);
    return cart;
}

export function changeQuantity(productId, delta) {
    const next = getCart()
        .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
        .filter((item) => item.quantity > 0);

    saveCart(next);
    return next;
}

export function removeFromCart(productId) {
    const next = getCart().filter((item) => item.id !== productId);
    saveCart(next);
    return next;
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}

export function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateCart(vipLevel = VIP_LEVELS[0]) {
    const items = getCart();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.round(subtotal * vipLevel.discount);
    const total = Math.max(0, subtotal - discount);

    return { items, subtotal, discount, total, vipLevel };
}

export function getOrders() {
    try {
        const parsed = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function getUserOrders(user) {
    if (!user) return [];
    return getOrders().filter((order) => order.userId === user.id);
}

export function getTotalSpent(user) {
    return getUserOrders(user).reduce((sum, order) => sum + order.total, 0);
}

export function getVipLevel(totalSpent) {
    return VIP_LEVELS.find((level) => totalSpent >= level.min && totalSpent <= level.max) || VIP_LEVELS[0];
}

export function saveDemoOrder(user, summary) {
    const orders = getOrders();
    const order = {
        id: `order-${Date.now().toString(36)}`,
        userId: user.id,
        userEmail: user.email,
        date: new Date().toISOString(),
        items: summary.items,
        subtotal: summary.subtotal,
        discount: summary.discount,
        total: summary.total,
        vipLevel: summary.vipLevel.name,
        status: "demo-paid-test"
    };

    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
    clearCart();
    return order;
}

export async function beginStripeCheckout(summary, user) {
    const paymentConfig = getPaymentConfig();

    if (!paymentConfig.legalComplianceConfirmed) {
        return {
            status: "blocked",
            message: `Stripe test checkout is prepared for ${formatPrice(summary.total)}, but real payment flow is intentionally blocked until legal compliance is confirmed.`
        };
    }

    if (paymentConfig.testPaymentLink) {
        window.open(paymentConfig.testPaymentLink, "_blank", "noopener,noreferrer");
        return { status: "redirected", message: "Opened Stripe test payment link." };
    }

    if (paymentConfig.checkoutSessionEndpoint && paymentConfig.stripePublishableKey && window.Stripe) {
        const response = await fetch(paymentConfig.checkoutSessionEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: "test",
                user,
                items: summary.items,
                subtotal: summary.subtotal,
                discount: summary.discount,
                total: summary.total
            })
        });
        const data = await response.json();
        const stripe = window.Stripe(paymentConfig.stripePublishableKey);
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
        return { status: "redirected", message: "Redirecting to Stripe test checkout." };
    }

    return {
        status: "not-configured",
        message: "Stripe test mode is not connected yet. Add a test Payment Link or checkout-session endpoint after legal compliance is verified."
    };
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getPaymentConfig() {
    return {
        ...PAYMENT_CONFIG,
        ...(window.MYAIR_STRIPE || {})
    };
}
