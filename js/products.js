// Product catalog and storefront filtering

const CATEGORIES = [
    { id: 'baby-kids', name: 'Kids Fashion', icon: '<i class="ph-duotone ph-baby"></i>' },
    { id: 'toys', name: 'Toys & Games', icon: '<i class="ph-duotone ph-game-controller"></i>' },
    { id: 'fashion', name: 'Women Fashion', icon: '<i class="ph-duotone ph-dress"></i>' },
    { id: 'electronics', name: 'Electronics', icon: '<i class="ph-duotone ph-headphones"></i>' },
    { id: 'kitchen', name: 'Kitchen & Home', icon: '<i class="ph-duotone ph-cooking-pot"></i>' },
    { id: 'health', name: 'Health & Wellness', icon: '<i class="ph-duotone ph-heartbeat"></i>' },
    { id: 'sports', name: 'Sports & Fitness', icon: '<i class="ph-duotone ph-basketball"></i>' }
];

const MEGA_NAV_SECTIONS = {
    'baby-kids': {
        description: 'Infant essentials, occasionwear, and nursery-ready picks for every milestone.',
        spotlight: {
            title: 'Festive Kidswear',
            subtitle: 'Soft fabrics, premium finishing, and ready-to-gift looks.',
            image: 'assets/kids-fashion/K01.jpeg',
            href: 'category.html?cat=baby-kids'
        },
        groups: [
            {
                title: 'Baby Essentials',
                links: [
                    { label: 'Everyday Playwear', href: 'category.html?search=playwear' },
                    { label: 'Toddler Comfort Sets', href: 'category.html?search=toddler' },
                    { label: 'New Parent Picks', href: 'category.html?cat=baby-kids' }
                ]
            },
            {
                title: 'Occasion Looks',
                links: [
                    { label: 'Party Dresses', href: 'category.html?search=party' },
                    { label: 'Sherwani Sets', href: 'category.html?search=sherwani' },
                    { label: 'Ethnic Kurtas', href: 'category.html?search=kurta' }
                ]
            },
            {
                title: 'Popular Shopping',
                links: [
                    { label: 'Best Sellers', href: 'category.html?search=bestseller' },
                    { label: 'Budget Under Rs.999', href: 'category.html?cat=baby-kids' },
                    { label: 'View All Kids Fashion', href: 'category.html?cat=baby-kids' }
                ]
            }
        ]
    },
    toys: {
        description: 'Learning toys, pretend play, building sets, and gifts that keep kids engaged longer.',
        spotlight: {
            title: 'Activity Toys',
            subtitle: 'Smart, sensory, and creative play ideas for every age group.',
            image: 'assets/toys/T 04.jpg',
            href: 'category.html?cat=toys'
        },
        groups: [
            {
                title: 'Learning & STEM',
                links: [
                    { label: 'Puzzle Blocks', href: 'category.html?search=puzzle' },
                    { label: 'Educational Toys', href: 'category.html?search=educational' },
                    { label: 'Creative Builders', href: 'category.html?search=building' }
                ]
            },
            {
                title: 'Infant & Toddler',
                links: [
                    { label: 'Rattle Toys', href: 'category.html?search=rattle' },
                    { label: 'Musical Toys', href: 'category.html?search=musical' },
                    { label: 'Sensory Play', href: 'category.html?search=interactive' }
                ]
            },
            {
                title: 'Popular Categories',
                links: [
                    { label: 'Blocks & Sets', href: 'category.html?search=blocks' },
                    { label: 'Creative Play', href: 'category.html?search=creative' },
                    { label: 'View All Toys', href: 'category.html?cat=toys' }
                ]
            }
        ]
    },
    electronics: {
        description: 'Smart gadgets, kids cameras, and modern accessories with gift-worthy packaging.',
        spotlight: {
            title: 'Next-Gen Gadgets',
            subtitle: 'Tech gifts, playful accessories, and high-demand electronics.',
            image: 'assets/electronics/P 01.jpg',
            href: 'category.html?cat=electronics'
        },
        groups: [
            {
                title: 'Trending Tech',
                links: [
                    { label: 'Smart Accessories', href: 'category.html?search=smart' },
                    { label: 'Kids Cameras', href: 'category.html?search=camera' },
                    { label: 'Gaming Finds', href: 'category.html?search=video' }
                ]
            },
            {
                title: 'Gift Picks',
                links: [
                    { label: 'Birthday Gadgets', href: 'category.html?cat=electronics' },
                    { label: 'Premium Combos', href: 'category.html?search=tech' },
                    { label: 'Fast Delivery', href: 'category.html?cat=electronics' }
                ]
            },
            {
                title: 'Shop Electronics',
                links: [
                    { label: 'Featured Deals', href: 'category.html?search=deal' },
                    { label: 'Top Rated Tech', href: 'category.html?cat=electronics' },
                    { label: 'View All Electronics', href: 'category.html?cat=electronics' }
                ]
            }
        ]
    },
    sports: {
        description: 'Indoor games, active play, and sporty gifts for school-age kids and families.',
        spotlight: {
            title: 'Move & Play',
            subtitle: 'Fitness and sports gear that turns screen time into play time.',
            image: 'assets/toys/T 03.jpg',
            href: 'category.html?cat=sports'
        },
        groups: [
            {
                title: 'Outdoor Fun',
                links: [
                    { label: 'Active Play', href: 'category.html?cat=sports' },
                    { label: 'Family Games', href: 'category.html?search=games' },
                    { label: 'Weekend Picks', href: 'category.html?cat=sports' }
                ]
            },
            {
                title: 'Skill Builders',
                links: [
                    { label: 'Board & Puzzle Games', href: 'category.html?search=board' },
                    { label: 'Coordination Toys', href: 'category.html?search=learning' },
                    { label: 'Smart Challenges', href: 'category.html?search=smart' }
                ]
            },
            {
                title: 'Shop Sports',
                links: [
                    { label: 'Budget Picks', href: 'category.html?cat=sports' },
                    { label: 'Gift for Kids', href: 'category.html?search=gift' },
                    { label: 'View All Sports', href: 'category.html?cat=sports' }
                ]
            }
        ]
    }
};

