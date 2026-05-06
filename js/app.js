// Main storefront app helpers

document.addEventListener('DOMContentLoaded', () => {
    try { renderCommonHeader(); } catch(e) { console.error(e); }
    try { initScrollRefinements(); } catch(e) { console.error(e); }
    try { initMobileMenu(); } catch(e) { console.error(e); }
    try { initSearch(); } catch(e) { console.error(e); }
    try { initIntersectionObserver(); } catch(e) { console.error(e); }
    try { renderFeaturedCategories(); } catch(e) { console.error(e); }
    try { renderHomeSections(); } catch(e) { console.error(e); }
    try { renderHomeCategoryLinks(); } catch(e) { console.error(e); }
    try { renderAgeShowcase(); } catch(e) { console.error(e); }
    try { renderHomeFaqs(); } catch(e) { console.error(e); }
    try { renderFloatingSupport(); } catch(e) { console.error(e); }
    try { initFaqAccordion(); } catch(e) { console.error(e); }
    try { initStorefrontForms(); } catch(e) { console.error(e); }

    if (typeof fetchProducts === 'function') {
        fetchProducts();
    }
});

function renderFeaturedCategories() {
    const container = document.getElementById('featuredCategories');
    if (!container || typeof CATEGORIES === 'undefined') return;

    const featured = CATEGORIES.slice(0, 8);
    container.innerHTML = featured.map((category, index) => `
        <div class="category-card reveal" style="animation-delay:${index * 0.1}s" onclick="viewCategory('${category.id}')">
            <div class="category-icon-box">${category.icon}</div>
            <span class="category-name">${category.name}</span>
        </div>
    `).join('');
}

function initScrollRefinements() {
    const header = document.querySelector('.header');
    const scrollProgress = document.querySelector('.scroll-progress') || document.createElement('div');
    if (!scrollProgress.parentElement) {
        scrollProgress.className = 'scroll-progress';
        document.body.appendChild(scrollProgress);
    }

    const backToTop = document.querySelector('.back-to-top') || document.createElement('button');
    if (!backToTop.parentElement) {
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '&#8593;';
        backToTop.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTop);
    }

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 20);

        const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = totalScrollable > 0 ? (window.scrollY / totalScrollable) * 100 : 0;
        scrollProgress.style.width = `${scrolled}%`;
        backToTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    const closeButton = document.querySelector('.mobile-sidebar-close');

    if (!hamburger || !sidebar) return;

    function toggleSidebar() {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', (event) => {
        event.preventDefault();
        toggleSidebar();
    });

    if (overlay) overlay.addEventListener('click', toggleSidebar);
    if (closeButton) closeButton.addEventListener('click', toggleSidebar);

    sidebar.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            toggleSidebar();
        }
    });
}

function initSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchButtons = document.querySelectorAll('.search-btn, .search-icon');
    const suggestionBoxes = [];

    function doSearch(queryValue) {
        if (!queryValue || queryValue.trim().length < 2) return;
        window.location.href = `category.html?q=${encodeURIComponent(queryValue.trim())}`;
    }

    function ensureSuggestionBox(input) {
        const container = input.closest('.header-search, .mobile-search, .mobile-search-inner') || input.parentElement;
        if (!container) return null;

        let box = container.querySelector('.search-suggestions');
        if (!box) {
            box = document.createElement('div');
            box.className = 'search-suggestions';
            container.appendChild(box);
        }

        if (!suggestionBoxes.includes(box)) {
            suggestionBoxes.push(box);
        }

        return box;
    }

    function hideSuggestions() {
        suggestionBoxes.forEach(box => {
            box.classList.remove('active');
            box.innerHTML = '';
        });
    }

    searchInputs.forEach(input => {
        const suggestionBox = ensureSuggestionBox(input);

        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                doSearch(input.value);
            }
        });

        input.addEventListener('input', () => {
            if (!suggestionBox || typeof searchProducts !== 'function') return;

            const query = input.value.trim();
            if (query.length < 2) {
                suggestionBox.classList.remove('active');
                suggestionBox.innerHTML = '';
                return;
            }

            const results = searchProducts(query).slice(0, 5);
            if (!results.length) {
                suggestionBox.classList.remove('active');
                suggestionBox.innerHTML = '';
                return;
            }

            suggestionBox.innerHTML = results.map(product => `
                <div class="search-suggestion-item" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" style="width:44px;height:44px;object-fit:cover;border-radius:10px;background:var(--gray-50);">
                    <div style="min-width:0;">
                        <div style="font-weight:700;color:var(--gray-800);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${product.name}</div>
                        <div style="font-size:0.8rem;color:var(--gray-500);">${product.brand} &bull; Rs.${Number(product.price).toLocaleString()}</div>
                    </div>
                </div>
            `).join('');
            suggestionBox.classList.add('active');

            suggestionBox.querySelectorAll('.search-suggestion-item').forEach(item => {
                item.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    const productId = item.getAttribute('data-id');
                    viewProduct(productId);
                });
            });
        });
    });

    searchButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const container = button.closest('.header-search, .mobile-search') || document;
            const input = container.querySelector('.search-input') || document.querySelector('.search-input');
            if (input) doSearch(input.value);
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.header-search') && !event.target.closest('.mobile-search')) {
            hideSuggestions();
        }
    });
}

