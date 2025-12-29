
const Agreement = require('../models/Agreement-model');
const User = require('../models/User-model');
const Property = require('../models/Property-model');
const generateAgreementPDF = require('../utils/generatePDF');
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
            status: 'approved',
            requestedTerms: {
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
            landlordSignaturePath: signatureImage.path,
        });
        const agreementSaveResult = await newAgreement.save();
        const agreementDataForPdf = {
            agreementId: agreementSaveResult._id.toString(),
            propertyDetails: existingProperty.toObject(),
            landlordDetails: req.user.toObject(),
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
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
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
        const { status, rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms, message } = req.body;
        const landlordId = req.user._id;
        const signatureImage = req.file;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID format.' });
        }
        if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        const agreement = await Agreement.findById(id)
            .populate('landlord', 'name email username')
            .populate('tenant', 'name email username')
            .populate('property');
        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found.' });
        }
        if (agreement.landlord._id.toString() !== landlordId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this agreement.' });
        }
        if (!['pending', 'negotiating'].includes(agreement.status)) {
            return res.status(400).json({ message: `Agreement cannot be updated from status '${agreement.status}'.` });
        }
        agreement.status = status;
        if (status === 'approved') {
            if (!rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths || !agreementTerms) {
                return res.status(400).json({ message: "Missing required agreement terms for approval." });
            }
            const parsedStartDate = new Date(startDate);
            const calculatedEndDate = new Date(parsedStartDate);
            calculatedEndDate.setMonth(parsedStartDate.getMonth() + parseInt(leaseTermMonths, 10));
            if (calculatedEndDate.getDate() !== parsedStartDate.getDate()) {
                calculatedEndDate.setDate(0);
            }
            agreement.finalRentAmount = parseFloat(rentAmount);
            agreement.finalDepositAmount = parseFloat(depositAmount);
            agreement.finalStartDate = parsedStartDate;
            agreement.finalLeaseTermMonths = parseInt(leaseTermMonths, 10);
            agreement.finalEndDate = calculatedEndDate;
            agreement.agreementTerms = agreementTerms;
            agreement.requestMessage = message;
            agreement.landlordSigned = true;
            agreement.signedDate = new Date();
            if (signatureImage) {
                agreement.landlordSignaturePath = `/uploads/signatures/${signatureImage.filename}`;
            } else {
                return res.status(400).json({ message: 'Signature image is required for approval.' });
            }
            try {
                const pdfData = {
                    agreementId: agreement._id.toString(),
                    propertyDetails: agreement.property.toObject(),
                    landlordDetails: agreement.landlord.toObject(),
                    tenantDetails: agreement.tenant.toObject(),
                    rentAmount: agreement.finalRentAmount,
                    depositAmount: agreement.finalDepositAmount,
                    startDate: agreement.finalStartDate.toLocaleDateString('en-IN'),
                    endDate: agreement.finalEndDate.toLocaleDateString('en-IN'),
                    leaseTermMonths: agreement.finalLeaseTermMonths,
                    agreementTerms: agreement.agreementTerms,
                    landlordSignaturePath: agreement.landlordSignaturePath,
                    signedDate: agreement.signedDate.toLocaleDateString('en-IN'),
                };
                const pdfRelativePath = await generateAgreementPDF(pdfData);
                agreement.pdfPath = pdfRelativePath;
                console.log(`PDF generated and path saved: ${pdfRelativePath}`);
            } catch (pdfError) {
                console.error('Error generating PDF during approval:', pdfError);
            }
        }
        await agreement.save();
        res.status(200).json({ message: `Agreement status updated to ${status}.`, agreement });
    } catch (error) {
        console.error('Error updating agreement status:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: "Validation failed", errors: errors });
        }
        res.status(500).json({ message: 'Server error updating agreement status.' });
    }
};

