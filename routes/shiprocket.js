const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_CHECKOUT_BASE_URL || 'https://checkout-api.shiprocket.com';
const SHIPROCKET_ORDER_DETAILS_URL = process.env.SHIPROCKET_CHECKOUT_ORDER_DETAILS_URL || 'https://fastrr-api-dev.pickrr.com/api/v1/custom-platform-order/details';
const SHIPROCKET_API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY || '';
const SHIPROCKET_SECRET_KEY = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY || '';
const SHIPROCKET_WEBHOOK_SECRET = process.env.SHIPROCKET_CHECKOUT_WEBHOOK_SECRET || '';
const SHIPROCKET_API_EMAIL = process.env.SHIPROCKET_API_EMAIL || '';
const SHIPROCKET_API_PASSWORD = process.env.SHIPROCKET_API_PASSWORD || '';

const CATEGORY_META = {
    'baby-kids': {
        title: 'Kids Fashion',
        body_html: 'Infant essentials, occasionwear, and everyday kids fashion.',
        image: 'assets/kids-fashion/K 01.jpg'
    },
    toys: {
        title: 'Toys & Games',
        body_html: 'Learning toys, building sets, and playtime favourites.',
        image: 'assets/toys/T 04.jpg'
    },
    fashion: {
        title: 'Women Fashion',
        body_html: 'Fashion-led apparel and gift-ready lifestyle picks.',
        image: 'assets/women-fashion/W 01.jpg'
    },
    electronics: {
        title: 'Electronics',
        body_html: 'Smart gadgets, accessories, and tech gifting picks.',
        image: 'assets/electronics/P 01.jpg'
    },
    kitchen: {
        title: 'Kitchen & Home',
        body_html: 'Useful home and kitchen essentials for daily routines.',
        image: ''
    },
    health: {
        title: 'Health & Wellness',
        body_html: 'Wellness-led essentials and self-care products.',
        image: ''
    },
    sports: {
        title: 'Sports & Fitness',
        body_html: 'Activity toys, games, and sporty essentials.',
        image: 'assets/toys/T 03.jpg'
    }
};

function isShiprocketConfigured() {
    return Boolean(
        SHIPROCKET_API_KEY && 
        SHIPROCKET_SECRET_KEY && 
        !SHIPROCKET_API_KEY.includes('PASTE_YOUR_') && 
        !SHIPROCKET_SECRET_KEY.includes('PASTE_YOUR_')
    );
}

async function getShiprocketToken() {
    if (!SHIPROCKET_API_EMAIL || !SHIPROCKET_API_PASSWORD) {
        throw new Error('Shiprocket Standard API credentials missing in .env');
    }
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
        email: SHIPROCKET_API_EMAIL,
        password: SHIPROCKET_API_PASSWORD
    });
    return response.data.token;
}

