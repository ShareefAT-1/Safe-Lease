const Agreement = require('../models/Agreement-model');
const User = require('../models/User-model');
const Property = require('../models/Property-model');
const generateAgreementPDF = require('../utils/generatePDF'); // Ensure this path is correct
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createAgreement = async (req, res) => {
    try {
        const {
            property,
            tenant,
            rentAmount,
            depositAmount,
            startDate,
            endDate,
            leaseTermMonths,
            agreementTerms,
        } = req.body;
        const landlordId = req.user._id;
        const signatureImage = req.file;

        if (!property || !tenant || !rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths || !agreementTerms || !signatureImage) {
            return res.status(400).json({ message: 'Missing required fields or signature image.' });
        }

        if (!isValidObjectId(property) || !isValidObjectId(tenant) || !isValidObjectId(landlordId)) {
            return res.status(400).json({ message: 'Invalid ID format for property, tenant, or landlord.' });
        }

        const [existingProperty, existingTenant] = await Promise.all([
            Property.findById(property),
            User.findById(tenant)
        ]);

        if (!existingProperty) return res.status(404).json({ message: 'Property not found.' });
        if (!existingTenant || existingTenant.role !== 'tenant') return res.status(400).json({ message: 'Invalid tenant or tenant role.' });

        const newAgreement = new Agreement({
            property,
            landlord: landlordId,
            tenant,
            status: 'approved', // Directly creating an approved agreement
            requestedTerms: { // Initial request details, same as final if directly approved
                rent: rentAmount,
                deposit: depositAmount,
                moveInDate: new Date(startDate),
                leaseTerm: leaseTermMonths,
                endDate: new Date(endDate),
            },
            finalRentAmount: rentAmount,
            finalDepositAmount: depositAmount,
            finalStartDate: new Date(startDate),
            finalLeaseTermMonths: leaseTermMonths,
            finalEndDate: new Date(endDate),
            agreementTerms,
            landlordSigned: true,
            signedDate: new Date(),
        });

        const agreementSaveResult = await newAgreement.save();

        // Generate PDF
        const agreementDataForPdf = {
            agreementId: agreementSaveResult._id.toString(),
            propertyDetails: existingProperty.toObject(),
            landlordDetails: req.user.toObject(), // Landlord is current authenticated user
            tenantDetails: existingTenant.toObject(),
            rentAmount: agreementSaveResult.finalRentAmount,
            depositAmount: agreementSaveResult.finalDepositAmount,
            startDate: agreementSaveResult.finalStartDate.toLocaleDateString('en-IN'),
            endDate: agreementSaveResult.finalEndDate.toLocaleDateString('en-IN'),
            leaseTermMonths: agreementSaveResult.finalLeaseTermMonths,
            agreementTerms: agreementSaveResult.agreementTerms,
            landlordSignaturePath: signatureImage.path,
            signedDate: agreementSaveResult.signedDate.toLocaleDateString('en-IN'),
        };

        const pdfFileName = `agreement-${agreementSaveResult._id}.pdf`;
        const pdfFilePath = path.join(__dirname, '../uploads/agreements', pdfFileName);

        await generateAgreementPDF(agreementDataForPdf, pdfFilePath);

        agreementSaveResult.pdfPath = `/uploads/agreements/${pdfFileName}`;
        await agreementSaveResult.save();

        res.status(201).json({
            message: 'Agreement created successfully!',
            agreement: agreementSaveResult,
            pdfPath: agreementSaveResult.pdfPath,
        });

    } catch (error) {
        console.error('Error creating agreement:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: 'Validation failed', errors: errors });
        }
        res.status(500).json({ message: 'Server error creating agreement.' });
    }
};

exports.requestAgreement = async (req, res) => {
    try {
        const { property, landlord, rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms, message } = req.body;
        const tenantId = req.user._id;

        const moveInDate = new Date(startDate);
        const termMonths = parseInt(leaseTermMonths, 10);
        const calculatedEndDate = new Date(endDate);

        if (!property || !landlord || !rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths || !agreementTerms) {
            return res.status(400).json({ message: "Missing required fields for agreement request." });
        }
        if (isNaN(rentAmount) || isNaN(depositAmount) || isNaN(termMonths)) {
            return res.status(400).json({ message: "Rent, deposit, and lease term must be numbers." });
        }
        if (moveInDate.toString() === 'Invalid Date' || calculatedEndDate.toString() === 'Invalid Date') {
            return res.status(400).json({ message: "Invalid start or end date provided." });
        }

        if (!isValidObjectId(property) || !isValidObjectId(landlord) || !isValidObjectId(tenantId)) {
            return res.status(400).json({ message: "Invalid ID format for property, landlord, or tenant." });
        }

        const [existingProperty, existingLandlord, existingTenant] = await Promise.all([
            Property.findById(property),
            User.findById(landlord),
            User.findById(tenantId)
        ]);

        if (!existingProperty) return res.status(400).json({ message: "Property not found." });
        if (!existingLandlord || existingLandlord.role !== 'landlord') return res.status(400).json({ message: "Invalid landlord or landlord role." });
        if (!existingTenant || existingTenant.role !== 'tenant') return res.status(400).json({ message: "Invalid tenant or tenant role." });
        if (tenantId.toString() !== existingTenant._id.toString()) {
            return res.status(403).json({ message: "Forbidden: Authenticated user is not the tenant specified." });
        }

        const newRequest = new Agreement({
            property: property,
            landlord: landlord,
            tenant: tenantId,
            status: 'pending',
            requestMessage: message,
            agreementTerms: agreementTerms,

            requestedTerms: {
                rent: rentAmount,
                deposit: depositAmount,
                moveInDate: moveInDate,
                leaseTerm: termMonths,
                endDate: calculatedEndDate,
            },
            finalRentAmount: rentAmount,
            finalDepositAmount: depositAmount,
            finalStartDate: moveInDate,
            finalLeaseTermMonths: termMonths,
            finalEndDate: calculatedEndDate,
        });

        await newRequest.save();

        res.status(201).json({ message: 'Lease request sent successfully!', agreement: newRequest });
    } catch (err) {
        console.error('Error in requestAgreement:', err);
        if (err.name === 'ValidationError') {
            const errors = Object.keys(err.errors).map(key => err.errors[key].message);
            return res.status(400).json({ message: "Validation failed", errors: errors });
        }
        res.status(500).json({ error: 'Server error: Could not request agreement.' });
    }
};