const AGE_GROUPS = [
    {
        title: '0-2 Years',
        caption: 'Soft-touch essentials and sensory-friendly products for infants.',
        href: 'category.html?cat=baby-kids',
        icon: '<i class="ph-duotone ph-baby"></i>'
    },
    {
        title: '3-5 Years',
        caption: 'Musical toys, pretend play, and colorful early-learning gifts.',
        href: 'category.html?search=musical',
        icon: '<i class="ph-duotone ph-palette"></i>'
    },
    {
        title: '6-8 Years',
        caption: 'Building sets, puzzles, and smart activity toys that teach through play.',
        href: 'category.html?search=building',
        icon: '<i class="ph-duotone ph-puzzle-piece"></i>'
    },
    {
        title: '9-12 Years',
        caption: 'Tech accessories, hobby toys, and gifts for growing curiosity.',
        href: 'category.html?cat=electronics',
        icon: '<i class="ph-duotone ph-laptop"></i>'
    }
];

const HOME_FAQS = [
    {
        question: 'Why is Kidvana built like a full ecommerce store now?',
        answer: 'The homepage, cart, checkout, dashboard, order tracking, policy pages, and support flow are now wired to behave like a complete retail storefront instead of static demo pages.'
    },
    {
        question: 'Can customers track orders after checkout?',
        answer: 'Yes. Every placed order is saved for dashboard history, order-success details, and the public Track Order page using order ID plus phone number.'
    },
    {
        question: 'Does the site support COD and online payment?',
        answer: 'Yes. Cash on Delivery works directly, and online checkout can launch Shiprocket Checkout when the live API credentials are configured.'
    },
    {
        question: 'Can I use this structure for toys, baby products, and gift categories together?',
        answer: 'Yes. The navigation, filters, homepage merchandising blocks, and support pages are designed to handle multi-category retail similar to Toyfort.'
    }
];

