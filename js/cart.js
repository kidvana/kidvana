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
    showToast(`${product.name} added to cart!`, 'success');
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
    const amount = Number(product.price || 0) * quantity;
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;

    return {
        userId: String(user?._id || user?.phone || ''),
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
        amount,
        address: {},
        totals: {
            subtotal: amount,
            shipping: 0,
            tax: 0,
            total: amount
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
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css';
        stylesheet.dataset.shiprocketCheckoutStyle = 'true';
        document.head.appendChild(stylesheet);
    }

    if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === 'function') {
        return Promise.resolve();
    }

    const existingScript = document.querySelector('script[data-shiprocket-checkout="true"]');
    if (existingScript) {
        return new Promise((resolve, reject) => {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Shiprocket checkout script failed to load.')), { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
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

async function buyNow(event, productId) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const product = getProductById(productId);
    if (!product) return;

    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (!user?.token) {
        showToast('Please login to continue.', 'error');
        if (typeof openLoginModal === 'function') openLoginModal();
        return;
    }

    const orderInfo = buildInstantOrderInfo(product, 1);
    const checkoutRef = buildShiprocketCheckoutRef();
    const redirectUrl = buildShiprocketRedirectUrl(checkoutRef);

    try {
        ensureShiprocketSellerDomain();
        await ensureShiprocketCheckoutAssets();

        const shiprocketResponse = await createShiprocketAccessToken({
            cart_data: {
                items: orderInfo.items.map(item => ({
                    variant_id: String(item.productId || item.id || ''),
                    quantity: Number(item.quantity || item.qty || 1)
                }))
            },
            redirect_url: redirectUrl
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
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Failed to launch Shiprocket checkout.', 'error');
    }
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

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

// Initialize cart UI on page load
document.addEventListener('DOMContentLoaded', updateCartUI);
