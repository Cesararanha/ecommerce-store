function brl(v) {
  const n = Number(v || 0);
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const session = DB.getSession();
  if (!session?.userId) {
    location.href = "/html/login.html?next=/html/pedidos.html";
    return;
  }

  const list = document.querySelector(".orders-list");
  if (!list) return;

  const orders = DB.getOrders(session.userId);
  if (!orders.length) {
    list.innerHTML = `<p class="account-sub">Você ainda não tem pedidos.</p>`;
    return;
  }

  list.innerHTML = orders
    .map(
      (o) => `
    <div class="order-item">
      <div class="order-id">${o.id}</div>
      <div>${new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
      <div class="order-status ${o.status === "Entregue"
          ? "status-delivered"
          : o.status === "Enviado"
            ? "status-shipped"
            : "status-processing"
        }">${o.status}</div>
      <div>${brl(o.total)}</div>
      <a class="order-link" href="/html/pedido-detalhe.html#${encodeURIComponent(
          o.id
        )}">Ver detalhes</a>

    </div>
  `
    )
    .join("");
});