const FALLBACK_PRODUCTS = [
    {
        id: '69f83282b0d95cc83f5ccb94',
        _id: '69f83282b0d95cc83f5ccb94',
        name: 'Classic Ethnic Wear Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1299,
        mrp: 1999,
        image: 'assets/kids-fashion/K01.jpeg',
        images: ['assets/kids-fashion/K01.jpeg', 'assets/kids-fashion/K01.2.jpeg'],
        rating: 4.9,
        reviews: 156,
        tags: ['new', 'festival', 'bestseller'],
        color: '#FFE4E1',
        description: 'Vibrant ethnic wear set, perfect for festive celebrations and special occasions.'
    },
    {
        id: '69f83282b0d95cc83f5ccb95',
        _id: '69f83282b0d95cc83f5ccb95',
        name: 'Designer Kurta Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 899,
        mrp: 1499,
        image: 'assets/kids-fashion/K02.jpeg',
        images: ['assets/kids-fashion/K02.jpeg', 'assets/kids-fashion/K02.1.jpeg', 'assets/kids-fashion/K02.2.jpeg'],
        rating: 4.6,
        reviews: 92,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        description: 'Stylish and soft cotton kurta set for everyday comfort and small gatherings.'
    },
    {
        id: '69f83282b0d95cc83f5ccb96',
        _id: '69f83282b0d95cc83f5ccb96',
        name: 'Festive Party Dress',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1599,
        mrp: 2499,
        image: 'assets/kids-fashion/K03.jpeg',
        images: ['assets/kids-fashion/K03.jpeg', 'assets/kids-fashion/K03.1.jpeg'],
        rating: 4.8,
        reviews: 110,
        tags: ['party', 'elegant', 'trending'],
        color: '#FFF9C4',
        description: 'Elegant party dress featuring premium fabric and comfortable fit for kids.'
    },
    {
        id: '69f83282b0d95cc83f5ccb97',
        _id: '69f83282b0d95cc83f5ccb97',
        name: 'Toddler Playwear Set',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 499,
        mrp: 999,
        image: 'assets/kids-fashion/K04.jpeg',
        images: ['assets/kids-fashion/K04.jpeg', 'assets/kids-fashion/K04.1.jpeg', 'assets/kids-fashion/K04.2.jpeg'],
        rating: 4.5,
        reviews: 240,
        tags: ['daily', 'soft', 'deal'],
        color: '#E8F5E9',
        description: 'Breathable and soft cotton playwear set for toddlers, ideal for all-day play.'
    },
    {
        id: '69f83282b0d95cc83f5ccb98',
        _id: '69f83282b0d95cc83f5ccb98',
        name: 'Traditional Sherwani',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1899,
        mrp: 3499,
        image: 'assets/kids-fashion/K05.jpeg',
        images: ['assets/kids-fashion/K05.jpeg', 'assets/kids-fashion/K05.1.jpeg'],
        rating: 4.9,
        reviews: 74,
        tags: ['royal', 'premium', 'bestseller'],
        color: '#F3E5F5',
        description: 'Exquisite traditional sherwani set for a royal touch to festive celebrations.'
    },
    {
        id: '69f83282b0d95cc83f5ccb99',
        _id: '69f83282b0d95cc83f5ccb99',
        name: 'Casual Western Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 799,
        mrp: 1499,
        image: 'assets/kids-fashion/K06.jpeg',
        images: ['assets/kids-fashion/K06.jpeg', 'assets/kids-fashion/K06.2.jpeg', 'assets/kids-fashion/K06.3.jpeg'],
        rating: 4.6,
        reviews: 88,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        description: 'Comfortable and stylish western wear set for kids everyday casual outings.'
    },
    {
        id: '69f83282b0d95cc83f5ccb9a',
        _id: '69f83282b0d95cc83f5ccb9a',
        name: 'Floral Print Dress',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 699,
        mrp: 1299,
        image: 'assets/kids-fashion/K07.jpeg',
        images: ['assets/kids-fashion/K07.jpeg', 'assets/kids-fashion/K07.2.jpeg', 'assets/kids-fashion/K07.3.jpeg', 'assets/kids-fashion/K07.4.jpeg'],
        rating: 4.7,
        reviews: 134,
        tags: ['floral', 'trending', 'deal'],
        color: '#FCE4EC',
        description: 'Beautiful floral print dress for girls, perfect for summer and spring occasions.'
    },
    {
        id: '69f83282b0d95cc83f5ccb9b',
        _id: '69f83282b0d95cc83f5ccb9b',
        name: 'Baby Boy Festive Suit',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1399,
        mrp: 2499,
        image: 'assets/kids-fashion/K08.jpeg',
        images: ['assets/kids-fashion/K08.jpeg', 'assets/kids-fashion/K08.1.jpeg', 'assets/kids-fashion/K08.2.jpeg'],
        rating: 4.8,
        reviews: 96,
        tags: ['party', 'elegant', 'bestseller'],
        color: '#E3F2FD',
        description: 'Dapper festive suit for baby boys, ideal for weddings and special celebrations.'
    },
    {
        id: '69f83282b0d95cc83f5ccb9c',
        _id: '69f83282b0d95cc83f5ccb9c',
        name: 'Premium Cotton Kurta',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 999,
        mrp: 1799,
        image: 'assets/kids-fashion/K09.jpeg',
        images: ['assets/kids-fashion/K09.jpeg', 'assets/kids-fashion/K09.2.jpeg', 'assets/kids-fashion/K09.3.jpeg', 'assets/kids-fashion/K09.4.jpeg'],
        rating: 4.7,
        reviews: 112,
        tags: ['premium', 'bestseller'],
        color: '#FFF8E1',
        description: 'Premium pure cotton kurta for kids, breathable and perfect for daily ethnic wear.'
    },
    {
        id: '69f83282b0d95cc83f5ccb9d',
        _id: '69f83282b0d95cc83f5ccb9d',
        name: 'Embroidered Party Wear',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1699,
        mrp: 2999,
        image: 'assets/kids-fashion/K10.jpeg',
        images: ['assets/kids-fashion/K10.jpeg', 'assets/kids-fashion/K10.1.jpeg', 'assets/kids-fashion/K10.2.jpeg'],
        rating: 4.9,
        reviews: 68,
        tags: ['party', 'premium', 'trending'],
        color: '#F3E5F5',
        description: 'Beautifully embroidered party wear for kids, crafted for special occasions.'
    },
    {
        id: '69f83282b0d95cc83f5ccb9e',
        _id: '69f83282b0d95cc83f5ccb9e',
        name: 'Summer Shorts Set',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 599,
        mrp: 999,
        image: 'assets/kids-fashion/K11.jpeg',
        images: ['assets/kids-fashion/K11.jpeg', 'assets/kids-fashion/K11.1.jpeg', 'assets/kids-fashion/K11.2.jpeg'],
        rating: 4.5,
        reviews: 178,
        tags: ['casual', 'daily', 'deal'],
        color: '#E8F5E9',
        description: 'Light and comfortable summer shorts set for active kids who love to play.'
    },
    {
        id: '69f83282b0d95cc83f5ccb9f',
        _id: '69f83282b0d95cc83f5ccb9f',
        name: 'Interactive Learning Toy',
        brand: 'SmartPlay',
        category: 'toys',
        price: 349,
        mrp: 699,
        image: 'assets/toys/T 01.jpg',
        images: ['assets/toys/T 01.jpg', 'assets/toys/T 02.jpg', 'assets/toys/T 03.jpg'],
        rating: 4.7,
        reviews: 312,
        tags: ['learning', 'interactive', 'deal'],
        color: '#FFECB3',
        description: 'Engaging learning toy designed to improve sensory development and motor skills.'
    }
];

