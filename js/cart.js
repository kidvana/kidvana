// ═══════════════════════════════════════════════
// CART SYSTEM — localStorage based
// ═══════════════════════════════════════════════

const CART_KEY = 'kidvana_cart';

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

// Add item to cart
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
            qty: 1
        });
    }

    saveCart(cart);
    showToast(`${product.name} added to cart!`, 'success');
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
    const countEls = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    countEls.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
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

// ── Wishlist (simple toggle) ──
function toggleWishlist(productId, btn) {
    btn.classList.toggle('active');
    const isActive = btn.classList.contains('active');
    btn.innerHTML = isActive ? '♥' : '♡';
    showToast(isActive ? 'Added to wishlist!' : 'Removed from wishlist', isActive ? 'success' : 'info');
}

// Initialize cart UI on page load
document.addEventListener('DOMContentLoaded', updateCartUI);
