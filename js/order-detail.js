// /js/order-detail.js
document.addEventListener("DOMContentLoaded", () => {
  const session = DB.getSession();
  if (!session?.userId) {
    location.href =
      "/html/login.html?next=/html/pedido-detalhe.html" + location.search;
    return;
  }

  const params = new URLSearchParams(location.search);
  const id = location.hash?.slice(1) || params.get("id");

  if (!id) {
    document.querySelector(".order-detail").innerHTML =
      "<p>Pedido não encontrado.</p>";
    return;
  }

  const order = DB.getOrderById(session.userId, id);
  const wrap = document.querySelector(".order-detail");
  if (!order) {
    wrap.innerHTML = "<p>Pedido não encontrado.</p>";
    return;
  }

  const addr = order.shipTo || {};
  const itens = order.items || [];
  const itemsHtml = itens
    .map(
      (it) => `
    <li class="order-product">
      ${
        it.image ? `<img src="${it.image}" alt="${it.name}" class="thumb">` : ""
      }
      <div class="info">
        <div class="name">${it.name}</div>
        <div class="meta">Qtd: ${it.qty ?? 1} • Preço: ${Number(
        it.price
      ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
      </div>
    </li>
  `
    )
    .join("");

  wrap.innerHTML = `
    <div class="order-head">
      <h2>Pedido ${order.id}</h2>
      <div class="muted">Realizado em ${new Date(
        order.createdAt
      ).toLocaleString("pt-BR")}</div>
      <div class="status"><strong>Status:</strong> ${order.status}</div>
      <div class="total"><strong>Total:</strong> ${Number(
        order.total
      ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
    </div>

    <h3>Itens</h3>
    <ul class="order-products">${itemsHtml}</ul>

    <h3>Entrega</h3>
    <div class="address">
      <div>${addr.full_name || ""}${addr.phone ? " • " + addr.phone : ""}</div>
      <div>${addr.street || ""}, ${addr.number || ""}${
    addr.complement ? " - " + addr.complement : ""
  }</div>
      <div>${addr.neighborhood || ""}</div>
      <div>${addr.city || ""} - ${addr.state || ""}</div>
      <div>CEP ${addr.cep || ""}</div>
    </div>
  `;
});
