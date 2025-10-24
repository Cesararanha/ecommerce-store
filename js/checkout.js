// /js/checkout.js
document.addEventListener("DOMContentLoaded", () => {
  const userId = DB.getSession()?.userId;
  if (!userId) {
    location.href = "/html/login.html?next=/html/endereco.html";
    return;
  }

  const form = document.querySelector("form");
  if (!form) return;

  // helpers de mensagem (usa $msg se existir; senão, alert)
  const msgError = (m) => (window.$msg?.error ? $msg.error(m) : alert(m));
  const msgWarn = (m) => (window.$msg?.warn ? $msg.warn(m) : alert(m));
  const msgFlash = (m, t = "success") =>
    window.$msg?.flash ? $msg.flash(m, t) : alert(m);

  // Lê o modo: 'checkout' (padrão) ou 'manage' (vindo do perfil)
  const mode =
    (typeof getQueryParam === "function"
      ? getQueryParam("mode")
      : new URL(location.href).searchParams.get("mode")) || "checkout";

  // Preenche endereço salvo, se houver
  const saved = DB.getAddress(userId);
  if (saved) {
    const map = {
      full_name: "full_name",
      phone: "phone",
      cep: "cep",
      state: "state",
      city: "city",
      street: "street",
      number: "number",
      complement: "complement",
      neighborhood: "neighborhood",
    };
    Object.entries(map).forEach(([name]) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el && saved[name] != null) el.value = saved[name];
    });
    const def = form.querySelector('input[name="default"]');
    if (def) def.checked = !!saved.isDefault;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const get = (n) => form.querySelector(`[name="${n}"]`)?.value?.trim() ?? "";
    const address = {
      full_name: get("full_name"),
      phone: get("phone"),
      cep: get("cep"),
      state: get("state"),
      city: get("city"),
      street: get("street"),
      number: get("number"),
      complement: get("complement"),
      neighborhood: get("neighborhood"),
      isDefault: !!form.querySelector('input[name="default"]')?.checked,
    };

    // Regras extras (além do HTML5)
    const cepRe = /^\d{5}-?\d{3}$/;
    if (!cepRe.test(address.cep)) {
      msgError("CEP inválido (ex.: 57035-290)");
      return;
    }
    if (!/^\d+$/.test(address.number)) {
      msgError("Número: informe apenas dígitos.");
      return;
    }

    // Sempre salva o endereço
    DB.setAddress(userId, address);

    // Modo 'manage': veio do perfil -> só salva e volta
    if (mode === "manage") {
      msgFlash("Endereço salvo!", "success"); // aparece no perfil após redirect
      location.href = "/html/perfil.html";
      return;
    }

    // Modo 'checkout': criar pedido a partir do carrinho
    const items = DB.getLegacyCart();
    if (!items.length) {
      msgWarn("Seu carrinho está vazio.");
      location.href = "/html/cart.html";
      return;
    }

    const total = items.reduce(
      (acc, it) => acc + Number(it.price) * Number(it.quantity || 1),
      0
    );
    const order = {
      id: shortId("#"),
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
    msgFlash("Pedido criado com sucesso!", "success"); // aparece na página de pedidos
    location.href = "/html/pedidos.html";
  });
});
