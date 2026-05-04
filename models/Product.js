const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    image: { type: String, required: true },
    images: [String],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    tags: [String],
    color: { type: String },
    description: { type: String },
    shiprocketProductId: { type: Number },
    shiprocketVariantId: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