function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

function renderHomeSections() {
    const bestSellersRow = document.getElementById('bestSellers');
    if (bestSellersRow && typeof getProductsByTag === 'function') {
        bestSellersRow.innerHTML = getProductsByTag('bestseller').slice(0, 12).map(createProductCardHTML).join('');
    }

    const dealsRow = document.getElementById('dealsRow');
    if (dealsRow && typeof getProductsByTag === 'function') {
        dealsRow.innerHTML = getProductsByTag('deal').slice(0, 12).map(createProductCardHTML).join('');
    }

    const trendingGrid = document.getElementById('trendingGrid');
    if (trendingGrid && typeof getProductsByTag === 'function') {
        trendingGrid.innerHTML = getProductsByTag('trending').slice(0, 8).map(createProductCardHTML).join('');
    }

    const kidsRow = document.getElementById('kidsRow');
    if (kidsRow && typeof getProductsByCategory === 'function') {
        kidsRow.innerHTML = getProductsByCategory('baby-kids').slice(0, 10).map(createProductCardHTML).join('');
    }

    const toysRow = document.getElementById('toysRow');
    if (toysRow && typeof getProductsByCategory === 'function') {
        toysRow.innerHTML = getProductsByCategory('toys').slice(0, 10).map(createProductCardHTML).join('');
    }

    renderBrandShowcase();
}

