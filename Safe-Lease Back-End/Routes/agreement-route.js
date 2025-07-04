// Safe-Lease Back-End/routes/agreement-route.js

const express = require('express');
const router = express.Router();
const {
    createAgreement,
    requestAgreement,
    updateAgreementStatus,
    getRequestsForLandlord,
    getAgreementById, // We will add this to the controller
    negotiateAgreement // We will add/refactor this in the controller
} = require('../Controllers/agreement-Controller'); // Ensure path is correct

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // For signature image upload

// Route to create/sign an agreement (typically by landlord after negotiation/request)
// This route expects a signature image upload
router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('signatureImage'), createAgreement);

// Route for a tenant to request an agreement
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);

// Route for a landlord to update agreement status (approve/reject)
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), updateAgreementStatus);

// Route for a landlord to negotiate terms of an agreement
router.put('/negotiate/:id', authMiddleware, roleMiddleware('landlord'), negotiateAgreement); // Will be implemented in controller

// Route to get all pending requests for a specific landlord
router.get('/requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);

// Route to get a single agreement by ID (useful for both landlord and tenant to view details)
router.get('/:id', authMiddleware, getAgreementById); // Will be implemented in controller

module.exports = router;