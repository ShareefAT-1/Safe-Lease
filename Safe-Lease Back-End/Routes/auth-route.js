const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../Controllers/auth-Controller');

// --- IMPORTANT: Ensure 'middleware' folder casing matches your actual directory name ---
// If your folder is named 'Middleware', change this to require('../Middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); 
const roleMiddleware = require('../middleware/roleMiddleware');

// --- ADD THESE TEMPORARY DEBUG LINES ---
console.log('*** Debug Check: typeof authMiddleware:', typeof authMiddleware); 
console.log('*** Debug Check: typeof roleMiddleware:', typeof roleMiddleware);
// --- END DEBUG LINES ---

// Public routes (no authentication needed)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Authenticated route to get current user details
router.get('/me', authMiddleware, (req, res) => {
    if (req.user) {
        const userDetails = {
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        };
        res.status(200).json({ user: userDetails });
    } else {
        res.status(404).json({ message: 'User data not found after authentication.' });
    }
});

// Role-specific routes (require both authentication and role check)
router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.json({ msg: 'Welcome to the Admin Dashboard', user: req.user });
});

router.get('/landlord-dashboard', authMiddleware, roleMiddleware('landlord'), (req, res) => {
    res.json({ msg: 'Welcome to the Landlord Dashboard', user: req.user });
});

module.exports = router;