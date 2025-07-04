// Safe-Lease Back-End/Controllers/agreement-Controller.js

const Agreement = require('../models/Agreement-model');
const User = require('../models/User-model'); // Need User model for validation
const Property = require('../models/Property-model'); // Need Property model for validation
const generateAgreementPDF = require('../utils/generatePDF'); // Assuming this utility exists
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to check if ID is valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Landlord creates/signs an agreement (after negotiation or direct approval)
exports.createAgreement = async (req, res) => {
    try {
        const { tenant, property, agreementTerms, rentAmount, startDate, endDate, status, signed, agreementIdToUpdate } = req.body;

        // If an agreementIdToUpdate is provided, it means we're updating an existing request
        let agreement;
        if (agreementIdToUpdate && isValidObjectId(agreementIdToUpdate)) {
            agreement = await Agreement.findById(agreementIdToUpdate);
            if (!agreement) {
                return res.status(404).json({ error: 'Agreement to update not found.' });
            }
            if (agreement.landlord.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: You are not the landlord of this agreement.' });
            }
        } else {
            // If no ID to update, this is a new agreement being created (less common for "tenant requests")
            // Ensure all required fields are present for a new creation
            if (!tenant || !property || !agreementTerms || !rentAmount || !startDate || !endDate) {
                return res.status(400).json({ error: 'Missing required fields for new agreement creation.' });
            }
            agreement = new Agreement({
                tenant,
                landlord: req.user._id, // Landlord is the authenticated user
                property,
                status: status || 'approved', // Default to approved if not specified
                signed: signed || false,
            });
        }

        // Apply the final terms
        agreement.finalRentAmount = rentAmount;
        agreement.finalStartDate = startDate;
        agreement.finalEndDate = endDate;
        agreement.finalAgreementTerms = agreementTerms;
        agreement.status = status || 'approved'; // Ensure status is updated

        // Handle signature image upload for landlord
        if (!req.file) {
            return res.status(400).json({ error: 'Landlord signature image is required to finalize the agreement.' });
        }
        agreement.landlordSignatureImage = req.file.path;
        agreement.signed = true; // Mark as signed by landlord

        await agreement.save();

        // Populate for PDF generation
        const populatedAgreement = await Agreement.findById(agreement._id)
            .populate('tenant', 'name email')
            .populate('landlord', 'name email')
            .populate('property', 'title address'); // Populate necessary fields for PDF

        const filePath = path.join(__dirname, '..', 'agreements', `${agreement._id}.pdf`);
        await generateAgreementPDF(populatedAgreement, filePath);

        res.status(201).json({
            message: 'Agreement created/updated and signed by landlord successfully',
            agreementId: agreement._id,
            pdfPath: `/agreements/${agreement._id}.pdf`,
            landlordSignatureImage: agreement.landlordSignatureImage
        });

    } catch (err) {
        console.error('Agreement creation failed:', err);
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting uploaded signature file after failed agreement creation:', unlinkErr);
            });
        }
        res.status(500).json({ error: 'Failed to create or finalize agreement' });
    }
};

// Tenant requests an agreement
exports.requestAgreement = async (req, res) => {
    try {
        const { property, landlord, requestedTerms, agreementTerms, requestMessage } = req.body;

        // Frontend sends property and landlord IDs directly, tenant ID from auth
        const tenantId = req.user._id;

        // Basic validation for required fields
        if (!property || !landlord || !requestedTerms || !agreementTerms ||
            !requestedTerms.rent || !requestedTerms.deposit || !requestedTerms.moveInDate ||
            !requestedTerms.leaseTerm || !requestedTerms.endDate) {
            return res.status(400).json({ message: "Missing required fields for agreement request." });
        }

        // Validate ObjectIds and existence
        if (!isValidObjectId(property) || !isValidObjectId(landlord) || !isValidObjectId(tenantId)) {
            return res.status(400).json({ message: "Invalid ID format for property, landlord, or tenant." });
        }

        const [existingProperty, existingLandlord, existingTenant] = await Promise.all([
            Property.findById(property),
            User.findById(landlord),
            User.findById(tenantId)
        ]);

        if (!existingProperty) {
            return res.status(400).json({ message: "Property not found." });
        }
        if (!existingLandlord || existingLandlord.role !== 'landlord') {
            return res.status(400).json({ message: "Invalid landlord or landlord role." });
        }
        if (!existingTenant || existingTenant.role !== 'tenant') {
            return res.status(400).json({ message: "Invalid tenant or tenant role." });
        }
        if (tenantId.toString() !== existingTenant._id.toString()) {
            return res.status(403).json({ message: "Forbidden: Authenticated user is not the tenant specified." });
        }

        const newRequest = new Agreement({
            property: property,
            landlord: landlord,
            tenant: tenantId,
            requestedTerms: { // Store the entire requestedTerms object
                rent: requestedTerms.rent,
                deposit: requestedTerms.deposit,
                moveInDate: requestedTerms.moveInDate,
                leaseTerm: requestedTerms.leaseTerm,
                endDate: requestedTerms.endDate,
            },
            agreementTerms: agreementTerms, // General terms
            requestMessage: requestMessage, // Optional message
            status: 'pending', // Initial status
        });

        await newRequest.save();

        res.status(201).json({ message: 'Lease request sent successfully!', agreement: newRequest });
    } catch (err) {
        console.error('Request failed:', err);
        if (err.name === 'ValidationError') {
            const errors = Object.keys(err.errors).map(key => err.errors[key].message);
            return res.status(400).json({ message: "Validation failed", errors: errors });
        }
        res.status(500).json({ error: 'Could not request agreement' });
    }
};

