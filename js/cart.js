// ═══════════════════════════════════════════════
// CART SYSTEM — localStorage based
// ═══════════════════════════════════════════════

const CART_KEY = 'kidvana_cart';
const SHIPROCKET_CHECKOUTS_KEY = 'kidvanaShiprocketCheckouts';

// Get cart from localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
    renderCartSidebar();
}

function addItemToCart(productId, qty = 1) {
    const product = getProductById(productId);
    if (!product) return null;

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
            qty
        });
    }

    saveCart(cart);
    return product;
}

// Add item to cart
function addToCart(productId) {
    const product = addItemToCart(productId, 1);
    if (!product) return;
    showToast(`${product.name} added to bag!`, 'success');
    openCartSidebar();
}

function buildShiprocketCheckoutRef() {
    return `src_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildShiprocketRedirectUrl(checkoutRef) {
    const redirectUrl = new URL('order-success.html', window.location.href);
    redirectUrl.searchParams.set('checkout', 'shiprocket');
    redirectUrl.searchParams.set('ref', checkoutRef);
    return redirectUrl.toString();
}

function buildInstantOrderInfo(product, quantity = 1) {
    const subtotal = Number(product.price || 0) * quantity;
    const shipping = subtotal >= 1000 ? 0 : 150;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;

    return {
        userId: String(user?._id || user?.phone || 'shiprocket-guest'),
        items: [{
            id: String(product.id || product._id || ''),
            productId: String(product.id || product._id || ''),
            name: product.name,
            brand: product.brand || '',
            price: Number(product.price || 0),
            mrp: Number(product.mrp || 0),
            image: product.image || '',
            qty: quantity,
            quantity
        }],
        amount: total,
        address: {},
        totals: {
            subtotal,
            shipping,
            tax,
            total
        },
        paymentMethod: 'shiprocket'
    };
}

function savePendingShiprocketCheckoutFallback(checkout) {
    if (!checkout?.ref) return;

    try {
        const entries = JSON.parse(localStorage.getItem(SHIPROCKET_CHECKOUTS_KEY)) || {};
        entries[checkout.ref] = {
            ...checkout,
            createdAt: checkout.createdAt || new Date().toISOString()
        };
        localStorage.setItem(SHIPROCKET_CHECKOUTS_KEY, JSON.stringify(entries));
    } catch (err) {
        console.error(err);
    }
}

function persistPendingShiprocketCheckout(checkout) {
    if (typeof savePendingShiprocketCheckout === 'function') {
        savePendingShiprocketCheckout(checkout);
        return;
    }

    savePendingShiprocketCheckoutFallback(checkout);
}

function ensureShiprocketSellerDomain() {
    let field = document.getElementById('sellerDomain');
    if (!field) {
        field = document.createElement('input');
        field.type = 'hidden';
        field.id = 'sellerDomain';
        document.body.appendChild(field);
    }

    field.value = window.location.host;
}

function ensureShiprocketCheckoutAssets() {
    if (!document.querySelector('link[data-shiprocket-checkout-style="true"]')) {
        // No CSS file exists for custom.js currently
    }

    if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === 'function') {
        return Promise.resolve();
    }

    const existingScript = document.querySelector('script[data-shiprocket-checkout="true"]') || document.querySelector('script[src*="checkout-ui.shiprocket.com"]');
    if (existingScript) {
        return new Promise((resolve, reject) => {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Shiprocket checkout script failed to load.')), { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/custom.js';
        script.async = true;
        script.dataset.shiprocketCheckout = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Shiprocket checkout script failed to load.'));
        document.body.appendChild(script);
    });
}

async function createShiprocketAccessToken(payload) {
    const response = await fetch('/api/shiprocket/access-token/checkout', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
    });

    return parseApiResponse(response);
}

// ── Shiprocket Checkout Overlay Helpers (shared) ──
function showSRLoadingOverlay() {
    removeSROverlay();
    const overlay = document.createElement('div');
    overlay.className = 'shiprocket-loading-overlay';
    overlay.id = 'srLoadingOverlay';
    overlay.innerHTML = `
        <div class="shiprocket-loading-spinner"></div>
        <div class="shiprocket-loading-text">Opening Secure Checkout...</div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('sr-checkout-open');
}

function showSRCheckoutWrapper() {
    const loading = document.getElementById('srLoadingOverlay');
    if (loading) loading.remove();
    if (document.getElementById('srCheckoutWrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'shiprocket-checkout-wrapper';
    wrapper.id = 'srCheckoutWrapper';
    wrapper.innerHTML = `<button class="sr-close-btn" onclick="removeSROverlay()" title="Close Checkout">✕</button>`;
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) {
            if (confirm('Are you sure you want to close the checkout?')) {
                removeSROverlay();
            }
        }
    });
    document.body.appendChild(wrapper);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('sr-checkout-open');
}

