const express = require('express');
const router = express.Router();
const { createAgreement } = require('../Controllers/agreement-Controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, roleMiddleware('landlord'), createAgreement);

module.exports = router;
