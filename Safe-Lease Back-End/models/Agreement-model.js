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
  // ADD THIS 'message' FIELD:
  message: {
    type: String,
    default: '', // Set a default empty string if no message is provided
    // You probably don't want 'required: true' for an optional message
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
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);