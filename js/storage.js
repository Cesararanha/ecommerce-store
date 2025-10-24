// /js/storage.js
const DB = (() => {
  const K = {
    USERS: "serenne:users",
    SESSION: "serenne:session",
    ADDRESSES: "serenne:addresses", // Record<userId, Address>
    ORDERS: "serenne:orders", // Record<userId, Order[]>
    // O seu carrinho atual (legacy) fica em "cartItems"
    CART_LEGACY: "cartItems",
  };

  const read = (k, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ===== Users
  const users = () => read(K.USERS, []);
  const saveUsers = (arr) => write(K.USERS, arr);
  const findUserByEmail = (email) =>
    users().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  const upsertUser = (u) => {
    const all = users();
    const i = all.findIndex((x) => x.id === u.id);
    if (i >= 0) all[i] = u;
    else all.push(u);
    saveUsers(all);
    return u;
  };

  // ===== Session
  const getSession = () => read(K.SESSION, null);
  const setSession = (userId) =>
    write(K.SESSION, { userId, createdAt: new Date().toISOString() });
  const clearSession = () => localStorage.removeItem(K.SESSION);
  const requireAuth = (redirect = "/html/login.html") => {
    const s = getSession();
    if (!s?.userId) location.href = redirect;
    return s?.userId;
  };

  // ===== Address (1 por usuário)
  const getAddresses = () => read(K.ADDRESSES, {});
  const getAddress = (userId) => getAddresses()[userId] ?? null;
  const setAddress = (userId, addr) => {
    const all = getAddresses();
    all[userId] = addr;
    write(K.ADDRESSES, all);
    return addr;
  };

  // ===== Orders
  const getOrders = (userId) => read(K.ORDERS, {})[userId] ?? [];
  const addOrder = (userId, order) => {
    const all = read(K.ORDERS, {});
    all[userId] = [order, ...(all[userId] ?? [])];
    write(K.ORDERS, all);
    return order;
  };

  // ===== Cart (compat com seu main.js)
  const getLegacyCart = () => read(K.CART_LEGACY, []);
  const setLegacyCart = (items) => write(K.CART_LEGACY, items);
  const clearLegacyCart = () => write(K.CART_LEGACY, []);

  return {
    K,
    users,
    findUserByEmail,
    upsertUser,
    getSession,
    setSession,
    clearSession,
    requireAuth,
    getAddress,
    setAddress,
    getOrders,
    addOrder,
    getLegacyCart,
    setLegacyCart,
    clearLegacyCart,
    getOrderById(userId, orderId) {
      return (
        (read("serenne:orders", {})[userId] ?? []).find(
          (o) => o.id === orderId
        ) || null
      );
    },
    updateUser(u) {
      return this.upsertUser(u);
    },
  };
})();

// Hash simples (MVP) — NÃO usar assim em produção
async function hashPassword(pwd) {
  const bytes = new TextEncoder().encode(pwd);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ID curto de pedido
function shortId(prefix = "#") {
  return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Util de querystring (?next=/html/endereco.html)
function getQueryParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

DB.deleteAddress = (userId) => {
  const all = JSON.parse(localStorage.getItem("serenne:addresses") || "{}");
  delete all[userId];
  localStorage.setItem("serenne:addresses", JSON.stringify(all));
};
