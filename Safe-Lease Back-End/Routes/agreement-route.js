// Safe-Lease-Back-End/Routes/agreement-route.js

const express = require('express');
const router = express.Router();

// This require statement is now complete and correct
const {
    createAgreement,
    requestAgreement,
    updateAgreementStatus,
    getRequestsForLandlord,
    getAgreementById,
    negotiateAgreement,
    getRequestsForTenant,
    signAsTenant
} = require('../Controllers/agreement-Controller');

const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

// --- ALL ROUTES ARE NOW CORRECTLY DEFINED ---

// POST routes
router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('signatureImage'), createAgreement);
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);

// PUT routes for responding and negotiating
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), upload.single('signature'), updateAgreementStatus);
router.put('/negotiate/:id', authMiddleware, roleMiddleware('landlord'), negotiateAgreement);
router.put('/tenant-sign/:id', authMiddleware, roleMiddleware('tenant'), upload.single('signature'), signAsTenant);

// GET routes for dashboards
router.get('/landlord-requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);
router.get('/tenant-requests', authMiddleware, roleMiddleware('tenant'), getRequestsForTenant);

// GET route for a single agreement (must be last to avoid capturing other routes)
router.get('/:id', authMiddleware, getAgreementById);

module.exports = router;
