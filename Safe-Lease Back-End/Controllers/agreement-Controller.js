// Safe-Lease Back-End/Controllers/agreement-Controller.js

const Agreement = require('../models/Agreement-model');
const User = require('../models/User-model'); // Assuming User model has name, email, role
const Property = require('../models/Property-model'); // Assuming Property model has title, address, rent
const generateAgreementPDF = require('../utils/generatePDF'); // Make sure this utility exists and works
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Helper to validate MongoDB ObjectIDs
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- Existing Controller Functions (confirm these are present and correct) ---

// Example: requestAgreement (for tenant to create a new request)
exports.requestAgreement = async (req, res) => {
    try {
        const { property, landlord, rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms, message } = req.body;
        const tenantId = req.user._id; // Get tenant ID from authenticated user

        if (!isValidObjectId(property) || !isValidObjectId(landlord)) {
            return res.status(400).json({ message: 'Invalid Property ID or Landlord ID.' });
        }
        if (!rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths || !agreementTerms) {
            return res.status(400).json({ message: 'All requested terms are required.' });
        }

        // Check if property and landlord exist
        const existingProperty = await Property.findById(property);
        if (!existingProperty) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        const existingLandlord = await User.findById(landlord);
        if (!existingLandlord || existingLandlord.role !== 'landlord') {
            return res.status(404).json({ message: 'Landlord not found or is not a landlord.' });
        }

        const newAgreement = new Agreement({
            property,
            landlord,
            tenant: tenantId,
            status: 'pending', // Initial status
            requestedTerms: {
                rent: rentAmount,
                deposit: depositAmount,
                moveInDate: new Date(startDate),
                leaseTerm: leaseTermMonths,
                endDate: new Date(endDate)
            },
            agreementTerms: agreementTerms, // Tenant's proposed full terms
            requestMessage: message, // Tenant's message
            landlordSigned: false,
            tenantSigned: false,
            // final terms are not set yet
        });

        await newAgreement.save();

        res.status(201).json({ message: 'Agreement request sent successfully!', agreement: newAgreement });
    } catch (error) {
        console.error('Error creating agreement request:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: 'Validation failed', errors: errors });
        }
        res.status(500).json({ message: 'Server error sending agreement request.' });
    }
};

// Example: updateAgreementStatus (can be used for 'rejected' or other simple status updates)
exports.updateAgreementStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID.' });
        }
        if (!['rejected', 'cancelled', 'active', 'archived'].includes(status)) { // Add valid statuses
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const agreement = await Agreement.findById(id);

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found.' });
        }

        // Ensure only relevant parties can update status
        if (agreement.landlord.toString() !== userId.toString() && agreement.tenant.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this agreement.' });
        }

        // Add logic for specific status transitions if needed
        // E.g., if status is 'active', both must be signed etc.

        agreement.status = status;
        await agreement.save();

        res.status(200).json({ message: `Agreement status updated to ${status}.`, agreement });
    } catch (error) {
        console.error('Error updating agreement status:', error);
        res.status(500).json({ message: 'Server error updating agreement status.' });
    }
};

// --- NEW/UPDATED Landlord-Specific Controller Functions ---

// Get landlord's pending/negotiating requests
exports.getLandlordRequests = async (req, res) => {
    try {
        const landlordId = req.user._id;

        const agreements = await Agreement.find({
            landlord: landlordId,
            status: { $in: ['pending', 'negotiating'] } // Fetch pending and negotiating
        })
        .populate('property', 'title address rent') // Populate necessary property details
        .populate('tenant', 'name lastName email username'); // Populate necessary tenant details

        res.status(200).json({
            message: 'Landlord requests fetched successfully.',
            agreements
        });

    } catch (error) {
        console.error('Error fetching landlord requests:', error);
        res.status(500).json({ message: 'Server error fetching landlord requests.' });
    }
};

