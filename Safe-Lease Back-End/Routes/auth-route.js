const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById } = require('../Controllers/auth-Controller');

const authMiddleware = require('../middleware/authMiddleware'); 
const roleMiddleware = require('../middleware/roleMiddleware');


router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', authMiddleware, (req, res) => {
    if (req.user) {
        const userDetails = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
            profilePic: req.user.profilePic
        };
        res.status(200).json({ user: userDetails });
    } else {
        res.status(404).json({ message: 'User data not found after authentication.' });
    }
});

router.get('/profile/:id', authMiddleware, getUserById);

router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.json({ msg: 'Welcome to the Admin Dashboard', user: req.user });
});

router.get('/landlord-dashboard', authMiddleware, roleMiddleware('landlord'), (req, res) => {
    res.json({ msg: 'Welcome to the Landlord Dashboard', user: req.user });
});

module.exports = router;