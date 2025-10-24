let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

function updateLocalStorage() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function updateCartCount() {
  const count = cartItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(count);
}

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

    const qtyHtml = `
      <div class="quantity-controls">
        <button aria-label="Decrease quantity" onclick="changeQuantity('${item.name.replace(
      /'/g,
      "\\'"
    )}', -1)">-</button>
        <input type="text" value="${item.quantity}" readonly />
        <button aria-label="Increase quantity" onclick="changeQuantity('${item.name.replace(
      /'/g,
      "\\'"
    )}', 1)">+</button>
      </div>
    `;

    const removeHtml = `<i class="ri-delete-bin-6-line remove-from-cart" aria-label="Remove ${item.name
      }" role="button" onclick="removeItem('${item.name.replace(
        /'/g,
        "\\'"
      )}')"></i>`;

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

  if (totalElement) totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function addToCart(productCard) {
  const name =
    productCard.querySelector(".product-title")?.textContent?.trim() || "";
  const priceText =
    productCard.querySelector(".product-price")?.textContent?.trim() || "$0";
  const imgSrc = productCard.querySelector(".product-img")?.src || "";

  const normalized = priceText
    .replace(/[^\d.,-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
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

function removeItem(name) {
  cartItems = cartItems.filter((it) => it.name !== name);
  updateLocalStorage();
  updateCartCount();
  if (document.getElementById("cartItems")) displayCartItems();
}

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

function createToastContainer() {
  if (document.getElementById("toast-container")) return;
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);
}

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
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 300);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  if (document.getElementById("cartItems")) displayCartItems();
  createToastContainer();
});
