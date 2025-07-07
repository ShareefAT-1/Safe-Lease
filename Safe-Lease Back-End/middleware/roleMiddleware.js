const User = require('../models/User-model');

const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // Use req.user._id if authMiddleware attaches the full user object to req.user
        // Or req.userId if it only attaches the ID to req.userId
        // Assuming req.user is populated by authMiddleware with user details including ID and role
        User.findById(req.user._id) // Changed from req.user.id to req.user._id for consistency
            .then(user => {
                if (!user) {
                    return res.status(404).json({ msg: 'User not found' });
                }

                console.log('User role:', user.role);

                if (user.role !== requiredRole) {
                    return res.status(403).json({ msg: 'Access denied, insufficient privileges' });
                }

                next();
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ msg: 'Server error' });
            });
    };
};

module.exports = roleMiddleware;