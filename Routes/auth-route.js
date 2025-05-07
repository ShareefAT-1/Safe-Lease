const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../Controllers/auth-Controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ msg: 'Welcome to the Admin Dashboard' });
});

router.get('/landlord-dashboard', authMiddleware, roleMiddleware('landlord'), (req, res) => {
  res.json({ msg: 'Welcome to the Landlord Dashboard' });
});

module.exports = router;
