const User = require('../models/User-model'); // Make sure this path is correct relative to your controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
    const { name, email, password, role, phone, profilePic } = req.body;
    if (!name || !email || !password || !role || !phone) {
        return res.status(400).json({ message: 'Please provide name, email, password, role, and phone.' });
    }
    const validRoles = ['landlord', 'tenant'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role, please choose either landlord or tenant.' });
    }
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'User already exists!' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name, email, password: hashedPassword, role, phone, profilePic,
        });
        await newUser.save();
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.status(201).json({
            message: 'Registration successful!',
            user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, profilePic: newUser.profilePic },
            token,
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed!' });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.status(200).json({
            message: 'Login successful!',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, profilePic: user.profilePic },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed!' });
    }
};

// NEW FUNCTION: Get a user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id; // Get the ID from the URL parameter

        // Find user and exclude password.
        // Include 'name' as it's used in your other functions.
        const user = await User.findById(userId).select('-password'); 
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return only necessary public user details for the frontend
        res.status(200).json({ 
            _id: user._id,
            name: user.name, 
            email: user.email,
            role: user.role,
            phone: user.phone,
            profilePic: user.profilePic // Include this if it's part of your User model and relevant
        });

    } catch (error) {
        console.error('Error fetching user by ID:', error);
        // Specifically check for invalid MongoDB ObjectId format
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getUserById }; // Export the new function