function buildSignature(payload, encoding = 'hex') {
    return crypto
        .createHmac('sha256', SHIPROCKET_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest(encoding);
}

function getShiprocketHeaders(payload) {
    return {
        'Content-Type': 'application/json',
        'X-Api-Key': SHIPROCKET_API_KEY,
        'X-Api-HMAC-SHA256': buildSignature(payload, 'hex')
    };
}

function getOrigin(req) {
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
    const protocol = forwardedProto || req.protocol || 'https';
    const host = forwardedHost || req.get('host');
    return `${protocol}://${host}`;
}

function toAbsoluteAssetUrl(req, assetPath) {
    const source = String(assetPath || '').trim();
    if (!source) return '';
    if (/^https?:\/\//i.test(source)) return source;

    const normalizedPath = source.startsWith('/') ? source : `/${source}`;
    return `${getOrigin(req)}${normalizedPath}`;
}

function normalizeSellerDomain(rawValue, req) {
    const value = String(rawValue || '').trim();
    if (!value) return getOrigin(req);
    if (/^https?:\/\//i.test(value)) return value;

    const origin = getOrigin(req);
    const protocol = origin.split('://')[0] || 'https';
    return `${protocol}://${value}`;
}

function formatCatalogTimestamp(rawValue) {
    const timestamp = rawValue ? new Date(rawValue) : new Date();
    if (Number.isNaN(timestamp.getTime())) {
        return new Date().toISOString();
    }

    return timestamp.toISOString();
}

function buildHandle(value, fallback = 'product') {
    const handle = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return handle || fallback;
}

function normalizeBodyHtml(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) return '';
    if (/<[a-z][\s\S]*>/i.test(value)) return value;

    return `<p>${value}</p>`;
}

function getVariantOptionValues(product) {
    const optionValues = {};

    if (product.color) {
        optionValues.Color = String(product.color);
    }

    if (product.size) {
        optionValues.Size = String(product.size);
    }

    return optionValues;
}

function buildPaginatedResponse(resourceKey, paginated) {
    const pagination = {
        page: paginated.page,
        limit: paginated.limit,
        total: paginated.total,
        total_pages: paginated.total_pages,
        has_next_page: paginated.has_next_page
    };

    return {
        data: {
            total: paginated.total,
            [resourceKey]: paginated.items,
            ...pagination
        },
        [resourceKey]: paginated.items,
        pagination
    };
}

function paginate(items, rawPage, rawLimit) {
    const page = Math.max(1, Number.parseInt(rawPage, 10) || 1);
    const limit = Math.max(1, Math.min(250, Number.parseInt(rawLimit, 10) || 100));
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
        page,
        limit,
        total: items.length,
        total_pages: Math.max(1, Math.ceil(items.length / limit)),
        has_next_page: start + limit < items.length,
        items: paginatedItems
    };
}

async function getCatalogProducts(req) {
    if (req.isConnected) {
        return Product.find().lean();
    }

    return req.mockProducts || [];
}

function normalizeCatalogProduct(product, req) {
    const productId = String(product.shiprocketProductId || product._id || product.id || product.shiprocketVariantId || '');
    const variantId = String(product.shiprocketVariantId || product.shiprocketProductId || product._id || product.id || '');
    const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 12;
    const createdAt = formatCatalogTimestamp(product.createdAt || product.created_at);
    const updatedAt = formatCatalogTimestamp(product.updatedAt || product.updated_at || createdAt);
    const imageUrl = toAbsoluteAssetUrl(req, product.image || product.images?.[0] || '');
    const optionValues = getVariantOptionValues(product);
    const tags = Array.isArray(product.tags)
        ? product.tags.map(tag => String(tag).trim()).filter(Boolean).join(', ')
        : String(product.tags || '').trim();
    const price = Number(product.price || 0);
    const compareAtPrice = Number(product.mrp || product.compare_at_price || price);
    const handleFallback = String(product._id || product.id || 'product');

    return {
        id: productId || variantId,
        title: String(product.name || ''),
        body_html: normalizeBodyHtml(product.description || ''),
        vendor: String(product.brand || ''),
        product_type: String(product.category || ''),
        created_at: createdAt,
        handle: buildHandle(product.handle || product.name, handleFallback),
        updated_at: updatedAt,
        tags,
        status: String(product.status || (stock > 0 ? 'active' : 'draft')),
        image: {
            src: imageUrl
        },
        variants: [
            {
                id: variantId || productId,
                title: String(product.variantTitle || product.name || 'Default Title'),
                price: price.toFixed(2),
                compare_at_price: compareAtPrice.toFixed(2),
                quantity: stock,
                sku: String(product.sku || product._id || variantId || productId),
                created_at: createdAt,
                updated_at: updatedAt,
                taxable: true,
                option_values: optionValues,
                image: {
                    src: imageUrl
                },
                weight: Number(product.weight || 0.5)
            }
        ]
    };
}

function buildCollections(products, req) {
    const categories = new Set(products.map(product => String(product.category || '').trim()).filter(Boolean));

    return Array.from(categories).map((categoryId) => {
        const meta = CATEGORY_META[categoryId] || {};
        const categoryProducts = products.filter(product => String(product.category || '') === categoryId);
        const fallbackImage = categoryProducts[0]?.image || categoryProducts[0]?.images?.[0] || '';
        const createdAt = formatCatalogTimestamp(categoryProducts[0]?.createdAt);

        return {
            id: categoryId,
            title: meta.title || categoryId,
            body_html: normalizeBodyHtml(meta.body_html || ''),
            handle: buildHandle(categoryId, 'collection'),
            created_at: createdAt,
            updated_at: formatCatalogTimestamp(categoryProducts[0]?.updatedAt || createdAt),
            image: {
                src: toAbsoluteAssetUrl(req, meta.image || fallbackImage)
            }
        };
    });
}

function normalizeDraftItems(items = []) {
    return items.map((item) => ({
        productId: String(item.productId || item.variant_id || item.id || ''),
        name: String(item.name || 'Item'),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || item.qty || 1),
        image: String(item.image || '')
    }));
}

