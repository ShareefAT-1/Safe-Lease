const express = require('express');
const router = express.Router();
const {
    createAgreement,
    requestAgreement,
    updateAgreementStatus,
    getRequestsForLandlord,
    getAgreementById,
    negotiateAgreement,
    getRequestsForTenant // NEW IMPORT
} = require('../Controllers/agreement-Controller');

const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('signatureImage'), createAgreement);
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), upload.single('signature'), updateAgreementStatus);
router.put('/negotiate/:id', authMiddleware, roleMiddleware('landlord'), negotiateAgreement);
router.get('/landlord-requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);
router.get('/tenant-requests', authMiddleware, roleMiddleware('tenant'), getRequestsForTenant); // NEW ROUTE
router.get('/:id', authMiddleware, getAgreementById);

module.exports = router;