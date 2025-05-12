const Property = require('../models/Property-model');

////////////Create new property//////////////////
const createProperty = async (req, res) => {
  try {
    const property = new Property({
      ...req.body,
      owner: req.user, 
    });

    await property.save();
    res.status(201).json({ msg: 'Property created successfully', property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Property creation failed' });
  }
};

//////////// Get all properties ////////////////////////
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'username email');
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error getting properties' });
  }
};

/////////////// Get property by id////////////////
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'username email');
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch property' });
  }
};

///////////////// Update property //////////////////////
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    if (property.owner.toString() !== req.user) {
      return res.status(403).json({ msg: 'Unauthorized: Who are you Dawg (This is not your property)' });
    }

    Object.assign(property, req.body);
    await property.save();

    res.json({ msg: 'Property updated', property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating property' });
  }
};

/////////////// Delete property //////////////
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    if (property.owner.toString() !== req.user) {
      return res.status(403).json({ msg: 'Unauthorized: what the dog doin (This is not your property) ??' });
    }

    await property.remove();
    res.json({ msg: 'Property deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete property' });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
