const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  agreementTerms: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'signed', 'cancelled'],
    default: 'pending',
    required: true,
  },
  signed: {
    type: Boolean,
    default: false,
  },
  // --- ADD THESE NEW FIELDS FOR SIGNATURE IMAGES ---
  landlordSignatureImage: { // Path to landlord's signature image
    type: String,
    default: null, // Null until signed
  },
  tenantSignatureImage: { // Path to tenant's signature image
    type: String,
    default: null, // Null until signed
  },
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);