// Landlord updates agreement status (approve/reject)
exports.updateAgreementStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const agreementId = req.params.id;

        if (!['approved', 'rejected', 'negotiating', 'signed', 'cancelled'].includes(status)) { // Expanded enum
            return res.status(400).json({ error: 'Invalid status provided.' });
        }
        if (!isValidObjectId(agreementId)) {
            return res.status(400).json({ message: "Invalid agreement ID format." });
        }

        const agreement = await Agreement.findById(agreementId);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found.' });
        }
        if (agreement.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden: You are not the landlord of this agreement.' });
        }

        agreement.status = status;

        // If approved, set final terms from requested terms (or current negotiated terms)
        if (status === 'approved') {
            // If already negotiated, use those terms, otherwise use requested terms
            agreement.finalRentAmount = agreement.finalRentAmount || agreement.requestedTerms.rent;
            agreement.finalStartDate = agreement.finalStartDate || agreement.requestedTerms.moveInDate;
            agreement.finalEndDate = agreement.finalEndDate || agreement.requestedTerms.endDate;
            agreement.finalAgreementTerms = agreement.finalAgreementTerms || agreement.agreementTerms;
        }

        await agreement.save();

        // If approved, generate PDF (assuming PDF generation is part of approval)
        if (status === 'approved') {
            const populatedAgreement = await Agreement.findById(agreementId)
                .populate('tenant', 'name email')
                .populate('landlord', 'name email')
                .populate('property', 'title address');

            const filePath = path.join(__dirname, '..', 'agreements', `${agreementId}.pdf`);
            await generateAgreementPDF(populatedAgreement, filePath);
        }

        res.json({ message: `Agreement status updated to ${status}`, agreement: updatedAgreement });
    } catch (err) {
        console.error('Status update failed:', err);
        res.status(500).json({ error: 'Status update failed' });
    }
};

// Landlord negotiates terms
exports.negotiateAgreement = async (req, res) => {
    try {
        const { id } = req.params;
        const { rentAmount, moveInDate, leaseTerm, endDate, agreementTerms, message } = req.body; // New terms from landlord

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid agreement ID format." });
        }

        const agreement = await Agreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ message: "Agreement not found." });
        }
        if (agreement.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to negotiate this agreement." });
        }

        // Only allow negotiation if status is pending or currently negotiating
        if (!['pending', 'negotiating'].includes(agreement.status)) {
            return res.status(400).json({ message: `Agreement status is ${agreement.status}. Only 'pending' or 'negotiating' agreements can be negotiated.` });
        }

        // Update the 'final' terms with the new negotiated values
        agreement.finalRentAmount = rentAmount;
        agreement.finalStartDate = moveInDate;
        agreement.finalEndDate = endDate;
        agreement.finalAgreementTerms = agreementTerms;
        agreement.requestMessage = message; // Update message if landlord sends one back
        agreement.status = 'negotiating'; // Set status to negotiating
        agreement.lastNegotiatedBy = req.user._id; // Track who last negotiated

        await agreement.save();

        res.status(200).json({ message: "Negotiation terms updated successfully!", agreement });

    } catch (error) {
        console.error("Error in negotiateAgreement:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: "Validation failed during negotiation", errors: errors });
        }
        res.status(500).json({ message: "Server error during negotiation." });
    }
};

// Get all pending requests for a landlord
exports.getRequestsForLandlord = async (req, res) => {
    try {
        const landlordId = req.user._id;

        const requests = await Agreement.find({ landlord: landlordId, status: { $in: ['pending', 'negotiating'] } }) // Include negotiating agreements
            .populate('tenant', 'name email profilePic') // Populate tenant info
            .populate('property', 'title propertyName address city state location imageUrl image') // Populate property info
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });

    } catch (error) {
        console.error("Error fetching agreement requests for landlord:", error);
        res.status(500).json({ message: "Server error fetching agreement requests.", error: error.message });
    }
};

// Get a single agreement by ID
exports.getAgreementById = async (req, res) => {
    try {
        const agreementId = req.params.id;
        if (!isValidObjectId(agreementId)) {
            return res.status(400).json({ message: "Invalid agreement ID format." });
        }

        const agreement = await Agreement.findById(agreementId)
            .populate('tenant', 'name email profilePic')
            .populate('landlord', 'name email profilePic')
            .populate('property', 'title propertyName address city state location imageUrl image price'); // Populate all relevant fields

        if (!agreement) {
            return res.status(404).json({ message: "Agreement not found." });
        }

        // Ensure only authorized users can view the agreement
        if (agreement.tenant.toString() !== req.user._id.toString() &&
            agreement.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to view this agreement." });
        }

        res.status(200).json({ agreement });

    } catch (error) {
        console.error("Error fetching agreement by ID:", error);
        res.status(500).json({ message: "Server error fetching agreement details.", error: error.message });
    }
};