const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Condo', 'Land'], 
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Rented', 'Sold'], 
    default: 'Available',
  },
  images: [String], 
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