exports.updateAgreementStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const landlordId = req.user._id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID format.' });
        }
        if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const agreement = await Agreement.findById(id);

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found.' });
        }
        if (agreement.landlord.toString() !== landlordId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this agreement.' });
        }

        // Only allow status changes from 'pending' or 'negotiating'
        if (!['pending', 'negotiating'].includes(agreement.status)) {
            return res.status(400).json({ message: `Agreement cannot be updated from status '${agreement.status}'.` });
        }

        agreement.status = status;

        if (status === 'approved') {
            agreement.landlordSigned = true; // Landlord approves means landlord signed current terms
            agreement.signedDate = new Date(); // Set signed date upon approval
            // The final terms are already set by request or last negotiation, no need to re-copy
        }

        await agreement.save();

        res.status(200).json({ message: `Agreement status updated to ${status}.`, agreement });
    } catch (error) {
        console.error('Error updating agreement status:', error);
        res.status(500).json({ message: 'Server error updating agreement status.' });
    }
};

exports.negotiateAgreement = async (req, res) => {
    try {
        const { id } = req.params;
        const { rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms } = req.body;
        const landlordId = req.user._id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid agreement ID format." });
        }

        if (!rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths || !agreementTerms) {
            return res.status(400).json({ message: "Missing required negotiation terms (rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms)." });
        }

        const finalMoveInDate = new Date(startDate);
        const finalTermMonths = parseInt(leaseTermMonths, 10);
        const finalCalculatedEndDate = new Date(endDate);

        if (isNaN(rentAmount) || isNaN(depositAmount) || isNaN(finalTermMonths)) {
            return res.status(400).json({ message: "Negotiated rent, deposit, and lease term must be numbers." });
        }
        if (finalMoveInDate.toString() === 'Invalid Date' || finalCalculatedEndDate.toString() === 'Invalid Date') {
            return res.status(400).json({ message: "Invalid negotiated start or end date provided." });
        }

        const agreement = await Agreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ message: "Agreement not found." });
        }
        if (agreement.landlord.toString() !== landlordId.toString()) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to negotiate this agreement." });
        }

        if (!['pending', 'negotiating'].includes(agreement.status)) {
            return res.status(400).json({ message: `Agreement status is ${agreement.status}. Only 'pending' or 'negotiating' agreements can be negotiated.` });
        }

        agreement.finalRentAmount = rentAmount;
        agreement.finalDepositAmount = depositAmount;
        agreement.finalStartDate = finalMoveInDate;
        agreement.finalLeaseTermMonths = finalTermMonths;
        agreement.finalEndDate = finalCalculatedEndDate;
        agreement.agreementTerms = agreementTerms;
        agreement.status = 'negotiating';
        agreement.lastNegotiatedBy = landlordId;

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

exports.getRequestsForLandlord = async (req, res) => {
    try {
        const landlordId = req.user._id;

        const requests = await Agreement.find({
            landlord: landlordId,
            status: { $in: ['pending', 'negotiating', 'approved', 'rejected'] } // Include approved/rejected for historical view if needed
        })
        .populate('tenant', 'name email username profilePic')
        .populate('property', 'title propertyName address city state location imageUrl image')
        .sort({ createdAt: -1 });

        res.status(200).json({ requests });

    } catch (error) {
        console.error("Error fetching agreement requests for landlord:", error);
        res.status(500).json({ message: "Server error fetching agreement requests.", error: error.message });
    }
};

exports.getAgreementById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id; // Authenticated user
        const userRole = req.user.role; // Authenticated user role

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID format.' });
        }

        const agreement = await Agreement.findById(id)
            .populate('landlord', 'name email username')
            .populate('tenant', 'name email username')
            .populate('property', 'title address city state imageUrl');

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found.' });
        }

        // Authorization check: User must be either the landlord or the tenant of this agreement
        if (userRole === 'landlord' && agreement.landlord.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this agreement.' });
        }
        if (userRole === 'tenant' && agreement.tenant.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this agreement.' });
        }

        res.status(200).json({ agreement });
    } catch (error) {
        console.error('Error fetching agreement by ID:', error);
        res.status(500).json({ message: 'Server error fetching agreement.' });
    }
};

// --- REMOVED THE FOLLOWING BLOCK: ---
// module.exports = {
//     createAgreement,
//     requestAgreement,
//     updateAgreementStatus,
//     getRequestsForLandlord,
//     getAgreementById,
//     negotiateAgreement
// };
// --- BECAUSE FUNCTIONS ARE ALREADY EXPORTED VIA 'exports.functionName' ---