function removeSROverlay() {
    document.getElementById('srLoadingOverlay')?.remove();
    document.getElementById('srCheckoutWrapper')?.remove();
    document.body.style.overflow = '';
    document.body.classList.remove('sr-checkout-open');
    document.querySelectorAll('iframe[src*="shiprocket"]').forEach(iframe => {
        iframe.remove();
    });
    // Also remove any Shiprocket SDK containers
    document.querySelectorAll('div[id*="shiprocket"], div[class*="headless-checkout"]').forEach(el => {
        el.remove();
    });
}

function forceIframeFullscreen(iframe) {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Force fullscreen on mobile
        iframe.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            min-width: 100vw !important;
            min-height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            transform: none !important;
            z-index: 100000 !important;
            background: #fff !important;
            box-shadow: none !important;
        `;
    } else {
        // Centered modal on desktop
        iframe.style.cssText = `
            position: fixed !important;
            top: 2vh !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: min(480px, 90vw) !important;
            height: 96vh !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 20px !important;
            z-index: 100000 !important;
            background: #fff !important;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
        `;
    }

    // Also force parent containers to not restrict the iframe
    let parent = iframe.parentElement;
    while (parent && parent !== document.body) {
        if (parent.style.position || parent.style.width || parent.style.height) {
            parent.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 99999 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
            `;
        }
        parent = parent.parentElement;
    }
}

function watchForSRIframe() {
    let attempts = 0;
    
    // Use MutationObserver to catch iframe the moment it's added
    const observer = new MutationObserver((mutations) => {
        const iframe = document.querySelector('iframe[src*="shiprocket"]');
        if (iframe) {
            forceIframeFullscreen(iframe);
            showSRCheckoutWrapper();
            
            // Keep re-enforcing styles in case SDK overrides them
            let enforceCount = 0;
            const enforcer = setInterval(() => {
                enforceCount++;
                const el = document.querySelector('iframe[src*="shiprocket"]');
                if (el) {
                    forceIframeFullscreen(el);
                } else {
                    clearInterval(enforcer);
                }
                // Stop after 30 seconds
                if (enforceCount > 60) clearInterval(enforcer);
            }, 500);
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Fallback polling in case MutationObserver misses it
    const watcher = setInterval(() => {
        attempts++;
        const iframe = document.querySelector('iframe[src*="shiprocket"]');
        if (iframe) {
            clearInterval(watcher);
            observer.disconnect();
            forceIframeFullscreen(iframe);
            setTimeout(() => showSRCheckoutWrapper(), 300);
        }
        if (attempts > 30) {
            clearInterval(watcher);
            observer.disconnect();
            const loading = document.getElementById('srLoadingOverlay');
            if (loading) {
                loading.querySelector('.shiprocket-loading-text').textContent = 'Checkout loaded — complete your payment';
                setTimeout(() => loading.remove(), 3000);
            }
        }
    }, 500);
}

async function buyNow(event, productId) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const product = getProductById(productId);
    if (!product) return;

    const orderInfo = buildInstantOrderInfo(product, 1);
    const checkoutRef = buildShiprocketCheckoutRef();
    const redirectUrl = buildShiprocketRedirectUrl(checkoutRef);

    try {
        ensureShiprocketSellerDomain();
        
        // Show loading overlay
        showSRLoadingOverlay();
        
        await ensureShiprocketCheckoutAssets();

        const shiprocketResponse = await createShiprocketAccessToken({
            cart_data: {
                items: orderInfo.items.map(item => ({
                    variant_id: String(item.productId || item.id || ''),
                    quantity: Number(item.quantity || item.qty || 1),
                    price: Number(item.price || 0),
                    title: String(item.name || 'Product'),
                    sku: String(item.productId || item.id || ''),
                    image_url: String(item.image || '')
                }))
            },
            redirect_url: redirectUrl,
            timestamp: Math.floor(Date.now() / 1000),
            seller_domain: window.location.origin
        });

        if (!shiprocketResponse?.token) {
            throw new Error('Shiprocket token was not returned.');
        }

        persistPendingShiprocketCheckout({
            ref: checkoutRef,
            orderId: shiprocketResponse.orderId || '',
            orderInfo,
            redirectUrl,
            source: 'buy-now'
        });

        if (!window.HeadlessCheckout || typeof window.HeadlessCheckout.addToCart !== 'function') {
            throw new Error('Shiprocket checkout is unavailable right now.');
        }

        window.HeadlessCheckout.addToCart(event || window.event, shiprocketResponse.token, {
            fallbackUrl: redirectUrl
        });

        // Watch for iframe to appear
        watchForSRIframe();
    } catch (err) {
        console.error(err);
        removeSROverlay();
        showToast(err.message || 'Failed to launch Shiprocket checkout.', 'error');
    }
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

window.removeItemFromCartGlobally = function(productId) {
    removeFromCart(productId);
    showToast('Item removed from bag', 'info');
};

// Update quantity
function updateQty(productId, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart(cart);
    if (typeof renderCartPage === 'function') renderCartPage();
}

// Get cart count
function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

// Get cart total
function getCartTotal() {
    return getCart().reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// Get cart MRP total
function getCartMRP() {
    return getCart().reduce((sum, item) => sum + (item.mrp * item.qty), 0);
}

// Update cart badge in header
function updateCartUI() {
    updateHeaderCounts();
}

// ── Toast Notification ──
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Wishlist System (Persistent) ──
const WISHLIST_KEY = 'kidvana_wishlist';

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    updateHeaderCounts();
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        showToast('Added to wishlist! ❤️', 'success');
    } else {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist', 'info');
    }
    
    saveWishlist(wishlist);
    
    // Update all matching cards on current page
    document.querySelectorAll(`.product-card[data-id="${productId}"]`).forEach(card => {
        const btn = card.querySelector('.card-wishlist');
        if (btn) {
            const isActive = wishlist.includes(productId);
            btn.classList.toggle('active', isActive);
            btn.innerHTML = isActive ? '❤️' : '🤍';
        }
    });
}

function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

// ── Header Counts (Cart & Wishlist) ──
function updateHeaderCounts() {
    // Update Cart
    const cartCount = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        const oldVal = parseInt(el.textContent) || 0;
        el.textContent = cartCount;
        el.style.display = cartCount > 0 ? 'flex' : 'none';
        
        // Pop animation if increased
        if (cartCount > oldVal) {
            el.classList.remove('pop-anim');
            void el.offsetWidth; // trigger reflow
            el.classList.add('pop-anim');
        }
    });

    // Update Wishlist
    const wishCount = getWishlist().length;
    document.querySelectorAll('.wishlist-count').forEach(el => {
        el.textContent = wishCount;
        el.style.display = wishCount > 0 ? 'flex' : 'none';
    });
}

