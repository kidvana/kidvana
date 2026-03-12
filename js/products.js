// ═══════════════════════════════════════════════
// PRODUCT DATA & CATALOG — Kidvana Store
// ═══════════════════════════════════════════════

const CATEGORIES = [
  { id: 'baby-kids', name: 'Kids Fashion', icon: '👶' },
  { id: 'toys', name: 'Toys & Games', icon: '🧸' },
  { id: 'fashion', name: 'Women Fashion', icon: '👔' },
  { id: 'electronics', name: 'Electronics', icon: '🎧' },
  { id: 'kitchen', name: 'Kitchen & Home', icon: '🍳' },
  { id: 'health', name: 'Health & Wellness', icon: '💪' },
  { id: 'sports', name: 'Sports & Fitness', icon: '⚽' }
];

// SVG product image generator for crisp, beautiful product visuals
function generateProductSVG(emoji, bgColor, label) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${bgColor};stop-opacity:0.15"/><stop offset="100%" style="stop-color:${bgColor};stop-opacity:0.05"/></linearGradient></defs><rect width="400" height="400" fill="url(#bg)"/><text x="200" y="180" font-size="100" text-anchor="middle" dominant-baseline="central">${emoji}</text><text x="200" y="280" font-size="24" font-weight="700" text-anchor="middle" fill="${bgColor}" font-family="system-ui,sans-serif">${label}</text></svg>`)}`;
}

const FALLBACK_PRODUCTS = [
  // Electronics
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
  // Kids Fashion
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
  // Toys & Games
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
  // Women Fashion
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

let PRODUCTS = FALLBACK_PRODUCTS; // Start with fallback

// Fetch products from API (Update data if server is live)
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 5) {
        // Normalize products: Ensure every product has 'id' (even if it comes as '_id')
        PRODUCTS = data.map(p => ({
          ...p,
          id: p.id || p._id || Math.random().toString(36).substr(2, 9)
        }));
        console.log('Successfully loaded and normalized products from API');
      } else {
        console.warn('API returned limited or empty data. Using local fallback.');
        PRODUCTS = FALLBACK_PRODUCTS;
      }
    } else {
      console.warn('API response not OK. Using local fallback.');
      PRODUCTS = FALLBACK_PRODUCTS;
    }
  } catch (err) {
    console.warn('Backend server not reachable. Using local product data.', err);
    PRODUCTS = FALLBACK_PRODUCTS;
  } finally {
    // Re-render components
    if (typeof renderHomeSections === 'function') renderHomeSections();
    if (typeof renderCategoryPage === 'function') renderCategoryPage();

    // Dispatch custom event for pages like product.html
    document.dispatchEvent(new CustomEvent('productsLoaded', { detail: PRODUCTS }));
  }
}

// Helper to get formatted category name
function getCategoryDisplayName(cat) {
  const names = {
    'baby-kids': 'Kids Fashion',
    'toys': 'Toys & Games',
    'fashion': 'Women Fashion',
    'electronics': 'Electronics',
    'kitchen': 'Kitchen & Home',
    'health': 'Health & Wellness',
    'sports': 'Sports & Fitness'
  };
  return names[cat] || cat;
}

// Render products on category page
function renderCategoryPage() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const searchTerm = params.get('q') || params.get('search');

  console.log('Category Page Debug:', { cat, searchTerm, productCount: PRODUCTS.length });

  let filteredProducts = PRODUCTS;

  if (cat) {
    filteredProducts = PRODUCTS.filter(p => p.category === cat);
    const title = getCategoryDisplayName(cat);
    document.getElementById('categoryTitle').textContent = title;
    console.log(`Filtering by category: ${cat}, Found: ${filteredProducts.length}`);
  } else if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredProducts = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    document.getElementById('categoryTitle').textContent = `Search: "${searchTerm}"`;
    console.log(`Filtering by search: ${searchTerm}, Found: ${filteredProducts.length}`);
  } else {
    document.getElementById('categoryTitle').textContent = 'All Products';
    console.log('No filter applied, showing all products');
  }

  const countEl = document.getElementById('categoryCount');
  if (countEl) countEl.textContent = `${filteredProducts.length} items found`;

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <div style="font-size:3rem;margin-bottom:16px">🔍</div>
                <h3>No products found</h3>
                <p style="color:var(--gray-500);margin:8px 0 20px">Try adjusting your filters or category.</p>
                <a href="index.html" class="btn btn-primary">Back to Home</a>
            </div>
        `;
    return;
  }

  grid.innerHTML = filteredProducts.map(p => createProductCardHTML(p)).join('');
}

// Discount Calculation
// ...

// ── Discount Calculation ──

function getDiscount(mrp, price) {
  return Math.round(((mrp - price) / mrp) * 100);
}

// ── Filtering & Search ──
function getProductsByCategory(categoryId) {
  return PRODUCTS.filter(p => p.category === categoryId);
}

function getProductsByTag(tag) {
  return PRODUCTS.filter(p => p.tags && Array.isArray(p.tags) && p.tags.includes(tag));
}

function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
}

function getProductById(id) {
  // Support both 'id' and '_id' for compatibility
  return PRODUCTS.find(p => p.id === id || p._id === id || p.id == id);
}

// ── Star Rating HTML ──
function getStarsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── Product Card HTML Generator ──
function createProductCardHTML(product) {
  const discount = getDiscount(product.mrp, product.price);
  const badgeTag = product.tags.includes('deal') ? 'deal' :
    product.tags.includes('bestseller') ? 'trending' :
      product.tags.includes('trending') ? 'new' : '';
  const badgeText = product.tags.includes('deal') ? '🔥 Deal' :
    product.tags.includes('bestseller') ? '⭐ Best Seller' :
      product.tags.includes('trending') ? '📈 Trending' : '';

  const inWishlist = typeof isInWishlist === 'function' && isInWishlist(product.id);

  return `
    <div class="product-card" data-id="${product.id}" onclick="viewProduct('${product.id}')">
      ${badgeText ? `<span class="card-badge badge badge-${badgeTag}">${badgeText}</span>` : ''}
      <div class="card-actions">
        <button class="card-action-btn card-wishlist ${inWishlist ? 'active' : ''}" 
                data-id="${product.id}"
                onclick="event.stopPropagation(); toggleWishlist('${product.id}')" 
                title="Add to wishlist">
          ${inWishlist ? '❤️' : '🤍'}
        </button>
        <button class="card-action-btn quick-view-btn" 
                onclick="event.stopPropagation(); openQuickView('${product.id}')" 
                title="Quick View">
          👁️
        </button>
      </div>
      <div class="card-image" style="background-color: ${product.color}">
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
            <span class="currency">₹</span>
            <span class="amount">${product.price.toLocaleString()}</span>
          </div>
          <div class="original-price">
            <span class="mrp">₹${product.mrp.toLocaleString()}</span>
            <span class="discount">${discount}% off</span>
          </div>
        </div>
        <button class="card-add-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `;
}
