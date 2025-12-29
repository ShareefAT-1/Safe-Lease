
const Property = require('../models/Property-model');

// =======================
// CREATE PROPERTY
// =======================
const createProperty = async (req, res) => {
  try {
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
      listingType,
    } = req.body;

    const imagePaths = req.file
      ? [req.file.path.replace(/\\/g, "/")]
      : [];

    const property = new Property({
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
      available: available === "true" || available === true,
      listingType,
      owner: req.user._id,
      images: imagePaths,
    });

    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error("CREATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Property creation failed" });
  }
};


// =======================
// GET ALL PROPERTIES (PUBLIC)
// =======================
const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find()
            .populate('owner', 'name email');
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load properties' });
    }
};

// =======================
// GET PROPERTY BY ID
// =======================
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name email');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(property);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch property' });
    }
};

// =======================
// GET PROPERTIES BY OWNER (LANDLORD)
// =======================
const getPropertiesByOwner = async (req, res) => {
    try {
        const { userId } = req.params;

        // Security: landlord can only see own properties
        if (req.user._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // ✅ FORCE images field to be returned
        const properties = await Property.find({ owner: userId })
            .sort({ createdAt: -1 });


        res.json(properties);
    } catch (err) {
        console.error('GET OWNER PROPERTIES ERROR:', err);
        res.status(500).json({ message: 'Failed to load owner properties' });
    }
};
// GET properties of a landlord (PUBLIC)
const getPropertiesByLandlordPublic = async (req, res) => {
    try {
        const { landlordId } = req.params;

        const properties = await Property.find({ owner: landlordId })
            .sort({ createdAt: -1 });

        const normalized = properties.map(p => {
            const obj = p.toObject();

            return {
                ...obj,
                title:
                    obj.title?.trim() ||
                    obj.propertyName?.trim() ||
                    "Untitled Property",
            };
        });

        res.json(normalized);
    } catch (err) {
        console.error("PUBLIC LANDLORD PROPERTIES ERROR:", err);
        res.status(500).json({ message: "Failed to load landlord properties" });
    }
};

// =======================
// UPDATE PROPERTY
// =======================
const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
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
            listingType,
        } = req.body;

        if (title !== undefined) property.title = title;
        if (description !== undefined) property.description = description;
        if (address !== undefined) property.address = address;
        if (city !== undefined) property.city = city;
        if (state !== undefined) property.state = state;
        if (zipCode !== undefined) property.zipCode = zipCode;
        if (price !== undefined) property.price = Number(price);
        if (propertyType !== undefined) property.propertyType = propertyType;
        if (bedrooms !== undefined) property.bedrooms = Number(bedrooms);
        if (bathrooms !== undefined) property.bathrooms = Number(bathrooms);
        if (area !== undefined) property.area = Number(area);
        if (available !== undefined) property.available = available === 'true';
        if (listingType !== undefined) property.listingType = listingType;

        // ✅ DO NOT wipe images unless new ones are uploaded
        if (req.files && req.files.length > 0) {
            property.images = req.files.map(file =>
                file.path.replace(/\\/g, '/')
            );
        }

        await property.save();
        res.json(property);
    } catch (err) {
        console.error('UPDATE PROPERTY ERROR:', err);
        res.status(500).json({ message: 'Update failed' });
    }
};


// =======================
// DELETE PROPERTY
// =======================
const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await property.deleteOne();
        res.json({ message: 'Property deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

// =======================
// SEARCH PROPERTIES
// =======================
const searchProperties = async (req, res) => {
    // const sample = await Property.findOne();
    // console.log("SAMPLE PROPERTY:", sample);

    try {
        const q = req.query.q;
        if (!q) {
            return res.status(400).json({ message: 'Search query required' });
        }

        const regex = new RegExp(q, 'i');

        const properties = await Property.find({
            $or: [
                { propertyName: regex },
                { location: regex },
                { description: regex },
                { type: regex },
                { status: regex }
            ]
        }).populate("owner", "name email");


        res.json({ properties });
    } catch (err) {
        res.status(500).json({ message: 'Search failed' });
    }
};

module.exports = {
    createProperty,
    getAllProperties,
    getPropertyById,
    getPropertiesByOwner,
    getPropertiesByLandlordPublic,
    updateProperty,
    deleteProperty,
    searchProperties,
};
