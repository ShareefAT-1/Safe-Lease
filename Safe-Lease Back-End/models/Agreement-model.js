// Safe-Lease Back-End/models/Agreement-model.js

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
    // The terms proposed by the tenant
    requestedTerms: {
        rent: {
            type: Number,
            required: true,
        },
        deposit: {
            type: Number,
            required: true,
        },
        moveInDate: { // Renamed from startDate for clarity with tenant's request
            type: Date,
            required: true,
        },
        leaseTerm: { // In months
            type: Number,
            required: true,
        },
        endDate: { // Calculated on frontend, stored here
            type: Date,
            required: true,
        },
    },
    // General agreement terms (textual, can be modified during negotiation)
    agreementTerms: {
        type: String,
        required: true,
    },
    // Optional message from tenant
    requestMessage: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'signed', 'negotiating', 'cancelled'], // Added 'negotiating'
        default: 'pending',
        required: true,
    },
    signed: {
        type: Boolean,
        default: false,
    },
    landlordSignatureImage: {
        type: String,
        default: null,
    },
    tenantSignatureImage: {
        type: String,
        default: null,
    },
    // Fields for the *final* agreed-upon terms, once approved/signed
    // These could be populated from requestedTerms or negotiation terms
    finalRentAmount: {
        type: Number,
        default: null,
    },
    finalStartDate: {
        type: Date,
        default: null,
    },
    finalEndDate: {
        type: Date,
        default: null,
    },
    finalAgreementTerms: { // If terms can change during negotiation
        type: String,
        default: null,
    },
    // Add a field to track who last updated the agreement if needed for negotiation
    lastNegotiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);