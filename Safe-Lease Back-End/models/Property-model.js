// Safe-Lease Back-End/models/Property-model.js

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Studio', 'Condo', 'Villa', 'Penthouse'],
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  area: {
    type: Number, 
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  listingType: {
    type: String,
    enum: ['Sale', 'Lease'],
    required: true
  },
  // --- UPDATED: 'image' is now 'images' to store an array of strings ---
  images: [{
    type: String,
    required: false
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Best practice to require an owner
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
