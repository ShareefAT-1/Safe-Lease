const express = require('express');
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../Controllers/property-Controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, roleMiddleware('landlord'), createProperty);
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.put('/:id', authMiddleware, roleMiddleware('landlord'), updateProperty);
router.delete('/:id', authMiddleware, roleMiddleware('landlord'), deleteProperty);

module.exports = router;