exports.negotiateAgreement = async (req, res) => {
     try {
        const { id } = req.params;
        const { rentAmount, depositAmount, startDate, endDate, leaseTermMonths, agreementTerms, message } = req.body;
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
        agreement.requestMessage = message;
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
            status: { $in: ['pending', 'negotiating', 'approved', 'rejected'] }
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

exports.getRequestsForTenant = async (req, res) => {
    try {
        const tenantId = req.user._id;
        const requests = await Agreement.find({
            tenant: tenantId,
            status: { $in: ['pending', 'negotiating', 'approved', 'rejected'] }
        })
        .populate('landlord', 'name email username profilePic')
        .populate('property', 'title propertyName address city state location imageUrl image')
        .sort({ createdAt: -1 });
        res.status(200).json({ requests });
    } catch (error) {
        console.error("Error fetching agreement requests for tenant:", error);
        res.status(500).json({ message: "Server error fetching tenant requests.", error: error.message });
    }
};

exports.getAgreementById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;
        console.log('--- Debugging Agreement Authorization ---');
        console.log('Requested Agreement ID:', id);
        console.log('Authenticated User ID (req.user._id):', userId);
        console.log('Authenticated User Role (req.user.role):', userRole);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid agreement ID format.' });
        }
        const agreement = await Agreement.findById(id)
            .populate('landlord', 'name email username')
            .populate('tenant', 'name email username')
            .populate('property', 'title address city state imageUrl');
        if (!agreement) {
            console.log('Agreement not found for ID:', id);
            return res.status(404).json({ message: 'Agreement not found.' });
        }
        console.log('Agreement Landlord ID:', agreement.landlord._id.toString());
        console.log('Agreement Tenant ID:', agreement.tenant._id.toString());
        if (userRole === 'landlord' && agreement.landlord._id.toString() !== userId.toString()) {
            console.log('Forbidden: Landlord mismatch.');
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this agreement.' });
        }
        if (userRole === 'tenant' && agreement.tenant._id.toString() !== userId.toString()) {
            console.log('Forbidden: Tenant mismatch.');
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this agreement.' });
        }
        console.log('Authorization successful for agreement:', id);
        res.status(200).json({ agreement });
    } catch (error) {
        console.error('Error fetching agreement by ID:', error);
        res.status(500).json({ message: 'Server error fetching agreement.' });
    }
};

exports.signAsTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user._id;
        const signatureImage = req.file;

        if (!signatureImage) {
            return res.status(400).json({ message: 'Signature image is required.' });
        }

        const agreement = await Agreement.findById(id).populate('landlord').populate('tenant').populate('property');

        if (!agreement) return res.status(404).json({ message: 'Agreement not found.' });
        if (agreement.tenant._id.toString() !== tenantId.toString()) return res.status(403).json({ message: 'Forbidden: You are not authorized.' });
        if (agreement.status !== 'approved') return res.status(400).json({ message: `Agreement must be 'approved' to sign. Current status: '${agreement.status}'.` });

        agreement.tenantSigned = true;
        agreement.tenantSignaturePath = `/uploads/signatures/${signatureImage.filename}`;
        agreement.status = 'active';
        agreement.tenantSignedDate = new Date();

        const landlordSignatureFullPath = agreement.landlordSignaturePath ? path.join(__dirname, '..', agreement.landlordSignaturePath) : null;
        const tenantSignatureFullPath = agreement.tenantSignaturePath ? path.join(__dirname, '..', agreement.tenantSignaturePath) : null;

        const pdfData = {
            agreementId: agreement._id.toString(),
            propertyDetails: agreement.property.toObject(),
            landlordDetails: agreement.landlord.toObject(),
            tenantDetails: agreement.tenant.toObject(),
            rentAmount: agreement.finalRentAmount,
            depositAmount: agreement.finalDepositAmount,
            startDate: agreement.finalStartDate.toLocaleDateString('en-IN'),
            endDate: agreement.finalEndDate.toLocaleDateString('en-IN'),
            leaseTermMonths: agreement.finalLeaseTermMonths,
            agreementTerms: agreement.agreementTerms,
            landlordSignaturePath: landlordSignatureFullPath,
            tenantSignaturePath: tenantSignatureFullPath,
            signedDate: agreement.signedDate.toLocaleDateString('en-IN'),
            tenantSignedDate: agreement.tenantSignedDate.toLocaleDateString('en-IN'),
        };

        const pdfFileName = `agreement-signed-${agreement._id}.pdf`;
        const pdfFilePath = path.join(__dirname, '../uploads/agreements', pdfFileName);
        
        await generateAgreementPDF(pdfData, pdfFilePath);
        
        agreement.pdfPath = `/uploads/agreements/${pdfFileName}`;

        await agreement.save();

        res.status(200).json({
            message: 'Agreement signed successfully! The lease is now active.',
            agreement: agreement
        });

    } catch (error) {
        console.error('Error signing as tenant:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error while signing the agreement.' });
    }
};


