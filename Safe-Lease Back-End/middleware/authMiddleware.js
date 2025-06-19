const jwt = require('jsonwebtoken');
const User = require('../models/User-model'); // Make sure this path is correct

const authMiddleware = async (req, res, next) => { // <--- MUST BE ASYNC
    const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

    // For debugging:
    // console.log('--- Auth Middleware Start ---');
    // console.log('Raw Authorization header:', req.header('Authorization'));
    // console.log('Extracted Token:', token ? token.substring(0, 30) + '...' : 'No token');

    if (!token) {
        // console.log('Error: No token, authorization denied.');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // For debugging:
        // console.log("Decoded token payload:", decoded); 
        // console.log("JWT Secret used for verification:", process.env.JWT_SECRET);

        // IMPORTANT: Check if decoded.userId exists
        if (!decoded.userId) { // <--- Checks for 'userId' from the token
            // console.log("Error: Decoded token does not contain 'userId' field.");
            return res.status(401).json({ msg: 'Token valid but missing userId payload' });
        }

        // IMPORTANT: Fetch the user from the database and attach to req.user
        req.user = await User.findById(decoded.userId).select('-password'); 
        if (!req.user) {
            // console.log('Error: User not found in database for ID:', decoded.userId);
            return res.status(401).json({ msg: 'User not found in database' });
        }

        req.userId = decoded.userId; // Also attach userId directly for convenience
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
        // console.log('--- Auth Middleware End ---');
    }
};

module.exports = authMiddleware; // <--- MUST BE EXPORTED