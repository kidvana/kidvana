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

// Mask phone number for logging (show only last 4 digits)
function maskPhone(phone) {
    const p = String(phone || '');
    return p.length >= 4 ? '****' + p.slice(-4) : '****';
}

router.post('/login', async (req, res) => {
    const phone = String(req.body.phone || '').trim();
    const name = String(req.body.name || '').trim();

    if (!isValidPhone(phone)) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    try {
        if (!req.isConnected) {
            // In production, don't issue mock tokens if DB is down
            if (process.env.NODE_ENV === 'production') {
                return res.status(503).json({ message: 'Service temporarily unavailable. Please try again.' });
            }
            const mockUser = { _id: 'mock_user_id', phone, name: name || 'Kidvana User', email: '' };
            return res.json({ user: mockUser, token: signUserToken(mockUser) });
        }

        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone, name: name || 'Kidvana User' });
            await user.save();
            console.log('[Auth] New user registered:', maskPhone(phone));
        }

        res.json({ user: sanitizeUser(user), token: signUserToken(user) });
    } catch (err) {
        console.error('[Auth] Login error:', err.message);
        res.status(500).json({ message: 'Login failed. Please try again.' });
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
        console.error('[Auth] Profile error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch profile.' });
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
        console.error('[Auth] Profile lookup error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch profile.' });
    }
});

router.put('/profile', requireAuth, async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    // Basic email validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
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
        console.error('[Auth] Profile update error:', err.message);
        return res.status(500).json({ message: 'Failed to update profile.' });
    }
});

module.exports = router;
