const express = require('express');
const router = express.Router();
const {
    createAgreement,
    requestAgreement,
    updateAgreementStatus,
    getRequestsForLandlord,
    getAgreementById,
    negotiateAgreement
} = require('../Controllers/agreement-Controller');

// --- CRUCIAL CHANGES: Added .js extensions and removed destructuring for 'upload' ---
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js'); // Removed curly braces

router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('signatureImage'), createAgreement);
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), updateAgreementStatus);
router.put('/negotiate/:id', authMiddleware, roleMiddleware('landlord'), negotiateAgreement);
router.get('/requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);
router.get('/:id', authMiddleware, getAgreementById);

module.exports = router;