function enrichProduct(product, index = 0) {
    const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 12;
    const tags = Array.isArray(product.tags) ? product.tags : [];

    return {
        ...product,
        id: product.id || product._id || `fallback-${index}`,
        tags,
        stock,
        inStock: product.inStock !== false && stock > 0,
        expressDelivery: typeof product.expressDelivery === 'boolean' ? product.expressDelivery : Number(product.price) >= 799,
        rating: Number(product.rating || 0) || 4.5,
        reviews: Number(product.reviews || 0),
        image: product.image || '',
        images: Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean)
    };
}

let PRODUCTS = FALLBACK_PRODUCTS.map(enrichProduct);

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                PRODUCTS = data.map(enrichProduct);
            } else {
                PRODUCTS = FALLBACK_PRODUCTS.map(enrichProduct);
            }
        } else {
            PRODUCTS = FALLBACK_PRODUCTS.map(enrichProduct);
        }
    } catch (err) {
        PRODUCTS = FALLBACK_PRODUCTS.map(enrichProduct);
    } finally {
        if (typeof renderHomeSections === 'function') renderHomeSections();
        if (typeof renderCategoryPage === 'function') renderCategoryPage();
        document.dispatchEvent(new CustomEvent('productsLoaded', { detail: PRODUCTS }));
    }
}

