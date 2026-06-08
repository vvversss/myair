const PRODUCTS_KEY = "myair.products";
const PRODUCTS_VERSION_KEY = "myair.products.version";
const PRODUCTS_VERSION = "2026-06-08-telegram-products-v2";

const PRODUCT_SEED = [
    { id: "elfliq-cherry-cola", name: "ELFLIQ Cherry Cola 30ml", category: "ELFLIQ", price: 59, flavors: ["Cherry", "Cola"], stock: 24, image: "photo_46_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-strawberry-cherry-lemon", name: "ELFLIQ Strawberry Cherry Lemon 30ml", category: "ELFLIQ", price: 59, flavors: ["Strawberry", "Cherry", "Lemon"], stock: 22, image: "photo_44_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-watermelon-cherry", name: "ELFLIQ Watermelon Cherry 30ml", category: "ELFLIQ", price: 59, flavors: ["Watermelon", "Cherry"], stock: 26, image: "photo_45_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-sour-watermelon-gummy", name: "ELFLIQ Sour Watermelon Gummy 30ml", category: "ELFLIQ", price: 59, flavors: ["Sour Watermelon", "Gummy"], stock: 18, image: "photo_42_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-strawberry-banana", name: "ELFLIQ Strawberry Banana 30ml", category: "ELFLIQ", price: 59, flavors: ["Strawberry", "Banana"], stock: 21, image: "photo_43_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-jasmine-raspberry", name: "ELFLIQ Jasmine Raspberry 30ml", category: "ELFLIQ", price: 59, flavors: ["Jasmine", "Raspberry"], stock: 16, image: "photo_40_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-pink-lemonade-soda", name: "ELFLIQ Pink Lemonade Soda 30ml", category: "ELFLIQ", price: 59, flavors: ["Pink Lemonade", "Soda"], stock: 25, image: "photo_41_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-green-grape-rose", name: "ELFLIQ Green Grape Rose 30ml", category: "ELFLIQ", price: 59, flavors: ["Green Grape", "Rose"], stock: 14, image: "photo_39_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-blueberry-raspberry-pomegranate", name: "ELFLIQ Blueberry Raspberry Pomegranate 30ml", category: "ELFLIQ", price: 59, flavors: ["Blueberry", "Raspberry", "Pomegranate"], stock: 23, image: "photo_37_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-double-apple", name: "ELFLIQ Double Apple 30ml", category: "ELFLIQ", price: 59, flavors: ["Double Apple", "Apple"], stock: 19, image: "photo_35_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-cherry-lemon-peach", name: "ELFLIQ Cherry Lemon Peach 30ml", category: "ELFLIQ", price: 59, flavors: ["Cherry", "Lemon", "Peach"], stock: 20, image: "photo_38_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-apple-pear", name: "ELFLIQ Apple Pear 30ml", category: "ELFLIQ", price: 59, flavors: ["Apple", "Pear"], stock: 17, image: "photo_36_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-blue-razz-ice", name: "ELFLIQ Blue Razz Ice 30ml", category: "ELFLIQ", price: 59, flavors: ["Blue Razz", "Ice"], stock: 28, image: "photo_33_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-blueberry-rose-mint", name: "ELFLIQ Blueberry Rose Mint 30ml", category: "ELFLIQ", price: 59, flavors: ["Blueberry", "Rose", "Mint"], stock: 15, image: "photo_34_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-strawberry-ice", name: "ELFLIQ Strawberry Ice 30ml", category: "ELFLIQ", price: 59, flavors: ["Strawberry", "Ice"], stock: 22, image: "photo_32_2026-06-08_21-48-26.jpg" },
    { id: "elfliq-grape-raisin", name: "ELFLIQ Grape Raisin 30ml", category: "ELFLIQ", price: 59, flavors: ["Grape", "Raisin"], stock: 18, image: "photo_31_2026-06-08_21-48-26.jpg" },
    { id: "hqd-grapey", name: "HQD Grapey 30ml", category: "HQD", price: 55, flavors: ["Grape"], stock: 20, image: "photo_30_2026-06-08_21-48-26.jpg" },
    { id: "hqd-blueberry-lemonade", name: "HQD Blueberry Lemonade 30ml", category: "HQD", price: 55, flavors: ["Blueberry", "Lemonade"], stock: 24, image: "photo_29_2026-06-08_21-48-26.jpg" },
    { id: "hqd-sour-pineapple-ice", name: "HQD Sour Pineapple Ice 30ml", category: "HQD", price: 55, flavors: ["Sour Pineapple", "Ice"], stock: 18, image: "photo_27_2026-06-08_21-48-26.jpg" },
    { id: "hqd-watermelon-ice", name: "HQD Watermelon Ice 30ml", category: "HQD", price: 55, flavors: ["Watermelon", "Ice"], stock: 27, image: "photo_28_2026-06-08_21-48-26.jpg" },
    { id: "hqd-lemon-lime", name: "HQD Lemon Lime 30ml", category: "HQD", price: 55, flavors: ["Lemon", "Lime"], stock: 25, image: "photo_25_2026-06-08_21-48-26.jpg" },
    { id: "hqd-strawberry-raspberry-cherry-ice", name: "HQD Strawberry Raspberry Cherry Ice 30ml", category: "HQD", price: 55, flavors: ["Strawberry", "Raspberry", "Cherry Ice"], stock: 19, image: "photo_26_2026-06-08_21-48-26.jpg" },
    { id: "hqd-blueberry-sour-raspberry", name: "HQD Blueberry Sour Raspberry 30ml", category: "HQD", price: 55, flavors: ["Blueberry", "Sour Raspberry"], stock: 23, image: "photo_23_2026-06-08_21-48-26.jpg" },
    { id: "hqd-cherry-lime-raspberry", name: "HQD Cherry Lime Raspberry 30ml", category: "HQD", price: 55, flavors: ["Cherry", "Lime", "Raspberry"], stock: 21, image: "photo_24_2026-06-08_21-48-26.jpg" },
    { id: "hqd-black-ice", name: "HQD Black Ice 30ml", category: "HQD", price: 55, flavors: ["Black Ice", "Blackberry", "Ice"], stock: 16, image: "photo_21_2026-06-08_21-48-26.jpg" },
    { id: "hqd-blueberry-raspberry", name: "HQD Blueberry Raspberry 30ml", category: "HQD", price: 55, flavors: ["Blueberry", "Raspberry"], stock: 26, image: "photo_22_2026-06-08_21-48-26.jpg" },
    { id: "vozol-purple-candy", name: "VOZOL Purple Candy 30ml", category: "VOZOL", price: 49, flavors: ["Purple Candy", "Grape"], stock: 24, image: "photo_19_2026-06-08_21-48-26.jpg" },
    { id: "hqd-blueberry-cherry-cranberry", name: "HQD Blueberry Cherry Cranberry 30ml", category: "HQD", price: 55, flavors: ["Blueberry", "Cherry", "Cranberry"], stock: 18, image: "photo_20_2026-06-08_21-48-26.jpg" },
    { id: "vozol-pineapple-passion-lime", name: "VOZOL Pineapple Passion Lime 30ml", category: "VOZOL", price: 49, flavors: ["Pineapple", "Passion Fruit", "Lime"], stock: 20, image: "photo_17_2026-06-08_21-48-26.jpg" },
    { id: "vozol-pomegranate-lemonade", name: "VOZOL Pomegranate Lemonade 30ml", category: "VOZOL", price: 49, flavors: ["Pomegranate", "Lemonade"], stock: 22, image: "photo_18_2026-06-08_21-48-26.jpg" },
    { id: "vozol-sour-apple-ice", name: "VOZOL Sour Apple Ice 30ml", category: "VOZOL", price: 49, flavors: ["Sour Apple", "Ice"], stock: 17, image: "photo_15_2026-06-08_21-48-26.jpg" },
    { id: "vozol-perfume-lemon", name: "VOZOL Perfume Lemon 30ml", category: "VOZOL", price: 49, flavors: ["Perfume Lemon", "Lemon"], stock: 15, image: "photo_16_2026-06-08_21-48-26.jpg" },
    { id: "vozol-mint-ice", name: "VOZOL Mint Ice 30ml", category: "VOZOL", price: 49, flavors: ["Mint", "Ice"], stock: 28, image: "photo_13_2026-06-08_21-48-26.jpg" },
    { id: "vozol-peach-ice", name: "VOZOL Peach Ice 30ml", category: "VOZOL", price: 49, flavors: ["Peach", "Ice"], stock: 19, image: "photo_14_2026-06-08_21-48-26.jpg" },
    { id: "vozol-lavafire", name: "VOZOL Lavafire 30ml", category: "VOZOL", price: 49, flavors: ["Lavafire", "Strawberry", "Pineapple"], stock: 16, image: "photo_11_2026-06-08_21-48-26.jpg" },
    { id: "vozol-lemon-lime", name: "VOZOL Lemon Lime 30ml", category: "VOZOL", price: 49, flavors: ["Lemon", "Lime"], stock: 23, image: "photo_12_2026-06-08_21-48-26.jpg" },
    { id: "vozol-grape-ice", name: "VOZOL Grape Ice 30ml", category: "VOZOL", price: 49, flavors: ["Grape", "Ice"], stock: 21, image: "photo_9_2026-06-08_21-48-26.jpg" },
    { id: "vozol-kiwi-passion-fruit-guava", name: "VOZOL Kiwi Passion Fruit Guava 30ml", category: "VOZOL", price: 49, flavors: ["Kiwi", "Passion Fruit", "Guava"], stock: 18, image: "photo_10_2026-06-08_21-48-26.jpg" },
    { id: "vozol-cherry-cola", name: "VOZOL Cherry Cola 30ml", category: "VOZOL", price: 49, flavors: ["Cherry", "Cola"], stock: 26, image: "photo_7_2026-06-08_21-48-26.jpg" },
    { id: "vozol-tropical-fruit-guava", name: "VOZOL Tropical Fruit Guava 30ml", category: "VOZOL", price: 49, flavors: ["Tropical Fruit", "Guava"], stock: 14, image: "photo_8_2026-06-08_21-48-26.jpg" },
    { id: "vozol-blue-razz-lemon", name: "VOZOL Blue Razz Lemon 30ml", category: "VOZOL", price: 49, flavors: ["Blue Razz", "Lemon"], stock: 22, image: "photo_6_2026-06-08_21-48-26.jpg" },
    { id: "vozol-blueberry-raspberry", name: "VOZOL Blueberry Raspberry 30ml", category: "VOZOL", price: 49, flavors: ["Blueberry", "Raspberry"], stock: 25, image: "photo_5_2026-06-08_21-48-26.jpg" },
    { id: "vozol-berry-watermelon", name: "VOZOL Berry Watermelon 30ml", category: "VOZOL", price: 49, flavors: ["Berry", "Watermelon"], stock: 19, image: "photo_4_2026-06-08_21-48-25.jpg" },
    { id: "vozol-berry-peach", name: "VOZOL Berry Peach 30ml", category: "VOZOL", price: 49, flavors: ["Berry", "Peach"], stock: 17, image: "photo_2_2026-06-08_21-48-25.jpg" },
    { id: "vozol-blueberry", name: "VOZOL Blueberry 30ml", category: "VOZOL", price: 49, flavors: ["Blueberry"], stock: 27, image: "photo_3_2026-06-08_21-48-25.jpg" },
    { id: "vozol-berry", name: "VOZOL Berry 30ml", category: "VOZOL", price: 49, flavors: ["Berry", "Blueberry", "Raspberry"], stock: 20, image: "photo_1_2026-06-08_21-48-25.jpg" }
];

