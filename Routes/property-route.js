const express = require('express');
const router = express.Router();
const { createProperty, getAllProperties } = require('../Controllers/property-Controller');

router.post('/create', createProperty);

router.get('/', getAllProperties);

module.exports = router;