function getProductMap(products, req) {
    const productMap = new Map();

    products.forEach((product) => {
        const normalizedId = String(product._id || product.id || '');
        const entry = {
            productId: normalizedId,
            name: String(product.name || 'Item'),
            price: Number(product.price || 0),
            image: toAbsoluteAssetUrl(req, product.image || product.images?.[0] || '')
        };

        [
            product._id,
            product.id,
            product.shiprocketProductId,
            product.shiprocketVariantId
        ]
            .map((value) => String(value || '').trim())
            .filter(Boolean)
            .forEach((key) => {
                productMap.set(key, entry);
            });
    });

    return productMap;
}

function mapShiprocketPayment(payload) {
    const paymentType = String(payload.payment_type || '').trim().toUpperCase();

    if (paymentType === 'CASH_ON_DELIVERY') {
        return {
            paymentMethod: 'cod',
            paymentStatus: 'Pending',
            status: 'Confirmed'
        };
    }

    return {
        paymentMethod: 'shiprocket',
        paymentStatus: 'Pending confirmation',
        status: 'Processing'
    };
}

async function upsertShiprocketOrder(orderPayload, req) {
    const shiprocketOrderId = String(orderPayload.shiprocketOrderId || orderPayload.order_id || '').trim();
    if (!shiprocketOrderId) {
        throw new Error('Shiprocket order ID is required.');
    }

    const products = await getCatalogProducts(req);
    const productMap = getProductMap(products, req);
    const paymentMeta = mapShiprocketPayment(orderPayload);

    const items = normalizeDraftItems(orderPayload.items || []).length
        ? normalizeDraftItems(orderPayload.items || [])
        : (orderPayload.cart_data?.items || []).map((item) => {
            const variantId = String(item.variant_id || item.productId || item.id || '');
            const product = productMap.get(variantId) || {
                productId: variantId,
                name: 'Item',
                price: 0,
                image: ''
            };

            return {
                productId: product.productId,
                name: product.name,
                price: Number(item.price || product.price || 0),
                quantity: Number(item.quantity || item.qty || 1),
                image: item.image || product.image || ''
            };
        });

    const totals = orderPayload.totals || {};
    const amount = Number(
        orderPayload.amount ||
        orderPayload.total_amount_payable ||
        totals.total ||
        items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
    );
    const address = {
        name: String(orderPayload.address?.name || orderPayload.customer_name || orderPayload.name || ''),
        email: String(orderPayload.address?.email || orderPayload.email || ''),
        phone: String(orderPayload.address?.phone || orderPayload.phone || ''),
        address: String(orderPayload.address?.address || orderPayload.address_line1 || ''),
        city: String(orderPayload.address?.city || orderPayload.city || ''),
        state: String(orderPayload.address?.state || orderPayload.state || ''),
        zip: String(orderPayload.address?.zip || orderPayload.postcode || orderPayload.zip || '')
    };
    const userPhone = String(orderPayload.userPhone || address.phone || orderPayload.phone || '');
    const update = {
        userId: String(orderPayload.userId || userPhone || 'shiprocket-guest'),
        userPhone,
        customerEmail: address.email,
        items,
        amount,
        status: String(orderPayload.localStatus || paymentMeta.status),
        paymentMethod: String(orderPayload.paymentMethod || paymentMeta.paymentMethod),
        paymentStatus: String(orderPayload.paymentStatus || paymentMeta.paymentStatus),
        checkoutSource: 'shiprocket',
        address,
        shiprocketOrderId,
        shiprocketStatus: String(orderPayload.shiprocketStatus || orderPayload.status || ''),
        shiprocketPayload: orderPayload.rawPayload || orderPayload,
        updatedAt: new Date()
    };

    if (!req.isConnected) {
        return {
            _id: shiprocketOrderId,
            ...update,
            createdAt: new Date().toISOString()
        };
    }

    const existingOrder = await Order.findOne({ shiprocketOrderId });
    if (existingOrder) {
        existingOrder.set(update);
        await existingOrder.save();
        return existingOrder;
    }

    const newOrder = new Order(update);
    await newOrder.save();
    return newOrder;
}

