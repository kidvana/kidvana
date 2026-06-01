const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    userPhone: { type: String, index: true },
    customerEmail: { type: String },
    items: [{
        productId: { type: String },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    amount: { type: Number, required: true },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'Processing', 'Confirmed']
    },
    paymentMethod: {
        type: String,
        default: 'cod',
        enum: ['cod', 'razorpay', 'shiprocket', 'upi', 'card']
    },
    paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'paid', 'failed', 'refunded', 'Pending', 'Paid', 'Pending confirmation']
    },
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
    razorpayOrderId: { type: String, index: true },
    shiprocketOrderId: { type: String, index: true },
    shiprocketStatus: String,
    shiprocketPayload: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Compound index for order lookups
orderSchema.index({ userPhone: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
