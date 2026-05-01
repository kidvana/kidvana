const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
});

function hasLiveRazorpayKeys() {
    return (
        Boolean(process.env.RAZORPAY_KEY_ID) &&
        Boolean(process.env.RAZORPAY_KEY_SECRET) &&
        process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder' &&
        process.env.RAZORPAY_KEY_SECRET !== 'placeholder_secret'
    );
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

router.post('/create-order', requireAuth, async (req, res) => {
    const amount = Number(req.body.amount) || 0;
    const items = normalizeItems(req.body.items);

    if (amount <= 0 || items.length === 0) {
        return res.status(400).json({ message: 'Order amount and items are required.' });
    }

    try {
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        if (!hasLiveRazorpayKeys()) {
            return res.json({
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: 'INR',
                isMock: true,
                publicKey: ''
            });
        }

        const order = await razorpay.orders.create(options);
        return res.json({
            ...order,
            isMock: false,
            publicKey: razorpayKeyId
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/verify-payment', requireAuth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderInfo } = req.body;
    const paymentMethod = orderInfo?.paymentMethod || 'razorpay';
    const isMock = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');
    const items = normalizeItems(orderInfo?.items);
    const amount = Number(orderInfo?.amount) || 0;

    if (!items.length || amount <= 0) {
        return res.status(400).json({ message: 'Invalid order payload' });
    }

    try {
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

        const newOrder = new Order({
            userId: req.auth.userId || req.auth.phone,
            userPhone: req.auth.phone,
            customerEmail: orderInfo?.address?.email || '',
            items,
            amount,
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
        return res.status(500).json({ message: err.message });
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
        }).sort({ createdAt: -1 });

        return res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/track/:orderId', async (req, res) => {
    const orderId = String(req.params.orderId || '').trim();
    const phone = String(req.query.phone || '').trim();

    if (!orderId || !phone) {
        return res.status(400).json({ message: 'Order ID and phone number are required.' });
    }

    try {
        if (!req.isConnected) {
            return res.status(404).json({ message: 'Order not found in demo mode.' });
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
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
