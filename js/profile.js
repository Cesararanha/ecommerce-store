// /js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  // ====== Guard de sessão ======
  const session = DB.getSession?.();
  if (!session?.userId) {
    location.href = "/html/login.html?next=/html/perfil.html";
    return;
  }

  // ====== Carrega usuário ======
  const allUsers = DB.users?.() || [];
  let user = allUsers.find((u) => u.id === session.userId);
  if (!user) {
    DB.clearSession?.();
    location.href = "/html/login.html?next=/html/perfil.html";
    return;
  }

  // ====== Refs do DOM ======
  const form = document.getElementById("profile-form");
  const fn = document.getElementById("first-name");
  const ln = document.getElementById("last-name");
  const em = document.getElementById("email");
  const addrBox = document.getElementById("addr-summary");
  const actionsBox = document.getElementById("addr-actions");

  // ====== Wrappers de mensagem (usam $msg se existir) ======
  const info = (m) => (window.$msg?.info ? $msg.info(m) : alert(m));
  const success = (m) => (window.$msg?.success ? $msg.success(m) : alert(m));
  const error = (m) => (window.$msg?.error ? $msg.error(m) : alert(m));
  const askConfirm = (m, opts) =>
    window.$msg?.confirm
      ? $msg.confirm(m, opts)
      : Promise.resolve(window.confirm(m));

  // ====== Preenche formulário ======
  if (fn) fn.value = user.firstName || "";
  if (ln) ln.value = user.lastName || "";
  if (em) em.value = user.email || "";

  // ====== Render do endereço ======
  function renderAddressSummary() {
    const addr = DB.getAddress?.(user.id);
    if (!addr) {
      addrBox.innerHTML = "<p>Nenhum endereço cadastrado.</p>";
      return;
    }
    addrBox.innerHTML = `
      <p>${addr.full_name || ""}${addr.phone ? " • " + addr.phone : ""}</p>
      <p>${addr.street || ""}, ${addr.number || ""}${
      addr.complement ? " - " + addr.complement : ""
    }</p>
      <p>${addr.neighborhood || ""}</p>
      <p>${addr.city || ""} - ${addr.state || ""} • CEP ${addr.cep || ""}</p>
    `;
  }

  // ====== Ações do endereço (dinâmicas) ======
  function wireAddressActions() {
    const addr = DB.getAddress?.(user.id);
    if (!actionsBox) return;

    if (!addr) {
      actionsBox.innerHTML = `
        <a href="/html/endereco.html?mode=manage" class="btn-secondary">Adicionar endereço</a>
      `;
      return;
    }

    actionsBox.innerHTML = `
      <a href="/html/endereco.html?mode=manage" class="btn-secondary">Editar endereço</a>
      <button type="button" id="delete-address" class="btn-secondary danger">Excluir endereço</button>
    `;

    // Excluir endereço (confirm estilizado + fallback)
    const delBtn = document.getElementById("delete-address");
    delBtn?.addEventListener("click", async () => {
      const ok = await askConfirm("Excluir endereço padrão?");
      if (!ok) return;

      if (typeof DB.deleteAddress === "function") {
        DB.deleteAddress(user.id);
      } else {
        // fallback defensivo
        const KEY = "serenne:addresses";
        const all = JSON.parse(localStorage.getItem(KEY) || "{}");
        if (all[user.id]) {
          delete all[user.id];
          localStorage.setItem(KEY, JSON.stringify(all));
        }
      }
      renderAddressSummary();
      wireAddressActions();
      success("Endereço removido.");
    });
  }

  renderAddressSummary();
  wireAddressActions();

  // ====== Salvar perfil (Update) ======
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity?.() || !fn || !ln || !em) {
      form?.reportValidity?.();
      return;
    }

    const firstName = fn.value.trim();
    const lastName = ln.value.trim();
    const email = em.value.trim();

    if (!emailRe.test(email)) {
      error("E-mail inválido.");
      return;
    }

    const exists = DB.findUserByEmail?.(email);
    if (exists && exists.id !== user.id) {
      error("Este e-mail já está em uso.");
      return;
    }

    const updated = { ...user, firstName, lastName, email };
    if (typeof DB.updateUser === "function") DB.updateUser(updated);
    else if (typeof DB.upsertUser === "function") DB.upsertUser(updated);

    user = updated;
    success("Dados atualizados com sucesso!");
  });
});
