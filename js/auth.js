// /js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    const onSignup = !!document.querySelector('#cad-email');
    const onLogin = !!document.querySelector('#login-email');

    if (onSignup) bindSignup(form);
    if (onLogin) bindLogin(form);
});

function nextOr(fallback) {
    const n = getQueryParam('next');
    return n && /^\/[\w\-\/.]+$/.test(n) ? n : fallback;
}

function bindSignup(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.querySelector('#first-name')?.value?.trim();
        const lastName = document.querySelector('#last-name')?.value?.trim();
        const email = document.querySelector('#cad-email')?.value?.trim();
        const pass = document.querySelector('#cad-pass')?.value ?? '';
        const pass2 = document.querySelector('#cad-pass2')?.value ?? '';

        if (!firstName || !lastName || !email) return alert('Preencha todos os campos.');
        if (pass.length < 8) return alert('A senha deve ter no mínimo 8 caracteres.');
        if (pass !== pass2) return alert('As senhas não conferem.');
        if (DB.findUserByEmail(email)) return alert('E-mail já cadastrado.');

        const user = {
            id: crypto.randomUUID?.() ?? String(Date.now()),
            firstName, lastName, email,
            passHash: await hashPassword(pass),
            createdAt: new Date().toISOString()
        };
        DB.upsertUser(user);
        DB.setSession(user.id);

        location.href = nextOr('/html/pedidos.html');
    });
}

function bindLogin(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.querySelector('#login-email')?.value?.trim();
        const pass = document.querySelector('#login-pass')?.value ?? '';
        const user = DB.findUserByEmail(email || '');
        if (!user) return alert('Usuário não encontrado.');

        const passHash = await hashPassword(pass);
        if (user.passHash !== passHash) return alert('Senha inválida.');

        DB.setSession(user.id);
        location.href = nextOr('/html/pedidos.html');
    });
}
