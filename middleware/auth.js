const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kidvana_dev_secret_change_me';

function signUserToken(user) {
    return jwt.sign(
        {
            userId: String(user._id || user.phone || ''),
            phone: user.phone,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
        console.warn('[Auth] No token provided in Authorization header');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        req.auth = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        console.error('[Auth] JWT Verification failed:', err.message);
        return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
}

module.exports = {
    requireAuth,
    signUserToken
};
