const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Can be phone or Mongo ID
    items: [{
        productId: { type: String },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    address: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zip: String
    },
    paymentId: String,
    razorpayOrderId: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
