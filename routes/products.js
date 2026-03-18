const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        if (req.isConnected) {
            const products = await Product.find();
            res.json(products);
        } else {
            res.json(req.mockProducts);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        if (req.isConnected) {
            const product = await Product.findById(req.params.id);
            if (product) return res.json(product);
        }
        
        const mock = req.mockProducts.find(p => p._id === req.params.id);
        if (mock) return res.json(mock);
        
        res.status(404).json({ message: 'Product not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
