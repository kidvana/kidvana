// ═══════════════════════════════════════════════
// WISHLIST — Favorites Manager
// ═══════════════════════════════════════════════

const WISHLIST_KEY = 'kidvanaWishlist';

function getWishlist() {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        showToast('Added to wishlist ❤️', 'success');
    }

    saveWishlist(wishlist);
    updateWishlistUI();
    return index === -1; // returns true if added
}

function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

function updateWishlistUI() {
    // Updates heart icons on product cards if they exist on page
    document.querySelectorAll('.card-wishlist').forEach(btn => {
        const productId = btn.getAttribute('data-id');
        if (isInWishlist(productId)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        }
    });

    // Update wishlist counter if it exists (for future header link)
    const count = getWishlist().length;
    const counterBadge = document.querySelector('.wishlist-count');
    if (counterBadge) {
        counterBadge.textContent = count;
        counterBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Initial UI sync
document.addEventListener('DOMContentLoaded', updateWishlistUI);
