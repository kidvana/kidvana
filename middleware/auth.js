const jwt = require('jsonwebtoken');

// ── CRITICAL: JWT_SECRET must be set in environment variables ──
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required. Set it in .env file.');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}
const EFFECTIVE_SECRET = JWT_SECRET || 'dev_only_unsafe_secret_' + Date.now();

function signUserToken(user) {
    return jwt.sign(
        {
            userId: String(user._id || user.phone || ''),
            phone: user.phone,
            name: user.name
        },
        EFFECTIVE_SECRET,
        { expiresIn: '7d' }
    );
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        req.auth = jwt.verify(token, EFFECTIVE_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
}

module.exports = {
    requireAuth,
    signUserToken
};
