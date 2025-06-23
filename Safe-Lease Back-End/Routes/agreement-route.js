const express = require('express');
const router = express.Router();
const Agreement = require('../models/Agreement-model');
const authMiddleware = require('../middleware/authMiddleware'); 
const roleMiddleware = require('../middleware/roleMiddleware'); 
const User = require('../models/User-model'); 
const Property = require('../models/Property-model'); 
const mongoose = require('mongoose'); 

const {
  createAgreement, 
  requestAgreement, 
  updateAgreementStatus,
  getRequestsForLandlord
} = require('../Controllers/agreement-Controller'); 

router.post('/request', authMiddleware, roleMiddleware('tenant'), async (req, res) => {
    try {
        const { property, landlord, tenant, requestedTerms, agreementTerms, requestMessage } = req.body;

        if (!property || !landlord || !tenant || 
            !requestedTerms || !requestedTerms.rent || !requestedTerms.moveInDate || 
            !requestedTerms.endDate || 
            !agreementTerms) {
            console.error("Validation Error: Missing basic required fields in agreement request body.");
            return res.status(400).json({ message: "Missing required fields for agreement request. (property, landlord, tenant, requestedTerms.rent, requestedTerms.moveInDate, requestedTerms.endDate, agreementTerms)" });
        }

        if (!mongoose.Types.ObjectId.isValid(property) || 
            !mongoose.Types.ObjectId.isValid(landlord) || 
            !mongoose.Types.ObjectId.isValid(tenant)) {
            console.error("Validation Error: Invalid ObjectId format for property, landlord, or tenant.");
            return res.status(400).json({ message: "Invalid ID format for property, landlord, or tenant." });
        }

        const [existingProperty, existingLandlord, existingTenant] = await Promise.all([
            Property.findById(property),
            User.findById(landlord),
            User.findById(tenant)
        ]);

        if (!existingProperty) {
            console.error("Validation Error: Property not found with ID:", property);
            return res.status(400).json({ message: "Property not found." });
        }
        if (!existingLandlord || existingLandlord.role !== 'landlord') {
            console.error("Validation Error: Landlord not found or is not a landlord:", landlord);
            return res.status(400).json({ message: "Invalid landlord or landlord role." });
        }
        if (!existingTenant || existingTenant.role !== 'tenant') {
            console.error("Validation Error: Tenant not found or is not a tenant:", tenant);
            return res.status(400).json({ message: "Invalid tenant or tenant role." });
        }

        if (req.user.id !== tenant) { 
            console.error("Authorization Error: Authenticated user is not the tenant specified in the request body.");
            return res.status(403).json({ message: "Forbidden: You can only create requests as the authenticated tenant." });
        }

        const newAgreement = new Agreement({
            property,
            landlord,
            tenant,
            status: 'pending', 
            rentAmount: requestedTerms.rent, 
            startDate: requestedTerms.moveInDate, 
            endDate: requestedTerms.endDate, 
            agreementTerms,
            requestMessage
        });

        await newAgreement.save();

        res.status(201).json({ message: "Agreement request sent successfully!", agreement: newAgreement });

    } catch (error) {
        console.error("Error in /agreements/request route:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            console.error("Mongoose Validation Errors:", errors);
            return res.status(400).json({ message: "Validation failed", errors: errors });
        }
        res.status(500).json({ message: "Server error creating agreement request." });
    }
});

router.put('/negotiate/:id', authMiddleware, roleMiddleware('landlord'), async (req, res) => {
    try {
        const { id } = req.params; 
        const { rentAmount, startDate, endDate, agreementTerms } = req.body; 

        if (!rentAmount || !startDate || !endDate || !agreementTerms) {
            console.error("Negotiation Error: Missing required negotiation fields in request body.");
            return res.status(400).json({ message: "Missing required negotiation terms (rentAmount, startDate, endDate, agreementTerms)." });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error("Negotiation Error: Invalid agreement ID format.");
            return res.status(400).json({ message: "Invalid agreement ID format." });
        }

        const agreement = await Agreement.findById(id);

        if (!agreement) {
            console.error("Negotiation Error: Agreement not found with ID:", id);
            return res.status(404).json({ message: "Agreement not found." });
        }

        if (agreement.landlord.toString() !== req.user.id) { 
            console.error("Authorization Error: Authenticated user is not the landlord for this agreement.");
            return res.status(403).json({ message: "Forbidden: You are not authorized to negotiate this agreement." });
        }

        if (agreement.status !== 'pending' && agreement.status !== 'negotiating') {
            console.error("Negotiation Error: Agreement is not in a negotiable status.", { status: agreement.status });
            return res.status(400).json({ message: `Agreement status is ${agreement.status}. Only 'pending' or 'negotiating' agreements can be negotiated.` });
        }

        agreement.rentAmount = rentAmount;
        agreement.startDate = startDate;
        agreement.endDate = endDate;
        agreement.agreementTerms = agreementTerms;
        agreement.status = 'negotiating'; 

        await agreement.save();

        res.status(200).json({ message: "Negotiation terms updated successfully!", agreement });

    } catch (error) {
        console.error("Error in /agreements/negotiate route:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            console.error("Mongoose Validation Errors (Negotiate):", errors);
            return res.status(400).json({ message: "Validation failed during negotiation", errors: errors });
        }
        res.status(500).json({ message: "Server error during negotiation." });
    }
});


router.get('/requests', authMiddleware, roleMiddleware('landlord'), async (req, res) => {
    try {
        console.log(`Attempting to fetch requests for landlord ID: ${req.user.id}`);

        const requests = await Agreement.find({ landlord: req.user.id })
                                      .populate('tenant', 'name username')
                                      .populate('property', 'title propertyName address city state location imageUrl image') // Populate all relevant property fields
                                      .sort({ createdAt: -1 }); 

        console.log(`Found ${requests.length} agreement requests for landlord ${req.user.id}.`);
        console.log("Full populated requests (backend):", requests); 

        res.status(200).json({ requests });

    } catch (error) {
        console.error("Error fetching agreement requests for landlord:", error);
        res.status(500).json({ message: "Server error fetching agreement requests.", error: error.message });
    }
});

router.put('/respond/:id', authMiddleware, roleMiddleware('landlord'), updateAgreementStatus);

module.exports = router;