function renderCommonHeader() {
    if (typeof CATEGORIES === 'undefined') return;

    const navContainers = document.querySelectorAll('.category-nav-list');
    const mobileNav = document.querySelector('.mobile-sidebar-nav');
    const params = new URLSearchParams(window.location.search);
    const currentCategory = params.get('cat');

    const navHtml = CATEGORIES.map(category => {
        const section = typeof MEGA_NAV_SECTIONS !== 'undefined' ? MEGA_NAV_SECTIONS[category.id] : null;
        const megaMenu = section ? `
            <div class="mega-menu">
                <div class="mega-menu-grid">
                    <div class="mega-menu-intro">
                        <span class="mega-overline">Featured Department</span>
                        <h4>${category.name}</h4>
                        <p>${section.description}</p>
                        <a href="category.html?cat=${category.id}" class="mega-shop-link">Shop ${category.name}</a>
                    </div>
                    <div class="mega-menu-links">
                        ${section.groups.map(group => `
                            <div class="mega-link-group">
                                <h5>${group.title}</h5>
                                <ul>
                                    ${group.links.map(link => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                    <a href="${section.spotlight.href}" class="mega-menu-spotlight">
                        <img src="${section.spotlight.image}" alt="${section.spotlight.title}">
                        <div class="spotlight-copy">
                            <span class="mega-overline">Hot Pick</span>
                            <strong>${section.spotlight.title}</strong>
                            <span>${section.spotlight.subtitle}</span>
                        </div>
                    </a>
                </div>
            </div>
        ` : '';

        return `
            <li class="category-nav-item ${section ? 'has-mega-menu' : ''}">
                <a href="category.html?cat=${category.id}" class="${category.id === currentCategory ? 'active' : ''}">
                    <span class="cat-icon">${category.icon}</span> ${category.name}
                </a>
                ${megaMenu}
            </li>
        `;
    }).join('');

    navContainers.forEach(container => {
        container.innerHTML = navHtml;
    });

    if (mobileNav) {
        mobileNav.innerHTML = `
            <a href="index.html" class="${!currentCategory ? 'active' : ''}"><span class="nav-icon">&#127968;</span> Home</a>
            ${CATEGORIES.map(category => `
                <a href="category.html?cat=${category.id}" class="${category.id === currentCategory ? 'active' : ''}">
                    <span class="nav-icon">${category.icon}</span> ${category.name}
                </a>
            `).join('')}
            <a href="cart.html" onclick="openCartSidebar(); return false;"><span class="nav-icon">&#128722;</span> My Cart</a>
            <a href="dashboard.html"><span class="nav-icon">&#128100;</span> My Profile</a>
        `;
    }
}

function renderHomeCategoryLinks() {
    const container = document.getElementById('categoryQuickLinks');
    if (!container || typeof MEGA_NAV_SECTIONS === 'undefined') return;

    const html = Object.entries(MEGA_NAV_SECTIONS).map(([categoryId, section]) => `
        <div class="category-link-group">
            <h4>${CATEGORIES.find(category => category.id === categoryId)?.name || categoryId}</h4>
            <ul>
                ${section.groups.flatMap(group => group.links).slice(0, 6).map(link => `
                    <li><a href="${link.href}">${link.label}</a></li>
                `).join('')}
            </ul>
        </div>
    `).join('');

    container.innerHTML = html;
}

function renderBrandShowcase() {
    const container = document.getElementById('brandShowcase');
    if (!container || typeof PRODUCTS === 'undefined') return;

    const brands = [];
    PRODUCTS.forEach(product => {
        if (!product.brand || brands.some(entry => entry.brand === product.brand)) return;
        brands.push({
            brand: product.brand,
            image: product.image,
            href: `category.html?search=${encodeURIComponent(product.brand)}`,
            category: getCategoryDisplayName(product.category)
        });
    });

    container.innerHTML = brands.slice(0, 10).map(brand => `
        <a href="${brand.href}" class="brand-card">
            <img src="${brand.image}" alt="${brand.brand}" class="brand-logo">
            <div class="brand-name">${brand.brand}</div>
            <div class="brand-emi">${brand.category}</div>
        </a>
    `).join('');
}

function renderAgeShowcase() {
    const container = document.getElementById('shopByAgeGrid');
    if (!container || typeof AGE_GROUPS === 'undefined') return;

    container.innerHTML = AGE_GROUPS.map(group => `
        <a href="${group.href}" class="swiper-slide age-card">
            <div class="age-icon">${group.icon}</div>
            <div class="age-copy">
                <strong>${group.title}</strong>
                <p>${group.caption}</p>
            </div>
        </a>
    `).join('');
}

function renderHomeFaqs() {
    const container = document.getElementById('homeFaqAccordion');
    if (!container || typeof HOME_FAQS === 'undefined') return;

    container.innerHTML = HOME_FAQS.map((item, index) => `
        <div class="faq-card ${index === 0 ? 'open' : ''}">
            <button class="faq-question" type="button" aria-expanded="${index === 0 ? 'true' : 'false'}">
                <span>${item.question}</span>
                <span class="faq-toggle">${index === 0 ? '&#8722;' : '&#43;'}</span>
            </button>
            <div class="faq-answer" style="${index === 0 ? 'display:block;' : 'display:none;'}">
                <p>${item.answer}</p>
            </div>
        </div>
    `).join('');
}

function initFaqAccordion() {
    const container = document.getElementById('homeFaqAccordion');
    if (!container || container.dataset.bound === 'true') return;
    container.dataset.bound = 'true';

    container.addEventListener('click', (event) => {
        const button = event.target.closest('.faq-question');
        if (!button) return;

        const card = button.closest('.faq-card');
        if (!card) return;

        const answer = card.querySelector('.faq-answer');
        const toggle = card.querySelector('.faq-toggle');
        const isOpen = card.classList.contains('open');

        container.querySelectorAll('.faq-card').forEach(item => {
            item.classList.remove('open');
            const itemAnswer = item.querySelector('.faq-answer');
            const itemToggle = item.querySelector('.faq-toggle');
            const itemButton = item.querySelector('.faq-question');
            if (itemAnswer) itemAnswer.style.display = 'none';
            if (itemToggle) itemToggle.innerHTML = '&#43;';
            if (itemButton) itemButton.setAttribute('aria-expanded', 'false');
        });

        if (isOpen) return;

        card.classList.add('open');
        if (answer) answer.style.display = 'block';
        if (toggle) toggle.innerHTML = '&#8722;';
        button.setAttribute('aria-expanded', 'true');
    });
}

function renderFloatingSupport() {
    if (document.querySelector('.floating-support')) return;

    const support = document.createElement('a');
    support.className = 'floating-support';
    support.href = 'https://wa.me/918744055175';
    support.target = '_blank';
    support.rel = 'noopener noreferrer';
    support.innerHTML = '<span class="support-icon">&#128172;</span><span class="support-label">Need Help?</span>';
    document.body.appendChild(support);
}

function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function viewCategory(categoryId) {
    window.location.href = `category.html?cat=${categoryId}`;
}

function initStorefrontForms() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
        if (form.dataset.bound === 'true') return;
        form.dataset.bound = 'true';

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput?.value.trim().toLowerCase();
            if (!email) return;

            const subscribers = JSON.parse(localStorage.getItem('kidvanaNewsletterSubscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('kidvanaNewsletterSubscribers', JSON.stringify(subscribers));
            }

            if (emailInput) emailInput.value = '';
            if (typeof showToast === 'function') showToast('You are subscribed for updates.', 'success');
        });
    });

    document.querySelectorAll('form[data-contact-form]').forEach(form => {
        if (form.dataset.bound === 'true') return;
        form.dataset.bound = 'true';

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const message = {
                id: Date.now(),
                name: form.querySelector('[name="name"]')?.value.trim() || '',
                email: form.querySelector('[name="email"]')?.value.trim() || '',
                subject: form.querySelector('[name="subject"]')?.value.trim() || '',
                text: form.querySelector('[name="message"]')?.value.trim() || '',
                createdAt: new Date().toISOString()
            };

            const messages = JSON.parse(localStorage.getItem('kidvanaContactMessages') || '[]');
            messages.unshift(message);
            localStorage.setItem('kidvanaContactMessages', JSON.stringify(messages));
            form.reset();
            if (typeof showToast === 'function') showToast('Message sent. Our team will contact you soon.', 'success');
        });
    });
}