router.get('/config', (req, res) => {
    res.json({
        configured: isShiprocketConfigured(),
        sellerDomain: getOrigin(req),
        apiKey: SHIPROCKET_API_KEY ? `${SHIPROCKET_API_KEY.slice(0,4)}****` : 'MISSING',
        secretKey: SHIPROCKET_SECRET_KEY ? `${SHIPROCKET_SECRET_KEY.slice(0,4)}****` : 'MISSING'
    });
});

// Debug endpoint — tests actual Shiprocket API call without auth
router.get('/debug-checkout', async (req, res) => {
    const origin = getOrigin(req);
    const timestamp = Math.floor(Date.now() / 1000);

    const testPayload = {
        cart_data: {
            items: [{
                variant_id: 274443330,
                quantity: 1,
                price: 1299,
                title: 'Classic Ethnic Wear Set',
                sku: '69f83282b0d95cc83f5ccb94',
                image_url: `${origin}/assets/kids-fashion/K01.jpeg`
            }]
        },
        redirect_url: `${origin}/order-success.html?checkout=shiprocket&ref=debug`,
        timestamp,
        seller_domain: origin
    };

    const hexSig = buildSignature(testPayload, 'hex');
    const base64Sig = buildSignature(testPayload, 'base64');

    try {
        const response = await axios.post(
            `${SHIPROCKET_BASE_URL}/api/v1/access-token/checkout`,
            testPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': SHIPROCKET_API_KEY,
                    'X-Api-HMAC-SHA256': hexSig
                },
                timeout: 15000
            }
        );
        return res.json({ success: true, data: response.data, signatureUsed: 'hex' });
    } catch (err) {
        return res.json({
            success: false,
            status: err.response?.status,
            error: err.response?.data || err.message,
            debugInfo: {
                apiKey: SHIPROCKET_API_KEY ? `${SHIPROCKET_API_KEY.slice(0,4)}****` : 'MISSING',
                secretKeyFirst4: SHIPROCKET_SECRET_KEY ? SHIPROCKET_SECRET_KEY.slice(0,4) : 'MISSING',
                baseUrl: SHIPROCKET_BASE_URL,
                hexSignature: hexSig.slice(0, 16) + '...',
                base64Signature: base64Sig.slice(0, 16) + '...',
                payloadSent: testPayload
            }
        });
    }
});

