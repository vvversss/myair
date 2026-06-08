const PRODUCTS_KEY = "myair.products";

export const DEFAULT_PRODUCTS = [
    {
        id: "nebula-pod",
        name: "MY AIR Nebula Pod",
        category: "Pody",
        price: 179,
        flavors: ["Midnight Blue", "Mint", "Grape Ice"],
        stock: 24,
        imageIndex: 0
    },
    {
        id: "cosmic-kit",
        name: "Cosmic Mod Kit",
        category: "Zestawy",
        price: 399,
        flavors: ["Black Armor", "Space Violet"],
        stock: 9,
        imageIndex: 1
    },
    {
        id: "luna-pod",
        name: "Luna Air Pod",
        category: "Pody",
        price: 159,
        flavors: ["Cool Mint", "Mango", "Berry"],
        stock: 18,
        imageIndex: 2
    },
    {
        id: "blue-razz-liquid",
        name: "Blue Razz Liquid",
        category: "Liquidy",
        price: 59,
        flavors: ["Blue Razz", "Ice"],
        stock: 42,
        imageIndex: 3
    },
    {
        id: "aurora-pod",
        name: "Aurora Slim Pod",
        category: "Pody",
        price: 199,
        flavors: ["Peach", "Mint", "Energy"],
        stock: 15,
        imageIndex: 4
    },
    {
        id: "void-tank",
        name: "Void Pro Tank",
        category: "Akcesoria",
        price: 229,
        flavors: ["Hardware"],
        stock: 6,
        imageIndex: 5
    }
];

export function formatPrice(value) {
    return `${Number(value || 0).toFixed(0)} zl`;
}

export function loadProducts() {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) return [...DEFAULT_PRODUCTS];

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeProduct) : [...DEFAULT_PRODUCTS];
    } catch {
        return [...DEFAULT_PRODUCTS];
    }
}

export function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products.map(normalizeProduct)));
}

export function resetProducts() {
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
