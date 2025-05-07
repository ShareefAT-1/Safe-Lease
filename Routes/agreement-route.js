const express = require('express');
const router = express.Router();
const { createAgreement } = require('../Controllers/agreement-Controller');

router.post('/create', createAgreement);

module.exports = router;