router.get('/products', async (req, res) => {
    try {
        const products = (await getCatalogProducts(req)).map(product => normalizeCatalogProduct(product, req));
        const paginated = paginate(products, req.query.page, req.query.limit);

        return res.json(buildPaginatedResponse('products', paginated));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/collections', async (req, res) => {
    try {
        const collections = buildCollections(await getCatalogProducts(req), req);
        const paginated = paginate(collections, req.query.page, req.query.limit);

        return res.json(buildPaginatedResponse('collections', paginated));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/collection-products', async (req, res) => {
    const collectionId = String(req.query.collection_id || '').trim();
    if (!collectionId) {
        return res.status(400).json({ message: 'collection_id is required.' });
    }

    try {
        const products = (await getCatalogProducts(req))
            .filter(product => String(product.category || '') === collectionId)
            .map(product => normalizeCatalogProduct(product, req));
        const paginated = paginate(products, req.query.page, req.query.limit);

        return res.json(buildPaginatedResponse('products', paginated));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/access-token/checkout', async (req, res) => {
    if (!isShiprocketConfigured()) {
        return res.status(503).json({
            message: 'Shiprocket Checkout is not configured yet. Add SHIPROCKET_CHECKOUT_API_KEY and SHIPROCKET_CHECKOUT_SECRET_KEY.'
        });
    }

    const cartItems = req.body?.cart_data?.items;
    const redirectUrl = String(req.body?.redirect_url || '').trim();
    const timestamp = req.body?.timestamp || Math.floor(Date.now() / 1000);
    const sellerDomain = normalizeSellerDomain(req.body?.seller_domain, req);

    if (!Array.isArray(cartItems) || cartItems.length === 0 || !redirectUrl) {
        return res.status(400).json({ message: 'cart_data.items and redirect_url are required.' });
    }

    const payload = {
        cart_data: {
            items: await Promise.all(cartItems.map(async (item) => {
                const productId = item.variant_id || item.productId || item.id;
                let variantId = productId;
                let price = Number(item.price || item.mrp || 0);
                let title = String(item.name || item.title || 'Product');
                let image = String(item.image || item.image_url || '');

                // First try DB lookup
                try {
                    const dbProduct = await Product.findById(productId);
                    if (dbProduct) {
                        if (dbProduct.shiprocketVariantId) {
                            variantId = String(dbProduct.shiprocketVariantId);
                        }
                        price = dbProduct.price;
                        title = dbProduct.name;
                        image = dbProduct.image;
                    }
                } catch (e) {
                    // DB not available — try mockProducts
                    const mockProduct = (req.mockProducts || []).find(
                        p => String(p._id) === String(productId) || String(p.id) === String(productId)
                    );
                    if (mockProduct) {
                        if (mockProduct.shiprocketVariantId) {
                            variantId = String(mockProduct.shiprocketVariantId);
                        }
                        price = price || mockProduct.price;
                        title = title || mockProduct.name;
                        image = image || mockProduct.image;
                    }
                }

                // If still no Shiprocket ID found from DB, try mock fallback
                if (variantId === productId) {
                    const mockProduct = (req.mockProducts || []).find(
                        p => String(p._id) === String(productId) || String(p.id) === String(productId)
                    );
                    if (mockProduct?.shiprocketVariantId) {
                        variantId = String(mockProduct.shiprocketVariantId);
                    }
                }

                return {
                    variant_id: String(variantId),
                    quantity: Number(item.quantity || item.qty || 1),
                    price: Number(price),
                    title: String(title),
                    sku: String(productId),
                    image_url: toAbsoluteAssetUrl(req, image)
                };
            }))
        },
        redirect_url: redirectUrl,
        timestamp,
        seller_domain: sellerDomain
    };

    try {
        const response = await axios.post(
            `${SHIPROCKET_BASE_URL}/api/v1/access-token/checkout`,
            payload,
            { headers: getShiprocketHeaders(payload), timeout: 15000 }
        );

        const data = response.data || {};
        const token = data?.result?.token || data?.token || '';
        const orderId = data?.result?.order_id || data?.order_id || data?.result?.orderId || data?.orderId || '';

        if (!token) {
            return res.status(502).json({
                message: 'Shiprocket did not return a checkout token.',
                raw: data
            });
        }

        return res.json({
            token,
            orderId,
            raw: data
        });
    } catch (err) {
        const message = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to generate Shiprocket checkout token.';
        return res.status(err.response?.status || 500).json({
            message,
            raw: err.response?.data || null
        });
    }
});

router.post('/orders/complete', async (req, res) => {
    const shiprocketOrderId = String(req.body.orderId || '').trim();
    const orderInfo = req.body.orderInfo || {};
    const guestPhone = String(orderInfo.address?.phone || orderInfo.phone || '').trim();
    const guestUserId = String(orderInfo.userId || guestPhone || 'shiprocket-guest').trim();

    if (!shiprocketOrderId) {
        return res.status(400).json({ message: 'orderId is required.' });
    }

    try {
        const order = await upsertShiprocketOrder({
            shiprocketOrderId,
            userId: req.auth?.userId || req.auth?.phone || guestUserId,
            userPhone: req.auth?.phone || guestPhone,
            status: 'Processing',
            paymentMethod: 'shiprocket',
            paymentStatus: 'Pending confirmation',
            amount: orderInfo.amount,
            totals: orderInfo.totals,
            items: orderInfo.items,
            address: orderInfo.address,
            rawPayload: {
                source: 'return-url',
                checkoutRef: req.body.checkoutRef || '',
                orderInfo
            }
        }, req);

        return res.json({ status: 'success', order });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/orders/:orderId', async (req, res) => {
    const shiprocketOrderId = String(req.params.orderId || '').trim();
    const phone = String(req.query.phone || '').trim();

    if (!shiprocketOrderId || !phone) {
        return res.status(400).json({ message: 'orderId and phone are required.' });
    }

    try {
        if (!req.isConnected) {
            return res.status(404).json({ message: 'Order not found in demo mode.' });
        }

        const query = {
            shiprocketOrderId,
            $or: [
                { userPhone: phone },
                { 'address.phone': phone }
            ]
        };

        const order = await Order.findOne(query);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        return res.json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/order-details', requireAuth, async (req, res) => {
    if (!isShiprocketConfigured()) {
        return res.status(503).json({
            message: 'Shiprocket Checkout is not configured yet. Add SHIPROCKET_CHECKOUT_API_KEY and SHIPROCKET_CHECKOUT_SECRET_KEY.'
        });
    }

    const orderId = String(req.body.order_id || req.body.orderId || '').trim();
    if (!orderId) {
        return res.status(400).json({ message: 'order_id is required.' });
    }

    const payload = {
        order_id: orderId,
        timestamp: req.body.timestamp || new Date().toISOString()
    };

    try {
        const response = await axios.post(
            SHIPROCKET_ORDER_DETAILS_URL,
            payload,
            { headers: getShiprocketHeaders(payload), timeout: 15000 }
        );

        return res.json(response.data || {});
    } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch Shiprocket order details.';
        return res.status(err.response?.status || 500).json({
            message,
            raw: err.response?.data || null
        });
    }
});

router.post('/webhooks/order', async (req, res) => {
    const webhookSecret = String(req.headers['x-shiprocket-webhook-secret'] || '');

    if (SHIPROCKET_WEBHOOK_SECRET && webhookSecret !== SHIPROCKET_WEBHOOK_SECRET) {
        return res.status(401).json({ message: 'Invalid webhook secret.' });
    }

    const payload = req.body || {};
    if (!payload.order_id) {
        return res.status(400).json({ message: 'order_id is required.' });
    }

    try {
        await upsertShiprocketOrder({
            ...payload,
            shiprocketOrderId: String(payload.order_id),
            shiprocketStatus: payload.status,
            rawPayload: payload
        }, req);

        return res.json({ status: 'received' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/sync-products', requireAuth, async (req, res) => {
    try {
        const token = await getShiprocketToken();
        const products = await Product.find({ 
            $or: [
                { shiprocketVariantId: { $exists: false } },
                { shiprocketVariantId: null }
            ]
        });

        const results = [];
        for (const product of products) {
            try {
                const response = await axios.post(
                    'https://apiv2.shiprocket.in/v1/external/products',
                    {
                        sku: String(product._id), // Use full ID as SKU
                        name: product.name,
                        type: 'Single',
                        qty: 100,
                        price: product.price,
                        mrp: product.mrp,
                        brand: product.brand,
                        category_code: 'Othe_',
                        description: product.description
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data && response.data.id) {
                    product.shiprocketProductId = response.data.id;
                    // In single type, variant ID is usually the same as product ID in some versions, 
                    // or we might need to fetch it. For now, we'll store product ID.
                    product.shiprocketVariantId = response.data.id;
                    await product.save();
                    results.push({ name: product.name, status: 'synced', id: response.data.id });
                }
            } catch (err) {
                results.push({ 
                    name: product.name, 
                    status: 'failed', 
                    error: err.response?.data?.message || err.message 
                });
            }
        }

        return res.json({ message: 'Sync complete', results });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
