import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosbase from '../config/axios-config';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const CreateAgreementPage = () => {
    const navigate = useNavigate();
    const { id: agreementId } = useParams(); // For existing agreement (landlord flow)
    const { propertyId: paramPropertyId, landlordId: paramLandlordId } = useParams(); // For new tenant request flow (from URL)
    const location = useLocation(); // To access state passed via navigate

    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        property: paramPropertyId || '',
        landlord: paramLandlordId || '',
        startDate: '',
        rentAmount: '',
        agreementTerms: '',
        message: '',
        leaseTerm: 12,
        deposit: ''
    });
    const [signature, setSignature] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [propertyDetails, setPropertyDetails] = useState(null);
    const [landlordDetails, setLandlordDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(true);

    const isLandlordAction = !!agreementId;
    const isApprovalAction = location.state?.isApprovalAction;
    const isNegotiationAction = location.state?.isNegotiationAction;

    useEffect(() => {
        console.log("--- useEffect: Initializing fetch process ---");
        console.log("authLoading:", authLoading);
        console.log("isAuthenticated:", isAuthenticated);
        console.log("user:", user);
        console.log("agreementId (from params):", agreementId);
        console.log("paramPropertyId (from params):", paramPropertyId);
        console.log("paramLandlordId (from params):", paramLandlordId);
        console.log("location.state:", location.state);
        console.log("isLandlordAction:", isLandlordAction);
        console.log("isApprovalAction:", isApprovalAction);
        console.log("isNegotiationAction:", isNegotiationAction);


        if (authLoading) {
            console.log("authLoading is true, returning early from useEffect.");
            return;
        }

        // Step 1: Handle authentication and role-based redirects
        if (!isAuthenticated || !backendToken || !user?.id) {
            console.log("User not authenticated or missing token/ID.");
            setFetchingDetails(false);
            if (!isLandlordAction) { // Only redirect if it's not a landlord action
                toast.error("You must be logged in to access this page.");
                navigate('/login');
            }
            return;
        }

        if (!isLandlordAction && user.role !== 'tenant') {
            console.log("User is not a tenant for a new request.");
            toast.error("Only tenants can initiate agreement requests.");
            navigate('/');
            return;
        }
        if (isLandlordAction && user.role !== 'landlord') {
            console.log("User is not a landlord for an existing agreement action.");
            toast.error("Only landlords can finalize agreement requests.");
            navigate('/');
            return;
        }

        // Step 2: Determine actual IDs for fetching and pre-fill form data
        let currentPropertyId;
        let currentLandlordId;
        let initialFormData = { ...formData }; // Use a copy to update within this effect

        if (isLandlordAction && location.state?.agreementData) {
            console.log("Detected landlord action with agreementData in state.");
            // Landlord flow: IDs and data come from location.state
            const { agreementData } = location.state;
            console.log("agreementData from state:", agreementData); // Inspect this object directly

            // --- CRITICAL CHANGE HERE ---
            // Access the _id property of property and landlord if they are objects
            currentPropertyId = agreementData.property?._id || agreementData.property;
            currentLandlordId = agreementData.landlord?._id || agreementData.landlord;

            initialFormData = {
                property: currentPropertyId, // Use the extracted ID
                landlord: currentLandlordId, // Use the extracted ID
                startDate: agreementData.startDate,
                rentAmount: agreementData.rentAmount,
                agreementTerms: agreementData.agreementTerms,
                message: agreementData.message,
                leaseTerm: agreementData.leaseTerm,
                deposit: agreementData.deposit,
            };
            // --- END CRITICAL CHANGE ---

        } else {
            console.log("Detected tenant action or landlord action without agreementData in state (checking URL params).");
            // Tenant flow: IDs come from URL params
            currentPropertyId = paramPropertyId;
            currentLandlordId = paramLandlordId;

            // For tenant creation, if IDs are missing from URL, redirect
            if (!currentPropertyId || !currentLandlordId) {
                console.log("Missing propertyId or landlordId from URL params for tenant flow. Redirecting.");
                toast.error("Property ID or Landlord ID is missing in the URL. Cannot create agreement request.");
                navigate('/properties');
                return; // Early exit if IDs are genuinely missing
            }
        }

        // Update formData state only if it's different to prevent unnecessary re-renders
        if (
            initialFormData.property !== formData.property ||
            initialFormData.landlord !== formData.landlord ||
            initialFormData.startDate !== formData.startDate ||
            initialFormData.rentAmount !== formData.rentAmount ||
            initialFormData.agreementTerms !== formData.agreementTerms ||
            initialFormData.message !== formData.message ||
            initialFormData.leaseTerm !== formData.leaseTerm ||
            initialFormData.deposit !== formData.deposit
        ) {
            console.log("Updating formData state with initialFormData.");
            setFormData(initialFormData);
        } else {
            console.log("formData is already up-to-date.");
        }


        // Step 3: Fetch details only if valid IDs are available
        if (!currentPropertyId || !currentLandlordId) {
            console.log("currentPropertyId or currentLandlordId is missing after determination. Not fetching details.");
            setFetchingDetails(false);
            return;
        }
        console.log("Attempting to fetch details for Property ID:", currentPropertyId, "and Landlord ID:", currentLandlordId);

        const fetchDetails = async () => {
            setFetchingDetails(true);
            try {
                const propertyRes = await axiosbase.get(`/properties/${currentPropertyId}`, {
                    headers: { Authorization: `Bearer ${backendToken}` }
                });
                setPropertyDetails(propertyRes.data);
                console.log("Property details fetched:", propertyRes.data);

                const landlordRes = await axiosbase.get(`/auth/profile/${currentLandlordId}`, {
                    headers: { Authorization: `Bearer ${backendToken}` }
                });
                setLandlordDetails(landlordRes.data);
                console.log("Landlord details fetched:", landlordRes.data);

            } catch (error) {
                console.error("Error fetching details:", error);
                const errorMessage = error.response?.data?.message || error.message || "Failed to load property or landlord details.";
                toast.error(errorMessage);
                setPropertyDetails(null);
                setLandlordDetails(null);
            } finally {
                setFetchingDetails(false);
                console.log("Finished fetching details.");
            }
        };

        fetchDetails();

    }, [
        paramPropertyId, paramLandlordId, navigate, authLoading, isAuthenticated,
        backendToken, user, location.state, agreementId, isLandlordAction,
        formData.property, formData.landlord, formData.startDate, formData.rentAmount,
        formData.agreementTerms, formData.message, formData.leaseTerm, formData.deposit
    ]);


    const validateForm = () => {
        const errors = {};
        if (!formData.startDate) errors.startDate = "Move-in date is required.";
        if (!formData.rentAmount || parseFloat(formData.rentAmount) <= 0) errors.rentAmount = "Rent amount must be a positive number.";
        if (!formData.deposit || parseFloat(formData.deposit) < 0) errors.deposit = "Deposit must be a non-negative number.";
        if (!formData.leaseTerm || parseInt(formData.leaseTerm, 10) <= 0) errors.leaseTerm = "Lease term must be a positive number of months.";
        if (!formData.agreementTerms) errors.agreementTerms = "Agreement terms are required.";

        if (isApprovalAction && !signature) errors.signature = "Landlord signature is required for approval.";

        setFormErrors(errors);
        console.log("Form validation errors:", errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSignatureChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSignature(e.target.files[0]);
            if (formErrors.signature) {
                setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors.signature;
                    return newErrors;
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("--- handleSubmit called ---");

        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            setSubmitting(false);
            return;
        }

        setSubmitting(true);

        if (!isAuthenticated || !backendToken || !user?.id) {
            toast.error("Authentication required.");
            setSubmitting(false);
            return;
        }
        console.log("Authentication confirmed. Proceeding with submission.");


        try {
            const parsedStartDate = new Date(formData.startDate);
            const calculatedEndDate = new Date(parsedStartDate);
            calculatedEndDate.setMonth(parsedStartDate.getMonth() + parseInt(formData.leaseTerm, 10));
            if (calculatedEndDate.getDate() !== parsedStartDate.getDate()) {
                calculatedEndDate.setDate(0);
            }
            const isoEndDate = calculatedEndDate.toISOString();

            const payload = {
                property: formData.property,
                landlord: formData.landlord,
                rentAmount: parseFloat(formData.rentAmount),
                depositAmount: parseFloat(formData.deposit),
                startDate: parsedStartDate.toISOString(),
                endDate: isoEndDate,
                leaseTermMonths: parseInt(formData.leaseTerm, 10),
                agreementTerms: formData.agreementTerms,
                message: formData.message,
            };

            console.log("Payload prepared:", payload);

            let response;
            if (isLandlordAction && agreementId) {
                if (isApprovalAction) {
                    console.log("Attempting landlord APPROVE action.");
                    const formDataWithSignature = new FormData();
                    for (const key in payload) {
                        formDataWithSignature.append(key, payload[key]);
                    }
                    if (signature) {
                        formDataWithSignature.append('signature', signature);
                        console.log("Signature appended to FormData.");
                    } else {
                        console.warn("No signature file selected for approval.");
                    }

                    response = await axiosbase.put(`/agreements/${agreementId}/approve`, formDataWithSignature, {
                        headers: {
                            'Authorization': `Bearer ${backendToken}`,
                            'Content-Type': 'multipart/form-data'
                        },
                    });
                } else if (isNegotiationAction) {
                    console.log("Attempting landlord NEGOTIATE action.");
                    response = await axiosbase.put(`/agreements/${agreementId}/negotiate`, payload, {
                        headers: { 'Authorization': `Bearer ${backendToken}` }
                    });
                } else {
                    console.error("Invalid landlord action: approval/negotiation status missing in state.");
                    throw new Error("Invalid landlord action (approval/negotiation status missing).");
                }
            } else {
                console.log("Attempting tenant NEW AGREEMENT request.");
                if (user.role !== 'tenant') {
                    toast.error("Only tenants can initiate new agreement requests.");
                    setSubmitting(false);
                    return;
                }
                response = await axiosbase.post("/agreements/request", { ...payload, tenant: user.id }, {
                    headers: { 'Authorization': `Bearer ${backendToken}` }
                });
            }

            console.log("API response received:", response.data);
            toast.success(response.data.message || 'Agreement action successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error in agreement action:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process agreement. Please try again.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
            console.log("--- handleSubmit finished ---");
        }
    };

    if (authLoading || fetchingDetails) {
        console.log("Rendering loading state. authLoading:", authLoading, "fetchingDetails:", fetchingDetails);
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-lg text-gray-700">Loading details and authenticating...</p>
            </div>
        );
    }

    const isFormDisabled = (!propertyDetails || !landlordDetails || !isAuthenticated || !user?.id || (isLandlordAction && user.role !== 'landlord') || (!isLandlordAction && user.role !== 'tenant'));
    console.log("isFormDisabled:", isFormDisabled);


    let pageTitle = "Request Lease Agreement";
    let submitButtonText = "Send Agreement Request";
    if (isApprovalAction) {
        pageTitle = "Approve & Finalize Lease Agreement";
        submitButtonText = "Approve Agreement";
    } else if (isNegotiationAction) {
        pageTitle = "Negotiate Lease Agreement Terms";
        submitButtonText = "Submit Negotiated Terms";
    }

    return (
        <div className="container mx-auto p-4 my-8 font-sans">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
                {pageTitle}
            </h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-gray-200">
                {isFormDisabled && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">
                            {(!isAuthenticated || !user?.id) && "You are not logged in or your session has expired. "}
                            {(!isLandlordAction && user?.role === 'landlord') && "Only tenants can initiate agreement requests. "}
                            {(isLandlordAction && user?.role === 'tenant') && "Only landlords can finalize agreement requests. "}
                            {!propertyDetails && "Property details failed to load. "}
                            {!landlordDetails && "Landlord details failed to load."}
                        </span>
                    </div>
                )}

                {propertyDetails && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <h2 className="text-lg font-semibold text-blue-700">Property: {propertyDetails.title || propertyDetails.propertyName || 'N/A'}</h2>
                        <p className="text-sm text-gray-600">Address: {propertyDetails.address?.street}, {propertyDetails.address?.city}</p>
                        <p className="text-sm text-gray-600">Listed Rent: ₹{propertyDetails.rent?.toLocaleString() || 'N/A'}</p>
                    </div>
                )}
                {landlordDetails && (
                    <div className="mb-6 p-3 bg-green-50 rounded-md border border-green-200">
                        <h2 className="text-lg font-semibold text-green-700">Landlord: {landlordDetails.name || 'N/A'}</h2>
                        <p className="text-sm text-gray-600">Contact Email: {landlordDetails.email || 'N/A'}</p>
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Proposed Move-in Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.startDate && <p className="text-red-500 text-xs italic mt-1">{formErrors.startDate}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="rentAmount" className="block text-gray-700 text-sm font-bold mb-2">Proposed Monthly Rent (₹):</label>
                    <input
                        type="number"
                        id="rentAmount"
                        name="rentAmount"
                        value={formData.rentAmount}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.rentAmount ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.rentAmount && <p className="text-red-500 text-xs italic mt-1">{formErrors.rentAmount}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="deposit" className="block text-gray-700 text-sm font-bold mb-2">Proposed Security Deposit (₹):</label>
                    <input
                        type="number"
                        id="deposit"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.deposit ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.deposit && <p className="text-red-500 text-xs italic mt-1">{formErrors.deposit}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="leaseTerm" className="block text-gray-700 text-sm font-bold mb-2">Proposed Lease Term (Months):</label>
                    <input
                        type="number"
                        id="leaseTerm"
                        name="leaseTerm"
                        value={formData.leaseTerm}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.leaseTerm ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        min="1"
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.leaseTerm && <p className="text-red-500 text-xs italic mt-1">{formErrors.leaseTerm}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="agreementTerms" className="block text-gray-700 text-sm font-bold mb-2">Proposed Agreement Terms (Details):</label>
                    <textarea
                        id="agreementTerms"
                        name="agreementTerms"
                        value={formData.agreementTerms}
                        onChange={handleChange}
                        rows="6"
                        placeholder="E.g., Pet policy, maintenance responsibilities, penalties for late rent, utilities, etc."
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.agreementTerms ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    ></textarea>
                    {formErrors.agreementTerms && <p className="text-red-500 text-xs italic mt-1">{formErrors.agreementTerms}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message to {isLandlordAction ? 'Tenant' : 'Landlord'} (Optional):</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="3"
                        placeholder={isLandlordAction ? "E.g., 'These are my counter-terms, let me know if they work for you!'" : "E.g., 'Looking forward to hearing from you! I'm available for a call next week.'"}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                        disabled={isFormDisabled || submitting}
                    ></textarea>
                </div>

                {isApprovalAction && (
                    <div className="mb-6">
                        <label htmlFor="signature" className="block text-gray-700 text-sm font-bold mb-2">
                            Landlord Signature (Upload Image):
                        </label>
                        <input
                            type="file"
                            id="signature"
                            name="signature"
                            accept="image/*"
                            onChange={handleSignatureChange}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.signature ? 'border-red-500' : 'border-gray-300'}`}
                            required={isApprovalAction}
                            disabled={isFormDisabled || submitting}
                        />
                        {formErrors.signature && <p className="text-red-500 text-xs italic mt-1">{formErrors.signature}</p>}
                        <p className="text-gray-500 text-xs mt-1">Upload a clear image of your signature.</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || isFormDisabled}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Processing Request...' : submitButtonText}
                </button>
            </form>
        </div>
    );
};

export default CreateAgreementPage;