function getCategoryDisplayName(categoryId) {
    const names = {
        'baby-kids': 'Kids Fashion',
        'toys': 'Toys & Games',
        'fashion': 'Women Fashion',
        'electronics': 'Electronics',
        'kitchen': 'Kitchen & Home',
        'health': 'Health & Wellness',
        'sports': 'Sports & Fitness'
    };
    return names[categoryId] || categoryId;
}

function getBaseCategoryProducts() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('cat');
    const searchTerm = params.get('q') || params.get('search');

    let filteredProducts = PRODUCTS.slice();

    if (categoryId) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryId);
        const titleEl = document.getElementById('categoryTitle');
        if (titleEl) titleEl.textContent = getCategoryDisplayName(categoryId);
    } else if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (Array.isArray(product.tags) && product.tags.some(tag => String(tag).toLowerCase().includes(query))) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
        const titleEl = document.getElementById('categoryTitle');
        if (titleEl) titleEl.textContent = `Search: "${searchTerm}"`;
    } else {
        const titleEl = document.getElementById('categoryTitle');
        if (titleEl) titleEl.textContent = 'All Products';
    }

    return filteredProducts;
}

function getCategoryFilterState() {
    return {
        priceRanges: Array.from(document.querySelectorAll('[data-filter="price"]:checked')).map(input => input.value),
        requireInStock: Boolean(document.querySelector('[data-filter="availability"][value="in-stock"]')?.checked),
        requireExpress: Boolean(document.querySelector('[data-filter="availability"][value="express-delivery"]')?.checked),
        sortBy: document.getElementById('sortProducts')?.value || 'featured'
    };
}

function applyCategoryFilters(products) {
    const { priceRanges, requireInStock, requireExpress, sortBy } = getCategoryFilterState();
    let filteredProducts = products.slice();

    if (priceRanges.length) {
        filteredProducts = filteredProducts.filter(product => {
            return priceRanges.some(range => {
                if (range === 'under-500') return product.price < 500;
                if (range === '500-1000') return product.price >= 500 && product.price <= 1000;
                if (range === '1000-2500') return product.price > 1000 && product.price <= 2500;
                if (range === 'over-2500') return product.price > 2500;
                return true;
            });
        });
    }

    if (requireInStock) {
        filteredProducts = filteredProducts.filter(product => product.inStock !== false);
    }

    if (requireExpress) {
        filteredProducts = filteredProducts.filter(product => product.expressDelivery);
    }

    if (sortBy === 'price-low') filteredProducts.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filteredProducts.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'discount') filteredProducts.sort((a, b) => getDiscount(b.mrp, b.price) - getDiscount(a.mrp, a.price));

    return filteredProducts;
}

function initCategoryControls() {
    const controls = document.querySelectorAll('[data-filter], #sortProducts, #clearCategoryFilters');
    if (!controls.length) return;

    controls.forEach(control => {
        if (control.dataset.bound === 'true') return;
        control.dataset.bound = 'true';

        const eventName = control.tagName === 'BUTTON' ? 'click' : 'change';
        control.addEventListener(eventName, (event) => {
            if (control.id === 'clearCategoryFilters') {
                event.preventDefault();
                document.querySelectorAll('[data-filter="price"], [data-filter="availability"]').forEach(input => {
                    input.checked = input.value === 'in-stock';
                });
                const sortSelect = document.getElementById('sortProducts');
                if (sortSelect) sortSelect.value = 'featured';
            }

            renderCategoryPage();
        });
    });
}

