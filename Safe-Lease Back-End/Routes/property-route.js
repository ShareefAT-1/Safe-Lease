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
const { upload } = require('../middleware/uploadMiddleware');

router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('image'), (req, res, next) => {
  console.log("Request received:", req.body);
  console.log("Image file:", req.file);
  createProperty(req, res, next); 
});

router.get('/', getAllProperties);

router.get('/search', searchProperties); 

router.get('/:id', getPropertyById);


router.put('/:id', authMiddleware, roleMiddleware('landlord'), upload.single('image'), updateProperty);

router.delete('/:id', authMiddleware, roleMiddleware('landlord'), deleteProperty);

module.exports = router;