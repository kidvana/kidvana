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
            <div class="quick-view-grid">
                <div class="quick-view-media" style="background:${product.color}">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="quick-view-details">
                    <div class="quick-view-brand">${product.brand}</div>
                    <h2 class="quick-view-title">${product.name}</h2>
                    
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-primary font-bold">${product.rating}</span>
                        <span class="stars" style="color:#FFD700">${getStarsHTML(product.rating)}</span>
                        <span class="text-gray-400 text-sm">(${product.reviews.toLocaleString()} verified reviews)</span>
                    </div>

                    <div class="quick-view-price-box">
                        <div style="font-size:2rem; font-weight:900; color:var(--gray-900);">₹${product.price.toLocaleString()}</div>
                        <div style="font-size:1rem; color:var(--gray-500);">
                            MRP <span style="text-decoration:line-through;">₹${product.mrp.toLocaleString()}</span> 
                            <span style="color:#10B981; font-weight:700; margin-left:8px;">${discount}% OFF</span>
                        </div>
                    </div>

                    <p style="color:var(--gray-600); line-height:1.7; margin-bottom:40px;">${product.description || 'Experience the perfect blend of quality and design with this premium selection.'}</p>
                    
                    <div style="display:flex; gap:16px; margin-top:auto;">
                        <button class="btn btn-primary" style="flex:1; height:56px;" onclick="addToCart('${product.id}'); closeQuickView();">
                            Add to Cart
                        </button>
                        <button class="btn btn-secondary" style="flex:1; height:56px;" onclick="buyNow(event, '${product.id}')">
                            Buy Now
                        </button>
                        <a href="product.html?id=${product.id}" class="btn btn-outline" style="flex:1; height:56px; display:flex; align-items:center; justify-content:center;">
                            View Details
                        </a>
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
