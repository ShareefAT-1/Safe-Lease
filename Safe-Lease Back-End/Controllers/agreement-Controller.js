const Agreement = require('../models/Agreement-model');
const generateAgreementPDF = require('../utils/generatePDF');
const path = require('path');

exports.createAgreement = async (req, res) => {
  try {
    const { tenant, property, startDate, endDate, rentAmount, agreementTerms } = req.body;

    const agreement = new Agreement({
      tenant,
      landlord: req.user._id,  
      property,
      startDate,
      endDate,
      rentAmount,
      agreementTerms,
      status: 'approved',
    });

    await agreement.save();

    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('tenant', 'name')
      .populate('landlord', 'name')
      .populate('property', 'title');

    const filePath = path.join(__dirname, '..', 'agreements', `${agreement._id}.pdf`);
    await generateAgreementPDF(populatedAgreement, filePath);

    res.status(201).json({
      message: 'Agreement created successfully',
      agreementId: agreement._id,
      pdfPath: `/agreements/${agreement._id}.pdf`,
    });
  } catch (err) {
    console.error('Agreement creation failed:', err);
    res.status(500).json({ error: 'Failed to create agreement' });
  }
};

exports.requestAgreement = async (req, res) => {
  try {

    console.log("hrty",req.user);
    
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
    const landlordId = req.user._id;

    const requests = await Agreement.find({ landlord: landlordId, status: 'pending' })
      .populate('tenant', 'name email')
      .populate('property', 'title');

    res.json({ requests });
  } catch (err) {
    console.error('Fetch requests failed:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};
