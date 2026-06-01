const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        if (req.isConnected) {
            const products = await Product.find().limit(200).lean();
            res.json(products);
        } else {
            if (process.env.NODE_ENV === 'production') {
                return res.status(503).json({ message: 'Service temporarily unavailable.' });
            }
            res.json(req.mockProducts);
        }
    } catch (err) {
        console.error('[Products] fetch error:', err.message);
        res.status(500).json({ message: 'Failed to fetch products.' });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        if (req.isConnected) {
            const product = await Product.findById(req.params.id);
            if (product) return res.json(product);
        }
        
        const mock = (req.mockProducts || []).find(p => p._id === req.params.id);
        if (mock) return res.json(mock);
        
        res.status(404).json({ message: 'Product not found' });
    } catch (err) {
        console.error('[Products] fetch by id error:', err.message);
        res.status(500).json({ message: 'Failed to fetch product.' });
    }
});

module.exports = router;
