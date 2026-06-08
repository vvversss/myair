const USERS_KEY = "myair.demoUsers";
const SESSION_KEY = "myair.session";

// Fill these values to switch from local demo auth to Supabase Auth.
export const SUPABASE_CONFIG = {
    url: "",
    anonKey: ""
};

export const ADMIN_EMAILS = ["admin@myair.demo"];

let supabaseClient = null;
let authProvider = "local";

export async function initAuth() {
    if (hasSupabaseConfig()) {
        try {
            const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
            supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            authProvider = "supabase";
            const { data } = await supabaseClient.auth.getSession();
            return normalizeSupabaseUser(data.session?.user);
        } catch (error) {
            console.warn("Supabase unavailable, falling back to local demo auth.", error);
        }
    }

    authProvider = "local";
    return getLocalSession();
}

export async function signInOrRegister({ mode, name, email, password }) {
    if (authProvider === "supabase") {
        if (mode === "register") {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { name } }
            });
            if (error) throw error;
            return normalizeSupabaseUser(data.user);
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return normalizeSupabaseUser(data.user);
    }

    return signInLocal({ mode, name, email, password });
}

export async function logout() {
    if (authProvider === "supabase" && supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(user) {
    if (!user) return false;

    // Demo-only client visibility. Production admin access must be enforced server-side or by Supabase RLS.
    return ADMIN_EMAILS.includes(user.email.toLowerCase()) || user.role === "admin";
}

export function getAuthProvider() {
    return authProvider;
}

function hasSupabaseConfig() {
    return SUPABASE_CONFIG.url.startsWith("https://") && SUPABASE_CONFIG.anonKey.length > 20;
}

function signInLocal({ mode, name, email, password }) {
    if (!email || !password || password.length < 6) {
        throw new Error("Podaj e-mail i haslo min. 6 znakow.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = getLocalUsers();
    let user = users[normalizedEmail];

    if (mode === "register" && user) {
        throw new Error("To konto demo juz istnieje.");
    }

    if (!user) {
        user = {
            id: `user-${Date.now().toString(36)}`,
            email: normalizedEmail,
            name: name?.trim() || normalizedEmail.split("@")[0],
            role: ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "customer",
            createdAt: new Date().toISOString()
        };
        users[normalizedEmail] = user;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
}

function getLocalUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    } catch {
        return {};
    }
}

function getLocalSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
        return null;
    }
}

function normalizeSupabaseUser(user) {
    if (!user) return null;

    return {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "MY AIR user",
        role: user.user_metadata?.role || "customer"
    };
}
