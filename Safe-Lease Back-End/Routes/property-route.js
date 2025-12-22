const express = require('express');
const router = express.Router();

const {
    createProperty,
    getAllProperties,
    getPropertyById,
    getPropertiesByOwner,
    getPropertiesByLandlordPublic,
    updateProperty,
    deleteProperty,
    searchProperties
} = require('../Controllers/property-Controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware.js');

// =======================
// PROPERTY ROUTES
// =======================

// Create property (landlord only)
router.post(
    '/create',
    authMiddleware,
    roleMiddleware('landlord'),
    upload.array('images', 10),
    createProperty
);

// ✅ Public landlord listings (TENANT VIEW)
router.get(
    '/landlord/:landlordId',
    getPropertiesByLandlordPublic
);

// Get all properties (public)
router.get('/', getAllProperties);

// Search properties
router.get('/search', searchProperties);

// ✅ Owner listings (LANDLORD DASHBOARD)
router.get(
    '/owner/:userId',
    authMiddleware,
    roleMiddleware('landlord'),
    getPropertiesByOwner
);

// Get single property
router.get('/:id', getPropertyById);

// Update property
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('landlord'),
    upload.array('images', 10),
    updateProperty
);

// Delete property
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('landlord'),
    deleteProperty
);

module.exports = router;
