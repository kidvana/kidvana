const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpay = null;
if (razorpayKeyId && razorpayKeySecret && razorpayKeyId !== 'rzp_test_placeholder') {
    razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret
    });
}

function hasLiveRazorpayKeys() {
    return razorpay !== null;
}

function normalizeItems(items = []) {
    return items.map(item => ({
        productId: String(item.productId || item.id || ''),
        name: item.name || 'Item',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity || item.qty || 1),
        image: item.image || ''
    }));
}

// ── Server-Side Price Calculation ──
// NEVER trust client-provided amount. Always calculate from DB prices.
async function calculateServerSideTotal(items, mockProducts) {
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
        const productId = String(item.productId || item.id || '');
        const quantity = Math.max(1, Math.min(10, Number(item.quantity || item.qty || 1))); // Cap at 10

        let product = null;

        // Try DB first
        try {
            if (mongoose.connection.readyState === 1) {
                product = await Product.findById(productId).lean();
            }
        } catch (e) {
            // DB lookup failed
        }

        // Fallback to mock data
        if (!product && mockProducts) {
            product = mockProducts.find(p => String(p._id) === productId);
        }

        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }

        const price = Number(product.price);
        if (price <= 0) {
            throw new Error(`Invalid price for product: ${product.name}`);
        }

        total += price * quantity;
        validatedItems.push({
            productId,
            name: product.name,
            price: price,
            quantity: quantity,
            image: product.image || ''
        });
    }

    return { total, validatedItems };
}

// ── Create Razorpay Order (Auth required) ──
router.post('/create-order', requireAuth, async (req, res) => {
    const rawItems = normalizeItems(req.body.items);

    if (rawItems.length === 0) {
        return res.status(400).json({ message: 'Cart items are required.' });
    }

    try {
        // Calculate price server-side — NEVER trust client amount
        const { total, validatedItems } = await calculateServerSideTotal(rawItems, req.mockProducts);

        if (total <= 0) {
            return res.status(400).json({ message: 'Invalid order total.' });
        }

        // Add shipping + tax
        const paymentMethod = req.body.paymentMethod || 'razorpay';
        const shipping = paymentMethod === 'cod' ? 150 : (total >= 1000 ? 0 : 150);
        const tax = Math.round(total * 0.18);
        const grandTotal = total + shipping + tax;

        const options = {
            amount: Math.round(grandTotal * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        if (!hasLiveRazorpayKeys()) {
            return res.json({
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: 'INR',
                isMock: true,
                publicKey: '',
                serverTotal: grandTotal
            });
        }

        const order = await razorpay.orders.create(options);
        return res.json({
            ...order,
            isMock: false,
            publicKey: razorpayKeyId,
            serverTotal: grandTotal
        });
    } catch (err) {
        console.error('[Orders] create-order error:', err.message);
        return res.status(500).json({ message: 'Failed to create order. Please try again.' });
    }
});

// ── Verify Payment & Save Order (Auth required) ──
router.post('/verify-payment', requireAuth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderInfo } = req.body;
    const paymentMethod = orderInfo?.paymentMethod || 'razorpay';
    const isMock = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');
    const rawItems = normalizeItems(orderInfo?.items);

    if (!rawItems.length) {
        return res.status(400).json({ message: 'Invalid order payload' });
    }

    try {
        // Recalculate server-side total
        const { total, validatedItems } = await calculateServerSideTotal(rawItems, req.mockProducts);
        const shipping = paymentMethod === 'cod' ? 150 : (total >= 1000 ? 0 : 150);
        const tax = Math.round(total * 0.18);
        const grandTotal = total + shipping + tax;

        if (paymentMethod === 'razorpay' && !isMock) {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ message: 'Incomplete payment response.' });
            }

            const expectedSignature = crypto
                .createHmac('sha256', razorpayKeySecret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Payment verification failed.' });
            }
        }

        // COD restriction: Delhi only
        if (paymentMethod === 'cod') {
            const state = String(orderInfo?.address?.state || '').trim().toLowerCase();
            if (state !== 'delhi') {
                return res.status(400).json({ message: 'Cash on Delivery is available in Delhi only.' });
            }
        }

        const userPhone = req.auth.phone || orderInfo?.address?.phone || 'guest';
        const userId = req.auth.userId || userPhone;

        // Idempotency check — prevent duplicate orders from same Razorpay order
        if (razorpay_order_id && !isMock && req.isConnected) {
            const existing = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (existing) {
                return res.json({ status: 'success', order: existing, duplicate: true });
            }
        }

        const newOrder = new Order({
            userId,
            userPhone,
            customerEmail: orderInfo?.address?.email || '',
            items: validatedItems,
            amount: grandTotal,
            status: paymentMethod === 'cod' ? 'confirmed' : 'paid',
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            checkoutSource: 'storefront',
            address: orderInfo?.address || {},
            paymentId: razorpay_payment_id || '',
            razorpayOrderId: razorpay_order_id || ''
        });

        if (req.isConnected) {
            await newOrder.save();
        }

        return res.json({ status: 'success', order: newOrder });
    } catch (err) {
        console.error('[Orders] verify-payment error:', err.message);
        return res.status(500).json({ message: 'Failed to process order. Please try again.' });
    }
});

router.get('/my-orders', requireAuth, async (req, res) => {
    try {
        if (!req.isConnected) {
            return res.json([]);
        }

        const orders = await Order.find({
            $or: [
                { userId: req.auth.userId },
                { userId: req.auth.phone },
                { userPhone: req.auth.phone }
            ]
        }).sort({ createdAt: -1 }).limit(50);

        return res.json(orders);
    } catch (err) {
        console.error('[Orders] my-orders error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch orders.' });
    }
});

router.get('/track/:orderId', async (req, res) => {
    const orderId = String(req.params.orderId || '').trim();
    const phone = String(req.query.phone || '').trim();

    if (!orderId || !phone) {
        return res.status(400).json({ message: 'Order ID and phone number are required.' });
    }

    // Basic validation
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    try {
        if (!req.isConnected) {
            return res.status(503).json({ message: 'Service temporarily unavailable.' });
        }

        const orderIdFilters = [{ shiprocketOrderId: orderId }];
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            orderIdFilters.push({ _id: orderId });
        }

        const order = await Order.findOne({
            $and: [
                {
                    $or: orderIdFilters
                },
                {
                    $or: [
                        { userPhone: phone },
                        { 'address.phone': phone }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found for the provided details.' });
        }

        return res.json({
            id: order._id,
            amount: order.amount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            shiprocketOrderId: order.shiprocketOrderId || '',
            createdAt: order.createdAt,
            address: order.address,
            items: order.items
        });
    } catch (err) {
        console.error('[Orders] track error:', err.message);
        return res.status(500).json({ message: 'Failed to track order.' });
    }
});

module.exports = router;
