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

function buildSignature(payload) {
    return crypto
        .createHmac('sha256', SHIPROCKET_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('base64');
}

function getShiprocketHeaders(payload) {
    return {
        'Content-Type': 'application/json',
        'X-Api-Key': SHIPROCKET_API_KEY,
        'X-Api-HMAC-SHA256': buildSignature(payload)
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
    const id = String(product._id || product.id || '');
    const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 12;
    const updatedAt = product.updatedAt || product.createdAt || new Date().toISOString();
    const imageUrl = toAbsoluteAssetUrl(req, product.image || product.images?.[0] || '');

    return {
        id,
        title: String(product.name || ''),
        body_html: String(product.description || ''),
        vendor: String(product.brand || ''),
        product_type: String(product.category || ''),
        updated_at: updatedAt,
        status: stock > 0 ? 'active' : 'draft',
        image: {
            src: imageUrl
        },
        variants: [
            {
                id,
                title: String(product.name || ''),
                price: Number(product.price || 0).toFixed(2),
                quantity: stock,
                sku: id,
                updated_at: updatedAt,
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

        return {
            id: categoryId,
            title: meta.title || categoryId,
            body_html: meta.body_html || '',
            updated_at: new Date().toISOString(),
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
    return new Map(products.map((product) => {
        const normalizedId = String(product._id || product.id || '');

        return [normalizedId, {
            productId: normalizedId,
            name: String(product.name || 'Item'),
            price: Number(product.price || 0),
            image: toAbsoluteAssetUrl(req, product.image || product.images?.[0] || '')
        }];
    }));
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
    const update = {
        userId: String(orderPayload.userId || address.phone || 'shiprocket-guest'),
        userPhone: address.phone,
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
        sellerDomain: getOrigin(req)
    });
});

router.get('/products', async (req, res) => {
    try {
        const products = (await getCatalogProducts(req)).map(product => normalizeCatalogProduct(product, req));
        const paginated = paginate(products, req.query.page, req.query.limit);

        return res.json({
            data: paginated.items,
            products: paginated.items,
            pagination: {
                page: paginated.page,
                limit: paginated.limit,
                total: paginated.total,
                total_pages: paginated.total_pages,
                has_next_page: paginated.has_next_page
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/collections', async (req, res) => {
    try {
        const collections = buildCollections(await getCatalogProducts(req), req);
        const paginated = paginate(collections, req.query.page, req.query.limit);

        return res.json({
            data: paginated.items,
            collections: paginated.items,
            pagination: {
                page: paginated.page,
                limit: paginated.limit,
                total: paginated.total,
                total_pages: paginated.total_pages,
                has_next_page: paginated.has_next_page
            }
        });
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

        return res.json({
            data: paginated.items,
            products: paginated.items,
            pagination: {
                page: paginated.page,
                limit: paginated.limit,
                total: paginated.total,
                total_pages: paginated.total_pages,
                has_next_page: paginated.has_next_page
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/access-token/checkout', requireAuth, async (req, res) => {
    if (!isShiprocketConfigured()) {
        return res.status(503).json({
            message: 'Shiprocket Checkout is not configured yet. Add SHIPROCKET_CHECKOUT_API_KEY and SHIPROCKET_CHECKOUT_SECRET_KEY.'
        });
    }

    const cartItems = req.body?.cart_data?.items;
    const redirectUrl = String(req.body?.redirect_url || '').trim();
    const timestamp = req.body?.timestamp || Math.floor(Date.now() / 1000);

    if (!Array.isArray(cartItems) || cartItems.length === 0 || !redirectUrl) {
        return res.status(400).json({ message: 'cart_data.items and redirect_url are required.' });
    }

    const payload = {
        cart_data: {
            items: cartItems.map(item => ({
                variant_id: String(item.variant_id || item.productId || item.id || ''),
                quantity: Number(item.quantity || item.qty || 1)
            }))
        },
        redirect_url: redirectUrl,
        timestamp
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
        console.error('Shiprocket token generation error:', err.response?.data || err.message);
        const message = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to generate Shiprocket checkout token.';
        return res.status(err.response?.status || 500).json({
            message,
            raw: err.response?.data || null
        });
    }
});

router.post('/orders/complete', requireAuth, async (req, res) => {
    const shiprocketOrderId = String(req.body.orderId || '').trim();
    const orderInfo = req.body.orderInfo || {};

    if (!shiprocketOrderId) {
        return res.status(400).json({ message: 'orderId is required.' });
    }

    try {
        const order = await upsertShiprocketOrder({
            shiprocketOrderId,
            userId: req.auth.userId || req.auth.phone,
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

module.exports = router;
