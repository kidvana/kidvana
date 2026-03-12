// ═══════════════════════════════════════════════
// MAIN APP — Header, Search, Scroll, Init
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    renderCommonHeader();
    initStickyHeader();
    initMobileMenu();
    initSearch();
    initIntersectionObserver();
    renderFeaturedCategories();
    renderHomeSections();

    // Trigger product fetch after everything is ready
    if (typeof fetchProducts === 'function') {
        fetchProducts();
    }
});

// ── Render Featured Categories on Homepage ──
function renderFeaturedCategories() {
    const container = document.getElementById('featuredCategories');
    if (!container) return;

    const featured = CATEGORIES.slice(0, 8);
    container.innerHTML = featured.map(cat => `
        <div class="category-card" onclick="viewCategory('${cat.id}')">
            <div class="category-icon-box">${cat.icon}</div>
            <span class="category-name">${cat.name}</span>
        </div>
    `).join('');
}

// ── Sticky Header Shadow ──
function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
}

// ── Mobile Menu Toggle ──
function initMobileMenu() {
    console.log('Initializing Mobile Menu...');
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    const closeBtn = document.querySelector('.mobile-sidebar-close');

    if (!hamburger || !sidebar) {
        console.warn('Mobile menu elements missing:', { hamburger: !!hamburger, sidebar: !!sidebar });
        return;
    }

    function toggle() {
        console.log('Toggling sidebar...');
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
    });

    if (overlay) overlay.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', toggle);

    // Auto-close on link click
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            toggle();
        }
    });
}

// ── Search Logic ──
function initSearch() {
    console.log('Initializing Search...');
    const searchInputs = document.querySelectorAll('.search-input');
    const searchBtns = document.querySelectorAll('.search-btn, .search-icon');

    function doSearch(q) {
        if (!q || q.trim().length < 2) return;
        const query = q.trim();
        console.log('Performing search for:', query);
        window.location.href = `category.html?q=${encodeURIComponent(query)}`;
    }

    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch(input.value);
            }
        });
    });

    searchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Find the closest input
            const container = btn.closest('.header-search, .mobile-search') || document;
            const input = container.querySelector('.search-input') || document.querySelector('.search-input');
            if (input) doSearch(input.value);
        });
    });
}

// ── Intersection Observer for animations ──
function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// ── Render Home Page Sections ──
function renderHomeSections() {
    // Best Sellers
    const bestSellersRow = document.getElementById('bestSellers');
    if (bestSellersRow) {
        const products = getProductsByTag('bestseller').slice(0, 12);
        bestSellersRow.innerHTML = products.map(p => createProductCardHTML(p)).join('');
    }

    // Deals
    const dealsRow = document.getElementById('dealsRow');
    if (dealsRow) {
        const products = getProductsByTag('deal').slice(0, 12);
        dealsRow.innerHTML = products.map(p => createProductCardHTML(p)).join('');
    }

    // Trending
    const trendingGrid = document.getElementById('trendingGrid');
    if (trendingGrid) {
        const products = getProductsByTag('trending').slice(0, 8);
        trendingGrid.innerHTML = products.map(p => createProductCardHTML(p)).join('');
    }

    // Kids Fashion
    const kidsRow = document.getElementById('kidsRow');
    if (kidsRow) {
        const products = getProductsByCategory('baby-kids').slice(0, 10);
        kidsRow.innerHTML = products.map(p => createProductCardHTML(p)).join('');
    }

    // Toys & Games
    const toysRow = document.getElementById('toysRow');
    if (toysRow) {
        const products = getProductsByCategory('toys').slice(0, 10);
        toysRow.innerHTML = products.map(p => createProductCardHTML(p)).join('');
    }
}

// ── Render Featured Categories on Homepage ──
// CATEGORIES is defined in products.js

// ── Render Common Header Navigation ──
function renderCommonHeader() {
    const navContainers = document.querySelectorAll('.category-nav-list');
    const mobileNav = document.querySelector('.mobile-sidebar-nav');

    // Get current category from URL for active state
    const params = new URLSearchParams(window.location.search);
    const currentCat = params.get('cat');

    const navHTML = CATEGORIES.map(cat => `
        <li class="category-nav-item">
            <a href="category.html?cat=${cat.id}" class="${cat.id === currentCat ? 'active' : ''}">
                <span class="cat-icon">${cat.icon}</span> ${cat.name}
            </a>
        </li>
    `).join('');

    navContainers.forEach(container => {
        container.innerHTML = navHTML;
    });

    if (mobileNav) {
        mobileNav.innerHTML = `
            <a href="index.html" class="${!currentCat ? 'active' : ''}"><span class="nav-icon">🏠</span> Home</a>
            ${CATEGORIES.map(cat => `
                <a href="category.html?cat=${cat.id}" class="${cat.id === currentCat ? 'active' : ''}">
                    <span class="nav-icon">${cat.icon}</span> ${cat.name}
                </a>
            `).join('')}
            <a href="cart.html"><span class="nav-icon">🛒</span> My Cart</a>
            <a href="dashboard.html"><span class="nav-icon">👤</span> My Profile</a>
        `;
    }
}

// ── Navigate to Product ──
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// ── Navigate to Category ──
function viewCategory(categoryId) {
    window.location.href = `category.html?cat=${categoryId}`;
}
