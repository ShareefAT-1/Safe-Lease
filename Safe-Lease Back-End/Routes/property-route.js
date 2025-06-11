const express = require('express');
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties // <--- IMPORT THE NEW searchProperties FUNCTION
} = require('../Controllers/property-Controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Route for creating a new property (requires landlord role and image upload)
router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('image'), (req, res, next) => {
  console.log("Request received:", req.body);
  console.log("Image file:", req.file);
  createProperty(req, res, next); // Call the createProperty controller function
});

// Route for getting all properties
router.get('/', getAllProperties);

// NEW ROUTE: Route for searching properties
router.get('/search', searchProperties); // <--- ADDED ROUTE FOR SEARCH

// Route for getting a single property by ID
router.get('/:id', getPropertyById);


// Route for updating a property by ID (requires landlord role and optional image upload)
router.put('/:id', authMiddleware, roleMiddleware('landlord'), upload.single('image'), updateProperty);

// Route for deleting a property by ID (requires landlord role)
router.delete('/:id', authMiddleware, roleMiddleware('landlord'), deleteProperty);

module.exports = router;