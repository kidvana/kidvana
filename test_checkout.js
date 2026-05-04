const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const product = await Product.findOne({ shiprocketVariantId: { $ne: null } });
    
    if (!product) {
        console.log('No synced products found');
        return;
    }

    console.log(`Testing with product: ${product.name} (Shiprocket ID: ${product.shiprocketVariantId})`);

    const payload = {
        cart_data: {
            items: [{
                variant_id: String(product.shiprocketVariantId),
                quantity: 1,
                price: product.price,
                title: product.name,
                sku: String(product._id),
                image_url: 'https://placehold.co/600x400'
            }]
        },
        redirect_url: 'https://kidvana.vercel.app/order-success',
        timestamp: Math.floor(Date.now() / 1000)
    };

    const sig = crypto
        .createHmac('sha256', process.env.SHIPROCKET_CHECKOUT_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('base64');

    try {
        const res = await axios.post(
            'https://checkout-api.shiprocket.com/api/v1/access-token/checkout',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': process.env.SHIPROCKET_CHECKOUT_API_KEY,
                    'X-Api-HMAC-SHA256': sig
                }
            }
        );
        console.log('Success Response:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Error Response:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
    process.exit();
}
test();
