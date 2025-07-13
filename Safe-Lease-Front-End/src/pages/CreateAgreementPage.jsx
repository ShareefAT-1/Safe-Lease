import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosbase from '../config/axios-config';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const CreateAgreementPage = () => {
    const navigate = useNavigate();
    const { id: agreementId } = useParams();
    const { propertyId: paramPropertyId, landlordId: paramLandlordId } = useParams();
    const location = useLocation();

    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        property: '',
        landlord: '',
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
        if (authLoading) {
            return;
        }

        if (!isAuthenticated || !backendToken || !user?.id) {
            setFetchingDetails(false);
            if (!isLandlordAction) {
                toast.error("You must be logged in to access this page.");
                navigate('/login');
            }
            return;
        }

        if (!isLandlordAction && user.role !== 'tenant') {
            toast.error("Only tenants can initiate agreement requests.");
            navigate('/');
            return;
        }
        if (isLandlordAction && user.role !== 'landlord') {
            toast.error("Only landlords can finalize agreement requests.");
            navigate('/');
            return;
        }

        let currentPropertyId;
        let currentLandlordId;
        let initialFormData = { ...formData };

        if (isLandlordAction && location.state?.agreementData) {
            const { agreementData } = location.state;
            currentPropertyId = agreementData.property?._id || agreementData.property;
            currentLandlordId = agreementData.landlord?._id || agreementData.landlord;

            initialFormData = {
                property: currentPropertyId,
                landlord: currentLandlordId,
                startDate: agreementData.startDate ? new Date(agreementData.startDate).toISOString().split('T')[0] : '',
                rentAmount: agreementData.rentAmount,
                agreementTerms: agreementData.agreementTerms,
                message: agreementData.message,
                leaseTerm: agreementData.leaseTerm,
                deposit: agreementData.deposit,
            };
        } else {
            currentPropertyId = paramPropertyId;
            currentLandlordId = paramLandlordId;

            if (!currentPropertyId || !currentLandlordId) {
                toast.error("Property ID or Landlord ID is missing in the URL. Cannot create agreement request.");
                navigate('/properties');
                return;
            }
            initialFormData.property = currentPropertyId;
            initialFormData.landlord = currentLandlordId;
        }

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
            setFormData(initialFormData);
        }

        if (!currentPropertyId || !currentLandlordId) {
            setFetchingDetails(false);
            return;
        }

        const fetchDetails = async () => {
            setFetchingDetails(true);
            try {
                const propertyRes = await axiosbase.get(`/properties/${currentPropertyId}`, {
                    headers: { Authorization: `Bearer ${backendToken}` }
                });
                setPropertyDetails(propertyRes.data);

                const landlordRes = await axiosbase.get(`/auth/profile/${currentLandlordId}`, {
                    headers: { Authorization: `Bearer ${backendToken}` }
                });
                setLandlordDetails(landlordRes.data);

            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Failed to load property or landlord details.";
                toast.error(errorMessage);
                setPropertyDetails(null);
                setLandlordDetails(null);
            } finally {
                setFetchingDetails(false);
            }
        };

        fetchDetails();

    }, [
        paramPropertyId, paramLandlordId, navigate, authLoading, isAuthenticated,
        backendToken, user, location.state, agreementId
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

        let response;
        if (isLandlordAction && agreementId) {
            if (isApprovalAction) {
                const formDataWithSignature = new FormData();
                for (const key in payload) {
                    formDataWithSignature.append(key, payload[key]);
                }
                if (signature) {
                    formDataWithSignature.append('signature', signature);
                }
                // *** THE KEY FIX: Append the 'status' field for approval ***
                formDataWithSignature.append('status', 'approved');

                response = await axiosbase.put(`/agreements/respond/${agreementId}`, formDataWithSignature, {
                    headers: {
                        'Authorization': `Bearer ${backendToken}`,
                        'Content-Type': 'multipart/form-data'
                    },
                });
            } else if (isNegotiationAction) {
                response = await axiosbase.put(`/agreements/negotiate/${agreementId}`, payload, {
                    headers: { 'Authorization': `Bearer ${backendToken}` }
                });
            } else {
                throw new Error("Invalid landlord action (approval/negotiation status missing).");
            }
        } else {
            if (user.role !== 'tenant') {
                toast.error("Only tenants can initiate new agreement requests.");
                setSubmitting(false);
                return;
            }
            response = await axiosbase.post("/agreements/request", { ...payload, tenant: user.id }, {
                headers: { 'Authorization': `Bearer ${backendToken}` }
            });
        }

        toast.success(response.data.message || 'Agreement action successful!');
        navigate('/dashboard');
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to process agreement. Please try again.';
        toast.error(errorMessage);
    } finally {
        setSubmitting(false);
    }
};

    if (authLoading || fetchingDetails) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-lg text-gray-700">Loading details and authenticating...</p>
            </div>
        );
    }

    const isFormDisabled = (!propertyDetails || !landlordDetails || !isAuthenticated || !user?.id || (isLandlordAction && user.role !== 'landlord') || (!isLandlordAction && user.role !== 'tenant'));

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