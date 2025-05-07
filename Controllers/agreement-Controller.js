const Agreement = require('../models/Agreement-model');

const createAgreement = async (req, res) => {
  const { tenantId, landlordId, propertyId, terms } = req.body;

  try {
    const newAgreement = new Agreement({
      tenantId,
      landlordId,
      propertyId,
      terms,
    });

    await newAgreement.save();
    res.json({ msg: 'Agreement created successfully', agreement: newAgreement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create agreement' });
  }
};

module.exports = { createAgreement };
