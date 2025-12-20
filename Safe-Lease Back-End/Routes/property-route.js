// Safe-Lease Back-End/Routes/property-route.js

const express = require('express');
const router = express.Router();

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByOwner,
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

// Get all properties (public)
router.get('/', getAllProperties);

// Search properties
router.get('/search', searchProperties);

// ✅ Get properties by owner (landlord dashboard / profile)
router.get(
  '/owner/:userId',
  authMiddleware,
  roleMiddleware('landlord'),
  getPropertiesByOwner
);

// Get single property
router.get('/:id', getPropertyById);

// Update property (landlord only)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('landlord'),
  upload.array('images', 10),
  updateProperty
);

// Delete property (landlord only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('landlord'),
  deleteProperty
);

module.exports = router;
