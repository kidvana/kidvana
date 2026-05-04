require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Product.countDocuments({ shiprocketVariantId: { $ne: null } });
    console.log(`Synced products count: ${count}`);
    const products = await Product.find({ shiprocketVariantId: { $ne: null } });
    products.forEach(p => console.log(`- ${p.name}: ${p.shiprocketVariantId}`));
    process.exit();
}
check();
