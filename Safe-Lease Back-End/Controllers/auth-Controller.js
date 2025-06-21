const User = require('../models/User-model'); // Make sure this path is correct relative to your controller 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// REMOVED: const admin = require('firebase-admin'); // Removed Firebase Admin SDK import

// Utility to generate JWT token (keep this as is)
const generateToken = (id, role) => {
    return jwt.sign({ userId: id, role: role }, process.env.JWT_SECRET, { 
        expiresIn: '2h', 
    });
};

// Register User 
const registerUser = async (req, res) => { 
    const { name, email, password, role, phone, profilePic } = req.body; 
    // ... (existing validations) ...
    try { 
        // ... (existing userExists and hashedPassword logic) ...
        const newUser = new User({ 
            name, email, password: hashedPassword, role, phone, profilePic, 
        }); 
        await newUser.save(); 

        // REMOVED: Firebase Custom Token Generation and Firestore User Profile Creation
        // const firebaseUid = newUser._id.toString(); 
        // const firebaseCustomToken = await admin.auth().createCustomToken(firebaseUid, {
        //     role: newUser.role,
        //     backendId: newUser._id.toString()
        // });
        // const db = admin.firestore();
        // const userRef = db.collection('users').doc(firebaseUid);
        // await userRef.set({ name: newUser.name, email: newUser.email, role: newUser.role, backendId: newUser._id.toString() }, { merge: true });

        const token = generateToken(newUser._id, newUser.role); 
        res.status(201).json({ 
            message: 'Registration successful!', 
            user: { 
                _id: newUser._id, 
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role, 
                phone: newUser.phone, 
                profilePic: newUser.profilePic 
            }, 
            token, 
            // REMOVED: firebaseCustomToken, 
            // REMOVED: firebaseUid 
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
        // ... (existing user and password check) ...

        // REMOVED: Firebase Custom Token Generation and Firestore User Profile Creation
        // const firebaseUid = user._id.toString(); 
        // const firebaseCustomToken = await admin.auth().createCustomToken(firebaseUid, {
        //     role: user.role,
        //     backendId: user._id.toString()
        // });
        // const db = admin.firestore();
        // const userRef = db.collection('users').doc(firebaseUid);
        // await userRef.set({ name: user.name, email: user.email, role: user.role, backendId: user._id.toString() }, { merge: true });

        const token = generateToken(user._id, user.role); 
        res.status(200).json({ 
            message: 'Login successful!', 
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                phone: user.phone, 
                profilePic: user.profilePic 
            }, 
            token, 
            // REMOVED: firebaseCustomToken, 
            // REMOVED: firebaseUid 
        }); 
    } catch (err) { 
        console.error('Login error:', err); 
        res.status(500).json({ message: 'Login failed!' }); 
    } 
}; 

// getUserById - Keep this as is, ensure it's exported and used by routes
const getUserById = async (req, res) => { 
    try { 
        const userId = req.params.id; 
        const user = await User.findById(userId).select('-password');  
        if (!user) { 
            return res.status(404).json({ message: 'User not found' }); 
        } 
        res.status(200).json({  
            _id: user._id, 
            name: user.name,  
            email: user.email, 
            role: user.role, 
            phone: user.phone, 
            profilePic: user.profilePic 
        }); 
    } catch (error) { 
        console.error('Error fetching user by ID:', error); 
        if (error.name === 'CastError' && error.path === '_id') { 
            return res.status(400).json({ message: 'Invalid user ID format' }); 
        } 
        res.status(500).json({ message: 'Server error' }); 
    } 
}; 

module.exports = { registerUser, loginUser, getUserById };