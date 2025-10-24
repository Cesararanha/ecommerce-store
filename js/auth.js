// /js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  const onSignup = !!document.querySelector("#cad-email");
  const onLogin = !!document.querySelector("#login-email");

  if (onSignup) bindSignup(form);
  if (onLogin) bindLogin(form);
});

// helpers de mensagem (usa $msg se existir; senão, alert)
function err(msg) {
  return window.$msg?.error ? $msg.error(msg) : alert(msg);
}
function flashOk(msg) {
  return window.$msg?.flash ? $msg.flash(msg, "success") : alert(msg);
}

function nextOr(fallback) {
  const n = getQueryParam?.("next");
  return n && /^\/[\w\-\/.]+$/.test(n) ? n : fallback;
}

function bindSignup(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const firstName = document.querySelector("#first-name")?.value?.trim();
    const lastName = document.querySelector("#last-name")?.value?.trim();
    const email = document.querySelector("#cad-email")?.value?.trim();
    const pass = document.querySelector("#cad-pass")?.value ?? "";
    const pass2 = document.querySelector("#cad-pass2")?.value ?? "";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return err("E-mail inválido.");
    if (pass.length < 8) return err("A senha deve ter no mínimo 8 caracteres.");
    if (pass !== pass2) return err("As senhas não conferem.");
    if (DB.findUserByEmail(email)) return err("E-mail já cadastrado.");

    const user = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      firstName,
      lastName,
      email,
      passHash: await hashPassword(pass),
      createdAt: new Date().toISOString(),
    };
    DB.upsertUser(user);
    DB.setSession(user.id);

    // toast pós-redirect
    flashOk("Conta criada com sucesso!");
    location.href = nextOr("/html/pedidos.html");
  });
}

function bindLogin(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const email = document.querySelector("#login-email")?.value?.trim();
    const pass = document.querySelector("#login-pass")?.value ?? "";
    const user = DB.findUserByEmail(email || "");
    if (!user) return err("Usuário não encontrado.");

    const passHash = await hashPassword(pass);
    if (user.passHash !== passHash) return err("Senha inválida.");

    DB.setSession(user.id);

    // toast pós-redirect
    flashOk("Login realizado!");
    location.href = nextOr("/html/pedidos.html");
  });
}
