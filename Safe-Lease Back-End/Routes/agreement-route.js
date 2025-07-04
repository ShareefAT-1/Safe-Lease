// Safe-Lease Back-End/routes/agreement-route.js

const express = require('express');
const router = express.Router();
const agreementController = require('../Controllers/agreement-Controller');
const { verifyToken, isLandlord, isTenant } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Make sure this is correctly set up for file uploads

// --- Existing Routes ---
// Tenant requests a new agreement
router.post('/request', verifyToken, isTenant, agreementController.requestAgreement);

// Tenant or Landlord rejects/updates status (generic for now, can be specialized)
router.put('/:id/status', verifyToken, agreementController.updateAgreementStatus); // For rejection or other simple status updates

// --- NEW/UPDATED Landlord-Specific Routes ---
// Landlord gets all pending/negotiating requests
// Changed from /agreements/requests in your original code to match frontend getLandlordRequests
router.get('/landlord-requests', verifyToken, isLandlord, agreementController.getLandlordRequests);

// Landlord approves an agreement (accepts current terms + signing)
// This route now expects a 'signature' file upload via multer
router.put('/:id/approve', verifyToken, isLandlord, upload.single('signature'), agreementController.approveAgreement);

// Landlord negotiates an agreement (proposing new terms)
router.put('/:id/negotiate', verifyToken, isLandlord, agreementController.negotiateAgreement);

// ... potentially other agreement routes like get single agreement, get tenant's agreements etc.

module.exports = router;