document.addEventListener('DOMContentLoaded', initCategoryControls);

function renderCategoryPage() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;

    const filteredProducts = applyCategoryFilters(getBaseCategoryProducts());
    const countEl = document.getElementById('categoryCount');
    if (countEl) countEl.textContent = `${filteredProducts.length} items found`;

    if (!filteredProducts.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <div style="font-size:3rem;margin-bottom:16px">No results</div>
                <h3>No products found</h3>
                <p style="color:var(--gray-500);margin:8px 0 20px">Try adjusting your filters or search.</p>
                <a href="index.html" class="btn btn-primary">Back to Home</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(createProductCardHTML).join('');
}

function getDiscount(mrp, price) {
    return Math.round(((mrp - price) / mrp) * 100);
}

function getProductsByCategory(categoryId) {
    return PRODUCTS.filter(product => product.category === categoryId);
}

function getProductsByTag(tag) {
    return PRODUCTS.filter(product => product.tags && product.tags.includes(tag));
}

function searchProducts(query) {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    return PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        (Array.isArray(product.tags) && product.tags.some(tag => String(tag).toLowerCase().includes(normalizedQuery))) ||
        (product.description && product.description.toLowerCase().includes(normalizedQuery))
    );
}

function getProductById(id) {
    return PRODUCTS.find(product => product.id === id || product._id === id || product.id == id);
}

function getStarsHTML(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    let html = '<div class="star-rating-v2">';
    for (let i = 0; i < full; i += 1) html += '<span class="star-full">&#9733;</span>';
    if (hasHalf) html += '<span class="star-half">&#9733;</span>';
    for (let i = 0; i < empty; i += 1) html += '<span class="star-empty">&#9733;</span>';
    html += '</div>';
    return html;
}

function createProductCardHTML(product) {
    const discount = getDiscount(product.mrp, product.price);
    const tags = Array.isArray(product.tags) ? product.tags : [];
    const badgeTag = tags.includes('deal') ? 'deal' : tags.includes('bestseller') ? 'trending' : tags.includes('trending') ? 'new' : '';
    const badgeText = tags.includes('deal') ? 'Deal' : tags.includes('bestseller') ? 'Best Seller' : tags.includes('trending') ? 'Trending' : '';
    const inWishlist = typeof isInWishlist === 'function' && isInWishlist(product.id);

    return `
        <div class="product-card" data-id="${product.id}" onclick="viewProduct('${product.id}')">
            ${badgeText ? `<span class="card-badge badge badge-${badgeTag}">${badgeText}</span>` : ''}
            <div class="card-actions">
                <button class="card-action-btn card-wishlist ${inWishlist ? 'active' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist('${product.id}')" title="Add to wishlist">
                    ${inWishlist ? '&#10084;' : '&#9825;'}
                </button>
                <button class="card-action-btn quick-view-btn" onclick="event.stopPropagation(); openQuickView('${product.id}')" title="Quick View">
                    &#128065;
                </button>
            </div>
            <div class="card-image" style="background-color:var(--gray-50)">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-body">
                <div class="card-brand">${product.brand}</div>
                <div class="card-title">${product.name}</div>
                <div class="card-rating">
                    <span class="stars">${getStarsHTML(product.rating)}</span>
                    <span class="count">(${product.reviews.toLocaleString()})</span>
                </div>
                <div class="card-pricing">
                    <div class="emi-price">
                        <span class="currency">Rs.</span>
                        <span class="amount">${product.price.toLocaleString()}</span>
                    </div>
                    <div class="original-price">
                        <span class="mrp">Rs.${product.mrp.toLocaleString()}</span>
                        <span class="discount">${discount}% off</span>
                    </div>
                </div>
                <div class="card-footer-actions">
                    <button class="card-add-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                        Add to Cart
                    </button>
                    <button class="card-buy-btn" onclick="event.stopPropagation(); buyNow(event, '${product.id}')">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

