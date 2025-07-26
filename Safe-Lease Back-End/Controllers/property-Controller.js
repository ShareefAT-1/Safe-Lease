// Safe-Lease Back-End/Controllers/property-Controller.js

const Property = require('../models/Property-model');

// --- UPDATED: createProperty now handles multiple files ---
const createProperty = async (req, res) => {
    try {
        const {
            title, description, address, city, state, zipCode,
            price, propertyType, bedrooms, bathrooms, area, available, listingType
        } = req.body;

        // --- NEW: Map the array of uploaded files to an array of their paths ---
        const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

        const propertyData = {
            title, description, address, city, state, zipCode,
            price: Number(price),
            propertyType,
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            area: Number(area),
            available: available === 'true',
            listingType,
            owner: req.user._id, // Use the authenticated user's ID
            images: imagePaths // --- UPDATED: Use the new images array ---
        };

        const property = new Property(propertyData);
        await property.save();
        res.status(201).json({ msg: 'Property created successfully', property });
    } catch (err) {
        console.error('CREATE PROPERTY ERROR:', err);
        res.status(500).json({ msg: 'Property creation failed', error: err.message });
    }
};

const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate('owner', 'name email'); // Changed from username
        res.json(properties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error getting properties' });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email'); // Changed from username
        if (!property) return res.status(404).json({ msg: 'Property not found' });
        res.json(property);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch property' });
    }
};

// --- UPDATED: updateProperty now handles multiple files ---
const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Unauthorized: This is not your property' });
        }

        const {
            title, description, address, city, state, zipCode, price,
            propertyType, bedrooms, bathrooms, area, available, listingType
        } = req.body;

        // Update text fields
        property.title = title || property.title;
        property.description = description || property.description;
        property.address = address || property.address;
        property.city = city || property.city;
        property.state = state || property.state;
        property.zipCode = zipCode || property.zipCode;
        property.price = Number(price) || property.price;
        property.propertyType = propertyType || property.propertyType;
        property.bedrooms = Number(bedrooms) || property.bedrooms;
        property.bathrooms = Number(bathrooms) || property.bathrooms;
        property.area = Number(area) || property.area;
        if (available !== undefined) {
            property.available = available === 'true';
        }
        property.listingType = listingType || property.listingType;

        // --- NEW: Handle image updates. This logic replaces all existing images with new ones.
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => file.path.replace(/\\/g, '/'));
            property.images = newImagePaths;
        }

        await property.save();
        res.json({ msg: 'Property updated', property });
    } catch (err) {
        console.error('UPDATE PROPERTY ERROR:', err);
        res.status(500).json({ msg: 'Error updating property', error: err.message });
    }
};

const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Unauthorized: This is not your property' });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Property deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to delete property' });
    }
};

const searchProperties = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query parameter "q" is required' });
        }
        const searchQuery = new RegExp(q, 'i');
        const properties = await Property.find({
            $or: [
                { title: searchQuery }, { address: searchQuery }, { description: searchQuery },
                { city: searchQuery }, { state: searchQuery }
            ]
        }).populate('owner', 'name email');
        res.json({ properties });
    } catch (error) {
        console.error('PROPERTY SEARCH ERROR:', error);
        res.status(500).json({ error: 'Failed to search properties' });
    }
};

module.exports = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    searchProperties,
};
