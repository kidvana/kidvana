const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple Login/Signup
router.post('/login', async (req, res) => {
    const { phone, name } = req.body;
    try {
        if (!req.isConnected) {
            return res.json({ _id: 'mock_user_id', phone, name: name || 'Mock User' });
        }

        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone, name: name || 'New User' });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Profile
router.get('/profile/:phone', async (req, res) => {
    try {
        if (!req.isConnected) {
            return res.json({ phone: req.params.phone, name: 'Mock User', email: 'mock@example.com' });
        }

        const user = await User.findOne({ phone: req.params.phone });
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Profile
router.put('/profile', async (req, res) => {
    const { phone, name, email } = req.body;
    try {
        if (!req.isConnected) {
            return res.json({ phone, name, email });
        }

        let user = await User.findOneAndUpdate(
            { phone },
            { name, email },
            { new: true, upsert: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
