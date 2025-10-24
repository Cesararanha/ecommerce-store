// /js/cart.js (substituir tudo)
document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const items = DB.getLegacyCart();
    if (!items || !items.length) {
      $msg.warn("Seu carrinho está vazio.");
      return;
    }

    const session = DB.getSession();
    if (!session?.userId) {
      location.href = "/html/login.html?next=/html/cart.html"; // volta ao carrinho após login
      return;
    }

    const userId = session.userId;
    const address = DB.getAddress(userId);

    if (!address) {
      // Não tem endereço: segue para cadastro de endereço
      location.href = "/html/endereco.html";
      return;
    }

    // Tem endereço: cria o pedido imediatamente
    const total = items.reduce(
      (acc, it) => acc + Number(it.price) * Number(it.quantity || 1),
      0
    );
    const order = {
      id: shortId("ORD-"),
      createdAt: new Date().toISOString(),
      status: "Processando",
      total,
      items: items.map((it) => ({
        name: it.name,
        price: Number(it.price),
        qty: Number(it.quantity || 1),
        image: it.image,
      })),
      shipTo: address,
    };

    DB.addOrder(userId, order);
    DB.clearLegacyCart();

    // Vai direto para o detalhe do pedido
    location.href =
      "/html/pedido-detalhe.html?id=" + encodeURIComponent(order.id);
  });
});
