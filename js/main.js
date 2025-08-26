// Cart state
let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

/** Persist cartItems to localStorage. */
function updateLocalStorage() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

/** Update the cart count badge (#cart-count), if present. */
function updateCartCount() {
    const count = cartItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = String(count);
}

/**
 * Render cart items inside #cartItems and total in #cartTotal.
 * Markup follows the classes expected by style.css (no visual changes intended).
 */
function displayCartItems() {
    const cartContainer = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");
    if (!cartContainer) return;

    cartContainer.innerHTML = "";
    let total = 0;

    cartItems.forEach((item) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        total += itemTotal;

        const el = document.createElement("div");
        el.className = "cart-item";

        // Quantity control (readonly input; UI changes via +/- only)
        const qtyHtml = `
      <div class="quantity-controls">
        <button aria-label="Decrease quantity" onclick="changeQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
        <input type="text" value="${item.quantity}" readonly />
        <button aria-label="Increase quantity" onclick="changeQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
      </div>
    `;

        const removeHtml = `<i class="ri-delete-bin-6-line remove-from-cart" aria-label="Remove ${item.name}" role="button" onclick="removeItem('${item.name.replace(/'/g, "\\'")}')"></i>`;

        el.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-title-price">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
      </div>
      ${qtyHtml}
      ${removeHtml}
    `;

        cartContainer.appendChild(el);
    });

    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

/**
 * Add a product to the cart.
 * Reads .product-title, .product-price, .product-img within the product card.
 * Displays as-is; internal numeric parsing is tolerant to $/R$ and separators.
 */
function addToCart(productCard) {
    const name = productCard.querySelector(".product-title")?.textContent?.trim() || "";
    const priceText = productCard.querySelector(".product-price")?.textContent?.trim() || "$0";
    const imgSrc = productCard.querySelector(".product-img")?.src || "";

    // Robust parse: keep digits, comma, dot; normalize comma to dot and strip thousand separators.
    const normalized = priceText.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
    const price = parseFloat(normalized) || 0;

    const existing = cartItems.find((it) => it.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({ name, price, image: imgSrc, quantity: 1 });
    }

    updateLocalStorage();
    updateCartCount();
    showToast(`${name} added to cart`);
    if (document.getElementById("cartItems")) displayCartItems();
}

/** Remove an item by name. */
function removeItem(name) {
    cartItems = cartItems.filter((it) => it.name !== name);
    updateLocalStorage();
    updateCartCount();
    if (document.getElementById("cartItems")) displayCartItems();
}

/** Increment/decrement quantity by delta (min 1). */
function changeQuantity(name, delta) {
    const item = cartItems.find((it) => it.name === name);
    if (!item) return;
    const next = Math.max(1, (item.quantity || 1) + delta);
    if (next !== item.quantity) {
        item.quantity = next;
        updateLocalStorage();
        updateCartCount();
        if (document.getElementById("cartItems")) displayCartItems();
    }
}

/**
 * Update quantity from direct input change (kept for completeness).
 * Input is readonly by default; if enabled later, this stays safe.
 */
function updateQuantity(name, rawValue) {
    const item = cartItems.find((it) => it.name === name);
    if (!item) return;
    let next = parseInt(String(rawValue).replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(next)) next = item.quantity;
    next = Math.max(1, Math.min(next, 999));
    if (next !== item.quantity) {
        item.quantity = next;
        updateLocalStorage();
        updateCartCount();
        if (document.getElementById("cartItems")) displayCartItems();
    }
}

/** Toast container bootstrap. */
function createToastContainer() {
    if (document.getElementById("toast-container")) return;
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
}

/** Simple toast. */
function showToast(message) {
    createToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    const container = document.getElementById("toast-container");
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("toast-show"), 100);
    setTimeout(() => {
        toast.classList.remove("toast-show");
        setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 300);
    }, 3000);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if (document.getElementById("cartItems")) displayCartItems();
    createToastContainer();
});
