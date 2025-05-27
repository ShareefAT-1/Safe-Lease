const express = require('express');
const router = express.Router();
const {
  createAgreement,
  requestAgreement,
  updateAgreementStatus,
  getRequestsForLandlord
} = require('../Controllers/agreement-Controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, roleMiddleware('landlord'), createAgreement);
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), updateAgreementStatus);
router.get('/requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);

module.exports = router;
