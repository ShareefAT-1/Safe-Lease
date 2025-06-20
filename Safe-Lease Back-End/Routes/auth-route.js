const express = require('express');
const router = express.Router();
// IMPORTANT: Ensure getUserById is imported here
const { registerUser, loginUser, getUserById } = require('../Controllers/auth-Controller');

// Ensure 'middleware' folder casing matches your actual directory name
const authMiddleware = require('../middleware/authMiddleware'); 
const roleMiddleware = require('../middleware/roleMiddleware');


// Public routes (no authentication needed)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Authenticated route to get current user details
router.get('/me', authMiddleware, (req, res) => {
    if (req.user) {
        const userDetails = {
            _id: req.user._id,
            name: req.user.name, // Use 'name' as per your User model
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone, // Include if populated by authMiddleware
            profilePic: req.user.profilePic // Include if populated by authMiddleware
        };
        res.status(200).json({ user: userDetails });
    } else {
        res.status(404).json({ message: 'User data not found after authentication.' });
    }
});

// NEW ROUTE: Get a specific user by ID
// This route is unprotected for now to allow CreateAgreementPage to fetch owner details
// Consider adding authMiddleware if you want to restrict this to logged-in users only.
router.get('/:id', getUserById); 

// Role-specific routes (require both authentication and role check)
router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.json({ msg: 'Welcome to the Admin Dashboard', user: req.user });
});

router.get('/landlord-dashboard', authMiddleware, roleMiddleware('landlord'), (req, res) => {
    res.json({ msg: 'Welcome to the Landlord Dashboard', user: req.user });
});

module.exports = router;