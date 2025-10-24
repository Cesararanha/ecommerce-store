// /js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  const session = DB.getSession();
  if (!session?.userId) {
    location.href = "/html/login.html?next=/html/perfil.html";
    return;
  }

  // carrega usuário
  const user = DB.users().find((u) => u.id === session.userId);
  if (!user) {
    DB.clearSession();
    location.href = "/html/login.html?next=/html/perfil.html";
    return;
  }

  // preenche formulário
  const fn = document.querySelector("#first-name");
  const ln = document.querySelector("#last-name");
  const em = document.querySelector("#email");
  if (fn) fn.value = user.firstName || "";
  if (ln) ln.value = user.lastName || "";
  if (em) em.value = user.email || "";

  // resumo do endereço
  const addrBox = document.querySelector("#addr-summary");
  const addr = DB.getAddress(user.id);
  addrBox.innerHTML = addr
    ? `
    <p>${addr.full_name || ""}${addr.phone ? " • " + addr.phone : ""}</p>
    <p>${addr.street || ""}, ${addr.number || ""}${
        addr.complement ? " - " + addr.complement : ""
      }</p>
    <p>${addr.neighborhood || ""}</p>
    <p>${addr.city || ""} - ${addr.state || ""} • CEP ${addr.cep || ""}</p>
  `
    : "<p>Nenhum endereço cadastrado.</p>";

  // salvar
  const form = document.querySelector("#profile-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = fn?.value?.trim();
    const lastName = ln?.value?.trim();
    const email = em?.value?.trim();
    if (!firstName || !lastName || !email)
      return alert("Preencha todos os campos.");

    // se mudar o e-mail, evitar duplicado
    const exists = DB.findUserByEmail(email);
    if (exists && exists.id !== user.id)
      return alert("Este e-mail já está em uso.");

    const updated = { ...user, firstName, lastName, email };
    DB.updateUser(updated);
    alert("Dados atualizados com sucesso!");
  });
});
