const Agreement = require('../models/Agreement-model');
const generateAgreementPDF = require('../utils/generatePDF');
const path = require('path');

exports.createAgreement = async (req, res) => {
  try {
    const { tenant, property, startDate, endDate, rentAmount, agreementTerms } = req.body;

    const agreement = new Agreement({
      tenant,
      landlord: req.user, 
      property,
      startDate,
      endDate,
      rentAmount,
      agreementTerms,
    });

    await agreement.save();

    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('tenant', 'name')
      .populate('landlord', 'name')
      .populate('property','title'); 
      // console.log('Populated Agreement Property:', populatedAgreement.property);

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
