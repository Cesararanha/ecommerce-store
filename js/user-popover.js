(function () {
  const trigger = document.querySelector('[data-profile-trigger]');
  if (!trigger) return;

  let pop, hideTimer, open = false;

  function ensurePopover() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'profile-popover';
    Object.assign(pop.style, {
      position: 'absolute',
      zIndex: 9999,
      minWidth: '220px',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 10px 24px rgba(0,0,0,.12)',
      padding: '12px',
      visibility: 'hidden',
      opacity: 0,
      transition: 'opacity .15s ease, visibility .15s ease',
    });
    pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    pop.addEventListener('mouseleave', scheduleHide);
    document.body.appendChild(pop);
    return pop;
  }

  function render() {
    const s = DB.getSession();
    if (s?.userId) {
      const u = DB.users().find(x => x.id === s.userId);
      ensurePopover().innerHTML = `
        <div style="margin-bottom:8px;">
          <div style="font-weight:600">${u?.firstName || ''} ${u?.lastName || ''}</div>
          <div style="font-size:12px;color:#666">${u?.email || ''}</div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="/html/perfil.html" class="btn-mini">Perfil</a>
          <a href="/html/pedidos.html" class="btn-mini">Meus pedidos</a>
          <a href="#" data-logout class="btn-mini">Sair</a>
        </div>`;
    } else {
      ensurePopover().innerHTML = `
        <div style="margin-bottom:8px;">Você não está logado.</div>
        <div style="display:flex; gap:8px;">
          <a href="/html/login.html" class="btn-mini">Entrar</a>
          <a href="/html/cadastro.html" class="btn-mini">Cadastrar</a>
        </div>`;
    }
  }

  function place() {
    const rect = trigger.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX - 100 + rect.width / 2;
    Object.assign(ensurePopover().style, { top: `${top}px`, left: `${left}px` });
  }

  function show() {
    open = true;
    clearTimeout(hideTimer);
    render();
    place();
    ensurePopover().style.visibility = 'visible';
    ensurePopover().style.opacity = '1';
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      open = false;
      if (pop) {
        pop.style.opacity = '0';
        pop.style.visibility = 'hidden';
      }
    }, 300);
  }

  trigger.addEventListener('mouseenter', show);
  trigger.addEventListener('mouseleave', scheduleHide);
  trigger.addEventListener('click', (e) => { e.preventDefault(); open ? scheduleHide() : show(); });
  window.addEventListener('scroll', () => { if (open) place(); }, true);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-logout]');
    if (!a) return;
    e.preventDefault();
    DB.clearSession();
    if (pop) { pop.style.opacity = '0'; pop.style.visibility = 'hidden'; }
    location.reload();
  });
})();
