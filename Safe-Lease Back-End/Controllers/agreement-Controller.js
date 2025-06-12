const Agreement = require('../models/Agreement-model');
const generateAgreementPDF = require('../utils/generatePDF');
const path = require('path');
const fs = require('fs'); // <--- IMPORTANT: Import 'fs' for file system operations (like deleting signature on error)

exports.createAgreement = async (req, res) => {
  try {
    // req.body contains text fields, req.file contains the uploaded signature image
    const { tenant, property, startDate, endDate, rentAmount, agreementTerms } = req.body;

    // --- CHECK FOR SIGNATURE IMAGE ---
    // The 'signatureImage' field in req.file matches the name used in formData.append('signatureImage', ...) on the frontend
    if (!req.file) {
      return res.status(400).json({ error: 'Signature image is required to create an agreement.' });
    }

    // --- CREATE NEW AGREEMENT INSTANCE ---
    const agreement = new Agreement({
      tenant,
      landlord: req.user._id, // Assuming req.user is populated by authMiddleware
      property,
      startDate,
      endDate,
      rentAmount,
      agreementTerms,
      status: 'approved', // Or 'pending-landlord-signed' if you want a new status
      signed: true, // Mark as signed since the landlord is signing it upon creation
      landlordSignatureImage: req.file.path, // <--- SAVE THE PATH OF THE UPLOADED SIGNATURE
    });

    // --- SAVE AGREEMENT TO DATABASE ---
    await agreement.save();

    // --- POPULATE AGREEMENT FOR PDF GENERATION ---
    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('tenant', 'name')
      .populate('landlord', 'name')
      .populate('property', 'title');

    // --- GENERATE AND SAVE PDF ---
    // If you plan to embed the actual signature image into the PDF,
    // you would modify generateAgreementPDF to accept agreement.landlordSignatureImage
    const filePath = path.join(__dirname, '..', 'agreements', `${agreement._id}.pdf`);
    await generateAgreementPDF(populatedAgreement, filePath);

    // --- SEND SUCCESS RESPONSE ---
    res.status(201).json({
      message: 'Agreement created and signed successfully',
      agreementId: agreement._id,
      pdfPath: `/agreements/${agreement._id}.pdf`,
      landlordSignatureImage: agreement.landlordSignatureImage // Optionally return the image path
    });

  } catch (err) {
    console.error('Agreement creation failed:', err);
    // --- ERROR HANDLING: DELETE UPLOADED FILE IF AGREEMENT SAVE FAILS ---
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded signature file after failed agreement creation:', unlinkErr);
      });
    }
    res.status(500).json({ error: 'Failed to create agreement' });
  }
};

exports.requestAgreement = async (req, res) => {
  try {
    console.log("hrty", req.user);

    const {
      propertyId,
      landlordId,
      agreementTerms,
      rentAmount,
      startDate,
      endDate,
      message,
    } = req.body;

    if (!agreementTerms || !rentAmount || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required agreement details' });
    }

    const newRequest = new Agreement({
      property: propertyId,
      landlord: landlordId,
      tenant: req.user.id,
      agreementTerms,
      rentAmount,
      startDate,
      endDate,
      message,
      status: 'pending',
    });

    await newRequest.save();

    res.status(201).json({ message: 'Lease request sent', agreement: newRequest });
  } catch (err) {
    console.error('Request failed:', err);
    res.status(500).json({ error: 'Could not request agreement' });
  }
};

exports.updateAgreementStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const agreementId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedAgreement = await Agreement.findByIdAndUpdate(
      agreementId,
      { status },
      { new: true }
    );

    if (!updatedAgreement) return res.status(404).json({ error: 'Agreement not found' });

    if (status === 'approved') {
      const populatedAgreement = await Agreement.findById(agreementId)
        .populate('tenant', 'name')
        .populate('landlord', 'name')
        .populate('property', 'title');

      const filePath = path.join(__dirname, '..', 'agreements', `${agreementId}.pdf`);
      await generateAgreementPDF(populatedAgreement, filePath);
    }

    res.json({ message: `Agreement ${status}`, agreement: updatedAgreement });
  } catch (err) {
    console.error('Status update failed:', err);
    res.status(500).json({ error: 'Status update failed' });
  }
};

exports.getRequestsForLandlord = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const requests = await Agreement.find({ landlord: landlordId, status: 'pending' })
      .populate('tenant', 'name email')
      .populate('property', 'title propertyName');

    res.json({ requests });
  } catch (err) {
    console.error('Fetch requests failed:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};