// ── CART SIDEBAR LOGIC ──
window.openCartSidebar = function() {
    document.getElementById('cartSidebar')?.classList.add('active');
    document.getElementById('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent scroll
    renderCartSidebar();
};

window.closeCartSidebar = function() {
    document.getElementById('cartSidebar')?.classList.remove('active');
    document.getElementById('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
};

function renderCartSidebar() {
    const cart = getCart();
    const content = document.getElementById('cartSidebarContent');
    const footer = document.getElementById('cartSidebarFooter');
    const titleCount = document.querySelector('.cart-count-title');
    
    if (!content) return;

    // Update Title Count
    if (titleCount) titleCount.textContent = `(${getCartCount()} Items)`;

    if (cart.length === 0) {
        content.innerHTML = `
            <div class="cart-empty-state">
                <div class="empty-icon">🛒</div>
                <p>Your bag is empty</p>
                <a href="category.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'block';

    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item-drawer">
                <div class="cart-item-img-wrapper">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <a href="product.html?id=${item.id}" class="cart-item-name">${item.name}</a>
                        <button class="cart-item-remove" onclick="removeItemFromCartGlobally('${item.id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                    <div class="cart-item-brand">${item.brand || 'Kidvana'}</div>
                    <div class="cart-item-price-row">
                        <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                        <div class="qty-control-sm">
                            <button class="qty-btn-sm" onclick="updateQty('${item.id}', -1)">−</button>
                            <span class="qty-val-sm">${item.qty}</span>
                            <button class="qty-btn-sm" onclick="updateQty('${item.id}', 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    content.innerHTML = html;

    // Update Totals
    const subtotalEl = document.querySelector('.cart-subtotal-val');
    if (subtotalEl) {
        subtotalEl.textContent = `₹${getCartTotal().toLocaleString('en-IN')}`;
    }
}

// Attach listener to all cart links (using delegation for dynamic elements)
document.addEventListener('click', (e) => {
    const cartBtn = e.target.closest('a[href="cart.html"]');
    if (cartBtn) {
        // If it's a "Proceed to Checkout" or similar internal cart link, we might want to let it navigate
        // but for the header/sidebar cart icons, we want the drawer.
        // We'll check if it's NOT the checkout button inside the sidebar.
        if (!cartBtn.closest('.cart-sidebar-footer')) {
            e.preventDefault();
            openCartSidebar();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Close on overlay click
    document.getElementById('cartOverlay')?.addEventListener('click', closeCartSidebar);
    
    updateHeaderCounts();
    renderCartSidebar();
});