// Landlord approves an agreement
exports.approveAgreement = async (req, res) => {
    try {
        const { id } = req.params; // Agreement ID
        const landlordId = req.user._id; // Authenticated landlord's ID
        const signatureImage = req.file; // Signature file from multer upload

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID format.' });
        }
        if (!signatureImage) {
            return res.status(400).json({ message: 'Landlord signature image is required for approval.' });
        }

        const agreement = await Agreement.findById(id);

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found.' });
        }
        if (agreement.landlord.toString() !== landlordId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to approve this agreement.' });
        }
        if (!['pending', 'negotiating'].includes(agreement.status)) {
            return res.status(400).json({ message: `Agreement cannot be approved from status '${agreement.status}'.` });
        }

        // Set final terms from the 'requestedTerms' as they represent the terms the landlord is approving.
        // If it was a negotiation, the requestedTerms would already be updated by the tenant's counter-offer.
        agreement.finalRentAmount = agreement.requestedTerms.rent;
        agreement.finalDepositAmount = agreement.requestedTerms.deposit;
        agreement.finalStartDate = agreement.requestedTerms.moveInDate;
        agreement.finalLeaseTermMonths = agreement.requestedTerms.leaseTerm;
        agreement.finalEndDate = agreement.requestedTerms.endDate;

        agreement.status = 'approved'; // Mark as approved
        agreement.landlordSigned = true;
        agreement.signedDate = new Date(); // Date of landlord signing
        agreement.landlordSignaturePath = signatureImage.path; // Store signature path

        // Prepare data for PDF generation
        const [propertyDetails, tenantDetails, landlordDetails] = await Promise.all([
            Property.findById(agreement.property),
            User.findById(agreement.tenant),
            User.findById(agreement.landlord) // Fetch landlord details for PDF
        ]);

        if (!propertyDetails || !tenantDetails || !landlordDetails) {
            return res.status(404).json({ message: "Could not find all required details for PDF generation." });
        }

        const agreementDataForPdf = {
            agreementId: agreement._id.toString(),
            propertyDetails: propertyDetails.toObject(),
            landlordDetails: landlordDetails.toObject(), // Use fetched landlord details
            tenantDetails: tenantDetails.toObject(),
            rentAmount: agreement.finalRentAmount,
            depositAmount: agreement.finalDepositAmount,
            startDate: agreement.finalStartDate.toLocaleDateString('en-IN'),
            endDate: agreement.finalEndDate.toLocaleDateString('en-IN'),
            leaseTermMonths: agreement.finalLeaseTermMonths,
            agreementTerms: agreement.agreementTerms, // General terms
            landlordSignaturePath: agreement.landlordSignaturePath, // Use stored path
            signedDate: agreement.signedDate.toLocaleDateString('en-IN'),
            tenantSignaturePath: null // Will be updated when tenant signs
        };

        const pdfFileName = `agreement-${agreement._id}.pdf`;
        const pdfFilePath = path.join(__dirname, '../uploads/agreements', pdfFileName);

        await generateAgreementPDF(agreementDataForPdf, pdfFilePath);
        agreement.pdfPath = `/uploads/agreements/${pdfFileName}`;

        await agreement.save();

        res.status(200).json({
            message: 'Agreement approved and finalized by landlord!',
            agreement,
            pdfPath: agreement.pdfPath
        });

    } catch (error) {
        console.error('Error approving agreement:', error);
        // Clean up uploaded signature if PDF generation fails
        if (signatureImage && fs.existsSync(signatureImage.path)) {
            fs.unlinkSync(signatureImage.path);
        }
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: 'Validation failed', errors: errors });
        }
        res.status(500).json({ message: 'Server error approving agreement.' });
    }
};

// Landlord negotiates terms
exports.negotiateAgreement = async (req, res) => {
    try {
        const { id } = req.params; // Agreement ID
        const landlordId = req.user._id; // Authenticated landlord's ID
        // Destructure the new terms sent from the frontend form
        const { rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms, message } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID format.' });
        }
        // Basic validation for required fields for negotiation
        if (!rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths || !agreementTerms) {
            return res.status(400).json({ message: "Missing required negotiation terms." });
        }

        const agreement = await Agreement.findById(id);

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found.' });
        }
        if (agreement.landlord.toString() !== landlordId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to negotiate this agreement.' });
        }
        if (!['pending', 'negotiating'].includes(agreement.status)) {
            return res.status(400).json({ message: `Agreement cannot be negotiated from status '${agreement.status}'.` });
        }

        // Update the 'requestedTerms' with the landlord's new proposal
        // This makes the 'requestedTerms' always reflect the *latest* proposed terms,
        // whether by tenant or landlord.
        agreement.requestedTerms = {
            rent: rentAmount,
            deposit: depositAmount,
            moveInDate: new Date(startDate), // Use as the new proposed start date
            leaseTerm: leaseTermMonths,
            endDate: new Date(endDate),
        };
        agreement.agreementTerms = agreementTerms; // Landlord's proposed full general terms
        agreement.requestMessage = message; // Landlord's message back to tenant

        agreement.status = 'negotiating'; // Set status to negotiating
        agreement.lastNegotiatedBy = landlordId; // Track who last negotiated

        await agreement.save();

        res.status(200).json({
            message: 'Negotiation terms sent! Tenant has been notified.',
            agreement
        });

    } catch (error) {
        console.error('Error negotiating agreement:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: 'Validation failed', errors: errors });
        }
        res.status(500).json({ message: 'Server error negotiating agreement.' });
    }
};