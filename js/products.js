// Product catalog and storefront filtering

const CATEGORIES = [
    { id: 'baby-kids', name: 'Kids Fashion', icon: '&#128118;' },
    { id: 'toys', name: 'Toys & Games', icon: '&#129528;' },
    { id: 'fashion', name: 'Women Fashion', icon: '&#128087;' },
    { id: 'electronics', name: 'Electronics', icon: '&#127911;' },
    { id: 'kitchen', name: 'Kitchen & Home', icon: '&#127859;' },
    { id: 'health', name: 'Health & Wellness', icon: '&#128170;' },
    { id: 'sports', name: 'Sports & Fitness', icon: '&#9917;' }
];

const MEGA_NAV_SECTIONS = {
    'baby-kids': {
        description: 'Infant essentials, occasionwear, and nursery-ready picks for every milestone.',
        spotlight: {
            title: 'Festive Kidswear',
            subtitle: 'Soft fabrics, premium finishing, and ready-to-gift looks.',
            image: 'assets/kids-fashion/K 01.jpg',
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
        icon: '&#128118;'
    },
    {
        title: '3-5 Years',
        caption: 'Musical toys, pretend play, and colorful early-learning gifts.',
        href: 'category.html?search=musical',
        icon: '&#127912;'
    },
    {
        title: '6-8 Years',
        caption: 'Building sets, puzzles, and smart activity toys that teach through play.',
        href: 'category.html?search=building',
        icon: '&#129513;'
    },
    {
        title: '9-12 Years',
        caption: 'Tech accessories, hobby toys, and gifts for growing curiosity.',
        href: 'category.html?cat=electronics',
        icon: '&#128187;'
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
        id: 101,
        name: 'Smart Tech Accessory',
        brand: 'Kidvana Tech',
        category: 'electronics',
        price: 1499,
        mrp: 2999,
        image: 'assets/electronics/P 01.jpg',
        images: ['assets/electronics/P 01.jpg', 'assets/electronics/P 01.1.jpg', 'assets/electronics/P 01.2.jpg'],
        rating: 4.7,
        reviews: 85,
        tags: ['new', 'gadget', 'bestseller'],
        color: '#F1F1F1',
        description: 'Advanced smart accessory for modern lifestyle efficiency and convenience.'
    },
    {
        id: 201,
        name: 'Designer Ethnic Wear Set',
        brand: 'Kidvana Kids',
        category: 'baby-kids',
        price: 1299,
        mrp: 1999,
        image: 'assets/kids-fashion/K 01.jpg',
        images: ['assets/kids-fashion/K 01.jpg', 'assets/kids-fashion/K 01.1.jpg', 'assets/kids-fashion/K 01.2.jpg'],
        rating: 4.9,
        reviews: 156,
        tags: ['new', 'festival', 'bestseller'],
        color: '#FFE4E1',
        description: 'Vibrant ethnic wear set, perfect for festive celebrations and special occasions.'
    },
    {
        id: 202,
        name: 'Casual Blue Kurta Set',
        brand: 'Kidvana Kids',
        category: 'baby-kids',
        price: 899,
        mrp: 1499,
        image: 'assets/kids-fashion/K 02.jpg',
        images: ['assets/kids-fashion/K 02.jpg', 'assets/kids-fashion/K 02.1.jpg'],
        rating: 4.6,
        reviews: 92,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        description: 'Stylish and soft cotton kurta set for everyday comfort and small gatherings.'
    },
    {
        id: 203,
        name: 'Festive Party Dress',
        brand: 'Kidvana Kids',
        category: 'baby-kids',
        price: 1599,
        mrp: 2499,
        image: 'assets/kids-fashion/K 03.jpg',
        images: ['assets/kids-fashion/K 03.jpg', 'assets/kids-fashion/K 03.1.jpg', 'assets/kids-fashion/K 03.2.jpg'],
        rating: 4.8,
        reviews: 110,
        tags: ['party', 'elegant', 'trending'],
        color: '#FFF9C4',
        description: 'Elegant party dress featuring premium fabric and comfortable fit for kids.'
    },
    {
        id: 204,
        name: 'Toddler Cotton Playwear',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 499,
        mrp: 999,
        image: 'assets/kids-fashion/K 04.jpg',
        images: ['assets/kids-fashion/K 04.jpg', 'assets/kids-fashion/K 04.1.jpg', 'assets/kids-fashion/K 04.2.jpg', 'assets/kids-fashion/K 04.3.jpg'],
        rating: 4.5,
        reviews: 240,
        tags: ['daily', 'soft', 'deal'],
        color: '#E8F5E9',
        description: 'Breathable and soft cotton playwear set for toddlers, ideal for all-day play.'
    },
    {
        id: 205,
        name: 'Traditional Sherwani Set',
        brand: 'Kidvana Kids',
        category: 'baby-kids',
        price: 1899,
        mrp: 3499,
        image: 'assets/kids-fashion/K 05.jpg',
        images: ['assets/kids-fashion/K 05.jpg', 'assets/kids-fashion/K 05.1.jpg', 'assets/kids-fashion/K 05.2.jpg'],
        rating: 4.9,
        reviews: 74,
        tags: ['royal', 'premium', 'bestseller'],
        color: '#F3E5F5',
        description: 'Exquisite traditional sherwani set for a royal touch to festive celebrations.'
    },
    {
        id: 301,
        name: 'Interactive Learning Spinner',
        brand: 'SmartPlay',
        category: 'toys',
        price: 349,
        mrp: 699,
        image: 'assets/toys/T 01.jpg',
        images: ['assets/toys/T 01.jpg', 'assets/toys/T 01.1.jpg', 'assets/toys/T 01.2.jpg', 'assets/toys/T 01.3.jpg'],
        rating: 4.7,
        reviews: 312,
        tags: ['learning', 'interactive', 'deal'],
        color: '#FFECB3',
        description: 'Engaging spinner toy designed to improve sensory development and motor skills.'
    },
    {
        id: 302,
        name: 'Musical Rattle Toy Set',
        brand: 'Melody',
        category: 'toys',
        price: 599,
        mrp: 1299,
        image: 'assets/toys/T 02.jpg',
        images: ['assets/toys/T 02.jpg', 'assets/toys/T 02.1.jpg', 'assets/toys/T 02.2.jpg'],
        rating: 4.6,
        reviews: 185,
        tags: ['music', 'baby', 'trending'],
        color: '#D1C4E9',
        description: 'Colorful musical rattle set that introduces infants to delightful sounds.'
    },
    {
        id: 303,
        name: 'Educational Puzzle Blocks',
        brand: 'Brainy',
        category: 'toys',
        price: 799,
        mrp: 1599,
        image: 'assets/toys/T 03.jpg',
        images: ['assets/toys/T 03.jpg', 'assets/toys/T 03.1.jpg', 'assets/toys/T 03.2.jpg'],
        rating: 4.8,
        reviews: 215,
        tags: ['puzzle', 'smart', 'bestseller'],
        color: '#C8E6C9',
        description: 'Cognitive development puzzle blocks that encourage problem-solving and focus.'
    },
    {
        id: 304,
        name: 'Creative Building Blocks',
        brand: 'BuildIt',
        category: 'toys',
        price: 1199,
        mrp: 2499,
        image: 'assets/toys/T 04.jpg',
        images: ['assets/toys/T 04.jpg', 'assets/toys/T 04.1.jpg', 'assets/toys/T 04.2.jpg', 'assets/toys/T 04.3.jpg', 'assets/toys/T 04.4.jpg', 'assets/toys/T 04.5.jpg'],
        rating: 4.9,
        reviews: 420,
        tags: ['creative', 'bestseller', 'deal'],
        color: '#B3E5FC',
        description: 'Premium building blocks set for endless hours of creative play and construction.'
    },
    {
        id: 401,
        name: 'Elegant Designer Kurti',
        brand: 'Kidvana Women',
        category: 'fashion',
        price: 1399,
        mrp: 2999,
        image: 'assets/women-fashion/W 01.jpg',
        images: ['assets/women-fashion/W 01.jpg', 'assets/women-fashion/W 01.1.jpg', 'assets/women-fashion/W 01.2.jpg'],
        rating: 4.8,
        reviews: 128,
        tags: ['new', 'ethnic', 'elegant', 'trending'],
        color: '#FCE4EC',
        description: 'Sophisticated ethnic kurti featuring modern artistry and comfortable fit.'
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
                <button class="card-add-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

