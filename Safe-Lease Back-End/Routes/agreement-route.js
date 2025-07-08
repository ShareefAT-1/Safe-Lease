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

const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('signatureImage'), createAgreement);
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), updateAgreementStatus);
router.put('/negotiate/:id', authMiddleware, roleMiddleware('landlord'), negotiateAgreement);
router.get('/landlord-requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);
router.get('/:id', authMiddleware, getAgreementById);

module.exports = router;