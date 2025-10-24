document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach((form) => wireFormValidation(form));
});

function wireFormValidation(form) {
  if (!form) return;

  const emailMsg = "Informe um e-mail válido (ex.: nome@dominio.com).";
  const requiredMsg = "Preencha este campo.";
  const cepMsg = "CEP inválido (ex.: 57035-290).";
  const ufMsg = "UF deve ter 2 letras (ex.: AL).";
  const numMsg = "Informe apenas números.";
  const pwdMsg = "As senhas não conferem.";

  const show = (input, msg) => {
    try {
      input.setCustomValidity(msg || "");
    } catch (_) { }
  };
  const clear = (input) => {
    try {
      input.setCustomValidity("");
    } catch (_) { }
  };

  form.addEventListener(
    "invalid",
    (e) => {
      const input = e.target;
      if (!input || !(input instanceof HTMLElement)) return;

      if (input.validity.valueMissing) show(input, requiredMsg);
      else if (input.type === "email" && input.validity.typeMismatch)
        show(input, emailMsg);
      else if (input.name === "cep" && input.validity.patternMismatch)
        show(input, cepMsg);
      else if (input.name === "state" && input.validity.patternMismatch)
        show(input, ufMsg);
      else if (input.name === "number" && input.validity.patternMismatch)
        show(input, numMsg);
    },
    true
  );

  form.querySelectorAll("input,select,textarea").forEach((el) => {
    el.addEventListener("input", () => clear(el));
    el.addEventListener("change", () => clear(el));
  });

  const pass = form.querySelector("#cad-pass");
  const pass2 = form.querySelector("#cad-pass2");
  const matchPasswords = () => {
    if (!pass || !pass2) return;
    if (pass2.value && pass2.value !== pass.value) show(pass2, pwdMsg);
    else clear(pass2);
  };
  pass?.addEventListener("input", matchPasswords);
  pass2?.addEventListener("input", matchPasswords);

  const cep = form.querySelector('[name="cep"], #cep');
  if (cep) {
    cep.setAttribute("pattern", "\\d{5}-?\\d{3}");
    cep.setAttribute("inputmode", "numeric");
    cep.addEventListener("input", () => {
      const only = cep.value.replace(/\D/g, "").slice(0, 8);
      cep.value = only.replace(/^(\d{5})(\d{0,3})$/, (m, a, b) =>
        b ? `${a}-${b}` : a
      );
      clear(cep);
    });
  }

  const uf = form.querySelector('[name="state"], #state');
  if (uf) {
    uf.setAttribute("pattern", "[A-Za-z]{2}");
    uf.setAttribute("maxlength", "2");
    uf.addEventListener("input", () => {
      uf.value = uf.value
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2);
      clear(uf);
    });
  }

  const num = form.querySelector('[name="number"], #number');
  if (num) {
    num.setAttribute("pattern", "\\d+");
    num.setAttribute("inputmode", "numeric");
    num.addEventListener("input", () => {
      num.value = num.value.replace(/\D/g, "");
      clear(num);
    });
  }

  // Garante required em e-mails
  form.querySelectorAll('input[type="email"]').forEach((email) => {
    email.required = true;
  });

  form.addEventListener("submit", (e) => {
    matchPasswords();

    if (!form.checkValidity()) {
      e.preventDefault();
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid && firstInvalid.reportValidity) {
        firstInvalid.reportValidity();
        firstInvalid.focus?.();
      }
      return;
    }
  });
}
