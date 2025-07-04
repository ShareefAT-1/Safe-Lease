const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'negotiating', 'active', 'expired', 'cancelled'],
        default: 'pending',
    },
    // Original terms requested by the tenant
    requestedTerms: {
        rent: { type: Number, required: true },
        deposit: { type: Number, required: true },
        moveInDate: { type: Date, required: true },
        leaseTerm: { type: Number, required: true }, // Lease term in months
        endDate: { type: Date, required: true },
    },
    // Current or finalized terms (these get updated during negotiation)
    finalRentAmount: {
        type: Number,
        required: function() { return ['approved', 'active', 'expired', 'negotiating'].includes(this.status); }
    },
    finalDepositAmount: {
        type: Number,
        required: function() { return ['approved', 'active', 'expired', 'negotiating'].includes(this.status); }
    },
    finalStartDate: {
        type: Date,
        required: function() { return ['approved', 'active', 'expired', 'negotiating'].includes(this.status); }
    },
    finalLeaseTermMonths: {
        type: Number,
        required: function() { return ['approved', 'active', 'expired', 'negotiating'].includes(this.status); }
    },
    finalEndDate: {
        type: Date,
        required: function() { return ['approved', 'active', 'expired', 'negotiating'].includes(this.status); }
    },
    agreementTerms: { // General agreement clauses/text
        type: String,
        required: true,
    },
    requestMessage: { // Optional message from tenant when initiating request
        type: String,
    },
    lastNegotiatedBy: { // Tracks who made the last change in negotiation
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    landlordSigned: {
        type: Boolean,
        default: false,
    },
    tenantSigned: {
        type: Boolean,
        default: false,
    },
    signedDate: {
        type: Date,
    },
    pdfPath: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);