// State
let cart = JSON.parse(localStorage.getItem('aura_cart_v2')) || [];
const IVA_RATE = 0.15;

// Elements
const productGrid = document.getElementById('product-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountBadge = document.getElementById('cart-count');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTaxElement = document.getElementById('cart-tax');
const cartTotalElement = document.getElementById('cart-total');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const checkoutBtn = document.getElementById('checkout-btn');

// Init
document.addEventListener('DOMContentLoaded', () => {
    console.log("AURA: Inicializando con", products.length, "productos.");
    renderProducts(products);
    updateCartUI();
    setupEventListeners();
});

function setupEventListeners() {
    cartToggle.onclick = () => { cartSidebar.classList.remove('translate-x-full'); overlay.classList.remove('hidden'); };
    cartClose.onclick = () => { cartSidebar.classList.add('translate-x-full'); overlay.classList.add('hidden'); };
    overlay.onclick = () => cartClose.onclick();
    checkoutBtn.onclick = generateInvoice;

    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
        );
        renderProducts(filtered);
    };

    if (categoryFilter) {
        categoryFilter.onchange = (e) => {
            const cat = e.target.value;
            const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
            renderProducts(filtered);
        };
    }
}

function renderProducts(list) {
    if (!productGrid) return;
    productGrid.innerHTML = list.map(p => `
        <div class="bg-white p-2 md:p-4 rounded-xl border border-zinc-100 hover:shadow-xl transition-all group flex flex-col">
            <div class="aspect-square mb-2 md:mb-3 overflow-hidden rounded-lg bg-zinc-50 p-2 md:p-4 cursor-pointer relative" onclick="showQuickView(${p.id})">
                <img src="${p.image}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" loading="lazy">
                <div class="absolute top-1 right-1 md:top-2 md:right-2 bg-white/90 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold shadow-sm">AURA Prime</div>
            </div>
            <div class="text-[8px] md:text-[10px] font-black text-orange-600 uppercase mb-0.5 md:mb-1">${p.category}</div>
            <h3 class="font-bold text-[11px] md:text-sm line-clamp-2 mb-1 md:mb-2 h-7 md:h-10 leading-tight">${p.name}</h3>
            <div class="flex items-center gap-1 mb-2 md:mb-4">
                <span class="text-orange-400 text-[10px] md:text-xs font-bold">★ ${p.rating}</span>
                <span class="text-[9px] md:text-xs text-zinc-400">(${p.reviews})</span>
            </div>
            <div class="flex items-center justify-between mt-auto">
                <span class="text-sm md:text-xl font-black">$${p.price.toFixed(2)}</span>
                <button onclick="addToCart(${p.id})" class="bg-[#FFD814] p-1.5 md:p-2.5 rounded-lg hover:bg-black hover:text-white transition-all transform active:scale-90">
                    <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function addToCart(id) {
    const p = products.find(x => x.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...p, quantity: 1 });
    saveCart();
    updateCartUI();
    showToast(`¡Añadido: ${p.name.substring(0, 15)}...!`);
}

function updateQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartUI();
    }
}

function saveCart() { localStorage.setItem('aura_cart_v2', JSON.stringify(cart)); }

function updateCartUI() {
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartCountBadge.innerText = totalItems;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="text-center py-10 text-zinc-400 text-sm">Tu cesta está vacía</div>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(i => `
            <div class="flex gap-2 md:gap-3 items-center bg-zinc-50 p-2 md:p-3 rounded-lg border">
                <img src="${i.image}" class="w-10 h-10 md:w-12 md:h-12 object-contain bg-white rounded">
                <div class="flex-1">
                    <h4 class="text-[10px] md:text-xs font-bold line-clamp-1">${i.name}</h4>
                    <p class="font-black text-xs md:text-sm">$${i.price.toFixed(2)}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <button onclick="updateQuantity(${i.id}, -1)" class="w-5 h-5 bg-white border rounded flex items-center justify-center text-xs">-</button>
                        <span class="text-[10px] md:text-xs font-bold">${i.quantity}</span>
                        <button onclick="updateQuantity(${i.id}, 1)" class="w-5 h-5 bg-white border rounded flex items-center justify-center text-xs">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const sub = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = sub * IVA_RATE;
    const total = sub + tax;

    cartSubtotalElement.innerText = `$${sub.toFixed(2)}`;
    cartTaxElement.innerText = `$${tax.toFixed(2)}`;
    cartTotalElement.innerText = `$${total.toFixed(2)}`;
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    t.style.opacity = '1';
    t.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translate(-50%, 0)'; }, 2000);
}

async function generateInvoice() {
    if (cart.length === 0) return showToast("Cesta vacía");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const invoiceNum = Math.floor(Math.random() * 900000) + 100000;
    
    doc.setFillColor(15, 17, 17); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255); doc.setFontSize(24); doc.text("AURA PREMIUM", 20, 25);
    doc.setFontSize(10); doc.text(`FACTURA: #AURA-${invoiceNum}`, 140, 20);
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 140, 28);

    doc.setTextColor(0); doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.text("EMISOR:", 20, 50); doc.setFont(undefined, 'normal');
    doc.text("AURA CORPORATION S.A. | RUC: 1790000000001", 20, 56);
    doc.text("Dirección: Av. General Enríquez y Rivera - Sangolquí", 20, 62);
    doc.text("Pichincha, Ecuador | Tel: (02) 2345-678", 20, 68);

    const body = cart.map(i => [i.name, i.quantity, `$${i.price.toFixed(2)}`, `$${(i.price * i.quantity).toFixed(2)}`]);
    const sub = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = sub * IVA_RATE;
    const total = sub + tax;

    doc.autoTable({
        startY: 80,
        head: [['Producto', 'Cant.', 'Precio', 'Total']],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [15, 17, 17] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${sub.toFixed(2)}`, 140, finalY);
    doc.text(`IVA (15%): $${tax.toFixed(2)}`, 140, finalY + 7);
    doc.setFont(undefined, 'bold'); doc.setFontSize(12);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 140, finalY + 15);

    doc.save(`Factura_AURA_${invoiceNum}.pdf`);
    cart = []; saveCart(); updateCartUI(); showToast("¡Factura Generada!");
}

function showQuickView(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    
    document.getElementById('modal-img').src = p.image;
    
    const catEl = document.getElementById('modal-cat');
    const catMobEl = document.getElementById('modal-cat-mobile');
    if (catEl) catEl.innerText = p.category;
    if (catMobEl) catMobEl.innerText = p.category;
    
    document.getElementById('modal-name').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.description;
    document.getElementById('modal-price').innerText = `$${p.price.toFixed(2)}`;
    
    const ratingContainer = document.getElementById('modal-rating');
    ratingContainer.innerHTML = `
        <span class="text-orange-400 font-bold">★ ${p.rating}</span>
        <span class="text-zinc-400 text-sm">(${p.reviews} reseñas)</span>
    `;
    
    document.getElementById('modal-add-btn').onclick = () => { addToCart(p.id); closeModal(); };
    document.getElementById('quick-view-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() { 
    document.getElementById('quick-view-modal').classList.add('hidden'); 
    document.body.style.overflow = '';
}
