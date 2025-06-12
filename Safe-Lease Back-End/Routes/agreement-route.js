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
const { upload } = require('../middleware/uploadMiddleware'); // <--- Import your upload middleware

// Apply multer middleware to the create route for signature image
router.post('/create', authMiddleware, roleMiddleware('landlord'), upload.single('signatureImage'), createAgreement); // <--- ADDED upload.single('signatureImage')
router.post('/request', authMiddleware, roleMiddleware('tenant'), requestAgreement);
router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), updateAgreementStatus);
router.get('/requests', authMiddleware, roleMiddleware('landlord'), getRequestsForLandlord);

module.exports = router;