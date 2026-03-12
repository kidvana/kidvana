// ═══════════════════════════════════════════════
// QUICK VIEW — Modal Product Preview
// ═══════════════════════════════════════════════

function openQuickView(productId) {
    const product = getProductById(productId);
    if (!product) return;

    let modal = document.getElementById('quickViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quickViewModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

    modal.innerHTML = `
        <div class="modal quick-view-modal">
            <button class="modal-close" onclick="closeQuickView()">✕</button>
            <div class="quick-view-content" style="display:grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="quick-view-image" style="background:${product.color}; border-radius: 12px; display:flex; align-items:center; justify-content:center; padding: 20px;">
                    <img src="${product.image}" alt="${product.name}" style="max-height: 260px; object-fit: contain;">
                </div>
                <div class="quick-view-info">
                    <div style="font-size:0.75rem; font-weight:600; color:var(--gray-400); text-transform:uppercase; margin-bottom:4px;">${product.brand}</div>
                    <h2 style="font-size:1.4rem; margin-bottom:12px;">${product.name}</h2>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                        <span style="color:var(--accent-yellow); font-size:0.85rem;">${getStarsHTML(product.rating)}</span>
                        <span style="color:var(--gray-400); font-size:0.75rem;">(${product.reviews.toLocaleString()} reviews)</span>
                    </div>
                    <div style="margin-bottom:20px;">
                        <div style="font-size:1.5rem; font-weight:800; color:var(--primary);">₹${product.price.toLocaleString()}</div>
                        <div style="font-size:0.9rem; color:var(--gray-400);">MRP <span style="text-decoration:line-through;">₹${product.mrp.toLocaleString()}</span> <span style="color:var(--accent-green); font-weight:700;">${discount}% off</span></div>
                    </div>
                    <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.6; margin-bottom:24px;">${product.description || 'Premium quality product with best-in-class features.'}</p>
                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-primary" style="flex:1;" onclick="addToCart('${product.id}'); closeQuickView();">🛒 Add to Cart</button>
                        <a href="product.html?id=${product.id}" class="btn btn-outline" style="flex:1;">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'quickViewModal') {
            closeQuickView();
        }
    });
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
