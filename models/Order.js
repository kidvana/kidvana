const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userPhone: { type: String },
    customerEmail: { type: String },
    items: [{
        productId: { type: String },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, default: 'pending' },
    checkoutSource: { type: String, default: 'storefront' },
    address: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zip: String
    },
    paymentId: String,
    razorpayOrderId: String,
    shiprocketOrderId: { type: String, index: true },
    shiprocketStatus: String,
    shiprocketPayload: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
