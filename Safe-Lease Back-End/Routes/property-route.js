// Safe-Lease Back-End/Routes/property-route.js

const express = require('express');
const router = express.Router();
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    searchProperties
} = require('../Controllers/property-Controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware.js');

// --- UPDATED: Changed upload.single('image') to upload.array('images', 10) ---
router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.array('images', 10), createProperty);

router.get('/', getAllProperties);
router.get('/search', searchProperties);
router.get('/:id', getPropertyById);

// --- UPDATED: Changed upload.single('image') to upload.array('images', 10) ---
router.put('/:id', authMiddleware, roleMiddleware('landlord'), upload.array('images', 10), updateProperty);

router.delete('/:id', authMiddleware, roleMiddleware('landlord'), deleteProperty);

module.exports = router;
