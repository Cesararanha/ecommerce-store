(function () {
  const RIC = (name) => `<i class="ri-${name}"></i>`;
  const icons = {
    success: "checkbox-circle-line",
    error: "close-circle-line",
    warn: "alert-line",
    info: "information-line",
  };

  function ensureContainer() {
    let c = document.querySelector(".notify-container");
    if (!c) {
      c = document.createElement("div");
      c.className = "notify-container";
      c.setAttribute("aria-live", "polite");
      c.setAttribute("aria-atomic", "true");
      document.body.appendChild(c);
    }
    return c;
  }

  function toast(message, type = "info", { duration = 3000 } = {}) {
    const c = ensureContainer();
    const el = document.createElement("div");
    el.className = `notify-toast ${type}`;
    el.innerHTML = `
      <span class="icon" aria-hidden="true">${RIC(
      icons[type] || icons.info
    )}</span>
      <span class="msg">${message}</span>
      <button class="close" aria-label="Fechar">${RIC("close-line")}</button>
    `;
    c.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    const remove = () => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 180);
    };
    const t = setTimeout(remove, duration);
    el.querySelector(".close").addEventListener("click", () => {
      clearTimeout(t);
      remove();
    });
    return el;
  }

  function overlay() {
    const o = document.createElement("div");
    o.className = "notify-overlay";
    o.innerHTML = `<div role="dialog" aria-modal="true" class="notify-modal"></div>`;
    document.body.appendChild(o);
    requestAnimationFrame(() => o.classList.add("show"));
    return o;
  }

  function modal({
    title = "Atenção",
    message = "",
    actions = [{ label: "OK", value: true }],
  } = {}) {
    return new Promise((resolve) => {
      const o = overlay();
      const m = o.querySelector(".notify-modal");
      m.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="notify-actions">
          ${actions
          .map(
            (a, i) =>
              `<button class="notify-btn ${a.secondary ? "secondary" : ""
              }" data-i="${i}">${a.label}</button>`
          )
          .join("")}
        </div>`;
      const buttons = m.querySelectorAll(".notify-btn");
      const close = (val) => {
        o.classList.remove("show");
        setTimeout(() => o.remove(), 150);
        resolve(val);
      };
      o.addEventListener("click", (e) => {
        if (e.target === o) close(false);
      });
      document.addEventListener("keydown", onEsc);
      function onEsc(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", onEsc);
          close(false);
        }
      }
      buttons.forEach((b, i) =>
        b.addEventListener("click", () => close(actions[i].value))
      );
      buttons[0]?.focus();
    });
  }

  function confirm(
    message,
    {
      okText = "Confirmar",
      cancelText = "Cancelar",
      title = "Confirmação",
    } = {}
  ) {
    return modal({
      title,
      message,
      actions: [
        { label: cancelText, value: false, secondary: true },
        { label: okText, value: true },
      ],
    });
  }
  function alertModal(message, { title = "Atenção", okText = "OK" } = {}) {
    return modal({ title, message, actions: [{ label: okText, value: true }] });
  }

  const FLASH_KEY = "serenne:flash";
  function flash(message, type = "info") {
    localStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
  }
  function showFlash() {
    try {
      const raw = localStorage.getItem(FLASH_KEY);
      if (!raw) return;
      localStorage.removeItem(FLASH_KEY);
      const { message, type } = JSON.parse(raw);
      toast(message, type);
    } catch { }
  }
  document.addEventListener("DOMContentLoaded", showFlash);

  window.Notify = {
    toast,
    success: (m, o) => toast(m, "success", o),
    error: (m, o) => toast(m, "error", o),
    warn: (m, o) => toast(m, "warn", o),
    info: (m, o) => toast(m, "info", o),
    confirm,
    alert: alertModal,
    flash,
  };
  window.$msg = window.Notify;
})();