export const DEFAULT_PRODUCTS = PRODUCT_SEED.map(({ image, ...product }) => ({
    ...product,
    imageUrl: `assets/products/${image}`
}));

export function formatPrice(value) {
    return `${Number(value || 0).toFixed(0)} zl`;
}

export function loadProducts() {
    const storedVersion = localStorage.getItem(PRODUCTS_VERSION_KEY);
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored || storedVersion !== PRODUCTS_VERSION) {
        localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
        localStorage.removeItem(PRODUCTS_KEY);
        return getDefaultProducts();
    }

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeProduct) : getDefaultProducts();
    } catch {
        return getDefaultProducts();
    }
}

export function saveProducts(products) {
    localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products.map(normalizeProduct)));
}

export function resetProducts() {
    localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
    localStorage.removeItem(PRODUCTS_KEY);
    return loadProducts();
}

export function getFilterOptions(products) {
    const categories = new Set();
    const flavors = new Set();

    products.forEach((product) => {
        categories.add(product.category);
        product.flavors.forEach((flavor) => flavors.add(flavor));
    });

    return {
        categories: [...categories].sort(),
        flavors: [...flavors].sort()
    };
}

export function filterProducts(products, filters) {
    const query = filters.search.trim().toLowerCase();

    return products.filter((product) => {
        const searchMatch = !query
            || product.name.toLowerCase().includes(query)
            || product.category.toLowerCase().includes(query)
            || product.flavors.some((flavor) => flavor.toLowerCase().includes(query));
        const categoryMatch = filters.category === "all" || product.category === filters.category;
        const flavorMatch = filters.flavor === "all" || product.flavors.includes(filters.flavor);
        const priceMatch = product.price <= filters.maxPrice;

        return searchMatch && categoryMatch && flavorMatch && priceMatch;
    });
}

