const jwt = require('jsonwebtoken');
const User = require('../models/User-model');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        // console.log('Error: No token, authorization denied.');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded token payload:", decoded);
        // console.log("JWT Secret used for verification:", process.env.JWT_SECRET);

        if (!decoded.userId) {
            // console.log("Error: Decoded token does not contain 'userId' field.");
            return res.status(401).json({ msg: 'Token valid but missing userId payload' });
        }

        req.user = await User.findById(decoded.userId).select('-password');
        if (!req.user) {
            // console.log('Error: User not found in database for ID:', decoded.userId);
            return res.status(401).json({ msg: 'User not found in database' });
        }

        req.userId = decoded.userId; // Also keep req.userId for backward compatibility if needed
        // console.log('Authentication successful for user ID:', req.userId);
        next();
    } catch (err) {
        console.error('Token validation error:', err.message);
        // console.error('Full Token validation error object:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        return res.status(401).json({ msg: 'Token is not valid (general error)' });
    } finally {
    }
};

module.exports = authMiddleware;