const Property = require('../models/Property-model');

const createProperty = async (req, res) => {
  const { title, description, rent, address, landlordId } = req.body;

  try {
    const newProperty = new Property({
      title,
      description,
      rent,
      address,
      landlordId,
    });

    await newProperty.save();
    res.json({ msg: 'Property created successfully', property: newProperty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'property creation failed' });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error getting properties' });
  }
};

module.exports = { createProperty, getAllProperties };
