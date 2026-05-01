const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth, signUserToken } = require('../middleware/auth');

function isValidPhone(phone) {
    return /^\d{10}$/.test(String(phone || '').trim());
}

function sanitizeUser(user) {
    return {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || ''
    };
}

router.post('/login', async (req, res) => {
    const phone = String(req.body.phone || '').trim();
    const name = String(req.body.name || '').trim();

    if (!isValidPhone(phone)) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    try {
        if (!req.isConnected) {
            const mockUser = { _id: 'mock_user_id', phone, name: name || 'Kidvana User', email: '' };
            return res.json({ user: mockUser, token: signUserToken(mockUser) });
        }

        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone, name: name || 'Kidvana User' });
            await user.save();
        }

        res.json({ user: sanitizeUser(user), token: signUserToken(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/profile', requireAuth, async (req, res) => {
    try {
        if (!req.isConnected) {
            return res.json({
                _id: req.auth.userId,
                phone: req.auth.phone,
                name: req.auth.name || 'Kidvana User',
                email: ''
            });
        }

        const user = await User.findOne({ phone: req.auth.phone });
        if (user) return res.json(sanitizeUser(user));

        return res.status(404).json({ message: 'User not found' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/profile/:phone', requireAuth, async (req, res) => {
    if (req.params.phone !== req.auth.phone) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        if (!req.isConnected) {
            return res.json({
                _id: req.auth.userId,
                phone: req.auth.phone,
                name: req.auth.name || 'Kidvana User',
                email: ''
            });
        }

        const user = await User.findOne({ phone: req.auth.phone });
        if (user) return res.json(sanitizeUser(user));

        return res.status(404).json({ message: 'User not found' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.put('/profile', requireAuth, async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        if (!req.isConnected) {
            return res.json({
                _id: req.auth.userId,
                phone: req.auth.phone,
                name,
                email
            });
        }

        const user = await User.findOneAndUpdate(
            { phone: req.auth.phone },
            { name, email },
            { new: true, upsert: true }
        );

        return res.json(sanitizeUser(user));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