export function upsertProduct(products, payload) {
    const nextProduct = normalizeProduct({
        ...payload,
        id: payload.id || createProductId(payload.name)
    });
    const existingIndex = products.findIndex((product) => product.id === nextProduct.id);

    if (existingIndex >= 0) {
        const copy = [...products];
        copy[existingIndex] = nextProduct;
        return copy;
    }

    return [nextProduct, ...products];
}

export function deleteProduct(products, productId) {
    return products.filter((product) => product.id !== productId);
}

export function createProductId(name) {
    const slug = String(name || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return `${slug || "product"}-${Date.now().toString(36)}`;
}

export function normalizeProduct(product) {
    return {
        id: String(product.id || createProductId(product.name)),
        name: String(product.name || "MY AIR Product"),
        category: String(product.category || "Pody"),
        price: Math.max(0, Number(product.price || 0)),
        flavors: normalizeFlavors(product.flavors),
        stock: Math.max(0, Number.parseInt(product.stock || 0, 10)),
        imageUrl: product.imageUrl ? String(product.imageUrl) : "",
        imageIndex: Number.isFinite(Number(product.imageIndex)) ? Number(product.imageIndex) % 6 : 0
    };
}

function normalizeFlavors(flavors) {
    if (Array.isArray(flavors)) {
        return flavors.map((flavor) => String(flavor).trim()).filter(Boolean);
    }

    return String(flavors || "")
        .split(",")
        .map((flavor) => flavor.trim())
        .filter(Boolean);
}

function getDefaultProducts() {
    return DEFAULT_PRODUCTS.map(normalizeProduct);
}
