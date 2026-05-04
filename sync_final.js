require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('./models/Product');

async function getShiprocketToken() {
    const email = process.env.SHIPROCKET_API_EMAIL;
    const password = process.env.SHIPROCKET_API_PASSWORD;
    console.log('Logging in with:', email);
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', { email, password });
    return response.data.token;
}

async function sync() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const token = await getShiprocketToken();
        console.log('Token received');
        
        const products = await Product.find();
        console.log(`Found ${products.length} products total`);

        for (const product of products) {
            console.log(`Syncing ${product.name}...`);
            try {
                const sku = String(product._id);
                const response = await axios.post(
                    'https://apiv2.shiprocket.in/v1/external/products',
                    {
                        sku,
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
                    product.shiprocketVariantId = response.data.id;
                    await product.save();
                    console.log(`Synced ${product.name}: ${response.data.id}`);
                } else {
                    console.log(`Failed to get ID for ${product.name}`, response.data);
                }
            } catch (err) {
                if (err.response?.data?.errors?.sku?.[0]?.includes('already been taken')) {
                    const sku = String(product._id);
                    const searchRes = await axios.get(`https://apiv2.shiprocket.in/v1/external/products?sku=${sku}`, { headers: { Authorization: `Bearer ${token}` } });
                    const existing = searchRes.data.data.find(p => p.sku === sku);
                    if (existing) {
                        product.shiprocketProductId = existing.id;
                        product.shiprocketVariantId = existing.id;
                        await product.save();
                        console.log(`Linked existing ${product.name}: ${existing.id}`);
                    } else {
                        console.log(`SKU taken but not found for ${product.name}`);
                    }
                } else {
                    console.error(`Error ${product.name}:`, err.response?.data || err.message);
                }
            }
        }
        console.log('Sync finished');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exit(1);
    }
}
sync();
