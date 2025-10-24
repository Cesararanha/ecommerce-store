// /js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
    const userId = DB.getSession()?.userId;
    if (!userId) {
        // garante login neste passo também (acesso direto a /endereco.html)
        location.href = '/html/login.html?next=/html/endereco.html';
        return;
    }

    const form = document.querySelector('form');
    if (!form) return;

    // Preencher com endereço salvo, se houver
    const saved = DB.getAddress(userId);
    if (saved) {
        const map = {
            full_name: 'full_name', phone: 'phone', cep: 'cep', state: 'state', city: 'city',
            street: 'street', number: 'number', complement: 'complement', neighborhood: 'neighborhood'
        };
        Object.entries(map).forEach(([name]) => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && saved[name] != null) el.value = saved[name];
        });
        const def = form.querySelector('input[name="default"]');
        if (def) def.checked = !!saved.isDefault;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const get = (n) => form.querySelector(`[name="${n}"]`)?.value?.trim() ?? '';
        const address = {
            full_name: get('full_name'),
            phone: get('phone'),
            cep: get('cep'),
            state: get('state'),
            city: get('city'),
            street: get('street'),
            number: get('number'),
            complement: get('complement'),
            neighborhood: get('neighborhood'),
            isDefault: !!form.querySelector('input[name="default"]')?.checked
        };

        // validação mínima
        const required = ['full_name', 'cep', 'state', 'city', 'street', 'number'];
        if (required.some(k => !address[k])) {
            alert('Preencha os campos obrigatórios do endereço.');
            return;
        }

        DB.setAddress(userId, address);

        const items = DB.getLegacyCart();
        if (!items.length) {
            alert('Seu carrinho está vazio.');
            location.href = '/html/pedidos.html';
            return;
        }

        const total = items.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity || 1), 0);
        const order = {
            id: shortId('#'),
            createdAt: new Date().toISOString(),
            status: 'Processando',
            total,
            // normaliza itens do seu main.js
            items: items.map(it => ({
                name: it.name, price: Number(it.price), qty: Number(it.quantity || 1), image: it.image
            })),
            shipTo: address
        };

        DB.addOrder(userId, order);
        DB.clearLegacyCart(); // esvazia carrinho (compat com seu main.js)

        alert('Pedido criado com sucesso!');
        location.href = '/html/pedidos.html';
    });
});
