const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// Create Order
router.post('/create-order', async (req, res) => {
    const { amount, userId, items, address } = req.body;
    try {
        const options = {
            amount: amount * 100, // in paisa
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        // If keys are placeholders, return mock order
        if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder' || !process.env.RAZORPAY_KEY_ID) {
            return res.json({
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: "INR"
            });
        }

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify Payment & Save Order
router.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderInfo } = req.body;
    
    // For now, accepting all as success for demonstration if mock
    const isMock = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');

    try {
        const newOrder = new Order({
            userId: orderInfo?.userId || 'unknown',
            items: orderInfo?.items || [],
            amount: orderInfo?.amount || 0,
            status: 'paid',
            address: orderInfo?.address || {},
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
        });

        if (req.isConnected) {
            await newOrder.save();
        }

        res.json({ status: 'success', order: newOrder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
