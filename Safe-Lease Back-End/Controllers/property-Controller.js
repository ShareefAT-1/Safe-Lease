const Property = require('../models/Property-model');

//////////// Create new property //////////////////
const createProperty = async (req, res) => {
  try {
    console.log('REQ.USER:', req.user);
    console.log('REQ.BODY:', req.body);
    console.log('REQ.FILE:', req.file);

    const {
      title,
      description,
      address,
      city,
      state,
      zipCode,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      available,
      listingType
    } = req.body;

    const propertyData = {
      title,
      description,
      address,
      city,
      state,
      zipCode,
      price: Number(price),
      propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      available: available === 'true',
      listingType,
      owner: req.user,
      image: req.file ? req.file.path : null
    };

    const property = new Property(propertyData);

    await property.save();
    res.status(201).json({ msg: 'Property created successfully', property });
  } catch (err) {
    console.error('CREATE PROPERTY ERROR:', err);
    res.status(500).json({ msg: 'Property creation failed', error: err.message });
  }
};

//////////// Get all properties ////////////////////
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'username email');
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error getting properties' });
  }
};

/////////////// Get property by ID /////////////////
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

///////////////// Update property //////////////////
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    if (property.owner.toString() !== req.user) {
      return res.status(403).json({ msg: 'Unauthorized: This is not your property' });
    }

    const {
      title,
      description,
      address,
      city,
      state,
      zipCode,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      available,
      listingType
    } = req.body;   

    property.title = title;
    property.description = description;
    property.address = address;
    property.city = city;
    property.state = state;
    property.zipCode = zipCode;
    property.price = Number(price);
    property.propertyType = propertyType;
    property.bedrooms = Number(bedrooms);
    property.bathrooms = Number(bathrooms);
    property.area = Number(area);
    property.available = available === 'true';
    property.listingType = listingType;

    if (req.file) {
      property.image = req.file.path;
    }

    await property.save();
    res.json({ msg: 'Property updated', property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating property' });
  }
};

/////////////// Delete property ///////////////////
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    if (property.owner.toString() !== req.user) {
      return res.status(403).json({ msg: 'Unauthorized: This is not your property' });
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
